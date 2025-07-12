
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Lightbulb } from "lucide-react";
import { FileUploadField } from "./FileUploadField";
import { MultiSelectDropdown } from "./MultiSelectDropdown";
import { useListOfValues } from "@/hooks/useListOfValues";

type Profile = Tables<"profiles">;

interface IdeaSubmissionFormProps {
  profile: Profile;
  onIdeaSubmitted: () => void;
}

export const IdeaSubmissionForm = ({ profile, onIdeaSubmitted }: IdeaSubmissionFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    implementation_cost: "",
    expected_roi: "",
    strategic_alignment_score: "",
  });
  
  // File upload states
  const [feasibilityFiles, setFeasibilityFiles] = useState<File[]>([]);
  const [pricingFiles, setPricingFiles] = useState<File[]>([]);
  const [prototypeFiles, setPrototypeFiles] = useState<File[]>([]);
  
  // Strategic alignment multi-select
  const [strategicAlignment, setStrategicAlignment] = useState<string[]>([]);
  
  const { toast } = useToast();
  const { t, isRTL, language } = useLanguage();
  const { values: strategicAlignmentOptions, loading: lovLoading } = useListOfValues('strategic_alignment');

  const uploadFile = async (file: File, ideaId: string, fileType: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${ideaId}/${fileType}/${Date.now()}.${fileExt}`;
    
    // For now, we'll just return a placeholder URL since storage isn't set up
    return `placeholder-url/${fileName}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Insert the idea first
      const { data: ideaData, error: ideaError } = await supabase.from("ideas").insert({
        title: formData.title,
        description: formData.description,
        category: formData.category as any,
        submitter_id: profile.id,
        implementation_cost: formData.implementation_cost ? parseFloat(formData.implementation_cost) : null,
        expected_roi: formData.expected_roi ? parseFloat(formData.expected_roi) : null,
        strategic_alignment_score: formData.strategic_alignment_score ? parseInt(formData.strategic_alignment_score) : null,
        status: "draft",
        language: language,
      }).select().single();

      if (ideaError) throw ideaError;
      const ideaId = ideaData.id;

      // Upload files and create attachment records
      const attachmentPromises = [];

      for (const file of feasibilityFiles) {
        const fileUrl = await uploadFile(file, ideaId, 'feasibility');
        attachmentPromises.push(
          supabase.from("idea_attachments").insert({
            idea_id: ideaId,
            file_type: 'feasibility',
            file_name: file.name,
            file_url: fileUrl,
            uploaded_by: profile.id,
          })
        );
      }

      for (const file of pricingFiles) {
        const fileUrl = await uploadFile(file, ideaId, 'pricing_offer');
        attachmentPromises.push(
          supabase.from("idea_attachments").insert({
            idea_id: ideaId,
            file_type: 'pricing_offer',
            file_name: file.name,
            file_url: fileUrl,
            uploaded_by: profile.id,
          })
        );
      }

      for (const file of prototypeFiles) {
        const fileUrl = await uploadFile(file, ideaId, 'prototype');
        attachmentPromises.push(
          supabase.from("idea_attachments").insert({
            idea_id: ideaId,
            file_type: 'prototype',
            file_name: file.name,
            file_url: fileUrl,
            uploaded_by: profile.id,
          })
        );
      }

      await Promise.all(attachmentPromises);

      toast({
        title: t('common', 'success'),
        description: "Your idea has been submitted successfully!",
      });

      setFormData({
        title: "",
        description: "",
        category: "",
        implementation_cost: "",
        expected_roi: "",
        strategic_alignment_score: "",
      });
      
      // Reset file uploads
      setFeasibilityFiles([]);
      setPricingFiles([]);
      setPrototypeFiles([]);
      setStrategicAlignment([]);

      onIdeaSubmitted();
    } catch (error) {
      console.error("Error submitting idea:", error);
      toast({
        title: t('common', 'error'),
        description: "Failed to submit idea",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className={`flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
            <Lightbulb className="h-6 w-6 text-blue-600" />
            <CardTitle className={isRTL ? 'text-right' : 'text-left'}>
              {t('idea_form', 'submit_new_idea')}
            </CardTitle>
          </div>
          <CardDescription className={isRTL ? 'text-right' : 'text-left'}>
            {t('idea_form', 'share_innovative_idea')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className={isRTL ? 'text-right block' : 'text-left'}>
                {t('idea_form', 'idea_title')} *
              </Label>
              <Input
                id="title"
                placeholder={t('idea_form', 'title_placeholder')}
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className={isRTL ? 'text-right' : 'text-left'}
                dir={isRTL ? 'rtl' : 'ltr'}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className={isRTL ? 'text-right block' : 'text-left'}>
                {t('idea_form', 'description')} *
              </Label>
              <Textarea
                id="description"
                placeholder={t('idea_form', 'description_placeholder')}
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className={isRTL ? 'text-right' : 'text-left'}
                dir={isRTL ? 'rtl' : 'ltr'}
                rows={6}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className={isRTL ? 'text-right block' : 'text-left'}>
                  {t('idea_form', 'category')} *
                </Label>
                <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                  <SelectTrigger className={isRTL ? 'text-right' : 'text-left'}>
                    <SelectValue placeholder={t('idea_form', 'select_category')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="innovation">{t('categories', 'innovation')}</SelectItem>
                    <SelectItem value="process_improvement">{t('categories', 'process_improvement')}</SelectItem>
                    <SelectItem value="cost_reduction">{t('categories', 'cost_reduction')}</SelectItem>
                    <SelectItem value="customer_experience">{t('categories', 'customer_experience')}</SelectItem>
                    <SelectItem value="technology">{t('categories', 'technology')}</SelectItem>
                    <SelectItem value="sustainability">{t('categories', 'sustainability')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className={isRTL ? 'text-right block' : 'text-left'}>
                  {t('idea_form', 'strategic_alignment')}
                </Label>
                <MultiSelectDropdown
                  options={strategicAlignmentOptions}
                  value={strategicAlignment}
                  onChange={setStrategicAlignment}
                  placeholder={t('idea_form', 'select_strategic_alignment')}
                  disabled={lovLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="implementation_cost" className={isRTL ? 'text-right block' : 'text-left'}>
                  {t('idea_form', 'implementation_cost')}
                </Label>
                <Input
                  id="implementation_cost"
                  type="number"
                  placeholder={t('idea_form', 'estimated_cost')}
                  value={formData.implementation_cost}
                  onChange={(e) => handleChange("implementation_cost", e.target.value)}
                  className={isRTL ? 'text-right' : 'text-left'}
                  dir="ltr" // Keep numbers LTR
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected_roi" className={isRTL ? 'text-right block' : 'text-left'}>
                  {t('idea_form', 'expected_roi')}
                </Label>
                <Input
                  id="expected_roi"
                  type="number"
                  placeholder={t('idea_form', 'expected_return')}
                  value={formData.expected_roi}
                  onChange={(e) => handleChange("expected_roi", e.target.value)}
                  className={isRTL ? 'text-right' : 'text-left'}
                  dir="ltr" // Keep numbers LTR
                />
              </div>
            </div>

            {/* File Upload Section */}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('idea_form', 'file_attachments_optional')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FileUploadField
                  label={t('idea_form', 'feasibility_study')}
                  fileType="feasibility"
                  accept=".pdf,.doc,.docx"
                  value={feasibilityFiles}
                  onChange={setFeasibilityFiles}
                  placeholder={t('idea_form', 'upload_feasibility_documents')}
                />
                
                <FileUploadField
                  label={t('idea_form', 'pricing_offers')}
                  fileType="pricing_offer"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  value={pricingFiles}
                  onChange={setPricingFiles}
                  placeholder={t('idea_form', 'upload_pricing_documents')}
                />
                
                <FileUploadField
                  label={t('idea_form', 'prototype_images')}
                  fileType="prototype"
                  accept="image/*"
                  multiple
                  value={prototypeFiles}
                  onChange={setPrototypeFiles}
                  placeholder={t('idea_form', 'upload_prototype_images')}
                />
              </div>
            </div>

            <div className={`flex space-x-4 ${isRTL ? 'space-x-reverse' : ''}`}>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? t('idea_form', 'submitting') : t('idea_form', 'submit_idea')}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  // Save as draft logic
                  toast({
                    title: "Draft Saved",
                    description: "Your idea has been saved as a draft",
                  });
                }}
              >
                {t('idea_form', 'save_as_draft')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
