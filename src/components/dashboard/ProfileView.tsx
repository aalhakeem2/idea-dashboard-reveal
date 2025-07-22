
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2, Save, X, MapPin, Mail, Calendar, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

interface ProfileViewProps {
  profile: Profile;
  onProfileUpdate: (profile: Profile) => void;
}

export const ProfileView = ({ profile, onProfileUpdate }: ProfileViewProps) => {
  const { language, isRTL } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    department: profile.department || '',
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          department: formData.department,
        })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;

      onProfileUpdate(data);
      setIsEditing(false);
      toast({
        title: language === 'ar' ? 'تم التحديث بنجاح' : 'Profile Updated',
        description: language === 'ar' ? 'تم تحديث ملفك الشخصي بنجاح' : 'Your profile has been updated successfully',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: language === 'ar' ? 'خطأ في التحديث' : 'Update Error',
        description: language === 'ar' ? 'حدث خطأ أثناء تحديث الملف الشخصي' : 'Failed to update profile',
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile.full_name || '',
      department: profile.department || '',
    });
    setIsEditing(false);
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

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'management':
        return 'default';
      case 'evaluator':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 ${isRTL ? 'text-right' : 'text-left'}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className={`flex items-center space-x-2 text-gray-600 hover:text-gray-800 ${isRTL ? 'space-x-reverse' : ''}`}
          >
            <ArrowLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            <span>{language === 'ar' ? 'العودة' : 'Back'}</span>
          </Button>
          
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="flex items-center space-x-2">
              <Edit2 className="h-4 w-4" />
              <span>{language === 'ar' ? 'تحرير الملف الشخصي' : 'Edit Profile'}</span>
            </Button>
          ) : (
            <div className={`flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>{language === 'ar' ? 'إلغاء' : 'Cancel'}</span>
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ' : 'Save')}</span>
              </Button>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
            <div className={`flex items-center space-x-4 ${isRTL ? 'space-x-reverse' : ''}`}>
              <Avatar className={`h-20 w-20 ${getRoleColor(profile.role || 'submitter')} ring-4 ring-white/30 shadow-lg`}>
                <AvatarFallback className="text-white text-xl font-bold">
                  {getInitials(profile.full_name || 'User')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-2xl font-bold">
                  {isEditing ? (
                    <Input
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="text-2xl font-bold bg-white/20 border-white/30 text-white placeholder:text-white/70"
                      placeholder={language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                    />
                  ) : (
                    profile.full_name || (language === 'ar' ? 'لم يتم تحديد الاسم' : 'Name not set')
                  )}
                </CardTitle>
                <CardDescription className="text-blue-100 flex items-center space-x-2 mt-2">
                  <Shield className="h-4 w-4" />
                  <Badge variant={getRoleBadgeVariant(profile.role || 'submitter')} className="bg-white/20 text-white border-white/30">
                    {getRoleText(profile.role || 'submitter')}
                  </Badge>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-600">
                  <Mail className="h-5 w-5 text-blue-500" />
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                    </Label>
                    <p className="font-medium">{profile.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 text-gray-600">
                  <MapPin className="h-5 w-5 text-blue-500" />
                  <div className="flex-1">
                    <Label className="text-sm font-medium text-gray-500">
                      {language === 'ar' ? 'القسم' : 'Department'}
                    </Label>
                    {isEditing ? (
                      <Input
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        placeholder={language === 'ar' ? 'اسم القسم' : 'Department name'}
                        className="mt-1"
                      />
                    ) : (
                      <p className="font-medium">
                        {profile.department || (language === 'ar' ? 'لم يتم تحديد القسم' : 'Department not set')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-600">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      {language === 'ar' ? 'تاريخ الانضمام' : 'Member Since'}
                    </Label>
                    <p className="font-medium">
                      {new Date(profile.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    {language === 'ar' ? 'حالة الحساب' : 'Account Status'}
                  </Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className={`h-2 w-2 rounded-full ${profile.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className={`font-medium ${profile.is_active ? 'text-green-600' : 'text-red-600'}`}>
                      {profile.is_active 
                        ? (language === 'ar' ? 'نشط' : 'Active')
                        : (language === 'ar' ? 'غير نشط' : 'Inactive')
                      }
                    </span>
                  </div>
                </div>
                
                {profile.email_confirmed && (
                  <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                    {language === 'ar' ? 'تم التحقق من البريد الإلكتروني' : 'Email Verified'}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
