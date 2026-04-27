package com.SehatVault.SehatVaultBackend.insurance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DocumentStatusResponseDto {
    private Boolean allDocumentsComplete;
    private Integer totalRequiredDocuments;
    private Integer submittedDocuments;
    private Integer verifiedDocuments;
    private Integer rejectedDocuments;
    private List<DocumentStatusDto> documents;
}
