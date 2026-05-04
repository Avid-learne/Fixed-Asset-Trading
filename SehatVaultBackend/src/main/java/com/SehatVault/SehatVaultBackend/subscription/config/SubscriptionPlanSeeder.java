package com.SehatVault.SehatVaultBackend.subscription.config;

import com.SehatVault.SehatVaultBackend.subscription.entity.SubscriptionPlan;
import com.SehatVault.SehatVaultBackend.subscription.repository.SubscriptionPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Seeds subscription plans in the database for testing
 * DISABLED - Remove @Component to prevent auto-seeding of mock data
 */
//@Component
@Profile("local")
@RequiredArgsConstructor
public class SubscriptionPlanSeeder implements CommandLineRunner {

    private final SubscriptionPlanRepository subscriptionPlanRepository;

    @Override
    public void run(String... args) throws Exception {
        // Check if plans already exist
        if (subscriptionPlanRepository.count() > 0) {
            System.out.println("Subscription plans already seeded. Skipping...");
            return;
        }

        System.out.println("Seeding subscription plans...");

        // Dummy hospital ID - you can change this later
        UUID hospitalId = UUID.randomUUID();

        // Basic Health Plan
        SubscriptionPlan basic = new SubscriptionPlan();
        basic.setHospitalId(hospitalId);
        basic.setSubscriptionName("Basic Health Plan");
        basic.setAmountPerMonth(new BigDecimal("50000"));
        basic.setFeatures("Access to basic health benefits|General checkup coverage|Basic dental care|Prescription discounts|100 HT monthly allocation");
        basic.setIsActive(true);
        subscriptionPlanRepository.save(basic);

        // Premium Health Plan
        SubscriptionPlan premium = new SubscriptionPlan();
        premium.setHospitalId(hospitalId);
        premium.setSubscriptionName("Premium Health Plan");
        premium.setAmountPerMonth(new BigDecimal("100000"));
        premium.setFeatures("All Basic plan benefits|Specialist consultations|Advanced dental procedures|Laboratory tests coverage|Emergency care priority|250 HT monthly allocation");
        premium.setIsActive(true);
        subscriptionPlanRepository.save(premium);

        // Family Health Plan
        SubscriptionPlan family = new SubscriptionPlan();
        family.setHospitalId(hospitalId);
        family.setSubscriptionName("Family Health Plan");
        family.setAmountPerMonth(new BigDecimal("300000"));
        family.setFeatures("All Premium plan benefits|Family coverage (up to 4 members)|Pediatric care|Maternity benefits|Annual health screening|500 HT monthly allocation");
        family.setIsActive(true);
        subscriptionPlanRepository.save(family);

        System.out.println("Subscription plans seeded successfully!");
    }
}
