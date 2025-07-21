
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Filter, 
  Search, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  BarChart3,
  FileCheck,
  Settings
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { EvaluationStatusMatrix } from "./EvaluationStatusMatrix";
import { EvaluationSummaryCard } from "./EvaluationSummaryCard";
import { ManagementDecisionPanel } from "./ManagementDecisionPanel";

interface EvaluationManagementViewProps {
  profile: any;
  onIdeaUpdated: () => void;
}

export const EvaluationManagementView: React.FC<EvaluationManagementViewProps> = ({
  profile,
  onIdeaUpdated
}) => {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [evaluationData, setEvaluationData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [progressFilter, setProgressFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("queue");

  useEffect(() => {
    fetchIdeasWithEvaluations();
  }, []);

  useEffect(() => {
    if (selectedIdea) {
      fetchEvaluationDetails(selectedIdea.id);
    }
  }, [selectedIdea]);

  const fetchIdeasWithEvaluations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("ideas")
        .select(`
          *,
          profiles!ideas_submitter_id_fkey(full_name),
          evaluator_assignments!inner(
            id,
            evaluator_id,
            evaluation_type,
            is_active,
            profiles!evaluator_assignments_evaluator_id_fkey(full_name)
          ),
          evaluations(
            id,
            evaluator_id,
            evaluation_type,
            feasibility_score,
            impact_score,
            innovation_score,
            overall_score,
            enrichment_score,
            feedback,
            recommendation,
            created_at,
            updated_at
          )
        `)
        .eq("is_active", true)
        .in("status", ["submitted", "under_review", "evaluated"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      setIdeas(data || []);
    } catch (error) {
      console.error("Error fetching ideas with evaluations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvaluationDetails = async (ideaId: string) => {
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
        .eq("idea_id", ideaId);

      if (error) throw error;
      setEvaluationData(data || []);
    } catch (error) {
      console.error("Error fetching evaluation details:", error);
    }
  };

  const processEvaluationData = (idea: any) => {
    const assignments = idea.evaluator_assignments?.filter((a: any) => a.is_active) || [];
    const evaluations = idea.evaluations || [];
    
    const evaluatorStatuses = assignments.map((assignment: any) => {
      const evaluation = evaluations.find((e: any) => 
        e.evaluator_id === assignment.evaluator_id && 
        e.evaluation_type === assignment.evaluation_type
      );
      
      return {
        evaluatorId: assignment.evaluator_id,
        evaluatorName: assignment.profiles?.full_name || 'Unknown',
        evaluationType: assignment.evaluation_type,
        status: evaluation?.overall_score ? 'completed' : 'assigned',
        scores: evaluation ? {
          feasibility: evaluation.feasibility_score,
          impact: evaluation.impact_score,
          innovation: evaluation.innovation_score,
          overall: evaluation.overall_score,
          enrichment: evaluation.enrichment_score
        } : undefined,
        comments: evaluation?.feedback,
        recommendation: evaluation?.recommendation,
        completedAt: evaluation?.updated_at,
        submittedAt: evaluation?.created_at
      };
    });

    const completedCount = evaluatorStatuses.filter(e => e.status === 'completed').length;
    const totalCount = evaluatorStatuses.length;
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
      evaluatorStatuses,
      completedCount,
      totalCount,
      progress
    };
  };

  const getFilteredIdeas = () => {
    let filtered = ideas;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(idea => 
        idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.idea_reference_code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(idea => idea.status === statusFilter);
    }

    // Progress filter
    if (progressFilter !== "all") {
      filtered = filtered.filter(idea => {
        const { completedCount, totalCount } = processEvaluationData(idea);
        switch (progressFilter) {
          case "not_started":
            return completedCount === 0;
          case "in_progress":
            return completedCount > 0 && completedCount < totalCount;
          case "completed":
            return completedCount === totalCount;
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  const getTabData = () => {
    const filtered = getFilteredIdeas();
    
    return {
      queue: filtered.filter(idea => {
        const { completedCount, totalCount } = processEvaluationData(idea);
        return completedCount < totalCount;
      }),
      ready: filtered.filter(idea => {
        const { completedCount, totalCount } = processEvaluationData(idea);
        return completedCount === totalCount;
      }),
      analytics: filtered
    };
  };

  const tabData = getTabData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {language === 'ar' ? 'إدارة التقييمات' : 'Evaluation Management'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'ar' ? 'إدارة شاملة لعملية تقييم الأفكار' : 'Comprehensive evaluation process management'}
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={language === 'ar' ? 'البحث في الأفكار...' : 'Search ideas...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={language === 'ar' ? 'تصفية حسب الحالة' : 'Filter by status'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'ar' ? 'جميع الحالات' : 'All Statuses'}</SelectItem>
                <SelectItem value="submitted">{language === 'ar' ? 'مُرسل' : 'Submitted'}</SelectItem>
                <SelectItem value="under_review">{language === 'ar' ? 'قيد المراجعة' : 'Under Review'}</SelectItem>
                <SelectItem value="evaluated">{language === 'ar' ? 'مُقيم' : 'Evaluated'}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={progressFilter} onValueChange={setProgressFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={language === 'ar' ? 'تصفية حسب التقدم' : 'Filter by progress'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'ar' ? 'جميع المراحل' : 'All Progress'}</SelectItem>
                <SelectItem value="not_started">{language === 'ar' ? 'لم يبدأ' : 'Not Started'}</SelectItem>
                <SelectItem value="in_progress">{language === 'ar' ? 'قيد التنفيذ' : 'In Progress'}</SelectItem>
                <SelectItem value="completed">{language === 'ar' ? 'مكتمل' : 'Completed'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="queue" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {language === 'ar' ? 'طابور التقييم' : 'Evaluation Queue'}
            <Badge variant="secondary">{tabData.queue.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="ready" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            {language === 'ar' ? 'جاهز للقرار' : 'Ready for Decision'}
            <Badge variant="secondary">{tabData.ready.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {language === 'ar' ? 'التحليلات' : 'Analytics'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {tabData.queue.map((idea) => {
              const { evaluatorStatuses, progress } = processEvaluationData(idea);
              return (
                <EvaluationStatusMatrix
                  key={idea.id}
                  ideaId={idea.id}
                  ideaTitle={idea.title}
                  ideaReferenceCode={idea.idea_reference_code}
                  evaluators={evaluatorStatuses}
                  overallProgress={progress}
                  isManagementView={true}
                />
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="ready" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ideas Ready for Decision */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {language === 'ar' ? 'الأفكار جاهزة للقرار' : 'Ideas Ready for Decision'}
              </h3>
              {tabData.ready.map((idea) => {
                const { evaluatorStatuses, completedCount, totalCount, progress } = processEvaluationData(idea);
                
                // Calculate average scores
                const completedEvaluations = evaluatorStatuses.filter(e => e.scores);
                const avgScores = completedEvaluations.length > 0 ? {
                  feasibility: completedEvaluations.reduce((sum, e) => sum + (e.scores?.feasibility || 0), 0) / completedEvaluations.length,
                  impact: completedEvaluations.reduce((sum, e) => sum + (e.scores?.impact || 0), 0) / completedEvaluations.length,
                  innovation: completedEvaluations.reduce((sum, e) => sum + (e.scores?.innovation || 0), 0) / completedEvaluations.length,
                  overall: completedEvaluations.reduce((sum, e) => sum + (e.scores?.overall || 0), 0) / completedEvaluations.length,
                  enrichment: completedEvaluations.reduce((sum, e) => sum + (e.scores?.enrichment || 0), 0) / completedEvaluations.length
                } : { feasibility: 0, impact: 0, innovation: 0, overall: 0, enrichment: 0 };

                const categoryScores = {
                  technology: evaluatorStatuses.find(e => e.evaluationType === 'technology')?.scores?.overall || 0,
                  finance: evaluatorStatuses.find(e => e.evaluationType === 'finance')?.scores?.overall || 0,
                  commercial: evaluatorStatuses.find(e => e.evaluationType === 'commercial')?.scores?.overall || 0
                };

                return (
                  <EvaluationSummaryCard
                    key={idea.id}
                    summary={{
                      ideaId: idea.id,
                      ideaTitle: idea.title,
                      ideaReferenceCode: idea.idea_reference_code,
                      status: idea.status,
                      submittedAt: idea.submitted_at || idea.created_at,
                      evaluatedAt: idea.evaluated_at,
                      completedEvaluations: completedCount,
                      totalEvaluations: totalCount,
                      averageScores: avgScores,
                      categoryScores: categoryScores,
                      submitterName: idea.profiles?.full_name
                    }}
                    isManagementView={true}
                    onClick={() => setSelectedIdea(idea)}
                  />
                );
              })}
            </div>

            {/* Decision Panel */}
            {selectedIdea && (
              <div className="space-y-4">
                <ManagementDecisionPanel
                  ideaId={selectedIdea.id}
                  ideaTitle={selectedIdea.title}
                  currentStatus={selectedIdea.status}
                  onDecisionMade={() => {
                    onIdeaUpdated();
                    fetchIdeasWithEvaluations();
                    setSelectedIdea(null);
                  }}
                />
                
                {/* Detailed Evaluation Matrix */}
                <div className="space-y-4">
                  <h4 className="font-semibold">
                    {language === 'ar' ? 'تفاصيل التقييم' : 'Evaluation Details'}
                  </h4>
                  <EvaluationStatusMatrix
                    ideaId={selectedIdea.id}
                    ideaTitle={selectedIdea.title}
                    ideaReferenceCode={selectedIdea.idea_reference_code}
                    evaluators={processEvaluationData(selectedIdea).evaluatorStatuses}
                    overallProgress={processEvaluationData(selectedIdea).progress}
                    isManagementView={true}
                  />
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Analytics Cards */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {language === 'ar' ? 'معدل الإنجاز' : 'Completion Rate'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((tabData.ready.length / (tabData.queue.length + tabData.ready.length)) * 100)}%
                </div>
                <p className="text-sm text-muted-foreground">
                  {tabData.ready.length} {language === 'ar' ? 'من' : 'of'} {tabData.queue.length + tabData.ready.length} {language === 'ar' ? 'أفكار' : 'ideas'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {language === 'ar' ? 'في الانتظار' : 'Pending'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {tabData.queue.length}
                </div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'أفكار في طابور التقييم' : 'Ideas in evaluation queue'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  {language === 'ar' ? 'جاهز للقرار' : 'Ready'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {tabData.ready.length}
                </div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'أفكار جاهزة للقرار' : 'Ideas ready for decision'}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
