-- Fix critical security vulnerability in profiles table RLS policy
-- The current policy allows public access to employee personal information

-- Drop the current insecure policy that allows anyone to view all profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create a secure policy that requires authentication to view profiles
CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- Also create a more restrictive policy for anonymous users (if needed for specific use cases)
-- This ensures only basic, non-sensitive profile info could be accessed if absolutely necessary
-- But for now, we're completely restricting to authenticated users only