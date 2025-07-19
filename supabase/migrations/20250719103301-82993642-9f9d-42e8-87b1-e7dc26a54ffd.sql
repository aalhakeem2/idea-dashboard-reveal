-- Add missing translation entries for the evaluation form
INSERT INTO public.translations (interface_name, position_key, english_text, arabic_text) VALUES
-- Evaluation form translations
('evaluation', 'evaluate_idea', 'Evaluate Idea', 'تقييم الفكرة'),
('evaluation', 'cancel', 'Cancel', 'إلغاء'),
('evaluation', 'provide_evaluation_for', 'Provide your evaluation for:', 'قدم تقييمك لـ:'),
('evaluation', 'idea_details', 'Idea Details', 'تفاصيل الفكرة'),
('evaluation', 'reference', 'Reference', 'المرجع'),
('evaluation', 'title', 'Title', 'العنوان'),
('evaluation', 'description', 'Description', 'الوصف'),
('evaluation', 'category', 'Category', 'الفئة'),
('evaluation', 'feasibility_score', 'Feasibility Score', 'درجة الجدوى'),
('evaluation', 'impact_score', 'Impact Score', 'درجة التأثير'),
('evaluation', 'innovation_score', 'Innovation Score', 'درجة الابتكار'),
('evaluation', 'overall_score', 'Overall Score', 'الدرجة الإجمالية'),
('evaluation', 'not_feasible', 'Not Feasible', 'غير قابل للتطبيق'),
('evaluation', 'highly_feasible', 'Highly Feasible', 'قابل للتطبيق بشدة'),
('evaluation', 'low_impact', 'Low Impact', 'تأثير منخفض'),
('evaluation', 'high_impact', 'High Impact', 'تأثير عالي'),
('evaluation', 'not_innovative', 'Not Innovative', 'غير مبتكر'),
('evaluation', 'highly_innovative', 'Highly Innovative', 'مبتكر جداً'),
('evaluation', 'poor', 'Poor', 'ضعيف'),
('evaluation', 'excellent', 'Excellent', 'ممتاز'),
('evaluation', 'detailed_feedback', 'Detailed Feedback', 'ملاحظات مفصلة'),
('evaluation', 'feedback_placeholder', 'Provide detailed feedback on the idea...', 'قدم ملاحظات مفصلة حول الفكرة...'),
('evaluation', 'recommendation', 'Recommendation', 'التوصية'),
('evaluation', 'select_recommendation', 'Select your recommendation', 'اختر توصيتك'),
('evaluation', 'approve', 'Approve for Implementation', 'الموافقة على التنفيذ'),
('evaluation', 'approve_with_modifications', 'Approve with Modifications', 'الموافقة مع التعديلات'),
('evaluation', 'needs_more_info', 'Needs More Information', 'يحتاج لمعلومات إضافية'),
('evaluation', 'reject', 'Reject', 'رفض'),
('evaluation', 'submit_evaluation', 'Submit Evaluation', 'إرسال التقييم'),
('evaluation', 'submitting', 'Submitting...', 'جاري الإرسال...'),
('evaluation', 'evaluation_submitted', 'Evaluation Submitted', 'تم إرسال التقييم'),
('evaluation', 'evaluation_submitted_success', 'Your evaluation has been submitted successfully!', 'تم إرسال تقييمك بنجاح!'),
('evaluation', 'error', 'Error', 'خطأ'),
('evaluation', 'failed_to_submit', 'Failed to submit evaluation', 'فشل في إرسال التقييم'),

-- Common translations
('common', 'loading', 'Loading...', 'جاري التحميل...'),

-- Dashboard translations
('dashboard', 'recent_ideas_for_evaluation', 'Recent Ideas for Evaluation', 'الأفكار الحديثة للتقييم')

ON CONFLICT (interface_name, position_key) 
DO UPDATE SET 
  english_text = EXCLUDED.english_text,
  arabic_text = EXCLUDED.arabic_text,
  updated_at = now();