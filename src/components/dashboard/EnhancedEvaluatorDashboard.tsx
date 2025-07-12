import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, Eye, Star, Clock, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { IdeaCard } from "./IdeaCard";
import { EvaluationForm } from "./EvaluationForm";

type Profile = Tables<"profiles">;
type Idea = Tables<"ideas">;
type Evaluation = Tables<"evaluations">;

interface EnhancedEvaluatorDashboardProps {
  profile: Profile;
}

export const EnhancedEvaluatorDashboard = ({ profile }: EnhancedEvaluatorDashboardProps) => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const { t, isRTL } = useLanguage();

  const fetchData = async () => {
    try {
      // Fetch ideas that are ready for evaluation
      const { data: ideasData, error: ideasError } = await supabase
        .from("ideas")
        .select("*")
        .in("status", ["submitted", "under_review"])
        .order("submitted_at", { ascending: true });

      if (ideasError) throw ideasError;
      setIdeas(ideasData || []);

      // Fetch evaluator's existing evaluations
      const { data: evaluationsData, error: evaluationsError } = await supabase
        .from("evaluations")
        .select("*")
        .eq("evaluator_id", profile.id);

      if (evaluationsError) throw evaluationsError;
      setEvaluations(evaluationsData || []);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [profile.id]);

  const handleEvaluationSubmitted = () => {
    setShowEvaluationForm(false);
    setSelectedIdea(null);
    fetchData();
  };

  const handleEvaluateIdea = (idea: Idea) => {
    setSelectedIdea(idea);
    setShowEvaluationForm(true);
  };

  const isIdeaEvaluated = (ideaId: string) => {
    return evaluations.some(evaluation => evaluation.idea_id === ideaId);
  };

  const getEvaluationStats = () => {
    const pendingIdeas = ideas.filter(idea => !isIdeaEvaluated(idea.id));
    const evaluatedIdeas = ideas.filter(idea => isIdeaEvaluated(idea.id));
    
    return {
      total: ideas.length,
      pending: pendingIdeas.length,
      evaluated: evaluatedIdeas.length,
      totalEvaluations: evaluations.length,
    };
  };

  const stats = getEvaluationStats();

  if (showEvaluationForm && selectedIdea) {
    return (
      <EvaluationForm
        idea={selectedIdea}
        profile={profile}
        onEvaluationSubmitted={handleEvaluationSubmitted}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div>
          <h1 className={`text-3xl font-bold ${isRTL ? 'text-right' : 'text-left'}`}>
            Evaluator Dashboard
          </h1>
          <p className={`text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
            Review and evaluate submitted ideas
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ClipboardCheck className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Ideas to Review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending Evaluation</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.evaluated}</p>
                <p className="text-xs text-muted-foreground">Evaluated Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalEvaluations}</p>
                <p className="text-xs text-muted-foreground">Total Evaluations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ideas List */}
      <div>
        <h2 className={`text-xl font-semibold mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
          Ideas for Evaluation
        </h2>
        
        {loading ? (
          <div className="text-center py-8">Loading ideas...</div>
        ) : ideas.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <ClipboardCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">No ideas available for evaluation</p>
              <p className="text-muted-foreground">
                Check back later for new ideas to review.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {ideas.map((idea) => {
              const isEvaluated = isIdeaEvaluated(idea.id);
              return (
                <Card key={idea.id} className={isEvaluated ? "opacity-75" : ""}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{idea.title}</h3>
                          {idea.idea_reference_code && (
                            <Badge variant="outline" className="text-xs font-mono">
                              {idea.idea_reference_code}
                            </Badge>
                          )}
                          {isEvaluated && (
                            <Badge variant="secondary" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Evaluated
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-3 line-clamp-2">
                          {idea.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Badge variant="outline">
                              {idea.category.replace('_', ' ')}
                            </Badge>
                          </div>
                          {idea.submitted_at && (
                            <span>
                              Submitted: {new Date(idea.submitted_at).toLocaleDateString()}
                            </span>
                          )}
                          {idea.average_evaluation_score && idea.average_evaluation_score > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span>{idea.average_evaluation_score.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!isEvaluated && (
                          <Button 
                            onClick={() => handleEvaluateIdea(idea)}
                            className="gap-2"
                          >
                            <ClipboardCheck className="h-4 w-4" />
                            Evaluate
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};