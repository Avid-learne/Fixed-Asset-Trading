-- Run this once in the Supabase SQL Editor (or psql) when the auto-migrator
-- in ColumnTypeMigrator.java logs "FAIL ... → permission denied" or similar.
--
-- Patient deposit + KYC flows now upload base64 data URLs, which exceed the
-- legacy VARCHAR(255). Widening to TEXT lets the inserts succeed.
--
-- Safe to re-run; ALTER COLUMN ... TYPE TEXT is a no-op when the column is
-- already TEXT.

ALTER TABLE asset_deposits ALTER COLUMN asset_receipt        TYPE TEXT;
ALTER TABLE asset_deposits ALTER COLUMN purity_certificate   TYPE TEXT;
ALTER TABLE asset_deposits ALTER COLUMN supporting_documents TYPE TEXT;

ALTER TABLE patients ALTER COLUMN kyc_document_front TYPE TEXT;
ALTER TABLE patients ALTER COLUMN kyc_document_back  TYPE TEXT;
ALTER TABLE patients ALTER COLUMN kyc_selfie         TYPE TEXT;
