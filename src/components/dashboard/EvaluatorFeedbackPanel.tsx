import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ChevronDown,
  ChevronUp,
  Users,
  Star,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  BarChart3,
  MessageSquare,
  Eye
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface EvaluatorFeedbackPanelProps {
  evaluationSummary: any;
  isExpanded: boolean;
  onToggle: () => void;
}

export const EvaluatorFeedbackPanel: React.FC<EvaluatorFeedbackPanelProps> = ({
  evaluationSummary,
  isExpanded,
  onToggle
}) => {
  const { language } = useLanguage();

  if (!evaluationSummary) return null;

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case "approve":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "approve_with_modifications":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case "needs_more_info":
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case "reject":
        return <ThumbsDown className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRecommendationLabel = (recommendation: string) => {
    const labels = {
      approve: { en: "Approve", ar: "موافقة" },
      approve_with_modifications: { en: "Approve with Modifications", ar: "موافقة مع تعديلات" },
      needs_more_info: { en: "Needs More Information", ar: "يحتاج معلومات إضافية" },
      reject: { en: "Reject", ar: "رفض" }
    };
    return labels[recommendation as keyof typeof labels]?.[language] || recommendation;
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "approve":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300";
      case "approve_with_modifications":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300";
      case "needs_more_info":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300";
      case "reject":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getEvaluationTypeIcon = (type: string) => {
    switch (type) {
      case "technology":
        return "🔧";
      case "finance":
        return "💰";
      case "commercial":
        return "📈";
      default:
        return "📊";
    }
  };

  // Calculate consensus analysis
  const recommendations = evaluationSummary.evaluations
    .filter((e: any) => e.recommendation)
    .map((e: any) => e.recommendation);
  
  const consensusData = recommendations.reduce((acc: any, rec: string) => {
    acc[rec] = (acc[rec] || 0) + 1;
    return acc;
  }, {});

  const totalRecommendations = recommendations.length;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <Card className="border-border">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full p-0 h-auto hover:bg-transparent"
          >
            <CardHeader className="w-full">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {language === 'ar' ? 'تفاصيل تقييم المقيمين' : 'Detailed Evaluator Feedback'}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {evaluationSummary.completed}/{evaluationSummary.total} {language === 'ar' ? 'مكتمل' : 'Completed'}
                  </Badge>
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>
            </CardHeader>
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Consensus Analysis */}
            {totalRecommendations > 0 && (
              <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
                <h4 className="font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  {language === 'ar' ? 'تحليل الإجماع' : 'Consensus Analysis'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(consensusData).map(([recommendation, count]) => (
                    <div key={recommendation} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getRecommendationIcon(recommendation)}
                        <span className="text-sm">{getRecommendationLabel(recommendation)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(count as number / totalRecommendations) * 100} 
                          className="w-16 h-2" 
                        />
                        <span className="text-sm font-medium">{count}/{totalRecommendations}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overall Scores Summary */}
            {evaluationSummary.avgScores && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div className="p-4 bg-primary/5 rounded-lg">
                  <div className="font-bold text-2xl text-primary">{evaluationSummary.avgScores.overall.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">{language === 'ar' ? 'النقاط العامة' : 'Overall'}</div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="font-bold text-xl">{evaluationSummary.avgScores.feasibility.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">{language === 'ar' ? 'الجدوى' : 'Feasibility'}</div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="font-bold text-xl">{evaluationSummary.avgScores.impact.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">{language === 'ar' ? 'التأثير' : 'Impact'}</div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="font-bold text-xl">{evaluationSummary.avgScores.innovation.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">{language === 'ar' ? 'الابتكار' : 'Innovation'}</div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="font-bold text-xl">{evaluationSummary.avgScores.enrichment.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">{language === 'ar' ? 'الإثراء' : 'Enrichment'}</div>
                </div>
              </div>
            )}

            {/* Individual Evaluator Cards - Stacked Layout */}
            <div className="space-y-6">
              <h4 className="font-semibold text-base">{language === 'ar' ? 'تقييمات فردية' : 'Individual Evaluations'}</h4>
              <div className="space-y-4">
                {evaluationSummary.evaluations.map((evaluation: any, index: number) => (
                  <EvaluatorCard 
                    key={index} 
                    evaluation={evaluation} 
                    index={index}
                    language={language}
                    getEvaluationTypeIcon={getEvaluationTypeIcon}
                    getRecommendationIcon={getRecommendationIcon}
                    getRecommendationLabel={getRecommendationLabel}
                    getRecommendationColor={getRecommendationColor}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

// Enhanced Evaluator Card Component with Progressive Disclosure
interface EvaluatorCardProps {
  evaluation: any;
  index: number;
  language: string;
  getEvaluationTypeIcon: (type: string) => string;
  getRecommendationIcon: (recommendation: string) => JSX.Element;
  getRecommendationLabel: (recommendation: string) => string;
  getRecommendationColor: (recommendation: string) => string;
}

const EvaluatorCard: React.FC<EvaluatorCardProps> = ({
  evaluation,
  index,
  language,
  getEvaluationTypeIcon,
  getRecommendationIcon,
  getRecommendationLabel,
  getRecommendationColor
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="border-border transition-all duration-200 hover:shadow-md">
      {/* Summary View - Always Visible */}
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <span className="text-xl">{getEvaluationTypeIcon(evaluation.type)}</span>
            </div>
            <div>
              <h5 className="font-semibold text-base capitalize">{evaluation.type} {language === 'ar' ? 'تقييم' : 'Evaluation'}</h5>
              <p className="text-sm text-muted-foreground">
                {evaluation.status === 'completed' ? 
                  (language === 'ar' ? 'مكتمل' : 'Completed') : 
                  (language === 'ar' ? 'في الانتظار' : 'Pending')
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {evaluation.status === 'completed' && (
              <>
                {/* Score Badge */}
                <Badge variant="secondary" className="text-sm font-bold">
                  {evaluation.score}/10
                </Badge>
                
                {/* Recommendation Badge */}
                {evaluation.recommendation && (
                  <div className="flex items-center gap-2">
                    {getRecommendationIcon(evaluation.recommendation)}
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getRecommendationColor(evaluation.recommendation)}`}
                    >
                      {getRecommendationLabel(evaluation.recommendation)}
                    </Badge>
                  </div>
                )}
              </>
            )}
            
            {/* Expand Button */}
            {evaluation.status === 'completed' && evaluation.feedback && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8 p-0"
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      {/* Detailed View - Expandable */}
      {evaluation.status === 'completed' && evaluation.feedback && (
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4 border-t border-border/50">
              {/* Detailed Feedback */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {language === 'ar' ? 'التعليقات التفصيلية' : 'Detailed Feedback'}
                  </span>
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm leading-relaxed text-foreground">
                    {evaluation.feedback}
                  </p>
                </div>
              </div>
              
              {/* Additional Metrics if Available */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center p-3 bg-background rounded-lg border">
                  <div className="font-bold text-lg">{evaluation.score}</div>
                  <div className="text-xs text-muted-foreground">{language === 'ar' ? 'النقاط الإجمالية' : 'Overall Score'}</div>
                </div>
                <div className="text-center p-3 bg-background rounded-lg border">
                  <div className="font-bold text-lg">{evaluation.recommendation ? '✓' : '—'}</div>
                  <div className="text-xs text-muted-foreground">{language === 'ar' ? 'التوصية' : 'Recommendation'}</div>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      )}
    </Card>
  );
};