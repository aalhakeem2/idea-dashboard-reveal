import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { DollarSign, TrendingUp, Target, Award } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ROIData {
  ideaId: string;
  ideaTitle: string;
  category: string;
  expectedROI: number;
  implementationCost: number;
  strategicAlignment: number;
  status: string;
  timeToImplement: number;
}

interface ROIAnalyticsProps {
  roiData: ROIData[];
  totalROI: number;
  totalCost: number;
  avgROI: number;
  portfolioValue: number;
}

const chartConfig = {
  expectedROI: {
    label: "Expected ROI",
    color: "hsl(var(--chart-1))",
  },
  implementationCost: {
    label: "Implementation Cost",
    color: "hsl(var(--chart-2))",
  },
};

export const ROIAnalyticsDashboard: React.FC<ROIAnalyticsProps> = ({ 
  roiData, 
  totalROI, 
  totalCost, 
  avgROI,
  portfolioValue 
}) => {
  const { language } = useLanguage();

  const scatterData = roiData.map(item => ({
    x: item.implementationCost,
    y: item.expectedROI,
    z: item.strategicAlignment,
    name: item.ideaTitle,
    category: item.category,
    status: item.status,
    roi: ((item.expectedROI - item.implementationCost) / item.implementationCost) * 100,
  }));

  const roiEfficiencyData = roiData
    .filter(item => item.status === 'implemented')
    .map(item => ({
      name: item.ideaTitle.length > 20 ? `${item.ideaTitle.substring(0, 20)}...` : item.ideaTitle,
      efficiency: ((item.expectedROI - item.implementationCost) / item.implementationCost) * 100,
      value: item.expectedROI,
      cost: item.implementationCost,
    }))
    .sort((a, b) => b.efficiency - a.efficiency)
    .slice(0, 8);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  return (
    <div className="space-y-6">
      {/* ROI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'ar' ? 'إجمالي العائد المتوقع' : 'Total Expected ROI'}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(totalROI)}</div>
            <p className="text-xs text-muted-foreground">
              {language === 'ar' ? 'من الأفكار المقترحة' : 'from proposed ideas'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'ar' ? 'إجمالي التكلفة' : 'Total Investment'}
            </CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalCost)}</div>
            <p className="text-xs text-muted-foreground">
              {language === 'ar' ? 'تكلفة التنفيذ' : 'implementation cost'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'ar' ? 'متوسط العائد' : 'Average ROI'}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{avgROI.toFixed(1)}%</div>
            <Progress value={Math.min(avgROI, 100)} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'ar' ? 'قيمة المحفظة' : 'Portfolio Value'}
            </CardTitle>
            <Award className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(portfolioValue)}</div>
            <p className="text-xs text-muted-foreground">
              {language === 'ar' ? 'القيمة الصافية' : 'net value'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ROI vs Cost Scatter Plot */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-primary" />
            {language === 'ar' ? 'تحليل العائد مقابل التكلفة' : 'ROI vs Cost Analysis'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px]">
            <ScatterChart data={scatterData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Implementation Cost"
                tickFormatter={formatCurrency}
                label={{ value: language === 'ar' ? 'تكلفة التنفيذ' : 'Implementation Cost', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Expected ROI"
                tickFormatter={formatCurrency}
                label={{ value: language === 'ar' ? 'العائد المتوقع' : 'Expected ROI', angle: -90, position: 'insideLeft' }}
              />
              <ChartTooltip
                content={<ChartTooltipContent 
                  formatter={(value, name, props) => {
                    const data = props.payload;
                    if (name === 'x') return [formatCurrency(Number(value)), language === 'ar' ? 'تكلفة التنفيذ' : 'Implementation Cost'];
                    if (name === 'y') return [formatCurrency(Number(value)), language === 'ar' ? 'العائد المتوقع' : 'Expected ROI'];
                    return [value, name];
                  }}
                  labelFormatter={(label, payload) => {
                    const data = payload?.[0]?.payload;
                    return data ? `${data.name} - ${data.roi?.toFixed(1)}% ROI` : label;
                  }}
                />}
              />
              <Scatter name="Ideas" dataKey="y" fill="hsl(var(--primary))" />
            </ScatterChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* ROI Efficiency Ranking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Award className="h-5 w-5 text-primary" />
            {language === 'ar' ? 'ترتيب كفاءة العائد' : 'ROI Efficiency Ranking'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <LineChart data={roiEfficiencyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis label={{ value: language === 'ar' ? 'كفاءة العائد (%)' : 'ROI Efficiency (%)', angle: -90, position: 'insideLeft' }} />
              <ChartTooltip
                content={<ChartTooltipContent 
                  formatter={(value, name) => [
                    `${Number(value).toFixed(1)}%`,
                    language === 'ar' ? 'كفاءة العائد' : 'ROI Efficiency'
                  ]}
                />}
              />
              <Line 
                type="monotone" 
                dataKey="efficiency" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ChartContainer>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {roiEfficiencyData.slice(0, 6).map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-orange-600' : 'bg-primary'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(item.value)} / {formatCurrency(item.cost)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    item.efficiency > 100 ? 'text-emerald-600' : 
                    item.efficiency > 50 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {item.efficiency.toFixed(1)}%
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