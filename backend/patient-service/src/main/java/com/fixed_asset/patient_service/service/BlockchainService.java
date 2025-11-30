package com.fixed_asset.patient_service.service;

import java.math.BigInteger;

public interface BlockchainService {
    String mintAssetTokens(String patientWallet, BigInteger amount, String depositId, String metadata);
    String mintHealthTokens(String patientWallet, BigInteger amount);
    boolean burnHealthTokens(String patientWallet, BigInteger amount);
    BigInteger getAssetTokenBalance(String walletAddress);
    BigInteger getHealthTokenBalance(String walletAddress);
    boolean isTransactionConfirmed(String transactionHash);
    String getCurrentBlockNumber();
}