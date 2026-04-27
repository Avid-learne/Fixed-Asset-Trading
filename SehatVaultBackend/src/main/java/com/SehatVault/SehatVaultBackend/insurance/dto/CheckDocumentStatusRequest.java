package com.SehatVault.SehatVaultBackend.insurance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CheckDocumentStatusRequest {
    private UUID fractionalizationRequestId;
    private UUID patientId;
    private UUID hospitalId;
}
