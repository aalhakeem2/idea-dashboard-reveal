
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
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailIdea, setDetailIdea] = useState<Idea | null>(null);
  const { t, isRTL, language } = useLanguage();

  console.log("EnhancedEvaluatorDashboard: activeView:", activeView);

  const fetchData = async () => {
    try {
      console.log("Evaluator Dashboard: Fetching data for profile:", profile.id);
      
      // First, fetch evaluator's active assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from("evaluator_assignments")
        .select(`
          *,
          ideas (*)
        `)
        .eq("evaluator_id", profile.id)
        .eq("is_active", true);

      if (assignmentsError) {
        console.error("Error fetching assignments:", assignmentsError);
        throw assignmentsError;
      }

      console.log("Evaluator Dashboard: Found assignments:", assignmentsData?.length || 0, assignmentsData);
      setAssignments(assignmentsData || []);

      // Extract unique ideas from assignments
      const assignedIdeas = assignmentsData
        ?.map(assignment => assignment.ideas)
        .filter(idea => idea && (idea.status === "submitted" || idea.status === "under_review"))
        || [];
      
      console.log("Evaluator Dashboard: Found assigned ideas:", assignedIdeas.length, assignedIdeas);
      setIdeas(assignedIdeas);

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

  const handleEvaluationCancelled = () => {
    setShowEvaluationForm(false);
    setSelectedIdea(null);
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
    // Check if evaluator has completed evaluation for their assigned type
    const assignment = assignments.find(a => a.idea_id === ideaId);
    if (!assignment) return false;
    
    return evaluations.some(evaluation => 
      evaluation.idea_id === ideaId && 
      evaluation.evaluation_type === assignment.evaluation_type
    );
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
        onCancel={handleEvaluationCancelled}
      />
    );
  }

  // Render based on active view
  const renderContent = () => {
    console.log("EnhancedEvaluatorDashboard: Rendering content for activeView:", activeView);
    
    switch (activeView) {
      case "dashboard":
        return renderDashboardView();
      case "ideas":
        return renderAllIdeasView();
      case "evaluations":
        return renderPendingEvaluationsView();
      case "assigned-ideas":
        return renderPendingEvaluationsView(); // Same as evaluations for now
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
            {language === 'ar' ? 'لوحة تحكم المقيم' : 'Evaluator Dashboard'}
          </h1>
          <p className={`text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
            {language === 'ar' ? 'مراجعة وتقييم الأفكار' : 'Review and evaluate ideas'}
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
                <p className="text-xs text-muted-foreground">{language === 'ar' ? 'أفكار للمراجعة' : 'Ideas to review'}</p>
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
                <p className="text-xs text-muted-foreground">{language === 'ar' ? 'في انتظار التقييم' : 'Pending evaluation'}</p>
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
                <p className="text-xs text-muted-foreground">{language === 'ar' ? 'تم تقييمها اليوم' : 'Evaluated today'}</p>
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
                <p className="text-xs text-muted-foreground">{language === 'ar' ? 'إجمالي التقييمات' : 'Total evaluations'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Ideas for Evaluation */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'ar' ? 'أفكار حديثة للتقييم' : 'Recent Ideas for Evaluation'}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>
          ) : ideas.slice(0, 3).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>{language === 'ar' ? 'لا توجد أفكار مُعينة' : 'No ideas assigned'}</p>
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
                          {language === 'ar' ? 'تقييم' : 'Evaluate'}
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(idea)}>
                        {language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
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
        <h1 className="text-3xl font-bold">{language === 'ar' ? 'جميع الأفكار' : 'All Ideas'}</h1>
        <p className="text-muted-foreground">{language === 'ar' ? 'تصفح جميع الأفكار المُرسلة' : 'Browse all submitted ideas'}</p>
      </div>

      {loading ? (
        <div className="text-center py-8">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>
      ) : ideas.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p>{language === 'ar' ? 'لا توجد أفكار متاحة' : 'No ideas available'}</p>
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
          <h1 className="text-3xl font-bold">{language === 'ar' ? 'التقييمات المعلقة' : 'Pending Evaluations'}</h1>
          <p className="text-muted-foreground">{language === 'ar' ? 'الأفكار في انتظار التقييم' : 'Ideas awaiting evaluation'}</p>
        </div>

        {loading ? (
          <div className="text-center py-8">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>
        ) : pendingIdeas.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <ClipboardCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">{language === 'ar' ? 'لا توجد تقييمات معلقة' : 'No pending evaluations'}</p>
              <p className="text-muted-foreground">{language === 'ar' ? 'كل شيء مكتمل!' : 'All caught up!'}</p>
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
                            {language === 'ar' ? 'تم الإرسال في:' : 'Submitted at:'} {new Date(idea.submitted_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleEvaluateIdea(idea)} className="gap-2">
                        <ClipboardCheck className="h-4 w-4" />
                        {language === 'ar' ? 'تقييم' : 'Evaluate'}
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2" onClick={() => handleViewDetails(idea)}>
                        <Eye className="h-4 w-4" />
                        {language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
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
          <h1 className="text-3xl font-bold">{language === 'ar' ? 'التحليلات' : 'Analytics'}</h1>
          <p className="text-muted-foreground">{language === 'ar' ? 'رؤى التقييم' : 'Evaluation insights'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{language === 'ar' ? 'إجمالي التقييمات' : 'Total Evaluations'}</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{evaluations.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{language === 'ar' ? 'متوسط النقاط' : 'Avg Score'}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {evaluations.length > 0 
                  ? (evaluations.reduce((sum, evaluation) => sum + (evaluation.overall_score || 0), 0) / evaluations.length).toFixed(1)
                  : '0'
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{language === 'ar' ? 'معدل الإكمال' : 'Completion Rate'}</CardTitle>
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
            <CardTitle>{language === 'ar' ? 'الأفكار حسب الحالة' : 'Ideas by Status'}</CardTitle>
            <CardDescription>{language === 'ar' ? 'توزيع حالات الأفكار' : 'Distribution of idea statuses'}</CardDescription>
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
