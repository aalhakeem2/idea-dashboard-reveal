import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, AlertCircle, User } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { useLanguage } from "@/contexts/LanguageContext";

interface EvaluatorProgress {
  evaluatorId: string;
  evaluatorName: string;
  evaluationType: 'technology' | 'finance' | 'commercial';
  status: 'assigned' | 'in_progress' | 'completed';
  score?: number;
  completedAt?: string;
}

interface EvaluationProgressMatrixProps {
  ideaId: string;
  ideaTitle: string;
  evaluators: EvaluatorProgress[];
  overallProgress: number;
  consensusLevel: 'high' | 'medium' | 'low';
}

export const EvaluationProgressMatrix: React.FC<EvaluationProgressMatrixProps> = ({
  ideaId,
  ideaTitle,
  evaluators,
  overallProgress,
  consensusLevel
}) => {
  const { t } = useTranslations("evaluation_dashboard");
  const { language } = useLanguage();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return language === 'ar' ? 'مكتمل' : 'Completed';
      case 'in_progress':
        return language === 'ar' ? 'قيد التنفيذ' : 'In Progress';
      default:
        return language === 'ar' ? 'معين' : 'Assigned';
    }
  };

  const getEvaluationTypeLabel = (type: string) => {
    switch (type) {
      case 'technology':
        return language === 'ar' ? 'تقني' : 'Technology';
      case 'finance':
        return language === 'ar' ? 'مالي' : 'Finance';
      case 'commercial':
        return language === 'ar' ? 'تجاري' : 'Commercial';
      default:
        return type;
    }
  };

  const getConsensusColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const completedEvaluations = evaluators.filter(e => e.status === 'completed').length;
  const totalEvaluations = evaluators.length;

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t("evaluation_matrix")}</span>
          <Badge variant="outline" className={getConsensusColor(consensusLevel)}>
            {t(`${consensusLevel}_consensus`)}
          </Badge>
        </CardTitle>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t("overall_progress")}</span>
            <span>{completedEvaluations}/{totalEvaluations}</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Evaluator Cards */}
          {evaluators.map((evaluator) => (
            <div
              key={`${evaluator.evaluatorId}-${evaluator.evaluationType}`}
              className="flex items-center justify-between p-4 border border-border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{evaluator.evaluatorName}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {getEvaluationTypeLabel(evaluator.evaluationType)}
                </Badge>
              </div>
              
              <div className="flex items-center gap-3">
                {evaluator.score && (
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">{evaluator.score}</div>
                    <div className="text-xs text-muted-foreground">/10</div>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  {getStatusIcon(evaluator.status)}
                  <span className="text-xs text-muted-foreground">
                    {getStatusLabel(evaluator.status)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{completedEvaluations}</div>
              <div className="text-xs text-muted-foreground">{t("completed_today")}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalEvaluations - completedEvaluations}</div>
              <div className="text-xs text-muted-foreground">{t("pending_evaluations")}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {evaluators.filter(e => e.score).length > 0 
                  ? Math.round(evaluators.reduce((sum, e) => sum + (e.score || 0), 0) / evaluators.filter(e => e.score).length)
                  : 0}
              </div>
              <div className="text-xs text-muted-foreground">{t("average_score")}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};