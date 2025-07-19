
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, Eye, Star, Clock, CheckCircle, BarChart3, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { IdeaCard } from "./IdeaCard";
import { EvaluationForm } from "./EvaluationForm";
import { IdeaDetailModal } from "./IdeaDetailModal";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type Profile = Tables<"profiles">;
type Idea = Tables<"ideas">;
type Evaluation = Tables<"evaluations">;

interface EnhancedEvaluatorDashboardProps {
  profile: Profile;
  activeView: string;
}

export const EnhancedEvaluatorDashboard = ({ profile, activeView }: EnhancedEvaluatorDashboardProps) => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailIdea, setDetailIdea] = useState<Idea | null>(null);
  const { t, isRTL } = useLanguage();

  const fetchData = async () => {
    try {
      console.log("Evaluator Dashboard: Fetching data for profile:", profile.id);
      
      // Fetch ideas that are ready for evaluation
      const { data: ideasData, error: ideasError } = await supabase
        .from("ideas")
        .select("*")
        .in("status", ["submitted", "under_review"])
        .order("submitted_at", { ascending: true });

      if (ideasError) {
        console.error("Error fetching ideas:", ideasError);
        throw ideasError;
      }
      
      console.log("Evaluator Dashboard: Found ideas:", ideasData?.length || 0, ideasData);
      setIdeas(ideasData || []);

      // Fetch evaluator's existing evaluations
      const { data: evaluationsData, error: evaluationsError } = await supabase
        .from("evaluations")
        .select("*")
        .eq("evaluator_id", profile.id);

      if (evaluationsError) {
        console.error("Error fetching evaluations:", evaluationsError);
        throw evaluationsError;
      }
      
      console.log("Evaluator Dashboard: Found evaluations:", evaluationsData?.length || 0);
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

  const handleViewDetails = (idea: Idea) => {
    setDetailIdea(idea);
    setShowDetailModal(true);
  };

  const handleEvaluateFromModal = (idea: Idea) => {
    setShowDetailModal(false);
    setDetailIdea(null);
    handleEvaluateIdea(idea);
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

  const getAnalyticsData = () => {
    const statusCounts = ideas.reduce((acc, idea) => {
      acc[idea.status] = (acc[idea.status] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.replace('_', ' '),
      count
    }));
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

  // Render based on active view
  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return renderDashboardView();
      case "ideas":
        return renderAllIdeasView();
      case "pending-evaluations":
        return renderPendingEvaluationsView();
      case "analytics":
        return renderAnalyticsView();
      default:
        return renderDashboardView();
    }
  };

  const renderDashboardView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div>
          <h1 className={`text-3xl font-bold ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('dashboard', 'evaluator_dashboard')}
          </h1>
          <p className={`text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('dashboard', 'review_evaluate_ideas')}
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
                <p className="text-xs text-muted-foreground">{t('dashboard', 'ideas_to_review')}</p>
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
                <p className="text-xs text-muted-foreground">{t('dashboard', 'pending_evaluation')}</p>
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
                <p className="text-xs text-muted-foreground">{t('dashboard', 'evaluated_today')}</p>
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
                <p className="text-xs text-muted-foreground">{t('dashboard', 'total_evaluations')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Ideas for Evaluation */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard', 'recent_ideas_for_evaluation')}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">{t('common', 'loading')}</div>
          ) : ideas.slice(0, 3).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>{t('dashboard', 'no_ideas_assigned')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ideas.slice(0, 3).map((idea) => {
                const isEvaluated = isIdeaEvaluated(idea.id);
                return (
                  <div key={idea.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{idea.title}</h3>
                      <p className="text-sm text-muted-foreground">{idea.category}</p>
                    </div>
                    <div className="flex gap-2">
                      {!isEvaluated && (
                        <Button size="sm" onClick={() => handleEvaluateIdea(idea)}>
                          {t('dashboard', 'evaluate')}
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(idea)}>
                        {t('dashboard', 'view_details')}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderAllIdeasView = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('dashboard', 'all_ideas')}</h1>
        <p className="text-muted-foreground">{t('dashboard', 'browse_all_submitted_ideas')}</p>
      </div>

      {loading ? (
        <div className="text-center py-8">{t('common', 'loading')}</div>
      ) : ideas.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p>{t('dashboard', 'no_ideas_available')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {ideas.map((idea) => (
            <IdeaCard 
              key={idea.id} 
              idea={idea} 
              detailed 
              showTimeline={true}
              onViewActivity={() => handleViewDetails(idea)}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderPendingEvaluationsView = () => {
    const pendingIdeas = ideas.filter(idea => !isIdeaEvaluated(idea.id));

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('dashboard', 'pending_evaluations')}</h1>
          <p className="text-muted-foreground">{t('dashboard', 'ideas_awaiting_evaluation')}</p>
        </div>

        {loading ? (
          <div className="text-center py-8">{t('common', 'loading')}</div>
        ) : pendingIdeas.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <ClipboardCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">{t('dashboard', 'no_pending_evaluations')}</p>
              <p className="text-muted-foreground">{t('dashboard', 'all_caught_up')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingIdeas.map((idea) => (
              <Card key={idea.id}>
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
                      </div>
                      <p className="text-muted-foreground mb-3 line-clamp-2">
                        {idea.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <Badge variant="outline">
                          {idea.category.replace('_', ' ')}
                        </Badge>
                        {idea.submitted_at && (
                          <span>
                            {t('dashboard', 'submitted_at')}: {new Date(idea.submitted_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleEvaluateIdea(idea)} className="gap-2">
                        <ClipboardCheck className="h-4 w-4" />
                        {t('dashboard', 'evaluate')}
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2" onClick={() => handleViewDetails(idea)}>
                        <Eye className="h-4 w-4" />
                        {t('dashboard', 'view_details')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderAnalyticsView = () => {
    const analyticsData = getAnalyticsData();
    
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('dashboard', 'analytics')}</h1>
          <p className="text-muted-foreground">{t('dashboard', 'evaluation_insights')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard', 'total_evaluations')}</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{evaluations.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard', 'avg_score')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {evaluations.length > 0 
                  ? (evaluations.reduce((sum, eval) => sum + (eval.overall_score || 0), 0) / evaluations.length).toFixed(1)
                  : '0'
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard', 'completion_rate')}</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {ideas.length > 0 ? Math.round((stats.evaluated / ideas.length) * 100) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard', 'ideas_by_status')}</CardTitle>
            <CardDescription>{t('dashboard', 'distribution_of_idea_statuses')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <>
      {renderContent()}

      {/* Idea Detail Modal */}
      <IdeaDetailModal
        idea={detailIdea}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setDetailIdea(null);
        }}
        onEvaluate={handleEvaluateFromModal}
        showEvaluateButton={detailIdea ? !isIdeaEvaluated(detailIdea.id) : false}
      />
    </>
  );
};
