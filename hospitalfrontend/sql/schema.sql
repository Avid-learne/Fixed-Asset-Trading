-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.activity (
  act_id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  activity_name character varying NOT NULL,
  description character varying,
  type character varying NOT NULL,
  status character varying,
  ip_address character varying,
  timestamp timestamp with time zone DEFAULT now(),
  CONSTRAINT activity_pkey PRIMARY KEY (act_id),
  CONSTRAINT activity_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.asset_deposits (
  asset_id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  bank_id uuid NOT NULL,
  asset_type character varying NOT NULL,
  asset_value numeric NOT NULL,
  weight numeric,
  status character varying DEFAULT 'PENDING'::deposit_status,
  submitted_at timestamp with time zone DEFAULT now(),
  approved_at timestamp with time zone,
  rejected_at timestamp with time zone,
  rejection_reason character varying,
  bank_approval_status character varying,
  bank_approved_at timestamp without time zone,
  bank_rejected_at timestamp without time zone,
  bank_rejection_reason character varying,
  CONSTRAINT asset_deposits_pkey PRIMARY KEY (asset_id),
  CONSTRAINT asset_deposits_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id),
  CONSTRAINT asset_deposits_bank_id_fkey FOREIGN KEY (bank_id) REFERENCES public.banks(bank_id)
);
CREATE TABLE public.assets_deposited_to_bank (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  bank_id uuid NOT NULL,
  hospital_id uuid NOT NULL,
  asset_id uuid NOT NULL,
  vault_num character varying,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT assets_deposited_to_bank_pkey PRIMARY KEY (id),
  CONSTRAINT assets_deposited_to_bank_bank_id_fkey FOREIGN KEY (bank_id) REFERENCES public.banks(bank_id),
  CONSTRAINT assets_deposited_to_bank_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(h_id),
  CONSTRAINT assets_deposited_to_bank_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.asset_deposits(asset_id)
);
CREATE TABLE public.banks (
  bank_id uuid NOT NULL DEFAULT gen_random_uuid(),
  bank_name character varying NOT NULL,
  registration character varying NOT NULL UNIQUE,
  swift_code character varying,
  bank_code character varying,
  address character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  contact_num character varying NOT NULL,
  city character varying,
  verification_status character varying DEFAULT 'PENDING'::verification_status,
  linked_hospital_ids ARRAY,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT banks_pkey PRIMARY KEY (bank_id)
);
CREATE TABLE public.cards (
  card_id uuid NOT NULL DEFAULT gen_random_uuid(),
  card_name character varying NOT NULL UNIQUE,
  CONSTRAINT cards_pkey PRIMARY KEY (card_id)
);
CREATE TABLE public.compliance (
  compliance_id uuid NOT NULL DEFAULT gen_random_uuid(),
  bank_id uuid NOT NULL,
  title character varying NOT NULL,
  category character varying NOT NULL,
  description text,
  due_date date,
  assigned_to uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT compliance_pkey PRIMARY KEY (compliance_id),
  CONSTRAINT compliance_bank_id_fkey FOREIGN KEY (bank_id) REFERENCES public.banks(bank_id),
  CONSTRAINT compliance_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.hospitals(h_id)
);
CREATE TABLE public.documents (
  document_id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  document_type character varying NOT NULL,
  file_url text NOT NULL,
  uploaded_at timestamp with time zone DEFAULT now(),
  verified_at timestamp with time zone,
  rejection_reason text,
  CONSTRAINT documents_pkey PRIMARY KEY (document_id),
  CONSTRAINT documents_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id)
);
CREATE TABLE public.errors (
  error_id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  error_description text NOT NULL,
  status character varying DEFAULT 'OPEN'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT errors_pkey PRIMARY KEY (error_id),
  CONSTRAINT errors_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.health_cards (
  card_id uuid NOT NULL,
  asset_value numeric,
  card_number character varying NOT NULL UNIQUE,
  card_type character varying NOT NULL CHECK (card_type::text = ANY (ARRAY['SUBSCRIPTION'::character varying, 'ASSET'::character varying]::text[])),
  created_at timestamp without time zone NOT NULL,
  cvv character varying NOT NULL,
  holder_name character varying NOT NULL,
  ht_balance numeric NOT NULL,
  issue_date date NOT NULL,
  patient_id uuid NOT NULL,
  plan_name character varying,
  security_key character varying NOT NULL,
  status character varying NOT NULL CHECK (status::text = ANY (ARRAY['ACTIVE'::character varying, 'EXPIRED'::character varying, 'SUSPENDED'::character varying, 'CANCELLED'::character varying]::text[])),
  subscription_id uuid,
  updated_at timestamp without time zone,
  valid_until date,
  CONSTRAINT health_cards_pkey PRIMARY KEY (card_id)
);
CREATE TABLE public.hospital_at_pool_entries (
  pool_entry_id uuid NOT NULL,
  is_active boolean NOT NULL,
  asset_id uuid NOT NULL,
  available_at numeric NOT NULL,
  created_at timestamp without time zone NOT NULL,
  hospital_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  total_at_added numeric NOT NULL,
  total_at_burned numeric NOT NULL,
  updated_at timestamp without time zone NOT NULL,
  pool_type character varying NOT NULL DEFAULT 'ASSET'::character varying,
  CONSTRAINT hospital_at_pool_entries_pkey PRIMARY KEY (pool_entry_id)
);
CREATE TABLE public.hospital_staff (
  id uuid NOT NULL,
  created_at timestamp without time zone,
  department character varying,
  employee_id character varying NOT NULL UNIQUE,
  position character varying,
  updated_at timestamp without time zone,
  hospital_id uuid NOT NULL,
  user_id uuid NOT NULL,
  CONSTRAINT hospital_staff_pkey PRIMARY KEY (id),
  CONSTRAINT fkem0dmm0rc8fs0s4ddyxu3phxs FOREIGN KEY (hospital_id) REFERENCES public.hospitals(h_id),
  CONSTRAINT fka3lpw4i2xg4kmhb4f498ymbx5 FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.hospitals (
  h_id uuid NOT NULL DEFAULT gen_random_uuid(),
  hospital_name character varying NOT NULL,
  registration_num character varying NOT NULL UNIQUE,
  address character varying NOT NULL,
  contact_num character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  code character varying,
  city character varying,
  verification_status character varying DEFAULT 'PENDING'::verification_status,
  total_assets double precision DEFAULT 0,
  total_at double precision DEFAULT 0,
  total_patients integer DEFAULT 0,
  linked_bank_ids ARRAY,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT hospitals_pkey PRIMARY KEY (h_id)
);
CREATE TABLE public.kyc (
  kyc_id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL UNIQUE,
  completion_percentage integer DEFAULT 0,
  submitted_at timestamp with time zone,
  status USER-DEFINED DEFAULT 'PENDING'::kyc_status,
  rejection_reason text,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT kyc_pkey PRIMARY KEY (kyc_id),
  CONSTRAINT kyc_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id)
);
CREATE TABLE public.mint_records (
  mint_id uuid NOT NULL DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  minter_id uuid NOT NULL,
  tokens_minted numeric NOT NULL,
  amount numeric NOT NULL,
  status character varying NOT NULL DEFAULT 'PENDING'::character varying,
  block_number bigint,
  transaction_hash character varying UNIQUE,
  timestamp timestamp with time zone DEFAULT now(),
  CONSTRAINT mint_records_pkey PRIMARY KEY (mint_id),
  CONSTRAINT mint_records_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.asset_deposits(asset_id),
  CONSTRAINT mint_records_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id),
  CONSTRAINT mint_records_minter_id_fkey FOREIGN KEY (minter_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.monthly_ht_distributions (
  distribution_id uuid NOT NULL DEFAULT gen_random_uuid(),
  trade_id uuid NOT NULL,
  participation_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  distribution_month date NOT NULL,
  at_percentage_rate numeric NOT NULL DEFAULT 5,
  at_amount_base numeric NOT NULL,
  calculated_ht_amount numeric NOT NULL,
  is_distributed boolean DEFAULT false,
  distributed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT monthly_ht_distributions_pkey PRIMARY KEY (distribution_id),
  CONSTRAINT monthly_ht_distributions_trade_id_fkey FOREIGN KEY (trade_id) REFERENCES public.trades(trade_id),
  CONSTRAINT monthly_ht_distributions_participation_id_fkey FOREIGN KEY (participation_id) REFERENCES public.trade_participations(participation_id),
  CONSTRAINT monthly_ht_distributions_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id)
);
CREATE TABLE public.notifications (
  noti_id uuid NOT NULL DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  notification_text character varying NOT NULL,
  status character varying DEFAULT 'UNREAD'::notification_status,
  timestamp timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (noti_id),
  CONSTRAINT notifications_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(user_id),
  CONSTRAINT notifications_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.partnerships (
  partnership_id uuid NOT NULL DEFAULT gen_random_uuid(),
  bank_id uuid NOT NULL,
  hospital_id uuid NOT NULL,
  partnership_started date NOT NULL,
  assets_deposited_to_bank numeric DEFAULT 0,
  loans_taken_by_hospital numeric DEFAULT 0,
  total_deposits numeric DEFAULT 0,
  contact_person_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  integration_status character varying CHECK (integration_status::text = ANY (ARRAY['PENDING'::character varying, 'APPROVED'::character varying, 'REJECTED'::character varying]::text[])),
  rejection_reason character varying,
  reviewed_at timestamp without time zone,
  CONSTRAINT partnerships_pkey PRIMARY KEY (partnership_id),
  CONSTRAINT partnerships_bank_id_fkey FOREIGN KEY (bank_id) REFERENCES public.banks(bank_id),
  CONSTRAINT partnerships_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(h_id),
  CONSTRAINT partnerships_contact_person_id_fkey FOREIGN KEY (contact_person_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.patient_at_assignments (
  assignment_id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  asset_id uuid NOT NULL,
  hospital_id uuid NOT NULL,
  total_at_assigned numeric NOT NULL DEFAULT 0,
  available_at numeric NOT NULL DEFAULT 0,
  unavailable_at numeric NOT NULL DEFAULT 0,
  availability_status USER-DEFINED DEFAULT 'AVAILABLE'::at_availability_status,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT patient_at_assignments_pkey PRIMARY KEY (assignment_id),
  CONSTRAINT patient_at_assignments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id),
  CONSTRAINT patient_at_assignments_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.asset_deposits(asset_id),
  CONSTRAINT patient_at_assignments_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(h_id)
);
CREATE TABLE public.patient_at_withdrawal_requests (
  request_id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  asset_id uuid NOT NULL,
  trade_id uuid NOT NULL,
  assignment_id uuid NOT NULL,
  requested_at timestamp with time zone DEFAULT now(),
  reason text,
  request_status USER-DEFINED DEFAULT 'PENDING'::withdrawal_request_status,
  trade_remaining_time_days integer,
  notified_at timestamp with time zone,
  approved_at timestamp with time zone,
  retrieved_at timestamp with time zone,
  hospital_notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT patient_at_withdrawal_requests_pkey PRIMARY KEY (request_id),
  CONSTRAINT patient_at_withdrawal_requests_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id),
  CONSTRAINT patient_at_withdrawal_requests_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.asset_deposits(asset_id),
  CONSTRAINT patient_at_withdrawal_requests_trade_id_fkey FOREIGN KEY (trade_id) REFERENCES public.trades(trade_id),
  CONSTRAINT patient_at_withdrawal_requests_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.patient_at_assignments(assignment_id)
);
CREATE TABLE public.patient_cards (
  patient_card_id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  card_id uuid NOT NULL,
  card_num character varying NOT NULL UNIQUE,
  cvv character varying NOT NULL,
  expiry_date date NOT NULL,
  ht_balance numeric DEFAULT 0,
  CONSTRAINT patient_cards_pkey PRIMARY KEY (patient_card_id),
  CONSTRAINT patient_cards_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id),
  CONSTRAINT patient_cards_card_id_fkey FOREIGN KEY (card_id) REFERENCES public.cards(card_id)
);
CREATE TABLE public.patient_subscriptions (
  subs_req_id uuid NOT NULL DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status character varying DEFAULT 'ACTIVE'::subscription_status,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT patient_subscriptions_pkey PRIMARY KEY (subs_req_id),
  CONSTRAINT patient_subscriptions_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.subscription_plans(subs_id),
  CONSTRAINT patient_subscriptions_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id)
);
CREATE TABLE public.patient_token_balances (
  balance_id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL UNIQUE,
  total_at numeric DEFAULT 0,
  total_ht numeric DEFAULT 0,
  last_updated timestamp with time zone DEFAULT now(),
  CONSTRAINT patient_token_balances_pkey PRIMARY KEY (balance_id),
  CONSTRAINT patient_token_balances_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id)
);
CREATE TABLE public.patients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  hospital_id uuid,
  wallet_address character varying,
  has_asset boolean DEFAULT false,
  has_subscription boolean DEFAULT false,
  kyc_status character varying DEFAULT 'PENDING'::kyc_status,
  registration_id character varying UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  bio text,
  CONSTRAINT patients_pkey PRIMARY KEY (id),
  CONSTRAINT patients_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id),
  CONSTRAINT patients_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(h_id)
);
CREATE TABLE public.payment_history (
  payment_id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  subs_id uuid NOT NULL,
  amount numeric NOT NULL,
  payment_method character varying NOT NULL,
  status character varying DEFAULT 'PENDING'::payment_status,
  invoice_url text,
  timestamp timestamp with time zone DEFAULT now(),
  CONSTRAINT payment_history_pkey PRIMARY KEY (payment_id),
  CONSTRAINT payment_history_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id),
  CONSTRAINT payment_history_subs_id_fkey FOREIGN KEY (subs_id) REFERENCES public.subscription_plans(subs_id)
);
CREATE TABLE public.policies (
  policy_id uuid NOT NULL DEFAULT gen_random_uuid(),
  bank_id uuid NOT NULL,
  policy_name character varying NOT NULL,
  policy_description text,
  policy_type character varying NOT NULL,
  coverage numeric,
  premium numeric,
  start_date date NOT NULL,
  end_date date NOT NULL,
  renewal_date date,
  status USER-DEFINED DEFAULT 'ACTIVE'::policy_status,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT policies_pkey PRIMARY KEY (policy_id),
  CONSTRAINT policies_bank_id_fkey FOREIGN KEY (bank_id) REFERENCES public.banks(bank_id)
);
CREATE TABLE public.profit_allocations (
  profit_allocation_id uuid NOT NULL DEFAULT gen_random_uuid(),
  profit_distribution_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  asset_id uuid NOT NULL,
  allocated_percentage numeric NOT NULL,
  allocated_amount_ht numeric NOT NULL,
  timestamp timestamp with time zone DEFAULT now(),
  CONSTRAINT profit_allocations_pkey PRIMARY KEY (profit_allocation_id),
  CONSTRAINT profit_allocations_profit_distribution_id_fkey FOREIGN KEY (profit_distribution_id) REFERENCES public.profit_distributions(profit_distribution_id),
  CONSTRAINT profit_allocations_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id),
  CONSTRAINT profit_allocations_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.asset_deposits(asset_id)
);
CREATE TABLE public.profit_distributions (
  profit_distribution_id uuid NOT NULL DEFAULT gen_random_uuid(),
  hospital_id uuid NOT NULL,
  total_profit numeric NOT NULL,
  patients_percentage numeric NOT NULL,
  hospital_operations numeric NOT NULL,
  hospital_earning numeric NOT NULL,
  bank_loan_funds numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profit_distributions_pkey PRIMARY KEY (profit_distribution_id),
  CONSTRAINT profit_distributions_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(h_id)
);
CREATE TABLE public.report_generation_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  generated_by uuid NOT NULL,
  from_period date NOT NULL,
  to_period date NOT NULL,
  status character varying NOT NULL DEFAULT 'PENDING'::character varying,
  generated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT report_generation_log_pkey PRIMARY KEY (id),
  CONSTRAINT report_generation_log_generated_by_fkey FOREIGN KEY (generated_by) REFERENCES public.users(user_id)
);
CREATE TABLE public.roles (
  role_id uuid NOT NULL DEFAULT gen_random_uuid(),
  role_name character varying NOT NULL UNIQUE,
  CONSTRAINT roles_pkey PRIMARY KEY (role_id)
);
CREATE TABLE public.settings (
  setting_id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  multi_factor_enabled boolean DEFAULT false,
  email_verified boolean DEFAULT false,
  notification_enabled boolean DEFAULT true,
  CONSTRAINT settings_pkey PRIMARY KEY (setting_id),
  CONSTRAINT settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.subscription_plans (
  subs_id uuid NOT NULL DEFAULT gen_random_uuid(),
  hospital_id uuid NOT NULL,
  subscription_name character varying NOT NULL,
  amount_per_month numeric NOT NULL,
  features text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT subscription_plans_pkey PRIMARY KEY (subs_id),
  CONSTRAINT subscription_plans_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(h_id)
);
CREATE TABLE public.tokens (
  token_id uuid NOT NULL DEFAULT gen_random_uuid(),
  token_name character varying NOT NULL,
  token_symbol character varying NOT NULL UNIQUE,
  token_price numeric,
  CONSTRAINT tokens_pkey PRIMARY KEY (token_id)
);
CREATE TABLE public.trade_at_settlements (
  settlement_id uuid NOT NULL DEFAULT gen_random_uuid(),
  trade_id uuid NOT NULL UNIQUE,
  participation_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  original_at_allocated numeric NOT NULL,
  trade_profit_loss numeric NOT NULL,
  at_returned_available numeric NOT NULL,
  profit_percentage numeric NOT NULL,
  profit_ht_issued numeric NOT NULL,
  total_monthly_ht_issued numeric NOT NULL DEFAULT 0,
  trade_end_time timestamp with time zone NOT NULL,
  settled_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT trade_at_settlements_pkey PRIMARY KEY (settlement_id),
  CONSTRAINT trade_at_settlements_trade_id_fkey FOREIGN KEY (trade_id) REFERENCES public.trades(trade_id),
  CONSTRAINT trade_at_settlements_participation_id_fkey FOREIGN KEY (participation_id) REFERENCES public.trade_participations(participation_id),
  CONSTRAINT trade_at_settlements_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id)
);
CREATE TABLE public.trade_participations (
  participation_id uuid NOT NULL DEFAULT gen_random_uuid(),
  trade_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  asset_id uuid NOT NULL,
  assignment_id uuid NOT NULL,
  at_allocated numeric NOT NULL,
  at_monetary_value_pkr numeric NOT NULL,
  participation_status USER-DEFINED DEFAULT 'ACTIVE'::trade_participation_status,
  trade_start_time timestamp with time zone NOT NULL,
  trade_end_time timestamp with time zone,
  marked_unavailable_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT trade_participations_pkey PRIMARY KEY (participation_id),
  CONSTRAINT trade_participations_trade_id_fkey FOREIGN KEY (trade_id) REFERENCES public.trades(trade_id),
  CONSTRAINT trade_participations_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id),
  CONSTRAINT trade_participations_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.asset_deposits(asset_id),
  CONSTRAINT trade_participations_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.patient_at_assignments(assignment_id)
);
CREATE TABLE public.trades (
  trade_id uuid NOT NULL DEFAULT gen_random_uuid(),
  hospital_id uuid NOT NULL,
  amount_invested numeric NOT NULL,
  investment_description character varying,
  amount_before_trade numeric NOT NULL,
  amount_after_trade numeric,
  profit_loss numeric,
  trade_type character varying NOT NULL,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone,
  total_at_burnt numeric DEFAULT 0,
  opening_price numeric,
  closing_price numeric,
  high numeric,
  low numeric,
  volume numeric,
  status character varying DEFAULT 'ACTIVE'::trade_status,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  trade_title character varying,
  trade_description character varying,
  CONSTRAINT trades_pkey PRIMARY KEY (trade_id),
  CONSTRAINT trades_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(h_id)
);
CREATE TABLE public.transactions (
  transaction_id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  token_id uuid NOT NULL,
  type character varying NOT NULL,
  amount numeric NOT NULL,
  description character varying,
  sender_wallet_address character varying,
  receiver_wallet_address character varying,
  block_number bigint,
  transaction_hash character varying UNIQUE,
  status character varying NOT NULL DEFAULT 'PENDING'::character varying,
  timestamp timestamp with time zone DEFAULT now(),
  CONSTRAINT transactions_pkey PRIMARY KEY (transaction_id),
  CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id),
  CONSTRAINT transactions_token_id_fkey FOREIGN KEY (token_id) REFERENCES public.tokens(token_id)
);
CREATE TABLE public.users (
  user_id uuid NOT NULL DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL,
  name character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  password_hash character varying NOT NULL,
  phone_num character varying,
  address character varying,
  city character varying,
  blood_group character varying,
  date_of_birth date,
  mfa_enabled boolean DEFAULT false,
  status character varying DEFAULT 'ACTIVE'::user_status,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  hospital_id uuid,
  CONSTRAINT users_pkey PRIMARY KEY (user_id),
  CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(role_id),
  CONSTRAINT users_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(h_id)
);