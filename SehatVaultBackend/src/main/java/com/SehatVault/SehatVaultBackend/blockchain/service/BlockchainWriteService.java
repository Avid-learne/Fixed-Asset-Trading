package com.SehatVault.SehatVaultBackend.blockchain.service;

import com.SehatVault.SehatVaultBackend.blockchain.config.BlockchainProperties;
import com.SehatVault.SehatVaultBackend.blockchain.model.BlockchainTxRef;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Type;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.methods.response.EthSendTransaction;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.tx.RawTransactionManager;
import org.web3j.tx.TransactionManager;
import org.web3j.tx.response.PollingTransactionReceiptProcessor;
import org.web3j.tx.response.TransactionReceiptProcessor;

import java.io.IOException;
import java.math.BigInteger;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BlockchainWriteService {

    private final Web3j web3j;
    private final BlockchainProperties props;

    public BlockchainTxRef sendContractCall(String contractAddress, Function function) {
        if (!props.isEnabled()) {
            return new BlockchainTxRef(null, null);
        }
        if (props.getWallet() == null || props.getWallet().getPrivateKey() == null || props.getWallet().getPrivateKey().isBlank()) {
            throw new IllegalStateException(
                    "Blockchain is enabled but 'blockchain.wallet.private-key' is not configured. "
                            + "Set it in application.properties (or set blockchain.enabled=false).");
        }
        if (contractAddress == null || contractAddress.isBlank()) {
            throw new IllegalStateException(
                    "Blockchain is enabled but the target contract address is empty. "
                            + "Check 'blockchain.contracts.asset-token', 'blockchain.contracts.health-token', "
                            + "and 'blockchain.contracts.hospital-financials' in application.properties.");
        }

        Credentials credentials = Credentials.create(props.getWallet().getPrivateKey().trim());
        TransactionReceiptProcessor receiptProcessor = new PollingTransactionReceiptProcessor(web3j, 1_000, 60);
        TransactionManager txManager = new RawTransactionManager(web3j, credentials, props.getChainId(), receiptProcessor);

        String data = FunctionEncoder.encode(function);

        try {
            EthSendTransaction sent = txManager.sendTransaction(
                    props.getGas().getPrice(),
                    props.getGas().getLimit(),
                    contractAddress,
                    data,
                    BigInteger.ZERO
            );

            if (sent == null) {
                throw new IllegalStateException("Null blockchain response");
            }
            if (sent.hasError()) {
                throw new IllegalStateException("Blockchain tx error: " + sent.getError().getMessage());
            }

            String txHash = sent.getTransactionHash();
            if (txHash == null || txHash.isBlank()) {
                throw new IllegalStateException("Missing transaction hash from blockchain");
            }

            TransactionReceipt receipt = receiptProcessor.waitForTransactionReceipt(txHash);
            Long blockNumber = receipt != null && receipt.getBlockNumber() != null ? receipt.getBlockNumber().longValue() : null;

            return new BlockchainTxRef(txHash, blockNumber);
        } catch (Exception e) {
            throw new IllegalStateException("Blockchain call failed: " + e.getMessage(), e);
        }
    }

    public Optional<TransactionReceipt> getReceipt(String txHash) {
        if (!props.isEnabled()) {
            return Optional.empty();
        }
        if (txHash == null || txHash.isBlank()) {
            return Optional.empty();
        }
        try {
            return web3j.ethGetTransactionReceipt(txHash).send().getTransactionReceipt();
        } catch (IOException e) {
            return Optional.empty();
        }
    }

    public static Function fn(String name, List<Type> inputs) {
        return new Function(name, Objects.requireNonNullElse(inputs, List.of()), List.of());
    }
}
