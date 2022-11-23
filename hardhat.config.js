require('@nomiclabs/hardhat-waffle')
require('hardhat-deploy')
require("@nomiclabs/hardhat-etherscan")
require("dotenv").config()
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      chainId: 31337,
      blockConfirmations: 1,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0, //i.e., -> await ethers.getContract("BasicNft") -> automatically connects to deployer
    },
    player: {
      default: 1,
    },
  },
  solidity: {
    version: '0.8.17',
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
        details: { yul: false },
      },
    },
  },
}
