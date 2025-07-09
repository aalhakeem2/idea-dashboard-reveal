-- Insert missing dashboard translations
INSERT INTO public.translations (interface_name, position_key, english_text, arabic_text) VALUES
('dashboard', 'seed_sample_data', 'Seed Sample Data', 'إدراج بيانات تجريبية'),
('dashboard', 'seeding', 'Seeding...', 'جاري الإدراج...')
ON CONFLICT (interface_name, position_key) DO UPDATE SET
english_text = EXCLUDED.english_text,
arabic_text = EXCLUDED.arabic_text;

-- Insert missing submitter dashboard translations
INSERT INTO public.translations (interface_name, position_key, english_text, arabic_text) VALUES
('dashboard', 'my_ideas_title', 'My Ideas', 'أفكاري'),
('dashboard', 'total_count', 'total', 'إجمالي'),
('dashboard', 'no_ideas_submitted', 'No ideas submitted yet', 'لم يتم تقديم أي أفكار بعد'),
('dashboard', 'start_submitting', 'Start by submitting your first innovative idea to the platform.', 'ابدأ بتقديم فكرتك الابتكارية الأولى على المنصة.')
ON CONFLICT (interface_name, position_key) DO UPDATE SET
english_text = EXCLUDED.english_text,
arabic_text = EXCLUDED.arabic_text;