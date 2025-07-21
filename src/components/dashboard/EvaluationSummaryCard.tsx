
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, TrendingUp, Clock, CheckCircle, Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface EvaluationSummary {
  ideaId: string;
  ideaTitle: string;
  ideaReferenceCode: string;
  status: string;
  submittedAt: string;
  evaluatedAt?: string;
  completedEvaluations: number;
  totalEvaluations: number;
  averageScores: {
    feasibility: number;
    impact: number;
    innovation: number;
    overall: number;
    enrichment?: number;
  };
  categoryScores: {
    technology: number;
    finance: number;
    commercial: number;
  };
  priority?: string;
  submitterName?: string;
}

interface EvaluationSummaryCardProps {
  summary: EvaluationSummary;
  isManagementView?: boolean;
  onClick?: () => void;
}

export const EvaluationSummaryCard: React.FC<EvaluationSummaryCardProps> = ({
  summary,
  isManagementView = false,
  onClick
}) => {
  const { language } = useLanguage();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'evaluated':
        return 'bg-green-100 text-green-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const progressPercentage = Math.round((summary.completedEvaluations / summary.totalEvaluations) * 100);

  return (
    <Card 
      className={`border-border hover:shadow-md transition-shadow cursor-pointer ${onClick ? 'hover:bg-muted/20' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">{summary.ideaTitle}</CardTitle>
            <p className="text-sm text-muted-foreground">{summary.ideaReferenceCode}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Badge className={getStatusColor(summary.status)}>
              {summary.status}
            </Badge>
            {summary.priority && (
              <Badge variant="outline" className={getPriorityColor(summary.priority)}>
                {summary.priority}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Evaluation Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {language === 'ar' ? 'التقييم مكتمل' : 'Evaluation Progress'}
            </span>
            <span className="font-medium">{summary.completedEvaluations}/{summary.totalEvaluations}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Score Summary */}
        {summary.completedEvaluations > 0 && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <BarChart3 className="h-4 w-4 text-blue-500" />
                {language === 'ar' ? 'متوسط النقاط' : 'Average Scores'}
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>{language === 'ar' ? 'الجدوى' : 'Feasibility'}:</span>
                  <span className="font-medium">{summary.averageScores.feasibility.toFixed(1)}/10</span>
                </div>
                <div className="flex justify-between">
                  <span>{language === 'ar' ? 'التأثير' : 'Impact'}:</span>
                  <span className="font-medium">{summary.averageScores.impact.toFixed(1)}/10</span>
                </div>
                <div className="flex justify-between">
                  <span>{language === 'ar' ? 'الابتكار' : 'Innovation'}:</span>
                  <span className="font-medium">{summary.averageScores.innovation.toFixed(1)}/10</span>
                </div>
                <div className="flex justify-between border-t pt-1">
                  <span className="font-medium">{language === 'ar' ? 'العام' : 'Overall'}:</span>
                  <span className="font-bold text-primary">{summary.averageScores.overall.toFixed(1)}/10</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                {language === 'ar' ? 'حسب النوع' : 'By Category'}
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>{language === 'ar' ? 'تقني' : 'Technology'}:</span>
                  <span className="font-medium">{summary.categoryScores.technology.toFixed(1)}/10</span>
                </div>
                <div className="flex justify-between">
                  <span>{language === 'ar' ? 'مالي' : 'Finance'}:</span>
                  <span className="font-medium">{summary.categoryScores.finance.toFixed(1)}/10</span>
                </div>
                <div className="flex justify-between">
                  <span>{language === 'ar' ? 'تجاري' : 'Commercial'}:</span>
                  <span className="font-medium">{summary.categoryScores.commercial.toFixed(1)}/10</span>
                </div>
                {summary.averageScores.enrichment && (
                  <div className="flex justify-between border-t pt-1">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      {language === 'ar' ? 'الإثراء' : 'Enrichment'}:
                    </span>
                    <span className="font-medium">{summary.averageScores.enrichment.toFixed(1)}/10</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {language === 'ar' ? 'مُرسل' : 'Submitted'}: {new Date(summary.submittedAt).toLocaleDateString()}
          </div>
          {summary.evaluatedAt && (
            <div>
              {language === 'ar' ? 'مُقيم' : 'Evaluated'}: {new Date(summary.evaluatedAt).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* Submitter Info (Management Only) */}
        {isManagementView && summary.submitterName && (
          <div className="text-xs text-muted-foreground">
            {language === 'ar' ? 'مُرسل بواسطة' : 'Submitted by'}: {summary.submitterName}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
