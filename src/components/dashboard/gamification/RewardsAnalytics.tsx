import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { TrendingUp, Users, Trophy, Star, BarChart3, PieChart as PieChartIcon } from "lucide-react";

interface AnalyticsData {
  engagementTrends: Array<{
    month: string;
    ideas_submitted: number;
    users_active: number;
    points_awarded: number;
  }>;
  departmentPerformance: Array<{
    department: string;
    total_points: number;
    avg_score: number;
    active_users: number;
  }>;
  achievementDistribution: Array<{
    achievement_name: string;
    count: number;
    category: string;
  }>;
  topPerformers: Array<{
    name: string;
    points: number;
    level: string;
    department: string;
  }>;
}

export const RewardsAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    engagementTrends: [],
    departmentPerformance: [],
    achievementDistribution: [],
    topPerformers: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("6months");
  const { language } = useLanguage();

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Fetch engagement trends
      const engagementTrends = await fetchEngagementTrends();
      
      // Fetch department performance
      const departmentPerformance = await fetchDepartmentPerformance();
      
      // Fetch achievement distribution
      const achievementDistribution = await fetchAchievementDistribution();
      
      // Fetch top performers
      const topPerformers = await fetchTopPerformers();

      setAnalytics({
        engagementTrends,
        departmentPerformance,
        achievementDistribution,
        topPerformers
      });
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEngagementTrends = async () => {
    try {
      // Get last 6 months of data
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        months.push({
          date: date,
          month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          start: new Date(date.getFullYear(), date.getMonth(), 1).toISOString(),
          end: new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString()
        });
      }

      const trendsData = await Promise.all(
        months.map(async (month) => {
          const { data: ideas } = await supabase
            .from("ideas")
            .select("id")
            .gte("created_at", month.start)
            .lte("created_at", month.end);

          const { data: points } = await supabase
            .from("points_history")
            .select("points")
            .gte("earned_at", month.start)
            .lte("earned_at", month.end);

          const { data: users } = await supabase
            .from("ideas")
            .select("submitter_id")
            .gte("created_at", month.start)
            .lte("created_at", month.end);

          const uniqueUsers = new Set(users?.map(u => u.submitter_id) || []).size;
          const totalPoints = points?.reduce((sum, p) => sum + p.points, 0) || 0;

          return {
            month: month.month,
            ideas_submitted: ideas?.length || 0,
            users_active: uniqueUsers,
            points_awarded: totalPoints
          };
        })
      );

      return trendsData;
    } catch (error) {
      console.error("Error fetching engagement trends:", error);
      return [];
    }
  };

  const fetchDepartmentPerformance = async () => {
    try {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, department")
        .eq("role", "submitter")
        .eq("is_active", true)
        .not("department", "is", null);

      if (!profiles) return [];

      const departmentStats = await Promise.all(
        [...new Set(profiles.map(p => p.department))].map(async (department) => {
          const deptUsers = profiles.filter(p => p.department === department);
          
          let totalPoints = 0;
          let totalScores = 0;
          let scoreCount = 0;

          for (const user of deptUsers) {
            const { data: metrics } = await supabase
              .rpc("calculate_submitter_metrics", { p_submitter_id: user.id });
            
            if (metrics?.[0]) {
              totalPoints += metrics[0].total_points || 0;
              if (metrics[0].avg_quality_score > 0) {
                totalScores += metrics[0].avg_quality_score;
                scoreCount++;
              }
            }
          }

          return {
            department: department || "Unknown",
            total_points: totalPoints,
            avg_score: scoreCount > 0 ? totalScores / scoreCount : 0,
            active_users: deptUsers.length
          };
        })
      );

      return departmentStats.sort((a, b) => b.total_points - a.total_points);
    } catch (error) {
      console.error("Error fetching department performance:", error);
      return [];
    }
  };

  const fetchAchievementDistribution = async () => {
    try {
      const { data: achievements } = await supabase
        .from("achievement_types")
        .select("id, name, category")
        .eq("is_active", true);

      if (!achievements) return [];

      const distributionData = await Promise.all(
        achievements.map(async (achievement) => {
          const { data: awarded } = await supabase
            .from("submitter_achievements")
            .select("id")
            .eq("achievement_type_id", achievement.id);

          return {
            achievement_name: achievement.name,
            count: awarded?.length || 0,
            category: achievement.category
          };
        })
      );

      return distributionData.filter(d => d.count > 0);
    } catch (error) {
      console.error("Error fetching achievement distribution:", error);
      return [];
    }
  };

  const fetchTopPerformers = async () => {
    try {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, department")
        .eq("role", "submitter")
        .eq("is_active", true);

      if (!profiles) return [];

      const performersData = await Promise.all(
        profiles.map(async (profile) => {
          const { data: metrics } = await supabase
            .rpc("calculate_submitter_metrics", { p_submitter_id: profile.id });

          return {
            name: profile.full_name || "Unknown",
            points: metrics?.[0]?.total_points || 0,
            level: metrics?.[0]?.current_level || "Beginner",
            department: profile.department || "Unknown"
          };
        })
      );

      return performersData
        .sort((a, b) => b.points - a.points)
        .slice(0, 10);
    } catch (error) {
      console.error("Error fetching top performers:", error);
      return [];
    }
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {language === 'ar' ? 'تحليلات المكافآت' : 'Rewards Analytics'}
        </h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3months">
              {language === 'ar' ? '3 شهور' : 'Last 3 Months'}
            </SelectItem>
            <SelectItem value="6months">
              {language === 'ar' ? '6 شهور' : 'Last 6 Months'}
            </SelectItem>
            <SelectItem value="12months">
              {language === 'ar' ? '12 شهر' : 'Last 12 Months'}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Engagement Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {language === 'ar' ? 'اتجاهات المشاركة' : 'Engagement Trends'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.engagementTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="ideas_submitted" 
                stroke="#8884d8" 
                strokeWidth={2}
                name={language === 'ar' ? 'الأفكار المقدمة' : 'Ideas Submitted'}
              />
              <Line 
                type="monotone" 
                dataKey="users_active" 
                stroke="#82ca9d" 
                strokeWidth={2}
                name={language === 'ar' ? 'المستخدمون النشطون' : 'Active Users'}
              />
              <Line 
                type="monotone" 
                dataKey="points_awarded" 
                stroke="#ffc658" 
                strokeWidth={2}
                name={language === 'ar' ? 'النقاط الممنوحة' : 'Points Awarded'}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Department Performance & Achievement Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {language === 'ar' ? 'أداء الأقسام' : 'Department Performance'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.departmentPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="total_points" 
                  fill="#8884d8"
                  name={language === 'ar' ? 'إجمالي النقاط' : 'Total Points'}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              {language === 'ar' ? 'توزيع الإنجازات' : 'Achievement Distribution'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.achievementDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.achievementDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            {language === 'ar' ? 'أفضل المتصدرين' : 'Top Performers'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.topPerformers.slice(0, 6).map((performer, index) => (
              <Card key={index} className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-blue-600">#{index + 1}</span>
                    <Star className="h-5 w-5 text-yellow-500" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{performer.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{performer.department}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-primary">
                      {performer.points} {language === 'ar' ? 'نقطة' : 'pts'}
                    </span>
                    <span className="text-xs bg-white/50 dark:bg-black/20 px-2 py-1 rounded">
                      {performer.level}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};