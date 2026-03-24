package com.SehatVault.SehatVaultBackend.marketplace.service;

import com.SehatVault.SehatVaultBackend.marketplace.entity.HospitalAtPoolEntry;
import com.SehatVault.SehatVaultBackend.marketplace.repository.HospitalAtPoolEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HospitalAtPoolService {

    private final HospitalAtPoolEntryRepository hospitalAtPoolEntryRepository;

    @Transactional
    public void addToPool(UUID hospitalId, UUID patientId, UUID assetId, BigDecimal mintedAt) {
        addToPool(hospitalId, patientId, assetId, mintedAt, HospitalAtPoolEntry.PoolType.ASSET);
    }

    @Transactional
    public void addToPool(UUID hospitalId, UUID patientId, UUID assetId, BigDecimal mintedAt, HospitalAtPoolEntry.PoolType poolType) {
        if (hospitalId == null || patientId == null || assetId == null) {
            throw new IllegalArgumentException("hospitalId, patientId and assetId are required");
        }

        BigDecimal amount = nz(mintedAt);
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        HospitalAtPoolEntry entry = hospitalAtPoolEntryRepository
            .findByHospitalIdAndPatientIdAndAssetId(hospitalId, patientId, assetId)
            .orElseGet(() -> {
                HospitalAtPoolEntry created = new HospitalAtPoolEntry();
                created.setHospitalId(hospitalId);
                created.setPatientId(patientId);
                created.setAssetId(assetId);
                created.setPoolType(poolType);
                created.setTotalAtAdded(BigDecimal.ZERO);
                created.setAvailableAt(BigDecimal.ZERO);
                created.setTotalAtBurned(BigDecimal.ZERO);
                created.setActive(Boolean.TRUE);
                created.setCreatedAt(LocalDateTime.now());
                created.setUpdatedAt(LocalDateTime.now());
                return created;
            });

        entry.setTotalAtAdded(nz(entry.getTotalAtAdded()).add(amount));
        entry.setAvailableAt(nz(entry.getAvailableAt()).add(amount));
        entry.setPoolType(poolType);
        entry.setActive(entry.getAvailableAt().compareTo(BigDecimal.ZERO) > 0);
        entry.setUpdatedAt(LocalDateTime.now());
        hospitalAtPoolEntryRepository.save(entry);
    }

    @Transactional(readOnly = true)
    public BigDecimal getTotalAvailableAt(UUID hospitalId) {
        return hospitalAtPoolEntryRepository.findByHospitalIdAndActiveIsTrueOrderByCreatedAtAsc(hospitalId)
            .stream()
            .map(HospitalAtPoolEntry::getAvailableAt)
            .map(this::nz)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Transactional(readOnly = true)
    public BigDecimal getTotalAvailableAtByType(UUID hospitalId, HospitalAtPoolEntry.PoolType poolType) {
        return hospitalAtPoolEntryRepository.findByHospitalIdAndActiveIsTrueOrderByCreatedAtAsc(hospitalId)
            .stream()
            .filter(entry -> entry.getPoolType() == poolType)
            .map(HospitalAtPoolEntry::getAvailableAt)
            .map(this::nz)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Transactional(readOnly = true)
    public List<HospitalAtPoolEntry> getActivePoolEntries(UUID hospitalId) {
        return hospitalAtPoolEntryRepository.findByHospitalIdAndActiveIsTrueOrderByCreatedAtAsc(hospitalId);
    }

    @Transactional(readOnly = true)
    public List<HospitalAtPoolEntry> getActivePoolEntriesByType(UUID hospitalId, HospitalAtPoolEntry.PoolType poolType) {
        return hospitalAtPoolEntryRepository.findByHospitalIdAndActiveIsTrueOrderByCreatedAtAsc(hospitalId)
            .stream()
            .filter(entry -> entry.getPoolType() == poolType)
            .collect(java.util.stream.Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PoolBurnAllocation> previewBurnAllocations(UUID hospitalId, BigDecimal totalAtBurned) {
        BigDecimal burnTarget = nz(totalAtBurned);
        if (burnTarget.compareTo(BigDecimal.ZERO) <= 0) {
            return List.of();
        }

        List<HospitalAtPoolEntry> entries = hospitalAtPoolEntryRepository
            .findByHospitalIdAndActiveIsTrueOrderByCreatedAtAsc(hospitalId);

        BigDecimal totalAvailable = entries.stream()
            .map(HospitalAtPoolEntry::getAvailableAt)
            .map(this::nz)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (burnTarget.compareTo(totalAvailable) > 0) {
            throw new IllegalArgumentException("Insufficient AT available in hospital pool for burn. available="
                + totalAvailable.toPlainString() + " required=" + burnTarget.toPlainString());
        }

        List<PoolBurnAllocation> allocations = new ArrayList<>();
        BigDecimal allocated = BigDecimal.ZERO;

        for (int i = 0; i < entries.size(); i++) {
            HospitalAtPoolEntry entry = entries.get(i);
            BigDecimal available = nz(entry.getAvailableAt());
            if (available.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            boolean isLast = i == entries.size() - 1;
            BigDecimal burnAmount;
            if (isLast) {
                burnAmount = burnTarget.subtract(allocated);
            } else {
                burnAmount = burnTarget
                    .multiply(available)
                    .divide(totalAvailable, 8, RoundingMode.HALF_UP);
            }

            if (burnAmount.compareTo(available) > 0) {
                burnAmount = available;
            }
            if (burnAmount.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            allocated = allocated.add(burnAmount);
            allocations.add(new PoolBurnAllocation(entry, burnAmount));
        }

        BigDecimal remainder = burnTarget.subtract(allocated);
        if (remainder.compareTo(BigDecimal.ZERO) > 0 && !allocations.isEmpty()) {
            PoolBurnAllocation last = allocations.get(allocations.size() - 1);
            BigDecimal maxExtra = nz(last.entry().getAvailableAt()).subtract(last.burnAmount());
            BigDecimal extra = remainder.min(maxExtra.max(BigDecimal.ZERO));
            if (extra.compareTo(BigDecimal.ZERO) > 0) {
                allocations.set(allocations.size() - 1,
                    new PoolBurnAllocation(last.entry(), last.burnAmount().add(extra)));
            }
        }

        return allocations;
    }

    @Transactional
    public List<PoolBurnAllocationResult> applyBurnAllocations(UUID hospitalId, BigDecimal totalAtBurned) {
        List<PoolBurnAllocation> allocations = previewBurnAllocations(hospitalId, totalAtBurned);
        List<PoolBurnAllocationResult> results = new ArrayList<>();

        for (PoolBurnAllocation allocation : allocations) {
            HospitalAtPoolEntry entry = allocation.entry();
            BigDecimal burnAmount = allocation.burnAmount();

            entry.setAvailableAt(nz(entry.getAvailableAt()).subtract(burnAmount));
            if (entry.getAvailableAt().compareTo(BigDecimal.ZERO) < 0) {
                entry.setAvailableAt(BigDecimal.ZERO);
            }
            entry.setTotalAtBurned(nz(entry.getTotalAtBurned()).add(burnAmount));
            entry.setActive(entry.getAvailableAt().compareTo(BigDecimal.ZERO) > 0);
            entry.setUpdatedAt(LocalDateTime.now());

            HospitalAtPoolEntry saved = hospitalAtPoolEntryRepository.save(entry);
            results.add(new PoolBurnAllocationResult(
                saved.getHospitalId(),
                saved.getPatientId(),
                saved.getAssetId(),
                burnAmount,
                saved.getAvailableAt()
            ));
        }

        return results;
    }

    private BigDecimal nz(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    public record PoolBurnAllocation(HospitalAtPoolEntry entry, BigDecimal burnAmount) {}

    public record PoolBurnAllocationResult(
        UUID hospitalId,
        UUID patientId,
        UUID assetId,
        BigDecimal burnedAt,
        BigDecimal remainingAt
    ) {}
}
