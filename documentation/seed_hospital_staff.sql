-- ============================================================
-- SEED DATA: HOSPITAL STAFF RECORDS
-- This script populates test hospital staff members 
-- for the staff management page to display
-- ============================================================

-- NOTE: This assumes you have:
-- 1. At least one hospital record in the hospitals table
-- 2. A hospital_admin user who will be running this (to use their hospital_id)
--
-- TO RUN THIS SCRIPT:
-- 1. Replace 'hospital-id-uuid' with actual hospital ID from hospitals table
-- 2. The staff user records will be created automatically

-- Get the first hospital ID (if needed for reference)
-- SELECT * FROM hospitals LIMIT 1;

-- Get hospital_staff role ID
-- SELECT * FROM roles WHERE role_name = 'hospital_staff';

-- ============================================================
-- STEP 1: Create hospital_staff role users (if they don't exist)
-- ============================================================

-- Get the role_id for hospital_staff (should be: a predefined UUID)
DO $$
DECLARE
    v_hospital_staff_role_id UUID;
    v_hospital_id UUID;
    v_user_count INTEGER;
BEGIN
    -- Get the hospital_staff role ID
    SELECT role_id INTO v_hospital_staff_role_id 
    FROM roles 
    WHERE role_name = 'hospital_staff'
    LIMIT 1;
    
    -- Get the first hospital ID
    SELECT h_id INTO v_hospital_id 
    FROM hospitals 
    LIMIT 1;
    
    IF v_hospital_staff_role_id IS NULL THEN
        RAISE EXCEPTION 'hospital_staff role not found in roles table';
    END IF;
    
    IF v_hospital_id IS NULL THEN
        RAISE EXCEPTION 'No hospitals found. Please create a hospital first.';
    END IF;
    
    -- Check existing staff
    SELECT COUNT(*) INTO v_user_count 
    FROM hospital_staff 
    WHERE hospital_id = v_hospital_id;
    
    RAISE NOTICE 'Hospital ID: %', v_hospital_id;
    RAISE NOTICE 'Hospital Staff Role ID: %', v_hospital_staff_role_id;
    RAISE NOTICE 'Existing staff count: %', v_user_count;
    
    -- Create test staff users if table is empty
    IF v_user_count = 0 THEN
        -- Staff User 1: Dr. Ahmed Hassan
        INSERT INTO users (
            role_id, 
            name, 
            email, 
            password_hash, 
            phone_num, 
            address, 
            city, 
            status, 
            created_at, 
            updated_at
        ) VALUES (
            v_hospital_staff_role_id,
            'Dr. Ahmed Hassan',
            'ahmed.hassan@hospital.pk',
            '$2a$10$placeholder', -- Password hash will need to be set properly
            '+92-300-1234567',
            '123 Medical Street',
            'Karachi',
            'ACTIVE'::user_status,
            NOW(),
            NOW()
        ) ON CONFLICT (email) DO NOTHING;
        
        -- Staff User 2: Nura Khan
        INSERT INTO users (
            role_id, 
            name, 
            email, 
            password_hash, 
            phone_num, 
            address, 
            city, 
            status, 
            created_at, 
            updated_at
        ) VALUES (
            v_hospital_staff_role_id,
            'Nura Khan',
            'nura.khan@hospital.pk',
            '$2a$10$placeholder',
            '+92-300-2234567',
            '456 Healthcare Ave',
            'Karachi',
            'ACTIVE'::user_status,
            NOW(),
            NOW()
        ) ON CONFLICT (email) DO NOTHING;
        
        -- Staff User 3: Fatima Ali
        INSERT INTO users (
            role_id, 
            name, 
            email, 
            password_hash, 
            phone_num, 
            address, 
            city, 
            status, 
            created_at, 
            updated_at
        ) VALUES (
            v_hospital_staff_role_id,
            'Fatima Ali',
            'fatima.ali@hospital.pk',
            '$2a$10$placeholder',
            '+92-300-3234567',
            '789 Hospital Lane',
            'Karachi',
            'ACTIVE'::user_status,
            NOW(),
            NOW()
        ) ON CONFLICT (email) DO NOTHING;
        
        -- Staff User 4: Muhammad Malik (Inactive)
        INSERT INTO users (
            role_id, 
            name, 
            email, 
            password_hash, 
            phone_num, 
            address, 
            city, 
            status, 
            created_at, 
            updated_at
        ) VALUES (
            v_hospital_staff_role_id,
            'Muhammad Malik',
            'muhammad.malik@hospital.pk',
            '$2a$10$placeholder',
            '+92-300-4234567',
            '321 Medical Plaza',
            'Karachi',
            'INACTIVE'::user_status,
            NOW(),
            NOW()
        ) ON CONFLICT (email) DO NOTHING;
        
        RAISE NOTICE 'Created 4 test hospital staff users';
    END IF;
END $$;

-- ============================================================
-- STEP 2: Create HospitalStaff records linking users to hospital
-- ============================================================

DO $$
DECLARE
    v_hospital_id UUID;
    v_staff_count INTEGER;
BEGIN
    -- Get the first hospital ID
    SELECT h_id INTO v_hospital_id 
    FROM hospitals 
    LIMIT 1;
    
    -- Check if hospital_staff records exist
    SELECT COUNT(*) INTO v_staff_count 
    FROM hospital_staff 
    WHERE hospital_id = v_hospital_id;
    
    IF v_staff_count = 0 THEN
        -- Create hospital_staff records for each user
        INSERT INTO hospital_staff (
            id,
            user_id,
            hospital_id,
            employee_id,
            department,
            position,
            created_at,
            updated_at
        )
        SELECT
            gen_random_uuid(),
            u.user_id,
            v_hospital_id,
            'EMP-' || SUBSTR(u.user_id::text, 1, 8),
            CASE 
                WHEN u.name LIKE 'Dr.%' THEN 'Medical'
                WHEN u.name LIKE '%Khan' THEN 'Administration'
                ELSE 'Nursing'
            END,
            CASE
                WHEN u.name LIKE 'Dr.%' THEN 'Senior Physician'
                WHEN u.name = 'Nura Khan' THEN 'Administrative Officer'
                WHEN u.name = 'Fatima Ali' THEN 'Nurse'
                ELSE 'Assistant'
            END,
            NOW(),
            NOW()
        FROM users u
        WHERE u.role_id = (
            SELECT role_id FROM roles WHERE role_name = 'hospital_staff'
        )
        AND NOT EXISTS (
            SELECT 1 FROM hospital_staff hs 
            WHERE hs.user_id = u.user_id 
            AND hs.hospital_id = v_hospital_id
        );
        
        RAISE NOTICE 'Created hospital_staff records for hospital: %', v_hospital_id;
    ELSE
        RAISE NOTICE 'Hospital staff records already exist: %', v_staff_count;
    END IF;
END $$;

-- ============================================================
-- VERIFY: Show all hospital staff
-- ============================================================

SELECT 
    hs.id,
    u.name,
    u.email,
    u.phone_num,
    u.status,
    hs.employee_id,
    hs.position,
    hs.department,
    hs.created_at
FROM hospital_staff hs
JOIN users u ON hs.user_id = u.user_id
ORDER BY hs.created_at DESC;
