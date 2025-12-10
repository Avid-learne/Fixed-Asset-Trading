// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Asset Token (AT) - Real Asset Tokenization
/// @notice Minted when a patient’s real asset is verified & deposited
import "@openzeppelin/contracts/token/ERC20/ERC20.sol"; //fungible tokens
import "@openzeppelin/contracts/access/AccessControl.sol";

/// inherits all ERC-20 & AccessControl(roles) features
contract AssetToken is ERC20, AccessControl {

    // Creates a key-value storage. store deposit metadata
    mapping(uint256 => string) public depositMetadata;

    //event -> gets logged on blockchain. frontend apps can listen for it.
    event DepositMetadataSet(uint256 indexed depositId, string metadata);

    //takes admin address as input, passes Asset Token and AT to ERC 20 constructor.
    constructor(address admin) ERC20("Asset Token", "AT") {//token name and symbol
        //calls access control function to grant role of ADMIN
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    // external-> can be called from outside the contract
    function mint(address to, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {//only addresses with admin role
        _mint(to, amount);
    }

    //function to destroy tokens. only admin role
    function burn(address from, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _burn(from, amount); //removes 'amount' tokens from 'from' address
    }

    //Function to link deposit ID with metadata (like an IPFS hash -> decentralized file storage link).
    function setDepositMetadata(uint256 depositId, string calldata metadata)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        depositMetadata[depositId] = metadata;
        emit DepositMetadataSet(depositId, metadata); // announcing the metadata has been saved for the deposit id 
    }
}
