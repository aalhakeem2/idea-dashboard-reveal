import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { UserCheck, Clock, CheckCircle, AlertCircle, Plus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { EvaluatorAssignmentModal } from "./EvaluatorAssignmentModal";

type Idea = Tables<"ideas">;
type Profile = Tables<"profiles">;
type EvaluatorAssignment = Tables<"evaluator_assignments">;

interface IdeaWithProgress extends Idea {
  progress_data?: {
    total_assigned: number;
    total_completed: number;
    progress_percentage: number;
    missing_types: string[];
  };
  assignments?: (EvaluatorAssignment & { evaluator: Profile })[];
}

interface EvaluatorAssignmentDashboardProps {
  profile: Profile;
}

export const EvaluatorAssignmentDashboard = ({ profile }: EvaluatorAssignmentDashboardProps) => {
  const [ideas, setIdeas] = useState<IdeaWithProgress[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<IdeaWithProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    fetchIdeasForAssignment();
  }, []);

  const fetchIdeasForAssignment = async () => {
    try {
      // Fetch submitted ideas that need evaluation assignments
      const { data: ideasData, error: ideasError } = await supabase
        .from("ideas")
        .select("*")
        .eq("status", "submitted")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (ideasError) throw ideasError;

      // For each idea, get progress data and assignments
      const ideasWithProgress = await Promise.all(
        (ideasData || []).map(async (idea) => {
          // Get evaluation progress
          const { data: progressData, error: progressError } = await supabase
            .rpc("get_evaluation_progress", { p_idea_id: idea.id });

          if (progressError) {
            console.error("Error fetching progress for idea:", idea.id, progressError);
          }

          // Get current assignments
          const { data: assignments, error: assignmentsError } = await supabase
            .from("evaluator_assignments")
            .select("*")
            .eq("idea_id", idea.id)
            .eq("is_active", true);

          // Get evaluator profiles for assignments
          const assignmentsWithProfiles = assignments ? await Promise.all(
            assignments.map(async (assignment) => {
              const { data: evaluator } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", assignment.evaluator_id)
                .single();
              
              return {
                ...assignment,
                evaluator: evaluator
              };
            })
          ) : [];

          if (assignmentsError) {
            console.error("Error fetching assignments for idea:", idea.id, assignmentsError);
          }

          return {
            ...idea,
            progress_data: progressData?.[0] || {
              total_assigned: 0,
              total_completed: 0,
              progress_percentage: 0,
              missing_types: ['technology', 'finance', 'commercial']
            },
            assignments: assignmentsWithProfiles || []
          };
        })
      );

      setIdeas(ideasWithProgress);
    } catch (error) {
      console.error("Error fetching ideas for assignment:", error);
      toast({
        title: "Error",
        description: "Failed to load ideas for assignment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (progress: number) => {
    if (progress === 0) return "text-red-600";
    if (progress < 100) return "text-yellow-600";
    return "text-green-600";
  };

  const getStatusIcon = (progress: number) => {
    if (progress === 0) return <AlertCircle className="h-4 w-4" />;
    if (progress < 100) return <Clock className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  const handleAssignmentComplete = () => {
    fetchIdeasForAssignment();
    setSelectedIdea(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {language === 'ar' ? 'إدارة تعيين المُقيمين' : 'Evaluator Assignment Management'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'ar' 
            ? 'تعيين المُقيمين للأفكار المُرسلة ومتابعة تقدم التقييم' 
            : 'Assign evaluators to submitted ideas and track evaluation progress'}
        </p>
      </div>

      {ideas.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">
              {language === 'ar' ? 'لا توجد أفكار تحتاج لتعيين مُقيمين' : 'No ideas need evaluator assignment'}
            </p>
            <p className="text-muted-foreground">
              {language === 'ar' 
                ? 'جميع الأفكار المُرسلة تم تعيين مُقيمين لها' 
                : 'All submitted ideas have been assigned evaluators'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {ideas.map((idea) => {
            const progress = idea.progress_data?.progress_percentage || 0;
            const totalAssigned = idea.progress_data?.total_assigned || 0;
            const missingTypes = idea.progress_data?.missing_types || [];

            return (
              <Card key={idea.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">
                        {idea.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {idea.description}
                      </CardDescription>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {idea.idea_reference_code}
                        </Badge>
                        <Badge variant="secondary">
                          {idea.category?.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className={`flex items-center space-x-2 ${getStatusColor(progress)}`}>
                        {getStatusIcon(progress)}
                        <span className="font-medium">
                          {totalAssigned}/3 {language === 'ar' ? 'مُعين' : 'Assigned'}
                        </span>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => setSelectedIdea(idea)}
                        className="flex items-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>
                          {language === 'ar' ? 'تعيين مُقيمين' : 'Assign Evaluators'}
                        </span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {language === 'ar' ? 'تقدم التعيين' : 'Assignment Progress'}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {totalAssigned > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          {language === 'ar' ? 'المُقيمون المُعينون' : 'Assigned Evaluators'}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {idea.assignments?.map((assignment) => (
                            <Badge key={assignment.id} variant="default" className="flex items-center space-x-2">
                              <span>{assignment.evaluation_type}</span>
                              <span>-</span>
                              <span>{assignment.evaluator?.full_name}</span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {missingTypes.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 text-yellow-600">
                          {language === 'ar' ? 'الأنواع المطلوبة' : 'Missing Evaluation Types'}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {missingTypes.map((type) => (
                            <Badge key={type} variant="outline" className="text-yellow-600 border-yellow-600">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {selectedIdea && (
        <EvaluatorAssignmentModal
          idea={selectedIdea}
          isOpen={!!selectedIdea}
          onClose={() => setSelectedIdea(null)}
          onAssignmentComplete={handleAssignmentComplete}
        />
      )}
    </div>
  );
};