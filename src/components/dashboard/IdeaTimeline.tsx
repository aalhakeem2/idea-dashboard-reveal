import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User } from "lucide-react";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";

interface StatusLogEntry {
  log_id: string;
  status: string;
  previous_status: string | null;
  changed_by: string;
  user_role: string;
  comments: string | null;
  timestamp: string;
  user_name?: string;
}

interface IdeaTimelineProps {
  statusLogs: StatusLogEntry[];
  currentStatus: string;
}

const STATUS_CONFIGS = {
  draft: { label: { en: "📝 Draft", ar: "📝 مسودة" }, color: "bg-gray-500" },
  submitted: { label: { en: "📬 Submitted", ar: "📬 مُرسل" }, color: "bg-blue-500" },
  under_review: { label: { en: "🔍 Under Review", ar: "🔍 قيد المراجعة" }, color: "bg-yellow-500" },
  screened: { label: { en: "✅ Screened", ar: "✅ تم الفحص" }, color: "bg-green-500" },
  under_evaluation: { label: { en: "📊 Under Evaluation", ar: "📊 قيد التقييم" }, color: "bg-purple-500" },
  evaluated: { label: { en: "🧩 Evaluated", ar: "🧩 تم التقييم" }, color: "bg-indigo-500" },
  approved: { label: { en: "🟢 Approved", ar: "🟢 موافق عليه" }, color: "bg-green-600" },
  rejected: { label: { en: "🔴 Rejected", ar: "🔴 مرفوض" }, color: "bg-red-500" },
  deferred: { label: { en: "🟡 Deferred", ar: "🟡 مؤجل" }, color: "bg-orange-500" },
  implemented: { label: { en: "🏁 Implemented", ar: "🏁 تم التنفيذ" }, color: "bg-emerald-600" },
};

export const IdeaTimeline: React.FC<IdeaTimelineProps> = ({ statusLogs, currentStatus }) => {
  const { language } = useLanguage();

  const getStatusConfig = (status: string) => {
    return STATUS_CONFIGS[status as keyof typeof STATUS_CONFIGS] || {
      label: { en: status, ar: status },
      color: "bg-gray-400"
    };
  };

  // Sort logs by timestamp, most recent first
  const sortedLogs = [...statusLogs].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {language === 'ar' ? 'الخط الزمني للحالة' : 'Status Timeline'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedLogs.map((log, index) => {
            const config = getStatusConfig(log.status);
            const isLatest = index === 0;
            
            return (
              <div key={log.log_id} className="flex items-start gap-4">
                {/* Timeline dot */}
                <div className="flex flex-col items-center">
                  <div className={`
                    w-4 h-4 rounded-full ${config.color}
                    ${isLatest ? 'ring-4 ring-primary/20' : ''}
                  `} />
                  {index < sortedLogs.length - 1 && (
                    <div className="w-0.5 h-8 bg-border mt-2" />
                  )}
                </div>

                {/* Timeline content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={isLatest ? "default" : "secondary"}>
                      {config.label[language]}
                    </Badge>
                    {isLatest && (
                      <Badge variant="outline" className="text-xs">
                        {language === 'ar' ? 'الحالة الحالية' : 'Current'}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-2">
                    {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm')}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>
                      {language === 'ar' ? 'بواسطة' : 'by'} {log.user_name || log.changed_by}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {log.user_role}
                    </Badge>
                  </div>
                  
                  {log.comments && (
                    <div className="mt-2 text-sm text-foreground bg-muted p-2 rounded">
                      {log.comments}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {sortedLogs.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            {language === 'ar' ? 'لا توجد سجلات حالة متاحة' : 'No status history available'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};