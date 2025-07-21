
-- Update Osama Murshed's role from submitter to management using the admin function
SELECT admin_update_user_role(
  '45a818b8-b03f-4acc-abd5-1c3fa047568a'::uuid,  -- User ID for osama.murshed@gmail.com
  'management'::user_role,                        -- New role
  NULL::evaluation_type[]                         -- No specific specialization needed for management
);

-- Verify the update was successful
SELECT id, email, full_name, role, updated_at 
FROM profiles 
WHERE id = '45a818b8-b03f-4acc-abd5-1c3fa047568a';

-- Check the user management log to confirm the action was recorded
SELECT * FROM user_management_logs 
WHERE target_user_id = '45a818b8-b03f-4acc-abd5-1c3fa047568a' 
ORDER BY created_at DESC 
LIMIT 1;
