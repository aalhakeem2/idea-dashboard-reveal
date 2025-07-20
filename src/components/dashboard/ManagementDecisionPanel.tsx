import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react";
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

  const decisionOptions = [
    { value: "approved", label: t("approve"), icon: CheckCircle, color: "success" },
    { value: "rejected", label: t("reject"), icon: XCircle, color: "destructive" },
    { value: "needs_revision", label: t("request_revision"), icon: AlertCircle, color: "warning" },
    { value: "conditional_approval", label: t("conditional_approval"), icon: Clock, color: "secondary" }
  ];

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