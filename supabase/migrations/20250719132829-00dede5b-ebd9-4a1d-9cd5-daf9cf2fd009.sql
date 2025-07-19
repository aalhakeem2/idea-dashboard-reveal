
-- Step 1: Clean existing evaluation data to prevent conflicts
DELETE FROM public.evaluations;

-- Step 2: Create evaluation_type enum
CREATE TYPE public.evaluation_type AS ENUM ('technology', 'finance', 'commercial');

-- Step 3: Update evaluations table with new fields
ALTER TABLE public.evaluations 
ADD COLUMN evaluation_type evaluation_type NOT NULL DEFAULT 'technology',
ADD COLUMN enrichment_score integer CHECK (enrichment_score >= 1 AND enrichment_score <= 5);

-- Step 4: Drop the old unique constraint and create new one including evaluation_type
ALTER TABLE public.evaluations DROP CONSTRAINT IF EXISTS unique_idea_evaluator;
ALTER TABLE public.evaluations ADD CONSTRAINT unique_idea_evaluator_type UNIQUE (idea_id, evaluator_id, evaluation_type);

-- Step 5: Create evaluator_assignments table
CREATE TABLE public.evaluator_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id uuid NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
  evaluator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  evaluation_type evaluation_type NOT NULL,
  assigned_by uuid NOT NULL REFERENCES public.profiles(id),
  assigned_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  CONSTRAINT unique_idea_evaluation_type UNIQUE (idea_id, evaluation_type),
  CONSTRAINT no_duplicate_evaluator_per_idea UNIQUE (idea_id, evaluator_id)
);

-- Step 6: Add specialization field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN specialization evaluation_type[] DEFAULT '{}';

-- Step 7: Enable RLS on evaluator_assignments table
ALTER TABLE public.evaluator_assignments ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS policies for evaluator_assignments
CREATE POLICY "Users can view evaluator assignments" 
ON public.evaluator_assignments 
FOR SELECT 
USING (true);

CREATE POLICY "Management can manage evaluator assignments" 
ON public.evaluator_assignments 
FOR ALL 
USING (get_user_role(auth.uid()) = 'management');

CREATE POLICY "Evaluators can view their assignments" 
ON public.evaluator_assignments 
FOR SELECT 
USING (evaluator_id = auth.uid());

-- Step 9: Update evaluations RLS policies to work with evaluation_type
DROP POLICY IF EXISTS "Evaluators can insert evaluations" ON public.evaluations;
CREATE POLICY "Evaluators can insert evaluations" 
ON public.evaluations 
FOR INSERT 
WITH CHECK (
  get_user_role(auth.uid()) IN ('evaluator', 'management') AND
  EXISTS (
    SELECT 1 FROM public.evaluator_assignments 
    WHERE idea_id = evaluations.idea_id 
    AND evaluator_id = auth.uid() 
    AND evaluation_type = evaluations.evaluation_type 
    AND is_active = true
  )
);

DROP POLICY IF EXISTS "Evaluators can update own evaluations" ON public.evaluations;
CREATE POLICY "Evaluators can update own evaluations" 
ON public.evaluations 
FOR UPDATE 
USING (
  (auth.uid() = evaluator_id AND 
   EXISTS (
     SELECT 1 FROM public.evaluator_assignments 
     WHERE idea_id = evaluations.idea_id 
     AND evaluator_id = auth.uid() 
     AND evaluation_type = evaluations.evaluation_type 
     AND is_active = true
   )) OR 
  get_user_role(auth.uid()) = 'management'
);

