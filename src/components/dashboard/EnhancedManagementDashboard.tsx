
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

interface EnhancedManagementDashboardProps {
  ideas: any[];
  onIdeaUpdated: () => void;
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
  onIdeaUpdated
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
  const [activeTab, setActiveTab] = useState("evaluation-queue");

  console.log("EnhancedManagementDashboard: Current active tab:", activeTab);

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

  const handleTabChange = (value: string) => {
    console.log("Tab changing from", activeTab, "to", value);
    setActiveTab(value);
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

  const evaluatedIdeas = ideas.filter(idea => 
    idea.status === 'evaluated' || 
    (idea.average_evaluation_score && idea.average_evaluation_score > 0)
  );

  const pendingIdeas = ideas.filter(idea => 
    idea.status === 'under_review' || idea.status === 'submitted'
  );

  return (
    <div className="space-y-6">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("pending_evaluations")}</p>
                <p className="text-2xl font-bold">{stats.pendingEvaluation}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("completed_today")}</p>
                <p className="text-2xl font-bold">{stats.evaluatedIdeas}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("success_rate")}</p>
                <p className="text-2xl font-bold">{stats.successRate}%</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{language === 'ar' ? 'متوسط الوقت' : 'Avg Time'}</p>
                <p className="text-2xl font-bold">{stats.avgEvaluationTime}d</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-muted">
          <TabsTrigger 
            value="evaluation-queue"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground"
          >
            {language === 'ar' ? 'طابور التقييم' : 'Evaluation Queue'}
          </TabsTrigger>
          <TabsTrigger 
            value="decisions"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground"
          >
            {language === 'ar' ? 'القرارات' : 'Decisions'}
          </TabsTrigger>
          <TabsTrigger 
            value="analytics"
            className="data-[state=active]:bg-background data-[state=active]:text-foreground"
          >
            {language === 'ar' ? 'التحليلات' : 'Analytics'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="evaluation-queue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {language === 'ar' ? 'الأفكار قيد التقييم' : 'Ideas Under Evaluation'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingIdeas.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {language === 'ar' ? 'لا توجد أفكار في انتظار التقييم' : 'No ideas pending evaluation'}
                  </div>
                ) : (
                  pendingIdeas.map((idea) => (
                    <div
                      key={idea.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => setSelectedIdea(idea)}
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{idea.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1">{idea.description}</p>
                        <div className="flex items-center gap-2 mt-2">
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
                          <div className="text-lg font-bold text-primary">
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
        </TabsContent>

        <TabsContent value="decisions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ideas Ready for Decision */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  {language === 'ar' ? 'جاهزة للقرار' : 'Ready for Decision'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {evaluatedIdeas.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {language === 'ar' ? 'لا توجد أفكار جاهزة للقرار' : 'No ideas ready for decision'}
                    </div>
                  ) : (
                    evaluatedIdeas.map((idea) => (
                      <div
                        key={idea.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedIdea?.id === idea.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedIdea(idea)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium">{idea.title}</h5>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{idea.idea_reference_code}</Badge>
                              {idea.average_evaluation_score && (
                                <Badge variant="secondary" className="text-xs">
                                  {idea.average_evaluation_score.toFixed(1)}/10
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
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
            {selectedIdea && (
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

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {language === 'ar' ? 'إحصائيات الأداء' : 'Performance Stats'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>{language === 'ar' ? 'معدل الموافقة' : 'Approval Rate'}</span>
                    <span>{stats.successRate}%</span>
                  </div>
                  <Progress value={stats.successRate} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>{language === 'ar' ? 'كفاءة التقييم' : 'Evaluation Efficiency'}</span>
                    <span>85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>{language === 'ar' ? 'جودة الأفكار' : 'Idea Quality'}</span>
                    <span>78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
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
        </TabsContent>
      </Tabs>

      {/* Recent Ideas Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            {language === 'ar' ? 'نظرة عامة على الأفكار' : 'Ideas Overview'}
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
};
