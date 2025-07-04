
-- Disable email confirmation for all users by updating the auth configuration
-- This will allow users to sign in immediately without email verification

-- Update existing profiles to have email_confirmed = true
UPDATE public.profiles 
SET email_confirmed = true 
WHERE email_confirmed = false OR email_confirmed IS NULL;

-- Update the handle_new_user function to always set email_confirmed = true
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, email_confirmed, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    true, -- Always set to true to bypass email confirmation
    'submitter'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
