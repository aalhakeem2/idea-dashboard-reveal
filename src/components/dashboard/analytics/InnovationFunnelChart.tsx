import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TrendingDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface FunnelData {
  stage: string;
  count: number;
  percentage: number;
  label: string;
}

interface InnovationFunnelChartProps {
  data: FunnelData[];
}

const chartConfig = {
  count: {
    label: "Count",
    color: "hsl(var(--primary))",
  },
};

const stageColors: Record<string, string> = {
  draft: "hsl(var(--muted))",
  submitted: "hsl(var(--chart-1))",
  under_review: "hsl(var(--chart-2))",
  approved: "hsl(var(--chart-3))",
  implemented: "hsl(var(--chart-4))",
  rejected: "hsl(var(--destructive))",
};

export const InnovationFunnelChart: React.FC<InnovationFunnelChartProps> = ({ data }) => {
  const { language } = useLanguage();

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <TrendingDown className="h-5 w-5 text-primary" />
          {language === 'ar' ? 'قمع الابتكار' : 'Innovation Funnel'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <BarChart data={data} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis 
              dataKey="label" 
              type="category" 
              width={100}
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip
              content={<ChartTooltipContent 
                formatter={(value, name, props) => [
                  `${value} ideas (${props.payload?.percentage?.toFixed(1)}%)`,
                  name
                ]}
              />}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={stageColors[entry.stage] || "hsl(var(--primary))"} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {data.map((stage, index) => (
            <div key={stage.stage} className="flex items-center justify-between p-2 bg-muted/30 rounded">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: stageColors[stage.stage] }}
                />
                <span className="text-sm font-medium">{stage.label}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold">{stage.count}</div>
                <div className="text-xs text-muted-foreground">{stage.percentage.toFixed(1)}%</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};