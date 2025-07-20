
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
          {
            id: "ideas",
            label: language === "ar" ? "جميع الأفكار" : "All Ideas",
            icon: Lightbulb,
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
          {
            id: "ideas",
            label: language === "ar" ? "جميع الأفكار" : "All Ideas",
            icon: Lightbulb,
          },
          {
            id: "analytics",
            label: language === "ar" ? "التحليلات" : "Analytics",
            icon: BarChart3,
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

  const handleItemClick = (itemId: string) => {
    console.log("Sidebar: Clicking item", itemId, "Current active:", activeView);
    onViewChange(itemId);
  };

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 shadow-sm ${collapsed ? 'w-16' : 'w-64'}`}>
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
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <LayoutDashboard className="h-4 w-4" />
          </Button>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start transition-all duration-200 ${
                  language === 'ar' ? 'flex-row-reverse' : ''
                } ${collapsed ? 'px-2' : 'px-4'} ${
                  isActive 
                    ? 'bg-you-accent text-white shadow-md hover:bg-you-accent/90' 
                    : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                } ${!collapsed ? 'h-12' : 'h-10'}`}
                onClick={() => handleItemClick(item.id)}
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              >
                <Icon className={`h-5 w-5 ${collapsed ? '' : (language === 'ar' ? 'ml-3' : 'mr-3')} ${
                  isActive ? 'text-white' : 'text-gray-500'
                }`} />
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </Button>
            );
          })}
        </nav>

        {/* Role Badge */}
        {!collapsed && (
          <div className="mt-8 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
            <div className="text-xs text-gray-500 mb-2 font-medium" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {language === "ar" ? "الدور الحالي" : "Current Role"}
            </div>
            <div className="font-semibold text-sm capitalize text-gray-800" dir={language === 'ar' ? 'rtl' : 'ltr'}>
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
