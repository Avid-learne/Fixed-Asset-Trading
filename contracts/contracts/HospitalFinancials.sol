// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Hospital Financial Smart Contract
/// @notice Controls AT minting, profit distribution, and HT redemption
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";// locking functions
import "./AssetToken.sol";
import "./HealthToken.sol";

contract HospitalFinancials is AccessControl, ReentrancyGuard {
    AssetToken public assetToken;
    HealthToken public healthToken;
    address public hospitalWallet;

    mapping(uint256 => bool) public depositProcessed; //successful/not successful
    mapping(uint256 => address) public depositOwner; //depositId -> owneraddress
    mapping(uint256 => uint256) public depositAmountAT; //DepositId -> depositAmountAT

    struct Trade {
        uint256 investedAT;
        uint256 profitEarned;
        uint256 timestamp;
    }

    uint256 public nextTradeId = 1; //counter for tradeId
    mapping(uint256 => Trade) public trades; //tradeId -> investedAT, profitEarned, timestamp

    event AssetTokenMinted(
        address indexed patient, // indexed helps in searching logs
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
        address _assetToken, //the one we saw on terminal
        address _healthToken, //the one we saw on terminal
        address admin, // wallet address
        address _hospitalWallet //wallet address
    ) {
        assetToken = AssetToken(_assetToken); //sends to assetToken
        healthToken = HealthToken(_healthToken); //sends to healthToken
        hospitalWallet = _hospitalWallet; //saves in this contract

        _grantRole(DEFAULT_ADMIN_ROLE, admin); //gives admin address the DEFAULT_ADMIN_ROLE
    }

    function mintAssetToken(
        address patient, //wallet address of patient
        uint256 depositId,
        uint256 amountAT,
        string calldata metadata
    ) external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
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
        onlyRole(DEFAULT_ADMIN_ROLE)
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
    ) external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
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
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
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