-- Step 10: Create helper function to check evaluation completion progress
CREATE OR REPLACE FUNCTION public.get_evaluation_progress(p_idea_id uuid)
RETURNS TABLE (
  total_assigned integer,
  total_completed integer,
  progress_percentage numeric,
  missing_types evaluation_type[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(assigned.count, 0)::integer as total_assigned,
    COALESCE(completed.count, 0)::integer as total_completed,
    CASE 
      WHEN COALESCE(assigned.count, 0) = 0 THEN 0
      ELSE ROUND((COALESCE(completed.count, 0)::numeric / assigned.count) * 100, 2)
    END as progress_percentage,
    COALESCE(
      ARRAY(
        SELECT unnest(ARRAY['technology', 'finance', 'commercial']::evaluation_type[])
        EXCEPT
        SELECT ea.evaluation_type 
        FROM public.evaluator_assignments ea 
        WHERE ea.idea_id = p_idea_id AND ea.is_active = true
      ),
      ARRAY[]::evaluation_type[]
    ) as missing_types
  FROM 
    (SELECT COUNT(*)::integer as count 
     FROM public.evaluator_assignments 
     WHERE idea_id = p_idea_id AND is_active = true) assigned
  CROSS JOIN
    (SELECT COUNT(*)::integer as count 
     FROM public.evaluations e
     JOIN public.evaluator_assignments ea 
       ON e.idea_id = ea.idea_id 
       AND e.evaluator_id = ea.evaluator_id 
       AND e.evaluation_type = ea.evaluation_type
     WHERE e.idea_id = p_idea_id 
       AND ea.is_active = true 
       AND e.overall_score IS NOT NULL) completed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 11: Create function to auto-update idea status based on evaluation progress
CREATE OR REPLACE FUNCTION public.update_idea_status_based_on_evaluations()
RETURNS TRIGGER AS $$
DECLARE
  progress_data RECORD;
BEGIN
  -- Get evaluation progress for the idea
  SELECT * INTO progress_data 
  FROM public.get_evaluation_progress(COALESCE(NEW.idea_id, OLD.idea_id)) 
  LIMIT 1;
  
  -- Update idea status based on progress
  IF progress_data.total_assigned = 3 AND progress_data.total_completed = 3 THEN
    -- All evaluations complete
    UPDATE public.ideas 
    SET status = 'under_review'::idea_status,
        evaluated_at = now()
    WHERE id = COALESCE(NEW.idea_id, OLD.idea_id);
  ELSIF progress_data.total_assigned = 3 AND progress_data.total_completed > 0 THEN
    -- Some evaluations complete
    UPDATE public.ideas 
    SET status = 'under_review'::idea_status
    WHERE id = COALESCE(NEW.idea_id, OLD.idea_id);
  ELSIF progress_data.total_assigned = 3 THEN
    -- All evaluators assigned but no evaluations yet
    UPDATE public.ideas 
    SET status = 'under_review'::idea_status
    WHERE id = COALESCE(NEW.idea_id, OLD.idea_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 12: Create triggers for automatic status updates
CREATE TRIGGER trg_update_idea_status_on_evaluation
  AFTER INSERT OR UPDATE OR DELETE ON public.evaluations
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_idea_status_based_on_evaluations();

CREATE TRIGGER trg_update_idea_status_on_assignment
  AFTER INSERT OR UPDATE OR DELETE ON public.evaluator_assignments
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_idea_status_based_on_evaluations();

-- Step 13: Update the average score calculation function to handle multiple evaluation types
CREATE OR REPLACE FUNCTION public.calculate_comprehensive_evaluation_score(idea_uuid uuid)
RETURNS TABLE (
  technology_score numeric,
  finance_score numeric,
  commercial_score numeric,
  overall_average numeric,
  enrichment_average numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(
      (SELECT AVG((feasibility_score + impact_score + innovation_score + overall_score) / 4.0)
       FROM public.evaluations e
       JOIN public.evaluator_assignments ea ON e.idea_id = ea.idea_id 
         AND e.evaluator_id = ea.evaluator_id 
         AND e.evaluation_type = ea.evaluation_type
       WHERE e.idea_id = idea_uuid 
         AND e.evaluation_type = 'technology' 
         AND ea.is_active = true
         AND e.overall_score IS NOT NULL), 0
    ) as technology_score,
    
    COALESCE(
      (SELECT AVG((feasibility_score + impact_score + innovation_score + overall_score) / 4.0)
       FROM public.evaluations e
       JOIN public.evaluator_assignments ea ON e.idea_id = ea.idea_id 
         AND e.evaluator_id = ea.evaluator_id 
         AND e.evaluation_type = ea.evaluation_type
       WHERE e.idea_id = idea_uuid 
         AND e.evaluation_type = 'finance' 
         AND ea.is_active = true
         AND e.overall_score IS NOT NULL), 0
    ) as finance_score,
    
    COALESCE(
      (SELECT AVG((feasibility_score + impact_score + innovation_score + overall_score) / 4.0)
       FROM public.evaluations e
       JOIN public.evaluator_assignments ea ON e.idea_id = ea.idea_id 
         AND e.evaluator_id = ea.evaluator_id 
         AND e.evaluation_type = ea.evaluation_type
       WHERE e.idea_id = idea_uuid 
         AND e.evaluation_type = 'commercial' 
         AND ea.is_active = true
         AND e.overall_score IS NOT NULL), 0
    ) as commercial_score,
    
    COALESCE(
      (SELECT AVG((feasibility_score + impact_score + innovation_score + overall_score) / 4.0)
       FROM public.evaluations e
       JOIN public.evaluator_assignments ea ON e.idea_id = ea.idea_id 
         AND e.evaluator_id = ea.evaluator_id 
         AND e.evaluation_type = ea.evaluation_type
       WHERE e.idea_id = idea_uuid 
         AND ea.is_active = true
         AND e.overall_score IS NOT NULL), 0
    ) as overall_average,
    
    COALESCE(
      (SELECT AVG(enrichment_score)
       FROM public.evaluations e
       JOIN public.evaluator_assignments ea ON e.idea_id = ea.idea_id 
         AND e.evaluator_id = ea.evaluator_id 
         AND e.evaluation_type = ea.evaluation_type
       WHERE e.idea_id = idea_uuid 
         AND ea.is_active = true
         AND e.enrichment_score IS NOT NULL), 0
    ) as enrichment_average;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 14: Create indexes for performance
CREATE INDEX idx_evaluator_assignments_idea_id ON public.evaluator_assignments(idea_id);
CREATE INDEX idx_evaluator_assignments_evaluator_id ON public.evaluator_assignments(evaluator_id);
CREATE INDEX idx_evaluator_assignments_type ON public.evaluator_assignments(evaluation_type);
CREATE INDEX idx_evaluations_type ON public.evaluations(evaluation_type);
CREATE INDEX idx_profiles_specialization ON public.profiles USING GIN(specialization);

-- Step 15: Insert sample specializations for existing evaluator users
UPDATE public.profiles 
SET specialization = ARRAY['technology', 'finance']::evaluation_type[]
WHERE role = 'evaluator' AND email = 'evaluator@you.com';

UPDATE public.profiles 
SET specialization = ARRAY['commercial', 'finance']::evaluation_type[]
WHERE role = 'management' AND email = 'management@you.com';

UPDATE public.profiles 
SET specialization = ARRAY['technology', 'commercial', 'finance']::evaluation_type[]
WHERE role = 'management' AND email = 'test@you.com';
