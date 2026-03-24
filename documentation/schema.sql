-- ============================================================
-- FIXED ASSET TRADING PLATFORM — SUPABASE SCHEMA
-- Based on ERD (Word Document) + SRS/SDS Context
-- ============================================================


-- =========================
-- ENUM TYPES
-- =========================

CREATE TYPE user_role AS ENUM ('patient', 'hospital_admin', 'hospital_staff', 'bank_staff', 'admin');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE kyc_status AS ENUM ('PENDING', 'IN_PROGRESS', 'APPROVED', 'REJECTED');
CREATE TYPE deposit_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE asset_type AS ENUM ('GOLD', 'SILVER', 'CASH', 'PROPERTY');
CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');
CREATE TYPE payment_status AS ENUM ('PENDING', 'SUCCESS', 'FAILED');
CREATE TYPE trade_type AS ENUM ('BUY', 'SELL');
CREATE TYPE trade_status AS ENUM ('ACTIVE', 'CLOSED', 'CANCELLED');
CREATE TYPE token_type AS ENUM ('AT', 'HT');
CREATE TYPE transaction_type AS ENUM ('DEBIT', 'CREDIT', 'AT_BURN', 'HT_MINT');
CREATE TYPE notification_status AS ENUM ('READ', 'UNREAD');
CREATE TYPE verification_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
CREATE TYPE policy_status AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');
CREATE TYPE activity_type AS ENUM ('LOGIN', 'LOGOUT', 'ACTION', 'ERROR');


-- =========================
-- ROLES
-- =========================

CREATE TABLE public.roles (
    role_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name user_role NOT NULL UNIQUE
);


-- =========================
-- USERS (overall)
-- =========================

CREATE TABLE public.users (
    user_id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id      uuid NOT NULL REFERENCES public.roles(role_id),
    name         varchar NOT NULL,
    email        varchar NOT NULL UNIQUE,
    password_hash text NOT NULL,
    phone_num    varchar,
    address      text,
    city         varchar,
    blood_group  varchar,
    date_of_birth date,
    mfa_enabled  boolean DEFAULT false,
    status       user_status DEFAULT 'ACTIVE',
    created_at   timestamptz DEFAULT now(),
    updated_at   timestamptz DEFAULT now()
);


-- =========================
-- SETTINGS (per user)
-- =========================

CREATE TABLE public.settings (
    setting_id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id               uuid NOT NULL UNIQUE REFERENCES public.users(user_id) ON DELETE CASCADE,
    multi_factor_enabled  boolean DEFAULT false,
    email_verified        boolean DEFAULT false,
    notification_enabled  boolean DEFAULT true
);


-- =========================
-- HOSPITAL
-- =========================

CREATE TABLE public.hospitals (
    h_id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_name       varchar NOT NULL,
    registration_num    varchar NOT NULL UNIQUE,
    address             text NOT NULL,
    contact_num         varchar NOT NULL,
    email               varchar NOT NULL UNIQUE,
    code                varchar,
    city                varchar,
    verification_status verification_status DEFAULT 'PENDING',
    total_assets        numeric DEFAULT 0,
    total_at            numeric DEFAULT 0,
    total_patients      integer DEFAULT 0,
    linked_bank_ids     uuid[],
    created_at          timestamptz DEFAULT now(),
    updated_at          timestamptz DEFAULT now()
);


-- =========================
-- BANK
-- =========================

CREATE TABLE public.banks (
    bank_id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_name           varchar NOT NULL,
    registration        varchar NOT NULL UNIQUE,
    swift_code          varchar,
    bank_code           varchar,
    address             text NOT NULL,
    email               varchar NOT NULL UNIQUE,
    contact_num         varchar NOT NULL,
    city                varchar,
    verification_status verification_status DEFAULT 'PENDING',
    linked_hospital_ids uuid[],
    created_at          timestamptz DEFAULT now(),
    updated_at          timestamptz DEFAULT now()
);


-- =========================
-- PARTNERSHIP (Hospital <-> Bank)
-- =========================

