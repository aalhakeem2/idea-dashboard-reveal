
-- Phase 1: Clean existing test data and enhance schema for comprehensive localization

-- Clean existing test evaluation data
DELETE FROM public.evaluations;
DELETE FROM public.evaluator_assignments;
DELETE FROM public.idea_action_log WHERE action_type IN ('score_submitted', 'reassigned_to_user');

-- Reset ideas to proper initial states
UPDATE public.ideas 
SET status = CASE 
  WHEN status = 'draft' THEN 'draft'::idea_status
  ELSE 'submitted'::idea_status
END,
current_stage = CASE 
  WHEN status = 'draft' THEN 'draft'
  ELSE 'under_review'
END,
average_evaluation_score = NULL,
evaluated_at = NULL;

-- Add new idea statuses for enhanced workflow
ALTER TYPE idea_status ADD VALUE IF NOT EXISTS 'evaluated';
ALTER TYPE idea_status ADD VALUE IF NOT EXISTS 'needs_revision';
ALTER TYPE idea_status ADD VALUE IF NOT EXISTS 'conditional_approval';

-- Create management decision type
DO $$ BEGIN
  CREATE TYPE management_decision_type AS ENUM (
    'approved', 
    'rejected', 
    'needs_revision', 
    'conditional_approval'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create priority level type
DO $$ BEGIN
  CREATE TYPE priority_level AS ENUM ('high', 'medium', 'low');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create management decisions table
CREATE TABLE IF NOT EXISTS public.management_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES public.ideas(id),
  decision_type management_decision_type NOT NULL,
  decision_by UUID NOT NULL,
  decision_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  priority priority_level,
  department_assignment TEXT,
  decision_reason_en TEXT,
  decision_reason_ar TEXT,
  feedback_en TEXT,
  feedback_ar TEXT,
  conditions_en TEXT,
  conditions_ar TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create idea revisions table
CREATE TABLE IF NOT EXISTS public.idea_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES public.ideas(id),
  revision_number INTEGER NOT NULL,
  requested_by UUID NOT NULL,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  revision_areas TEXT[], -- Areas needing improvement
  feedback_en TEXT,
  feedback_ar TEXT,
  submitter_response_en TEXT,
  submitter_response_ar TEXT,
  status TEXT DEFAULT 'pending', -- pending, in_progress, completed
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add language preference to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(2) DEFAULT 'ar';

-- Enable RLS on new tables
ALTER TABLE public.management_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_revisions ENABLE ROW LEVEL SECURITY;

-- RLS policies for management_decisions
CREATE POLICY "Users can view management decisions for visible ideas" 
  ON public.management_decisions FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.ideas WHERE ideas.id = management_decisions.idea_id));

CREATE POLICY "Management can manage decisions" 
  ON public.management_decisions FOR ALL 
  USING (get_user_role(auth.uid()) = 'management'::user_role);

-- RLS policies for idea_revisions
CREATE POLICY "Users can view revisions for visible ideas" 
  ON public.idea_revisions FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.ideas WHERE ideas.id = idea_revisions.idea_id));

CREATE POLICY "Submitters can update their revision responses" 
  ON public.idea_revisions FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.ideas WHERE ideas.id = idea_revisions.idea_id AND ideas.submitter_id = auth.uid()));

CREATE POLICY "Management can manage revisions" 
  ON public.idea_revisions FOR ALL 
  USING (get_user_role(auth.uid()) = 'management'::user_role);

-- Add triggers for updated_at
CREATE TRIGGER update_management_decisions_updated_at 
  BEFORE UPDATE ON public.management_decisions 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Update the status update function to handle new statuses
