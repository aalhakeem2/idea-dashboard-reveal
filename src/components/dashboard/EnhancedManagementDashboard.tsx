import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  FileCheck,
  Target,
  Activity,
  Lightbulb
} from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { ManagementDecisionPanel } from "./ManagementDecisionPanel";
import { EvaluationProgressMatrix } from "./EvaluationProgressMatrix";
import { RevisionWorkflowSimple } from "./RevisionWorkflowSimple";
import { IdeaCard } from "./IdeaCard";
import { UserManagementView } from "./views/UserManagementView";
import { SettingsView } from "./views/SettingsView";
import { EvaluatorManagementView } from "./views/EvaluatorManagementView";
import { EvaluatorPoolView } from "./views/EvaluatorPoolView";
import { EvaluatorAssignmentDashboard } from "./EvaluatorAssignmentDashboard";
import { EvaluationManagementView } from "./EvaluationManagementView";
import { EnhancedAnalyticsDashboard } from "./analytics/EnhancedAnalyticsDashboard";

interface EnhancedManagementDashboardProps {
  ideas: any[];
  onIdeaUpdated: () => void;
  activeView?: string;
  profile: any;
}

interface DashboardStats {
  totalIdeas: number;
  pendingEvaluation: number;
  evaluatedIdeas: number;
  approvedIdeas: number;
  avgEvaluationTime: number;
  successRate: number;
}

