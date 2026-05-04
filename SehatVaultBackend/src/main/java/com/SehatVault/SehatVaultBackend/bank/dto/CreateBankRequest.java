package com.SehatVault.SehatVaultBackend.bank.dto;

import lombok.Data;

@Data
public class CreateBankRequest {
    private String name;
    private String swiftCode;
    private String address;
    private String city;
    private String phone;
    private String email;
    private String registration;
    private String bankCode;
}
