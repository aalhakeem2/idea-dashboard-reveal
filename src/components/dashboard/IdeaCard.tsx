
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, DollarSign, Star, FileText, TrendingUp, Clock, Activity } from "lucide-react";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

type Idea = Tables<"ideas">;

interface IdeaCardProps {
  idea: Idea;
  detailed?: boolean;
  showTimeline?: boolean;
  onViewActivity?: (idea: Idea) => void;
}

export const IdeaCard = ({ idea, detailed = false, showTimeline = false, onViewActivity }: IdeaCardProps) => {
  const { language } = useLanguage();
  const { t } = useTranslations("idea_status_extended");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-muted text-muted-foreground border-border";
      case "submitted":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300";
      case "under_review":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300";
      case "screened":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300";
      case "under_evaluation":
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-300";
      case "evaluated":
        return "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900 dark:text-indigo-300";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300";
      case "deferred":
        return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-300";
      case "implemented":
        return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-300";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  // Helper function to determine enhanced status label
  const getEnhancedStatusLabel = async (idea: Idea) => {
    // Check if idea has management decision
    if (idea.status === 'approved' || idea.status === 'rejected') {
      return getStatusLabel(idea.status);
    }

    // Check if idea is evaluated but awaiting management decision
    if (idea.status === 'under_review' && 
        idea.average_evaluation_score && idea.average_evaluation_score > 0) {
      
      const { data } = await supabase
        .from('idea_action_log')
        .select('id')
        .eq('idea_id', idea.id)
        .eq('action_type', 'management_decision')
        .limit(1);

      if (!data || data.length === 0) {
        return language === 'ar' ? '🧩 مُقيمة - في انتظار قرار الإدارة' : '🧩 Evaluated - Awaiting Management Decision';
      }
    }

    return getStatusLabel(idea.status);
  };

  const getStatusLabel = (status: string) => {
    const statusLabels = {
      draft: { en: "📝 Draft", ar: "📝 مسودة" },
      submitted: { en: "📬 Submitted", ar: "📬 مُرسل" },
      under_review: { en: "🔍 Under Review", ar: "🔍 قيد المراجعة" },
      screened: { en: "✅ Screened", ar: "✅ تم الفحص" },
      under_evaluation: { en: "📊 Under Evaluation", ar: "📊 قيد التقييم" },
      evaluated: { en: "🧩 Evaluated", ar: `🧩 ${t('evaluated')}` },
      approved: { en: "🟢 Approved", ar: "🟢 موافق عليه" },
      rejected: { en: "🔴 Rejected", ar: "🔴 مرفوض" },
      deferred: { en: "🟡 Deferred", ar: "🟡 مؤجل" },
      implemented: { en: "🏁 Implemented", ar: "🏁 تم التنفيذ" },
      needs_revision: { en: `🔄 ${t('needs_revision')}`, ar: `🔄 ${t('needs_revision')}` },
      conditional_approval: { en: `⚠️ ${t('conditional_approval')}`, ar: `⚠️ ${t('conditional_approval')}` },
    };
    return statusLabels[status as keyof typeof statusLabels]?.[language] || status;
  };

  // State for enhanced status
  const [enhancedStatus, setEnhancedStatus] = useState<string>('');

  useEffect(() => {
    const updateStatus = async () => {
      const status = await getEnhancedStatusLabel(idea);
      setEnhancedStatus(status);
    };
    updateStatus();
  }, [idea, language]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "innovation":
        return "bg-purple-100 text-purple-800";
      case "process_improvement":
        return "bg-blue-100 text-blue-800";
      case "cost_reduction":
        return "bg-green-100 text-green-800";
      case "customer_experience":
        return "bg-orange-100 text-orange-800";
      case "technology":
        return "bg-indigo-100 text-indigo-800";
      case "sustainability":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className={`${detailed ? "h-full" : ""} hover:shadow-md transition-shadow`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg font-semibold line-clamp-2">
                {idea.title}
              </CardTitle>
              {idea.idea_reference_code && (
                <Badge variant="outline" className="text-xs font-mono">
                  {idea.idea_reference_code}
                </Badge>
              )}
            </div>
            {showTimeline && !idea.is_draft && (
              <div className="mb-2 flex items-center gap-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {language === 'ar' ? 'سجل الحالة متاح' : 'Status tracking available'}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 items-end">
            <Badge className={getStatusColor(idea.status)} variant="outline">
              {enhancedStatus || getStatusLabel(idea.status)}
            </Badge>
            {idea.average_evaluation_score && idea.average_evaluation_score > 0 && (
              <div className="flex items-center gap-1 text-sm font-medium">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span>{idea.average_evaluation_score.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <Badge variant="outline" className={getCategoryColor(idea.category)}>
            {idea.category.replace("_", " ")}
          </Badge>
          {idea.priority_score && idea.priority_score > 0 && (
            <Badge variant="outline">
              Priority: {idea.priority_score}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className={`${detailed ? "line-clamp-4" : "line-clamp-2"} mb-4`}>
          {idea.description}
        </CardDescription>
        
        {detailed && (
          <div className="space-y-2 text-sm text-gray-600">
            {idea.implementation_cost && (
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Cost: ${idea.implementation_cost.toLocaleString()}
              </div>
            )}
            {idea.expected_roi && (
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Expected ROI: {idea.expected_roi}%
              </div>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {format(new Date(idea.created_at!), "MMM d, yyyy")}
            </div>
            {idea.submitted_at && (
              <div className="flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                {language === 'ar' ? 'أُرسلت' : 'Submitted'} {format(new Date(idea.submitted_at), "MMM d")}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {idea.strategic_alignment_score && (
              <div>
                {language === 'ar' ? 'التوافق:' : 'Alignment:'} {idea.strategic_alignment_score}/10
              </div>
            )}
            {onViewActivity && !idea.is_draft && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewActivity(idea);
                }}
              >
                <Activity className="h-3 w-3 mr-1" />
                {language === 'ar' ? 'النشاط' : 'Activity'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
