
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle, Clock, Users, BarChart3 } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { useListOfValues } from "@/hooks/useListOfValues";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { IdeaDetailsPanel } from "./IdeaDetailsPanel";
import { EvaluatorFeedbackPanel } from "./EvaluatorFeedbackPanel";

interface ManagementDecisionPanelProps {
  ideaId: string;
  ideaTitle: string;
  currentStatus: string;
  onDecisionMade: () => void;
}

export const ManagementDecisionPanel: React.FC<ManagementDecisionPanelProps> = ({
  ideaId,
  ideaTitle,
  currentStatus,
  onDecisionMade
}) => {
  const { t } = useTranslations("management_decisions");
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const { values: priorities } = useListOfValues("priority");
  const { values: departments } = useListOfValues("department_assignment");
  
  const [selectedDecision, setSelectedDecision] = useState<string>("");
  const [priority, setPriority] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [reasonEn, setReasonEn] = useState<string>("");
  const [reasonAr, setReasonAr] = useState<string>("");
  const [feedbackEn, setFeedbackEn] = useState<string>("");
  const [feedbackAr, setFeedbackAr] = useState<string>("");
  const [conditionsEn, setConditionsEn] = useState<string>("");
  const [conditionsAr, setConditionsAr] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [evaluationSummary, setEvaluationSummary] = useState<any>(null);
  const [ideaDetails, setIdeaDetails] = useState<any>(null);
  const [submitterProfile, setSubmitterProfile] = useState<any>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [isIdeaDetailsExpanded, setIsIdeaDetailsExpanded] = useState(false);
  const [isEvaluatorFeedbackExpanded, setIsEvaluatorFeedbackExpanded] = useState(true);

  const decisionOptions = [
    { value: "approved", label: t("approve"), icon: CheckCircle, color: "success" },
    { value: "rejected", label: t("reject"), icon: XCircle, color: "destructive" },
    { value: "needs_revision", label: t("request_revision"), icon: AlertCircle, color: "warning" },
    { value: "conditional_approval", label: t("conditional_approval"), icon: Clock, color: "secondary" }
  ];

  useEffect(() => {
    if (ideaId) {
      fetchEvaluationSummary();
      fetchIdeaDetails();
      fetchCurrentUserProfile();
    }
  }, [ideaId]);

  const fetchEvaluationSummary = async () => {
    try {
      const { data, error } = await supabase
        .from("evaluations")
        .select(`
          *,
          evaluator_assignments!evaluations_idea_id_evaluator_id_evaluation_type_fkey(
            evaluator_id,
            evaluation_type,
            is_active
          )
        `)
        .eq("idea_id", ideaId);

      if (error) throw error;

      // Process evaluation data
      const evaluations = data || [];
      const completed = evaluations.filter(e => e.overall_score !== null);
      const total = evaluations.length;

      const avgScores = completed.length > 0 ? {
        feasibility: completed.reduce((sum, e) => sum + (e.feasibility_score || 0), 0) / completed.length,
        impact: completed.reduce((sum, e) => sum + (e.impact_score || 0), 0) / completed.length,
        innovation: completed.reduce((sum, e) => sum + (e.innovation_score || 0), 0) / completed.length,
        overall: completed.reduce((sum, e) => sum + (e.overall_score || 0), 0) / completed.length,
        enrichment: completed.reduce((sum, e) => sum + (e.enrichment_score || 0), 0) / completed.length
      } : null;

      setEvaluationSummary({
        total,
        completed: completed.length,
        progress: Math.round((completed.length / total) * 100),
        avgScores,
        evaluations: evaluations.map(e => ({
          type: e.evaluation_type,
          evaluator: 'Evaluator',
          status: e.overall_score ? 'completed' : 'pending',
          score: e.overall_score,
          feedback: e.feedback,
          recommendation: e.recommendation
        }))
      });
    } catch (error) {
      console.error("Error fetching evaluation summary:", error);
    }
  };

  const fetchIdeaDetails = async () => {
    try {
      const { data: idea, error } = await supabase
        .from("ideas")
        .select("*")
        .eq("id", ideaId)
        .single();

      if (error) throw error;

      setIdeaDetails(idea);

      // Fetch submitter profile
      if (idea.submitter_id) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", idea.submitter_id)
          .single();

        if (!profileError) {
          setSubmitterProfile(profile);
        }
      }
    } catch (error) {
      console.error("Error fetching idea details:", error);
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

      if (!error) {
        setCurrentUserProfile(profile);
      }
    } catch (error) {
      console.error("Error fetching current user profile:", error);
    }
  };

  const handleSubmitDecision = async () => {
    if (!selectedDecision) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار نوع القرار",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Insert management decision using direct SQL due to type limitations
      const { error: decisionError } = await supabase.rpc('log_idea_action', {
        p_idea_id: ideaId,
        p_action_type: 'management_decision',
        p_action_detail: JSON.stringify({
          decision_type: selectedDecision,
          priority,
          department_assignment: department,
          decision_reason_en: reasonEn,
          decision_reason_ar: reasonAr,
          feedback_en: feedbackEn,
          feedback_ar: feedbackAr,
          conditions_en: conditionsEn,
          conditions_ar: conditionsAr
        })
      });

      if (decisionError) throw decisionError;

      // Update idea status based on decision - only use existing status values
      const newStatus = selectedDecision === "approved" ? "approved" : 
                       selectedDecision === "rejected" ? "rejected" :
                       "under_review"; // Use under_review for needs_revision and conditional_approval

      const { error: ideaError } = await supabase
        .from("ideas")
        .update({ status: newStatus })
        .eq("id", ideaId);

      if (ideaError) throw ideaError;

      toast({
        title: "تم حفظ القرار",
        description: "تم إرسال القرار وإشعار مقدم الفكرة",
        variant: "default"
      });

      onDecisionMade();
    } catch (error) {
      console.error("Error saving decision:", error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ القرار",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (currentStatus === "approved" || currentStatus === "rejected") {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant={currentStatus === "approved" ? "default" : "destructive"}>
            {currentStatus === "approved" ? "موافق عليه" : "مرفوض"}
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-lg">{t("title")}</CardTitle>
        <p className="text-sm text-muted-foreground">{ideaTitle}</p>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Enhanced Quick Evaluation Summary */}
        {evaluationSummary && (
          <div className="space-y-6 p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">
                    {language === 'ar' ? 'ملخص التقييم' : 'Evaluation Summary'}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'نظرة عامة سريعة على التقييمات' : 'Quick overview of all evaluations'}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {evaluationSummary.completed}/{evaluationSummary.total} {language === 'ar' ? 'مكتمل' : 'Completed'}
              </Badge>
            </div>
            
            {evaluationSummary.avgScores && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-background/80 backdrop-blur-sm rounded-lg border border-border/50">
                  <div className="font-bold text-2xl text-primary">{evaluationSummary.avgScores.overall.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground mt-1">{language === 'ar' ? 'النقاط العامة' : 'Overall Score'}</div>
                </div>
                <div className="text-center p-4 bg-background/80 backdrop-blur-sm rounded-lg border border-border/50">
                  <div className="font-bold text-xl">{evaluationSummary.avgScores.feasibility.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground mt-1">{language === 'ar' ? 'الجدوى' : 'Feasibility'}</div>
                </div>
                <div className="text-center p-4 bg-background/80 backdrop-blur-sm rounded-lg border border-border/50">
                  <div className="font-bold text-xl">{evaluationSummary.avgScores.impact.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground mt-1">{language === 'ar' ? 'التأثير' : 'Impact'}</div>
                </div>
                <div className="text-center p-4 bg-background/80 backdrop-blur-sm rounded-lg border border-border/50">
                  <div className="font-bold text-xl">{evaluationSummary.avgScores.innovation.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground mt-1">{language === 'ar' ? 'الابتكار' : 'Innovation'}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Information Drill-Down Panels */}
        <div className="space-y-6">
          {/* Detailed Evaluator Feedback */}
          {evaluationSummary && (
            <EvaluatorFeedbackPanel
              evaluationSummary={evaluationSummary}
              isExpanded={isEvaluatorFeedbackExpanded}
              onToggle={() => setIsEvaluatorFeedbackExpanded(!isEvaluatorFeedbackExpanded)}
            />
          )}

          {/* Complete Idea Details */}
          {ideaDetails && (
            <IdeaDetailsPanel
              idea={ideaDetails}
              submitterProfile={submitterProfile}
              currentUserProfile={currentUserProfile}
              isExpanded={isIdeaDetailsExpanded}
              onToggle={() => setIsIdeaDetailsExpanded(!isIdeaDetailsExpanded)}
            />
          )}
        </div>

        {/* Decision Actions Section */}
        <div className="space-y-6 p-6 bg-muted/20 rounded-xl border">
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              {t("decision_panel")}
            </h4>
            <p className="text-sm text-muted-foreground">
              {language === 'ar' ? 'اختر نوع القرار المناسب بناءً على التقييمات أعلاه' : 'Select the appropriate decision type based on the evaluations above'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {decisionOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedDecision === option.value;
              return (
                <Button
                  key={option.value}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => setSelectedDecision(option.value)}
                  className={`h-auto p-6 flex flex-col items-center gap-3 transition-all duration-200 ${
                    isSelected ? 'ring-2 ring-primary/20 shadow-md' : 'hover:shadow-sm'
                  }`}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-sm font-medium text-center">{option.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Priority and Department Assignment */}
        <div className="space-y-6">
          <h4 className="font-semibold text-base">
            {language === 'ar' ? 'تفاصيل القرار' : 'Decision Details'}
          </h4>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-medium">
                {language === 'ar' ? 'الأولوية' : 'Priority'}
              </label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder={language === 'ar' ? 'اختر الأولوية' : 'Select Priority'} />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">{t("department_assignment")}</label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder={language === 'ar' ? 'اختر القسم' : 'Select Department'} />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Decision Reasoning Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-base">{t("decision_reason")}</h4>
            <p className="text-sm text-muted-foreground">
              {language === 'ar' ? 'قدم تفسيراً واضحاً لقرارك' : 'Provide a clear explanation for your decision'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-muted-foreground">English</label>
              <Textarea
                value={reasonEn}
                onChange={(e) => setReasonEn(e.target.value)}
                placeholder="Decision reason in English"
                rows={4}
                className="resize-none"
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium text-muted-foreground">العربية</label>
              <Textarea
                value={reasonAr}
                onChange={(e) => setReasonAr(e.target.value)}
                placeholder="سبب القرار بالعربية"
                rows={4}
                dir="rtl"
                className="resize-none"
              />
            </div>
          </div>
        </div>

        {/* Additional Feedback Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-base">{t("feedback")}</h4>
            <p className="text-sm text-muted-foreground">
              {language === 'ar' ? 'ملاحظات إضافية للمقدم' : 'Additional feedback for the submitter'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-muted-foreground">English</label>
              <Textarea
                value={feedbackEn}
                onChange={(e) => setFeedbackEn(e.target.value)}
                placeholder="Additional feedback in English"
                rows={4}
                className="resize-none"
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium text-muted-foreground">العربية</label>
              <Textarea
                value={feedbackAr}
                onChange={(e) => setFeedbackAr(e.target.value)}
                placeholder="ملاحظات إضافية بالعربية"
                rows={4}
                dir="rtl"
                className="resize-none"
              />
            </div>
          </div>
        </div>

        {/* Conditional Approval Conditions */}
        {selectedDecision === "conditional_approval" && (
          <div className="space-y-6 p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <h4 className="font-semibold text-base text-yellow-800 dark:text-yellow-200">{t("conditions")}</h4>
              </div>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                {language === 'ar' ? 'حدد الشروط المطلوبة للموافقة المشروطة' : 'Specify the required conditions for conditional approval'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground">English</label>
                <Textarea
                  value={conditionsEn}
                  onChange={(e) => setConditionsEn(e.target.value)}
                  placeholder="Conditions for approval in English"
                  rows={4}
                  className="resize-none bg-background"
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground">العربية</label>
                <Textarea
                  value={conditionsAr}
                  onChange={(e) => setConditionsAr(e.target.value)}
                  placeholder="شروط الموافقة بالعربية"
                  rows={4}
                  dir="rtl"
                  className="resize-none bg-background"
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit Decision Button */}
        <div className="pt-4 border-t border-border">
          <Button 
            onClick={handleSubmitDecision} 
            disabled={isLoading || !selectedDecision}
            size="lg"
            className="w-full h-14 text-base font-semibold"
          >
            {isLoading ? 
              (language === 'ar' ? "جاري الحفظ..." : "Saving...") : 
              t("save_decision")
            }
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
