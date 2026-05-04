-- This script will clean the database by deleting all user and transactional data.
-- It will NOT delete the 'cards', 'roles', 'tokens', 'subscription_plans', and 'document_requirements' tables.
-- This version uses individual DELETE statements in the correct order to avoid foreign key violations and timeouts.

-- Start a transaction block
BEGIN;

-- Delete from tables with foreign keys first, moving up the dependency chain.
-- Order is critical to avoid foreign key constraint violations.

-- Level 1: Tables with the most dependencies, referencing other transactional tables.
DELETE FROM public.bank_custody_verifications;
DELETE FROM public.monthly_ht_distributions;
DELETE FROM public.patient_at_withdrawal_requests;
DELETE FROM public.trade_at_settlements;
DELETE FROM public.profit_allocations;
DELETE FROM public.fractional_ht_allocations;
DELETE FROM public.fractionalization_beneficiaries;
DELETE FROM public.submitted_documents;

-- Level 2: Tables referencing trades, patients, assets, etc.
DELETE FROM public.trade_participations;
DELETE FROM public.mint_records;
DELETE FROM public.patient_at_assignments;
DELETE FROM public.payment_history;
DELETE FROM public.patient_subscriptions;
DELETE FROM public.assets_deposited_to_bank;
DELETE FROM public.emergency_redemption_requests;
DELETE FROM public.fractionalization_requests;
DELETE FROM public.noc_certificates;

-- Level 3: Tables referencing patients, hospitals, banks
DELETE FROM public.asset_deposits;
DELETE FROM public.documents;
DELETE FROM public.health_cards;
DELETE FROM public.kyc;
DELETE FROM public.patient_cards;
DELETE FROM public.patient_token_balances;
DELETE FROM public.trades;
DELETE FROM public.profit_distributions;
DELETE FROM public.partnerships;
DELETE FROM public.compliance;
DELETE FROM public.policies;
DELETE FROM public.hospital_at_pool_entries;

-- Level 4: Tables referencing users
DELETE FROM public.activity;
DELETE FROM public.errors;
DELETE FROM public.hospital_staff;
DELETE FROM public.notifications;
DELETE FROM public.report_generation_log;
DELETE FROM public.settings;
DELETE FROM public.transactions;
DELETE FROM public.patients; -- References users and hospitals

-- Level 5: Core entities (referenced by the above tables)
DELETE FROM public.banks;
DELETE FROM public.insurance_companies;
DELETE FROM public.users;

-- Commit the transaction
COMMIT;

-- The 'cards', 'roles', 'tokens', 'subscription_plans', and 'document_requirements' tables are intentionally left untouched.

SELECT 'Database has been cleaned using DELETE statements. User and transactional data removed.' AS status;
