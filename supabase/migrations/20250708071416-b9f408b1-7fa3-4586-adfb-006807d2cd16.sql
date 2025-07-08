-- Completely disable email confirmation at Supabase Auth level
-- Update auth settings to disable email confirmation
UPDATE auth.config 
SET email_confirm_changes = false, 
    email_autoconfirm = true 
WHERE id = 1;

-- If the config table doesn't exist or doesn't have the row, let's insert it
INSERT INTO auth.config (id, email_confirm_changes, email_autoconfirm) 
VALUES (1, false, true)
ON CONFLICT (id) DO UPDATE SET
  email_confirm_changes = false,
  email_autoconfirm = true;

-- Update all existing users to have confirmed emails in the auth.users table
UPDATE auth.users 
SET email_confirmed_at = now(),
    confirmed_at = now()
WHERE email_confirmed_at IS NULL 
   OR confirmed_at IS NULL;

-- Also ensure all profiles have email_confirmed set to true
UPDATE public.profiles 
SET email_confirmed = true 
WHERE email_confirmed IS NULL OR email_confirmed = false;

-- Create or update the trigger to auto-confirm users on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Insert into profiles table with auto-confirmed email
  INSERT INTO public.profiles (id, email, full_name, email_confirmed, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    true, -- Always set email as confirmed
    'submitter'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    email_confirmed = true; -- Always confirm email
    
  -- Auto-confirm the user in auth.users table immediately
  UPDATE auth.users 
  SET email_confirmed_at = now(),
      confirmed_at = now()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$function$;