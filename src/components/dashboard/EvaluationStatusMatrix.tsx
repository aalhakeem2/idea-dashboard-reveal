
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, AlertCircle, User, Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface EvaluatorStatus {
  evaluatorId: string;
  evaluatorName: string;
  evaluationType: 'technology' | 'finance' | 'commercial';
  status: 'assigned' | 'in_progress' | 'completed' | 'not_assigned';
  scores?: {
    feasibility: number;
    impact: number;
    innovation: number;
    overall: number;
    enrichment?: number;
  };
  comments?: string;
  recommendation?: string;
  completedAt?: string;
  submittedAt?: string;
}

interface EvaluationStatusMatrixProps {
  ideaId: string;
  ideaTitle: string;
  ideaReferenceCode: string;
  evaluators: EvaluatorStatus[];
  overallProgress: number;
  isManagementView?: boolean;
}

export const EvaluationStatusMatrix: React.FC<EvaluationStatusMatrixProps> = ({
  ideaId,
  ideaTitle,
  ideaReferenceCode,
  evaluators,
  overallProgress,
  isManagementView = false
}) => {
  const { language } = useLanguage();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'assigned':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'completed': { variant: 'default' as const, text: language === 'ar' ? 'مكتمل' : 'Completed' },
      'in_progress': { variant: 'secondary' as const, text: language === 'ar' ? 'قيد التنفيذ' : 'In Progress' },
      'assigned': { variant: 'outline' as const, text: language === 'ar' ? 'معين' : 'Assigned' },
      'not_assigned': { variant: 'destructive' as const, text: language === 'ar' ? 'غير معين' : 'Not Assigned' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap];
    return (
      <Badge variant={statusInfo.variant} className="text-xs">
        {statusInfo.text}
      </Badge>
    );
  };

  const getEvaluationTypeLabel = (type: string) => {
    const typeMap = {
      'technology': language === 'ar' ? 'تقني' : 'Technology',
      'finance': language === 'ar' ? 'مالي' : 'Finance',
      'commercial': language === 'ar' ? 'تجاري' : 'Commercial'
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  const completedEvaluations = evaluators.filter(e => e.status === 'completed').length;
  const totalEvaluations = evaluators.length;

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{ideaTitle}</CardTitle>
            <p className="text-sm text-muted-foreground">{ideaReferenceCode}</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">
              {language === 'ar' ? 'مكتمل' : 'Completed'}: {completedEvaluations}/{totalEvaluations}
            </div>
            <Progress value={overallProgress} className="h-2 w-32" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Evaluator Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {evaluators.map((evaluator, index) => (
            <Card key={`${evaluator.evaluatorId}-${evaluator.evaluationType}`} className="border-border/50">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(evaluator.status)}
                      <span className="font-medium text-sm">
                        {getEvaluationTypeLabel(evaluator.evaluationType)}
                      </span>
                    </div>
                    {getStatusBadge(evaluator.status)}
                  </div>

                  {/* Evaluator Name (Management Only) */}
                  {isManagementView && evaluator.evaluatorName && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{evaluator.evaluatorName}</span>
                    </div>
                  )}

                  {/* Scores */}
                  {evaluator.scores && evaluator.status === 'completed' && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span>{language === 'ar' ? 'الجدوى' : 'Feasibility'}:</span>
                          <span className="font-medium">{evaluator.scores.feasibility}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{language === 'ar' ? 'التأثير' : 'Impact'}:</span>
                          <span className="font-medium">{evaluator.scores.impact}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{language === 'ar' ? 'الابتكار' : 'Innovation'}:</span>
                          <span className="font-medium">{evaluator.scores.innovation}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{language === 'ar' ? 'العام' : 'Overall'}:</span>
                          <span className="font-medium">{evaluator.scores.overall}/10</span>
                        </div>
                      </div>
                      
                      {evaluator.scores.enrichment && (
                        <div className="flex items-center gap-1 text-xs pt-1 border-t">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span>{language === 'ar' ? 'الإثراء' : 'Enrichment'}:</span>
                          <span className="font-medium">{evaluator.scores.enrichment}/10</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Timestamps */}
                  {evaluator.completedAt && (
                    <div className="text-xs text-muted-foreground">
                      {language === 'ar' ? 'اكتمل في' : 'Completed'}: {new Date(evaluator.completedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Comments and Recommendations (Management Only) */}
        {isManagementView && evaluators.some(e => e.comments || e.recommendation) && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-medium text-sm">
              {language === 'ar' ? 'التعليقات والتوصيات' : 'Comments & Recommendations'}
            </h4>
            {evaluators.map((evaluator) => (
              (evaluator.comments || evaluator.recommendation) && (
                <div key={`comments-${evaluator.evaluatorId}-${evaluator.evaluationType}`} className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    {getEvaluationTypeLabel(evaluator.evaluationType)} - {evaluator.evaluatorName}
                  </div>
                  {evaluator.comments && (
                    <div className="text-sm p-2 bg-muted/50 rounded">
                      <strong>{language === 'ar' ? 'التعليق:' : 'Comment:'}</strong> {evaluator.comments}
                    </div>
                  )}
                  {evaluator.recommendation && (
                    <div className="text-sm p-2 bg-muted/50 rounded">
                      <strong>{language === 'ar' ? 'التوصية:' : 'Recommendation:'}</strong> {evaluator.recommendation}
                    </div>
                  )}
                </div>
              )
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
