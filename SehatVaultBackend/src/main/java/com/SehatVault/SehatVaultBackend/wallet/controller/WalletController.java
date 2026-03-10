package com.SehatVault.SehatVaultBackend.wallet.controller;

import com.SehatVault.SehatVaultBackend.subscription.dto.ApiResponse;
import com.SehatVault.SehatVaultBackend.wallet.dto.WalletSummaryDto;
import com.SehatVault.SehatVaultBackend.wallet.dto.WalletTransactionDto;
import com.SehatVault.SehatVaultBackend.wallet.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/wallet")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    @GetMapping("/patient/{userId}/summary")
    public ResponseEntity<ApiResponse<WalletSummaryDto>> getWalletSummary(@PathVariable UUID userId) {
        return ResponseEntity.ok(ApiResponse.success(walletService.getWalletSummary(userId)));
    }

    @GetMapping("/patient/{userId}/transactions")
    public ResponseEntity<ApiResponse<List<WalletTransactionDto>>> getWalletTransactions(@PathVariable UUID userId) {
        return ResponseEntity.ok(ApiResponse.success(walletService.getWalletTransactions(userId)));
    }

    @GetMapping("/patient/{userId}/transactions/{tokenSymbol}")
    public ResponseEntity<ApiResponse<List<WalletTransactionDto>>> getWalletTransactionsByToken(
            @PathVariable UUID userId,
            @PathVariable String tokenSymbol
    ) {
        return ResponseEntity.ok(ApiResponse.success(walletService.getWalletTransactionsByToken(userId, tokenSymbol)));
    }
}
