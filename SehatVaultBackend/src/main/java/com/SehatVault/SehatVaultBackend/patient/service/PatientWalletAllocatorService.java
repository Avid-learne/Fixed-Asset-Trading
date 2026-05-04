package com.SehatVault.SehatVaultBackend.patient.service;

import com.SehatVault.SehatVaultBackend.auth.entity.User;
import com.SehatVault.SehatVaultBackend.auth.repository.UserRepository;
import com.SehatVault.SehatVaultBackend.patient.entity.Patient;
import com.SehatVault.SehatVaultBackend.patient.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

/**
 * Allocates Hardhat-pool wallet addresses to users at signup. Patients store the
 * wallet on the Patient entity (legacy column); other roles store it on the User
 * entity. Both tables are scanned when picking the next free address so the pool
 * stays unique across the entire system.
 */
@Service
@RequiredArgsConstructor
public class PatientWalletAllocatorService {

    private static final String ADDRESS_REGEX = "^0x[a-fA-F0-9]{40}$";

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

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

    /**
     * Assign a wallet address to any non-patient user (hospital admin, hospital
     * staff, bank staff). The address comes from the same pool used for patients
     * and is guaranteed unique against both tables.
     */
    public String assignWalletToUser(User user) {
        String existing = normalize(user.getWalletAddress());
        if (!existing.isEmpty()) {
            user.setWalletAddress(existing);
            return existing;
        }

        String allocated = allocateNextAvailableWallet();
        user.setWalletAddress(allocated);
        userRepository.save(user);
        return allocated;
    }

    private String allocateNextAvailableWallet() {
        List<String> pool = configuredWalletPool();
        if (pool.isEmpty()) {
            throw new IllegalStateException("No wallet addresses configured. Set blockchain.patient-wallet-addresses");
        }

        // Combined "in use" set across both tables — patients keep their wallet on the
        // Patient entity, every other role keeps it on the User entity.
        Set<String> used = new HashSet<>();
        patientRepository.findAll().stream()
                .map(Patient::getWalletAddress)
                .map(this::normalize)
                .filter(v -> !v.isEmpty())
                .forEach(used::add);
        userRepository.findAll().stream()
                .map(User::getWalletAddress)
                .map(this::normalize)
                .filter(v -> !v.isEmpty())
                .forEach(used::add);

        for (String candidate : pool) {
            if (!used.contains(candidate)) {
                return candidate;
            }
        }

        throw new IllegalStateException("Wallet address pool exhausted. Add more addresses in blockchain.patient-wallet-addresses");
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
