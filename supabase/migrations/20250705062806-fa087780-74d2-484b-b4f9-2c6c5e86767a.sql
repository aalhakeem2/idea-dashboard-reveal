
-- First, let's ensure the database migration is properly applied to disable email confirmation
-- Update the handle_new_user function to always bypass email confirmation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, email_confirmed, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    true, -- Always set to true to completely bypass email confirmation
    'submitter'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    email_confirmed = true;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update all existing profiles to have email_confirmed = true
UPDATE public.profiles 
SET email_confirmed = true 
WHERE email_confirmed = false OR email_confirmed IS NULL;

-- Create a temporary policy to allow profile creation during signup
DROP POLICY IF EXISTS "Allow profile creation during signup" ON public.profiles;
CREATE POLICY "Allow profile creation during signup" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);

-- Ensure the profiles table has proper RLS policies
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id OR auth.uid() IS NULL);
