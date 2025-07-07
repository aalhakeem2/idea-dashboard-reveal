
-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('submitter', 'evaluator', 'management');

-- Create enum for idea status
CREATE TYPE public.idea_status AS ENUM ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'implemented');

-- Create enum for idea categories
CREATE TYPE public.idea_category AS ENUM ('innovation', 'process_improvement', 'cost_reduction', 'customer_experience', 'technology', 'sustainability');

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'submitter',
  department TEXT,
  email_confirmed BOOLEAN DEFAULT true, -- Set to true by default for all users
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ideas table
CREATE TABLE public.ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category idea_category NOT NULL,
  status idea_status NOT NULL DEFAULT 'draft',
  submitter_id UUID REFERENCES public.profiles(id) NOT NULL,
  assigned_evaluator_id UUID REFERENCES public.profiles(id),
  priority_score INTEGER DEFAULT 0,
  implementation_cost DECIMAL(10,2),
  expected_roi DECIMAL(10,2),
  strategic_alignment_score INTEGER CHECK (strategic_alignment_score >= 1 AND strategic_alignment_score <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  evaluated_at TIMESTAMP WITH TIME ZONE,
  implemented_at TIMESTAMP WITH TIME ZONE
);

-- Create evaluations table
CREATE TABLE public.evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE NOT NULL,
  evaluator_id UUID REFERENCES public.profiles(id) NOT NULL,
  feasibility_score INTEGER CHECK (feasibility_score >= 1 AND feasibility_score <= 10),
  impact_score INTEGER CHECK (impact_score >= 1 AND impact_score <= 10),
  innovation_score INTEGER CHECK (innovation_score >= 1 AND innovation_score <= 10),
  overall_score INTEGER CHECK (overall_score >= 1 AND overall_score <= 10),
  feedback TEXT,
  recommendation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comments table for idea discussions
CREATE TABLE public.idea_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_comments ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id OR auth.uid() IS NULL);
CREATE POLICY "Allow profile creation during signup" ON public.profiles FOR INSERT WITH CHECK (true);

-- RLS Policies for ideas
CREATE POLICY "Users can view all ideas" ON public.ideas FOR SELECT USING (true);
CREATE POLICY "Submitters can insert ideas" ON public.ideas FOR INSERT WITH CHECK (auth.uid() = submitter_id);
CREATE POLICY "Submitters can update own ideas" ON public.ideas FOR UPDATE USING (auth.uid() = submitter_id);
CREATE POLICY "Evaluators can update assigned ideas" ON public.ideas FOR UPDATE USING (
  public.get_user_role(auth.uid()) = 'evaluator' OR 
  public.get_user_role(auth.uid()) = 'management'
);

-- RLS Policies for evaluations
CREATE POLICY "Users can view all evaluations" ON public.evaluations FOR SELECT USING (true);
CREATE POLICY "Evaluators can insert evaluations" ON public.evaluations FOR INSERT WITH CHECK (
  public.get_user_role(auth.uid()) IN ('evaluator', 'management')
);
CREATE POLICY "Evaluators can update own evaluations" ON public.evaluations FOR UPDATE USING (
  auth.uid() = evaluator_id OR public.get_user_role(auth.uid()) = 'management'
);

-- RLS Policies for comments
CREATE POLICY "Users can view all comments" ON public.idea_comments FOR SELECT USING (true);
CREATE POLICY "Users can insert comments" ON public.idea_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON public.idea_comments FOR UPDATE USING (auth.uid() = user_id);

-- Create trigger function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ideas_updated_at BEFORE UPDATE ON public.ideas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_evaluations_updated_at BEFORE UPDATE ON public.evaluations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration with email_confirmed set to true
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, email_confirmed, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    true, -- Always set to true to bypass email confirmation
    'submitter'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    email_confirmed = true;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample user profiles for testing
INSERT INTO public.profiles (id, email, full_name, role, department, email_confirmed) VALUES
  ('11111111-1111-1111-1111-111111111111', 'submitter@you.com', 'Hani Gazim', 'submitter', 'Operations', true),
  ('22222222-2222-2222-2222-222222222222', 'evaluator@you.com', 'Abdurhman Alhakeem', 'evaluator', 'R&D', true),
  ('33333333-3333-3333-3333-333333333333', 'management@you.com', 'Osama Murshed', 'management', 'Executive', true),
  ('44444444-4444-4444-4444-444444444444', 'test@you.com', 'Test User', 'management', 'Executive', true)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  email_confirmed = true;
