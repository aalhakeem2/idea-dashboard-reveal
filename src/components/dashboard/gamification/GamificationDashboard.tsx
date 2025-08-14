import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubmitterLeaderboard } from "./SubmitterLeaderboard";
import { AchievementManagement } from "./AchievementManagement";
import { RecognitionEvents } from "./RecognitionEvents";
import { RewardsAnalytics } from "./RewardsAnalytics";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Trophy, Star, Award, TrendingUp, Users, Target } from "lucide-react";

interface GamificationStats {
  totalSubmitters: number;
  activeAchievements: number;
  totalPointsAwarded: number;
  averageEngagement: number;
  topPerformer: {
    name: string;
    points: number;
    level: string;
  } | null;
}

export const GamificationDashboard: React.FC = () => {
  const [stats, setStats] = useState<GamificationStats>({
    totalSubmitters: 0,
    activeAchievements: 0,
    totalPointsAwarded: 0,
    averageEngagement: 0,
    topPerformer: null
  });
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    fetchGamificationStats();
  }, []);

  const fetchGamificationStats = async () => {
    try {
      // Fetch total submitters
      const { data: submitters, error: submittersError } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "submitter")
        .eq("is_active", true);

      if (submittersError) throw submittersError;

      // Fetch active achievements
      const { data: achievements, error: achievementsError } = await supabase
        .from("achievement_types")
        .select("id")
        .eq("is_active", true);

      if (achievementsError) throw achievementsError;

      // Fetch total points awarded
      const { data: pointsData, error: pointsError } = await supabase
        .from("points_history")
        .select("points");

      if (pointsError) throw pointsError;

      const totalPoints = pointsData?.reduce((sum, record) => sum + record.points, 0) || 0;

      // Calculate engagement (ideas submitted this month)
      const thisMonth = new Date();
      thisMonth.setDate(1);
      
      const { data: monthlyIdeas, error: monthlyError } = await supabase
        .from("ideas")
        .select("id")
        .gte("created_at", thisMonth.toISOString());

      if (monthlyError) throw monthlyError;

      // Fetch top performer
      const { data: topPerformerData, error: topPerformerError } = await supabase
        .rpc("calculate_submitter_metrics", { p_submitter_id: submitters?.[0]?.id || null });

      if (topPerformerError) throw topPerformerError;

      // Get the actual top performer by querying all submitters
      let topPerformer = null;
      if (submitters?.length) {
        let maxPoints = 0;
        for (const submitter of submitters) {
          const { data: metrics } = await supabase
            .rpc("calculate_submitter_metrics", { p_submitter_id: submitter.id });
          
          if (metrics?.[0]?.total_points > maxPoints) {
            maxPoints = metrics[0].total_points;
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", submitter.id)
              .single();
            
            topPerformer = {
              name: profile?.full_name || "Unknown",
              points: metrics[0].total_points,
              level: metrics[0].current_level
            };
          }
        }
      }

      setStats({
        totalSubmitters: submitters?.length || 0,
        activeAchievements: achievements?.length || 0,
        totalPointsAwarded: totalPoints,
        averageEngagement: Math.round((monthlyIdeas?.length || 0) / (submitters?.length || 1)),
        topPerformer
      });
    } catch (error) {
      console.error("Error fetching gamification stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Trophy className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">
          {language === 'ar' ? 'المكافآت والتقدير' : 'Rewards & Recognition'}
        </h1>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {language === 'ar' ? 'إجمالي المقدمين' : 'Total Submitters'}
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
              {stats.totalSubmitters}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              {language === 'ar' ? 'النقاط الممنوحة' : 'Points Awarded'}
            </CardTitle>
            <Star className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800 dark:text-green-200">
              {stats.totalPointsAwarded.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
              {language === 'ar' ? 'الإنجازات النشطة' : 'Active Achievements'}
            </CardTitle>
            <Award className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
              {stats.activeAchievements}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
              {language === 'ar' ? 'متوسط المشاركة' : 'Avg Engagement'}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">
              {stats.averageEngagement}
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400">
              {language === 'ar' ? 'أفكار شهرياً' : 'ideas/month'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800 md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
              {language === 'ar' ? 'أفضل مشارك' : 'Top Performer'}
            </CardTitle>
            <Target className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          </CardHeader>
          <CardContent>
            {stats.topPerformer ? (
              <div>
                <div className="text-xl font-bold text-yellow-800 dark:text-yellow-200">
                  {stats.topPerformer.name}
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm text-yellow-600 dark:text-yellow-400">
                    {stats.topPerformer.points} {language === 'ar' ? 'نقطة' : 'points'}
                  </span>
                  <span className="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded-full text-xs font-medium">
                    {stats.topPerformer.level}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-yellow-600 dark:text-yellow-400">
                {language === 'ar' ? 'لا يوجد بيانات' : 'No data available'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="leaderboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="leaderboard">
            {language === 'ar' ? 'لوحة المتصدرين' : 'Leaderboard'}
          </TabsTrigger>
          <TabsTrigger value="achievements">
            {language === 'ar' ? 'إدارة الإنجازات' : 'Achievements'}
          </TabsTrigger>
          <TabsTrigger value="events">
            {language === 'ar' ? 'فعاليات التقدير' : 'Recognition Events'}
          </TabsTrigger>
          <TabsTrigger value="analytics">
            {language === 'ar' ? 'التحليلات' : 'Analytics'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard">
          <SubmitterLeaderboard onStatsUpdate={fetchGamificationStats} />
        </TabsContent>

        <TabsContent value="achievements">
          <AchievementManagement onUpdate={fetchGamificationStats} />
        </TabsContent>

        <TabsContent value="events">
          <RecognitionEvents />
        </TabsContent>

        <TabsContent value="analytics">
          <RewardsAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};