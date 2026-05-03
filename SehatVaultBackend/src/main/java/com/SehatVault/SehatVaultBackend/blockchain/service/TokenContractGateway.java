package com.SehatVault.SehatVaultBackend.blockchain.service;

import com.SehatVault.SehatVaultBackend.blockchain.config.BlockchainProperties;
import com.SehatVault.SehatVaultBackend.blockchain.model.BlockchainTxRef;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.abi.datatypes.generated.Uint256;

import java.math.BigInteger;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TokenContractGateway {

    private final BlockchainWriteService blockchain;
    private final BlockchainProperties props;

    public BlockchainTxRef mintATViaHospitalFinancials(String patientWallet, BigInteger depositId, BigInteger amountAT, String metadata) {
        Function fn = new Function(
                "mintAssetToken",
                List.of(
                        new Address(patientWallet),
                        new Uint256(depositId),
                        new Uint256(amountAT),
                        new Utf8String(metadata == null ? "" : metadata)
                ),
                List.of()
        );
        return blockchain.sendContractCall(props.getContracts().getHospitalFinancials(), fn);
    }

    public BlockchainTxRef mintHT(String patientWallet, BigInteger amountHT) {
        Function fn = new Function(
                "mint",
                List.of(new Address(patientWallet), new Uint256(amountHT)),
                List.of()
        );
        return blockchain.sendContractCall(props.getContracts().getHealthToken(), fn);
    }

    public BlockchainTxRef burnHT(String patientWallet, BigInteger amountHT) {
        Function fn = new Function(
                "burn",
                List.of(new Address(patientWallet), new Uint256(amountHT)),
                List.of()
        );
        return blockchain.sendContractCall(props.getContracts().getHealthToken(), fn);
    }

    public BlockchainTxRef burnAT(String patientWallet, BigInteger amountAT) {
        Function fn = new Function(
                "burn",
                List.of(new Address(patientWallet), new Uint256(amountAT)),
                List.of()
        );
        return blockchain.sendContractCall(props.getContracts().getAssetToken(), fn);
    }

    public BlockchainTxRef redeemHTViaHospitalFinancials(String patientWallet, BigInteger amountHT, String serviceType) {
        Function fn = new Function(
                "redeemHealthToken",
                List.of(new Address(patientWallet), new Uint256(amountHT), new Utf8String(serviceType == null ? "" : serviceType)),
                List.of()
        );
        return blockchain.sendContractCall(props.getContracts().getHospitalFinancials(), fn);
    }
}
