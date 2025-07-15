-- Add strategic alignment selections field to ideas table
ALTER TABLE public.ideas ADD COLUMN strategic_alignment_selections TEXT[];

-- Add index for better performance on strategic alignment searches
CREATE INDEX idx_ideas_strategic_alignment_selections ON public.ideas USING GIN(strategic_alignment_selections);