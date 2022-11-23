const { Contract, ContractFactory, utils, BigNumber } = require('ethers')
const { network, waffle, ethers } = require('hardhat')
const { verify } = require('../utils/verify')

const WETH9 = require('../WETH9.json')
const bn = require('bignumber.js')

const artifacts = {
  UniswapV3Factory: require('@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json'),
  SwapRouter: require('@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json'),
  NFTDescriptor: require('@uniswap/v3-periphery/artifacts/contracts/libraries/NFTDescriptor.sol/NFTDescriptor.json'),
  NonfungibleTokenPositionDescriptor: require('@uniswap/v3-periphery/artifacts/contracts/NonfungibleTokenPositionDescriptor.sol/NonfungibleTokenPositionDescriptor.json'),
  NonfungiblePositionManager: require('@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'),
  WETH9,
}

const UniswapV3Pool = require('@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json')

const linkLibraries = ({ bytecode, linkReferences }, libraries) => {
  Object.keys(linkReferences).forEach((fileName) => {
    Object.keys(linkReferences[fileName]).forEach((contractName) => {
      if (!libraries.hasOwnProperty(contractName)) {
        throw new Error(`Missing link library name ${contractName}`)
      }
      const address = utils
        .getAddress(libraries[contractName])
        .toLowerCase()
        .slice(2)
      linkReferences[fileName][contractName].forEach(({ start, length }) => {
        const start2 = 2 + start * 2
        const length2 = length * 2
        bytecode = bytecode
          .slice(0, start2)
          .concat(address)
          .concat(bytecode.slice(start2 + length2, bytecode.length))
      })
    })
  })
  return bytecode
}

bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 })
function encodePriceSqrt(reserve1, reserve0) {
  return BigNumber.from(
    new bn(reserve1.toString())
      .div(reserve0.toString())
      .sqrt()
      .multipliedBy(new bn(2).pow(96))
      .integerValue(3)
      .toString(),
  )
}

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const [deployer, player] = await ethers.getSigners()

  const provider = waffle.provider

  WrappedEth = new ContractFactory(
    artifacts.WETH9.abi,
    artifacts.WETH9.bytecode,
    deployer,
  )
  wrappedEth = await WrappedEth.deploy()
  console.log('WETH : ', wrappedEth.address)

  TokenElon = await ethers.getContractFactory('TokenElon', deployer)
  tokenElon = await TokenElon.deploy()
  console.log('TokenElon : ', tokenElon.address)

  Factory = new ContractFactory(
    artifacts.UniswapV3Factory.abi,
    artifacts.UniswapV3Factory.bytecode,
    deployer,
  )
  factory = await Factory.deploy()
  console.log('Factory : ', factory.address)

  SwapRouter = new ContractFactory(
    artifacts.SwapRouter.abi,
    artifacts.SwapRouter.bytecode,
    deployer,
  )
  swapRouter = await SwapRouter.deploy(factory.address, wrappedEth.address)
  console.log('SwapRouter : ', swapRouter.address)

  NFTDescriptor = new ContractFactory(
    artifacts.NFTDescriptor.abi,
    artifacts.NFTDescriptor.bytecode,
    deployer,
  )
  nftDescriptor = await NFTDescriptor.deploy()
  console.log('NFTDescriptor : ', nftDescriptor.address)

  const linkedBytecode = linkLibraries(
    {
      bytecode: artifacts.NonfungibleTokenPositionDescriptor.bytecode,
      linkReferences: {
        'NFTDescriptor.sol': {
          NFTDescriptor: [
            {
              length: 20,
              start: 1261,
            },
          ],
        },
      },
    },
    {
      NFTDescriptor: nftDescriptor.address,
    },
  )

  NonfungibleTokenPositionDescriptor = new ContractFactory(
    artifacts.NonfungibleTokenPositionDescriptor.abi,
    linkedBytecode,
    deployer,
  )
  nonfungibleTokenPositionDescriptor = await NonfungibleTokenPositionDescriptor.deploy(
    wrappedEth.address,
  )
  console.log(
    'NonfungibleTokenPositionDescriptor : ',
    nonfungibleTokenPositionDescriptor.address,
  )

  NonfungiblePositionManager = new ContractFactory(
    artifacts.NonfungiblePositionManager.abi,
    linkedBytecode,
    deployer,
  )
  nonfungiblePositionManager = await NonfungiblePositionManager.deploy(
    factory.address,
    wrappedEth.address,
    nonfungibleTokenPositionDescriptor.address,
  )
  console.log(
    'NonfungiblePositionManager : ',
    nonfungibleTokenPositionDescriptor.address,
  )

  const sqrtPrice = encodePriceSqrt(1, 1)

  await nonfungiblePositionManager
    .connect(deployer)
    .createAndInitializePoolIfNecessary(
      wrappedEth.address,
      tokenElon.address,
      500,
      sqrtPrice,
      { gasLimit: 5000000 },
    )

  const poolAddress = await factory
    .connect(owner)
    .getPool(wrappedEth.address, tokenElon.address, 500)

  //below line failes sometimes, way to fix is run until it works
  const pool = new Contract(poolAddress, UniswapV3Pool.abi, provider)

  log('-----------------------')
  log(`Fee :`, await pool.fee())
  log('slot0', await pool.slot0())
  log('liquidity', await pool.liquidity())
  log('-----------------------')
}

module.exports.tags = ['all', 'tokenelon']
