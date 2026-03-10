package com.SehatVault.SehatVaultBackend.activity.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "transaction_id")
    private UUID transactionId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "token_id", nullable = false)
    private UUID tokenId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private TransactionType type;

    @Column(name = "amount", nullable = false)
    private BigDecimal amount;

    @Column(name = "description")
    private String description;

    @Column(name = "sender_wallet_address")
    private String senderWalletAddress;

    @Column(name = "receiver_wallet_address")
    private String receiverWalletAddress;

    @Column(name = "block_number")
    private Long blockNumber;

    @Column(name = "transaction_hash")
    private String transactionHash;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;

    public enum TransactionType {
        DEBIT,
        CREDIT
    }
}
