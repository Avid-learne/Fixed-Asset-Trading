package com.SehatVault.SehatVaultBackend.activity.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class SendNotificationRequest {

    private String title;
    private String message;

    // ALL_USERS | ROLE | HOSPITAL | USER
    private String targetType;

    // required when targetType=ROLE
    private String targetRole;

    // required when targetType=HOSPITAL
    private UUID hospitalId;

    // required when targetType=USER
    private UUID receiverUserId;
}
