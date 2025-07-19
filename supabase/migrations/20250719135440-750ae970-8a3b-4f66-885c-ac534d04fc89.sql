-- Update admin user role to management
UPDATE public.profiles 
SET role = 'management'::user_role 
WHERE email = 'admin@you.com';