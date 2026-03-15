package com.SehatVault.SehatVaultBackend.wallet.repository;

import com.SehatVault.SehatVaultBackend.activity.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface WalletTransactionRepository extends JpaRepository<Transaction, UUID> {

    @Query(value = "SELECT token_id FROM tokens WHERE UPPER(token_symbol) = UPPER(:tokenSymbol) LIMIT 1", nativeQuery = true)
    UUID findTokenIdBySymbol(String tokenSymbol);

    @Query(value = """
            SELECT
                t.transaction_id AS transactionId,
                tk.token_symbol AS tokenSymbol,
                t.type AS transactionType,
                t.amount AS amount,
                t.description AS description,
                t.sender_wallet_address AS senderWalletAddress,
                t.receiver_wallet_address AS receiverWalletAddress,
                t.block_number AS blockNumber,
                t.transaction_hash AS transactionHash,
                t.status AS status,
                t.timestamp AS timestamp
            FROM transactions t
            JOIN tokens tk ON tk.token_id = t.token_id
            WHERE t.user_id = :userId
            ORDER BY t.timestamp DESC
            LIMIT 200
            """, nativeQuery = true)
    List<WalletTransactionRow> findRecentByUserId(UUID userId);

    @Query(value = """
            SELECT
                t.transaction_id AS transactionId,
                tk.token_symbol AS tokenSymbol,
                t.type AS transactionType,
                t.amount AS amount,
                t.description AS description,
                t.sender_wallet_address AS senderWalletAddress,
                t.receiver_wallet_address AS receiverWalletAddress,
                t.block_number AS blockNumber,
                t.transaction_hash AS transactionHash,
                t.status AS status,
                t.timestamp AS timestamp
            FROM transactions t
            JOIN tokens tk ON tk.token_id = t.token_id
            WHERE t.user_id = :userId
              AND UPPER(tk.token_symbol) = UPPER(:tokenSymbol)
            ORDER BY t.timestamp DESC
            LIMIT 200
            """, nativeQuery = true)
    List<WalletTransactionRow> findRecentByUserIdAndTokenSymbol(UUID userId, String tokenSymbol);

    interface WalletTransactionRow {
        UUID getTransactionId();
        String getTokenSymbol();
        String getTransactionType();
        BigDecimal getAmount();
        String getDescription();
        String getSenderWalletAddress();
        String getReceiverWalletAddress();
        Long getBlockNumber();
        String getTransactionHash();
        String getStatus();
        LocalDateTime getTimestamp();
    }
}
