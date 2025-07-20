-- Add missing list of values for revision areas and improvement areas
INSERT INTO public.list_of_values (list_key, value_key, value_en, value_ar, is_active) VALUES
('revision_areas', 'technical_aspects', 'Technical Aspects', 'الجوانب التقنية', true),
('revision_areas', 'financial_analysis', 'Financial Analysis', 'التحليل المالي', true),
('revision_areas', 'market_research', 'Market Research', 'بحث السوق', true),
('revision_areas', 'implementation_plan', 'Implementation Plan', 'خطة التنفيذ', true),
('revision_areas', 'risk_assessment', 'Risk Assessment', 'تقييم المخاطر', true),
('revision_areas', 'resource_planning', 'Resource Planning', 'تخطيط الموارد', true),
('revision_areas', 'legal_compliance', 'Legal Compliance', 'الامتثال القانوني', true),
('revision_areas', 'timeline_adjustment', 'Timeline Adjustment', 'تعديل الجدول الزمني', true);

-- Add missing translations
INSERT INTO public.translations (interface_name, position_key, english_text, arabic_text) VALUES
('dashboard', 'seed_sample_data', 'Seed Sample Data', 'إنشاء بيانات تجريبية'),
('header', 'search_placeholder', 'Search ideas...', 'البحث عن الأفكار...'),
('header', 'filter', 'Filter', 'تصفية'),
('management_decisions', 'title', 'Management Decision Panel', 'لوحة قرارات الإدارة'),
('management_decisions', 'decision_panel', 'Decision Type', 'نوع القرار'),
('management_decisions', 'approve', 'Approve', 'موافقة'),
('management_decisions', 'reject', 'Reject', 'رفض'),
('management_decisions', 'request_revision', 'Request Revision', 'طلب مراجعة'),
('management_decisions', 'conditional_approval', 'Conditional Approval', 'موافقة مشروطة'),
('management_decisions', 'department_assignment', 'Department Assignment', 'تعيين القسم'),
('management_decisions', 'decision_reason', 'Decision Reason', 'سبب القرار'),
('management_decisions', 'feedback', 'Feedback', 'التعليقات'),
('management_decisions', 'conditions', 'Conditions', 'الشروط'),
('management_decisions', 'save_decision', 'Save Decision', 'حفظ القرار')

ON CONFLICT (interface_name, position_key) DO UPDATE SET
english_text = EXCLUDED.english_text,
arabic_text = EXCLUDED.arabic_text,
updated_at = now();