-- Add Priority List of Values
INSERT INTO public.list_of_values (list_key, value_key, value_en, value_ar, is_active) VALUES
('priority', 'high', 'High', 'عالي', true),
('priority', 'medium', 'Medium', 'متوسط', true),
('priority', 'low', 'Low', 'منخفض', true);

-- Add Department Assignment List of Values
INSERT INTO public.list_of_values (list_key, value_key, value_en, value_ar, is_active) VALUES
('department_assignment', 'is_technical', 'IS Technical', 'تقنية المعلومات', true),
('department_assignment', 'telecom', 'Telecom', 'الاتصالات', true),
('department_assignment', 'marketing', 'Marketing', 'التسويق', true),
('department_assignment', 'sales_commercial', 'Sales and Commercial', 'المبيعات والتجاري', true),
('department_assignment', 'administration', 'Administration', 'الإدارة', true),
('department_assignment', 'customer_service', 'Customer Service Center', 'مركز خدمة العملاء', true),
('department_assignment', 'customer_relations', 'Customer Relation Division', 'قسم علاقات العملاء', true),
('department_assignment', 'risk', 'Risk', 'المخاطر', true),
('department_assignment', 'internal_audit', 'Internal Audit and Forensics', 'التدقيق الداخلي والجنائيات', true),
('department_assignment', 'security', 'Security', 'الأمن', true),
('department_assignment', 'corporate_affairs', 'Corporate Affairs', 'الشؤون المؤسسية', true);

-- Add Decision Reason List of Values
INSERT INTO public.list_of_values (list_key, value_key, value_en, value_ar, is_active) VALUES
('decision_reason', 'technical_feasibility', 'Technical Feasibility', 'الجدوى التقنية', true),
('decision_reason', 'financial_viability', 'Financial Viability', 'الجدوى المالية', true),
('decision_reason', 'strategic_alignment', 'Strategic Alignment', 'التوافق الاستراتيجي', true),
('decision_reason', 'resource_availability', 'Resource Availability', 'توفر الموارد', true),
('decision_reason', 'market_demand', 'Market Demand', 'الطلب في السوق', true),
('decision_reason', 'regulatory_compliance', 'Regulatory Compliance', 'الامتثال التنظيمي', true),
('decision_reason', 'risk_assessment', 'Risk Assessment', 'تقييم المخاطر', true),
('decision_reason', 'innovation_potential', 'Innovation Potential', 'إمكانية الابتكار', true);

-- Add comprehensive translations for Management Decision Panel
INSERT INTO public.translations (interface_name, position_key, english_text, arabic_text) VALUES
('management_decision', 'panel_title', 'Management Decision', 'قرار الإدارة'),
('management_decision', 'current_status', 'Current Status', 'الحالة الحالية'),
('management_decision', 'decision_type', 'Decision Type', 'نوع القرار'),
('management_decision', 'approve', 'Approve', 'موافقة'),
('management_decision', 'reject', 'Reject', 'رفض'),
('management_decision', 'needs_revision', 'Needs Revision', 'يحتاج مراجعة'),
('management_decision', 'conditional_approval', 'Conditional Approval', 'موافقة مشروطة'),
('management_decision', 'priority_level', 'Priority Level', 'مستوى الأولوية'),
('management_decision', 'department_assignment', 'Department Assignment', 'تعيين القسم'),
('management_decision', 'decision_reason', 'Decision Reason', 'سبب القرار'),
('management_decision', 'decision_reasons', 'Decision Reasons', 'أسباب القرار'),
('management_decision', 'feedback_en', 'Feedback (English)', 'التعليقات (الإنجليزية)'),
('management_decision', 'feedback_ar', 'Feedback (Arabic)', 'التعليقات (العربية)'),
('management_decision', 'conditions_en', 'Conditions (English)', 'الشروط (الإنجليزية)'),
('management_decision', 'conditions_ar', 'Conditions (Arabic)', 'الشروط (العربية)'),
('management_decision', 'submit_decision', 'Submit Decision', 'إرسال القرار'),
('management_decision', 'submitting', 'Submitting...', 'جاري الإرسال...'),
('management_decision', 'select_priority', 'Select Priority', 'اختر الأولوية'),
('management_decision', 'select_department', 'Select Department', 'اختر القسم'),
('management_decision', 'select_reasons', 'Select Reasons', 'اختر الأسباب'),
('management_decision', 'provide_feedback', 'Provide detailed feedback about this decision', 'قدم تعليقات مفصلة حول هذا القرار'),
('management_decision', 'specify_conditions', 'Specify conditions for approval', 'حدد شروط الموافقة'),
('management_decision', 'decision_submitted', 'Decision submitted successfully', 'تم إرسال القرار بنجاح'),
('management_decision', 'submission_error', 'Error submitting decision', 'خطأ في إرسال القرار'),
('management_decision', 'select_decision_type', 'Please select a decision type', 'يرجى اختيار نوع القرار'),
('management_decision', 'select_priority_required', 'Please select a priority level', 'يرجى اختيار مستوى الأولوية'),
('management_decision', 'select_department_required', 'Please select a department', 'يرجى اختيار قسم'),

