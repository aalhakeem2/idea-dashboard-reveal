-- Add management dashboard translations
INSERT INTO public.translations (interface_name, position_key, english_text, arabic_text)
VALUES 
  ('management_dashboard', 'ideas_by_category', 'Ideas by Category', 'الأفكار حسب الفئة'),
  ('management_dashboard', 'distribution_across_categories', 'Distribution across different categories', 'التوزيع عبر الفئات المختلفة'),
  ('management_dashboard', 'idea_status_overview', 'Idea Status Overview', 'نظرة عامة على حالة الأفكار'),
  ('management_dashboard', 'status_distribution', 'Current status distribution', 'توزيع الحالة الحالية')
ON CONFLICT (interface_name, position_key) 
DO UPDATE SET 
  english_text = EXCLUDED.english_text,
  arabic_text = EXCLUDED.arabic_text,
  updated_at = now();