-- Reset password for Mohammed Alhakeem test user
-- This will allow the test login button to work properly

DO $$
DECLARE
    user_uuid uuid := 'e4f73997-7a96-4bc2-95a6-37be29539adc';
BEGIN
    -- Update the user's password hash to match "Abdu123+++"
    UPDATE auth.users 
    SET 
        encrypted_password = crypt('Abdu123+++', gen_salt('bf')),
        updated_at = now()
    WHERE id = user_uuid;
    
    -- Ensure the user is email confirmed
    UPDATE auth.users 
    SET 
        email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE id = user_uuid AND email_confirmed_at IS NULL;
    
    RAISE NOTICE 'Password reset completed for test user: test@you.com';
END $$;