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
import { ClipboardCheck, Star } from "lucide-react";
import { Slider } from "@/components/ui/slider";

type Idea = Tables<"ideas">;
type Profile = Tables<"profiles">;

interface EvaluationFormProps {
  idea: Idea;
  profile: Profile;
  onEvaluationSubmitted: () => void;
}

export const EvaluationForm = ({ idea, profile, onEvaluationSubmitted }: EvaluationFormProps) => {
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
        title: "Evaluation Submitted",
        description: "Your evaluation has been submitted successfully!",
      });

      onEvaluationSubmitted();
    } catch (error) {
      console.error("Error submitting evaluation:", error);
      toast({
        title: "Error",
        description: "Failed to submit evaluation",
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
          <div className={`flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
            <ClipboardCheck className="h-6 w-6 text-blue-600" />
            <CardTitle className={isRTL ? 'text-right' : 'text-left'}>
              Evaluate Idea
            </CardTitle>
          </div>
          <CardDescription className={isRTL ? 'text-right' : 'text-left'}>
            Provide your evaluation for: {idea.idea_reference_code || idea.title}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Anonymized Idea Info */}
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Idea Details</h3>
              <div className="space-y-2">
                <p><strong>Reference:</strong> {idea.idea_reference_code}</p>
                <p><strong>Title:</strong> {idea.title}</p>
                <p><strong>Description:</strong> {idea.description}</p>
                <p><strong>Category:</strong> {idea.category}</p>
              </div>
            </div>

            {/* Evaluation Scores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Feasibility Score: {scores.feasibility_score[0]}/10
                </Label>
                <Slider
                  value={scores.feasibility_score}
                  onValueChange={(value) => updateScore('feasibility_score', value)}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Not Feasible</span>
                  <span>Highly Feasible</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Impact Score: {scores.impact_score[0]}/10
                </Label>
                <Slider
                  value={scores.impact_score}
                  onValueChange={(value) => updateScore('impact_score', value)}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Low Impact</span>
                  <span>High Impact</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Innovation Score: {scores.innovation_score[0]}/10
                </Label>
                <Slider
                  value={scores.innovation_score}
                  onValueChange={(value) => updateScore('innovation_score', value)}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Not Innovative</span>
                  <span>Highly Innovative</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Overall Score: {scores.overall_score[0]}/10
                </Label>
                <Slider
                  value={scores.overall_score}
                  onValueChange={(value) => updateScore('overall_score', value)}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Poor</span>
                  <span>Excellent</span>
                </div>
              </div>
            </div>

            {/* Feedback */}
            <div className="space-y-2">
              <Label htmlFor="feedback" className={isRTL ? 'text-right block' : 'text-left'}>
                Detailed Feedback
              </Label>
              <Textarea
                id="feedback"
                placeholder="Provide detailed feedback on the idea..."
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
                Recommendation
              </Label>
              <Select value={recommendation} onValueChange={setRecommendation}>
                <SelectTrigger className={isRTL ? 'text-right' : 'text-left'}>
                  <SelectValue placeholder="Select your recommendation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approve">Approve for Implementation</SelectItem>
                  <SelectItem value="approve_with_modifications">Approve with Modifications</SelectItem>
                  <SelectItem value="needs_more_info">Needs More Information</SelectItem>
                  <SelectItem value="reject">Reject</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className={`flex justify-end space-x-4 ${isRTL ? 'space-x-reverse' : ''}`}>
              <Button type="submit" disabled={loading} className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                {loading ? "Submitting..." : "Submit Evaluation"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};