
import { 
  LayoutDashboard, 
  Lightbulb, 
  ClipboardCheck, 
  BarChart3, 
  Users, 
  Settings,
  LogOut,
  Plus,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tables } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

type Profile = Tables<"profiles">;

interface SidebarProps {
  profile: Profile;
  activeView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar = ({ profile, activeView, onViewChange }: SidebarProps) => {
  const { t, isRTL } = useLanguage();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const getNavigationItems = () => {
    const baseItems = [
      { id: "dashboard", label: t('sidebar', 'dashboard'), icon: LayoutDashboard },
      { id: "ideas", label: t('sidebar', 'ideas'), icon: Lightbulb },
    ];

    switch (profile.role) {
      case "submitter":
        return [
          ...baseItems,
          { id: "submit", label: t('sidebar', 'submit_idea'), icon: Plus },
          { id: "my-ideas", label: t('sidebar', 'my_ideas'), icon: ClipboardCheck },
        ];
      case "evaluator":
        return [
          ...baseItems,
          { id: "pending-evaluations", label: t('sidebar', 'pending_reviews'), icon: ClipboardCheck },
          { id: "analytics", label: t('sidebar', 'analytics'), icon: BarChart3 },
        ];
      case "management":
        return [
          ...baseItems,
          { id: "analytics", label: t('sidebar', 'analytics'), icon: BarChart3 },
          { id: "users", label: t('sidebar', 'users'), icon: Users },
          { id: "settings", label: t('sidebar', 'settings'), icon: Settings },
        ];
      default:
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <div className={`w-64 bg-sidebar shadow-xl flex flex-col border-r border-sidebar-border ${isRTL ? 'border-l border-r-0' : ''}`}>
      <div className="p-6 border-b border-sidebar-border">
        <div className={`flex items-center space-x-3 mb-4 ${isRTL ? 'space-x-reverse' : ''}`}>
          <div className="p-2 bg-you-accent rounded-xl border border-you-accent">
            <Zap className="h-6 w-6 text-you-purple" />
          </div>
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h1 className="text-xl font-bold text-sidebar-foreground font-poppins">
              {t('sidebar', 'app_title')}
            </h1>
            <p className="text-sm text-sidebar-foreground/80 font-medium">
              {t('sidebar', 'innovation_hub')}
            </p>
          </div>
        </div>
        <div className="bg-you-accent/50 rounded-lg p-3 border border-you-accent/30">
          <p className={`text-sm font-medium text-sidebar-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
            {profile.full_name}
          </p>
          <p className={`text-xs text-sidebar-foreground/70 capitalize ${isRTL ? 'text-right' : 'text-left'}`}>
            {profile.role}
          </p>
          {profile.department && (
            <p className={`text-xs text-sidebar-foreground/60 ${isRTL ? 'text-right' : 'text-left'}`}>
              {profile.department}
            </p>
          )}
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeView === item.id ? "default" : "ghost"}
              className={cn(
                `w-full h-12 font-medium transition-all duration-200 ${isRTL ? 'justify-end' : 'justify-start'}`,
                activeView === item.id 
                  ? "bg-you-accent text-sidebar-foreground shadow-md border border-you-accent" 
                  : "text-sidebar-foreground hover:bg-you-accent/30 hover:text-sidebar-foreground"
              )}
              onClick={() => onViewChange(item.id)}
            >
              <Icon className={`h-5 w-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
              {item.label}
            </Button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className={`w-full h-12 text-red-500 hover:text-red-600 hover:bg-red-50 font-medium ${isRTL ? 'justify-end' : 'justify-start'}`}
          onClick={handleSignOut}
        >
          <LogOut className={`h-5 w-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
          {t('sidebar', 'sign_out')}
        </Button>
      </div>
    </div>
  );
};
