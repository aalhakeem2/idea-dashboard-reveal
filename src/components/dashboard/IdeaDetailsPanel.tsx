import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  User,
  Building,
  DollarSign,
  Target,
  Calendar,
  TrendingUp,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { IdeaFileViewer } from "./IdeaFileViewer";

interface IdeaDetailsPanelProps {
  idea: any;
  submitterProfile?: any;
  currentUserProfile?: any;
  isExpanded: boolean;
  onToggle: () => void;
}

export const IdeaDetailsPanel: React.FC<IdeaDetailsPanelProps> = ({
  idea,
  submitterProfile,
  currentUserProfile,
  isExpanded,
  onToggle
}) => {
  const { t, language, isRTL } = useLanguage();

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "innovation":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "process_improvement":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "cost_reduction":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "customer_experience":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "technology":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300";
      case "sustainability":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <Card className="border-border">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full p-0 h-auto hover:bg-transparent"
          >
            <CardHeader className="w-full">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {language === 'ar' ? 'تفاصيل الفكرة الكاملة' : 'Complete Idea Details'}
                </CardTitle>
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CardHeader>
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-xl font-bold">{idea.title}</h3>
                {idea.idea_reference_code && (
                  <Badge variant="outline" className="text-xs font-mono">
                    {idea.idea_reference_code}
                  </Badge>
                )}
                <Badge variant="outline" className={getCategoryColor(idea.category)}>
                  {idea.category.replace("_", " ")}
                </Badge>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">{t('idea_form', 'description')}</h4>
                <p className={`text-muted-foreground leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
                  {idea.description}
                </p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Submitter Information - Hidden for evaluators */}
              {currentUserProfile?.role !== 'evaluator' && submitterProfile && (
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {t('dashboard', 'submitter_info')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{t('dashboard', 'name')}:</span>
                      <span>{submitterProfile?.full_name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{t('dashboard', 'email')}:</span>
                      <span>{submitterProfile?.email || 'N/A'}</span>
                    </div>
                    {submitterProfile?.department && (
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        <span>{submitterProfile.department}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Financial Information */}
              {(idea.implementation_cost || idea.expected_roi) && (
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      {t('dashboard', 'financial_info')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {idea.implementation_cost && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{t('idea_form', 'implementation_cost')}:</span>
                        <span>${idea.implementation_cost.toLocaleString()}</span>
                      </div>
                    )}
                    {idea.expected_roi && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{t('idea_form', 'expected_roi')}:</span>
                        <span>{idea.expected_roi}%</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Alignment & Priority */}
              {(idea.strategic_alignment_score || idea.priority_score || idea.strategic_alignment_selections) && (
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      {t('dashboard', 'alignment_priority')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {idea.strategic_alignment_score && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{t('dashboard', 'alignment_score')}:</span>
                        <span>{idea.strategic_alignment_score}/10</span>
                      </div>
                    )}
                    {idea.priority_score && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{t('dashboard', 'priority_score')}:</span>
                        <span>{idea.priority_score}</span>
                      </div>
                    )}
                    {idea.strategic_alignment_selections && idea.strategic_alignment_selections.length > 0 && (
                      <div>
                        <span className="font-medium">{t('dashboard', 'strategic_alignments')}:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {idea.strategic_alignment_selections.map((selection: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {selection}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Timeline Information */}
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {t('dashboard', 'timeline')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{t('dashboard', 'created')}:</span>
                    <span>{format(new Date(idea.created_at!), "MMM d, yyyy 'at' h:mm a")}</span>
                  </div>
                  {idea.submitted_at && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      <span className="font-medium">{t('dashboard', 'submitted')}:</span>
                      <span>{format(new Date(idea.submitted_at), "MMM d, yyyy 'at' h:mm a")}</span>
                    </div>
                  )}
                  {idea.evaluated_at && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{t('dashboard', 'evaluated')}:</span>
                      <span>{format(new Date(idea.evaluated_at), "MMM d, yyyy 'at' h:mm a")}</span>
                    </div>
                  )}
                  {idea.implemented_at && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{t('dashboard', 'implemented')}:</span>
                      <span>{format(new Date(idea.implemented_at), "MMM d, yyyy 'at' h:mm a")}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* File Attachments */}
            <IdeaFileViewer 
              ideaId={idea.id} 
              readOnly={true} 
              title={`${t('idea_form', 'file_attachments')} - ${idea.title}`}
            />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};