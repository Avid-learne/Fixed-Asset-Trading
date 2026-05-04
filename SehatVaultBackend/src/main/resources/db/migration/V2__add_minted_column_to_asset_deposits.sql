-- Add minted flag to asset_deposits to prevent double-minting
-- Safe: only adds column with default false for existing rows
ALTER TABLE asset_deposits
    ADD COLUMN IF NOT EXISTS minted boolean NOT NULL DEFAULT false;

-- Optional: create index to speed queries that filter for not-yet-minted deposits
CREATE INDEX IF NOT EXISTS idx_asset_deposits_minted ON asset_deposits(minted);
