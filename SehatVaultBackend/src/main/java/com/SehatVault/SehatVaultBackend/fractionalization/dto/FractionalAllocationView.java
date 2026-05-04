package com.SehatVault.SehatVaultBackend.fractionalization.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class FractionalAllocationView {
    private UUID allocationId;
    private UUID requestId;
    private UUID primaryUserId;
    private UUID beneficiaryUserId;
    private String beneficiaryRegistrationId;
    private String source;
    private BigDecimal totalAllocatedHt;
    private BigDecimal remainingHt;
    private String status;
    private String insurerName;
    private String nocNumber;
    private LocalDateTime nocIssuedAt;
    private LocalDateTime nocExpiresAt;
}
