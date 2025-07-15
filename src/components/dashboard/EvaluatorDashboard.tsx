import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Star, TrendingUp, Users, Activity } from "lucide-react";
import { IdeaCard } from "./IdeaCard";
import { IdeaTimeline } from "./IdeaTimeline";
import { IdeaActionLog } from "./IdeaActionLog";
import { IdeaFileViewer } from "./IdeaFileViewer";
import { useLanguage } from "@/contexts/LanguageContext";

type Profile = Tables<"profiles">;
type Idea = Tables<"ideas">;

interface EvaluatorDashboardProps {
  profile: Profile;
  activeView: string;
}

export const EvaluatorDashboard = ({ profile, activeView }: EvaluatorDashboardProps) => {
  const [pendingIdeas, setPendingIdeas] = useState<Idea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [statusLogs, setStatusLogs] = useState([]);
  const [actionLogs, setActionLogs] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    evaluated: 0,
    avgScore: 0,
    topRated: 0,
  });
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    fetchPendingIdeas();
    fetchEvaluatorStats();
  }, [profile.id]);

  useEffect(() => {
    if (selectedIdea) {
      fetchIdeaLogs(selectedIdea.id);
    }
  }, [selectedIdea]);

  const fetchPendingIdeas = async () => {
    try {
      const { data, error } = await supabase
        .from("ideas")
        .select("*")
        .in("status", ["submitted", "under_review"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPendingIdeas(data || []);
    } catch (error) {
      console.error("Error fetching pending ideas:", error);
    }
  };

  const fetchEvaluatorStats = async () => {
    try {
      const { data: evaluations, error } = await supabase
        .from("evaluations")
        .select("*")
        .eq("evaluator_id", profile.id);

      if (error) throw error;

      const avgScore = evaluations?.length 
        ? evaluations.reduce((sum, evaluation) => sum + (evaluation.overall_score || 0), 0) / evaluations.length
        : 0;

      const topRated = evaluations?.filter(evaluation => (evaluation.overall_score || 0) >= 8).length || 0;

      setStats({
        pending: pendingIdeas.length,
        evaluated: evaluations?.length || 0,
        avgScore: Math.round(avgScore * 10) / 10,
        topRated,
      });
    } catch (error) {
      console.error("Error fetching evaluator stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchIdeaLogs = async (ideaId: string) => {
    try {
      // Fetch status logs
      const { data: statusData, error: statusError } = await supabase
        .from('idea_status_log')
        .select(`
          *,
          profiles:changed_by(full_name)
        `)
        .eq('idea_id', ideaId)
        .order('timestamp', { ascending: false });

      if (statusError) throw statusError;

      // Fetch action logs
      const { data: actionData, error: actionError } = await supabase
        .from('idea_action_log')
        .select(`
          *,
          profiles:performed_by(full_name)
        `)
        .eq('idea_id', ideaId)
        .order('timestamp', { ascending: false });

      if (actionError) throw actionError;

      setStatusLogs(statusData || []);
      setActionLogs(actionData || []);
    } catch (error) {
      console.error('Error fetching idea logs:', error);
    }
  };

  const renderDashboardOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Evaluated</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.evaluated}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Score Given</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.avgScore}/10</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Rated Ideas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.topRated}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Evaluations</CardTitle>
          <CardDescription>Ideas waiting for your review</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : pendingIdeas.length > 0 ? (
            <div className="space-y-4">
              {pendingIdeas.slice(0, 5).map((idea) => (
                <div key={idea.id} className="space-y-4">
                  <IdeaCard 
                    idea={idea} 
                    detailed 
                    showTimeline={true}
                    onViewActivity={(idea) => setSelectedIdea(idea)}
                  />
                  <IdeaFileViewer 
                    ideaId={idea.id} 
                    title={`Attachments for: ${idea.title}`}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ClipboardCheck className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No pending evaluations</h3>
              <p className="mt-1 text-sm text-gray-500">All ideas have been reviewed.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedIdea && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {language === 'ar' ? 'سجل النشاط للفكرة:' : 'Activity Log for Idea:'} {selectedIdea.title}
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedIdea(null)}
              >
                {language === 'ar' ? 'إغلاق' : 'Close'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <IdeaTimeline statusLogs={statusLogs} currentStatus={selectedIdea.status} />
              <IdeaActionLog actionLogs={actionLogs} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return renderDashboardOverview();
};
