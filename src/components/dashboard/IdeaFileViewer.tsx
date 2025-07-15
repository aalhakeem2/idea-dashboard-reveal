import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploadField } from "./FileUploadField";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { FileText, Download } from "lucide-react";

interface IdeaFileViewerProps {
  ideaId: string;
  readOnly?: boolean;
  title?: string;
}

export const IdeaFileViewer = ({ ideaId, readOnly = true, title }: IdeaFileViewerProps) => {
  const [attachments, setAttachments] = useState<{
    feasibility: any[];
    pricing_offer: any[];
    prototype: any[];
  }>({
    feasibility: [],
    pricing_offer: [],
    prototype: []
  });
  const [loading, setLoading] = useState(true);
  const { t, isRTL } = useLanguage();

  useEffect(() => {
    loadAttachments();
  }, [ideaId]);

  const loadAttachments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('idea_attachments')
        .select('*')
        .eq('idea_id', ideaId);
        
      if (error) throw error;
      
      const groupedFiles = {
        feasibility: data?.filter(f => f.file_type === 'feasibility') || [],
        pricing_offer: data?.filter(f => f.file_type === 'pricing_offer') || [],
        prototype: data?.filter(f => f.file_type === 'prototype') || []
      };
      
      setAttachments(groupedFiles);
    } catch (error) {
      console.error("Error loading attachments:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalFiles = attachments.feasibility.length + attachments.pricing_offer.length + attachments.prototype.length;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className={isRTL ? 'text-right' : 'text-left'}>
            {title || t('idea_form', 'file_attachments')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading files...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (totalFiles === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className={isRTL ? 'text-right' : 'text-left'}>
            {title || t('idea_form', 'file_attachments')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground text-center">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No files attached to this idea</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className={isRTL ? 'text-right' : 'text-left'}>
          {title || t('idea_form', 'file_attachments')} ({totalFiles})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {attachments.feasibility.length > 0 && (
            <FileUploadField
              label={t('idea_form', 'feasibility_study')}
              fileType="feasibility"
              value={[]}
              onChange={() => {}}
              existingFiles={attachments.feasibility}
              readOnly={readOnly}
            />
          )}
          
          {attachments.pricing_offer.length > 0 && (
            <FileUploadField
              label={t('idea_form', 'pricing_offer')}
              fileType="pricing_offer"
              value={[]}
              onChange={() => {}}
              existingFiles={attachments.pricing_offer}
              readOnly={readOnly}
            />
          )}
          
          {attachments.prototype.length > 0 && (
            <FileUploadField
              label={t('idea_form', 'prototype_images')}
              fileType="prototype"
              value={[]}
              onChange={() => {}}
              existingFiles={attachments.prototype}
              readOnly={readOnly}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};