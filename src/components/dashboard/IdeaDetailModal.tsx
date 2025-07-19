import { useState, useEffect } from "react";
import { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calendar,
  DollarSign,
  Star,
  TrendingUp,
  ClipboardCheck,
  X,
  FileText,
  User,
  Building,
  Target
} from "lucide-react";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { IdeaFileViewer } from "./IdeaFileViewer";

type Idea = Tables<"ideas">;
type Profile = Tables<"profiles">;

interface IdeaDetailModalProps {
  idea: Idea | null;
  isOpen: boolean;
  onClose: () => void;
  onEvaluate?: (idea: Idea) => void;
  showEvaluateButton?: boolean;
}

export const IdeaDetailModal = ({
  idea,
  isOpen,
  onClose,
  onEvaluate,
  showEvaluateButton = false
}: IdeaDetailModalProps) => {
  const [submitterProfile, setSubmitterProfile] = useState<Profile | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const { t, language, isRTL } = useLanguage();

  useEffect(() => {
    if (idea && isOpen) {
      fetchSubmitterProfile();
      fetchCurrentUserProfile();
    }
  }, [idea, isOpen]);

  const fetchSubmitterProfile = async () => {
    if (!idea) return;
    
    try {
      setLoading(true);
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", idea.submitter_id)
        .single();

      if (error) {
        console.error("Error fetching submitter profile:", error);
        return;
      }

      setSubmitterProfile(profile);
    } catch (error) {
      console.error("Error fetching submitter profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching current user profile:", error);
        return;
      }

      setCurrentUserProfile(profile);
    } catch (error) {
      console.error("Error fetching current user profile:", error);
    }
  };

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

  const getStatusLabel = (status: string) => {
    const statusLabels = {
      draft: { en: "📝 Draft", ar: "📝 مسودة" },
      submitted: { en: "📬 Submitted", ar: "📬 مُرسل" },
      under_review: { en: "🔍 Under Review", ar: "🔍 قيد المراجعة" },
      screened: { en: "✅ Screened", ar: "✅ تم الفحص" },
      under_evaluation: { en: "📊 Under Evaluation", ar: "📊 قيد التقييم" },
      evaluated: { en: "🧩 Evaluated", ar: "🧩 تم التقييم" },
      approved: { en: "🟢 Approved", ar: "🟢 موافق عليه" },
      rejected: { en: "🔴 Rejected", ar: "🔴 مرفوض" },
      deferred: { en: "🟡 Deferred", ar: "🟡 مؤجل" },
      implemented: { en: "🏁 Implemented", ar: "🏁 تم التنفيذ" },
    };
    return statusLabels[status as keyof typeof statusLabels]?.[language] || status;
  };

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

  if (!idea) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="p-6 pb-0">
          <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <DialogTitle className={`text-xl font-bold ${isRTL ? 'text-right' : 'text-left'}`}>
                  {idea.title}
                </DialogTitle>
                {idea.idea_reference_code && (
                  <Badge variant="outline" className="text-xs font-mono">
                    {idea.idea_reference_code}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={getStatusColor(idea.status)} variant="outline">
                  {getStatusLabel(idea.status)}
                </Badge>
                <Badge variant="outline" className={getCategoryColor(idea.category)}>
                  {idea.category.replace("_", " ")}
                </Badge>
                {idea.average_evaluation_score && idea.average_evaluation_score > 0 && (
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span>{idea.average_evaluation_score.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[calc(90vh-200px)]">
          <div className="p-6 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{t('idea_form', 'description')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-muted-foreground leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
                  {idea.description}
                </p>
              </CardContent>
            </Card>

            {/* Idea Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Submitter Information - Hidden for evaluators */}
              {currentUserProfile?.role !== 'evaluator' && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {t('dashboard', 'submitter_info')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {loading ? (
                      <div className="text-muted-foreground">Loading...</div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{t('dashboard', 'name')}:</span>
                          <span>{submitterProfile?.full_name || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{t('dashboard', 'email')}:</span>
                          <span>{submitterProfile?.email || 'N/A'}</span>
                        </div>
                        {submitterProfile?.department && (
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            <span>{submitterProfile.department}</span>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Financial Information */}
              {(idea.implementation_cost || idea.expected_roi) && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      {t('dashboard', 'financial_info')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {idea.implementation_cost && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{t('idea_form', 'implementation_cost')}:</span>
                        <span>${idea.implementation_cost.toLocaleString()}</span>
                      </div>
                    )}
                    {idea.expected_roi && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{t('idea_form', 'expected_roi')}:</span>
                        <span>{idea.expected_roi}%</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Alignment & Priority */}
              {(idea.strategic_alignment_score || idea.priority_score || idea.strategic_alignment_selections) && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      {t('dashboard', 'alignment_priority')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {idea.strategic_alignment_score && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{t('dashboard', 'alignment_score')}:</span>
                        <span>{idea.strategic_alignment_score}/10</span>
                      </div>
                    )}
                    {idea.priority_score && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{t('dashboard', 'priority_score')}:</span>
                        <span>{idea.priority_score}</span>
                      </div>
                    )}
                    {idea.strategic_alignment_selections && idea.strategic_alignment_selections.length > 0 && (
                      <div>
                        <span className="font-medium">{t('dashboard', 'strategic_alignments')}:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {idea.strategic_alignment_selections.map((selection, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {selection}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Timeline Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {t('dashboard', 'timeline')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{t('dashboard', 'created')}:</span>
                    <span>{format(new Date(idea.created_at!), "MMM d, yyyy 'at' h:mm a")}</span>
                  </div>
                  {idea.submitted_at && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      <span className="font-medium">{t('dashboard', 'submitted')}:</span>
                      <span>{format(new Date(idea.submitted_at), "MMM d, yyyy 'at' h:mm a")}</span>
                    </div>
                  )}
                  {idea.evaluated_at && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{t('dashboard', 'evaluated')}:</span>
                      <span>{format(new Date(idea.evaluated_at), "MMM d, yyyy 'at' h:mm a")}</span>
                    </div>
                  )}
                  {idea.implemented_at && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{t('dashboard', 'implemented')}:</span>
                      <span>{format(new Date(idea.implemented_at), "MMM d, yyyy 'at' h:mm a")}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* File Attachments */}
            <IdeaFileViewer 
              ideaId={idea.id} 
              readOnly={true} 
              title={`${t('idea_form', 'file_attachments')} - ${idea.title}`}
            />
          </div>
        </ScrollArea>

        {/* Footer with Evaluation Button */}
        {showEvaluateButton && onEvaluate && (
          <div className="p-6 pt-0 border-t bg-background">
            <Button 
              onClick={() => onEvaluate(idea)} 
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base gap-3 shadow-sm"
              size="lg"
            >
              <ClipboardCheck className="h-5 w-5" />
              {t('dashboard', 'evaluate')} This Idea
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
