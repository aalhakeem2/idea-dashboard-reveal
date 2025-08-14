import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Trophy, Medal, Crown, Star, TrendingUp, Award } from "lucide-react";

interface SubmitterMetrics {
  id: string;
  full_name: string;
  email: string;
  department: string;
  total_ideas: number;
  approved_ideas: number;
  implemented_ideas: number;
  avg_quality_score: number;
  avg_innovation_score: number;
  total_points: number;
  current_level: string;
  rank?: number;
}

interface SubmitterLeaderboardProps {
  onStatsUpdate?: () => void;
}

export const SubmitterLeaderboard: React.FC<SubmitterLeaderboardProps> = ({ onStatsUpdate }) => {
  const [submitters, setSubmitters] = useState<SubmitterMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodFilter, setPeriodFilter] = useState("overall");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [departments, setDepartments] = useState<string[]>([]);
  const { language } = useLanguage();

  useEffect(() => {
    fetchSubmitterMetrics();
    fetchDepartments();
  }, [periodFilter, departmentFilter]);

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("department")
        .eq("role", "submitter")
        .not("department", "is", null);

      if (error) throw error;

      const uniqueDepartments = [...new Set(data?.map(p => p.department).filter(Boolean))] as string[];
      setDepartments(uniqueDepartments);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchSubmitterMetrics = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from("profiles")
        .select("id, full_name, email, department")
        .eq("role", "submitter")
        .eq("is_active", true);

      if (departmentFilter !== "all") {
        query = query.eq("department", departmentFilter);
      }

      const { data: profiles, error } = await query;
      if (error) throw error;

      const metricsPromises = profiles?.map(async (profile) => {
        const { data: metrics } = await supabase
          .rpc("calculate_submitter_metrics", { p_submitter_id: profile.id });

        return {
          ...profile,
          ...(metrics?.[0] || {
            total_ideas: 0,
            approved_ideas: 0,
            implemented_ideas: 0,
            avg_quality_score: 0,
            avg_innovation_score: 0,
            total_points: 0,
            current_level: "Beginner"
          })
        };
      }) || [];

      const allMetrics = await Promise.all(metricsPromises);
      
      // Sort by total points and add ranks
      const sortedMetrics = allMetrics
        .sort((a, b) => b.total_points - a.total_points)
        .map((submitter, index) => ({
          ...submitter,
          rank: index + 1
        }));

      setSubmitters(sortedMetrics);
    } catch (error) {
      console.error("Error fetching submitter metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Platinum": return "bg-gradient-to-r from-gray-300 to-gray-100 text-gray-800";
      case "Gold": return "bg-gradient-to-r from-yellow-400 to-yellow-200 text-yellow-800";
      case "Silver": return "bg-gradient-to-r from-gray-400 to-gray-200 text-gray-800";
      case "Bronze": return "bg-gradient-to-r from-orange-400 to-orange-200 text-orange-800";
      default: return "bg-gradient-to-r from-blue-400 to-blue-200 text-blue-800";
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Medal className="h-5 w-5 text-orange-400" />;
      default: return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold">{rank}</span>;
    }
  };

  const calculateSuccessRate = (approved: number, total: number) => {
    return total > 0 ? Math.round((approved / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Select value={periodFilter} onValueChange={setPeriodFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="overall">
              {language === 'ar' ? 'إجمالي' : 'Overall'}
            </SelectItem>
            <SelectItem value="monthly">
              {language === 'ar' ? 'شهري' : 'Monthly'}
            </SelectItem>
            <SelectItem value="quarterly">
              {language === 'ar' ? 'ربع سنوي' : 'Quarterly'}
            </SelectItem>
            <SelectItem value="yearly">
              {language === 'ar' ? 'سنوي' : 'Yearly'}
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {language === 'ar' ? 'جميع الأقسام' : 'All Departments'}
            </SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={fetchSubmitterMetrics} variant="outline">
          {language === 'ar' ? 'تحديث' : 'Refresh'}
        </Button>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {submitters.slice(0, 3).map((submitter, index) => (
          <Card key={submitter.id} className={`relative overflow-hidden ${
            index === 0 ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900' :
            index === 1 ? 'border-gray-400 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900' :
            'border-orange-400 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900'
          }`}>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                {getRankIcon(submitter.rank!)}
              </div>
              <Avatar className="w-16 h-16 mx-auto mb-3">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${submitter.full_name}`} />
                <AvatarFallback>{submitter.full_name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <CardTitle className="text-lg">{submitter.full_name}</CardTitle>
              <p className="text-sm text-muted-foreground">{submitter.department}</p>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-primary">
                  {submitter.total_points} {language === 'ar' ? 'نقطة' : 'pts'}
                </div>
                <Badge className={`${getLevelColor(submitter.current_level)} font-medium`}>
                  {submitter.current_level}
                </Badge>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/50 dark:bg-black/20 rounded p-2">
                    <div className="font-medium">{submitter.total_ideas}</div>
                    <div className="text-muted-foreground">{language === 'ar' ? 'أفكار' : 'Ideas'}</div>
                  </div>
                  <div className="bg-white/50 dark:bg-black/20 rounded p-2">
                    <div className="font-medium">{calculateSuccessRate(submitter.approved_ideas, submitter.total_ideas)}%</div>
                    <div className="text-muted-foreground">{language === 'ar' ? 'نجاح' : 'Success'}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Full Leaderboard Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            {language === 'ar' ? 'التصنيف الكامل' : 'Full Rankings'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">{language === 'ar' ? 'الترتيب' : 'Rank'}</TableHead>
                <TableHead>{language === 'ar' ? 'المشارك' : 'Submitter'}</TableHead>
                <TableHead className="text-center">{language === 'ar' ? 'النقاط' : 'Points'}</TableHead>
                <TableHead className="text-center">{language === 'ar' ? 'المستوى' : 'Level'}</TableHead>
                <TableHead className="text-center">{language === 'ar' ? 'الأفكار' : 'Ideas'}</TableHead>
                <TableHead className="text-center">{language === 'ar' ? 'معدل النجاح' : 'Success Rate'}</TableHead>
                <TableHead className="text-center">{language === 'ar' ? 'الجودة' : 'Quality'}</TableHead>
                <TableHead className="text-center">{language === 'ar' ? 'الابتكار' : 'Innovation'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submitters.map((submitter) => (
                <TableRow key={submitter.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center justify-center">
                      {getRankIcon(submitter.rank!)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${submitter.full_name}`} />
                        <AvatarFallback className="text-xs">{submitter.full_name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{submitter.full_name}</div>
                        <div className="text-sm text-muted-foreground">{submitter.department}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {submitter.total_points}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={`${getLevelColor(submitter.current_level)} text-xs`}>
                      {submitter.current_level}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{submitter.total_ideas}</TableCell>
                  <TableCell className="text-center">
                    <span className={`font-medium ${
                      calculateSuccessRate(submitter.approved_ideas, submitter.total_ideas) >= 80 ? 'text-green-600' :
                      calculateSuccessRate(submitter.approved_ideas, submitter.total_ideas) >= 60 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {calculateSuccessRate(submitter.approved_ideas, submitter.total_ideas)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-medium">
                      {submitter.avg_quality_score?.toFixed(1) || '0.0'}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-medium">
                      {submitter.avg_innovation_score?.toFixed(1) || '0.0'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};