
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, User } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Profile = Tables<"profiles">;

interface UserMenuProps {
  profile: Profile;
}

export const UserMenu = ({ profile }: UserMenuProps) => {
  const { language, isRTL } = useLanguage();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: language === 'ar' ? 'تم تسجيل الخروج' : 'Logged out',
        description: language === 'ar' ? 'تم تسجيل خروجك بنجاح' : 'You have been logged out successfully',
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'حدث خطأ أثناء تسجيل الخروج' : 'An error occurred while logging out',
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'submitter':
        return 'bg-you-blue';
      case 'evaluator':
        return 'bg-you-green';
      case 'management':
        return 'bg-you-orange';
      default:
        return 'bg-you-accent';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'submitter':
        return language === 'ar' ? 'مقدم أفكار' : 'Submitter';
      case 'evaluator':
        return language === 'ar' ? 'مقيم' : 'Evaluator';
      case 'management':
        return language === 'ar' ? 'إدارة' : 'Management';
      default:
        return role;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className={`h-10 w-10 ${getRoleColor(profile.role || 'submitter')}`}>
            <AvatarFallback className="text-white font-semibold">
              {getInitials(profile.full_name || 'User')}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className={`w-56 ${isRTL ? 'text-right' : 'text-left'}`} 
        align={isRTL ? "start" : "end"}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center justify-start space-x-2 p-2">
          <Avatar className={`h-8 w-8 ${getRoleColor(profile.role || 'submitter')}`}>
            <AvatarFallback className="text-white text-xs">
              {getInitials(profile.full_name || 'User')}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium text-sm">{profile.full_name}</p>
            <p className="text-xs text-muted-foreground">
              {getRoleText(profile.role || 'submitter')}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className={`cursor-pointer ${isRTL ? 'flex-row-reverse' : ''}`}>
          <User className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          <span>{language === 'ar' ? 'الملف الشخصي' : 'Profile'}</span>
        </DropdownMenuItem>
        <DropdownMenuItem className={`cursor-pointer ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Settings className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          <span>{language === 'ar' ? 'الإعدادات' : 'Settings'}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className={`cursor-pointer text-red-600 focus:text-red-600 ${isRTL ? 'flex-row-reverse' : ''}`}
          onClick={handleLogout}
        >
          <LogOut className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          <span>{language === 'ar' ? 'تسجيل الخروج' : 'Logout'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
