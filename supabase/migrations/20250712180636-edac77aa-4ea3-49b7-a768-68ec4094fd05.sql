-- Insert missing translations for the idea submission form and dashboard
INSERT INTO public.translations (interface_name, position_key, english_text, arabic_text) VALUES
-- Idea form translations
('idea_form', 'strategic_alignment', 'Strategic Alignment', 'التوافق الاستراتيجي'),
('idea_form', 'file_attachments_optional', 'File Attachments (Optional)', 'المرفقات (اختياري)'),
('idea_form', 'prototype_images', 'Prototype Images', 'صور النموذج الأولي'),
('idea_form', 'pricing_offers', 'Pricing Offers', 'عروض الأسعار'),
('idea_form', 'feasibility_study', 'Feasibility Study', 'دراسة الجدوى'),
('idea_form', 'upload_prototype_images', 'Upload prototype images', 'تحميل صور النموذج الأولي'),
('idea_form', 'upload_pricing_documents', 'Upload pricing documents', 'تحميل وثائق الأسعار'),
('idea_form', 'upload_feasibility_documents', 'Upload feasibility documents', 'تحميل وثائق دراسة الجدوى'),
('idea_form', 'multiple_files_allowed', 'Multiple files allowed • Max 10MB', 'ملفات متعددة مسموحة • أقصى حد 10 ميجابايت'),
('idea_form', 'single_file_only', 'Single file only • Max 10MB', 'ملف واحد فقط • أقصى حد 10 ميجابايت'),
('idea_form', 'select_strategic_alignment', 'Select strategic alignment areas...', 'اختر مجالات التوافق الاستراتيجي...'),

-- Dashboard translations
('dashboard', 'ideas_overview', 'Ideas Overview', 'نظرة عامة على الأفكار'),
('dashboard', 'my_ideas', 'My Ideas', 'أفكاري'),
('dashboard', 'assigned_ideas', 'Assigned Ideas', 'الأفكار المخصصة'),
('dashboard', 'total_ideas', 'Total Ideas', 'إجمالي الأفكار'),
('dashboard', 'pending_evaluation', 'Pending Evaluation', 'في انتظار التقييم'),
('dashboard', 'approved_ideas', 'Approved Ideas', 'الأفكار المعتمدة'),
('dashboard', 'implemented_ideas', 'Implemented Ideas', 'الأفكار المنفذة'),
('dashboard', 'reference_code', 'Reference Code', 'رمز المرجع'),
('dashboard', 'average_score', 'Average Score', 'المتوسط'),
('dashboard', 'implementation_cost', 'Implementation Cost', 'تكلفة التنفيذ'),
('dashboard', 'expected_roi', 'Expected ROI', 'العائد المتوقع'),
('dashboard', 'submitted_at', 'Submitted At', 'تاريخ التقديم'),
('dashboard', 'view_details', 'View Details', 'عرض التفاصيل'),
('dashboard', 'evaluate', 'Evaluate', 'تقييم'),
('dashboard', 'no_ideas_assigned', 'No ideas assigned to you yet.', 'لم يتم تخصيص أي أفكار لك بعد.'),
('dashboard', 'no_ideas_submitted', 'You haven\'t submitted any ideas yet.', 'لم تقدم أي أفكار بعد.'),
('dashboard', 'start_submitting', 'Start by submitting your first idea!', 'ابدأ بتقديم فكرتك الأولى!'),

-- Status translations
('status', 'draft', 'Draft', 'مسودة'),
('status', 'submitted', 'Submitted', 'مقدم'),
('status', 'under_review', 'Under Review', 'قيد المراجعة'),
('status', 'approved', 'Approved', 'معتمد'),
('status', 'rejected', 'Rejected', 'مرفوض'),
('status', 'implemented', 'Implemented', 'منفذ'),

-- Common translations
('common', 'loading', 'Loading...', 'جاري التحميل...'),
('common', 'no_data', 'No data available', 'لا توجد بيانات متاحة'),
('common', 'actions', 'Actions', 'الإجراءات'),
('common', 'status', 'Status', 'الحالة'),
('common', 'category', 'Category', 'الفئة'),
('common', 'date', 'Date', 'التاريخ'),
('common', 'score', 'Score', 'النتيجة')

ON CONFLICT (interface_name, position_key) DO UPDATE SET
english_text = EXCLUDED.english_text,
arabic_text = EXCLUDED.arabic_text,
updated_at = now();

-- Insert strategic alignment values in list_of_values
INSERT INTO public.list_of_values (list_key, value_key, value_en, value_ar) VALUES
('strategic_alignment', 'digital_transformation', 'Digital Transformation', 'التحول الرقمي'),
('strategic_alignment', 'customer_experience', 'Customer Experience Enhancement', 'تحسين تجربة العملاء'),
('strategic_alignment', 'operational_efficiency', 'Operational Efficiency', 'الكفاءة التشغيلية'),
('strategic_alignment', 'cost_optimization', 'Cost Optimization', 'تحسين التكاليف'),
('strategic_alignment', 'innovation_culture', 'Innovation Culture', 'ثقافة الابتكار'),
('strategic_alignment', 'sustainability', 'Sustainability', 'الاستدامة'),
('strategic_alignment', 'market_expansion', 'Market Expansion', 'توسيع السوق'),
('strategic_alignment', 'talent_development', 'Talent Development', 'تطوير المواهب')
ON CONFLICT (list_key, value_key) DO UPDATE SET
value_en = EXCLUDED.value_en,
value_ar = EXCLUDED.value_ar;