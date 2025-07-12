import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Lightbulb, FileText, Star, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { IdeaCard } from "./IdeaCard";
import { IdeaSubmissionForm } from "./IdeaSubmissionForm";

type Profile = Tables<"profiles">;
type Idea = Tables<"ideas">;

interface EnhancedSubmitterDashboardProps {
  profile: Profile;
}

export const EnhancedSubmitterDashboard = ({ profile }: EnhancedSubmitterDashboardProps) => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { t, isRTL } = useLanguage();

  const fetchIdeas = async () => {
    try {
      const { data, error } = await supabase
        .from("ideas")
        .select("*")
        .eq("submitter_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setIdeas(data || []);
    } catch (error) {
      console.error("Error fetching ideas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, [profile.id]);

  const handleIdeaSubmitted = () => {
    setShowForm(false);
    fetchIdeas();
  };

  const getStatusCounts = () => {
    return {
      total: ideas.length,
      draft: ideas.filter(idea => idea.status === 'draft').length,
      submitted: ideas.filter(idea => idea.status === 'submitted').length,
      under_review: ideas.filter(idea => idea.status === 'under_review').length,
      approved: ideas.filter(idea => idea.status === 'approved').length,
      implemented: ideas.filter(idea => idea.status === 'implemented').length,
      rejected: ideas.filter(idea => idea.status === 'rejected').length,
    };
  };

  const statusCounts = getStatusCounts();

  if (showForm) {
    return (
      <IdeaSubmissionForm
        profile={profile}
        onIdeaSubmitted={handleIdeaSubmitted}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div>
          <h1 className={`text-3xl font-bold ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('dashboard', 'my_ideas_title')}
          </h1>
          <p className={`text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
            Manage and track your submitted ideas
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <Plus className="h-4 w-4" />
          Submit New Idea
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{statusCounts.total}</p>
                <p className="text-xs text-muted-foreground">Total Ideas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-2xl font-bold">{statusCounts.draft}</p>
                <p className="text-xs text-muted-foreground">Drafts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{statusCounts.submitted}</p>
                <p className="text-xs text-muted-foreground">Submitted</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-yellow-100 rounded flex items-center justify-center">
                <div className="w-2 h-2 bg-yellow-600 rounded"></div>
              </div>
              <div>
                <p className="text-2xl font-bold">{statusCounts.under_review}</p>
                <p className="text-xs text-muted-foreground">Under Review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-green-100 rounded flex items-center justify-center">
                <div className="w-2 h-2 bg-green-600 rounded"></div>
              </div>
              <div>
                <p className="text-2xl font-bold">{statusCounts.approved}</p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{statusCounts.implemented}</p>
                <p className="text-xs text-muted-foreground">Implemented</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-red-100 rounded flex items-center justify-center">
                <div className="w-2 h-2 bg-red-600 rounded"></div>
              </div>
              <div>
                <p className="text-2xl font-bold">{statusCounts.rejected}</p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ideas List */}
      <div>
        <h2 className={`text-xl font-semibold mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
          Your Ideas
        </h2>
        
        {loading ? (
          <div className="text-center py-8">Loading ideas...</div>
        ) : ideas.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">{t('dashboard', 'no_ideas_submitted')}</p>
              <p className="text-muted-foreground mb-4">
                {t('dashboard', 'start_submitting')}
              </p>
              <Button onClick={() => setShowForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Submit Your First Idea
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ideas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} detailed />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};