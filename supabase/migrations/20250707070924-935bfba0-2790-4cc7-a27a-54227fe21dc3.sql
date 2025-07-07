
-- Create translations table for multilingual support
CREATE TABLE public.translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interface_name TEXT NOT NULL, -- e.g., 'dashboard', 'sidebar', 'header'
  position_key TEXT NOT NULL, -- e.g., 'title', 'submit_button', 'welcome_message'
  english_text TEXT NOT NULL,
  arabic_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(interface_name, position_key)
);

-- Enable RLS on translations table
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

-- Create policy for translations (readable by all authenticated users)
CREATE POLICY "Users can view translations" ON public.translations FOR SELECT USING (true);
CREATE POLICY "Management can manage translations" ON public.translations FOR ALL USING (
  public.get_user_role(auth.uid()) = 'management'
);

-- Add update trigger for translations
CREATE TRIGGER update_translations_updated_at 
  BEFORE UPDATE ON public.translations 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial translations for the application
INSERT INTO public.translations (interface_name, position_key, english_text, arabic_text) VALUES
  -- Sidebar translations
  ('sidebar', 'app_title', 'YOU', 'أنت'),
  ('sidebar', 'innovation_hub', 'Innovation Hub', 'مركز الابتكار'),
  ('sidebar', 'dashboard', 'Dashboard', 'لوحة التحكم'),
  ('sidebar', 'ideas', 'Ideas', 'الأفكار'),
  ('sidebar', 'submit_idea', 'Submit Idea', 'إرسال فكرة'),
  ('sidebar', 'my_ideas', 'My Ideas', 'أفكاري'),
  ('sidebar', 'pending_reviews', 'Pending Reviews', 'المراجعات المعلقة'),
  ('sidebar', 'analytics', 'Analytics', 'التحليلات'),
  ('sidebar', 'users', 'Users', 'المستخدمون'),
  ('sidebar', 'settings', 'Settings', 'الإعدادات'),
  ('sidebar', 'sign_out', 'Sign Out', 'تسجيل الخروج'),
  
  -- Header translations
  ('header', 'search_placeholder', 'Search ideas, users, or projects...', 'البحث عن الأفكار والمستخدمين والمشاريع...'),
  ('header', 'filter', 'Filter', 'تصفية'),
  
  -- Dashboard translations
  ('dashboard', 'total_ideas', 'Total Ideas', 'إجمالي الأفكار'),
  ('dashboard', 'under_review', 'Under Review', 'قيد المراجعة'),
  ('dashboard', 'approved', 'Approved', 'معتمد'),
  ('dashboard', 'success_rate', 'Success Rate', 'معدل النجاح'),
  ('dashboard', 'recent_ideas', 'Recent Ideas', 'الأفكار الحديثة'),
  ('dashboard', 'latest_submissions', 'Your latest idea submissions', 'أحدث الأفكار المقدمة'),
  ('dashboard', 'pending_evaluations', 'Pending Evaluations', 'التقييمات المعلقة'),
  ('dashboard', 'ideas_waiting_review', 'Ideas waiting for your review', 'الأفكار في انتظار مراجعتك'),
  ('dashboard', 'no_pending_evaluations', 'No pending evaluations', 'لا توجد تقييمات معلقة'),
  ('dashboard', 'all_ideas_reviewed', 'All ideas have been reviewed.', 'تم مراجعة جميع الأفكار.'),
  ('dashboard', 'active_ideas', 'Active Ideas', 'الأفكار النشطة'),
  ('dashboard', 'implemented', 'Implemented', 'منفذ'),
  ('dashboard', 'total_users', 'Total Users', 'إجمالي المستخدمين'),
  ('dashboard', 'avg_time', 'Avg Time', 'متوسط الوقت'),
  
  -- Idea form translations
  ('idea_form', 'submit_new_idea', 'Submit New Idea', 'إرسال فكرة جديدة'),
  ('idea_form', 'share_innovative_idea', 'Share your innovative idea with the evaluation team', 'شارك فكرتك المبتكرة مع فريق التقييم'),
  ('idea_form', 'idea_title', 'Idea Title', 'عنوان الفكرة'),
  ('idea_form', 'title_placeholder', 'Enter a compelling title for your idea', 'أدخل عنواناً جذاباً لفكرتك'),
  ('idea_form', 'description', 'Description', 'الوصف'),
  ('idea_form', 'description_placeholder', 'Describe your idea in detail, including the problem it solves and proposed solution', 'اصف فكرتك بالتفصيل، بما في ذلك المشكلة التي تحلها والحل المقترح'),
  ('idea_form', 'category', 'Category', 'الفئة'),
  ('idea_form', 'select_category', 'Select category', 'اختر الفئة'),
  ('idea_form', 'strategic_alignment', 'Strategic Alignment (1-10)', 'التوافق الاستراتيجي (1-10)'),
  ('idea_form', 'rate_alignment', 'Rate alignment', 'قيم التوافق'),
  ('idea_form', 'implementation_cost', 'Implementation Cost ($)', 'تكلفة التنفيذ ($)'),
  ('idea_form', 'estimated_cost', 'Estimated cost', 'التكلفة المقدرة'),
  ('idea_form', 'expected_roi', 'Expected ROI (%)', 'العائد المتوقع (%)'),
  ('idea_form', 'expected_return', 'Expected return', 'العائد المتوقع'),
  ('idea_form', 'submit_idea', 'Submit Idea', 'إرسال الفكرة'),
  ('idea_form', 'submitting', 'Submitting...', 'جاري الإرسال...'),
  ('idea_form', 'save_as_draft', 'Save as Draft', 'حفظ كمسودة'),
  
  -- Categories
  ('categories', 'innovation', 'Innovation', 'الابتكار'),
  ('categories', 'process_improvement', 'Process Improvement', 'تحسين العمليات'),
  ('categories', 'cost_reduction', 'Cost Reduction', 'تقليل التكاليف'),
  ('categories', 'customer_experience', 'Customer Experience', 'تجربة العملاء'),
  ('categories', 'technology', 'Technology', 'التكنولوجيا'),
  ('categories', 'sustainability', 'Sustainability', 'الاستدامة'),
  
  -- Status
  ('status', 'draft', 'Draft', 'مسودة'),
  ('status', 'submitted', 'Submitted', 'مقدم'),
  ('status', 'under_review', 'Under Review', 'قيد المراجعة'),
  ('status', 'approved', 'Approved', 'معتمد'),
  ('status', 'rejected', 'Rejected', 'مرفوض'),
  ('status', 'implemented', 'Implemented', 'منفذ'),
  
  -- Common
  ('common', 'no_ideas_yet', 'No ideas yet', 'لا توجد أفكار بعد'),
  ('common', 'get_started_submitting', 'Get started by submitting your first idea.', 'ابدأ بإرسال فكرتك الأولى.'),
  ('common', 'loading', 'Loading...', 'جاري التحميل...'),
  ('common', 'error', 'Error', 'خطأ'),
  ('common', 'success', 'Success', 'نجح'),
  ('common', 'cost', 'Cost', 'التكلفة'),
  ('common', 'priority', 'Priority', 'الأولوية'),
  ('common', 'alignment', 'Alignment', 'التوافق')
ON CONFLICT (interface_name, position_key) DO UPDATE SET
  english_text = EXCLUDED.english_text,
  arabic_text = EXCLUDED.arabic_text,
  updated_at = NOW();
