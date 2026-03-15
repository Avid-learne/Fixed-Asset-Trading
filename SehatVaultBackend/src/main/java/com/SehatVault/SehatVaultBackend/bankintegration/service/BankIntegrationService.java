package com.SehatVault.SehatVaultBackend.bankintegration.service;

import com.SehatVault.SehatVaultBackend.assetdeposit.repository.AssetDepositRepository;
import com.SehatVault.SehatVaultBackend.auth.entity.Role;
import com.SehatVault.SehatVaultBackend.auth.entity.User;
import com.SehatVault.SehatVaultBackend.auth.repository.UserRepository;
import com.SehatVault.SehatVaultBackend.bank.entity.Bank;
import com.SehatVault.SehatVaultBackend.bank.repository.BankRepository;
import com.SehatVault.SehatVaultBackend.bankintegration.dto.BankHospitalIntegrationDto;
import com.SehatVault.SehatVaultBackend.bankintegration.dto.BankOptionDto;
import com.SehatVault.SehatVaultBackend.bankintegration.dto.CreatePartnershipRequest;
import com.SehatVault.SehatVaultBackend.bankintegration.dto.HospitalBankIntegrationDto;
import com.SehatVault.SehatVaultBackend.bankintegration.entity.Partnership;
import com.SehatVault.SehatVaultBackend.bankintegration.repository.PartnershipRepository;
import com.SehatVault.SehatVaultBackend.hospital.entity.Hospital;
import com.SehatVault.SehatVaultBackend.hospital.repository.HospitalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BankIntegrationService {

    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final BankRepository bankRepository;
    private final PartnershipRepository partnershipRepository;
    private final AssetDepositRepository assetDepositRepository;

    @Transactional(readOnly = true)
    public List<HospitalBankIntegrationDto> getHospitalIntegrations(String email) {
        User admin = requireUser(email);
        requireRole(admin, Role.RoleType.hospital_admin, "Only hospital admins can view bank integrations");

        UUID hospitalId = requireHospitalId(admin);
        List<Partnership> links = partnershipRepository.findByHospitalIdOrderByCreatedAtDesc(hospitalId);

        return links.stream().map(link -> {
            Bank bank = bankRepository.findById(link.getBankId())
                    .orElseThrow(() -> new IllegalArgumentException("Linked bank not found: " + link.getBankId()));
            return toHospitalView(link, bank, hospitalId);
        }).toList();
    }

    @Transactional(readOnly = true)
    public List<BankOptionDto> getAvailableBanksForHospital(String email) {
        User admin = requireUser(email);
        requireRole(admin, Role.RoleType.hospital_admin, "Only hospital admins can browse available banks");

        UUID hospitalId = requireHospitalId(admin);
        Set<UUID> linkedBankIds = partnershipRepository.findByHospitalIdOrderByCreatedAtDesc(hospitalId).stream()
            .filter(link -> link.getIntegrationStatus() != Partnership.IntegrationStatus.REJECTED)
                .map(Partnership::getBankId)
                .collect(Collectors.toSet());

        return bankRepository.findAll().stream()
                .filter(bank -> !linkedBankIds.contains(bank.getBankId()))
                .map(this::toBankOption)
                .toList();
    }

    @Transactional
    public HospitalBankIntegrationDto createHospitalIntegration(String email, CreatePartnershipRequest request) {
        User admin = requireUser(email);
        requireRole(admin, Role.RoleType.hospital_admin, "Only hospital admins can create bank integrations");

        if (request == null || request.getBankId() == null) {
            throw new IllegalArgumentException("bankId is required");
        }

        UUID hospitalId = requireHospitalId(admin);
        if (partnershipRepository.existsByHospitalIdAndBankIdAndIntegrationStatusIn(
                hospitalId,
                request.getBankId(),
                Set.of(Partnership.IntegrationStatus.PENDING, Partnership.IntegrationStatus.APPROVED)
        )) {
            throw new IllegalArgumentException("This bank is already linked or pending approval for your hospital");
        }

        Bank bank = bankRepository.findById(request.getBankId())
                .orElseThrow(() -> new IllegalArgumentException("Bank not found"));

        Partnership link = new Partnership();
        link.setPartnershipId(UUID.randomUUID());
        link.setHospitalId(hospitalId);
        link.setBankId(bank.getBankId());
        link.setPartnershipStarted(LocalDate.now());
        link.setContactPersonId(admin.getUserId());
        link.setAssetsDepositedToBank(BigDecimal.ZERO);
        link.setLoansTakenByHospital(BigDecimal.ZERO);
        link.setTotalDeposits(BigDecimal.ZERO);
        link.setIntegrationStatus(Partnership.IntegrationStatus.PENDING);
        link.setReviewedAt(null);
        link.setRejectionReason(null);

        Partnership saved = partnershipRepository.save(link);
        return toHospitalView(saved, bank, hospitalId);
    }

    @Transactional
    public void removeHospitalIntegration(String email, UUID partnershipId) {
        User admin = requireUser(email);
        requireRole(admin, Role.RoleType.hospital_admin, "Only hospital admins can view integrations");
        throw new IllegalArgumentException("Only bank can unlink integrations after approval");
    }

        @Transactional
        public BankHospitalIntegrationDto approveIntegration(String email, UUID partnershipId) {
        User bankUser = requireUser(email);
        requireRole(bankUser, Role.RoleType.bank_staff, "Only bank staff can approve integration requests");

        Bank bank = bankRepository.findByEmail(bankUser.getEmail())
            .orElseThrow(() -> new IllegalArgumentException("No bank profile found for this account"));

        Partnership link = partnershipRepository.findByPartnershipIdAndBankId(partnershipId, bank.getBankId())
            .orElseThrow(() -> new IllegalArgumentException("Integration request not found for this bank"));

        link.setIntegrationStatus(Partnership.IntegrationStatus.APPROVED);
        link.setReviewedAt(LocalDateTime.now());
        link.setRejectionReason(null);

        Partnership saved = partnershipRepository.save(link);
        Hospital hospital = hospitalRepository.findById(saved.getHospitalId())
            .orElseThrow(() -> new IllegalArgumentException("Linked hospital not found: " + saved.getHospitalId()));
        return toBankView(saved, hospital, bank.getBankId());
        }

        @Transactional
        public BankHospitalIntegrationDto rejectIntegration(String email, UUID partnershipId, String reason) {
        User bankUser = requireUser(email);
        requireRole(bankUser, Role.RoleType.bank_staff, "Only bank staff can reject integration requests");

        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("Rejection reason is required");
        }

        Bank bank = bankRepository.findByEmail(bankUser.getEmail())
            .orElseThrow(() -> new IllegalArgumentException("No bank profile found for this account"));

        Partnership link = partnershipRepository.findByPartnershipIdAndBankId(partnershipId, bank.getBankId())
            .orElseThrow(() -> new IllegalArgumentException("Integration request not found for this bank"));

        link.setIntegrationStatus(Partnership.IntegrationStatus.REJECTED);
        link.setReviewedAt(LocalDateTime.now());
        link.setRejectionReason(reason.trim());

        Partnership saved = partnershipRepository.save(link);
        Hospital hospital = hospitalRepository.findById(saved.getHospitalId())
            .orElseThrow(() -> new IllegalArgumentException("Linked hospital not found: " + saved.getHospitalId()));
        return toBankView(saved, hospital, bank.getBankId());
        }

    @Transactional(readOnly = true)
    public List<BankHospitalIntegrationDto> getBankIntegrations(String email) {
        User bankUser = requireUser(email);
        requireRole(bankUser, Role.RoleType.bank_staff, "Only bank staff can view integrations");

        Bank bank = bankRepository.findByEmail(bankUser.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("No bank profile found for this account"));

        List<Partnership> links = partnershipRepository.findByBankIdOrderByCreatedAtDesc(bank.getBankId());

        return links.stream().map(link -> {
            Hospital hospital = hospitalRepository.findById(link.getHospitalId())
                    .orElseThrow(() -> new IllegalArgumentException("Linked hospital not found: " + link.getHospitalId()));
            return toBankView(link, hospital, bank.getBankId());
        }).toList();
    }

    @Transactional
    public void removeBankIntegration(String email, UUID partnershipId) {
        User bankUser = requireUser(email);
        requireRole(bankUser, Role.RoleType.bank_staff, "Only bank staff can remove integrations");

        Bank bank = bankRepository.findByEmail(bankUser.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("No bank profile found for this account"));

        Partnership link = partnershipRepository.findByPartnershipIdAndBankId(partnershipId, bank.getBankId())
                .orElseThrow(() -> new IllegalArgumentException("Integration not found for this bank"));

        if (link.getIntegrationStatus() != Partnership.IntegrationStatus.APPROVED) {
            throw new IllegalArgumentException("Only approved integrations can be unlinked");
        }

        partnershipRepository.delete(link);
    }

    private HospitalBankIntegrationDto toHospitalView(Partnership link, Bank bank, UUID hospitalId) {
        HospitalBankIntegrationDto dto = new HospitalBankIntegrationDto();
        dto.setPartnershipId(link.getPartnershipId());
        dto.setBankId(bank.getBankId());
        dto.setBankName(bank.getBankName());
        dto.setBankEmail(bank.getEmail());
        dto.setBankCity(bank.getCity());
        dto.setBankContact(bank.getContactNum());
        dto.setBankVerificationStatus(bank.getVerificationStatus() != null ? bank.getVerificationStatus().name() : "PENDING");
        dto.setIntegrationStatus(link.getIntegrationStatus() != null ? link.getIntegrationStatus().name() : "PENDING");
        dto.setRejectionReason(link.getRejectionReason());
        dto.setPartnershipStarted(link.getPartnershipStarted());
        dto.setLinkedAt(link.getCreatedAt());
        dto.setTotalDeposits(assetDepositRepository.countByBankIdAndHospitalId(bank.getBankId(), hospitalId));
        dto.setApprovedDeposits(assetDepositRepository.countByBankIdAndHospitalIdAndStatus(bank.getBankId(), hospitalId, "approved"));
        dto.setPendingDeposits(assetDepositRepository.countByBankIdAndHospitalIdAndStatus(bank.getBankId(), hospitalId, "pending"));
        dto.setTotalAssetValuePkr(nz(assetDepositRepository.sumAssetValueByBankIdAndHospitalId(bank.getBankId(), hospitalId)));
        return dto;
    }

    private BankHospitalIntegrationDto toBankView(Partnership link, Hospital hospital, UUID bankId) {
        BankHospitalIntegrationDto dto = new BankHospitalIntegrationDto();
        dto.setPartnershipId(link.getPartnershipId());
        dto.setHospitalId(hospital.getHospitalId());
        dto.setHospitalName(hospital.getHospitalName());
        dto.setHospitalEmail(hospital.getEmail());
        dto.setHospitalCity(hospital.getCity());
        dto.setHospitalContact(hospital.getContactNum());
        dto.setHospitalVerificationStatus(hospital.getVerificationStatus() != null
                ? hospital.getVerificationStatus().name().toUpperCase(Locale.ROOT)
                : "PENDING");
        dto.setIntegrationStatus(link.getIntegrationStatus() != null ? link.getIntegrationStatus().name() : "PENDING");
        dto.setRejectionReason(link.getRejectionReason());
        dto.setPartnershipStarted(link.getPartnershipStarted());
        dto.setLinkedAt(link.getCreatedAt());
        dto.setTotalDeposits(assetDepositRepository.countByBankIdAndHospitalId(bankId, hospital.getHospitalId()));
        dto.setApprovedDeposits(assetDepositRepository.countByBankIdAndHospitalIdAndStatus(bankId, hospital.getHospitalId(), "approved"));
        dto.setPendingDeposits(assetDepositRepository.countByBankIdAndHospitalIdAndStatus(bankId, hospital.getHospitalId(), "pending"));
        dto.setTotalAssetValuePkr(nz(assetDepositRepository.sumAssetValueByBankIdAndHospitalId(bankId, hospital.getHospitalId())));
        return dto;
    }

    private BankOptionDto toBankOption(Bank bank) {
        BankOptionDto dto = new BankOptionDto();
        dto.setBankId(bank.getBankId());
        dto.setBankName(bank.getBankName());
        dto.setCity(bank.getCity());
        dto.setEmail(bank.getEmail());
        dto.setVerificationStatus(bank.getVerificationStatus() != null ? bank.getVerificationStatus().name() : "PENDING");
        return dto;
    }

    private User requireUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private void requireRole(User user, Role.RoleType roleType, String message) {
        if (user.getRole() == null || user.getRole().getRoleName() != roleType) {
            throw new IllegalArgumentException(message);
        }
    }

    private UUID requireHospitalId(User user) {
        if (user.getHospitalId() == null) {
            throw new IllegalArgumentException("Hospital is not linked to this account");
        }
        return user.getHospitalId();
    }

    private BigDecimal nz(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}
