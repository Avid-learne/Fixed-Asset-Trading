// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Hospital Financial Smart Contract
/// @notice Controls AT minting, profit distribution, and HT redemption
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./AssetToken.sol";
import "./HealthToken.sol";

contract HospitalFinancials is AccessControl, ReentrancyGuard {
    bytes32 public constant BANK_ROLE = keccak256("BANK_ROLE");
    bytes32 public constant FINANCE_ROLE = keccak256("FINANCE_ROLE");

    AssetToken public assetToken;
    HealthToken public healthToken;
    address public hospitalWallet;

    mapping(uint256 => bool) public depositProcessed;
    mapping(uint256 => address) public depositOwner;
    mapping(uint256 => uint256) public depositAmountAT;

    struct Trade {
        uint256 investedAT;
        uint256 profitEarned;
        uint256 timestamp;
    }

    uint256 public nextTradeId = 1;
    mapping(uint256 => Trade) public trades;

    event AssetTokenMinted(
        address indexed patient,
        uint256 indexed depositId,
        uint256 amountAT,
        uint256 timestamp,
        string metadata
    );

    event TradeRecorded(
        uint256 indexed tradeId,
        uint256 investedAT,
        uint256 profitEarned,
        uint256 timestamp
    );

    event ProfitDistributed(
        uint256 indexed tradeId,
        uint256 totalProfit,
        uint256 distributedHT,
        uint256 timestamp
    );

    event HealthTokenRedeemed(
        address indexed patient,
        uint256 amountHT,
        string serviceType,
        uint256 timestamp
    );

    constructor(
        address _assetToken,
        address _healthToken,
        address admin,
        address _hospitalWallet
    ) {
        assetToken = AssetToken(_assetToken);
        healthToken = HealthToken(_healthToken);
        hospitalWallet = _hospitalWallet;

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(FINANCE_ROLE, admin);
    }

    function mintAssetToken(
        address patient,
        uint256 depositId,
        uint256 amountAT,
        string calldata metadata
    ) external onlyRole(BANK_ROLE) nonReentrant {
        require(!depositProcessed[depositId], "Already processed");
        require(amountAT > 0, "Zero AT amount");

        depositProcessed[depositId] = true;
        depositOwner[depositId] = patient;
        depositAmountAT[depositId] = amountAT;

        assetToken.mint(patient, amountAT);
        assetToken.setDepositMetadata(depositId, metadata);

        emit AssetTokenMinted(patient, depositId, amountAT, block.timestamp, metadata);
    }

    function recordTrade(uint256 investedAT, uint256 profit)
        external
        onlyRole(FINANCE_ROLE)
        returns (uint256)
    {
        require(investedAT > 0, "Invalid AT amount");

        uint256 tradeId = nextTradeId++;
        trades[tradeId] = Trade(investedAT, profit, block.timestamp);

        emit TradeRecorded(tradeId, investedAT, profit, block.timestamp);

        return tradeId;
    }

    function distributeProfit(
        uint256 tradeId,
        address[] calldata recipients,
        uint256[] calldata amountsHT
    ) external onlyRole(FINANCE_ROLE) nonReentrant {
        require(trades[tradeId].timestamp > 0, "Invalid trade");
        require(recipients.length == amountsHT.length, "Length mismatch");

        uint256 totalDistributed;

        for (uint i = 0; i < recipients.length; i++) {
            healthToken.mint(recipients[i], amountsHT[i]);
            totalDistributed += amountsHT[i];
        }

        emit ProfitDistributed(
            tradeId,
            trades[tradeId].profitEarned,
            totalDistributed,
            block.timestamp
        );
    }

    function redeemHealthToken(
        address patient,
        uint256 amountHT,
        string calldata serviceType
    ) external onlyRole(FINANCE_ROLE) {
        require(amountHT > 0, "Invalid");

        healthToken.burn(patient, amountHT);

        emit HealthTokenRedeemed(
            patient,
            amountHT,
            serviceType,
            block.timestamp
        );
    }
}
