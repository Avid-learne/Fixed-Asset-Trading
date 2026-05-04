package com.SehatVault.SehatVaultBackend.notification.entity;

public enum NotificationType {
    // Asset Deposit
    ASSET_DEPOSIT_SUBMITTED("/asset-deposit"),
    ASSET_DEPOSIT_APPROVED("/asset-deposit"),
    ASSET_DEPOSIT_REJECTED("/asset-deposit"),
    ASSET_DEPOSIT_CUSTODY_CONFIRMED("/asset-deposit"),
    ASSET_DEPOSIT_TOKENS_MINTED("/asset-deposit"),
    ASSET_DEPOSIT_POOL_MOVED("/asset-deposit"),
    
    // Fractionalization
    FRACTIONALIZATION_FORWARDED("/fractionalization"),
    FRACTIONALIZATION_NOC_APPROVED("/fractionalization"),
    FRACTIONALIZATION_REJECTED("/fractionalization"),
    FRACTIONALIZATION_ALLOCATION_ACTIVE("/fractionalization"),
    FRACTIONALIZATION_MONTHLY_PROCESS("/fractionalization"),
    FRACTIONALIZATION_BENEFICIARY_ALLOCATION("/fractionalization"),
    
    // Subscription
    SUBSCRIPTION_ACTIVATED("/subscription"),
    SUBSCRIPTION_PLAN_CHANGED("/subscription"),
    SUBSCRIPTION_RENEWED("/subscription"),
    SUBSCRIPTION_CANCELLED("/subscription"),
    
    // Emergency Redemption
    EMERGENCY_REDEMPTION_SUBMITTED("/emergency-redemption"),
    EMERGENCY_REDEMPTION_APPROVED("/emergency-redemption"),
    EMERGENCY_REDEMPTION_REJECTED("/emergency-redemption"),
    
    // Health Card
    HEALTH_CARD_ISSUED("/health-card"),
    HEALTH_CARD_ACTIVATED("/health-card"),
    
    // Marketplace
    MARKETPLACE_PURCHASE_COMPLETED("/marketplace"),
    MARKETPLACE_SALE_COMPLETED("/marketplace"),
    
    // Account
    KYC_STATUS_UPDATED("/profile"),
    ACCOUNT_SECURITY_ALERT("/profile"),
    
    // General
    GENERAL("/dashboard");
    
    private final String navigationUrl;
    
    NotificationType(String navigationUrl) {
        this.navigationUrl = navigationUrl;
    }
    
    public String getNavigationUrl() {
        return navigationUrl;
    }
}
