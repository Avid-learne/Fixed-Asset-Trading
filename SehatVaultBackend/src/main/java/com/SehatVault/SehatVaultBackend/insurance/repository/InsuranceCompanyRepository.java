package com.SehatVault.SehatVaultBackend.insurance.repository;

import com.SehatVault.SehatVaultBackend.insurance.entity.InsuranceCompany;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface InsuranceCompanyRepository extends JpaRepository<InsuranceCompany, UUID> {
    Optional<InsuranceCompany> findByRegistrationNumber(String registrationNumber);
    Optional<InsuranceCompany> findByCompanyName(String companyName);
}