CREATE TABLE public.partnerships (
    partnership_id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_id              uuid NOT NULL REFERENCES public.banks(bank_id),
    hospital_id          uuid NOT NULL REFERENCES public.hospitals(h_id),
    partnership_started  date NOT NULL,
    assets_deposited_to_bank numeric DEFAULT 0,
    loans_taken_by_hospital  numeric DEFAULT 0,
    total_deposits       numeric DEFAULT 0,
    contact_person_id    uuid REFERENCES public.users(user_id),
    created_at           timestamptz DEFAULT now()
);


-- =========================
-- PATIENT
-- =========================

CREATE TABLE public.patients (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           uuid NOT NULL UNIQUE REFERENCES public.users(user_id) ON DELETE CASCADE,
    hospital_id       uuid REFERENCES public.hospitals(h_id),
    wallet_address    varchar,
    has_asset         boolean DEFAULT false,
    has_subscription  boolean DEFAULT false,
    kyc_status        kyc_status DEFAULT 'PENDING',
    registration_id   varchar UNIQUE,
    created_at        timestamptz DEFAULT now(),
    updated_at        timestamptz DEFAULT now()
);


-- =========================
-- KYC
-- =========================

CREATE TABLE public.kyc (
    kyc_id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id           uuid NOT NULL UNIQUE REFERENCES public.patients(id) ON DELETE CASCADE,
    completion_percentage integer DEFAULT 0,
    submitted_at         timestamptz,
    status               kyc_status DEFAULT 'PENDING',
    rejection_reason     text,
    updated_at           timestamptz DEFAULT now()
);


-- =========================
-- DOCUMENTS
-- =========================

CREATE TABLE public.documents (
    document_id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id       uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    document_type    varchar NOT NULL,
    file_url         text NOT NULL,
    uploaded_at      timestamptz DEFAULT now(),
    verified_at      timestamptz,
    rejection_reason text
);


-- =========================
-- TOKENS
-- =========================

CREATE TABLE public.tokens (
    token_id     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    token_name   varchar NOT NULL,
    token_symbol varchar NOT NULL UNIQUE,   -- 'AT' or 'HT'
    token_price  numeric                     -- NULL for HT (no monetary price)
);


-- =========================
-- ASSET DEPOSIT
-- =========================

CREATE TABLE public.asset_deposits (
    asset_id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id       uuid NOT NULL REFERENCES public.patients(id),
    bank_id          uuid NOT NULL REFERENCES public.banks(bank_id),
    asset_type       asset_type NOT NULL,
    asset_value      numeric NOT NULL,
    weight           numeric,               -- applicable for gold/silver (in grams)
    status           deposit_status DEFAULT 'PENDING',
    submitted_at     timestamptz DEFAULT now(),
    approved_at      timestamptz,
    rejected_at      timestamptz,
    rejection_reason text
);


-- =========================
-- ASSETS DEPOSITED TO BANK (physical vault record)
-- =========================

CREATE TABLE public.assets_deposited_to_bank (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_id     uuid NOT NULL REFERENCES public.banks(bank_id),
    hospital_id uuid NOT NULL REFERENCES public.hospitals(h_id),
    asset_id    uuid NOT NULL REFERENCES public.asset_deposits(asset_id),
    vault_num   varchar,
    created_at  timestamptz DEFAULT now()
);


-- =========================
-- PATIENT TOKEN BALANCE
-- =========================

CREATE TABLE public.patient_token_balances (
    balance_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id   uuid NOT NULL UNIQUE REFERENCES public.patients(id) ON DELETE CASCADE,
    total_at     numeric DEFAULT 0,
    total_ht     numeric DEFAULT 0,
    last_updated timestamptz DEFAULT now()
);


-- =========================
-- HOSPITAL AT POOL (aggregated by patient-asset)
-- =========================

CREATE TABLE public.hospital_at_pool_entries (
    pool_entry_id    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id      uuid NOT NULL REFERENCES public.hospitals(h_id),
    patient_id       uuid NOT NULL REFERENCES public.patients(id),
    asset_id         uuid NOT NULL REFERENCES public.asset_deposits(asset_id),
    total_at_added   numeric NOT NULL DEFAULT 0,
    available_at     numeric NOT NULL DEFAULT 0,
    total_at_burned  numeric NOT NULL DEFAULT 0,
    is_active        boolean NOT NULL DEFAULT true,
    created_at       timestamptz DEFAULT now(),
    updated_at       timestamptz DEFAULT now(),
    UNIQUE (hospital_id, patient_id, asset_id)
);


