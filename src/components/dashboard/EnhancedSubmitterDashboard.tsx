import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbulb, Plus, TrendingUp, Clock, CheckCircle, XCircle, FileText, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { IdeaSubmissionForm } from "./IdeaSubmissionForm";
import { IdeaCard } from "./IdeaCard";
import { DraftManagement } from "./DraftManagement";
import { IdeaTimeline } from "./IdeaTimeline";
import { IdeaActionLog } from "./IdeaActionLog";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type Idea = Tables<"ideas">;

interface EnhancedSubmitterDashboardProps {
  profile: Profile;
}

export const EnhancedSubmitterDashboard: React.FC<EnhancedSubmitterDashboardProps> = ({ profile }) => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [activeView, setActiveView] = useState('overview');
  const [statusLogs, setStatusLogs] = useState([]);
  const [actionLogs, setActionLogs] = useState([]);
  const { t, language } = useLanguage();

  const fetchIdeas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('submitter_id', profile.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIdeas(data || []);
    } catch (error) {
      console.error('Error fetching ideas:', error);
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

  useEffect(() => {
    fetchIdeas();
  }, [profile.id]);

  useEffect(() => {
    if (selectedIdea) {
      fetchIdeaLogs(selectedIdea.id);
    }
  }, [selectedIdea]);

  const handleIdeaSubmitted = () => {
    setShowForm(false);
    fetchIdeas();
  };

  const handleEditDraft = (idea: Idea) => {
    setSelectedIdea(idea);
    setShowForm(true);
  };

  const getStatusCounts = () => {
    const submittedIdeas = ideas.filter(idea => !idea.is_draft);
    return submittedIdeas.reduce((counts, idea) => {
      counts[idea.status] = (counts[idea.status] || 0) + 1;
      return counts;
    }, {} as { [key: string]: number });
  };

  const getDraftCount = () => {
    return ideas.filter(idea => idea.is_draft).length;
  };

  const getSubmittedIdeas = () => {
    return ideas.filter(idea => !idea.is_draft);
  };

  if (showForm) {
    return <IdeaSubmissionForm profile={profile} onIdeaSubmitted={handleIdeaSubmitted} />;
  }

  const statusCounts = getStatusCounts();
  const submittedIdeas = getSubmittedIdeas();
  const totalSubmittedIdeas = submittedIdeas.length;
  const draftCount = getDraftCount();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {language === 'ar' ? 'لوحة تحكم مقدم الأفكار' : 'Submitter Dashboard'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'ar' ? 'إدارة أفكارك المبتكرة' : 'Manage your innovative ideas'}
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {language === 'ar' ? 'فكرة جديدة' : 'New Idea'}
        </Button>
      </div>

      {/* Main Content */}
      <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {language === 'ar' ? 'نظرة عامة' : 'Overview'}
          </TabsTrigger>
          <TabsTrigger value="drafts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {language === 'ar' ? 'المسودات' : 'Drafts'}
            {draftCount > 0 && <Badge variant="secondary">{draftCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="submitted" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            {language === 'ar' ? 'المُرسلة' : 'Submitted'}
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            {language === 'ar' ? 'النشاط' : 'Activity'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {language === 'ar' ? 'إجمالي الأفكار' : 'Total Ideas'}
                </CardTitle>
                <Lightbulb className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSubmittedIdeas}</div>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? `${draftCount} مسودات` : `${draftCount} drafts`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {language === 'ar' ? 'قيد المراجعة' : 'Under Review'}
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(statusCounts['submitted'] || 0) + (statusCounts['under_review'] || 0) + (statusCounts['under_evaluation'] || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {language === 'ar' ? 'موافق عليها' : 'Approved'}
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {statusCounts['approved'] || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {language === 'ar' ? 'معدل النجاح' : 'Success Rate'}
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalSubmittedIdeas > 0 
                    ? Math.round(((statusCounts['approved'] || 0) / totalSubmittedIdeas) * 100) 
                    : 0}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Ideas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                {language === 'ar' ? 'أفكاري الأخيرة' : 'Recent Ideas'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                </div>
              ) : submittedIdeas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">
                    {language === 'ar' ? 'لا توجد أفكار مُرسلة بعد' : 'No submitted ideas yet'}
                  </p>
                  <p className="mb-4">
                    {language === 'ar' 
                      ? 'ابدأ بإرسال فكرتك الأولى!' 
                      : 'Start by submitting your first idea!'
                    }
                  </p>
                  <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    {language === 'ar' ? 'فكرة جديدة' : 'New Idea'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {submittedIdeas.slice(0, 5).map((idea) => (
                    <IdeaCard 
                      key={idea.id} 
                      idea={idea} 
                      showTimeline={true}
                      onViewActivity={(idea) => {
                        setSelectedIdea(idea);
                        setActiveView('timeline');
                      }}
                    />
                  ))}
                  {submittedIdeas.length > 5 && (
                    <div className="text-center pt-4">
                      <p className="text-sm text-muted-foreground">
                        {language === 'ar' 
                          ? `و ${submittedIdeas.length - 5} أفكار أخرى` 
                          : `And ${submittedIdeas.length - 5} more ideas`
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drafts">
          <DraftManagement 
            userId={profile.id} 
            onEditDraft={handleEditDraft}
            onRefresh={fetchIdeas}
          />
        </TabsContent>

        <TabsContent value="submitted" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                {language === 'ar' ? 'أفكاري المُرسلة' : 'My Submitted Ideas'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                </div>
              ) : submittedIdeas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{language === 'ar' ? 'لا توجد أفكار مُرسلة' : 'No submitted ideas yet'}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submittedIdeas.map((idea) => (
                    <IdeaCard 
                      key={idea.id} 
                      idea={idea} 
                      detailed 
                      showTimeline={true}
                      onViewActivity={(idea) => {
                        setSelectedIdea(idea);
                        setActiveView('timeline');
                      }}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          {selectedIdea ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {language === 'ar' ? 'سجل النشاط للفكرة:' : 'Activity Log for Idea:'} {selectedIdea.title}
                </h2>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedIdea(null)}
                >
                  {language === 'ar' ? 'رجوع' : 'Back'}
                </Button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <IdeaTimeline statusLogs={statusLogs} currentStatus={selectedIdea.status} />
                <IdeaActionLog actionLogs={actionLogs} />
              </div>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'ar' ? 'سجل النشاط' : 'Activity Timeline'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>
                    {language === 'ar' 
                      ? 'اختر فكرة لعرض سجل النشاط' 
                      : 'Select an idea to view activity timeline'
                    }
                  </p>
                </div>
                
                {submittedIdeas.length > 0 && (
                  <div className="mt-6 space-y-2">
                    <h3 className="font-medium mb-3">
                      {language === 'ar' ? 'اختر فكرة:' : 'Select an idea:'}
                    </h3>
                    {submittedIdeas.map((idea) => (
                      <div 
                        key={idea.id}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => setSelectedIdea(idea)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{idea.title}</span>
                          <Badge variant="outline">{idea.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};