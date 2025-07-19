import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Edit, Save, X, BarChart3 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

type Profile = Tables<"profiles">;
type EvaluationTypes = "technology" | "finance" | "commercial";

interface EvaluatorWithStats extends Profile {
  activeAssignments: number;
  completedEvaluations: number;
  avgCompletionTime: number;
}

interface EvaluatorPoolManagementProps {
  profile: Profile;
}

export const EvaluatorPoolManagement = ({ profile }: EvaluatorPoolManagementProps) => {
  const [evaluators, setEvaluators] = useState<EvaluatorWithStats[]>([]);
  const [editingEvaluator, setEditingEvaluator] = useState<string | null>(null);
  const [editingSpecializations, setEditingSpecializations] = useState<EvaluationTypes[]>([]);
  const [editingRole, setEditingRole] = useState<'evaluator' | 'management'>('evaluator');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const evaluationTypes: EvaluationTypes[] = ["technology", "finance", "commercial"];

  useEffect(() => {
    fetchEvaluators();
  }, []);

  const fetchEvaluators = async () => {
    try {
      // Fetch all evaluators and management users
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .in("role", ["evaluator", "management"])
        .order("full_name");

      if (error) throw error;

      // Get statistics for each evaluator
      const evaluatorsWithStats = await Promise.all(
        (profiles || []).map(async (profile) => {
          // Get active assignments
          const { data: assignments, error: assignmentsError } = await supabase
            .from("evaluator_assignments")
            .select("id")
            .eq("evaluator_id", profile.id)
            .eq("is_active", true);

          // Get completed evaluations
          const { data: evaluations, error: evaluationsError } = await supabase
            .from("evaluations")
            .select("id, created_at, updated_at")
            .eq("evaluator_id", profile.id)
            .not("overall_score", "is", null);

          if (assignmentsError) {
            console.error("Error fetching assignments for evaluator:", profile.id, assignmentsError);
          }
          if (evaluationsError) {
            console.error("Error fetching evaluations for evaluator:", profile.id, evaluationsError);
          }

          // Calculate average completion time (simplified)
          const avgCompletionTime = evaluations?.length 
            ? Math.round(evaluations.reduce((acc, evaluation) => {
                const completionTime = new Date(evaluation.updated_at).getTime() - new Date(evaluation.created_at).getTime();
                return acc + (completionTime / (1000 * 60 * 60 * 24)); // Convert to days
              }, 0) / evaluations.length)
            : 0;

          return {
            ...profile,
            activeAssignments: assignments?.length || 0,
            completedEvaluations: evaluations?.length || 0,
            avgCompletionTime
          };
        })
      );

      setEvaluators(evaluatorsWithStats);
    } catch (error) {
      console.error("Error fetching evaluators:", error);
      toast({
        title: "Error",
        description: "Failed to load evaluator pool",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvaluator = (evaluator: EvaluatorWithStats) => {
    setEditingEvaluator(evaluator.id);
    setEditingSpecializations(evaluator.specialization || []);
    setEditingRole(evaluator.role as 'evaluator' | 'management');
  };

  const handleSpecializationChange = (type: EvaluationTypes, checked: boolean) => {
    if (checked) {
      setEditingSpecializations(prev => [...prev, type]);
    } else {
      setEditingSpecializations(prev => prev.filter(t => t !== type));
    }
  };

  const handleSaveEvaluator = async (evaluatorId: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          specialization: editingSpecializations,
          role: editingRole
        })
        .eq("id", evaluatorId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Evaluator profile updated successfully",
      });

      setEditingEvaluator(null);
      fetchEvaluators(); // Refresh the list
    } catch (error) {
      console.error("Error updating evaluator:", error);
      toast({
        title: "Error",
        description: "Failed to update evaluator profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingEvaluator(null);
    setEditingSpecializations([]);
    setEditingRole('evaluator');
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
          {language === 'ar' ? 'إدارة مجموعة المُقيمين' : 'Evaluator Pool Management'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'ar' 
            ? 'إدارة تخصصات المُقيمين ومراجعة إحصائيات الأداء' 
            : 'Manage evaluator specializations and review performance statistics'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'ar' ? 'إجمالي المُقيمين' : 'Total Evaluators'}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{evaluators.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'ar' ? 'المهام النشطة' : 'Active Assignments'}
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {evaluators.reduce((sum, e) => sum + e.activeAssignments, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'ar' ? 'التقييمات المكتملة' : 'Completed Evaluations'}
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {evaluators.reduce((sum, e) => sum + e.completedEvaluations, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {evaluators.map((evaluator) => {
          const isEditing = editingEvaluator === evaluator.id;

          return (
            <Card key={evaluator.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <CardTitle className="flex items-center space-x-2">
                      <span>{evaluator.full_name || evaluator.email}</span>
                      <Badge variant={evaluator.role === 'management' ? 'default' : 'secondary'}>
                        {evaluator.role}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {evaluator.email}
                      {evaluator.department && ` • ${evaluator.department}`}
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!isEditing ? (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditEvaluator(evaluator)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    ) : (
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleSaveEvaluator(evaluator.id)}
                          disabled={saving}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Performance Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {evaluator.activeAssignments}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {language === 'ar' ? 'مهام نشطة' : 'Active Tasks'}
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {evaluator.completedEvaluations}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {language === 'ar' ? 'مكتملة' : 'Completed'}
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {evaluator.avgCompletionTime}d
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {language === 'ar' ? 'متوسط الوقت' : 'Avg Time'}
                      </div>
                    </div>
                  </div>

                  {/* Role Selection (when editing) */}
                  {isEditing && (
                    <div>
                      <label className="text-sm font-medium">
                        {language === 'ar' ? 'الدور' : 'Role'}
                      </label>
                      <Select value={editingRole} onValueChange={(value: any) => setEditingRole(value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="evaluator">Evaluator</SelectItem>
                          <SelectItem value="management">Management</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Specializations */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">
                      {language === 'ar' ? 'التخصصات' : 'Specializations'}
                    </h4>
                    
                    {isEditing ? (
                      <div className="space-y-2">
                        {evaluationTypes.map((type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${evaluator.id}-${type}`}
                              checked={editingSpecializations.includes(type)}
                              onCheckedChange={(checked) => 
                                handleSpecializationChange(type, checked as boolean)
                              }
                            />
                            <label htmlFor={`${evaluator.id}-${type}`} className="capitalize">
                              {type}
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {evaluator.specialization && evaluator.specialization.length > 0 ? (
                          evaluator.specialization.map((spec) => (
                            <Badge key={spec} variant="default">
                              {spec}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            {language === 'ar' ? 'لا يوجد تخصص' : 'No specializations'}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {evaluators.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">
              {language === 'ar' ? 'لا يوجد مُقيمين' : 'No evaluators found'}
            </p>
            <p className="text-muted-foreground">
              {language === 'ar' 
                ? 'لم يتم العثور على أي مُقيمين في النظام' 
                : 'No evaluators found in the system'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};