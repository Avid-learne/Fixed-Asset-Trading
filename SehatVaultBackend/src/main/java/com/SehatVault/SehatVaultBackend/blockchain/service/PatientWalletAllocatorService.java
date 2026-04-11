package com.SehatVault.SehatVaultBackend.blockchain.service;

import com.SehatVault.SehatVaultBackend.patient.entity.Patient;
import com.SehatVault.SehatVaultBackend.patient.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientWalletAllocatorService {

    private static final String ADDRESS_REGEX = "^0x[a-fA-F0-9]{40}$";

    private final PatientRepository patientRepository;

    @Value("${blockchain.patient-wallet-addresses:}")
    private String patientWalletAddressPool;

    @Value("${blockchain.wallet.address:}")
    private String backendSignerWalletAddress;

    public String assignWalletToPatient(Patient patient) {
        String existing = normalize(patient.getWalletAddress());
        if (!existing.isEmpty()) {
            patient.setWalletAddress(existing);
            return existing;
        }

        String allocated = allocateNextAvailableWallet();
        patient.setWalletAddress(allocated);
        patientRepository.save(patient);
        return allocated;
    }

    public String assignWalletToPatient(UUID patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found for wallet allocation"));
        return assignWalletToPatient(patient);
    }

    private String allocateNextAvailableWallet() {
        List<String> pool = configuredWalletPool();
        if (pool.isEmpty()) {
            throw new IllegalStateException("No patient wallet addresses configured. Set blockchain.patient-wallet-addresses");
        }

        Set<String> used = patientRepository.findAll().stream()
                .map(Patient::getWalletAddress)
                .map(this::normalize)
                .filter(v -> !v.isEmpty())
                .collect(Collectors.toSet());

        for (String candidate : pool) {
            if (!used.contains(candidate)) {
                return candidate;
            }
        }

        throw new IllegalStateException("Patient wallet address pool exhausted. Add more addresses in blockchain.patient-wallet-addresses");
    }

    private List<String> configuredWalletPool() {
        Set<String> deduped = new LinkedHashSet<>();
        String reserved = normalize(backendSignerWalletAddress);

        Arrays.stream(patientWalletAddressPool.split(","))
                .map(this::normalize)
                .filter(v -> !v.isEmpty())
                .filter(v -> !v.equals(reserved))
                .forEach(deduped::add);

        return deduped.stream().toList();
    }

    private String normalize(String value) {
        if (value == null) {
            return "";
        }
        String normalized = value.trim();
        if (!normalized.matches(ADDRESS_REGEX)) {
            return "";
        }
        return normalized.toLowerCase(Locale.ROOT);
    }
}