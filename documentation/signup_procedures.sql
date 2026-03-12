-- ============================================================
-- PATIENT SIGNUP STORED PROCEDURES
-- These procedures handle automatic record creation for different user roles
-- when a user signs up
-- ============================================================

-- Drop procedures if they exist
DROP PROCEDURE IF EXISTS public.usp_create_patient_record(UUID, UUID);
DROP PROCEDURE IF EXISTS public.usp_handle_user_signup(UUID, VARCHAR, UUID);

-- ============================================================
-- PROCEDURE: usp_create_patient_record
-- Purpose: Create patient record automatically when a patient user signs up
-- Parameters:
--   p_user_id: UUID of the user who signed up
--   p_hospital_id: UUID of the hospital (can be NULL)
-- Returns: Patient record details
-- ============================================================
CREATE PROCEDURE public.usp_create_patient_record(
    p_user_id UUID,
    p_hospital_id UUID DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_patient_id UUID;
    v_registration_id VARCHAR;
    v_user_role VARCHAR;
    v_hospital_id UUID;
BEGIN
    -- Get user role
    SELECT r.role_name::text INTO v_user_role
    FROM public.users u
    JOIN public.roles r ON u.role_id = r.role_id
    WHERE u.user_id = p_user_id;

    -- Only create patient record if role is 'patient'
    IF v_user_role != 'patient' THEN
        RAISE NOTICE 'User role is not patient. Skipping patient record creation for user: %', p_user_id;
        RETURN;
    END IF;

    -- Check if patient record already exists
    IF EXISTS (SELECT 1 FROM public.patients WHERE user_id = p_user_id) THEN
        RAISE NOTICE 'Patient record already exists for user: %', p_user_id;
        RETURN;
    END IF;

    -- Generate registration ID (format: LNH-YYYY-RANDOM)
    -- Using hospital code 'LNH' (Liaquat National Hospital) as default
    v_registration_id := 'LNH-' || TO_CHAR(NOW(), 'YYYY') || '-' || 
                         SUBSTRING(p_user_id::text, 1, 8);

    -- Use provided hospital_id or NULL if not provided
    v_hospital_id := p_hospital_id;

    -- Create patient record with the provided hospital_id
    INSERT INTO public.patients (
        id,
        user_id,
        hospital_id,
        wallet_address,
        has_asset,
        has_subscription,
        kyc_status,
        registration_id,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        p_user_id,
        v_hospital_id,
        NULL,  -- Wallet address will be set later
        false,
        false,
        'PENDING'::kyc_status,
        v_registration_id,
        now(),
        now()
    )
    RETURNING id INTO v_patient_id;

    -- Also create a KYC record with default values
    INSERT INTO public.kyc (
        patient_id,
        completion_percentage,
        submitted_at
    ) VALUES (
        v_patient_id,
        0,
        NULL
    );

    -- Log the patient signup activity
    INSERT INTO public.activity (
        user_id,
        activity_name,
        description,
        type,
        status,
        timestamp
    ) VALUES (
        p_user_id,
        'Patient Signup',
        'Patient record created automatically during signup. Registration ID: ' || v_registration_id || 
        ', Hospital ID: ' || COALESCE(v_hospital_id::text, 'NULL'),
        'ACTION'::activity_type,
        'SUCCESS',
        now()
    );

    RAISE NOTICE 'Patient record created successfully for user: %. Patient ID: %, Registration ID: %, Hospital ID: %', 
                 p_user_id, v_patient_id, v_registration_id, COALESCE(v_hospital_id::text, 'NULL');

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creating patient record: %', SQLERRM;
    -- Log error activity
    INSERT INTO public.activity (
        user_id,
        activity_name,
        description,
        type,
        status,
        timestamp
    ) VALUES (
        p_user_id,
        'Patient Signup Error',
        'Failed to create patient record: ' || SQLERRM,
        'ERROR'::activity_type,
        'FAILED',
        now()
    );
END;
$$;

-- ============================================================
-- PROCEDURE: usp_handle_user_signup
-- Purpose: Main procedure to handle user signup and create role-specific records
-- Parameters:
--   p_user_id: UUID of the newly created user
--   p_role: Role of the user (patient, hospital_admin, hospital_staff, bank_staff, admin)
--   p_hospital_id: Hospital ID (optional, for health-related roles)
-- ============================================================
CREATE PROCEDURE public.usp_handle_user_signup(
    p_user_id UUID,
    p_role VARCHAR,
    p_hospital_id UUID DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    CASE p_role
        WHEN 'patient' THEN
            -- Call patient record creation procedure with hospital_id
            CALL public.usp_create_patient_record(p_user_id, p_hospital_id);
        WHEN 'hospital_admin' THEN
            RAISE NOTICE 'Hospital admin signup for user: % linked to hospital: %', p_user_id, COALESCE(p_hospital_id::text, 'NULL');
            -- You can add hospital_admin specific logic here later
        WHEN 'hospital_staff' THEN
            RAISE NOTICE 'Hospital staff signup for user: % linked to hospital: %', p_user_id, COALESCE(p_hospital_id::text, 'NULL');
            -- You can add hospital_staff specific logic here later
        WHEN 'bank_staff' THEN
            RAISE NOTICE 'Bank staff signup for user: %', p_user_id;
            -- You can add bank_staff specific logic here later
        WHEN 'admin' THEN
            RAISE NOTICE 'Admin signup for user: %', p_user_id;
            -- You can add admin specific logic here later
        ELSE
            RAISE NOTICE 'Unknown role: % for user: %', p_role, p_user_id;
    END CASE;

    -- Log general signup activity
    INSERT INTO public.activity (
        user_id,
        activity_name,
        description,
        type,
        status,
        timestamp
    ) VALUES (
        p_user_id,
        'User Signup',
        'User signed up with role: ' || p_role || ', Hospital ID: ' || COALESCE(p_hospital_id::text, 'NULL'),
        'ACTION'::activity_type,
        'SUCCESS',
        now()
    );

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error in handle_user_signup: %', SQLERRM;
    INSERT INTO public.activity (
        user_id,
        activity_name,
        description,
        type,
        status,
        timestamp
    ) VALUES (
        p_user_id,
        'Signup Processing Error',
        'Error during signup processing: ' || SQLERRM,
        'ERROR'::activity_type,
        'FAILED',
        now()
    );
END;
$$;
