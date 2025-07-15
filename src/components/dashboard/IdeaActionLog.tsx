import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, MessageCircle, Star, Edit, Upload, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";

interface ActionLogEntry {
  action_id: string;
  action_type: string;
  performed_by: string;
  user_role: string;
  action_detail: string | null;
  timestamp: string;
  user_name?: string;
}

interface IdeaActionLogProps {
  actionLogs: ActionLogEntry[];
}

const ACTION_CONFIGS = {
  idea_created: { 
    icon: Edit, 
    label: { en: "Idea Created", ar: "تم إنشاء الفكرة" },
    color: "bg-green-500"
  },
  idea_edited: { 
    icon: Edit, 
    label: { en: "Idea Edited", ar: "تم تعديل الفكرة" },
    color: "bg-blue-500"
  },
  comment_added: { 
    icon: MessageCircle, 
    label: { en: "Comment Added", ar: "تم إضافة تعليق" },
    color: "bg-purple-500"
  },
  score_submitted: { 
    icon: Star, 
    label: { en: "Score Submitted", ar: "تم تقديم النتيجة" },
    color: "bg-yellow-500"
  },
  attachment_uploaded: { 
    icon: Upload, 
    label: { en: "Attachment Uploaded", ar: "تم رفع مرفق" },
    color: "bg-indigo-500"
  },
  reassigned_to_user: { 
    icon: UserCheck, 
    label: { en: "Reassigned", ar: "تم إعادة التكليف" },
    color: "bg-orange-500"
  },
  status_changed: { 
    icon: Activity, 
    label: { en: "Status Changed", ar: "تم تغيير الحالة" },
    color: "bg-red-500"
  },
};

export const IdeaActionLog: React.FC<IdeaActionLogProps> = ({ actionLogs }) => {
  const { language } = useLanguage();

  const getActionConfig = (actionType: string) => {
    return ACTION_CONFIGS[actionType as keyof typeof ACTION_CONFIGS] || {
      icon: Activity,
      label: { en: actionType, ar: actionType },
      color: "bg-gray-400"
    };
  };

  // Sort logs by timestamp, most recent first
  const sortedLogs = [...actionLogs].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          {language === 'ar' ? 'سجل الأنشطة' : 'Activity Log'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedLogs.map((log, index) => {
            const config = getActionConfig(log.action_type);
            const Icon = config.icon;
            
            return (
              <div key={log.action_id} className="flex items-start gap-4">
                {/* Action icon */}
                <div className="flex flex-col items-center">
                  <div className={`
                    w-8 h-8 rounded-full ${config.color} 
                    flex items-center justify-center
                  `}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  {index < sortedLogs.length - 1 && (
                    <div className="w-0.5 h-8 bg-border mt-2" />
                  )}
                </div>

                {/* Action content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">
                      {config.label[language]}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {log.user_role}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-2">
                    {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm')}
                  </div>
                  
                  <div className="text-xs text-muted-foreground mb-2">
                    {language === 'ar' ? 'بواسطة' : 'by'} {log.user_name || log.performed_by}
                  </div>
                  
                  {log.action_detail && (
                    <div className="text-sm text-foreground bg-muted p-2 rounded">
                      {log.action_detail}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {sortedLogs.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            {language === 'ar' ? 'لا توجد أنشطة متاحة' : 'No activity history available'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};