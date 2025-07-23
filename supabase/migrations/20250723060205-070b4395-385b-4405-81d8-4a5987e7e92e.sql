-- Add missing header translations
INSERT INTO public.translations (interface_name, position_key, english_text, arabic_text)
VALUES 
  ('header', 'search_placeholder', 'Search ideas, evaluations, users...', 'البحث عن الأفكار، التقييمات، المستخدمين...'),
  ('header', 'filter', 'Filter', 'تصفية'),
  ('header', 'advanced_filter', 'Advanced Filter', 'تصفية متقدمة'),
  ('header', 'search_results', 'Search Results', 'نتائج البحث'),
  ('header', 'clear_filters', 'Clear Filters', 'مسح الفلاتر'),
  ('header', 'no_results', 'No results found', 'لا توجد نتائج'),
  ('header', 'filter_by_status', 'Filter by Status', 'تصفية حسب الحالة'),
  ('header', 'filter_by_category', 'Filter by Category', 'تصفية حسب الفئة'),
  ('header', 'filter_by_date', 'Filter by Date', 'تصفية حسب التاريخ'),
  ('header', 'filter_by_score', 'Filter by Score', 'تصفية حسب النقاط'),
  ('header', 'date_from', 'Date From', 'من تاريخ'),
  ('header', 'date_to', 'Date To', 'إلى تاريخ'),
  ('header', 'min_score', 'Min Score', 'أقل نقاط'),
  ('header', 'max_score', 'Max Score', 'أعلى نقاط'),
  ('header', 'apply_filters', 'Apply Filters', 'تطبيق الفلاتر')
ON CONFLICT (interface_name, position_key) 
DO UPDATE SET 
  english_text = EXCLUDED.english_text,
  arabic_text = EXCLUDED.arabic_text,
  updated_at = now();