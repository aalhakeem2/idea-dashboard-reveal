-- Add missing auth translation keys to fix preview generation issues
INSERT INTO public.translations (interface_name, position_key, english_text, arabic_text) VALUES 
('auth', 'auth.full_name_placeholder', 'Enter your full name', 'أدخل اسمك الكامل'),
('auth', 'auth.email', 'Email', 'البريد الإلكتروني'),
('auth', 'auth.email_placeholder', 'Enter your email', 'أدخل بريدك الإلكتروني'),
('auth', 'auth.password', 'Password', 'كلمة المرور'),
('auth', 'auth.create_password_placeholder', 'Create a password', 'أنشئ كلمة مرور'),
('auth', 'auth.create_account', 'Create Account', 'إنشاء حساب'),
('auth', 'auth.no_email_confirmation', 'No email confirmation required', 'لا حاجة لتأكيد البريد الإلكتروني'),
('auth', 'auth.sign_in', 'Sign In', 'تسجيل الدخول'),
('auth', 'auth.sign_up', 'Sign Up', 'التسجيل'),
('auth', 'auth.already_have_account', 'Already have an account?', 'لديك حساب بالفعل؟'),
('auth', 'auth.dont_have_account', 'Don\'t have an account?', 'ليس لديك حساب؟')
ON CONFLICT (interface_name, position_key) DO UPDATE SET
english_text = EXCLUDED.english_text,
arabic_text = EXCLUDED.arabic_text;