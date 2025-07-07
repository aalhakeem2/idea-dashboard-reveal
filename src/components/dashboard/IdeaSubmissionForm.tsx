
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
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("ideas").insert({
        title: formData.title,
        description: formData.description,
        category: formData.category as any,
        submitter_id: profile.id,
        implementation_cost: formData.implementation_cost ? parseFloat(formData.implementation_cost) : null,
        expected_roi: formData.expected_roi ? parseFloat(formData.expected_roi) : null,
        strategic_alignment_score: formData.strategic_alignment_score ? parseInt(formData.strategic_alignment_score) : null,
        status: "draft",
      });

      if (error) throw error;

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
                <Label htmlFor="strategic_alignment_score" className={isRTL ? 'text-right block' : 'text-left'}>
                  {t('idea_form', 'strategic_alignment')}
                </Label>
                <Select 
                  value={formData.strategic_alignment_score} 
                  onValueChange={(value) => handleChange("strategic_alignment_score", value)}
                >
                  <SelectTrigger className={isRTL ? 'text-right' : 'text-left'}>
                    <SelectValue placeholder={t('idea_form', 'rate_alignment')} />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
