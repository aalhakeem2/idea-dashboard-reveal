import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, CheckCircle, AlertCircle } from "lucide-react";

type Idea = Tables<"ideas">;
type Profile = Tables<"profiles">;
type EvaluationTypes = "technology" | "finance" | "commercial";

interface EvaluatorAssignmentModalProps {
  idea: Idea;
  isOpen: boolean;
  onClose: () => void;
  onAssignmentComplete: () => void;
}

interface EvaluatorOption {
  id: string;
  name: string;
  specialization: EvaluationTypes[];
  currentWorkload: number;
}

export const EvaluatorAssignmentModal = ({ 
  idea, 
  isOpen, 
  onClose, 
  onAssignmentComplete 
}: EvaluatorAssignmentModalProps) => {
  const [evaluators, setEvaluators] = useState<EvaluatorOption[]>([]);
  const [selectedEvaluators, setSelectedEvaluators] = useState<{
    technology?: string;
    finance?: string;
    commercial?: string;
  }>({});
  const [currentAssignments, setCurrentAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const evaluationTypes: EvaluationTypes[] = ["technology", "finance", "commercial"];

  useEffect(() => {
    if (isOpen) {
      fetchEvaluators();
      fetchCurrentAssignments();
    }
  }, [isOpen, idea.id]);

  const fetchEvaluators = async () => {
    setLoading(true);
    try {
      // Fetch all evaluators and management users
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .in("role", ["evaluator", "management"]);

      if (error) throw error;

      // Get workload for each evaluator
      const evaluatorOptions = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: assignments, error: workloadError } = await supabase
            .from("evaluator_assignments")
            .select("id")
            .eq("evaluator_id", profile.id)
            .eq("is_active", true);

          if (workloadError) {
            console.error("Error fetching workload for evaluator:", profile.id, workloadError);
          }

          return {
            id: profile.id,
            name: profile.full_name || profile.email || 'Unknown',
            specialization: profile.specialization || [],
            currentWorkload: assignments?.length || 0
          };
        })
      );

      setEvaluators(evaluatorOptions);
    } catch (error) {
      console.error("Error fetching evaluators:", error);
      toast({
        title: "Error",
        description: "Failed to load evaluators",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentAssignments = async () => {
    try {
      const { data: assignments, error } = await supabase
        .from("evaluator_assignments")
        .select("*")
        .eq("idea_id", idea.id)
        .eq("is_active", true);

      if (error) throw error;

      setCurrentAssignments(assignments || []);

      // Pre-populate selected evaluators
      const current: any = {};
      assignments?.forEach((assignment) => {
        current[assignment.evaluation_type] = assignment.evaluator_id;
      });
      setSelectedEvaluators(current);
    } catch (error) {
      console.error("Error fetching current assignments:", error);
    }
  };

  const getAvailableEvaluators = (type: EvaluationTypes) => {
    const alreadyAssigned = Object.values(selectedEvaluators).filter(Boolean);
    
    return evaluators.filter(evaluator => {
      // Check if evaluator has specialization in this type
      const hasSpecialization = evaluator.specialization.includes(type);
      
      // Check if not already assigned to another role for this idea
      const notAlreadyAssigned = !alreadyAssigned.includes(evaluator.id) || 
                                selectedEvaluators[type] === evaluator.id;
      
      return hasSpecialization && notAlreadyAssigned;
    }).sort((a, b) => a.currentWorkload - b.currentWorkload); // Sort by workload
  };

  const handleEvaluatorChange = (type: EvaluationTypes, evaluatorId: string) => {
    setSelectedEvaluators(prev => ({
      ...prev,
      [type]: evaluatorId === "none" ? undefined : evaluatorId
    }));
  };

  const handleSaveAssignments = async () => {
    setSaving(true);
    try {
      // First, deactivate all existing assignments for this idea
      const { error: deactivateError } = await supabase
        .from("evaluator_assignments")
        .update({ is_active: false })
        .eq("idea_id", idea.id);

      if (deactivateError) throw deactivateError;

      // Create new assignments
      const newAssignments = [];
      for (const [type, evaluatorId] of Object.entries(selectedEvaluators)) {
        if (evaluatorId) {
          newAssignments.push({
            idea_id: idea.id,
            evaluator_id: evaluatorId,
            evaluation_type: type,
            assigned_by: (await supabase.auth.getUser()).data.user?.id,
            is_active: true
          });
        }
      }

      if (newAssignments.length > 0) {
        const { error: insertError } = await supabase
          .from("evaluator_assignments")
          .insert(newAssignments);

        if (insertError) throw insertError;
      }

      // Log the action
      await supabase.rpc("log_idea_action", {
        p_idea_id: idea.id,
        p_action_type: "evaluator_assigned",
        p_action_detail: `Assigned ${newAssignments.length} evaluators: ${Object.keys(selectedEvaluators).join(", ")}`
      });

      toast({
        title: "Success",
        description: "Evaluator assignments saved successfully",
      });

      onAssignmentComplete();
    } catch (error) {
      console.error("Error saving assignments:", error);
      toast({
        title: "Error",
        description: "Failed to save evaluator assignments",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const isAssignmentComplete = () => {
    return evaluationTypes.every(type => selectedEvaluators[type]);
  };

  const getAssignmentStatus = () => {
    const assigned = Object.values(selectedEvaluators).filter(Boolean).length;
    return `${assigned}/3`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>
              {language === 'ar' ? 'تعيين المُقيمين' : 'Assign Evaluators'}
            </span>
          </DialogTitle>
          <DialogDescription>
            {language === 'ar' 
              ? 'تعيين ثلاثة مُقيمين مختصين لتقييم هذه الفكرة' 
              : 'Assign three specialized evaluators to assess this idea'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Idea Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{idea.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {idea.description}
              </CardDescription>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{idea.idea_reference_code}</Badge>
                <Badge variant="secondary">{idea.category?.replace('_', ' ')}</Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Assignment Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  {language === 'ar' ? 'حالة التعيين' : 'Assignment Status'}
                </span>
                <div className="flex items-center space-x-2">
                  {isAssignmentComplete() ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  )}
                  <span className="font-medium">{getAssignmentStatus()}</span>
                </div>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Evaluator Assignments */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {language === 'ar' ? 'تعيين المُقيمين حسب التخصص' : 'Evaluator Assignment by Specialization'}
            </h3>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading evaluators...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {evaluationTypes.map((type) => {
                  const availableEvaluators = getAvailableEvaluators(type);
                  const selectedEvaluator = evaluators.find(e => e.id === selectedEvaluators[type]);

                  return (
                    <Card key={type}>
                      <CardHeader>
                        <CardTitle className="text-base capitalize">
                          {type} {language === 'ar' ? 'التقييم' : 'Evaluation'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Select 
                          value={selectedEvaluators[type] || "none"}
                          onValueChange={(value) => handleEvaluatorChange(type, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={
                              language === 'ar' ? 'اختر مُقيم' : 'Select evaluator'
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">
                              {language === 'ar' ? 'لا يوجد' : 'None'}
                            </SelectItem>
                            {availableEvaluators.map((evaluator) => (
                              <SelectItem key={evaluator.id} value={evaluator.id}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{evaluator.name}</span>
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    {evaluator.currentWorkload} {language === 'ar' ? 'مهام' : 'tasks'}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {selectedEvaluator && (
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="font-medium">{selectedEvaluator.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {language === 'ar' ? 'المهام الحالية:' : 'Current workload:'} {selectedEvaluator.currentWorkload}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {selectedEvaluator.specialization.map((spec) => (
                                <Badge key={spec} variant="secondary" className="text-xs">
                                  {spec}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {availableEvaluators.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            {language === 'ar' 
                              ? 'لا يوجد مُقيمين متاحين لهذا التخصص' 
                              : 'No evaluators available for this specialization'}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={onClose}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button 
              onClick={handleSaveAssignments}
              disabled={saving || Object.keys(selectedEvaluators).length === 0}
              className="flex items-center space-x-2"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>
                {saving 
                  ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') 
                  : (language === 'ar' ? 'حفظ التعيينات' : 'Save Assignments')
                }
              </span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};