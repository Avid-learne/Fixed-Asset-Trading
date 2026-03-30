package com.SehatVault.SehatVaultBackend.blockchain.service;

import com.SehatVault.SehatVaultBackend.blockchain.dto.BlockchainMintRequest;
import com.SehatVault.SehatVaultBackend.blockchain.dto.BlockchainMintResponse;
import com.SehatVault.SehatVaultBackend.blockchain.dto.BlockchainTradeRequest;
import com.SehatVault.SehatVaultBackend.blockchain.dto.BlockchainTradeResponse;
import com.SehatVault.SehatVaultBackend.blockchain.exception.BlockchainOperationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.response.EthSendTransaction;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.tx.TransactionManager;

import java.math.BigInteger;
import java.util.Arrays;
import java.util.concurrent.CompletableFuture;

/**
 * BlockchainService handles all interactions with smart contracts:
 * - AssetToken (AT) minting for asset deposits
 * - HealthToken (HT) minting for profit distributions
 * - Trade recording on HospitalFinancials contract
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BlockchainService {

    private final Web3j web3j;
    private final TransactionManager transactionManager;

    @Value("${blockchain.contract.asset-token-address:}")
    private String assetTokenAddress;

    @Value("${blockchain.contract.health-token-address:}")
    private String healthTokenAddress;

    @Value("${blockchain.contract.hospital-financials-address:}")
    private String hospitalFinancialsAddress;

    @Value("${blockchain.wallet.address:}")
    private String hospitalWalletAddress;

    @Value("${blockchain.transaction.gas-price:20000000000}")
    private Long gasPrice;

    @Value("${blockchain.transaction.gas-limit:300000}")
    private Long gasLimit;

    @Value("${blockchain.mock-mode:false}")
    private boolean mockMode;

    /**
     * Mint Asset Tokens (AT) when a patient deposits a real asset
     * Called by AssetDepositService after asset approval
     */
    public BlockchainMintResponse mintAssetToken(BlockchainMintRequest request) {
        try {
            validateContractAddress(assetTokenAddress, "AssetToken");

            log.info("Minting {} AT tokens for patient: {}, deposit: {}",
                    request.getAmount(), request.getPatientAddress(), request.getDepositId());

            if (mockMode) {
                log.info("Mock mode enabled - generating mock transaction hash");
                String mockHash = "0x" + String.format("%064x", System.currentTimeMillis());
                return BlockchainMintResponse.builder()
                        .transactionHash(mockHash)
                        .contractAddress(assetTokenAddress)
                        .tokenType("AT")
                        .amount(request.getAmount())
                        .patientAddress(request.getPatientAddress())
                        .depositId(request.getDepositId())
                        .status("PENDING_MOCK")
                        .build();
            }

            // Build transaction to call mint function on AssetToken contract
            String encodedFunction = encodeMintFunction(request.getPatientAddress(), request.getAmount());

            // Send transaction
            String transactionHash = sendTransaction(assetTokenAddress, encodedFunction);

            log.info("AT mint transaction submitted: {}", transactionHash);

            return BlockchainMintResponse.builder()
                    .transactionHash(transactionHash)
                    .contractAddress(assetTokenAddress)
                    .tokenType("AT")
                    .amount(request.getAmount())
                    .patientAddress(request.getPatientAddress())
                    .depositId(request.getDepositId())
                    .status("PENDING")
                    .build();

        } catch (Exception e) {
            log.error("Error minting AT tokens: {}", e.getMessage(), e);
            throw new BlockchainOperationException("Failed to mint AT tokens", e);
        }
    }

    /**
     * Mint Health Tokens (HT) when profits are distributed to patients
     * Called by ProfitDistributionService
     */
    public BlockchainMintResponse mintHealthToken(String patientAddress, BigInteger amount, String tradeId) {
        try {
            validateContractAddress(healthTokenAddress, "HealthToken");

            log.info("Minting {} HT tokens for patient: {}, trade: {}",
                    amount, patientAddress, tradeId);

            // Build transaction to call mint function on HealthToken contract
            String encodedFunction = encodeMintFunction(patientAddress, amount);

            // Send transaction
            String transactionHash = sendTransaction(healthTokenAddress, encodedFunction);

            log.info("HT mint transaction submitted: {}", transactionHash);

            return BlockchainMintResponse.builder()
                    .transactionHash(transactionHash)
                    .contractAddress(healthTokenAddress)
                    .tokenType("HT")
                    .amount(amount)
                    .patientAddress(patientAddress)
                    .status("PENDING")
                    .build();

        } catch (Exception e) {
            log.error("Error minting HT tokens: {}", e.getMessage(), e);
            throw new BlockchainOperationException("Failed to mint HT tokens", e);
        }
    }

    /**
     * Record a trade on the HospitalFinancials contract
     * Logs trade amount and profit for blockchain transparency
     */
    public BlockchainTradeResponse recordTrade(BlockchainTradeRequest request) {
        try {
            validateContractAddress(hospitalFinancialsAddress, "HospitalFinancials");

            log.info("Recording trade on blockchain: invested={}, profit={}",
                    request.getInvestedAT(), request.getProfitEarned());

            // Build transaction to call recordTrade function
            String encodedFunction = encodeRecordTradeFunction(
                    request.getInvestedAT(),
                    request.getProfitEarned());

            // Send transaction
            String transactionHash = sendTransaction(hospitalFinancialsAddress, encodedFunction);

            log.info("Trade recording transaction submitted: {}", transactionHash);

            return BlockchainTradeResponse.builder()
                    .transactionHash(transactionHash)
                    .contractAddress(hospitalFinancialsAddress)
                    .investedAT(request.getInvestedAT())
                    .profitEarned(request.getProfitEarned())
                    .status("PENDING")
                    .timestamp(System.currentTimeMillis())
                    .build();

        } catch (Exception e) {
            log.error("Error recording trade: {}", e.getMessage(), e);
            throw new BlockchainOperationException("Failed to record trade", e);
        }
    }

    /**
     * Set deposit metadata on blockchain (IPFS hash or other references)
     */
    public String setDepositMetadata(BigInteger depositId, String metadata) {
        try {
            validateContractAddress(assetTokenAddress, "AssetToken");

            log.info("Setting metadata for deposit: {}", depositId);

            // Build function call for setDepositMetadata
            org.web3j.abi.datatypes.Function function = new Function(
                    "setDepositMetadata",
                    Arrays.asList(new Uint256(depositId), new Utf8String(metadata)),
                    Arrays.asList());

            String encodedFunction = FunctionEncoder.encode(function);
            String transactionHash = sendTransaction(assetTokenAddress, encodedFunction);

            log.info("Metadata transaction submitted: {}", transactionHash);
            return transactionHash;

        } catch (Exception e) {
            log.error("Error setting metadata: {}", e.getMessage(), e);
            throw new BlockchainOperationException("Failed to set metadata", e);
        }
    }

    /**
     * Get current block number from blockchain
     * Used for confirming transactions
     */
    public long getCurrentBlockNumber() {
        try {
            return web3j.ethBlockNumber().send().getBlockNumber().longValue();
        } catch (Exception e) {
            log.error("Error getting block number: {}", e.getMessage());
            return -1;
        }
    }

    /**
     * Check transaction confirmations
     * Returns number of blocks since transaction was mined
     */
    public long getTransactionConfirmations(String transactionHash) {
        try {
            var receiptResponse = web3j.ethGetTransactionReceipt(transactionHash).send();

            if (receiptResponse.getTransactionReceipt().isEmpty()) {
                return 0;
            }

            TransactionReceipt transactionReceipt = receiptResponse.getTransactionReceipt().get();
            if (!"0x1".equalsIgnoreCase(transactionReceipt.getStatus())) {
                return 0;
            }

            long txBlockNumber = transactionReceipt.getBlockNumber().longValue();
            long currentBlockNumber = getCurrentBlockNumber();

            return currentBlockNumber - txBlockNumber;

        } catch (Exception e) {
            log.error("Error checking confirmations for tx {}: {}", transactionHash, e.getMessage());
            return -1;
        }
    }

    /**
     * Async method to wait for transaction confirmation
     * Polls blockchain until transaction is confirmed
     */
    @Async
    public CompletableFuture<TransactionReceipt> waitForTransactionConfirmation(
            String transactionHash, int maxPolls) {

        return CompletableFuture.supplyAsync(() -> {
            int polls = 0;
            while (polls < maxPolls) {
                try {
                    Thread.sleep(2000); // Wait 2 seconds between polls
                    var receipt = web3j.ethGetTransactionReceipt(transactionHash).send();

                    if (receipt.getTransactionReceipt().isPresent()) {
                        TransactionReceipt txReceipt = receipt.getTransactionReceipt().get();
                        log.info("Transaction {} confirmed at block {}",
                                transactionHash, txReceipt.getBlockNumber());
                        return txReceipt;
                    }
                    polls++;

                } catch (Exception e) {
                    log.warn("Error polling transaction {}: {}", transactionHash, e.getMessage());
                }
            }

            throw new BlockchainOperationException(
                    "Transaction " + transactionHash + " not confirmed after " + maxPolls + " polls");
        });
    }

    /**
     * =================== PRIVATE HELPER METHODS ===================
     */

    /**
     * Encode mint function call with address and amount parameters
     */
    private String encodeMintFunction(String toAddress, BigInteger amount) {
        org.web3j.abi.datatypes.Function function = new Function(
                "mint",
                Arrays.asList(
                        new Address(toAddress),
                        new Uint256(amount)),
                Arrays.asList());
        return FunctionEncoder.encode(function);
    }

    /**
     * Encode recordTrade function call
     */
    private String encodeRecordTradeFunction(BigInteger investedAT, BigInteger profitEarned) {
        org.web3j.abi.datatypes.Function function = new Function(
                "recordTrade",
                Arrays.asList(
                        new Uint256(investedAT),
                        new Uint256(profitEarned)),
                Arrays.asList());
        return FunctionEncoder.encode(function);
    }

    /**
     * Send encoded transaction to blockchain
     */
    private String sendTransaction(String toAddress, String encodedFunction) throws Exception {
        if (mockMode) {
            log.info("Mock mode enabled - returning mock transaction hash for contract: {}", toAddress);
            return "0x" + String.format("%064x", System.currentTimeMillis());
        }

        // Get current nonce
        String fromAddress = hospitalWalletAddress;
        BigInteger nonce = web3j.ethGetTransactionCount(fromAddress, DefaultBlockParameterName.PENDING)
                .send()
                .getTransactionCount();

        // Build raw transaction
        org.web3j.protocol.core.methods.request.Transaction transaction = org.web3j.protocol.core.methods.request.Transaction
                .createFunctionCallTransaction(
                        fromAddress,
                        nonce,
                        BigInteger.valueOf(gasPrice),
                        BigInteger.valueOf(gasLimit),
                        toAddress,
                        encodedFunction);

        // Send transaction
        EthSendTransaction response = web3j.ethSendTransaction(transaction).send();

        if (response.hasError()) {
            throw new BlockchainOperationException("Transaction error: " + response.getError().getMessage());
        }

        return response.getTransactionHash();
    }

    /**
     * Validate contract address is configured
     */
    private void validateContractAddress(String address, String contractName) {
        if (address == null || address.isEmpty()) {
            throw new BlockchainOperationException(
                    contractName + " address not configured in application.properties");
        }
    }
}
