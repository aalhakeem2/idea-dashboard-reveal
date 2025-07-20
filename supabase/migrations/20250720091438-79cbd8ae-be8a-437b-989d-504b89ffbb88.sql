
-- Extend profiles table with additional fields for user management
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.profiles(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS blocked_by UUID REFERENCES public.profiles(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_reset_required BOOLEAN DEFAULT false;

-- Create user management audit log table
CREATE TABLE IF NOT EXISTS public.user_management_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  performed_by UUID REFERENCES public.profiles(id) NOT NULL,
  target_user_id UUID REFERENCES public.profiles(id) NOT NULL,
  action_type TEXT NOT NULL,
  action_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on user management logs
ALTER TABLE public.user_management_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for management to view all user management logs
CREATE POLICY "Management can view user management logs" ON public.user_management_logs
  FOR SELECT USING (get_user_role(auth.uid()) = 'management');

-- Create policy for management to insert user management logs
CREATE POLICY "Management can insert user management logs" ON public.user_management_logs
  FOR INSERT WITH CHECK (get_user_role(auth.uid()) = 'management' AND performed_by = auth.uid());

-- Update profiles RLS policies to allow management full access
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id OR 
    get_user_role(auth.uid()) = 'management'
  );

-- Allow management to insert new profiles
CREATE POLICY "Management can create profiles" ON public.profiles
  FOR INSERT WITH CHECK (get_user_role(auth.uid()) = 'management');

-- Create function to log user management actions
CREATE OR REPLACE FUNCTION public.log_user_management_action(
  p_target_user_id UUID,
  p_action_type TEXT,
  p_action_details JSONB DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_management_logs (
    performed_by,
    target_user_id,
    action_type,
    action_details
  ) VALUES (
    auth.uid(),
    p_target_user_id,
    p_action_type,
    p_action_details
  );
END;
$$;

-- Create function to toggle user active status
CREATE OR REPLACE FUNCTION public.admin_toggle_user_status(
  p_user_id UUID,
  p_is_active BOOLEAN,
  p_reason TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role user_role;
BEGIN
  -- Check if current user is management
  SELECT get_user_role(auth.uid()) INTO current_user_role;
  IF current_user_role != 'management' THEN
    RAISE EXCEPTION 'Only management can toggle user status';
  END IF;

  -- Update user status
  IF p_is_active THEN
    UPDATE public.profiles 
    SET is_active = true, 
        blocked_at = NULL, 
        blocked_by = NULL,
        updated_by = auth.uid()
    WHERE id = p_user_id;
  ELSE
    UPDATE public.profiles 
    SET is_active = false, 
        blocked_at = now(), 
        blocked_by = auth.uid(),
        updated_by = auth.uid()
    WHERE id = p_user_id;
  END IF;

  -- Log the action
  PERFORM log_user_management_action(
    p_user_id,
    CASE WHEN p_is_active THEN 'user_unblocked' ELSE 'user_blocked' END,
    jsonb_build_object('reason', p_reason)
  );
END;
$$;

-- Create function to update user role
CREATE OR REPLACE FUNCTION public.admin_update_user_role(
  p_user_id UUID,
  p_new_role user_role,
  p_specialization evaluation_type[] DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role user_role;
  old_role user_role;
BEGIN
  -- Check if current user is management
  SELECT get_user_role(auth.uid()) INTO current_user_role;
  IF current_user_role != 'management' THEN
    RAISE EXCEPTION 'Only management can update user roles';
  END IF;

  -- Get old role for logging
  SELECT role INTO old_role FROM public.profiles WHERE id = p_user_id;

  -- Update user role and specialization
  UPDATE public.profiles 
  SET role = p_new_role,
      specialization = COALESCE(p_specialization, specialization),
      updated_by = auth.uid()
  WHERE id = p_user_id;

  -- Log the action
  PERFORM log_user_management_action(
    p_user_id,
    'role_updated',
    jsonb_build_object(
      'old_role', old_role,
      'new_role', p_new_role,
      'specialization', p_specialization
    )
  );
END;
$$;

-- Create function to require password reset
CREATE OR REPLACE FUNCTION public.admin_require_password_reset(
  p_user_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role user_role;
BEGIN
  -- Check if current user is management
  SELECT get_user_role(auth.uid()) INTO current_user_role;
  IF current_user_role != 'management' THEN
    RAISE EXCEPTION 'Only management can require password reset';
  END IF;

  -- Set password reset flag
  UPDATE public.profiles 
  SET password_reset_required = true,
      updated_by = auth.uid()
  WHERE id = p_user_id;

  -- Log the action
  PERFORM log_user_management_action(
    p_user_id,
    'password_reset_required',
    jsonb_build_object('reason', p_reason)
  );
END;
$$;

-- Add translations for user management
INSERT INTO public.translations (interface_name, position_key, english_text, arabic_text) VALUES
('user_management', 'title', 'User Management', 'إدارة المستخدمين'),
('user_management', 'add_user', 'Add User', 'إضافة مستخدم'),
('user_management', 'edit_user', 'Edit User', 'تحرير المستخدم'),
('user_management', 'block_user', 'Block User', 'حظر المستخدم'),
('user_management', 'unblock_user', 'Unblock User', 'إلغاء حظر المستخدم'),
('user_management', 'reset_password', 'Reset Password', 'إعادة تعيين كلمة المرور'),
('user_management', 'delete_user', 'Delete User', 'حذف المستخدم'),
('user_management', 'user_status', 'Status', 'الحالة'),
('user_management', 'active', 'Active', 'نشط'),
('user_management', 'blocked', 'Blocked', 'محظور'),
('user_management', 'last_login', 'Last Login', 'آخر تسجيل دخول'),
('user_management', 'created_at', 'Created At', 'تاريخ الإنشاء'),
('user_management', 'role_updated', 'Role Updated', 'تم تحديث الدور'),
('user_management', 'user_blocked', 'User Blocked', 'تم حظر المستخدم'),
('user_management', 'user_unblocked', 'User Unblocked', 'تم إلغاء حظر المستخدم'),
('user_management', 'password_reset_sent', 'Password Reset Required', 'مطلوب إعادة تعيين كلمة المرور'),
('user_management', 'confirm_delete', 'Are you sure you want to delete this user?', 'هل أنت متأكد من حذف هذا المستخدم؟'),
('user_management', 'confirm_block', 'Are you sure you want to block this user?', 'هل أنت متأكد من حظر هذا المستخدم؟'),
('user_management', 'search_users', 'Search users...', 'البحث عن المستخدمين...'),
('user_management', 'filter_by_role', 'Filter by Role', 'تصفية حسب الدور'),
('user_management', 'all_roles', 'All Roles', 'جميع الأدوار'),
('user_management', 'total_users', 'Total Users', 'إجمالي المستخدمين'),
('user_management', 'active_users', 'Active Users', 'المستخدمون النشطون'),
('user_management', 'blocked_users', 'Blocked Users', 'المستخدمون المحظورون')
ON CONFLICT (interface_name, position_key) DO UPDATE SET
  english_text = EXCLUDED.english_text,
  arabic_text = EXCLUDED.arabic_text;
