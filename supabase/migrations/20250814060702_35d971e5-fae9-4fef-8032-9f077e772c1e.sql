-- Create achievement types table
CREATE TABLE public.achievement_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  badge_icon TEXT,
  badge_color TEXT DEFAULT '#3B82F6',
  points_required INTEGER DEFAULT 0,
  category TEXT NOT NULL CHECK (category IN ('badge', 'level', 'special')),
  criteria JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create submitter achievements table
CREATE TABLE public.submitter_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submitter_id UUID NOT NULL,
  achievement_type_id UUID NOT NULL REFERENCES public.achievement_types(id),
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  points_earned INTEGER DEFAULT 0,
  related_idea_id UUID REFERENCES public.ideas(id),
  notes TEXT,
  awarded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create points history table
CREATE TABLE public.points_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submitter_id UUID NOT NULL,
  points INTEGER NOT NULL,
  activity_type TEXT NOT NULL,
  description TEXT,
  related_idea_id UUID REFERENCES public.ideas(id),
  related_achievement_id UUID REFERENCES public.submitter_achievements(id),
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create submitter rankings table
CREATE TABLE public.submitter_rankings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submitter_id UUID NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('monthly', 'quarterly', 'yearly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_points INTEGER DEFAULT 0,
  quality_score NUMERIC(5,2) DEFAULT 0,
  productivity_score NUMERIC(5,2) DEFAULT 0,
  innovation_score NUMERIC(5,2) DEFAULT 0,
  overall_rank INTEGER,
  department_rank INTEGER,
  ideas_submitted INTEGER DEFAULT 0,
  ideas_approved INTEGER DEFAULT 0,
  ideas_implemented INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(submitter_id, period_type, period_start)
);

-- Create recognition events table
CREATE TABLE public.recognition_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('ceremony', 'announcement', 'award')),
  event_date DATE NOT NULL,
  recipients UUID[] DEFAULT '{}',
  created_by UUID NOT NULL,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'completed', 'cancelled')),
  event_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create reward categories table
CREATE TABLE public.reward_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  criteria JSONB NOT NULL,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('points', 'badge', 'recognition', 'prize')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.achievement_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submitter_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submitter_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recognition_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for achievement_types
CREATE POLICY "Users can view achievement types" 
ON public.achievement_types FOR SELECT USING (true);

CREATE POLICY "Management can manage achievement types" 
ON public.achievement_types FOR ALL 
USING (get_user_role(auth.uid()) = 'management');

-- RLS Policies for submitter_achievements
CREATE POLICY "Users can view achievements" 
ON public.submitter_achievements FOR SELECT USING (true);

CREATE POLICY "Management can insert achievements" 
ON public.submitter_achievements FOR INSERT 
WITH CHECK (get_user_role(auth.uid()) = 'management');

CREATE POLICY "Management can update achievements" 
ON public.submitter_achievements FOR UPDATE 
USING (get_user_role(auth.uid()) = 'management');

-- RLS Policies for points_history
CREATE POLICY "Users can view points history" 
ON public.points_history FOR SELECT USING (true);

CREATE POLICY "System can insert points" 
ON public.points_history FOR INSERT WITH CHECK (true);

-- RLS Policies for submitter_rankings
CREATE POLICY "Users can view rankings" 
ON public.submitter_rankings FOR SELECT USING (true);

CREATE POLICY "Management can manage rankings" 
ON public.submitter_rankings FOR ALL 
USING (get_user_role(auth.uid()) = 'management');

-- RLS Policies for recognition_events
CREATE POLICY "Users can view recognition events" 
ON public.recognition_events FOR SELECT USING (true);

CREATE POLICY "Management can manage recognition events" 
ON public.recognition_events FOR ALL 
USING (get_user_role(auth.uid()) = 'management');

-- RLS Policies for reward_categories
CREATE POLICY "Users can view reward categories" 
ON public.reward_categories FOR SELECT USING (true);

CREATE POLICY "Management can manage reward categories" 
ON public.reward_categories FOR ALL 
USING (get_user_role(auth.uid()) = 'management');

