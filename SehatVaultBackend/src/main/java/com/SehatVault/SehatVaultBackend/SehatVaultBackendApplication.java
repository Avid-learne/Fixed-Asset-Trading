package com.SehatVault.SehatVaultBackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SehatVaultBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(SehatVaultBackendApplication.class, args);
	}

}
