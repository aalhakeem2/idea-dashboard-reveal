import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Clock, Users, Target, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface EvaluatorData {
  evaluatorId: string;
  evaluatorName: string;
  evaluationType: string;
  completedEvaluations: number;
  avgTimeToComplete: number;
  avgScore: number;
  consistency: number;
}

interface EvaluationEfficiencyProps {
  evaluators: EvaluatorData[];
  overallMetrics: {
    avgEvaluationTime: number;
    consensusRate: number;
    evaluationThroughput: number;
    qualityScore: number;
  };
}

const chartConfig = {
  completedEvaluations: {
    label: "Completed",
    color: "hsl(var(--chart-1))",
  },
  avgScore: {
    label: "Avg Score",
    color: "hsl(var(--chart-2))",
  },
  consistency: {
    label: "Consistency",
    color: "hsl(var(--chart-3))",
  },
};

export const EvaluationEfficiencyDashboard: React.FC<EvaluationEfficiencyProps> = ({ 
  evaluators, 
  overallMetrics 
}) => {
  const { language } = useLanguage();

  const evaluatorChartData = evaluators.map(evaluator => ({
    name: evaluator.evaluatorName.length > 15 
      ? `${evaluator.evaluatorName.substring(0, 15)}...` 
      : evaluator.evaluatorName,
    completed: evaluator.completedEvaluations,
    avgScore: evaluator.avgScore,
    consistency: evaluator.consistency,
    type: evaluator.evaluationType,
  }));

  const getEfficiencyColor = (value: number, max: number) => {
    const percentage = (value / max) * 100;
    if (percentage >= 80) return "text-emerald-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'ar' ? 'متوسط وقت التقييم' : 'Avg Evaluation Time'}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMetrics.avgEvaluationTime}h</div>
            <p className="text-xs text-muted-foreground">
              {language === 'ar' ? 'ساعات' : 'hours per evaluation'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'ar' ? 'معدل الإجماع' : 'Consensus Rate'}
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMetrics.consensusRate}%</div>
            <Progress value={overallMetrics.consensusRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'ar' ? 'إنتاجية التقييم' : 'Evaluation Throughput'}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMetrics.evaluationThroughput}</div>
            <p className="text-xs text-muted-foreground">
              {language === 'ar' ? 'تقييمات/يوم' : 'evaluations/day'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'ar' ? 'نتيجة الجودة' : 'Quality Score'}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMetrics.qualityScore}/10</div>
            <Progress value={overallMetrics.qualityScore * 10} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Evaluator Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            {language === 'ar' ? 'أداء المقيمين' : 'Evaluator Performance'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <BarChart data={evaluatorChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis />
              <ChartTooltip
                content={<ChartTooltipContent />}
              />
              <Bar dataKey="completed" fill="hsl(var(--chart-1))" name={language === 'ar' ? 'مكتمل' : 'Completed'} />
              <Bar dataKey="avgScore" fill="hsl(var(--chart-2))" name={language === 'ar' ? 'متوسط النتيجة' : 'Avg Score'} />
              <Bar dataKey="consistency" fill="hsl(var(--chart-3))" name={language === 'ar' ? 'الاتساق' : 'Consistency'} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Evaluator Details */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'ar' ? 'تفاصيل المقيمين' : 'Evaluator Details'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {evaluators.map((evaluator) => (
              <div key={evaluator.evaluatorId} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <h4 className="font-semibold">{evaluator.evaluatorName}</h4>
                    <p className="text-sm text-muted-foreground">
                      <Badge variant="outline" className="mr-2">
                        {evaluator.evaluationType}
                      </Badge>
                      {evaluator.completedEvaluations} {language === 'ar' ? 'تقييمات مكتملة' : 'completed evaluations'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className={`text-lg font-bold ${getEfficiencyColor(evaluator.avgTimeToComplete, 48)}`}>
                      {evaluator.avgTimeToComplete}h
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {language === 'ar' ? 'متوسط الوقت' : 'Avg Time'}
                    </div>
                  </div>
                  <div>
                    <div className={`text-lg font-bold ${getEfficiencyColor(evaluator.avgScore, 10)}`}>
                      {evaluator.avgScore.toFixed(1)}/10
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {language === 'ar' ? 'متوسط النتيجة' : 'Avg Score'}
                    </div>
                  </div>
                  <div>
                    <div className={`text-lg font-bold ${getEfficiencyColor(evaluator.consistency, 100)}`}>
                      {evaluator.consistency}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {language === 'ar' ? 'الاتساق' : 'Consistency'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};