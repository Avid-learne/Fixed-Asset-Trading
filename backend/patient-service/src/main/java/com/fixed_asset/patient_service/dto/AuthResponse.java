package com.fixed_asset.patient_service.dto;

public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private Long patientId;
    private String email;
    private String name;
    private String message;

    // Constructors
    public AuthResponse() {}

    public AuthResponse(String token, Long patientId, String email, String name, String message) {
        this.token = token;
        this.patientId = patientId;
        this.email = email;
        this.name = name;
        this.message = message;
    }

    // Getters and Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}