package com.SehatVault.SehatVaultBackend.report.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "report_generation_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "generated_by", nullable = false)
    private UUID generatedBy;

    @Column(name = "from_period", nullable = false)
    private LocalDate fromPeriod;

    @Column(name = "to_period", nullable = false)
    private LocalDate toPeriod;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "generated_at")
    private LocalDateTime generatedAt;

    @Column(name = "report_type")
    private String reportType;

    @Column(name = "hospital_id")
    private UUID hospitalId;

    @PrePersist
    protected void onCreate() {
        if (generatedAt == null) generatedAt = LocalDateTime.now();
        if (status == null) status = "COMPLETED";
    }
}
