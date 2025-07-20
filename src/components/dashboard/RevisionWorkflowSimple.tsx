import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, FileEdit } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { BilingualTextArea } from "./BilingualTextArea";
import { LocalizedDropdown } from "./LocalizedDropdown";
import { useToast } from "@/hooks/use-toast";

interface RevisionWorkflowSimpleProps {
  ideaId: string;
  ideaTitle: string;
  isSubmitter: boolean;
  onRevisionUpdated: () => void;
}

export const RevisionWorkflowSimple: React.FC<RevisionWorkflowSimpleProps> = ({
  ideaId,
  ideaTitle,
  isSubmitter,
  onRevisionUpdated
}) => {
  const { t } = useTranslations("revision_workflow");
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [feedbackEn, setFeedbackEn] = useState("");
  const [feedbackAr, setFeedbackAr] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestRevision = async () => {
    if (selectedAreas.length === 0) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'يرجى اختيار مجال التحسين' : 'Please select improvement area',
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Log revision request as an idea action
      await supabase.rpc('log_idea_action', {
        p_idea_id: ideaId,
        p_action_type: 'revision_requested',
        p_action_detail: JSON.stringify({
          revision_areas: selectedAreas,
          feedback_en: feedbackEn,
          feedback_ar: feedbackAr
        })
      });

      // Update idea status to needs_revision (using under_review for compatibility)
      await supabase
        .from("ideas")
        .update({ status: "under_review" })
        .eq("id", ideaId);

      toast({
        title: language === 'ar' ? 'تم طلب المراجعة' : 'Revision Requested',
        description: language === 'ar' ? 'تم إرسال طلب المراجعة للمقدم' : 'Revision request sent to submitter',
        variant: "default"
      });

      setSelectedAreas([]);
      setFeedbackEn("");
      setFeedbackAr("");
      onRevisionUpdated();
    } catch (error) {
      console.error("Error requesting revision:", error);
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في إرسال طلب المراجعة' : 'Failed to send revision request',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileEdit className="h-5 w-5" />
          {t("title")}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{ideaTitle}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Revision Request (Management only) */}
        {!isSubmitter ? (
          <div className="space-y-4 p-4 border border-dashed border-border rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <h4 className="font-medium">{t("revision_requested")}</h4>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("revision_areas")}</label>
              <LocalizedDropdown
                listKey="revision_areas"
                value={selectedAreas[0] || ""}
                onValueChange={(value) => setSelectedAreas([value])}
                placeholder={language === 'ar' ? 'اختر مجال التحسين' : 'Select improvement area'}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("feedback")}</label>
              <BilingualTextArea
                valueEn={feedbackEn}
                valueAr={feedbackAr}
                onChangeEn={setFeedbackEn}
                onChangeAr={setFeedbackAr}
                placeholderEn="Detailed feedback for revision in English"
                placeholderAr="ملاحظات مفصلة للمراجعة بالعربية"
                rows={4}
              />
            </div>

            <Button 
              onClick={handleRequestRevision}
              disabled={isSubmitting || selectedAreas.length === 0}
              className="w-full"
            >
              {isSubmitting ? 
                (language === 'ar' ? 'جاري الإرسال...' : 'Submitting...') : 
                t("revision_requested")
              }
            </Button>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>{language === 'ar' ? 'ستتلقى إشعار في حالة طلب مراجعة' : 'You will be notified if revision is requested'}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};