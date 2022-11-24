# Getting Started

## Requirements

- [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
  - You'll know you did it right if you can run `git --version` and you see a response like `git version x.x.x`
- [Nodejs](https://nodejs.org/en/)
  - You'll know you've installed nodejs right if you can run:
    - `node --version` and get an ouput like: `vx.x.x`
- [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/) instead of `npm`
  - You'll know you've installed yarn right if you can run:
    - `yarn --version` and get an output like: `x.x.x`
    - You might need to install it with `npm`

## Quickstart

```
git clone https://github.com/SaikrishnaReddy1919/arda-task.git
cd arda-task
yarn
```


# Run node

Run localhost node:

```
yarn hardhat node
```

# Deploy

Run localhost node:

```
yarn hardhat deploy --network localhost
```

## NOTE :
    - There is some issue am facing with the ArdaContract.sol. Everything looking fine but can't deploy it on localhost.
    - Without that file, I will be able to deploy all uniswaps contracts.
    - ArdaContract.sol is wraps around uniswaps v3 pool manager contract which can call collect and burn based on the Impermanent loss percentage.

