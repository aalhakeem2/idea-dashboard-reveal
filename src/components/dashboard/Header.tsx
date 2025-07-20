
import { Search, Bell, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { UserMenu } from "./UserMenu";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

interface HeaderProps {
  profile: Profile;
}

export const Header = ({ profile }: HeaderProps) => {
  const { t, isRTL } = useLanguage();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className={`absolute top-3 h-4 w-4 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
            <Input
              placeholder={t('header', 'search_placeholder')}
              className={`h-12 border-gray-300 focus:border-you-accent focus:ring-you-accent ${
                isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'
              }`}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </div>
        </div>
        
        <div className={`flex items-center space-x-4 ${isRTL ? 'space-x-reverse' : ''}`}>
          <LanguageSwitcher />
          
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800 hover:bg-you-accent/20">
            <Filter className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
            {t('header', 'filter')}
          </Button>
          
          <Button variant="ghost" size="sm" className="relative text-gray-600 hover:text-gray-800 hover:bg-you-accent/20">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 rtl:-left-1 rtl:right-auto h-2 w-2 bg-you-orange rounded-full"></span>
          </Button>
          
          <UserMenu profile={profile} />
        </div>
      </div>
    </header>
  );
};
