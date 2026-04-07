package com.SehatVault.SehatVaultBackend.notification.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class SendNotificationRequest {

    private String title;
    private String message;

    // ALL_USERS | ROLE | HOSPITAL | BANK_HOSPITALS | USER
    private String targetType;

    // required when targetType=ROLE
    private String targetRole;

    // required when targetType=HOSPITAL or BANK_HOSPITALS (specific hospital)
    private UUID hospitalId;

    // required when targetType=USER
    private UUID receiverUserId;
}
