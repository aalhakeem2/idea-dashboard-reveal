-- Create test evaluator and management users
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_token,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES
(
  'eval-user-001',
  '00000000-0000-0000-0000-000000000000',
  'evaluator@test.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  '',
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Test Evaluator"}',
  false,
  'authenticated'
),
(
  'mgmt-user-001',
  '00000000-0000-0000-0000-000000000000',
  'manager@test.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  '',
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Test Manager"}',
  false,
  'authenticated'
);

-- Create corresponding profiles
INSERT INTO public.profiles (id, email, full_name, role, email_confirmed, department)
VALUES 
(
  'eval-user-001',
  'evaluator@test.com',
  'Test Evaluator',
  'evaluator',
  true,
  'IT Department'
),
(
  'mgmt-user-001',
  'manager@test.com',
  'Test Manager',
  'management',
  true,
  'Management'
);