// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol';

contract ArdaContract is Ownable {
    address public s_poolManager;
    address private immutable i_owner;

    struct CollectParams {
        uint256 tokenId;
        address recipient;
        uint128 amount0Max;
        uint128 amount1Max;
    }
    constructor(address poolManagerAddress) {
        i_owner = msg.sender;
        s_poolManager = INonfungiblePositionManager(poolManagerAddress);
    }

    modifier onlyOwner() {
        require(msg.sender == i_owner, "Only owner is allowed to call this.");
        // if(msg.sender != owner) revert FundMe__NotOwner();
        _;
    }


    /// @notice Collects up to a maximum amount of fees owed to a specific position to the recipient
    /// @param params tokenId The ID of the NFT for which tokens are being collected,
    /// recipient The account that should receive the tokens,
    /// amount0Max The maximum amount of token0 to collect,
    /// amount1Max The maximum amount of token1 to collect
    /// @return amount0 The amount of fees collected in token0
    /// @return amount1 The amount of fees collected in token1
    function collectFees() public onlyOwner {
        CollectParams params = CollectParams(tokenId,
            recipient,
            amount0Max,
            amount1Max)
        (uint256 amount0, uint256 amount1) = s_poolManager.collect(
            params
        );
    }

    /// @notice Burns a token ID, which deletes it from the NFT contract. The token must have 0 liquidity and all tokens
    /// must be collected first.
    /// @param tokenId The ID of the token that is being burned
    function burn(uint256 tokenId) public onlyOwner {
        //add conditions and requirement if any...
        s_poolManager.burn();
    }

    function setPoolManager(address _poolManager) public onlyOwner {
        s_poolManager = _poolManager;
    }
}