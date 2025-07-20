import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LabelList } from "recharts";
import { TrendingUp, Users, Lightbulb, CheckCircle, Clock, Target, Activity, Settings, UserCheck } from "lucide-react";
import { IdeaCard } from "./IdeaCard";
import { IdeaTimeline } from "./IdeaTimeline";
import { IdeaActionLog } from "./IdeaActionLog";
import { EvaluatorAssignmentDashboard } from "./EvaluatorAssignmentDashboard";
import { EvaluatorPoolManagement } from "./EvaluatorPoolManagement";
import { useLanguage } from "@/contexts/LanguageContext";

type Profile = Tables<"profiles">;
type Idea = Tables<"ideas">;

interface ManagementDashboardProps {
  profile: Profile;
  activeView: string;
}

export const ManagementDashboard = ({ profile, activeView }: ManagementDashboardProps) => {
  const [stats, setStats] = useState({
    totalIdeas: 0,
    totalUsers: 0,
    activeIdeas: 0,
    implementedIdeas: 0,
    successRate: 0,
    avgTimeToImplement: 0,
  });
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [recentIdeas, setRecentIdeas] = useState<Idea[]>([]);
  const [allIdeas, setAllIdeas] = useState<Idea[]>([]);
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [statusLogs, setStatusLogs] = useState([]);
  const [actionLogs, setActionLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { language, t } = useLanguage();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    fetchManagementStats();
    fetchCategoryData();
    fetchStatusData();
    fetchRecentIdeas();
    if (activeView === 'ideas') {
      fetchAllIdeas();
    }
    if (activeView === 'users') {
      fetchAllUsers();
    }
  }, [activeView]);

  useEffect(() => {
    if (selectedIdea) {
      fetchIdeaLogs(selectedIdea.id);
    }
  }, [selectedIdea]);

  const fetchManagementStats = async () => {
    try {
      const [ideasResult, usersResult] = await Promise.all([
        supabase.from("ideas").select("*"),
        supabase.from("profiles").select("*")
      ]);

      const ideas = ideasResult.data || [];
      const users = usersResult.data || [];

      const implementedIdeas = ideas.filter(idea => idea.status === "implemented");
      const activeIdeas = ideas.filter(idea => ["submitted", "under_review", "approved"].includes(idea.status));

      setStats({
        totalIdeas: ideas.length,
        totalUsers: users.length,
        activeIdeas: activeIdeas.length,
        implementedIdeas: implementedIdeas.length,
        successRate: ideas.length > 0 ? Math.round((implementedIdeas.length / ideas.length) * 100) : 0,
        avgTimeToImplement: 30, // Placeholder - would calculate from actual data
      });
    } catch (error) {
      console.error("Error fetching management stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryData = async () => {
    try {
      const { data, error } = await supabase
        .from("ideas")
        .select("category");

      if (error) throw error;

      // Get category translations
      const { data: translations } = await supabase
        .from("translations")
        .select("*")
        .eq("interface_name", "categories");

      const categoryCount = data?.reduce((acc: any, idea) => {
        acc[idea.category] = (acc[idea.category] || 0) + 1;
        return acc;
      }, {});

      const chartData = Object.entries(categoryCount || {}).map(([category, count]) => {
        const translation = translations?.find(t => t.position_key === category);
        const localizedName = translation 
          ? (language === 'ar' ? translation.arabic_text : translation.english_text)
          : category.replace("_", " ");
        
        return {
          name: localizedName,
          value: count,
          originalKey: category
        };
      });

      setCategoryData(chartData);
    } catch (error) {
      console.error("Error fetching category data:", error);
    }
  };

  const fetchStatusData = async () => {
    try {
      const { data, error } = await supabase
        .from("ideas")
        .select("status");

      if (error) throw error;

      const statusCount = data?.reduce((acc: any, idea) => {
        acc[idea.status] = (acc[idea.status] || 0) + 1;
        return acc;
      }, {});

      const chartData = Object.entries(statusCount || {}).map(([status, count]) => ({
        name: t('idea_status', status) || status.replace("_", " "),
        count: count,
      }));

      setStatusData(chartData);
    } catch (error) {
      console.error("Error fetching status data:", error);
    }
  };

  const fetchRecentIdeas = async () => {
    try {
      console.log("Management Dashboard: Fetching recent ideas");
      
      const { data, error } = await supabase
        .from("ideas")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        console.error("Error fetching recent ideas:", error);
        throw error;
      }
      
      console.log("Management Dashboard: Found recent ideas:", data?.length || 0, data);
      setRecentIdeas(data || []);
    } catch (error) {
      console.error("Error fetching recent ideas:", error);
    }
  };

  const fetchAllIdeas = async () => {
    try {
      const { data, error } = await supabase
        .from("ideas")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAllIdeas(data || []);
    } catch (error) {
      console.error("Error fetching all ideas:", error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAllUsers(data || []);
    } catch (error) {
      console.error("Error fetching all users:", error);
    }
  };

  const fetchIdeaLogs = async (ideaId: string) => {
    try {
      // Fetch status logs
      const { data: statusData, error: statusError } = await supabase
        .from('idea_status_log')
        .select(`
          *,
          profiles:changed_by(full_name)
        `)
        .eq('idea_id', ideaId)
        .order('timestamp', { ascending: false });

      if (statusError) throw statusError;

      // Fetch action logs
      const { data: actionData, error: actionError } = await supabase
        .from('idea_action_log')
        .select(`
          *,
          profiles:performed_by(full_name)
        `)
        .eq('idea_id', ideaId)
        .order('timestamp', { ascending: false });

      if (actionError) throw actionError;

      setStatusLogs(statusData || []);
      setActionLogs(actionData || []);
    } catch (error) {
      console.error('Error fetching idea logs:', error);
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return renderDashboardOverview();
      case "ideas":
        return renderAllIdeasView();
      case "evaluator-management":
        return <EvaluatorAssignmentDashboard profile={profile} />;
      case "evaluator-pool":
        return <EvaluatorPoolManagement profile={profile} />;
      case "analytics":
        return renderAnalyticsView();
      case "users":
        return renderUsersView();
      case "settings":
        return renderSettingsView();
      default:
        return renderDashboardOverview();
    }
  };

  const renderDashboardOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('management_dashboard', 'total_ideas')}</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIdeas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('management_dashboard', 'active_ideas')}</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.activeIdeas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('management_dashboard', 'implemented')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.implementedIdeas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('management_dashboard', 'success_rate')}</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.successRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('management_dashboard', 'total_users')}</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('management_dashboard', 'avg_time')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{stats.avgTimeToImplement}d</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {t('management_dashboard', 'ideas_by_status')}
            </CardTitle>
            <CardDescription dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {t('management_dashboard', 'status_distribution')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {language === 'ar' ? 'الأفكار حسب الفئة' : 'Ideas by Category'}
            </CardTitle>
            <CardDescription dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {language === 'ar' ? 'التوزيع عبر الفئات المختلفة' : 'Distribution across different categories'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  labelLine={false}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, name, percent }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    
                    return percent > 0.05 ? (
                      <text 
                        x={x} 
                        y={y} 
                        fill="white" 
                        textAnchor={x > cx ? 'start' : 'end'} 
                        dominantBaseline="central"
                        fontSize={10}
                        fontWeight="bold"
                        direction={language === 'ar' ? 'rtl' : 'ltr'}
                      >
                        <tspan x={x} dy="-0.3em">{name}</tspan>
                        <tspan x={x} dy="1.2em">{`${(percent * 100).toFixed(0)}%`}</tspan>
                      </text>
                    ) : null;
                  }}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [value, name]}
                  contentStyle={{ 
                    direction: language === 'ar' ? 'rtl' : 'ltr',
                    textAlign: language === 'ar' ? 'right' : 'left'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {t('management_dashboard', 'key_performance_indicators')}
          </CardTitle>
          <CardDescription dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {t('management_dashboard', 'monthly_performance')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((stats.implementedIdeas / Math.max(stats.totalIdeas, 1)) * 100)}%
              </div>
              <div className="text-sm text-gray-600" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {t('management_dashboard', 'implementation_rate')}
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(stats.totalIdeas / Math.max(stats.totalUsers, 1) * 10) / 10}
              </div>
              <div className="text-sm text-gray-600" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {t('management_dashboard', 'ideas_per_user')}
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((stats.activeIdeas / Math.max(stats.totalIdeas, 1)) * 100)}%
              </div>
              <div className="text-sm text-gray-600" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {t('management_dashboard', 'active_idea_rate')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              <Lightbulb className="h-5 w-5" />
              {t('management_dashboard', 'recent_ideas') || (language === 'ar' ? 'الأفكار الحديثة' : 'Recent Ideas')}
            </CardTitle>
            <CardDescription dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {t('management_dashboard', 'latest_ideas') || (language === 'ar' ? 'أحدث الأفكار المُرسلة في النظام' : 'Latest ideas submitted to the system')}
            </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentIdeas.map((idea) => (
              <IdeaCard 
                key={idea.id} 
                idea={idea} 
                detailed 
                showTimeline={true}
                onViewActivity={(idea) => setSelectedIdea(idea)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedIdea && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <Activity className="h-5 w-5" />
                {(language === 'ar' ? 'سجل النشاط للفكرة:' : 'Activity Log for Idea:')} {selectedIdea.title}
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedIdea(null)}
              >
                {t('common', 'close')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <IdeaTimeline statusLogs={statusLogs} currentStatus={selectedIdea.status} />
              <IdeaActionLog actionLogs={actionLogs} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderAllIdeasView = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {t('management_dashboard', 'all_ideas')}
        </h1>
        <p className="text-muted-foreground" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {t('management_dashboard', 'manage_review_ideas')}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          {t('common', 'loading')}
        </div>
      ) : allIdeas.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {t('common', 'no_data') || (language === 'ar' ? 'لا توجد أفكار متاحة' : 'No ideas available')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {allIdeas.map((idea) => (
            <IdeaCard 
              key={idea.id} 
              idea={idea} 
              detailed 
              showTimeline={true}
              onViewActivity={(idea) => setSelectedIdea(idea)}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderAnalyticsView = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {t('management_dashboard', 'analytics')}
        </h1>
        <p className="text-muted-foreground" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {t('management_dashboard', 'detailed_analytics') || (language === 'ar' ? 'تحليل شامل لأداء النظام والأفكار' : 'Comprehensive system and idea performance analysis')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {t('management_dashboard', 'ideas_by_status')}
            </CardTitle>
            <CardDescription dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {t('management_dashboard', 'status_distribution')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {language === 'ar' ? 'الأفكار حسب الفئة' : 'Ideas by Category'}
            </CardTitle>
            <CardDescription dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {language === 'ar' ? 'التوزيع عبر الفئات المختلفة' : 'Distribution across different categories'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  labelLine={false}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, name, percent }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    
                    return percent > 0.05 ? (
                      <text 
                        x={x} 
                        y={y} 
                        fill="white" 
                        textAnchor={x > cx ? 'start' : 'end'} 
                        dominantBaseline="central"
                        fontSize={12}
                        fontWeight="bold"
                      >
                        {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    ) : null;
                  }}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [value, name]}
                  contentStyle={{ 
                    direction: language === 'ar' ? 'rtl' : 'ltr',
                    textAlign: language === 'ar' ? 'right' : 'left'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderUsersView = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {language === 'ar' ? 'إدارة المستخدمين' : 'User Management'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'ar' ? 'إدارة المستخدمين وأدوارهم في النظام' : 'Manage users and their roles in the system'}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
        </div>
      ) : allUsers.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p>{language === 'ar' ? 'لا يوجد مستخدمون' : 'No users found'}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allUsers.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{user.full_name || 'N/A'}</h3>
                    <p className="text-sm text-muted-foreground">{user.email || 'N/A'}</p>
                    {user.department && (
                      <p className="text-sm text-muted-foreground">{user.department}</p>
                    )}
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        user.role === 'management' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'evaluator' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        <UserCheck className="h-3 w-3 mr-1" />
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderSettingsView = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {language === 'ar' ? 'الإعدادات' : 'Settings'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'ar' ? 'إعدادات النظام والتحكم العام' : 'System settings and general controls'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {language === 'ar' ? 'إعدادات النظام' : 'System Settings'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">
                  {language === 'ar' ? 'إدارة المستخدمين' : 'User Management'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'إدارة أدوار وصلاحيات المستخدمين' : 'Manage user roles and permissions'}
                </p>
              </div>
              <Button variant="outline">
                {language === 'ar' ? 'إدارة' : 'Manage'}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">
                  {language === 'ar' ? 'إعدادات التقييم' : 'Evaluation Settings'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'تخصيص معايير وعملية التقييم' : 'Customize evaluation criteria and process'}
                </p>
              </div>
              <Button variant="outline">
                {language === 'ar' ? 'تكوين' : 'Configure'}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">
                  {language === 'ar' ? 'إعدادات النظام' : 'System Configuration'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'الإعدادات العامة للنظام' : 'General system settings'}
                </p>
              </div>
              <Button variant="outline">
                {language === 'ar' ? 'تحرير' : 'Edit'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return renderContent();
};
