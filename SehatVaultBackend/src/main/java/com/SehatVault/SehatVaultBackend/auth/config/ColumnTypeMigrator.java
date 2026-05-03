package com.SehatVault.SehatVaultBackend.auth.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * One-shot, idempotent column-type migrator. Hibernate's ddl-auto=update will add
 * new columns but never widens existing ones. The patient deposit + KYC flows now
 * upload base64 data URLs into columns that were originally VARCHAR(255), which
 * blows up with "value too long for type character varying(255)" on insert.
 *
 * Each ALTER TABLE here is wrapped in its own try/catch so a missing column or
 * already-TEXT column never blocks startup.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ColumnTypeMigrator {

    private final JdbcTemplate jdbcTemplate;

    private static final List<String> WIDEN_TO_TEXT = List.of(
            "ALTER TABLE asset_deposits ALTER COLUMN asset_receipt        TYPE TEXT",
            "ALTER TABLE asset_deposits ALTER COLUMN purity_certificate   TYPE TEXT",
            "ALTER TABLE asset_deposits ALTER COLUMN supporting_documents TYPE TEXT",
            "ALTER TABLE patients       ALTER COLUMN kyc_document_front   TYPE TEXT",
            "ALTER TABLE patients       ALTER COLUMN kyc_document_back    TYPE TEXT",
            "ALTER TABLE patients       ALTER COLUMN kyc_selfie           TYPE TEXT"
    );

    @EventListener(ApplicationReadyEvent.class)
    public void widenLargeColumns() {
        log.info("[ColumnTypeMigrator] Starting column-widening pass ({} statements)…", WIDEN_TO_TEXT.size());
        int widened = 0;
        int skipped = 0;
        for (String sql : WIDEN_TO_TEXT) {
            try {
                jdbcTemplate.execute(sql);
                log.info("[ColumnTypeMigrator] OK  {}", sql);
                widened++;
            } catch (Exception ex) {
                // If you see this WARN, run the SQL in src/main/resources/db/migration/widen-text-columns.sql
                // manually in Supabase. Most common cause: the JDBC user is not the table owner.
                log.warn("[ColumnTypeMigrator] FAIL {} → {}", sql, ex.getMessage());
                skipped++;
            }
        }
        log.info("[ColumnTypeMigrator] Done. widened={} skipped={}. If skipped > 0 and you still see"
                + " 'value too long for type character varying(255)' on insert, run the SQL in"
                + " src/main/resources/db/migration/widen-text-columns.sql manually.", widened, skipped);
    }
}
