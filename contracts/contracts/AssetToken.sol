// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Asset Token (AT) - Real Asset Tokenization
/// @notice Minted when a patient’s real asset is verified & deposited
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract AssetToken is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // DepositId to metadata (IPFS hash or reference)
    mapping(uint256 => string) public depositMetadata;

    event DepositMetadataSet(uint256 indexed depositId, string metadata);

    constructor(address admin) ERC20("Asset Token", "AT") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyRole(MINTER_ROLE) {
        _burn(from, amount);
    }

    function setDepositMetadata(uint256 depositId, string calldata metadata)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        depositMetadata[depositId] = metadata;
        emit DepositMetadataSet(depositId, metadata);
    }
}
