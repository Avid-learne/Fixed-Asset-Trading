package com.SehatVault.SehatVaultBackend.blockchain.exception;

/**
 * Custom exception for blockchain operation failures
 */
public class BlockchainOperationException extends RuntimeException {
    
    public BlockchainOperationException(String message) {
        super(message);
    }

    public BlockchainOperationException(String message, Throwable cause) {
        super(message, cause);
    }
}
