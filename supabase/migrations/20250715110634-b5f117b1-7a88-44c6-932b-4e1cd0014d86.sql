-- Create idea_status_log table for tracking status transitions
CREATE TABLE public.idea_status_log (
  log_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  previous_status TEXT,
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  user_role user_role NOT NULL,
  comments TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create idea_action_log table for tracking all actions
CREATE TABLE public.idea_action_log (
  action_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  performed_by UUID NOT NULL REFERENCES auth.users(id),
  user_role user_role NOT NULL,
  action_detail TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add is_draft field to ideas table
ALTER TABLE public.ideas 
ADD COLUMN is_draft BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

-- Enable RLS on new tables
ALTER TABLE public.idea_status_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_action_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for idea_status_log
CREATE POLICY "Users can view status logs for ideas they can see" 
ON public.idea_status_log 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.ideas 
    WHERE ideas.id = idea_status_log.idea_id
  )
);

CREATE POLICY "Users can insert status logs for ideas they can modify" 
ON public.idea_status_log 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.ideas 
    WHERE ideas.id = idea_status_log.idea_id 
    AND (
      ideas.submitter_id = auth.uid() OR 
      get_user_role(auth.uid()) IN ('evaluator', 'management')
    )
  )
);

-- RLS policies for idea_action_log
CREATE POLICY "Users can view action logs for ideas they can see" 
ON public.idea_action_log 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.ideas 
    WHERE ideas.id = idea_action_log.idea_id
  )
);

CREATE POLICY "Users can insert action logs for ideas they can interact with" 
ON public.idea_action_log 
FOR INSERT 
WITH CHECK (
  auth.uid() = performed_by AND
  EXISTS (
    SELECT 1 FROM public.ideas 
    WHERE ideas.id = idea_action_log.idea_id
  )
);

-- Create function to log status changes
CREATE OR REPLACE FUNCTION public.log_status_change()
RETURNS TRIGGER AS $$
DECLARE
  user_role_val user_role;
BEGIN
  -- Get user role
  SELECT get_user_role(auth.uid()) INTO user_role_val;
  
  -- Log status change if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.idea_status_log (
      idea_id, 
      status, 
      previous_status, 
      changed_by, 
      user_role,
      comments
    ) VALUES (
      NEW.id,
      NEW.status,
      OLD.status,
      auth.uid(),
      user_role_val,
      'Status automatically updated'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for status logging
CREATE TRIGGER idea_status_change_trigger
  AFTER UPDATE ON public.ideas
  FOR EACH ROW
  EXECUTE FUNCTION public.log_status_change();

-- Create function to log actions
CREATE OR REPLACE FUNCTION public.log_idea_action(
  p_idea_id UUID,
  p_action_type TEXT,
  p_action_detail TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  user_role_val user_role;
BEGIN
  -- Get user role
  SELECT get_user_role(auth.uid()) INTO user_role_val;
  
  INSERT INTO public.idea_action_log (
    idea_id,
    action_type,
    performed_by,
    user_role,
    action_detail
  ) VALUES (
    p_idea_id,
    p_action_type,
    auth.uid(),
    user_role_val,
    p_action_detail
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX idx_idea_status_log_idea_id ON public.idea_status_log(idea_id);
CREATE INDEX idx_idea_status_log_timestamp ON public.idea_status_log(timestamp);
CREATE INDEX idx_idea_action_log_idea_id ON public.idea_action_log(idea_id);
CREATE INDEX idx_idea_action_log_timestamp ON public.idea_action_log(timestamp);