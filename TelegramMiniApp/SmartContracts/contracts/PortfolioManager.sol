// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/interfaces/IERC20.sol";

contract PortfolioManager {
    struct Portfolio {
        uint nativeToken;
        address stableCoin;
        uint stableCoinAmount;
    }

    mapping(address => Portfolio[]) private userPortfolio;

    function addPortfolio(Portfolio memory portfolio) external payable {
        // require(
        //     msg.value == portfolio.nativeToken,
        //     "Invalid native token amount"
        // );
        IERC20(portfolio.stableCoin).transferFrom(
            msg.sender,
            address(this),
            portfolio.stableCoinAmount
        );

        // userPortfolio[msg.sender].push(portfolio);
    }

    function getPortfolio() external view returns (Portfolio[] memory) {
        return userPortfolio[msg.sender];
    }

    function withdrawPortfolio() external {
        Portfolio[] memory portfolio = userPortfolio[msg.sender];
        for (uint i = 0; i < portfolio.length; i++) {
            IERC20(portfolio[i].stableCoin).transfer(
                msg.sender,
                portfolio[i].stableCoinAmount
            );
        }
        delete userPortfolio[msg.sender];
    }
}
