package com.SehatVault.SehatVaultBackend.report.service;

import com.SehatVault.SehatVaultBackend.assetdeposit.entity.AssetDeposit;
import com.SehatVault.SehatVaultBackend.assetdeposit.entity.MintRecord;
import com.SehatVault.SehatVaultBackend.assetdeposit.repository.AssetDepositRepository;
import com.SehatVault.SehatVaultBackend.assetdeposit.repository.MintRecordRepository;
import com.SehatVault.SehatVaultBackend.auth.entity.User;
import com.SehatVault.SehatVaultBackend.auth.repository.UserRepository;
import com.SehatVault.SehatVaultBackend.hospital.entity.Hospital;
import com.SehatVault.SehatVaultBackend.hospital.repository.HospitalRepository;
import com.SehatVault.SehatVaultBackend.marketplace.entity.MarketplaceTrade;
import com.SehatVault.SehatVaultBackend.marketplace.repository.MarketplaceTradeRepository;
import com.SehatVault.SehatVaultBackend.patient.entity.Patient;
import com.SehatVault.SehatVaultBackend.patient.repository.PatientRepository;
import com.SehatVault.SehatVaultBackend.profitallocation.entity.ProfitDistribution;
import com.SehatVault.SehatVaultBackend.profitallocation.repository.ProfitDistributionRepository;
import com.SehatVault.SehatVaultBackend.report.dto.GenerateReportRequest;
import com.SehatVault.SehatVaultBackend.report.dto.ReportDataDto;
import com.SehatVault.SehatVaultBackend.report.dto.ReportLogDto;
import com.SehatVault.SehatVaultBackend.report.entity.ReportLog;
import com.SehatVault.SehatVaultBackend.report.repository.ReportLogRepository;
import com.SehatVault.SehatVaultBackend.wallet.entity.PatientTokenBalance;
import com.SehatVault.SehatVaultBackend.wallet.repository.PatientTokenBalanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportLogRepository reportLogRepository;
    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final PatientRepository patientRepository;
    private final AssetDepositRepository assetDepositRepository;
    private final MintRecordRepository mintRecordRepository;
    private final ProfitDistributionRepository profitDistributionRepository;
    private final MarketplaceTradeRepository marketplaceTradeRepository;
    private final PatientTokenBalanceRepository patientTokenBalanceRepository;

    public List<ReportLogDto> getReportHistory(String email) {
        User user = requireUser(email);
        UUID hospitalId = requireHospitalId(user);
        List<ReportLog> logs = reportLogRepository.findByHospitalIdOrderByGeneratedAtDesc(hospitalId);
        return logs.stream().map(log -> {
            String name = userRepository.findById(log.getGeneratedBy())
                    .map(User::getName).orElse("Unknown");
            return new ReportLogDto(
                    log.getId().toString(),
                    log.getReportType(),
                    log.getFromPeriod().toString(),
                    log.getToPeriod().toString(),
                    log.getStatus(),
                    log.getGeneratedAt() != null ? log.getGeneratedAt().toString() : null,
                    name
            );
        }).toList();
    }

    @Transactional
    public ReportDataDto generateReport(String email, GenerateReportRequest request) {
        User user = requireUser(email);
        UUID hospitalId = requireHospitalId(user);
        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new IllegalArgumentException("Hospital not found"));

        LocalDate from = LocalDate.parse(request.getFromPeriod());
        LocalDate to = LocalDate.parse(request.getToPeriod());
        String reportType = request.getReportType() != null ? request.getReportType().toUpperCase(Locale.ROOT) : "FINANCIAL";

        // Save log entry
        ReportLog log = new ReportLog();
        log.setGeneratedBy(user.getUserId());
        log.setFromPeriod(from);
        log.setToPeriod(to);
        log.setStatus("COMPLETED");
        log.setReportType(reportType);
        log.setHospitalId(hospitalId);
        reportLogRepository.save(log);

        // Build report data
        List<Patient> patients = patientRepository.findByHospitalId(hospitalId);
        List<AssetDeposit> allDeposits = assetDepositRepository.findAllByHospitalId(hospitalId);
        List<MintRecord> mintRecords = mintRecordRepository.findByHospitalIdOrderByTimestampDesc(hospitalId);
        List<ProfitDistribution> distributions = profitDistributionRepository.findByHospitalIdOrderByCreatedAtDesc(hospitalId);
        List<MarketplaceTrade> trades = marketplaceTradeRepository.findByHospitalIdOrderByStartTimeDesc(hospitalId);

        // Filter by date range
        LocalDateTime fromDt = from.atStartOfDay();
        LocalDateTime toDt = to.plusDays(1).atStartOfDay();

        List<AssetDeposit> deposits = allDeposits.stream()
                .filter(d -> d.getSubmittedAt() != null && !d.getSubmittedAt().isBefore(fromDt) && d.getSubmittedAt().isBefore(toDt))
                .toList();

        List<MintRecord> filteredMints = mintRecords.stream()
                .filter(m -> m.getTimestamp() != null && !m.getTimestamp().isBefore(fromDt) && m.getTimestamp().isBefore(toDt))
                .toList();

        List<ProfitDistribution> filteredDist = distributions.stream()
                .filter(d -> d.getCreatedAt() != null && !d.getCreatedAt().isBefore(fromDt) && d.getCreatedAt().isBefore(toDt))
                .toList();

        List<MarketplaceTrade> filteredTrades = trades.stream()
                .filter(t -> t.getStartTime() != null && !t.getStartTime().isBefore(fromDt) && t.getStartTime().isBefore(toDt))
                .toList();

        ReportDataDto dto = new ReportDataDto();
        dto.setReportType(reportType);
        dto.setFromPeriod(from.toString());
        dto.setToPeriod(to.toString());
        dto.setHospitalName(hospital.getHospitalName());
        dto.setGeneratedAt(LocalDateTime.now().toString());

        dto.setTotalPatients(patients.size());
        dto.setTotalDeposits(deposits.size());
        dto.setPendingDeposits(deposits.stream().filter(d -> eq(d.getStatus(), "pending")).count());
        dto.setApprovedDeposits(deposits.stream().filter(d -> eq(d.getBankApprovalStatus(), "approved")).count());

        dto.setTotalAssetValue(deposits.stream()
                .filter(d -> eq(d.getBankApprovalStatus(), "approved"))
                .map(AssetDeposit::getAssetValue).filter(v -> v != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add));

        dto.setTotalAtMinted(filteredMints.stream()
                .filter(m -> !eq(m.getStatus(), "failed"))
                .map(MintRecord::getTokensMinted).filter(v -> v != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add));

        BigDecimal totalHt = BigDecimal.ZERO;
        for (Patient p : patients) {
            PatientTokenBalance bal = patientTokenBalanceRepository.findByPatientId(p.getId()).orElse(null);
            if (bal != null && bal.getTotalHt() != null) totalHt = totalHt.add(bal.getTotalHt());
        }
        dto.setTotalHtAllocated(totalHt);

        dto.setTotalProfitDistributed(filteredDist.stream()
                .map(ProfitDistribution::getTotalProfit).filter(v -> v != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add));

        dto.setTotalTrades(filteredTrades.size());
        dto.setTradingVolume(filteredTrades.stream()
                .map(MarketplaceTrade::getAmountInvested).filter(v -> v != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add));

        // Asset breakdown
        Map<String, long[]> assetMap = new LinkedHashMap<>();
        for (AssetDeposit d : deposits) {
            String type = d.getAssetType() != null ? d.getAssetType().toUpperCase(Locale.ROOT) : "OTHER";
            long[] stats = assetMap.computeIfAbsent(type, k -> new long[]{0, 0});
            stats[0]++;
            stats[1] += d.getAssetValue() != null ? d.getAssetValue().longValue() : 0;
        }
        List<ReportDataDto.AssetBreakdown> breakdowns = new ArrayList<>();
        for (Map.Entry<String, long[]> entry : assetMap.entrySet()) {
            ReportDataDto.AssetBreakdown ab = new ReportDataDto.AssetBreakdown();
            ab.setAssetType(entry.getKey());
            ab.setCount(entry.getValue()[0]);
            ab.setTotalValue(BigDecimal.valueOf(entry.getValue()[1]));
            breakdowns.add(ab);
        }
        dto.setAssetBreakdown(breakdowns);

        // Monthly breakdown within the date range
        DateTimeFormatter monthFmt = DateTimeFormatter.ofPattern("MMM yyyy");
        Map<String, long[]> monthlyMap = new LinkedHashMap<>();
        // Initialize months in range
        LocalDate current = from.withDayOfMonth(1);
        while (!current.isAfter(to)) {
            monthlyMap.put(current.format(monthFmt), new long[]{0, 0, 0}); // deposits, mintedAt (x100), profitDist (x100)
            current = current.plusMonths(1);
        }

        for (AssetDeposit d : deposits) {
            if (d.getSubmittedAt() != null) {
                String key = d.getSubmittedAt().format(monthFmt);
                long[] arr = monthlyMap.get(key);
                if (arr != null) arr[0]++;
            }
        }
        for (MintRecord m : filteredMints) {
            if (m.getTimestamp() != null && m.getTokensMinted() != null) {
                String key = m.getTimestamp().format(monthFmt);
                long[] arr = monthlyMap.get(key);
                if (arr != null) arr[1] += m.getTokensMinted().longValue();
            }
        }
        for (ProfitDistribution pd : filteredDist) {
            if (pd.getCreatedAt() != null && pd.getTotalProfit() != null) {
                String key = pd.getCreatedAt().format(monthFmt);
                long[] arr = monthlyMap.get(key);
                if (arr != null) arr[2] += pd.getTotalProfit().longValue();
            }
        }

        List<ReportDataDto.MonthlyData> monthlyList = new ArrayList<>();
        for (Map.Entry<String, long[]> entry : monthlyMap.entrySet()) {
            ReportDataDto.MonthlyData md = new ReportDataDto.MonthlyData();
            md.setMonth(entry.getKey().split(" ")[0]);
            md.setDeposits(entry.getValue()[0]);
            md.setMintedAt(BigDecimal.valueOf(entry.getValue()[1]));
            md.setProfitDistributed(BigDecimal.valueOf(entry.getValue()[2]));
            monthlyList.add(md);
        }
        dto.setMonthlyData(monthlyList);

        return dto;
    }

    @Transactional
    public void deleteReport(String email, UUID reportId) {
        User user = requireUser(email);
        UUID hospitalId = requireHospitalId(user);
        ReportLog log = reportLogRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found"));
        if (!hospitalId.equals(log.getHospitalId())) {
            throw new IllegalArgumentException("Report does not belong to your hospital");
        }
        reportLogRepository.delete(log);
    }

    private User requireUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private UUID requireHospitalId(User user) {
        if (user.getHospitalId() == null) throw new IllegalArgumentException("No hospital linked to this account");
        return user.getHospitalId();
    }

    private boolean eq(String value, String expected) {
        return value != null && value.trim().toLowerCase(Locale.ROOT).equals(expected);
    }
}
