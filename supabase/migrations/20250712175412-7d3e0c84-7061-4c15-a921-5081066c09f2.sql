-- Update ideas table with new columns
ALTER TABLE public.ideas
  ADD COLUMN idea_reference_code varchar(50) UNIQUE,
  ADD COLUMN average_evaluation_score numeric(4, 2),
  ADD COLUMN feasibility_study_url text,
  ADD COLUMN pricing_offer_url text,
  ADD COLUMN prototype_images_urls text[],
  ADD COLUMN current_stage text DEFAULT 'draft',
  ADD COLUMN language varchar(10) DEFAULT 'ar';

-- Update evaluations table with score constraints and unique constraint
ALTER TABLE public.evaluations
  ADD CONSTRAINT check_feasibility_score CHECK (feasibility_score BETWEEN 1 AND 10),
  ADD CONSTRAINT check_impact_score CHECK (impact_score BETWEEN 1 AND 10),
  ADD CONSTRAINT check_innovation_score CHECK (innovation_score BETWEEN 1 AND 10),
  ADD CONSTRAINT check_overall_score CHECK (overall_score BETWEEN 1 AND 10),
  ADD CONSTRAINT unique_idea_evaluator UNIQUE (idea_id, evaluator_id);

-- Create idea_attachments table
CREATE TABLE public.idea_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id uuid NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
  file_type text CHECK (file_type IN ('feasibility', 'pricing_offer', 'prototype')),
  file_name text,
  file_url text,
  uploaded_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Create list_of_values table for multilingual dropdowns
CREATE TABLE public.list_of_values (
  id serial PRIMARY KEY,
  list_key text NOT NULL,
  value_key text NOT NULL,
  value_en text NOT NULL,
  value_ar text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(list_key, value_key)
);

-- Enable RLS on new tables
ALTER TABLE public.idea_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_of_values ENABLE ROW LEVEL SECURITY;

-- RLS policies for idea_attachments
CREATE POLICY "Users can view all attachments" ON public.idea_attachments
  FOR SELECT USING (true);

CREATE POLICY "Users can upload attachments for their ideas" ON public.idea_attachments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ideas 
      WHERE id = idea_id AND submitter_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own attachments" ON public.idea_attachments
  FOR UPDATE USING (uploaded_by = auth.uid());

CREATE POLICY "Users can delete their own attachments" ON public.idea_attachments
  FOR DELETE USING (uploaded_by = auth.uid());

-- RLS policies for list_of_values
CREATE POLICY "Users can view list of values" ON public.list_of_values
  FOR SELECT USING (true);

CREATE POLICY "Management can manage list of values" ON public.list_of_values
  FOR ALL USING (get_user_role(auth.uid()) = 'management');

-- Add trigger to update ideas.updated_at
CREATE TRIGGER trg_update_ideas_updated_at
  BEFORE UPDATE ON public.ideas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate idea reference code
CREATE OR REPLACE FUNCTION generate_idea_reference_code()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
  reference_code TEXT;
BEGIN
  year_part := EXTRACT(YEAR FROM NOW())::TEXT;
  
  -- Get the next sequence number for this year
  SELECT COALESCE(MAX(
    CASE 
      WHEN idea_reference_code ~ ('^IDEA-' || year_part || '-[0-9]+$')
      THEN CAST(SUBSTRING(idea_reference_code FROM '[0-9]+$') AS INTEGER)
      ELSE 0
    END
  ), 0) + 1
  INTO sequence_num
  FROM public.ideas;
  
  reference_code := 'IDEA-' || year_part || '-' || LPAD(sequence_num::TEXT, 3, '0');
  
  RETURN reference_code;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate average evaluation score
CREATE OR REPLACE FUNCTION calculate_average_evaluation_score(idea_uuid uuid)
RETURNS numeric AS $$
DECLARE
  avg_score numeric;
BEGIN
  SELECT AVG((feasibility_score + impact_score + innovation_score + overall_score) / 4.0)
  INTO avg_score
  FROM public.evaluations
  WHERE idea_id = idea_uuid
    AND feasibility_score IS NOT NULL
    AND impact_score IS NOT NULL  
    AND innovation_score IS NOT NULL
    AND overall_score IS NOT NULL;
  
  RETURN COALESCE(avg_score, 0);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate reference code and update average score
CREATE OR REPLACE FUNCTION handle_idea_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate reference code if not set
  IF NEW.idea_reference_code IS NULL THEN
    NEW.idea_reference_code := generate_idea_reference_code();
  END IF;
  
  -- Update current_stage based on status
  CASE NEW.status
    WHEN 'draft' THEN NEW.current_stage := 'draft';
    WHEN 'submitted' THEN NEW.current_stage := 'under_review';
    WHEN 'under_review' THEN NEW.current_stage := 'being_evaluated';
    WHEN 'approved' THEN NEW.current_stage := 'approved';
    WHEN 'rejected' THEN NEW.current_stage := 'rejected';
    WHEN 'implemented' THEN NEW.current_stage := 'implemented';
    ELSE NEW.current_stage := NEW.status;
  END CASE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_handle_idea_changes
  BEFORE INSERT OR UPDATE ON public.ideas
  FOR EACH ROW EXECUTE FUNCTION handle_idea_changes();

-- Trigger to update average evaluation score when evaluations change
CREATE OR REPLACE FUNCTION update_idea_average_score()
RETURNS TRIGGER AS $$
DECLARE
  target_idea_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_idea_id := OLD.idea_id;
  ELSE
    target_idea_id := NEW.idea_id;
  END IF;
  
  UPDATE public.ideas 
  SET average_evaluation_score = calculate_average_evaluation_score(target_idea_id)
  WHERE id = target_idea_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_idea_average_score
  AFTER INSERT OR UPDATE OR DELETE ON public.evaluations
  FOR EACH ROW EXECUTE FUNCTION update_idea_average_score();

-- Insert sample strategic alignment values
INSERT INTO public.list_of_values (list_key, value_key, value_en, value_ar) VALUES
('strategic_alignment', 'digital_transformation', 'Digital Transformation', 'التحول الرقمي'),
('strategic_alignment', 'customer_experience', 'Customer Experience Enhancement', 'تحسين تجربة العملاء'),
('strategic_alignment', 'operational_efficiency', 'Operational Efficiency', 'الكفاءة التشغيلية'),
('strategic_alignment', 'innovation_culture', 'Innovation Culture', 'ثقافة الابتكار'),
('strategic_alignment', 'sustainability', 'Sustainability', 'الاستدامة'),
('strategic_alignment', 'market_expansion', 'Market Expansion', 'توسع السوق'),
('strategic_alignment', 'cost_optimization', 'Cost Optimization', 'تحسين التكلفة'),
('strategic_alignment', 'talent_development', 'Talent Development', 'تطوير المواهب');