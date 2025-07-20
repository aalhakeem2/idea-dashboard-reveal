
import React from "react";
import { UserManagement } from "../UserManagement";
import { useLanguage } from "@/contexts/LanguageContext";

export const UserManagementView = () => {
  const { language } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {language === 'ar' ? 'إدارة المستخدمين' : 'User Management'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'ar' ? 'إدارة جميع المستخدمين في النظام' : 'Manage all users in the system'}
        </p>
      </div>
      <UserManagement />
    </div>
  );
};