-- =========================
-- MINT RECORDS
-- =========================

CREATE TABLE public.mint_records (
    mint_id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id         uuid NOT NULL REFERENCES public.asset_deposits(asset_id),
    patient_id       uuid NOT NULL REFERENCES public.patients(id),   -- receiver
    minter_id        uuid NOT NULL REFERENCES public.users(user_id), -- hospital staff who minted
    tokens_minted    numeric NOT NULL,
    amount           numeric NOT NULL,
    status           varchar NOT NULL DEFAULT 'PENDING',
    block_number     bigint,
    transaction_hash varchar UNIQUE,
    timestamp        timestamptz DEFAULT now()
);


-- =========================
-- SUBSCRIPTION PLAN (defined by hospital)
-- =========================

CREATE TABLE public.subscription_plans (
    subs_id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id       uuid NOT NULL REFERENCES public.hospitals(h_id),
    subscription_name varchar NOT NULL,
    amount_per_month  numeric NOT NULL,
    features          text,
    is_active         boolean DEFAULT true,
    created_at        timestamptz DEFAULT now()
);


-- =========================
-- PATIENT SUBSCRIPTION
-- =========================

CREATE TABLE public.patient_subscriptions (
    subs_req_id     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id uuid NOT NULL REFERENCES public.subscription_plans(subs_id),
    patient_id      uuid NOT NULL REFERENCES public.patients(id),
    start_date      date NOT NULL,
    end_date        date NOT NULL,
    status          subscription_status DEFAULT 'ACTIVE',
    created_at      timestamptz DEFAULT now()
);


-- =========================
-- PAYMENT HISTORY (subscription payments)
-- =========================

CREATE TABLE public.payment_history (
    payment_id     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id     uuid NOT NULL REFERENCES public.patients(id),
    subs_id        uuid NOT NULL REFERENCES public.subscription_plans(subs_id),
    amount         numeric NOT NULL,                 -- in PKR
    payment_method varchar NOT NULL,
    status         payment_status DEFAULT 'PENDING',
    invoice_url    text,
    timestamp      timestamptz DEFAULT now()
);


-- =========================
-- CARDS
-- =========================

CREATE TABLE public.cards (
    card_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    card_name varchar NOT NULL UNIQUE   -- e.g. 'Subscription Card', 'Asset Health Card'
);


-- =========================
-- PATIENT CARD
-- =========================

CREATE TABLE public.patient_cards (
    patient_card_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id      uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    card_id         uuid NOT NULL REFERENCES public.cards(card_id),
    card_num        varchar NOT NULL UNIQUE,
    cvv             varchar NOT NULL,
    expiry_date     date NOT NULL,
    ht_balance      numeric DEFAULT 0
);


-- =========================
-- TRADES
-- =========================

CREATE TABLE public.trades (
    trade_id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id           uuid NOT NULL REFERENCES public.hospitals(h_id),

    trade_title           text NOT NULL,
    trade_description     text,

    amount_invested       numeric NOT NULL,                -- in PKR
    investment_description text,

    amount_before_trade   numeric NOT NULL,
    amount_after_trade    numeric,
    profit_loss           numeric,

    trade_type            trade_type NOT NULL,             -- BUY or SELL

    start_time            timestamptz NOT NULL,
    end_time              timestamptz,

    total_at_burnt        numeric DEFAULT 0,

    opening_price         numeric,
    closing_price         numeric,
    high                  numeric,
    low                   numeric,
    volume                numeric,

    status                trade_status DEFAULT 'ACTIVE',

    created_at            timestamptz DEFAULT now(),
    updated_at            timestamptz DEFAULT now()
);


-- =========================
-- PROFIT DISTRIBUTION (per hospital, per period)
-- =========================

CREATE TABLE public.profit_distributions (
    profit_distribution_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id            uuid NOT NULL REFERENCES public.hospitals(h_id),
    total_profit           numeric NOT NULL,     -- sum of all hospital trade PnL
    patients_percentage    numeric NOT NULL,     -- % allocated to patients
    hospital_operations    numeric NOT NULL,     -- bank loan repayments + fees
    hospital_earning       numeric NOT NULL,
    bank_loan_funds        numeric DEFAULT 0,
    created_at             timestamptz DEFAULT now()
);


