
import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Home, 
  Lightbulb, 
  FileCheck, 
  Users, 
  Settings, 
  ClipboardList,
  UserCheck,
  BarChart3,
  Clock,
  CheckCircle2,
  Target,
  Shield,
  Activity
} from "lucide-react";

interface SidebarProps {
  role: string;
  onViewChange: (view: string) => void;
  activeView: string;
}

const Sidebar: React.FC<SidebarProps> = ({ role, onViewChange, activeView }) => {
  const { language } = useLanguage();

  const submitterItems = [
    { key: "dashboard", icon: Home, label: language === 'ar' ? 'الرئيسية' : 'Dashboard' },
    { key: "submit", icon: Lightbulb, label: language === 'ar' ? 'إرسال فكرة' : 'Submit Idea' },
    { key: "my-ideas", icon: FileCheck, label: language === 'ar' ? 'أفكاري' : 'My Ideas' },
    { key: "drafts", icon: ClipboardList, label: language === 'ar' ? 'المسودات' : 'Drafts' },
  ];

  const evaluatorItems = [
    { key: "dashboard", icon: Home, label: language === 'ar' ? 'الرئيسية' : 'Dashboard' },
    { key: "evaluations", icon: FileCheck, label: language === 'ar' ? 'التقييمات' : 'Evaluations' },
    { key: "completed", icon: CheckCircle2, label: language === 'ar' ? 'المكتملة' : 'Completed' },
    { key: "analytics", icon: BarChart3, label: language === 'ar' ? 'التحليلات' : 'Analytics' },
  ];

  const managementItems = [
    { key: "dashboard", icon: Home, label: language === 'ar' ? 'الرئيسية' : 'Dashboard' },
    { key: "evaluation-management", icon: Activity, label: language === 'ar' ? 'إدارة التقييمات' : 'Evaluation Management' },
    { key: "evaluation-queue", icon: Clock, label: language === 'ar' ? 'طابور التقييم' : 'Evaluation Queue' },
    { key: "assign-evaluators", icon: UserCheck, label: language === 'ar' ? 'تعيين المقيمين' : 'Assign Evaluators' },
    { key: "decisions", icon: Target, label: language === 'ar' ? 'القرارات' : 'Decisions' },
    { key: "ideas", icon: Lightbulb, label: language === 'ar' ? 'جميع الأفكار' : 'All Ideas' },
    { key: "analytics", icon: BarChart3, label: language === 'ar' ? 'التحليلات' : 'Analytics' },
    { key: "evaluator-management", icon: Shield, label: language === 'ar' ? 'إدارة المقيمين' : 'Evaluator Management' },
    { key: "evaluator-pool", icon: Users, label: language === 'ar' ? 'مجموعة المقيمين' : 'Evaluator Pool' },
    { key: "users", icon: Users, label: language === 'ar' ? 'المستخدمون' : 'Users' },
    { key: "settings", icon: Settings, label: language === 'ar' ? 'الإعدادات' : 'Settings' },
  ];

  const getMenuItems = () => {
    switch (role) {
      case 'submitter':
        return submitterItems;
      case 'evaluator':
        return evaluatorItems;
      case 'management':
        return managementItems;
      default:
        return submitterItems;
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className={`bg-white border-r border-border h-full ${language === 'ar' ? 'text-right' : 'text-left'}`}>
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {language === 'ar' ? 'نظام الأفكار' : 'Ideas System'}
        </h2>
        
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => onViewChange(item.key)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                "hover:bg-gray-100 hover:text-gray-900",
                activeView === item.key
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-700",
                language === 'ar' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
