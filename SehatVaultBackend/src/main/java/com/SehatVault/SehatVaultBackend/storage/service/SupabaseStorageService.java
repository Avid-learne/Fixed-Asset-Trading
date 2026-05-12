package com.SehatVault.SehatVaultBackend.storage.service;

import com.SehatVault.SehatVaultBackend.storage.dto.StorageUploadResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SupabaseStorageService {

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    @Value("${supabase.storage.project-url:}")
    private String supabaseProjectUrl;

    @Value("${supabase.storage.service-role-key:}")
    private String supabaseServiceRoleKey;

    @Value("${supabase.storage.kyc-bucket:kyc-uploads}")
    private String kycBucket;

    @Value("${supabase.storage.asset-bucket:asset-uploads}")
    private String assetBucket;

    public StorageUploadResponse upload(String category, MultipartFile file) throws IOException, InterruptedException {
        String bucket = resolveBucket(category);
        String originalFileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "upload";
        String objectPath = buildObjectPath(originalFileName);

        System.out.println("[SupabaseStorageService] Upload: category=" + category + ", bucket=" + bucket);
        System.out.println("[SupabaseStorageService] Original filename: " + originalFileName);
        System.out.println("[SupabaseStorageService] Object path: " + objectPath);
        System.out.println("[SupabaseStorageService] File size: " + file.getSize() + " bytes");

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(buildObjectUploadUrl(bucket, objectPath)))
                .timeout(Duration.ofSeconds(60))
                .header("apikey", requireServiceRoleKey())
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + requireServiceRoleKey())
                .header(HttpHeaders.CONTENT_TYPE, resolveContentType(file))
                .header("x-upsert", "true")
                .POST(HttpRequest.BodyPublishers.ofByteArray(file.getBytes()))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println("[SupabaseStorageService] Upload response status: " + response.statusCode());
        
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            System.err.println("[SupabaseStorageService] Upload failed: " + response.statusCode());
            System.err.println("[SupabaseStorageService] Response body: " + response.body());
            throw new IllegalStateException("Supabase upload failed (" + response.statusCode() + "): " + response.body());
        }

        String previewPath = buildPreviewPath(category, objectPath);
        System.out.println("[SupabaseStorageService] Built preview path: " + previewPath);

        return StorageUploadResponse.builder()
                .bucket(bucket)
                .objectPath(objectPath)
                .originalFileName(originalFileName)
                .contentType(resolveContentType(file))
                .sizeBytes(file.getSize())
                .previewPath(previewPath)
                .build();
    }

    public byte[] download(String category, String objectPath) throws IOException, InterruptedException {
        String bucket = resolveBucket(category);
        String downloadUrl = buildObjectDownloadUrl(bucket, objectPath);

        System.out.println("[SupabaseStorageService] Download: category=" + category + ", bucket=" + bucket + ", objectPath=" + objectPath);
        System.out.println("[SupabaseStorageService] Download URL: " + downloadUrl);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(downloadUrl))
                .timeout(Duration.ofSeconds(60))
                .header("apikey", requireServiceRoleKey())
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + requireServiceRoleKey())
                .GET()
                .build();

        HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
        System.out.println("[SupabaseStorageService] Download response status: " + response.statusCode());
        
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            System.err.println("[SupabaseStorageService] Download failed: " + response.statusCode());
            throw new IllegalStateException("Supabase download failed (" + response.statusCode() + ")");
        }
        System.out.println("[SupabaseStorageService] Download successful: " + response.body().length + " bytes");
        return response.body();
    }

    public String buildPreviewPath(String category, String objectPath) {
        return "/api/storage/preview/" + category + "?path=" + urlEncode(objectPath);
    }

    public String resolveBucket(String category) {
        if (category == null) {
            throw new IllegalArgumentException("Storage category is required");
        }
        return switch (category.toLowerCase(Locale.ROOT)) {
            case "kyc" -> kycBucket;
            case "asset" -> assetBucket;
            default -> throw new IllegalArgumentException("Unsupported storage category: " + category);
        };
    }

    private String buildObjectUploadUrl(String bucket, String objectPath) {
        ensureConfigured();
        return trimTrailingSlash(supabaseProjectUrl) + "/storage/v1/object/" + bucket + "/" + encodeObjectPath(objectPath);
    }

    private String buildObjectDownloadUrl(String bucket, String objectPath) {
        ensureConfigured();
        return trimTrailingSlash(supabaseProjectUrl) + "/storage/v1/object/" + bucket + "/" + encodeObjectPath(objectPath);
    }

    private String buildObjectPath(String originalFileName) {
        String safeName = originalFileName.trim().replaceAll("\\s+", "-");
        safeName = safeName.replaceAll("[^a-zA-Z0-9._-]", "");
        if (safeName.isBlank()) {
            safeName = "upload";
        }
        return UUID.randomUUID() + "-" + safeName;
    }

    private String resolveContentType(MultipartFile file) {
        String contentType = file.getContentType();
        return (contentType == null || contentType.isBlank()) ? MediaType.APPLICATION_OCTET_STREAM_VALUE : contentType;
    }

    private String requireServiceRoleKey() {
        if (supabaseServiceRoleKey == null || supabaseServiceRoleKey.isBlank()) {
            throw new IllegalStateException("Supabase service role key is not configured");
        }
        return supabaseServiceRoleKey;
    }

    private void ensureConfigured() {
        if (supabaseProjectUrl == null || supabaseProjectUrl.isBlank()) {
            throw new IllegalStateException("Supabase project URL is not configured");
        }
    }

    private String trimTrailingSlash(String value) {
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }

    private String encodeObjectPath(String objectPath) {
        StringBuilder encoded = new StringBuilder();
        String[] segments = objectPath.split("/");
        for (int i = 0; i < segments.length; i++) {
            if (i > 0) {
                encoded.append('/');
            }
            encoded.append(URLEncoder.encode(segments[i], StandardCharsets.UTF_8).replace("+", "%20"));
        }
        return encoded.toString();
    }

    private String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }
}
