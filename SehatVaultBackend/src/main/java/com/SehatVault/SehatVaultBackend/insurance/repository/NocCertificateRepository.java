package com.SehatVault.SehatVaultBackend.insurance.repository;

import com.SehatVault.SehatVaultBackend.insurance.entity.NocCertificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NocCertificateRepository extends JpaRepository<NocCertificate, UUID> {
    Optional<NocCertificate> findByNocNumber(String nocNumber);
    Optional<NocCertificate> findByFractionalizationRequestId(UUID fractionalizationRequestId);
    List<NocCertificate> findByPatientId(UUID patientId);
    List<NocCertificate> findByInsuranceCompanyId(UUID insuranceCompanyId);
}
