// SPDX-License-Identifier:  MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MSCToken is ERC20 {
    constructor() public ERC20("Marvel super coin", "MSC") {
        _mint(msg.sender, 1000000 * (10**18));
    }
}
