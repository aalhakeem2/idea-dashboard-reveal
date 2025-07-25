import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Target } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface StrategicAlignmentData {
  alignment: string;
  count: number;
  successRate: number;
  avgScore: number;
  label: string;
}

interface StrategicAlignmentRadarProps {
  data: StrategicAlignmentData[];
}

const chartConfig = {
  count: {
    label: "Count",
    color: "hsl(var(--primary))",
  },
  successRate: {
    label: "Success Rate",
    color: "hsl(var(--chart-2))",
  },
  avgScore: {
    label: "Avg Score",
    color: "hsl(var(--chart-3))",
  },
};

export const StrategicAlignmentRadar: React.FC<StrategicAlignmentRadarProps> = ({ data }) => {
  const { language } = useLanguage();

  const transformedData = data.map(item => ({
    subject: item.label,
    A: item.count,
    B: item.successRate,
    C: item.avgScore,
    fullMark: 100
  }));

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Target className="h-5 w-5 text-primary" />
          {language === 'ar' ? 'التوافق الاستراتيجي' : 'Strategic Alignment Impact'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <RadarChart data={transformedData}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <PolarGrid gridType="polygon" />
            <PolarAngleAxis 
              dataKey="subject" 
              className="text-xs"
              tick={{ fontSize: 10 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            <Radar
              name={language === 'ar' ? 'عدد الأفكار' : 'Ideas Count'}
              dataKey="A"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.1}
              strokeWidth={2}
            />
            <Radar
              name={language === 'ar' ? 'معدل النجاح' : 'Success Rate'}
              dataKey="B"
              stroke="hsl(var(--chart-2))"
              fill="hsl(var(--chart-2))"
              fillOpacity={0.1}
              strokeWidth={2}
            />
            <Radar
              name={language === 'ar' ? 'متوسط النتيجة' : 'Avg Score'}
              dataKey="C"
              stroke="hsl(var(--chart-3))"
              fill="hsl(var(--chart-3))"
              fillOpacity={0.1}
              strokeWidth={2}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};