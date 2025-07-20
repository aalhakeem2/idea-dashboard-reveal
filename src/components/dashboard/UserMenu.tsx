
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, User, Loader2 } from "lucide-react";
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
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      console.log('Starting logout process...');
      
      // Sign out from Supabase - this will trigger auth state change
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        toast({
          title: language === 'ar' ? 'خطأ في تسجيل الخروج' : 'Logout Error',
          description: language === 'ar' ? 'حدث خطأ أثناء تسجيل الخروج' : 'An error occurred during logout',
          variant: "destructive",
        });
        setIsLoggingOut(false);
        return;
      }

      console.log('Logout successful');
      
      // Show success toast
      toast({
        title: language === 'ar' ? 'تم تسجيل الخروج' : 'Logged out',
        description: language === 'ar' ? 'تم تسجيل خروجك بنجاح' : 'You have been logged out successfully',
      });

      // Let the auth state change handle the redirect naturally
      // No need for manual localStorage clearing or forced page reload
      
    } catch (error) {
      console.error('Unexpected logout error:', error);
      
      toast({
        title: language === 'ar' ? 'خطأ غير متوقع' : 'Unexpected Error',
        description: language === 'ar' ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred',
        variant: "destructive",
      });
      
      setIsLoggingOut(false);
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
        <Button 
          variant="ghost" 
          className="relative h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 border-2 border-white/20 hover:border-white/40 transition-all duration-200 shadow-lg hover:shadow-xl"
          disabled={isLoggingOut}
        >
          <Avatar className={`h-8 w-8 ${getRoleColor(profile.role || 'submitter')} ring-2 ring-white/30`}>
            <AvatarFallback className="text-white font-bold text-sm">
              {getInitials(profile.full_name || 'User')}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className={`w-56 ${isRTL ? 'text-right' : 'text-left'} bg-white shadow-xl border border-gray-200 rounded-lg`} 
        align={isRTL ? "start" : "end"}
        sideOffset={8}
      >
        <div className="flex items-center justify-start space-x-2 p-3 bg-gray-50 rounded-t-lg">
          <Avatar className={`h-10 w-10 ${getRoleColor(profile.role || 'submitter')} ring-2 ring-white`}>
            <AvatarFallback className="text-white text-sm font-semibold">
              {getInitials(profile.full_name || 'User')}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-semibold text-sm text-gray-900">{profile.full_name}</p>
            <p className="text-xs text-gray-600 font-medium">
              {getRoleText(profile.role || 'submitter')}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className={`cursor-pointer hover:bg-gray-50 focus:bg-gray-50 px-3 py-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <User className={`h-4 w-4 ${isRTL ? 'ml-3' : 'mr-3'} text-gray-500`} />
          <span className="text-gray-700 font-medium">{language === 'ar' ? 'الملف الشخصي' : 'Profile'}</span>
        </DropdownMenuItem>
        <DropdownMenuItem className={`cursor-pointer hover:bg-gray-50 focus:bg-gray-50 px-3 py-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Settings className={`h-4 w-4 ${isRTL ? 'ml-3' : 'mr-3'} text-gray-500`} />
          <span className="text-gray-700 font-medium">{language === 'ar' ? 'الإعدادات' : 'Settings'}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className={`cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 focus:bg-red-50 px-3 py-2 ${isRTL ? 'flex-row-reverse' : ''} ${isLoggingOut ? 'opacity-50' : ''}`}
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <Loader2 className={`h-4 w-4 ${isRTL ? 'ml-3' : 'mr-3'} animate-spin`} />
          ) : (
            <LogOut className={`h-4 w-4 ${isRTL ? 'ml-3' : 'mr-3'}`} />
          )}
          <span className="font-medium">
            {isLoggingOut 
              ? (language === 'ar' ? 'جاري تسجيل الخروج...' : 'Logging out...') 
              : (language === 'ar' ? 'تسجيل الخروج' : 'Logout')
            }
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
