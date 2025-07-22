import React, { useState, useRef } from "react";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProfilePictureUploadProps {
  userId: string;
  currentPictureUrl?: string | null;
  userName: string;
  onPictureUpdate: (url: string) => void;
}

export const ProfilePictureUpload = ({ 
  userId, 
  currentPictureUrl, 
  userName, 
  onPictureUpdate 
}: ProfilePictureUploadProps) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const validateFile = (file: File): boolean => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: language === 'ar' ? 'نوع ملف غير مدعوم' : 'Unsupported file type',
        description: language === 'ar' ? 'يرجى اختيار صورة بصيغة JPEG، PNG، أو WebP' : 'Please select a JPEG, PNG, or WebP image',
        variant: "destructive",
      });
      return false;
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: language === 'ar' ? 'حجم الملف كبير جداً' : 'File too large',
        description: language === 'ar' ? 'يجب أن يكون حجم الصورة أقل من 5 ميجابايت' : 'Image must be less than 5MB',
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const uploadFile = async (file: File) => {
    if (!validateFile(file)) return;

    setUploading(true);
    try {
      // Delete old picture if exists
      if (currentPictureUrl) {
        const oldPath = currentPictureUrl.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('profile-pictures')
            .remove([`${userId}/${oldPath}`]);
        }
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Upload new picture
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      // Update profile with new picture URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_picture_url: data.publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      onPictureUpdate(data.publicUrl);
      
      toast({
        title: language === 'ar' ? 'تم تحديث الصورة بنجاح' : 'Picture updated successfully',
        description: language === 'ar' ? 'تم تحديث صورة الملف الشخصي بنجاح' : 'Your profile picture has been updated',
      });
    } catch (error) {
      console.error('Error uploading picture:', error);
      toast({
        title: language === 'ar' ? 'خطأ في تحميل الصورة' : 'Upload error',
        description: language === 'ar' ? 'حدث خطأ أثناء تحميل الصورة' : 'Failed to upload picture',
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const removePicture = async () => {
    if (!currentPictureUrl) return;

    setUploading(true);
    try {
      // Delete from storage
      const path = currentPictureUrl.split('/').pop();
      if (path) {
        await supabase.storage
          .from('profile-pictures')
          .remove([`${userId}/${path}`]);
      }

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({ profile_picture_url: null })
        .eq('id', userId);

      if (error) throw error;

      onPictureUpdate('');
      
      toast({
        title: language === 'ar' ? 'تم حذف الصورة' : 'Picture removed',
        description: language === 'ar' ? 'تم حذف صورة الملف الشخصي' : 'Profile picture has been removed',
      });
    } catch (error) {
      console.error('Error removing picture:', error);
      toast({
        title: language === 'ar' ? 'خطأ في حذف الصورة' : 'Remove error',
        description: language === 'ar' ? 'حدث خطأ أثناء حذف الصورة' : 'Failed to remove picture',
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-6 text-center">
      <div className="space-y-4">
        {/* Profile Picture Display */}
        <div className="relative inline-block">
          <Avatar className="h-32 w-32 mx-auto ring-4 ring-primary/20 shadow-lg">
            {currentPictureUrl ? (
              <AvatarImage src={currentPictureUrl} alt={userName} />
            ) : null}
            <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-primary/80 text-white">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
          
          {currentPictureUrl && (
            <Button
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0"
              onClick={removePicture}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${
            dragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-300 hover:border-primary hover:bg-gray-50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-gray-600">
                {language === 'ar' ? 'جاري تحميل الصورة...' : 'Uploading picture...'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <div className="flex space-x-2">
                <Camera className="h-8 w-8 text-gray-400" />
                <Upload className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700">
                {language === 'ar' ? 'اسحب الصورة هنا أو انقر للاختيار' : 'Drag image here or click to select'}
              </p>
              <p className="text-xs text-gray-500">
                {language === 'ar' ? 'JPEG، PNG، WebP - حتى 5 ميجابايت' : 'JPEG, PNG, WebP - up to 5MB'}
              </p>
            </div>
          )}
        </div>

        {/* Upload Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Camera className="h-4 w-4 mr-2" />
          {language === 'ar' ? 'تغيير صورة الملف الشخصي' : 'Change Profile Picture'}
        </Button>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </Card>
  );
};