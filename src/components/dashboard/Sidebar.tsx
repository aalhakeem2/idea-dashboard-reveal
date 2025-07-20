
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Lightbulb, 
  ClipboardCheck, 
  Users, 
  BarChart3, 
  Settings,
  FileText,
  UserCheck,
  Target,
  Activity,
  Sparkles
} from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useLanguage } from "@/contexts/LanguageContext";

type Profile = Tables<"profiles">;

interface SidebarProps {
  profile: Profile;
  activeView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar = ({ profile, activeView, onViewChange }: SidebarProps) => {
  const { language } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);

  const getMenuItems = () => {
    const baseItems = [
      {
        id: "dashboard",
        label: language === "ar" ? "لوحة التحكم" : "Dashboard",
        icon: LayoutDashboard,
      },
    ];

    switch (profile.role) {
      case "submitter":
        return [
          ...baseItems,
          {
            id: "submit-idea",
            label: language === "ar" ? "إرسال فكرة" : "Submit Idea",
            icon: Lightbulb,
          },
          {
            id: "my-ideas",
            label: language === "ar" ? "أفكاري" : "My Ideas",
            icon: FileText,
          },
        ];

      case "evaluator":
        return [
          ...baseItems,
          {
            id: "evaluations",
            label: language === "ar" ? "التقييمات" : "Evaluations",
            icon: ClipboardCheck,
          },
          {
            id: "assigned-ideas",
            label: language === "ar" ? "الأفكار المُكلفة" : "Assigned Ideas",
            icon: Target,
          },
        ];

      case "management":
        return [
          ...baseItems,
          {
            id: "evaluation-queue",
            label: language === "ar" ? "طابور التقييم" : "Evaluation Queue",
            icon: Activity,
          },
          {
            id: "decisions",
            label: language === "ar" ? "القرارات" : "Decisions",
            icon: Sparkles,
          },
          {
            id: "analytics",
            label: language === "ar" ? "التحليلات" : "Analytics",
            icon: BarChart3,
          },
          {
            id: "ideas",
            label: language === "ar" ? "جميع الأفكار" : "All Ideas",
            icon: Lightbulb,
          },
          {
            id: "evaluator-management",
            label: language === "ar" ? "إدارة المقيمين" : "Evaluator Management",
            icon: UserCheck,
          },
          {
            id: "evaluator-pool",
            label: language === "ar" ? "مجموعة المقيمين" : "Evaluator Pool",
            icon: Users,
          },
          {
            id: "users",
            label: language === "ar" ? "إدارة المستخدمين" : "User Management",
            icon: Users,
          },
          {
            id: "settings",
            label: language === "ar" ? "الإعدادات" : "Settings",
            icon: Settings,
          },
        ];

      default:
        return baseItems;
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-8">
          {!collapsed && (
            <h2 className="text-xl font-bold text-gray-800" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {language === "ar" ? "نظام الأفكار" : "Ideas System"}
            </h2>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="p-2"
          >
            <LayoutDashboard className="h-4 w-4" />
          </Button>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeView === item.id ? "default" : "ghost"}
                className={`w-full justify-start ${language === 'ar' ? 'flex-row-reverse' : ''} ${collapsed ? 'px-2' : 'px-4'}`}
                onClick={() => onViewChange(item.id)}
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              >
                <Icon className={`h-4 w-4 ${collapsed ? '' : (language === 'ar' ? 'ml-2' : 'mr-2')}`} />
                {!collapsed && <span>{item.label}</span>}
              </Button>
            );
          })}
        </nav>

        {/* Role Badge */}
        {!collapsed && (
          <div className="mt-8 p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {language === "ar" ? "الدور الحالي" : "Current Role"}
            </div>
            <div className="font-medium text-sm capitalize" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {profile.role === "management" && (language === "ar" ? "إدارة" : "Management")}
              {profile.role === "evaluator" && (language === "ar" ? "مقيم" : "Evaluator")}
              {profile.role === "submitter" && (language === "ar" ? "مقدم أفكار" : "Submitter")}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
