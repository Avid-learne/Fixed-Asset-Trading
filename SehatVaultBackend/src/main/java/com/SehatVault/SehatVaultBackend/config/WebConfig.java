package com.SehatVault.SehatVaultBackend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${sehatvault.uploads.dir:uploads}")
    private String uploadsDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve files from the configured uploads directory at /uploads/** and /files/**
        String location = "file:" + uploadsDir + "/";
        registry.addResourceHandler("/uploads/**").addResourceLocations(location);
        registry.addResourceHandler("/files/**").addResourceLocations(location);
        // Also map top-level filenames (e.g. /cnic.png) to the uploads directory for backwards compatibility
        registry.addResourceHandler("/*.*").addResourceLocations(location);
    }
}
