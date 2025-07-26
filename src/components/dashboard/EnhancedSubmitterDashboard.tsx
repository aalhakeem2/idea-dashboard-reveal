
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
import { AdvancedSearchFilter } from "./AdvancedSearchFilter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSearchFilter } from "@/contexts/SearchFilterContext";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type Idea = Tables<"ideas">;

interface EnhancedSubmitterDashboardProps {
  profile: Profile;
  activeView: string;
}

export const EnhancedSubmitterDashboard: React.FC<EnhancedSubmitterDashboardProps> = ({ profile, activeView }) => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [allIdeas, setAllIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [statusLogs, setStatusLogs] = useState([]);
  const [actionLogs, setActionLogs] = useState([]);
  const { t, language } = useLanguage();
  const { filteredData, setData, searchTerm, filters } = useSearchFilter();

  console.log("EnhancedSubmitterDashboard: activeView:", activeView);

  // Handle submit-idea navigation
  useEffect(() => {
    if (activeView === "submit-idea") {
      console.log("EnhancedSubmitterDashboard: Activating form for submit-idea");
      setShowForm(true);
    } else {
      setShowForm(false);
    }
  }, [activeView]);

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

  const fetchAllIdeas = async () => {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('is_active', true)
        .eq('is_draft', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllIdeas(data || []);
    } catch (error) {
      console.error('Error fetching all ideas:', error);
    }
  };

  const fetchIdeaLogs = async (ideaId: string) => {
    try {
      // Fetch status logs with proper join
      const { data: statusData, error: statusError } = await supabase
        .from('idea_status_log')
        .select(`
          *,
          user_profile:profiles!idea_status_log_changed_by_fkey(full_name)
        `)
        .eq('idea_id', ideaId)
        .order('timestamp', { ascending: false });

      if (statusError) {
        console.error('Status log error:', statusError);
        // Fallback: fetch without join
        const { data: fallbackData } = await supabase
          .from('idea_status_log')
          .select('*')
          .eq('idea_id', ideaId)
          .order('timestamp', { ascending: false });
        setStatusLogs(fallbackData || []);
      } else {
        setStatusLogs(statusData || []);
      }

      // Fetch action logs with proper join
      const { data: actionData, error: actionError } = await supabase
        .from('idea_action_log')
        .select(`
          *,
          user_profile:profiles!idea_action_log_performed_by_fkey(full_name)
        `)
        .eq('idea_id', ideaId)
        .order('timestamp', { ascending: false });

      if (actionError) {
        console.error('Action log error:', actionError);
        // Fallback: fetch without join
        const { data: fallbackData } = await supabase
          .from('idea_action_log')
          .select('*')
          .eq('idea_id', ideaId)
          .order('timestamp', { ascending: false });
        setActionLogs(fallbackData || []);
      } else {
        setActionLogs(actionData || []);
      }
    } catch (error) {
      console.error('Error fetching idea logs:', error);
    }
  };

  useEffect(() => {
    fetchIdeas();
    if (activeView === 'ideas') {
      fetchAllIdeas();
    }
  }, [profile.id, activeView]);

  // Update search filter context when data changes
  useEffect(() => {
    if (activeView === 'ideas') {
      setData(allIdeas);
    } else {
      setData(ideas);
    }
  }, [ideas, allIdeas, activeView, setData]);

  useEffect(() => {
    if (selectedIdea) {
      fetchIdeaLogs(selectedIdea.id);
    }
  }, [selectedIdea]);

  const handleIdeaSubmitted = () => {
    setShowForm(false);
    setSelectedIdea(null);
    fetchIdeas();
  };

  const handleEditDraft = (idea: Idea) => {
    setSelectedIdea(idea);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedIdea(null);
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

  // Show form when activeView is submit-idea or showForm is true
  if (showForm || activeView === "submit-idea") {
    return (
      <IdeaSubmissionForm 
        profile={profile} 
        onIdeaSubmitted={handleIdeaSubmitted}
        editingIdea={selectedIdea}
      />
    );
  }

  // Render based on active view
  const renderContent = () => {
    console.log("EnhancedSubmitterDashboard: Rendering content for activeView:", activeView);
    
    switch (activeView) {
      case "dashboard":
        return renderDashboardView();
      case "ideas":
        return renderAllIdeasView();
      case "my-ideas":
        return renderMyIdeasView();
      default:
        return renderDashboardView();
    }
  };

  const statusCounts = getStatusCounts();
  const submittedIdeas = getSubmittedIdeas();
  const totalSubmittedIdeas = submittedIdeas.length;
  const draftCount = getDraftCount();

  const renderDashboardView = () => (
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
              {language === 'ar' ? 'قيد المراجعة والتقييم' : 'Under Review & Evaluation'}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(statusCounts['submitted'] || 0) + (statusCounts['under_review'] || 0) + (statusCounts['under_evaluation'] || 0) + (statusCounts['evaluated'] || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {language === 'ar' ? 'بما في ذلك المُقيمة في انتظار القرار' : 'Including evaluated awaiting decision'}
            </p>
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
    </div>
  );

  const renderAllIdeasView = () => {
    const displayData = activeView === 'ideas' ? filteredData : allIdeas;
    
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            {language === 'ar' ? 'جميع الأفكار' : 'All Ideas'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ar' ? 'تصفح جميع الأفكار المُرسلة في النظام' : 'Browse all submitted ideas in the system'}
          </p>
        </div>

        {/* Search and Filter */}
        <AdvancedSearchFilter
          onFiltersChange={() => {}} // Handled by context
          onSearch={() => {}} // Handled by context
          placeholder={language === 'ar' ? 'البحث في الأفكار...' : 'Search ideas...'}
        />

        {loading ? (
          <div className="text-center py-8">
            {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </div>
        ) : displayData.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p>{searchTerm || Object.values(filters).some(f => f && f.length > 0) 
                ? (language === 'ar' ? 'لا توجد نتائج' : 'No results found')
                : (language === 'ar' ? 'لا توجد أفكار متاحة' : 'No ideas available')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {displayData.map((idea) => (
              <IdeaCard 
                key={idea.id} 
                idea={idea} 
                detailed 
                showTimeline={true}
                onViewActivity={() => setSelectedIdea(idea)}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderMyIdeasView = () => {
    const displayData = activeView === 'my-ideas' ? filteredData : submittedIdeas;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {language === 'ar' ? 'أفكاري' : 'My Ideas'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'ar' ? 'إدارة جميع أفكاري المُرسلة والمسودات' : 'Manage all my submitted ideas and drafts'}
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {language === 'ar' ? 'فكرة جديدة' : 'New Idea'}
          </Button>
        </div>

        <Tabs defaultValue="submitted" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="submitted" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              {language === 'ar' ? 'المُرسلة' : 'Submitted'}
            </TabsTrigger>
            <TabsTrigger value="drafts" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {language === 'ar' ? 'المسودات' : 'Drafts'}
              {draftCount > 0 && <Badge variant="secondary">{draftCount}</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="submitted" className="space-y-6">
            {/* Search and Filter for My Ideas */}
            <AdvancedSearchFilter
              onFiltersChange={() => {}} // Handled by context
              onSearch={() => {}} // Handled by context
              placeholder={language === 'ar' ? 'البحث في أفكاري...' : 'Search my ideas...'}
            />

            {loading ? (
              <div className="text-center py-8">
                {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
              </div>
            ) : displayData.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{searchTerm || Object.values(filters).some(f => f && f.length > 0) 
                    ? (language === 'ar' ? 'لا توجد نتائج' : 'No results found')
                    : (language === 'ar' ? 'لا توجد أفكار مُرسلة' : 'No submitted ideas yet')}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {displayData.map((idea) => (
                  <IdeaCard 
                    key={idea.id} 
                    idea={idea} 
                    detailed 
                    showTimeline={true}
                    onViewActivity={(idea) => setSelectedIdea(idea)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="drafts">
            <DraftManagement 
              userId={profile.id} 
              onEditDraft={handleEditDraft}
              onRefresh={fetchIdeas}
            />
          </TabsContent>
        </Tabs>

        {/* Activity Timeline for Selected Idea */}
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
  };

  return renderContent();
};
