
import React from "react";
import { EvaluatorPoolManagement } from "../EvaluatorPoolManagement";
import { useLanguage } from "@/contexts/LanguageContext";

interface EvaluatorManagementViewProps {
  profile: any;
}

export const EvaluatorManagementView = ({ profile }: EvaluatorManagementViewProps) => {
  const { language } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {language === 'ar' ? 'إدارة المقيمين' : 'Evaluator Management'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'ar' ? 'إدارة وتعيين المقيمين' : 'Manage and assign evaluators'}
        </p>
      </div>
      <EvaluatorPoolManagement profile={profile} />
    </div>
  );
};