-- Add translations for form labels and common UI elements
('common', 'loading', 'Loading...', 'جاري التحميل...'),
('common', 'select_option', 'Select option', 'اختر خيار'),
('common', 'required_field', 'This field is required', 'هذا الحقل مطلوب'),
('common', 'save', 'Save', 'حفظ'),
('common', 'cancel', 'Cancel', 'إلغاء'),
('common', 'edit', 'Edit', 'تعديل'),
('common', 'delete', 'Delete', 'حذف'),
('common', 'view', 'View', 'عرض'),
('common', 'search', 'Search', 'بحث'),
('common', 'filter', 'Filter', 'تصفية'),
('common', 'sort', 'Sort', 'ترتيب'),
('common', 'actions', 'Actions', 'الإجراءات'),
('common', 'status', 'Status', 'الحالة'),
('common', 'date', 'Date', 'التاريخ'),
('common', 'time', 'Time', 'الوقت'),
('common', 'name', 'Name', 'الاسم'),
('common', 'email', 'Email', 'البريد الإلكتروني'),
('common', 'phone', 'Phone', 'الهاتف'),
('common', 'address', 'Address', 'العنوان'),
('common', 'description', 'Description', 'الوصف'),
('common', 'title', 'Title', 'العنوان'),
('common', 'submit', 'Submit', 'إرسال'),
('common', 'reset', 'Reset', 'إعادة تعيين'),
('common', 'close', 'Close', 'إغلاق'),
('common', 'open', 'Open', 'فتح'),
('common', 'yes', 'Yes', 'نعم'),
('common', 'no', 'No', 'لا'),
('common', 'confirm', 'Confirm', 'تأكيد'),
('common', 'back', 'Back', 'رجوع'),
('common', 'next', 'Next', 'التالي'),
('common', 'previous', 'Previous', 'السابق'),
('common', 'home', 'Home', 'الرئيسية'),
('common', 'dashboard', 'Dashboard', 'لوحة التحكم'),
('common', 'profile', 'Profile', 'الملف الشخصي'),
('common', 'settings', 'Settings', 'الإعدادات'),
('common', 'logout', 'Logout', 'تسجيل خروج'),
('common', 'login', 'Login', 'تسجيل دخول'),
('common', 'register', 'Register', 'تسجيل'),
('common', 'welcome', 'Welcome', 'مرحباً'),
('common', 'error', 'Error', 'خطأ'),
('common', 'success', 'Success', 'نجح'),
('common', 'warning', 'Warning', 'تحذير'),
('common', 'info', 'Information', 'معلومات'),
('common', 'help', 'Help', 'مساعدة'),
('common', 'about', 'About', 'حول'),
('common', 'contact', 'Contact', 'اتصل بنا')

ON CONFLICT (interface_name, position_key) DO UPDATE SET
english_text = EXCLUDED.english_text,
arabic_text = EXCLUDED.arabic_text,
updated_at = now();