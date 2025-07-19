-- Create test evaluator and management profiles with proper UUIDs
INSERT INTO public.profiles (id, email, full_name, role, email_confirmed, department)
VALUES 
(
  'a1111111-1111-1111-1111-111111111111',
  'evaluator@test.com',
  'Test Evaluator',
  'evaluator',
  true,
  'IT Department'
),
(
  'b2222222-2222-2222-2222-222222222222',
  'manager@test.com',
  'Test Manager',
  'management',
  true,
  'Management'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  email_confirmed = EXCLUDED.email_confirmed,
  department = EXCLUDED.department;