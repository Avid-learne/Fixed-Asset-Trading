-- ============================================================
-- ACTIVITY LOGGING STORED PROCEDURES
-- These procedures handle automatic activity logging for login, logout, and profile updates
-- ============================================================

-- Drop procedures if they exist
DROP PROCEDURE IF EXISTS public.usp_log_login(UUID, VARCHAR);
DROP PROCEDURE IF EXISTS public.usp_log_logout(UUID, VARCHAR);
DROP PROCEDURE IF EXISTS public.usp_log_profile_update(UUID, VARCHAR, VARCHAR, TEXT, VARCHAR, VARCHAR);

-- ============================================================
-- PROCEDURE: usp_log_login
-- Purpose: Log user login activity
-- Parameters:
--   p_user_id: UUID of the user logging in
--   p_description: Optional description (default: 'User successfully logged in')
-- ============================================================
CREATE PROCEDURE public.usp_log_login(
    p_user_id UUID,
    p_description VARCHAR DEFAULT 'User successfully logged in'
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.activity (
        user_id,
        activity_name,
        description,
        type,
        status,
        timestamp
    ) VALUES (
        p_user_id,
        'User Login',
        p_description,
        'LOGIN'::activity_type,
        'SUCCESS',
        now()
    );
    
    RAISE NOTICE 'Login activity logged for user: %', p_user_id;
END;
$$;

-- ============================================================
-- PROCEDURE: usp_log_logout
-- Purpose: Log user logout activity
-- Parameters:
--   p_user_id: UUID of the user logging out
--   p_description: Optional description (default: 'User successfully logged out')
-- ============================================================
CREATE PROCEDURE public.usp_log_logout(
    p_user_id UUID,
    p_description VARCHAR DEFAULT 'User successfully logged out'
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.activity (
        user_id,
        activity_name,
        description,
        type,
        status,
        timestamp
    ) VALUES (
        p_user_id,
        'User Logout',
        p_description,
        'LOGOUT'::activity_type,
        'SUCCESS',
        now()
    );
    
    RAISE NOTICE 'Logout activity logged for user: %', p_user_id;
END;
$$;

-- ============================================================
-- PROCEDURE: usp_log_profile_update
-- Purpose: Update user profile AND log the activity
-- Parameters:
--   p_user_id: UUID of the user updating profile
--   p_name: New name (NULL to skip)
--   p_phone_num: New phone number (NULL to skip)
--   p_address: New address (NULL to skip)
--   p_city: New city (NULL to skip)
--   p_blood_group: New blood group (NULL to skip)
-- ============================================================
CREATE PROCEDURE public.usp_log_profile_update(
    p_user_id UUID,
    p_name VARCHAR DEFAULT NULL,
    p_phone_num VARCHAR DEFAULT NULL,
    p_address TEXT DEFAULT NULL,
    p_city VARCHAR DEFAULT NULL,
    p_blood_group VARCHAR DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Update user table with new values (only update non-null parameters)
    UPDATE public.users
    SET 
        name = COALESCE(p_name, name),
        phone_num = COALESCE(p_phone_num, phone_num),
        address = COALESCE(p_address, address),
        city = COALESCE(p_city, city),
        blood_group = COALESCE(p_blood_group, blood_group),
        updated_at = now()
    WHERE user_id = p_user_id;
    
    -- Log the profile update activity
    INSERT INTO public.activity (
        user_id,
        activity_name,
        description,
        type,
        status,
        timestamp
    ) VALUES (
        p_user_id,
        'Profile Update',
        'User profile information updated',
        'ACTION'::activity_type,
        'SUCCESS',
        now()
    );
    
    RAISE NOTICE 'Profile updated and activity logged for user: %', p_user_id;
END;
$$;
