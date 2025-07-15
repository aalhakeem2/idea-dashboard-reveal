import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Send, FileText, Clock } from "lucide-react";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Idea = Tables<"ideas">;

interface DraftManagementProps {
  userId: string;
  onEditDraft: (idea: Idea) => void;
  onRefresh: () => void;
}

export const DraftManagement: React.FC<DraftManagementProps> = ({ 
  userId, 
  onEditDraft, 
  onRefresh 
}) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [drafts, setDrafts] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrafts();
  }, [userId]);

  const fetchDrafts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('submitter_id', userId)
        .eq('is_draft', true)
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setDrafts(data || []);
    } catch (error) {
      console.error('Error fetching drafts:', error);
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' 
          ? "فشل في جلب المسودات" 
          : "Failed to fetch drafts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDraft = async (ideaId: string) => {
    try {
      const { error } = await supabase
        .from('ideas')
        .update({
          status: 'submitted',
          is_draft: false,
          submitted_at: new Date().toISOString()
        })
        .eq('id', ideaId);

      if (error) throw error;

      // Log the action
      await supabase.rpc('log_idea_action', {
        p_idea_id: ideaId,
        p_action_type: 'idea_submitted',
        p_action_detail: 'Idea submitted from draft'
      });

      toast({
        title: language === 'ar' ? "تم الإرسال" : "Submitted",
        description: language === 'ar' 
          ? "تم إرسال الفكرة بنجاح" 
          : "Idea submitted successfully",
      });

      fetchDrafts();
      onRefresh();
    } catch (error) {
      console.error('Error submitting draft:', error);
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' 
          ? "فشل في إرسال الفكرة" 
          : "Failed to submit idea",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDraft = async (ideaId: string) => {
    try {
      const { error } = await supabase
        .from('ideas')
        .update({ is_active: false })
        .eq('id', ideaId);

      if (error) throw error;

      // Log the action
      await supabase.rpc('log_idea_action', {
        p_idea_id: ideaId,
        p_action_type: 'idea_deleted',
        p_action_detail: 'Draft deleted by user'
      });

      toast({
        title: language === 'ar' ? "تم الحذف" : "Deleted",
        description: language === 'ar' 
          ? "تم حذف المسودة" 
          : "Draft deleted",
      });

      fetchDrafts();
      onRefresh();
    } catch (error) {
      console.error('Error deleting draft:', error);
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: language === 'ar' 
          ? "فشل في حذف المسودة" 
          : "Failed to delete draft",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {language === 'ar' ? '📝 مسوداتي' : '📝 My Drafts'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {language === 'ar' ? '📝 مسوداتي' : '📝 My Drafts'}
          <Badge variant="secondary">{drafts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {drafts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{language === 'ar' ? 'لا توجد مسودات' : 'No drafts yet'}</p>
            <p className="text-sm">
              {language === 'ar' 
                ? 'احفظ أفكارك كمسودات للعمل عليها لاحقاً' 
                : 'Save your ideas as drafts to work on them later'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {drafts.map((draft) => (
              <div key={draft.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium line-clamp-1">{draft.title}</h3>
                  <Badge variant="outline" className="ml-2">
                    {language === 'ar' ? 'مسودة' : 'Draft'}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {draft.description}
                </p>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <Clock className="h-3 w-3" />
                  <span>
                    {language === 'ar' ? 'آخر تحديث:' : 'Last updated:'} {' '}
                    {format(new Date(draft.updated_at!), 'MMM dd, yyyy')}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEditDraft(draft)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    {language === 'ar' ? 'تعديل' : 'Edit'}
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={() => handleSubmitDraft(draft.id)}
                    className="flex items-center gap-1"
                  >
                    <Send className="h-3 w-3" />
                    {language === 'ar' ? 'إرسال' : 'Submit'}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteDraft(draft.id)}
                    className="flex items-center gap-1 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                    {language === 'ar' ? 'حذف' : 'Delete'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};