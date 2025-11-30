INSERT INTO patients (id, registration_id, name, email, phone, password, wallet_address, created_at, updated_at) 
VALUES 
(1, 'PAT-001', 'John Doe', 'john@example.com', '1234567890', 'password', '0xWallet1', NOW(), NOW()),
(2, 'PAT-002', 'Jane Smith', 'jane@example.com', '0987654321', 'password', '0xWallet2', NOW(), NOW());

INSERT INTO asset_deposits (id, patient_id, asset_type, asset_value, tokens_minted, status, created_at) 
VALUES 
(1, 1, 'GOLD', 1000.0, 100000.0, 'PROCESSED', NOW()),
(2, 1, 'SILVER', 500.0, NULL, 'PENDING', NOW());