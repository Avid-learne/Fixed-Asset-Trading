// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Health Token (HT) - Hospital Benefit Token
/// @notice Minted for patient healthcare benefits based on profits earned
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract HealthToken is ERC20, AccessControl {
    constructor(address admin) ERC20("Health Token", "HT") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function mint(address to, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _burn(from, amount);
    }
}
