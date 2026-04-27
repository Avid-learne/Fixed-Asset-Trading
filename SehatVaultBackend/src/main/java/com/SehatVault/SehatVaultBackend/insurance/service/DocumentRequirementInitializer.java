package com.SehatVault.SehatVaultBackend.insurance.service;

import com.SehatVault.SehatVaultBackend.insurance.entity.DocumentRequirement;
import com.SehatVault.SehatVaultBackend.insurance.repository.DocumentRequirementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DocumentRequirementInitializer implements CommandLineRunner {

    private final DocumentRequirementRepository documentRequirementRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("Initializing default document requirements...");

        // Check if already initialized
        if (documentRequirementRepository.count() > 0) {
            log.info("Document requirements already exist. Skipping initialization.");
            return;
        }

        // Create default document requirements
        List<DocumentRequirement> requirements = Arrays.asList(
                new DocumentRequirement(null, "Identity Verification",
                        "Valid government-issued ID (CNIC, Passport, or Driving License)",
                        true, true, null),
                new DocumentRequirement(null, "Address Proof",
                        "Recent utility bill or bank statement showing current address",
                        true, true, null),
                new DocumentRequirement(null, "Asset Ownership Certificate",
                        "Original certificate or deed proving ownership of the asset",
                        true, true, null),
                new DocumentRequirement(null, "Bank Statement",
                        "Latest 3 months bank statements for financial verification",
                        true, true, null),
                new DocumentRequirement(null, "Medical Certificate",
                        "Health check-up report from recognized hospital/clinic",
                        true, true, null),
                new DocumentRequirement(null, "Employment Verification",
                        "Employment letter or income statement from employer",
                        true, true, null),
                new DocumentRequirement(null, "Tax Return Copy",
                        "Last year's tax return or income tax filing (if applicable)",
                        false, true, null),
                new DocumentRequirement(null, "Asset Appraisal Report",
                        "Professional asset valuation report",
                        true, true, null)
        );

        documentRequirementRepository.saveAll(requirements);
        log.info("Successfully initialized {} document requirements", requirements.size());
    }
}
