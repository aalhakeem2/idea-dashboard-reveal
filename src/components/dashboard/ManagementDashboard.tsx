
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Lightbulb, CheckCircle, Clock, Target, Activity } from "lucide-react";
import { IdeaCard } from "./IdeaCard";
import { IdeaTimeline } from "./IdeaTimeline";
import { IdeaActionLog } from "./IdeaActionLog";
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
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [statusLogs, setStatusLogs] = useState([]);
  const [actionLogs, setActionLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    fetchManagementStats();
    fetchCategoryData();
    fetchStatusData();
    fetchRecentIdeas();
  }, []);

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

      const categoryCount = data?.reduce((acc: any, idea) => {
        acc[idea.category] = (acc[idea.category] || 0) + 1;
        return acc;
      }, {});

      const chartData = Object.entries(categoryCount || {}).map(([category, count]) => ({
        name: category.replace("_", " "),
        value: count,
      }));

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
        name: status.replace("_", " "),
        count: count,
      }));

      setStatusData(chartData);
    } catch (error) {
      console.error("Error fetching status data:", error);
    }
  };

  const fetchRecentIdeas = async () => {
    try {
      const { data, error } = await supabase
        .from("ideas")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentIdeas(data || []);
    } catch (error) {
      console.error("Error fetching recent ideas:", error);
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

  const renderDashboardOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ideas</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIdeas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Ideas</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.activeIdeas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Implemented</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.implementedIdeas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.successRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Time</CardTitle>
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
            <CardTitle>Ideas by Status</CardTitle>
            <CardDescription>Current distribution of idea statuses</CardDescription>
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
            <CardTitle>Ideas by Category</CardTitle>
            <CardDescription>Distribution across different categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Key Performance Indicators</CardTitle>
          <CardDescription>Monthly performance metrics and trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((stats.implementedIdeas / Math.max(stats.totalIdeas, 1)) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Implementation Rate</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(stats.totalIdeas / Math.max(stats.totalUsers, 1) * 10) / 10}
              </div>
              <div className="text-sm text-gray-600">Ideas per User</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((stats.activeIdeas / Math.max(stats.totalIdeas, 1)) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Active Idea Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            {language === 'ar' ? 'الأفكار الحديثة' : 'Recent Ideas'}
          </CardTitle>
          <CardDescription>
            {language === 'ar' ? 'أحدث الأفكار المُرسلة في النظام' : 'Latest ideas submitted to the system'}
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
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {language === 'ar' ? 'سجل النشاط للفكرة:' : 'Activity Log for Idea:'} {selectedIdea.title}
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedIdea(null)}
              >
                {language === 'ar' ? 'إغلاق' : 'Close'}
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

  return renderDashboardOverview();
};
