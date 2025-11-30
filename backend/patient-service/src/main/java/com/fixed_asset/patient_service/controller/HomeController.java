package com.fixed_asset.patient_service.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {
    
    @GetMapping("/")
    public String home() {
        return "Patient Service is running successfully!";
    }
    
    @GetMapping("/health")
    public String health() {
        return "Service Status: UP";
    }
    
    @GetMapping("/api/patients/test")
    public String test() {
        return "Patient API is working!";
    }
}