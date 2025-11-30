package com.fixed_asset.patient_service.controller;

import com.fixed_asset.patient_service.dto.TokenBalanceDTO;
import com.fixed_asset.patient_service.dto.TokenTransactionDTO;
import com.fixed_asset.patient_service.service.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients/{patientId}/tokens")
public class TokenController {

    @Autowired
    private TokenService tokenService;

    @GetMapping("/balance")
    public ResponseEntity<TokenBalanceDTO> getTokenBalance(@PathVariable Long patientId) {
        TokenBalanceDTO balance = tokenService.getTokenBalance(patientId);
        return ResponseEntity.ok(balance);
    }

    @PostMapping("/asset/update")
    public ResponseEntity<String> updateAssetTokenBalance(
            @PathVariable Long patientId,
            @RequestParam Double amount) {
        
        boolean success = tokenService.updateAssetTokenBalance(patientId, amount);
        if (success) {
            return ResponseEntity.ok("Asset token balance updated successfully");
        } else {
            return ResponseEntity.badRequest().body("Failed to update asset token balance");
        }
    }

    @PostMapping("/health/update")
    public ResponseEntity<String> updateHealthTokenBalance(
            @PathVariable Long patientId,
            @RequestParam Double amount) {
        
        boolean success = tokenService.updateHealthTokenBalance(patientId, amount);
        if (success) {
            return ResponseEntity.ok("Health token balance updated successfully");
        } else {
            return ResponseEntity.badRequest().body("Failed to update health token balance");
        }
    }

    @PostMapping("/transfer")
    public ResponseEntity<String> transferAssetTokens(
            @PathVariable Long patientId,
            @RequestParam Long toPatientId,
            @RequestParam Double amount) {
        
        boolean success = tokenService.transferAssetTokens(patientId, toPatientId, amount);
        if (success) {
            return ResponseEntity.ok("Tokens transferred successfully");
        } else {
            return ResponseEntity.badRequest().body("Failed to transfer tokens");
        }
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<TokenTransactionDTO>> getTokenTransactions(@PathVariable Long patientId) {
        List<TokenTransactionDTO> transactions = tokenService.getTokenTransactions(patientId);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/transactions/{tokenType}")
    public ResponseEntity<List<TokenTransactionDTO>> getTokenTransactionsByType(
            @PathVariable Long patientId,
            @PathVariable String tokenType) {
        
        List<TokenTransactionDTO> transactions = tokenService.getTokenTransactionsByType(patientId, tokenType.toUpperCase());
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/total-minted/{tokenType}")
    public ResponseEntity<Double> getTotalMintedTokens(
            @PathVariable Long patientId,
            @PathVariable String tokenType) {
        
        Double totalMinted = tokenService.getTotalMintedTokens(patientId, tokenType.toUpperCase());
        return ResponseEntity.ok(totalMinted);
    }
}