-- Create function to calculate submitter total points
CREATE OR REPLACE FUNCTION public.calculate_submitter_total_points(p_submitter_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_points INTEGER := 0;
BEGIN
  SELECT COALESCE(SUM(points), 0)
  INTO total_points
  FROM public.points_history
  WHERE submitter_id = p_submitter_id;
  
  RETURN total_points;
END;
$$;

-- Create function to award points
CREATE OR REPLACE FUNCTION public.award_points(
  p_submitter_id UUID,
  p_points INTEGER,
  p_activity_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_related_idea_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.points_history (
    submitter_id,
    points,
    activity_type,
    description,
    related_idea_id
  ) VALUES (
    p_submitter_id,
    p_points,
    p_activity_type,
    p_description,
    p_related_idea_id
  );
END;
$$;

-- Create function to calculate submitter metrics
CREATE OR REPLACE FUNCTION public.calculate_submitter_metrics(p_submitter_id UUID)
RETURNS TABLE(
  total_ideas INTEGER,
  approved_ideas INTEGER,
  implemented_ideas INTEGER,
  avg_quality_score NUMERIC,
  avg_innovation_score NUMERIC,
  total_points INTEGER,
  current_level TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE((
      SELECT COUNT(*)::INTEGER
      FROM public.ideas
      WHERE submitter_id = p_submitter_id AND status != 'draft'
    ), 0) as total_ideas,
    
    COALESCE((
      SELECT COUNT(*)::INTEGER
      FROM public.ideas
      WHERE submitter_id = p_submitter_id AND status = 'approved'
    ), 0) as approved_ideas,
    
    COALESCE((
      SELECT COUNT(*)::INTEGER
      FROM public.ideas
      WHERE submitter_id = p_submitter_id AND status = 'implemented'
    ), 0) as implemented_ideas,
    
    COALESCE((
      SELECT AVG(average_evaluation_score)
      FROM public.ideas
      WHERE submitter_id = p_submitter_id AND average_evaluation_score IS NOT NULL
    ), 0) as avg_quality_score,
    
    COALESCE((
      SELECT AVG(e.innovation_score)
      FROM public.evaluations e
      JOIN public.ideas i ON e.idea_id = i.id
      WHERE i.submitter_id = p_submitter_id AND e.innovation_score IS NOT NULL
    ), 0) as avg_innovation_score,
    
    COALESCE(calculate_submitter_total_points(p_submitter_id), 0) as total_points,
    
    CASE 
      WHEN COALESCE(calculate_submitter_total_points(p_submitter_id), 0) >= 500 THEN 'Platinum'
      WHEN COALESCE(calculate_submitter_total_points(p_submitter_id), 0) >= 300 THEN 'Gold'
      WHEN COALESCE(calculate_submitter_total_points(p_submitter_id), 0) >= 150 THEN 'Silver'
      WHEN COALESCE(calculate_submitter_total_points(p_submitter_id), 0) >= 50 THEN 'Bronze'
      ELSE 'Beginner'
    END as current_level;
END;
$$;

-- Create triggers for automatic point awarding
CREATE OR REPLACE FUNCTION public.auto_award_idea_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Award points for idea submission
  IF TG_OP = 'INSERT' AND NEW.status = 'submitted' THEN
    PERFORM award_points(
      NEW.submitter_id,
      10,
      'idea_submitted',
      'Points for submitting idea: ' || NEW.title,
      NEW.id
    );
  END IF;
  
  -- Award points for idea approval
  IF TG_OP = 'UPDATE' AND OLD.status != 'approved' AND NEW.status = 'approved' THEN
    PERFORM award_points(
      NEW.submitter_id,
      50,
      'idea_approved',
      'Points for approved idea: ' || NEW.title,
      NEW.id
    );
  END IF;
  
  -- Award points for idea implementation
  IF TG_OP = 'UPDATE' AND OLD.status != 'implemented' AND NEW.status = 'implemented' THEN
    PERFORM award_points(
      NEW.submitter_id,
      100,
      'idea_implemented',
      'Points for implemented idea: ' || NEW.title,
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic point awarding
CREATE TRIGGER trigger_auto_award_points
  AFTER INSERT OR UPDATE ON public.ideas
  FOR EACH ROW
  EXECUTE FUNCTION auto_award_idea_points();

-- Insert default achievement types
INSERT INTO public.achievement_types (name, description, badge_icon, badge_color, category, criteria) VALUES
('First Idea', 'Submit your first idea', 'lightbulb', '#10B981', 'badge', '{"ideas_submitted": 1}'),
('Innovation Champion', 'Achieve high innovation scores', 'star', '#F59E0B', 'badge', '{"avg_innovation_score": 8}'),
('Quality Master', 'Maintain high quality scores', 'shield-check', '#8B5CF6', 'badge', '{"avg_quality_score": 8}'),
('Productivity Star', 'Submit multiple approved ideas', 'trending-up', '#EF4444', 'badge', '{"approved_ideas": 5}'),
('Implementation Hero', 'Get ideas implemented', 'check-circle', '#059669', 'badge', '{"implemented_ideas": 1}'),
('Bronze Level', 'Reach Bronze level', 'medal', '#CD7F32', 'level', '{"total_points": 50}'),
('Silver Level', 'Reach Silver level', 'medal', '#C0C0C0', 'level', '{"total_points": 150}'),
('Gold Level', 'Reach Gold level', 'medal', '#FFD700', 'level', '{"total_points": 300}'),
('Platinum Level', 'Reach Platinum level', 'crown', '#E5E4E2', 'level', '{"total_points": 500}');

-- Update timestamps trigger
CREATE TRIGGER update_achievement_types_updated_at
  BEFORE UPDATE ON public.achievement_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_submitter_rankings_updated_at
  BEFORE UPDATE ON public.submitter_rankings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recognition_events_updated_at
  BEFORE UPDATE ON public.recognition_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reward_categories_updated_at
  BEFORE UPDATE ON public.reward_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();