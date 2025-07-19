
-- Update Osama Murshed's role to management
UPDATE public.profiles 
SET role = 'management'
WHERE email = 'osama.murshed@gmail.com';

-- Delete Ahmed Alhakeem's profile as requested
DELETE FROM public.profiles 
WHERE email = 'abdurhman.hakeem@gmail.com';

-- Update passwords for main test accounts (if auth.users table allows direct updates)
-- Note: This might need to be done through Supabase Auth API instead
