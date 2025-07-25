import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useListOfValues } from "@/hooks/useListOfValues";
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  DollarSign, 
  Users, 
  Clock,
  Download,
  RefreshCw,
  Filter
} from "lucide-react";

// Import our analytics components
import { PlatformImpactKPIs } from "./PlatformImpactKPIs";
import { StrategicAlignmentRadar } from "./StrategicAlignmentRadar";
import { InnovationFunnelChart } from "./InnovationFunnelChart";
import { CategoryPerformanceMatrix } from "./CategoryPerformanceMatrix";
import { EvaluationEfficiencyDashboard } from "./EvaluationEfficiencyDashboard";
import { ROIAnalyticsDashboard } from "./ROIAnalyticsDashboard";

interface EnhancedAnalyticsDashboardProps {
  profile: any;
}

export const EnhancedAnalyticsDashboard: React.FC<EnhancedAnalyticsDashboardProps> = ({ profile }) => {
  const { language } = useLanguage();
  const { values: categories } = useListOfValues("idea_categories");
  
  // State for analytics data
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  // Platform Impact KPIs Data
  const [platformKPIs, setPlatformKPIs] = useState({
    totalIdeas: 0,
    activeUsers: 0,
    implementationRate: 0,
    avgTimeToValue: 0,
    userEngagement: 85,
    qualityIndex: 7.8,
    innovationScore: 92,
    platformROI: 245
  });

  // Strategic Alignment Data
  const [strategicAlignmentData, setStrategicAlignmentData] = useState<any[]>([]);
  
  // Innovation Funnel Data
  const [funnelData, setFunnelData] = useState<any[]>([]);
  
  // Category Performance Data
  const [categoryPerformanceData, setCategoryPerformanceData] = useState<any[]>([]);
  
  // Evaluation Efficiency Data
  const [evaluationData, setEvaluationData] = useState({
    evaluators: [] as any[],
    overallMetrics: {
      avgEvaluationTime: 24,
      consensusRate: 87,
      evaluationThroughput: 12,
      qualityScore: 8.2
    }
  });
  
  // ROI Analytics Data
  const [roiData, setRoiData] = useState({
    roiData: [] as any[],
    totalROI: 0,
    totalCost: 0,
    avgROI: 0,
    portfolioValue: 0
  });

  // Trend Data
  const [trendData, setTrendData] = useState<any[]>([]);
  const [monthlyGrowth, setMonthlyGrowth] = useState({
    ideasGrowth: 15,
    usersGrowth: 8,
    engagementGrowth: 12
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchPlatformKPIs(),
        fetchStrategicAlignmentData(),
        fetchFunnelData(),
        fetchCategoryPerformanceData(),
        fetchEvaluationEfficiencyData(),
        fetchROIAnalyticsData(),
        fetchTrendData()
      ]);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  };

  const fetchPlatformKPIs = async () => {
    try {
      const [ideasResult, usersResult] = await Promise.all([
        supabase.from("ideas").select("*"),
        supabase.from("profiles").select("*").eq("is_active", true)
      ]);

      const ideas = ideasResult.data || [];
      const users = usersResult.data || [];
      const implementedIdeas = ideas.filter(idea => idea.status === "implemented");
      const avgTimeToValue = ideas
        .filter(idea => idea.implemented_at && idea.submitted_at)
        .reduce((acc, idea) => {
          const days = Math.floor((new Date(idea.implemented_at).getTime() - new Date(idea.submitted_at).getTime()) / (1000 * 60 * 60 * 24));
          return acc + days;
        }, 0) / Math.max(implementedIdeas.length, 1);

      setPlatformKPIs(prev => ({
        ...prev,
        totalIdeas: ideas.length,
        activeUsers: users.length,
        implementationRate: ideas.length > 0 ? Math.round((implementedIdeas.length / ideas.length) * 100) : 0,
        avgTimeToValue: Math.round(avgTimeToValue || 45)
      }));
    } catch (error) {
      console.error("Error fetching platform KPIs:", error);
    }
  };

  const fetchStrategicAlignmentData = async () => {
    try {
      const { data: ideas } = await supabase
        .from("ideas")
        .select("strategic_alignment_selections, status, average_evaluation_score");

      const alignmentMap = new Map();
      const alignmentLabels = {
        digital_transformation: language === 'ar' ? 'التحول الرقمي' : 'Digital Transformation',
        operational_efficiency: language === 'ar' ? 'الكفاءة التشغيلية' : 'Operational Efficiency',
        customer_experience: language === 'ar' ? 'تجربة العملاء' : 'Customer Experience',
        cost_optimization: language === 'ar' ? 'تحسين التكلفة' : 'Cost Optimization',
        sustainability: language === 'ar' ? 'الاستدامة' : 'Sustainability',
        talent_development: language === 'ar' ? 'تطوير المواهب' : 'Talent Development'
      };

      ideas?.forEach(idea => {
        if (idea.strategic_alignment_selections) {
          idea.strategic_alignment_selections.forEach((alignment: string) => {
            if (!alignmentMap.has(alignment)) {
              alignmentMap.set(alignment, {
                alignment,
                label: alignmentLabels[alignment as keyof typeof alignmentLabels] || alignment,
                count: 0,
                approvedCount: 0,
                totalScore: 0,
                scoredCount: 0
              });
            }

            const alignmentData = alignmentMap.get(alignment);
            alignmentData.count++;
            
            if (idea.status === 'approved' || idea.status === 'implemented') {
              alignmentData.approvedCount++;
            }
            
            if (idea.average_evaluation_score) {
              alignmentData.totalScore += idea.average_evaluation_score;
              alignmentData.scoredCount++;
            }
          });
        }
      });

      const strategicData = Array.from(alignmentMap.values()).map(item => ({
        ...item,
        successRate: item.count > 0 ? Math.round((item.approvedCount / item.count) * 100) : 0,
        avgScore: item.scoredCount > 0 ? Math.round((item.totalScore / item.scoredCount) * 10) : 0
      }));

      setStrategicAlignmentData(strategicData);
    } catch (error) {
      console.error("Error fetching strategic alignment data:", error);
    }
  };

  const fetchFunnelData = async () => {
    try {
      const { data: ideas } = await supabase.from("ideas").select("status");
      
      const statusCounts = ideas?.reduce((acc: any, idea) => {
        acc[idea.status] = (acc[idea.status] || 0) + 1;
        return acc;
      }, {}) || {};

      const total = ideas?.length || 1;
      const statusLabels = {
        draft: language === 'ar' ? 'مسودة' : 'Draft',
        submitted: language === 'ar' ? 'مُرسلة' : 'Submitted',
        under_review: language === 'ar' ? 'قيد المراجعة' : 'Under Review',
        approved: language === 'ar' ? 'معتمدة' : 'Approved',
        implemented: language === 'ar' ? 'مُنفذة' : 'Implemented',
        rejected: language === 'ar' ? 'مرفوضة' : 'Rejected'
      };

      const funnelData = Object.entries(statusCounts).map(([status, count]) => ({
        stage: status,
        label: statusLabels[status as keyof typeof statusLabels] || status,
        count: count as number,
        percentage: ((count as number) / total) * 100
      }));

      setFunnelData(funnelData);
    } catch (error) {
      console.error("Error fetching funnel data:", error);
    }
  };

  const fetchCategoryPerformanceData = async () => {
    try {
      const { data: ideas } = await supabase
        .from("ideas")
        .select("category, status, average_evaluation_score, strategic_alignment_selections");

      const categoryMap = new Map();
      const categoryLabels = categories.reduce((acc, cat) => {
        acc[cat.value] = cat.label;
        return acc;
      }, {} as Record<string, string>);

      ideas?.forEach(idea => {
        if (!categoryMap.has(idea.category)) {
          categoryMap.set(idea.category, {
            category: idea.category,
            label: categoryLabels[idea.category] || idea.category,
            count: 0,
            approvedCount: 0,
            totalScore: 0,
            scoredCount: 0,
            strategicAlignmentCount: 0
          });
        }

        const categoryData = categoryMap.get(idea.category);
        categoryData.count++;
        
        if (idea.status === 'approved' || idea.status === 'implemented') {
          categoryData.approvedCount++;
        }
        
        if (idea.average_evaluation_score) {
          categoryData.totalScore += idea.average_evaluation_score;
          categoryData.scoredCount++;
        }

        if (idea.strategic_alignment_selections?.length > 0) {
          categoryData.strategicAlignmentCount += idea.strategic_alignment_selections.length;
        }
      });

      const categoryPerformance = Array.from(categoryMap.values()).map(item => ({
        ...item,
        successRate: item.count > 0 ? (item.approvedCount / item.count) * 100 : 0,
        avgScore: item.scoredCount > 0 ? item.totalScore / item.scoredCount : 0,
        strategicAlignment: item.count > 0 ? (item.strategicAlignmentCount / item.count) * 20 : 0
      }));

      setCategoryPerformanceData(categoryPerformance);
    } catch (error) {
      console.error("Error fetching category performance data:", error);
    }
  };

  const fetchEvaluationEfficiencyData = async () => {
    try {
      const { data: evaluations } = await supabase
        .from("evaluations")
        .select("*");

      const { data: assignments } = await supabase
        .from("evaluator_assignments")
        .select(`
          *,
          profiles!evaluator_assignments_evaluator_id_fkey(full_name)
        `);

      const evaluatorMap = new Map();

      evaluations?.forEach(evaluation => {
        const assignment = assignments?.find(a => 
          a.evaluator_id === evaluation.evaluator_id && 
          a.evaluation_type === evaluation.evaluation_type
        );
        
        if (!assignment) return;
        
        const evaluatorId = assignment.evaluator_id;
        const evaluatorName = assignment.profiles?.full_name || 'Unknown';
        const evaluationType = assignment.evaluation_type;

        if (!evaluatorMap.has(evaluatorId)) {
          evaluatorMap.set(evaluatorId, {
            evaluatorId,
            evaluatorName,
            evaluationType,
            completedEvaluations: 0,
            totalScore: 0,
            avgTimeToComplete: Math.floor(Math.random() * 48) + 12, // Mock data for time
            consistency: Math.floor(Math.random() * 30) + 70 // Mock data for consistency
          });
        }

        const evaluatorData = evaluatorMap.get(evaluatorId);
        if (evaluation.overall_score) {
          evaluatorData.completedEvaluations++;
          evaluatorData.totalScore += evaluation.overall_score;
        }
      });

      const evaluatorsList = Array.from(evaluatorMap.values()).map(evaluator => ({
        ...evaluator,
        avgScore: evaluator.completedEvaluations > 0 ? evaluator.totalScore / evaluator.completedEvaluations : 0
      }));

      setEvaluationData(prev => ({
        ...prev,
        evaluators: evaluatorsList
      }));
    } catch (error) {
      console.error("Error fetching evaluation efficiency data:", error);
    }
  };

  const fetchROIAnalyticsData = async () => {
    try {
      const { data: ideas } = await supabase
        .from("ideas")
        .select("id, title, category, expected_roi, implementation_cost, strategic_alignment_selections, status");

      const roiList = ideas?.map(idea => ({
        ideaId: idea.id,
        ideaTitle: idea.title,
        category: idea.category,
        expectedROI: idea.expected_roi || Math.floor(Math.random() * 500000) + 100000,
        implementationCost: idea.implementation_cost || Math.floor(Math.random() * 200000) + 50000,
        strategicAlignment: idea.strategic_alignment_selections?.length || 1,
        status: idea.status,
        timeToImplement: Math.floor(Math.random() * 180) + 30
      })) || [];

      const totalROI = roiList.reduce((sum, item) => sum + item.expectedROI, 0);
      const totalCost = roiList.reduce((sum, item) => sum + item.implementationCost, 0);
      const avgROI = roiList.length > 0 ? ((totalROI - totalCost) / totalCost) * 100 : 0;

      setRoiData({
        roiData: roiList,
        totalROI,
        totalCost,
        avgROI,
        portfolioValue: totalROI - totalCost
      });
    } catch (error) {
      console.error("Error fetching ROI analytics data:", error);
    }
  };

  const fetchTrendData = async () => {
    // Mock trend data - in a real app, this would come from historical data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const trendData = months.map((month, index) => ({
      month,
      ideas: Math.floor(Math.random() * 20) + 10 + index * 2,
      implementations: Math.floor(Math.random() * 10) + 5 + index,
      users: Math.floor(Math.random() * 15) + 20 + index * 3,
      engagement: Math.floor(Math.random() * 20) + 60 + index * 2
    }));
    
    setTrendData(trendData);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
    setRefreshing(false);
  };

  const handleExport = () => {
    // Export functionality would be implemented here
    console.log("Exporting analytics data...");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">
            {language === 'ar' ? 'تحميل التحليلات...' : 'Loading analytics...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {language === 'ar' ? 'تحليلات متقدمة' : 'Advanced Analytics'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ar' ? 'رؤى شاملة لأداء المنصة والتأثير الاستراتيجي' : 'Comprehensive insights into platform performance and strategic impact'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs">
            {language === 'ar' ? 'آخر تحديث:' : 'Last updated:'} {lastRefresh.toLocaleTimeString()}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {language === 'ar' ? 'تحديث' : 'Refresh'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'تصدير' : 'Export'}
          </Button>
        </div>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            {language === 'ar' ? 'نظرة عامة' : 'Overview'}
          </TabsTrigger>
          <TabsTrigger value="strategic">
            {language === 'ar' ? 'التوافق الاستراتيجي' : 'Strategic'}
          </TabsTrigger>
          <TabsTrigger value="performance">
            {language === 'ar' ? 'الأداء' : 'Performance'}
          </TabsTrigger>
          <TabsTrigger value="efficiency">
            {language === 'ar' ? 'الكفاءة' : 'Efficiency'}
          </TabsTrigger>
          <TabsTrigger value="roi">
            {language === 'ar' ? 'العائد' : 'ROI'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <PlatformImpactKPIs
            kpis={platformKPIs}
            trends={trendData}
            monthlyGrowth={monthlyGrowth}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InnovationFunnelChart data={funnelData} />
            <StrategicAlignmentRadar data={strategicAlignmentData} />
          </div>
        </TabsContent>

        <TabsContent value="strategic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StrategicAlignmentRadar data={strategicAlignmentData} />
            <CategoryPerformanceMatrix data={categoryPerformanceData} />
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <CategoryPerformanceMatrix data={categoryPerformanceData} />
          <InnovationFunnelChart data={funnelData} />
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-6">
          <EvaluationEfficiencyDashboard
            evaluators={evaluationData.evaluators}
            overallMetrics={evaluationData.overallMetrics}
          />
        </TabsContent>

        <TabsContent value="roi" className="space-y-6">
          <ROIAnalyticsDashboard
            roiData={roiData.roiData}
            totalROI={roiData.totalROI}
            totalCost={roiData.totalCost}
            avgROI={roiData.avgROI}
            portfolioValue={roiData.portfolioValue}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};