export const EnhancedManagementDashboard: React.FC<EnhancedManagementDashboardProps> = ({
  ideas,
  onIdeaUpdated,
  activeView = "dashboard",
  profile
}) => {
  const { t } = useTranslations("evaluation_dashboard");
  const { language } = useLanguage();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalIdeas: 0,
    pendingEvaluation: 0,
    evaluatedIdeas: 0,
    approvedIdeas: 0,
    avgEvaluationTime: 0,
    successRate: 0
  });
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [evaluationData, setEvaluationData] = useState<any[]>([]);

  console.log("EnhancedManagementDashboard: activeView prop:", activeView);

  useEffect(() => {
    calculateStats();
    if (selectedIdea) {
      fetchEvaluationData(selectedIdea.id);
    }
  }, [ideas, selectedIdea]);

  const calculateStats = () => {
    const total = ideas.length;
    const pending = ideas.filter(i => i.status === 'under_review' || i.status === 'submitted').length;
    const evaluated = ideas.filter(i => i.status === 'evaluated' || i.average_evaluation_score > 0).length;
    const approved = ideas.filter(i => i.status === 'approved').length;
    
    setStats({
      totalIdeas: total,
      pendingEvaluation: pending,
      evaluatedIdeas: evaluated,
      approvedIdeas: approved,
      avgEvaluationTime: 3.2, // Mock data
      successRate: total > 0 ? Math.round((approved / total) * 100) : 0
    });
  };

  const fetchEvaluationData = async (ideaId: string) => {
    try {
      const { data, error } = await supabase
        .from("evaluations")
        .select(`
          *,
          evaluator_assignments!inner(
            evaluator_id,
            evaluation_type,
            profiles!evaluator_assignments_evaluator_id_fkey(full_name)
          )
        `)
        .eq("idea_id", ideaId);

      if (error) throw error;
      setEvaluationData(data || []);
    } catch (error) {
      console.error("Error fetching evaluation data:", error);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'evaluated':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to check if idea has management decision
  const hasManagementDecision = async (ideaId: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('idea_action_log')
      .select('id')
      .eq('idea_id', ideaId)
      .eq('action_type', 'management_decision')
      .limit(1);
    
    return !error && data && data.length > 0;
  };

  // Ideas that have completed evaluations but no management decision yet
  const [pendingDecisionIdeas, setPendingDecisionIdeas] = useState<any[]>([]);
  const [decidedIdeas, setDecidedIdeas] = useState<any[]>([]);

  // Check which ideas need decisions vs those already decided
  useEffect(() => {
    const checkDecisionStatus = async () => {
      const evaluatedIdeas = ideas.filter(idea => 
        (idea.status === 'under_review' && idea.average_evaluation_score && idea.average_evaluation_score > 0) ||
        idea.status === 'evaluated'
      );

      const pending: any[] = [];
      const decided: any[] = [];

      for (const idea of evaluatedIdeas) {
        const hasDecision = await hasManagementDecision(idea.id);
        if (hasDecision || idea.status === 'approved' || idea.status === 'rejected') {
          decided.push(idea);
        } else {
          pending.push(idea);
        }
      }

      setPendingDecisionIdeas(pending);
      setDecidedIdeas(decided);
    };

    if (ideas.length > 0) {
      checkDecisionStatus();
    }
  }, [ideas]);

  const pendingIdeas = ideas.filter(idea => 
    idea.status === 'under_review' || idea.status === 'submitted'
  );

  // Render different views based on activeView
  const renderContent = () => {
    console.log("EnhancedManagementDashboard: Rendering content for activeView:", activeView);
    
    switch (activeView) {
      case "dashboard":
        return renderDashboardView();
      case "evaluation-queue":
        return renderEvaluationQueueView();
      case "assign-evaluators":
        return <EvaluatorAssignmentDashboard profile={profile} />;
      case "evaluation-management":
        return <EvaluationManagementView profile={profile} onIdeaUpdated={onIdeaUpdated} />;
      case "decisions":
        return renderDecisionsView();
      case "analytics":
        return <EnhancedAnalyticsDashboard profile={profile} />;
      case "ideas":
        return renderAllIdeasView();
      case "evaluator-management":
        return <EvaluatorManagementView profile={profile} />;
      case "evaluator-pool":
        return <EvaluatorPoolView />;
      case "users":
        return <UserManagementView />;
      case "settings":
        return <SettingsView />;
      default:
        return renderDashboardView();
    }
  };

  const renderDashboardView = () => (
    <div className="space-y-6">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{t("pending_evaluations")}</p>
                <p className="text-3xl font-bold text-orange-600">{stats.pendingEvaluation}</p>
              </div>
              <Clock className="h-10 w-10 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{t("completed_today")}</p>
                <p className="text-3xl font-bold text-green-600">{stats.evaluatedIdeas}</p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{t("success_rate")}</p>
                <p className="text-3xl font-bold text-blue-600">{stats.successRate}%</p>
              </div>
              <Target className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{language === 'ar' ? 'متوسط الوقت' : 'Avg Time'}</p>
                <p className="text-3xl font-bold text-purple-600">{stats.avgEvaluationTime}d</p>
              </div>
              <TrendingUp className="h-10 w-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Ideas Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Lightbulb className="h-6 w-6 text-you-accent" />
            {language === 'ar' ? 'نظرة عامة على الأفكار' : 'Recent Ideas Overview'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ideas.slice(0, 6).map((idea) => (
              <IdeaCard 
                key={idea.id} 
                idea={idea}
                onViewActivity={(idea) => setSelectedIdea(idea)}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderEvaluationQueueView = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {language === 'ar' ? 'طابور التقييم' : 'Evaluation Queue'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'ar' ? 'الأفكار قيد التقييم' : 'Ideas under evaluation'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-orange-500" />
            {language === 'ar' ? 'الأفكار قيد التقييم' : 'Ideas Under Evaluation'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingIdeas.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">{language === 'ar' ? 'لا توجد أفكار في انتظار التقييم' : 'No ideas pending evaluation'}</p>
              </div>
            ) : (
              pendingIdeas.map((idea) => (
                <div
                  key={idea.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-all hover:shadow-md"
                  onClick={() => setSelectedIdea(idea)}
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{idea.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{idea.description}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="outline">{idea.idea_reference_code}</Badge>
                      <Badge className={getStatusBadgeColor(idea.status)}>
                        {idea.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      {new Date(idea.created_at).toLocaleDateString()}
                    </div>
                    {idea.average_evaluation_score && (
                      <div className="text-lg font-bold text-primary mt-1">
                        {idea.average_evaluation_score.toFixed(1)}/10
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDecisionsView = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {language === 'ar' ? 'القرارات' : 'Decisions'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'ar' ? 'اتخاذ القرارات بشأن الأفكار المُقيمة' : 'Make decisions on evaluated ideas'}
        </p>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {language === 'ar' ? 'في انتظار القرار' : 'Pending Decisions'}
            {pendingDecisionIdeas.length > 0 && <Badge variant="secondary">{pendingDecisionIdeas.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="decided" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            {language === 'ar' ? 'القرارات المتخذة' : 'Decision History'}
            {decidedIdeas.length > 0 && <Badge variant="outline">{decidedIdeas.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ideas Ready for Decision */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <FileCheck className="h-5 w-5 text-orange-500" />
                  {language === 'ar' ? 'جاهزة للقرار' : 'Ready for Decision'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingDecisionIdeas.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg">{language === 'ar' ? 'لا توجد أفكار في انتظار القرار' : 'No ideas awaiting decision'}</p>
                      <p className="text-sm mt-2">{language === 'ar' ? 'جميع الأفكار المقيمة تم اتخاذ قرار بشأنها' : 'All evaluated ideas have been decided'}</p>
                    </div>
                  ) : (
                    pendingDecisionIdeas.map((idea) => (
                      <div
                        key={idea.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedIdea?.id === idea.id 
                            ? 'border-primary bg-primary/5 shadow-md' 
                            : 'border-border hover:bg-muted/50 hover:shadow-sm'
                        }`}
                        onClick={() => setSelectedIdea(idea)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-semibold text-gray-900">{idea.title}</h5>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">{idea.idea_reference_code}</Badge>
                              {idea.average_evaluation_score && (
                                <Badge variant="secondary" className="text-xs">
                                  {idea.average_evaluation_score.toFixed(1)}/10
                                </Badge>
                              )}
                              <Badge className="text-xs bg-blue-100 text-blue-800">
                                {language === 'ar' ? '🧩 مُقيمة - في انتظار القرار' : '🧩 Evaluated - Awaiting Decision'}
                              </Badge>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" className="hover:bg-primary hover:text-white">
                            {language === 'ar' ? 'اتخاذ قرار' : 'Decide'}
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Decision Panel */}
            {selectedIdea && pendingDecisionIdeas.find(idea => idea.id === selectedIdea.id) && (
              <div className="space-y-4">
                <ManagementDecisionPanel
                  ideaId={selectedIdea.id}
                  ideaTitle={selectedIdea.title}
                  currentStatus={selectedIdea.status}
                  onDecisionMade={() => {
                    onIdeaUpdated();
                    setSelectedIdea(null);
                  }}
                />
                
                <RevisionWorkflowSimple
                  ideaId={selectedIdea.id}
                  ideaTitle={selectedIdea.title}
                  isSubmitter={false}
                  onRevisionUpdated={onIdeaUpdated}
                />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="decided" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-green-500" />
                {language === 'ar' ? 'سجل القرارات' : 'Decision History'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {decidedIdeas.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">{language === 'ar' ? 'لا توجد قرارات متخذة بعد' : 'No decisions made yet'}</p>
                  </div>
                ) : (
                  decidedIdeas.map((idea) => (
                    <div
                      key={idea.id}
                      className="p-4 border rounded-lg bg-muted/20"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-semibold text-gray-900">{idea.title}</h5>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">{idea.idea_reference_code}</Badge>
                            {idea.average_evaluation_score && (
                              <Badge variant="secondary" className="text-xs">
                                {idea.average_evaluation_score.toFixed(1)}/10
                              </Badge>
                            )}
                            <Badge className={`text-xs ${
                              idea.status === 'approved' ? 'bg-green-100 text-green-800' :
                              idea.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {idea.status === 'approved' ? (language === 'ar' ? '🟢 موافق عليه' : '🟢 Approved') :
                               idea.status === 'rejected' ? (language === 'ar' ? '🔴 مرفوض' : '🔴 Rejected') :
                               (language === 'ar' ? '⚠️ موافقة مشروطة' : '⚠️ Conditional')}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {language === 'ar' ? 'تم اتخاذ القرار في:' : 'Decision made on:'} {
                              idea.updated_at ? new Date(idea.updated_at).toLocaleDateString() : 'N/A'
                            }
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => setSelectedIdea(idea)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderAnalyticsView = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {language === 'ar' ? 'التحليلات' : 'Analytics'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'ar' ? 'تحليلات وإحصائيات النظام' : 'System analytics and insights'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              {language === 'ar' ? 'إحصائيات الأداء' : 'Performance Stats'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-3">
                <span className="font-medium">{language === 'ar' ? 'معدل الموافقة' : 'Approval Rate'}</span>
                <span className="font-bold text-green-600">{stats.successRate}%</span>
              </div>
              <Progress value={stats.successRate} className="h-3" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-3">
                <span className="font-medium">{language === 'ar' ? 'كفاءة التقييم' : 'Evaluation Efficiency'}</span>
                <span className="font-bold text-blue-600">85%</span>
              </div>
              <Progress value={85} className="h-3" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-3">
                <span className="font-medium">{language === 'ar' ? 'جودة الأفكار' : 'Idea Quality'}</span>
                <span className="font-bold text-purple-600">78%</span>
              </div>
              <Progress value={78} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {selectedIdea && evaluationData.length > 0 && (
          <EvaluationProgressMatrix
            ideaId={selectedIdea.id}
            ideaTitle={selectedIdea.title}
            evaluators={evaluationData.map(e => ({
              evaluatorId: e.evaluator_assignments.evaluator_id,
              evaluatorName: e.evaluator_assignments.profiles?.full_name || 'Unknown',
              evaluationType: e.evaluation_type,
              status: e.overall_score ? 'completed' : 'assigned',
              score: e.overall_score,
              completedAt: e.updated_at
            }))}
            overallProgress={75}
            consensusLevel="high"
          />
        )}
      </div>
    </div>
  );

  const renderAllIdeasView = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {language === 'ar' ? 'جميع الأفكار' : 'All Ideas'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'ar' ? 'عرض وإدارة جميع الأفكار في النظام' : 'View and manage all ideas in the system'}
        </p>
      </div>

      <div className="space-y-4">
        {ideas.map((idea) => (
          <IdeaCard 
            key={idea.id} 
            idea={idea} 
            detailed 
            showTimeline={true}
            onViewActivity={(idea) => setSelectedIdea(idea)}
          />
        ))}
      </div>
    </div>
  );

  return renderContent();
};
