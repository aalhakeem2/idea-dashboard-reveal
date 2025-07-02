
-- Add email_confirmed column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN email_confirmed BOOLEAN DEFAULT false;

-- Update existing profiles to have email_confirmed = true for test users
UPDATE public.profiles 
SET email_confirmed = true 
WHERE email IN ('submitter@you.com', 'evaluator@you.com', 'management@you.com', 'test@you.com');

-- Update the handle_new_user function to set email_confirmed based on test users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, email_confirmed)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    CASE 
      WHEN NEW.email IN ('submitter@you.com', 'evaluator@you.com', 'management@you.com', 'test@you.com') 
      THEN true 
      ELSE NEW.email_confirmed_at IS NOT NULL 
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
