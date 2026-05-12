package com.SehatVault.SehatVaultBackend.storage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StorageUploadResponse {
    private String bucket;
    private String objectPath;
    private String originalFileName;
    private String contentType;
    private long sizeBytes;
    private String previewPath;
}
