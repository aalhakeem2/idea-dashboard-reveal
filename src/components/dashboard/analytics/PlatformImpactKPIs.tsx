import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TrendingUp, Users, Lightbulb, Target, Clock, Award, Activity, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface KPIData {
  totalIdeas: number;
  activeUsers: number;
  implementationRate: number;
  avgTimeToValue: number;
  userEngagement: number;
  qualityIndex: number;
  innovationScore: number;
  platformROI: number;
}

interface TrendData {
  month: string;
  ideas: number;
  implementations: number;
  users: number;
  engagement: number;
}

interface PlatformImpactKPIsProps {
  kpis: KPIData;
  trends: TrendData[];
  monthlyGrowth: {
    ideasGrowth: number;
    usersGrowth: number;
    engagementGrowth: number;
  };
}

const chartConfig = {
  ideas: {
    label: "Ideas",
    color: "hsl(var(--chart-1))",
  },
  implementations: {
    label: "Implementations",
    color: "hsl(var(--chart-2))",
  },
  users: {
    label: "Users",
    color: "hsl(var(--chart-3))",
  },
  engagement: {
    label: "Engagement",
    color: "hsl(var(--chart-4))",
  },
};

export const PlatformImpactKPIs: React.FC<PlatformImpactKPIsProps> = ({ 
  kpis, 
  trends, 
  monthlyGrowth 
}) => {
  const { language } = useLanguage();

  const getKPIStatus = (value: number, target: number) => {
    const percentage = (value / target) * 100;
    if (percentage >= 100) return { color: "text-emerald-600", status: "excellent" };
    if (percentage >= 80) return { color: "text-blue-600", status: "good" };
    if (percentage >= 60) return { color: "text-yellow-600", status: "average" };
    return { color: "text-red-600", status: "needs-improvement" };
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="h-3 w-3 text-emerald-600" />;
    return <TrendingUp className="h-3 w-3 text-red-600 transform rotate-180" />;
  };

  return (
    <div className="space-y-6">
      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'ar' ? 'إجمالي الأفكار' : 'Total Ideas'}
            </CardTitle>
            <Lightbulb className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{kpis.totalIdeas}</div>
            <div className="flex items-center gap-1 mt-1">
              {getGrowthIcon(monthlyGrowth.ideasGrowth)}
              <span className="text-xs text-muted-foreground">
                {monthlyGrowth.ideasGrowth > 0 ? '+' : ''}{monthlyGrowth.ideasGrowth}% {language === 'ar' ? 'هذا الشهر' : 'this month'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'ar' ? 'المستخدمون النشطون' : 'Active Users'}
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{kpis.activeUsers}</div>
            <div className="flex items-center gap-1 mt-1">
              {getGrowthIcon(monthlyGrowth.usersGrowth)}
              <span className="text-xs text-muted-foreground">
                {monthlyGrowth.usersGrowth > 0 ? '+' : ''}{monthlyGrowth.usersGrowth}% {language === 'ar' ? 'هذا الشهر' : 'this month'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'ar' ? 'معدل التنفيذ' : 'Implementation Rate'}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{kpis.implementationRate}%</div>
            <Progress value={kpis.implementationRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'ar' ? 'الوقت للقيمة' : 'Time to Value'}
            </CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{kpis.avgTimeToValue}d</div>
            <p className="text-xs text-muted-foreground">
              {language === 'ar' ? 'أيام متوسط' : 'average days'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'ar' ? 'مؤشر المشاركة' : 'User Engagement'}
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getKPIStatus(kpis.userEngagement, 100).color}`}>
              {kpis.userEngagement}%
            </div>
            <div className="flex items-center gap-1 mt-1">
              {getGrowthIcon(monthlyGrowth.engagementGrowth)}
              <Badge variant={getKPIStatus(kpis.userEngagement, 80).status === 'excellent' ? 'default' : 'secondary'}>
                {getKPIStatus(kpis.userEngagement, 80).status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'ar' ? 'مؤشر الجودة' : 'Quality Index'}
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getKPIStatus(kpis.qualityIndex, 10).color}`}>
              {kpis.qualityIndex}/10
            </div>
            <Progress value={kpis.qualityIndex * 10} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'ar' ? 'نتيجة الابتكار' : 'Innovation Score'}
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getKPIStatus(kpis.innovationScore, 100).color}`}>
              {kpis.innovationScore}
            </div>
            <Badge variant={getKPIStatus(kpis.innovationScore, 80).status === 'excellent' ? 'default' : 'secondary'}>
              {getKPIStatus(kpis.innovationScore, 80).status}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'ar' ? 'عائد المنصة' : 'Platform ROI'}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getKPIStatus(kpis.platformROI, 200).color}`}>
              {kpis.platformROI}%
            </div>
            <p className="text-xs text-muted-foreground">
              {language === 'ar' ? 'عائد الاستثمار' : 'return on investment'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              {language === 'ar' ? 'اتجاهات الأفكار والتنفيذ' : 'Ideas & Implementation Trends'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="ideas" 
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={3}
                  name={language === 'ar' ? 'الأفكار' : 'Ideas'}
                />
                <Line 
                  type="monotone" 
                  dataKey="implementations" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={3}
                  name={language === 'ar' ? 'التنفيذ' : 'Implementations'}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              {language === 'ar' ? 'اتجاهات المستخدمين والمشاركة' : 'User & Engagement Trends'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <AreaChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stackId="1"
                  stroke="hsl(var(--chart-3))" 
                  fill="hsl(var(--chart-3))"
                  fillOpacity={0.6}
                  name={language === 'ar' ? 'المستخدمون' : 'Users'}
                />
                <Area 
                  type="monotone" 
                  dataKey="engagement" 
                  stackId="1"
                  stroke="hsl(var(--chart-4))" 
                  fill="hsl(var(--chart-4))"
                  fillOpacity={0.6}
                  name={language === 'ar' ? 'المشاركة' : 'Engagement'}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};