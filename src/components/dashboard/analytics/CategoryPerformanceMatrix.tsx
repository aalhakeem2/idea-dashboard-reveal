import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Grid3X3 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface CategoryData {
  category: string;
  label: string;
  count: number;
  successRate: number;
  avgScore: number;
  strategicAlignment: number;
}

interface CategoryPerformanceMatrixProps {
  data: CategoryData[];
}

const chartConfig = {
  successRate: {
    label: "Success Rate",
    color: "hsl(var(--primary))",
  },
  avgScore: {
    label: "Average Score",
    color: "hsl(var(--chart-2))",
  },
};

const categoryColors: string[] = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export const CategoryPerformanceMatrix: React.FC<CategoryPerformanceMatrixProps> = ({ data }) => {
  const { language } = useLanguage();

  const scatterData = data.map((item, index) => ({
    x: item.avgScore,
    y: item.successRate,
    z: item.count,
    name: item.label,
    category: item.category,
    color: categoryColors[index % categoryColors.length],
    strategicAlignment: item.strategicAlignment,
  }));

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Grid3X3 className="h-5 w-5 text-primary" />
          {language === 'ar' ? 'مصفوفة أداء الفئات' : 'Category Performance Matrix'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ScatterChart data={scatterData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Average Score"
                  domain={[0, 10]}
                  label={{ value: language === 'ar' ? 'متوسط النتيجة' : 'Average Score', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Success Rate"
                  domain={[0, 100]}
                  label={{ value: language === 'ar' ? 'معدل النجاح (%)' : 'Success Rate (%)', angle: -90, position: 'insideLeft' }}
                />
                <ChartTooltip
                  content={<ChartTooltipContent 
                    formatter={(value, name, props) => {
                      if (name === 'x') return [`${value}/10`, language === 'ar' ? 'متوسط النتيجة' : 'Average Score'];
                      if (name === 'y') return [`${value}%`, language === 'ar' ? 'معدل النجاح' : 'Success Rate'];
                      return [value, name];
                    }}
                    labelFormatter={(label, payload) => {
                      const data = payload?.[0]?.payload;
                      return data ? `${data.name} (${data.z} ${language === 'ar' ? 'فكرة' : 'ideas'})` : label;
                    }}
                  />}
                />
                <Scatter name="Categories" dataKey="y">
                  {scatterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ChartContainer>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">{language === 'ar' ? 'الفئات' : 'Categories'}</h4>
            {data.map((category, index) => (
              <div key={category.category} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: categoryColors[index % categoryColors.length] }}
                  />
                  <div>
                    <div className="font-medium text-sm">{category.label}</div>
                    <div className="text-xs text-muted-foreground">{category.count} {language === 'ar' ? 'فكرة' : 'ideas'}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">{category.avgScore.toFixed(1)}/10</div>
                  <div className="text-xs text-muted-foreground">{category.successRate.toFixed(0)}% {language === 'ar' ? 'نجاح' : 'success'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};