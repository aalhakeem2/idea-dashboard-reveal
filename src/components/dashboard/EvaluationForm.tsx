
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { ClipboardCheck, Star, X } from "lucide-react";
import { Slider } from "@/components/ui/slider";

type Idea = Tables<"ideas">;
type Profile = Tables<"profiles">;

interface EvaluationFormProps {
  idea: Idea;
  profile: Profile;
  onEvaluationSubmitted: () => void;
  onCancel: () => void;
}

export const EvaluationForm = ({ idea, profile, onEvaluationSubmitted, onCancel }: EvaluationFormProps) => {
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState({
    feasibility_score: [5],
    impact_score: [5],
    innovation_score: [5], 
    overall_score: [5],
  });
  const [feedback, setFeedback] = useState("");
  const [recommendation, setRecommendation] = useState("");
  
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("evaluations").insert({
        idea_id: idea.id,
        evaluator_id: profile.id,
        feasibility_score: scores.feasibility_score[0],
        impact_score: scores.impact_score[0],
        innovation_score: scores.innovation_score[0],
        overall_score: scores.overall_score[0],
        feedback,
        recommendation,
      });

      if (error) throw error;

      toast({
        title: t('evaluation', 'evaluation_submitted'),
        description: t('evaluation', 'evaluation_submitted_success'),
      });

      onEvaluationSubmitted();
    } catch (error) {
      console.error("Error submitting evaluation:", error);
      toast({
        title: t('evaluation', 'error'),
        description: t('evaluation', 'failed_to_submit'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateScore = (scoreType: keyof typeof scores, value: number[]) => {
    setScores(prev => ({ ...prev, [scoreType]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
              <ClipboardCheck className="h-6 w-6 text-blue-600" />
              <CardTitle className={isRTL ? 'text-right' : 'text-left'}>
                {t('evaluation', 'evaluate_idea')}
              </CardTitle>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onCancel}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              {t('evaluation', 'cancel')}
            </Button>
          </div>
          <CardDescription className={isRTL ? 'text-right' : 'text-left'}>
            {t('evaluation', 'provide_evaluation_for')} {idea.idea_reference_code || idea.title}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Anonymized Idea Info */}
            <div className={`bg-muted p-4 rounded-lg ${isRTL ? 'text-right' : 'text-left'}`}>
              <h3 className={`font-semibold mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('evaluation', 'idea_details')}
              </h3>
              <div className="space-y-2">
                <p><strong>{t('evaluation', 'reference')}:</strong> {idea.idea_reference_code}</p>
                <p><strong>{t('evaluation', 'title')}:</strong> {idea.title}</p>
                <p><strong>{t('evaluation', 'description')}:</strong> {idea.description}</p>
                <p><strong>{t('evaluation', 'category')}:</strong> {idea.category}</p>
              </div>
            </div>

            {/* Evaluation Scores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className={`text-sm font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('evaluation', 'feasibility_score')}: {scores.feasibility_score[0]}/10
                </Label>
                <Slider
                  value={scores.feasibility_score}
                  onValueChange={(value) => updateScore('feasibility_score', value)}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className={`flex justify-between text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span>{t('evaluation', 'not_feasible')}</span>
                  <span>{t('evaluation', 'highly_feasible')}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label className={`text-sm font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('evaluation', 'impact_score')}: {scores.impact_score[0]}/10
                </Label>
                <Slider
                  value={scores.impact_score}
                  onValueChange={(value) => updateScore('impact_score', value)}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className={`flex justify-between text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span>{t('evaluation', 'low_impact')}</span>
                  <span>{t('evaluation', 'high_impact')}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label className={`text-sm font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('evaluation', 'innovation_score')}: {scores.innovation_score[0]}/10
                </Label>
                <Slider
                  value={scores.innovation_score}
                  onValueChange={(value) => updateScore('innovation_score', value)}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className={`flex justify-between text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span>{t('evaluation', 'not_innovative')}</span>
                  <span>{t('evaluation', 'highly_innovative')}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label className={`text-sm font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('evaluation', 'overall_score')}: {scores.overall_score[0]}/10
                </Label>
                <Slider
                  value={scores.overall_score}
                  onValueChange={(value) => updateScore('overall_score', value)}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className={`flex justify-between text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span>{t('evaluation', 'poor')}</span>
                  <span>{t('evaluation', 'excellent')}</span>
                </div>
              </div>
            </div>

            {/* Feedback */}
            <div className="space-y-2">
              <Label htmlFor="feedback" className={isRTL ? 'text-right block' : 'text-left'}>
                {t('evaluation', 'detailed_feedback')}
              </Label>
              <Textarea
                id="feedback"
                placeholder={t('evaluation', 'feedback_placeholder')}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className={isRTL ? 'text-right' : 'text-left'}
                dir={isRTL ? 'rtl' : 'ltr'}
                rows={4}
              />
            </div>

            {/* Recommendation */}
            <div className="space-y-2">
              <Label htmlFor="recommendation" className={isRTL ? 'text-right block' : 'text-left'}>
                {t('evaluation', 'recommendation')}
              </Label>
              <Select value={recommendation} onValueChange={setRecommendation}>
                <SelectTrigger className={isRTL ? 'text-right' : 'text-left'}>
                  <SelectValue placeholder={t('evaluation', 'select_recommendation')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approve">{t('evaluation', 'approve')}</SelectItem>
                  <SelectItem value="approve_with_modifications">{t('evaluation', 'approve_with_modifications')}</SelectItem>
                  <SelectItem value="needs_more_info">{t('evaluation', 'needs_more_info')}</SelectItem>
                  <SelectItem value="reject">{t('evaluation', 'reject')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className={`flex ${isRTL ? 'justify-start space-x-4 space-x-reverse' : 'justify-end space-x-4'}`}>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={loading}
              >
                {t('evaluation', 'cancel')}
              </Button>
              <Button type="submit" disabled={loading} className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                {loading ? t('evaluation', 'submitting') : t('evaluation', 'submit_evaluation')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
