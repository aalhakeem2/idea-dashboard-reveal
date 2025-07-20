-- Add missing translations for ManagementDashboard interface
INSERT INTO translations (interface_name, position_key, english_text, arabic_text) VALUES
-- Stats cards
('management_dashboard', 'total_ideas', 'Total Ideas', 'إجمالي الأفكار'),
('management_dashboard', 'active_ideas', 'Active Ideas', 'الأفكار النشطة'),
('management_dashboard', 'implemented', 'Implemented', 'تم التنفيذ'),
('management_dashboard', 'success_rate', 'Success Rate', 'معدل النجاح'),
('management_dashboard', 'total_users', 'Total Users', 'إجمالي المستخدمين'),
('management_dashboard', 'avg_time', 'Avg Time', 'متوسط الوقت'),

-- Status chart
('management_dashboard', 'ideas_by_status', 'Ideas by Status', 'الأفكار حسب الحالة'),
('management_dashboard', 'status_distribution', 'Current distribution of idea statuses', 'التوزيع الحالي لحالات الأفكار'),

-- KPIs
('management_dashboard', 'key_performance_indicators', 'Key Performance Indicators', 'مؤشرات الأداء الرئيسية'),
('management_dashboard', 'monthly_performance', 'Monthly performance metrics and trends', 'مقاييس الأداء الشهرية والاتجاهات'),
('management_dashboard', 'implementation_rate', 'Implementation Rate', 'معدل التنفيذ'),
('management_dashboard', 'ideas_per_user', 'Ideas per User', 'الأفكار لكل مستخدم'),
('management_dashboard', 'active_idea_rate', 'Active Idea Rate', 'معدل الأفكار النشطة'),

-- Views
('management_dashboard', 'all_ideas', 'All Ideas', 'جميع الأفكار'),
('management_dashboard', 'manage_review_ideas', 'Manage and review all ideas in the system', 'إدارة ومراجعة جميع الأفكار في النظام'),
('management_dashboard', 'all_users', 'All Users', 'جميع المستخدمين'),
('management_dashboard', 'manage_users_permissions', 'Manage users and their permissions', 'إدارة المستخدمين وصلاحياتهم'),
('management_dashboard', 'analytics', 'Analytics', 'التحليلات'),
('management_dashboard', 'detailed_analytics', 'Detailed analytics and insights', 'تحليلات ورؤى مفصلة'),
('management_dashboard', 'settings', 'Settings', 'الإعدادات'),
('management_dashboard', 'system_configuration', 'System configuration and preferences', 'تكوين النظام والتفضيلات'),

-- Status labels
('idea_status', 'draft', 'Draft', 'مسودة'),
('idea_status', 'submitted', 'Submitted', 'مُرسل'),
('idea_status', 'under_review', 'Under Review', 'قيد المراجعة'),
('idea_status', 'approved', 'Approved', 'موافق عليه'),
('idea_status', 'rejected', 'Rejected', 'مرفوض'),
('idea_status', 'implemented', 'Implemented', 'تم التنفيذ'),

-- Common actions
('common', 'close', 'Close', 'إغلاق'),
('common', 'view_details', 'View Details', 'عرض التفاصيل'),
('common', 'loading', 'Loading...', 'جارٍ التحميل...'),
('common', 'no_data', 'No data available', 'لا توجد بيانات متاحة'),
('common', 'refresh', 'Refresh', 'تحديث')

ON CONFLICT (interface_name, position_key) DO UPDATE SET
english_text = EXCLUDED.english_text,
arabic_text = EXCLUDED.arabic_text,
updated_at = now();