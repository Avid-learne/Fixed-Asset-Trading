package com.SehatVault.SehatVaultBackend.auth.config;

import com.SehatVault.SehatVaultBackend.auth.entity.Role;
import com.SehatVault.SehatVaultBackend.auth.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("local")
@RequiredArgsConstructor
public class RoleDataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) {
        System.out.println("=== Starting Role Data Seeding ===");
        System.out.println("Current roles in database: " + roleRepository.count());
        
        for (Role.RoleType roleType : Role.RoleType.values()) {
            roleRepository.findByRoleName(roleType).orElseGet(() -> {
                System.out.println("Creating role: " + roleType);
                Role role = new Role();
                role.setRoleName(roleType);
                Role savedRole = roleRepository.save(role);
                System.out.println("Role saved: " + savedRole.getRoleName() + " with ID: " + savedRole.getRoleId());
                return savedRole;
            });
        }
        
        System.out.println("=== Role Data Seeding Complete ===");
        System.out.println("Final roles count: " + roleRepository.count());
        roleRepository.findAll().forEach(role -> 
            System.out.println("  - " + role.getRoleName())
        );
    }
}
