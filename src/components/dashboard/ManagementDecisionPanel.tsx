
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

  const decisionOptions = [
    { value: "approved", label: t("approve"), icon: CheckCircle, color: "success" },
    { value: "rejected", label: t("reject"), icon: XCircle, color: "destructive" },
    { value: "needs_revision", label: t("request_revision"), icon: AlertCircle, color: "warning" },
    { value: "conditional_approval", label: t("conditional_approval"), icon: Clock, color: "secondary" }
  ];

  useEffect(() => {
    if (ideaId) {
      fetchEvaluationSummary();
    }
  }, [ideaId]);

  const fetchEvaluationSummary = async () => {
    try {
      const { data, error } = await supabase
        .from("evaluations")
        .select(`
          *,
          evaluator_assignments!inner(
            evaluator_id,
            evaluation_type,
            is_active,
            profiles!evaluator_assignments_evaluator_id_fkey(full_name)
          )
        `)
        .eq("idea_id", ideaId)
        .eq("evaluator_assignments.is_active", true);

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
          evaluator: e.evaluator_assignments.profiles?.full_name || 'Unknown',
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
      <CardContent className="space-y-6">
        {/* Evaluation Summary */}
        {evaluationSummary && (
          <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                {language === 'ar' ? 'ملخص التقييم' : 'Evaluation Summary'}
              </h4>
              <Badge variant="outline">
                {evaluationSummary.completed}/{evaluationSummary.total} {language === 'ar' ? 'مكتمل' : 'Completed'}
              </Badge>
            </div>
            
            {evaluationSummary.avgScores && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-lg">{evaluationSummary.avgScores.overall.toFixed(1)}</div>
                  <div className="text-muted-foreground">{language === 'ar' ? 'النقاط العامة' : 'Overall Score'}</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{evaluationSummary.avgScores.feasibility.toFixed(1)}</div>
                  <div className="text-muted-foreground">{language === 'ar' ? 'الجدوى' : 'Feasibility'}</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{evaluationSummary.avgScores.impact.toFixed(1)}</div>
                  <div className="text-muted-foreground">{language === 'ar' ? 'التأثير' : 'Impact'}</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{evaluationSummary.avgScores.innovation.toFixed(1)}</div>
                  <div className="text-muted-foreground">{language === 'ar' ? 'الابتكار' : 'Innovation'}</div>
                </div>
              </div>
            )}

            {/* Evaluator Status */}
            <div className="space-y-2">
              <h5 className="font-medium text-sm">{language === 'ar' ? 'حالة المقيمين' : 'Evaluator Status'}</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {evaluationSummary.evaluations.map((eval: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-background rounded text-xs">
                    <span className="font-medium">{eval.type}</span>
                    <Badge variant={eval.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                      {eval.status === 'completed' ? 
                        `${eval.score}/10` : 
                        (language === 'ar' ? 'في الانتظار' : 'Pending')
                      }
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Decision Type Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium">{t("decision_panel")}</label>
          <div className="grid grid-cols-2 gap-3">
            {decisionOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.value}
                  variant={selectedDecision === option.value ? "default" : "outline"}
                  onClick={() => setSelectedDecision(option.value)}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs text-center">{option.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Priority and Department */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">الأولوية</label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الأولوية" />
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

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("department_assignment")}</label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="اختر القسم" />
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

        {/* Decision Reason - Bilingual */}
        <div className="space-y-4">
          <label className="text-sm font-medium">{t("decision_reason")}</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">English</label>
              <Textarea
                value={reasonEn}
                onChange={(e) => setReasonEn(e.target.value)}
                placeholder="Decision reason in English"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">العربية</label>
              <Textarea
                value={reasonAr}
                onChange={(e) => setReasonAr(e.target.value)}
                placeholder="سبب القرار بالعربية"
                rows={3}
                dir="rtl"
              />
            </div>
          </div>
        </div>

        {/* Feedback - Bilingual */}
        <div className="space-y-4">
          <label className="text-sm font-medium">{t("feedback")}</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">English</label>
              <Textarea
                value={feedbackEn}
                onChange={(e) => setFeedbackEn(e.target.value)}
                placeholder="Additional feedback in English"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">العربية</label>
              <Textarea
                value={feedbackAr}
                onChange={(e) => setFeedbackAr(e.target.value)}
                placeholder="ملاحظات إضافية بالعربية"
                rows={3}
                dir="rtl"
              />
            </div>
          </div>
        </div>

        {/* Conditions (for conditional approval) */}
        {selectedDecision === "conditional_approval" && (
          <div className="space-y-4">
            <label className="text-sm font-medium">{t("conditions")}</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">English</label>
                <Textarea
                  value={conditionsEn}
                  onChange={(e) => setConditionsEn(e.target.value)}
                  placeholder="Conditions for approval in English"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">العربية</label>
                <Textarea
                  value={conditionsAr}
                  onChange={(e) => setConditionsAr(e.target.value)}
                  placeholder="شروط الموافقة بالعربية"
                  rows={3}
                  dir="rtl"
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button 
          onClick={handleSubmitDecision} 
          disabled={isLoading || !selectedDecision}
          className="w-full"
        >
          {isLoading ? "جاري الحفظ..." : t("save_decision")}
        </Button>
      </CardContent>
    </Card>
  );
};
