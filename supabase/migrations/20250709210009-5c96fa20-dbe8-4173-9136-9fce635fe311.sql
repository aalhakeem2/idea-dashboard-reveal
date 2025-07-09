-- Insert translations for dashboard interface components

-- Header translations
INSERT INTO public.translations (interface_name, position_key, english_text, arabic_text) VALUES
('header', 'search_placeholder', 'Search...', 'بحث...'),
('header', 'filter', 'Filter', 'تصفية'),
('header', 'notifications', 'Notifications', 'الإشعارات');

-- Sidebar translations  
INSERT INTO public.translations (interface_name, position_key, english_text, arabic_text) VALUES
('sidebar', 'app_title', 'YouInnovate', 'يو إنوفيت'),
('sidebar', 'innovation_hub', 'Innovation Hub', 'مركز الابتكار'),
('sidebar', 'dashboard', 'Dashboard', 'لوحة القيادة'),
('sidebar', 'ideas', 'Ideas', 'الأفكار'),
('sidebar', 'submit_idea', 'Submit Idea', 'تقديم فكرة'),
('sidebar', 'my_ideas', 'My Ideas', 'أفكاري'),
('sidebar', 'pending_reviews', 'Pending Reviews', 'المراجعات المعلقة'),
('sidebar', 'analytics', 'Analytics', 'التحليلات'),
('sidebar', 'users', 'Users', 'المستخدمون'),
('sidebar', 'settings', 'Settings', 'الإعدادات'),
('sidebar', 'sign_out', 'Sign Out', 'تسجيل الخروج');

-- Dashboard translations
INSERT INTO public.translations (interface_name, position_key, english_text, arabic_text) VALUES
('dashboard', 'seed_sample_data', 'Seed Sample Data', 'إدراج بيانات تجريبية'),
('dashboard', 'seeding', 'Seeding...', 'جاري الإدراج...');

-- Submitter Dashboard translations
INSERT INTO public.translations (interface_name, position_key, english_text, arabic_text) VALUES
('submitter_dashboard', 'total_ideas', 'Total Ideas', 'إجمالي الأفكار'),
('submitter_dashboard', 'under_review', 'Under Review', 'قيد المراجعة'),
('submitter_dashboard', 'approved', 'Approved', 'موافق عليها'),
('submitter_dashboard', 'success_rate', 'Success Rate', 'معدل النجاح'),
('submitter_dashboard', 'recent_ideas', 'Recent Ideas', 'الأفكار الحديثة'),
('submitter_dashboard', 'latest_submissions', 'Your latest idea submissions', 'آخر الأفكار المقدمة'),
('submitter_dashboard', 'no_ideas_yet', 'No ideas yet', 'لا توجد أفكار بعد'),
('submitter_dashboard', 'get_started', 'Get started by submitting your first idea.', 'ابدأ بتقديم فكرتك الأولى.'),
('submitter_dashboard', 'my_ideas_title', 'My Ideas', 'أفكاري'),
('submitter_dashboard', 'total_count', 'total', 'إجمالي'),
('submitter_dashboard', 'no_ideas_submitted', 'No ideas submitted yet', 'لم يتم تقديم أي أفكار بعد'),
('submitter_dashboard', 'start_submitting', 'Start by submitting your first innovative idea to the platform.', 'ابدأ بتقديم فكرتك الابتكارية الأولى على المنصة.');