-- Reset password for Mohammed Alhakeem test user
-- This will allow the test login button to work properly

-- First, let's update the user's encrypted password in auth.users
-- We need to use the admin functions to reset the password

DO $$
DECLARE
    user_uuid uuid := 'e4f73997-7a96-4bc2-95a6-37be29539adc';
BEGIN
    -- Update the user's password hash to match "Abdu123+++"
    -- Note: In production, this should be done through proper password reset flows
    -- This is only for fixing the test user credential mismatch
    
    UPDATE auth.users 
    SET 
        encrypted_password = crypt('Abdu123+++', gen_salt('bf')),
        updated_at = now()
    WHERE id = user_uuid;
    
    -- Also ensure the user is confirmed and active
    UPDATE auth.users 
    SET 
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        phone_confirmed_at = COALESCE(phone_confirmed_at, now()),
        confirmed_at = COALESCE(confirmed_at, now())
    WHERE id = user_uuid;
    
    RAISE NOTICE 'Password reset completed for test user: test@you.com';
END $$;