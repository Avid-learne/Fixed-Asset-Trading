package com.SehatVault.SehatVaultBackend.storage.controller;

import com.SehatVault.SehatVaultBackend.storage.dto.StorageUploadResponse;
import com.SehatVault.SehatVaultBackend.storage.service.SupabaseStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLConnection;

@RestController
@RequestMapping("/api/storage")
@RequiredArgsConstructor
public class StorageController {

    private final SupabaseStorageService storageService;

    @PostMapping(value = "/upload/{category}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> upload(@PathVariable String category, @RequestPart("file") MultipartFile file) {
        try {
            System.out.println("[StorageController] Upload request: category=" + category + ", filename=" + file.getOriginalFilename());
            
            if (file.isEmpty()) {
                System.err.println("[StorageController] File is empty");
                return ResponseEntity.badRequest().body(error("File is required"));
            }

            StorageUploadResponse response = storageService.upload(category, file);
            System.out.println("[StorageController] Upload response: previewPath=" + response.getPreviewPath());
            return ResponseEntity.ok(success("File uploaded successfully", response));
        } catch (RuntimeException e) {
            System.err.println("[StorageController] RuntimeException on upload: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        } catch (Exception e) {
            System.err.println("[StorageController] Exception on upload: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error("Upload failed: " + e.getMessage()));
        }
    }

    @CrossOrigin(origins = "*", allowedHeaders = "*")
    @GetMapping("/preview/{category}")
    public ResponseEntity<byte[]> preview(@PathVariable String category, @RequestParam("path") String objectPath) {
        try {
            System.out.println("[StorageController] Preview request: category=" + category + ", path=" + objectPath);
            byte[] data = storageService.download(category, objectPath);
            String guessedContentType = URLConnection.guessContentTypeFromName(objectPath);
            MediaType mediaType = guessedContentType != null ? MediaType.parseMediaType(guessedContentType) : MediaType.APPLICATION_OCTET_STREAM;

            System.out.println("[StorageController] Download successful: " + objectPath + ", contentType=" + mediaType);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(mediaType);
            headers.setContentDisposition(ContentDisposition.inline().filename(objectPath).build());
            headers.add("Access-Control-Allow-Origin", "*");
            headers.add("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
            headers.add("Access-Control-Allow-Headers", "*");
            return new ResponseEntity<>(data, headers, HttpStatus.OK);
        } catch (RuntimeException e) {
            System.err.println("[StorageController] RuntimeException on preview: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (Exception e) {
            System.err.println("[StorageController] Exception on preview: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    private java.util.Map<String, Object> success(String message, Object data) {
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("data", data);
        return response;
    }

    private java.util.Map<String, Object> error(String message) {
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return response;
    }
}
