-- Insurance Company Schema Migration
-- Creates tables for insurance companies, NOC certificates, document requirements, and submitted documents

-- Table: insurance_companies
CREATE TABLE IF NOT EXISTS insurance_companies (
    insurance_company_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL UNIQUE,
    registration_number VARCHAR(100) NOT NULL UNIQUE,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    address TEXT,
    regulatory_license TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: document_requirements
CREATE TABLE IF NOT EXISTS document_requirements (
    requirement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_type VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_mandatory BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: submitted_documents
CREATE TABLE IF NOT EXISTS submitted_documents (
    document_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fractionalization_request_id UUID NOT NULL,
    requirement_id UUID NOT NULL,
    document_type VARCHAR(255) NOT NULL,
    document_url TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_REVIEW' CHECK (status IN ('SUBMITTED', 'VERIFIED', 'REJECTED', 'PENDING_REVIEW')),
    verification_notes TEXT,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP,
    FOREIGN KEY (requirement_id) REFERENCES document_requirements(requirement_id),
    INDEX idx_fractionalization_request (fractionalization_request_id),
    INDEX idx_document_type (document_type)
);

-- Table: noc_certificates
CREATE TABLE IF NOT EXISTS noc_certificates (
    noc_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    noc_number VARCHAR(100) NOT NULL UNIQUE,
    fractionalization_request_id UUID NOT NULL,
    insurance_company_id UUID NOT NULL,
    hospital_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('ISSUED', 'EXPIRED', 'REVOKED', 'PENDING')),
    issued_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    document_url TEXT,
    remarks TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (insurance_company_id) REFERENCES insurance_companies(insurance_company_id),
    INDEX idx_fractionalization_request (fractionalization_request_id),
    INDEX idx_insurance_company (insurance_company_id),
    INDEX idx_patient (patient_id),
    INDEX idx_noc_number (noc_number)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_submitted_documents_request_status ON submitted_documents(fractionalization_request_id, status);
CREATE INDEX IF NOT EXISTS idx_noc_certificates_patient_status ON noc_certificates(patient_id, status);
CREATE INDEX IF NOT EXISTS idx_noc_certificates_expiry ON noc_certificates(expires_at);

-- Add triggers for updated_at timestamp (if using PostgreSQL)
-- These will automatically update the updated_at column whenever a record is modified

-- For insurance_companies table
CREATE OR REPLACE FUNCTION update_insurance_companies_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_insurance_companies_timestamp ON insurance_companies;
CREATE TRIGGER trigger_update_insurance_companies_timestamp
BEFORE UPDATE ON insurance_companies
FOR EACH ROW
EXECUTE FUNCTION update_insurance_companies_timestamp();

-- For noc_certificates table
CREATE OR REPLACE FUNCTION update_noc_certificates_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_noc_certificates_timestamp ON noc_certificates;
CREATE TRIGGER trigger_update_noc_certificates_timestamp
BEFORE UPDATE ON noc_certificates
FOR EACH ROW
EXECUTE FUNCTION update_noc_certificates_timestamp();

-- Insert initial insurance company for testing (Optional)
-- INSERT INTO insurance_companies (insurance_company_id, company_name, registration_number, contact_email, contact_phone, address, is_active)
-- VALUES ('00000000-0000-0000-0000-000000000001', 'Test Insurance Company', 'INS-001', 'contact@testinsurance.com', '+92-21-111-XXXX', 'Karachi, Pakistan', true)
-- ON CONFLICT (company_name) DO NOTHING;