-- =========================
-- PROFIT ALLOCATION (per patient, per distribution)
-- =========================

CREATE TABLE public.profit_allocations (
    profit_allocation_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    profit_distribution_id uuid NOT NULL REFERENCES public.profit_distributions(profit_distribution_id),
    patient_id             uuid NOT NULL REFERENCES public.patients(id),
    asset_id               uuid NOT NULL REFERENCES public.asset_deposits(asset_id),  -- profit based on deposited asset
    allocated_percentage   numeric NOT NULL,
    allocated_amount_ht    numeric NOT NULL,
    timestamp              timestamptz DEFAULT now()
);


-- =========================
-- BANK POLICIES
-- =========================

CREATE TABLE public.policies (
    policy_id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_id            uuid NOT NULL REFERENCES public.banks(bank_id),
    policy_name        varchar NOT NULL,
    policy_description text,
    policy_type        varchar NOT NULL,
    coverage           numeric,
    premium            numeric,
    start_date         date NOT NULL,
    end_date           date NOT NULL,
    renewal_date       date,
    status             policy_status DEFAULT 'ACTIVE',
    created_at         timestamptz DEFAULT now()
);


-- =========================
-- COMPLIANCE
-- =========================

CREATE TABLE public.compliance (
    compliance_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_id       uuid NOT NULL REFERENCES public.banks(bank_id),
    title         varchar NOT NULL,
    category      varchar NOT NULL,
    description   text,
    due_date      date,
    assigned_to   uuid REFERENCES public.hospitals(h_id),   -- assigned to a hospital
    created_at    timestamptz DEFAULT now()
);


-- =========================
-- TRANSACTIONS (overall — all token movements)
-- =========================

CREATE TABLE public.transactions (
    transaction_id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id               uuid NOT NULL REFERENCES public.users(user_id),
    token_id              uuid NOT NULL REFERENCES public.tokens(token_id),
    type                  transaction_type NOT NULL,
    amount                numeric NOT NULL,
    description           text,
    sender_wallet_address varchar,
    receiver_wallet_address varchar,
    block_number          bigint,
    transaction_hash      varchar UNIQUE,
    status                varchar NOT NULL DEFAULT 'PENDING',
    timestamp             timestamptz DEFAULT now()
);


-- =========================
-- NOTIFICATIONS
-- =========================

CREATE TABLE public.notifications (
    noti_id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id     uuid NOT NULL REFERENCES public.users(user_id),
    receiver_id   uuid NOT NULL REFERENCES public.users(user_id),
    notification_text text NOT NULL,
    status        notification_status DEFAULT 'UNREAD',
    timestamp     timestamptz DEFAULT now()
);


-- =========================
-- ACTIVITY LOG
-- =========================

CREATE TABLE public.activity (
    act_id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       uuid NOT NULL REFERENCES public.users(user_id),
    activity_name varchar NOT NULL,
    description   text,
    type          activity_type NOT NULL,
    status        varchar,
    ip_address    varchar,
    timestamp     timestamptz DEFAULT now()
);


-- =========================
-- ERRORS
-- =========================

CREATE TABLE public.errors (
    error_id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           uuid REFERENCES public.users(user_id),
    error_description text NOT NULL,
    status            varchar DEFAULT 'OPEN',
    created_at        timestamptz DEFAULT now()
);


-- =========================
-- REPORT GENERATION LOG
-- =========================

CREATE TABLE public.report_generation_log (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    generated_by uuid NOT NULL REFERENCES public.users(user_id),
    from_period  date NOT NULL,
    to_period    date NOT NULL,
    status       varchar NOT NULL DEFAULT 'PENDING',
    generated_at timestamptz DEFAULT now()
);


-- =========================
-- SEED: DEFAULT ROLES
-- =========================

INSERT INTO public.roles (role_name) VALUES
    ('patient'),
    ('hospital_admin'),
    ('hospital_staff'),
    ('bank_staff'),
    ('admin');

-- =========================
-- SEED: TOKEN TYPES
-- =========================

INSERT INTO public.tokens (token_name, token_symbol, token_price) VALUES
    ('Asset Token',  'AT', NULL),   -- price determined at deposit time
    ('Health Token', 'HT', NULL);   -- no monetary price