CREATE OR REPLACE FUNCTION public.update_idea_status_based_on_evaluations()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  progress_data RECORD;
BEGIN
  -- Get evaluation progress for the idea
  SELECT * INTO progress_data 
  FROM public.get_evaluation_progress(COALESCE(NEW.idea_id, OLD.idea_id)) 
  LIMIT 1;
  
  -- Update idea status based on progress
  IF progress_data.total_assigned = 3 AND progress_data.total_completed = 3 THEN
    -- All evaluations complete - mark as evaluated
    UPDATE public.ideas 
    SET status = 'evaluated'::idea_status,
        current_stage = 'evaluated',
        evaluated_at = now()
    WHERE id = COALESCE(NEW.idea_id, OLD.idea_id)
      AND status != 'evaluated'::idea_status;
  ELSIF progress_data.total_assigned = 3 AND progress_data.total_completed > 0 THEN
    -- Some evaluations complete
    UPDATE public.ideas 
    SET status = 'under_review'::idea_status,
        current_stage = 'being_evaluated'
    WHERE id = COALESCE(NEW.idea_id, OLD.idea_id);
  ELSIF progress_data.total_assigned = 3 THEN
    -- All evaluators assigned but no evaluations yet
    UPDATE public.ideas 
    SET status = 'under_review'::idea_status,
        current_stage = 'being_evaluated'
    WHERE id = COALESCE(NEW.idea_id, OLD.idea_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Insert comprehensive translations for new interfaces
INSERT INTO public.translations (interface_name, position_key, english_text, arabic_text) VALUES
-- Evaluation dashboard translations
('evaluation_dashboard', 'title', 'Evaluation Progress Dashboard', 'لوحة تقدم التقييم'),
('evaluation_dashboard', 'overview', 'Evaluation Overview', 'نظرة عامة على التقييم'),
('evaluation_dashboard', 'pending_evaluations', 'Pending Evaluations', 'التقييمات المعلقة'),
('evaluation_dashboard', 'completed_today', 'Completed Today', 'مكتملة اليوم'),
('evaluation_dashboard', 'average_score', 'Average Score', 'المتوسط العام'),
('evaluation_dashboard', 'evaluation_matrix', 'Evaluation Matrix', 'مصفوفة التقييم'),
('evaluation_dashboard', 'evaluator_details', 'Evaluator Details', 'تفاصيل المقيم'),
('evaluation_dashboard', 'consensus_level', 'Consensus Level', 'مستوى الإجماع'),
('evaluation_dashboard', 'high_consensus', 'High Consensus', 'إجماع عالي'),
('evaluation_dashboard', 'medium_consensus', 'Medium Consensus', 'إجماع متوسط'),
('evaluation_dashboard', 'low_consensus', 'Low Consensus', 'إجماع منخفض'),

-- Management decisions translations
('management_decisions', 'title', 'Management Decision', 'قرار الإدارة'),
('management_decisions', 'decision_panel', 'Decision Panel', 'لوحة القرارات'),
('management_decisions', 'approve', 'Approve', 'الموافقة'),
('management_decisions', 'reject', 'Reject', 'رفض'),
('management_decisions', 'request_revision', 'Request Revision', 'طلب مراجعة'),
('management_decisions', 'conditional_approval', 'Conditional Approval', 'موافقة مشروطة'),
('management_decisions', 'priority_high', 'High Priority', 'أولوية عالية'),
('management_decisions', 'priority_medium', 'Medium Priority', 'أولوية متوسطة'),
('management_decisions', 'priority_low', 'Low Priority', 'أولوية منخفضة'),
('management_decisions', 'department_assignment', 'Department Assignment', 'تخصيص القسم'),
('management_decisions', 'decision_reason', 'Decision Reason', 'سبب القرار'),
('management_decisions', 'feedback', 'Feedback', 'الملاحظات'),
('management_decisions', 'conditions', 'Conditions', 'الشروط'),
('management_decisions', 'save_decision', 'Save Decision', 'حفظ القرار'),

-- Revision workflow translations
('revision_workflow', 'title', 'Revision Workflow', 'سير عمل المراجعة'),
('revision_workflow', 'revision_requested', 'Revision Requested', 'طلب مراجعة'),
('revision_workflow', 'revision_areas', 'Areas for Improvement', 'مجالات التحسين'),
('revision_workflow', 'submitter_response', 'Submitter Response', 'رد مقدم الفكرة'),
('revision_workflow', 'revision_status_pending', 'Pending', 'معلق'),
('revision_workflow', 'revision_status_in_progress', 'In Progress', 'قيد التنفيذ'),
('revision_workflow', 'revision_status_completed', 'Completed', 'مكتمل'),
('revision_workflow', 'submit_response', 'Submit Response', 'إرسال الرد'),

-- Evaluator feedback translations
('evaluator_feedback', 'structured_feedback', 'Structured Feedback', 'ملاحظات منظمة'),
('evaluator_feedback', 'strengths', 'Strengths', 'نقاط القوة'),
('evaluator_feedback', 'weaknesses', 'نقاط الضعف'),
('evaluator_feedback', 'improvement_suggestions', 'Improvement Suggestions', 'اقتراحات التحسين'),
('evaluator_feedback', 'implementation_risks', 'Implementation Risks', 'مخاطر التنفيذ'),
('evaluator_feedback', 'resource_requirements', 'Resource Requirements', 'متطلبات الموارد'),

-- Extended idea status translations
('idea_status_extended', 'evaluated', 'Evaluated', 'تم التقييم'),
('idea_status_extended', 'needs_revision', 'Needs Revision', 'يحتاج مراجعة'),
('idea_status_extended', 'conditional_approval', 'Conditional Approval', 'موافقة مشروطة'),

-- Notification translations
('notifications', 'idea_evaluated', 'Your idea has been evaluated', 'تم تقييم فكرتك'),
('notifications', 'decision_made', 'A decision has been made on your idea', 'تم اتخاذ قرار بشأن فكرتك'),
('notifications', 'revision_requested', 'Revision requested for your idea', 'طلب مراجعة لفكرتك'),
('notifications', 'evaluation_assigned', 'New evaluation assigned to you', 'تم تخصيص تقييم جديد لك'),
('notifications', 'evaluation_overdue', 'Evaluation overdue', 'تقييم متأخر'),

-- Analytics reports translations
('analytics_reports', 'evaluation_turnaround', 'Evaluation Turnaround Time', 'وقت دوران التقييم'),
('analytics_reports', 'success_rate', 'Success Rate', 'معدل النجاح'),
('analytics_reports', 'performance_metrics', 'Performance Metrics', 'مقاييس الأداء'),
('analytics_reports', 'trend_analysis', 'Trend Analysis', 'تحليل الاتجاهات'),
('analytics_reports', 'export_report', 'Export Report', 'تصدير التقرير')

ON CONFLICT (interface_name, position_key) DO UPDATE SET
english_text = EXCLUDED.english_text,
arabic_text = EXCLUDED.arabic_text,
updated_at = now();

-- Insert extended list of values for comprehensive localization
INSERT INTO public.list_of_values (list_key, value_key, value_en, value_ar) VALUES
-- Evaluation criteria
('evaluation_criteria', 'feasibility', 'Feasibility', 'الجدوى'),
('evaluation_criteria', 'impact', 'Impact', 'التأثير'),
('evaluation_criteria', 'innovation', 'Innovation', 'الابتكار'),
('evaluation_criteria', 'overall', 'Overall', 'العام'),
('evaluation_criteria', 'enrichment', 'Enrichment', 'الإثراء'),

-- Decision types
('decision_types', 'approved', 'Approved', 'موافق عليه'),
('decision_types', 'rejected', 'Rejected', 'مرفوض'),
('decision_types', 'needs_revision', 'Needs Revision', 'يحتاج مراجعة'),
('decision_types', 'conditional_approval', 'Conditional Approval', 'موافقة مشروطة'),

-- Revision categories
('revision_categories', 'technical_details', 'Technical Details', 'التفاصيل التقنية'),
('revision_categories', 'financial_analysis', 'Financial Analysis', 'التحليل المالي'),
('revision_categories', 'market_research', 'Market Research', 'بحث السوق'),
('revision_categories', 'implementation_plan', 'Implementation Plan', 'خطة التنفيذ'),
('revision_categories', 'risk_assessment', 'Risk Assessment', 'تقييم المخاطر'),

-- Department assignments
('department_assignments', 'technology', 'Technology Department', 'قسم التكنولوجيا'),
('department_assignments', 'finance', 'Finance Department', 'قسم المالية'),
('department_assignments', 'marketing', 'Marketing Department', 'قسم التسويق'),
('department_assignments', 'operations', 'Operations Department', 'قسم العمليات'),
('department_assignments', 'hr', 'Human Resources', 'الموارد البشرية'),

-- Priority levels
('priority_levels', 'high', 'High Priority', 'أولوية عالية'),
('priority_levels', 'medium', 'Medium Priority', 'أولوية متوسطة'),
('priority_levels', 'low', 'Low Priority', 'أولوية منخفضة')

ON CONFLICT (list_key, value_key) DO UPDATE SET
value_en = EXCLUDED.value_en,
value_ar = EXCLUDED.value_ar;
