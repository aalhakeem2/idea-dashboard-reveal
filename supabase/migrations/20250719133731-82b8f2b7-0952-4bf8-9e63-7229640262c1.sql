-- Add missing translation entries for evaluator management
INSERT INTO public.translations (interface_name, position_key, english_text, arabic_text) VALUES
-- Sidebar translations
('sidebar', 'evaluator_management', 'Evaluator Management', 'إدارة المُقيمين'),

-- Evaluator management translations
('evaluator_management', 'assignment_management', 'Evaluator Assignment Management', 'إدارة تعيين المُقيمين'),
('evaluator_management', 'assign_evaluators_desc', 'Assign evaluators to submitted ideas and track evaluation progress', 'تعيين المُقيمين للأفكار المُرسلة ومتابعة تقدم التقييم'),
('evaluator_management', 'no_ideas_need_assignment', 'No ideas need evaluator assignment', 'لا توجد أفكار تحتاج لتعيين مُقيمين'),
('evaluator_management', 'all_ideas_assigned', 'All submitted ideas have been assigned evaluators', 'جميع الأفكار المُرسلة تم تعيين مُقيمين لها'),
('evaluator_management', 'assigned', 'Assigned', 'مُعين'),
('evaluator_management', 'assign_evaluators', 'Assign Evaluators', 'تعيين مُقيمين'),
('evaluator_management', 'assignment_progress', 'Assignment Progress', 'تقدم التعيين'),
('evaluator_management', 'assigned_evaluators', 'Assigned Evaluators', 'المُقيمون المُعينون'),
('evaluator_management', 'missing_evaluation_types', 'Missing Evaluation Types', 'الأنواع المطلوبة'),
('evaluator_management', 'assign_evaluators_modal', 'Assign Evaluators', 'تعيين المُقيمين'),
('evaluator_management', 'assign_three_evaluators', 'Assign three specialized evaluators to assess this idea', 'تعيين ثلاثة مُقيمين مختصين لتقييم هذه الفكرة'),
('evaluator_management', 'assignment_status', 'Assignment Status', 'حالة التعيين'),
('evaluator_management', 'assignment_by_specialization', 'Evaluator Assignment by Specialization', 'تعيين المُقيمين حسب التخصص'),
('evaluator_management', 'select_evaluator', 'Select evaluator', 'اختر مُقيم'),
('evaluator_management', 'none', 'None', 'لا يوجد'),
('evaluator_management', 'tasks', 'tasks', 'مهام'),
('evaluator_management', 'current_workload', 'Current workload:', 'المهام الحالية:'),
('evaluator_management', 'no_evaluators_available', 'No evaluators available for this specialization', 'لا يوجد مُقيمين متاحين لهذا التخصص'),
('evaluator_management', 'save_assignments', 'Save Assignments', 'حفظ التعيينات'),
('evaluator_management', 'saving', 'Saving...', 'جاري الحفظ...'),

-- Evaluator pool management translations
('evaluator_pool', 'pool_management', 'Evaluator Pool Management', 'إدارة مجموعة المُقيمين'),
('evaluator_pool', 'manage_specializations', 'Manage evaluator specializations and review performance statistics', 'إدارة تخصصات المُقيمين ومراجعة إحصائيات الأداء'),
('evaluator_pool', 'total_evaluators', 'Total Evaluators', 'إجمالي المُقيمين'),
('evaluator_pool', 'active_assignments', 'Active Assignments', 'المهام النشطة'),
('evaluator_pool', 'completed_evaluations', 'Completed Evaluations', 'التقييمات المكتملة'),
('evaluator_pool', 'active_tasks', 'Active Tasks', 'مهام نشطة'),
('evaluator_pool', 'completed', 'Completed', 'مكتملة'),
('evaluator_pool', 'avg_time', 'Avg Time', 'متوسط الوقت'),
('evaluator_pool', 'role', 'Role', 'الدور'),
('evaluator_pool', 'specializations', 'Specializations', 'التخصصات'),
('evaluator_pool', 'no_specializations', 'No specializations', 'لا يوجد تخصص'),
('evaluator_pool', 'no_evaluators_found', 'No evaluators found', 'لا يوجد مُقيمين'),
('evaluator_pool', 'no_evaluators_in_system', 'No evaluators found in the system', 'لم يتم العثور على أي مُقيمين في النظام'),

-- Technology/Finance/Commercial translations
('evaluation_types', 'technology_evaluation', 'Technology Evaluation', 'التقييم التقني'),
('evaluation_types', 'finance_evaluation', 'Finance Evaluation', 'التقييم المالي'),
('evaluation_types', 'commercial_evaluation', 'Commercial Evaluation', 'التقييم التجاري')

ON CONFLICT (interface_name, position_key) 
DO UPDATE SET 
  english_text = EXCLUDED.english_text,
  arabic_text = EXCLUDED.arabic_text,
  updated_at = now();