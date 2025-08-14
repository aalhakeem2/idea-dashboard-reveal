import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, Award, Star, Crown, Shield, Target } from "lucide-react";

interface AchievementType {
  id: string;
  name: string;
  description: string;
  badge_icon: string;
  badge_color: string;
  points_required: number;
  category: 'badge' | 'level' | 'special';
  criteria: any;
  is_active: boolean;
  created_at: string;
}

interface AchievementManagementProps {
  onUpdate?: () => void;
}

export const AchievementManagement: React.FC<AchievementManagementProps> = ({ onUpdate }) => {
  const [achievements, setAchievements] = useState<AchievementType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<AchievementType | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    badge_icon: "star",
    badge_color: "#3B82F6",
    points_required: 0,
    category: "badge" as 'badge' | 'level' | 'special',
    criteria: {}
  });
  const { language } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from("achievement_types")
        .select("*")
        .order("category", { ascending: true })
        .order("points_required", { ascending: true });

      if (error) throw error;
      setAchievements(data as AchievementType[] || []);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في جلب الإنجازات' : 'Failed to fetch achievements',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const achievementData = {
        ...formData,
        criteria: JSON.stringify(formData.criteria)
      };

      if (editingAchievement) {
        const { error } = await supabase
          .from("achievement_types")
          .update(achievementData)
          .eq("id", editingAchievement.id);

        if (error) throw error;

        toast({
          title: language === 'ar' ? 'تم التحديث' : 'Updated',
          description: language === 'ar' ? 'تم تحديث الإنجاز بنجاح' : 'Achievement updated successfully'
        });
      } else {
        const { error } = await supabase
          .from("achievement_types")
          .insert([achievementData]);

        if (error) throw error;

        toast({
          title: language === 'ar' ? 'تم الإنشاء' : 'Created',
          description: language === 'ar' ? 'تم إنشاء الإنجاز بنجاح' : 'Achievement created successfully'
        });
      }

      resetForm();
      fetchAchievements();
      onUpdate?.();
    } catch (error) {
      console.error("Error saving achievement:", error);
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في حفظ الإنجاز' : 'Failed to save achievement',
        variant: "destructive"
      });
    }
  };

  const toggleAchievementStatus = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("achievement_types")
        .update({ is_active: isActive })
        .eq("id", id);

      if (error) throw error;

      setAchievements(prev => 
        prev.map(achievement => 
          achievement.id === id ? { ...achievement, is_active: isActive } : achievement
        )
      );

      toast({
        title: language === 'ar' ? 'تم التحديث' : 'Updated',
        description: language === 'ar' ? 
          `تم ${isActive ? 'تفعيل' : 'إلغاء'} الإنجاز` : 
          `Achievement ${isActive ? 'activated' : 'deactivated'}`
      });

      onUpdate?.();
    } catch (error) {
      console.error("Error updating achievement status:", error);
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في تحديث حالة الإنجاز' : 'Failed to update achievement status',
        variant: "destructive"
      });
    }
  };

  const deleteAchievement = async (id: string) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا الإنجاز؟' : 'Are you sure you want to delete this achievement?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from("achievement_types")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setAchievements(prev => prev.filter(achievement => achievement.id !== id));
      
      toast({
        title: language === 'ar' ? 'تم الحذف' : 'Deleted',
        description: language === 'ar' ? 'تم حذف الإنجاز بنجاح' : 'Achievement deleted successfully'
      });

      onUpdate?.();
    } catch (error) {
      console.error("Error deleting achievement:", error);
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في حذف الإنجاز' : 'Failed to delete achievement',
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      badge_icon: "star",
      badge_color: "#3B82F6",
      points_required: 0,
      category: "badge",
      criteria: {}
    });
    setEditingAchievement(null);
    setIsCreateDialogOpen(false);
  };

  const openEditDialog = (achievement: AchievementType) => {
    setFormData({
      name: achievement.name,
      description: achievement.description || "",
      badge_icon: achievement.badge_icon || "star",
      badge_color: achievement.badge_color || "#3B82F6",
      points_required: achievement.points_required || 0,
      category: achievement.category,
      criteria: typeof achievement.criteria === 'string' ? JSON.parse(achievement.criteria) : achievement.criteria || {}
    });
    setEditingAchievement(achievement);
    setIsCreateDialogOpen(true);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'badge': return <Award className="h-4 w-4" />;
      case 'level': return <Crown className="h-4 w-4" />;
      case 'special': return <Star className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'badge': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'level': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'special': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {language === 'ar' ? 'إدارة الإنجازات' : 'Achievement Management'}
        </h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'إنجاز جديد' : 'New Achievement'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAchievement ? 
                  (language === 'ar' ? 'تعديل الإنجاز' : 'Edit Achievement') :
                  (language === 'ar' ? 'إنجاز جديد' : 'New Achievement')
                }
              </DialogTitle>
              <DialogDescription>
                {language === 'ar' ? 
                  'قم بإنشاء أو تعديل إنجاز لتحفيز المشاركين' : 
                  'Create or edit an achievement to motivate submitters'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">
                    {language === 'ar' ? 'اسم الإنجاز' : 'Achievement Name'}
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">
                    {language === 'ar' ? 'النوع' : 'Category'}
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: 'badge' | 'level' | 'special') => 
                      setFormData(prev => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="badge">
                        {language === 'ar' ? 'شارة' : 'Badge'}
                      </SelectItem>
                      <SelectItem value="level">
                        {language === 'ar' ? 'مستوى' : 'Level'}
                      </SelectItem>
                      <SelectItem value="special">
                        {language === 'ar' ? 'خاص' : 'Special'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">
                  {language === 'ar' ? 'الوصف' : 'Description'}
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="badge_icon">
                    {language === 'ar' ? 'أيقونة الشارة' : 'Badge Icon'}
                  </Label>
                  <Select
                    value={formData.badge_icon}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, badge_icon: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="star">⭐ Star</SelectItem>
                      <SelectItem value="crown">👑 Crown</SelectItem>
                      <SelectItem value="trophy">🏆 Trophy</SelectItem>
                      <SelectItem value="medal">🏅 Medal</SelectItem>
                      <SelectItem value="shield">🛡️ Shield</SelectItem>
                      <SelectItem value="target">🎯 Target</SelectItem>
                      <SelectItem value="lightbulb">💡 Lightbulb</SelectItem>
                      <SelectItem value="rocket">🚀 Rocket</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="badge_color">
                    {language === 'ar' ? 'لون الشارة' : 'Badge Color'}
                  </Label>
                  <Input
                    id="badge_color"
                    type="color"
                    value={formData.badge_color}
                    onChange={(e) => setFormData(prev => ({ ...prev, badge_color: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="points_required">
                    {language === 'ar' ? 'النقاط المطلوبة' : 'Points Required'}
                  </Label>
                  <Input
                    id="points_required"
                    type="number"
                    min="0"
                    value={formData.points_required}
                    onChange={(e) => setFormData(prev => ({ ...prev, points_required: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button type="submit">
                  {editingAchievement ? 
                    (language === 'ar' ? 'تحديث' : 'Update') :
                    (language === 'ar' ? 'إنشاء' : 'Create')
                  }
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Achievements Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {language === 'ar' ? 'الإنجازات الحالية' : 'Current Achievements'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === 'ar' ? 'الاسم' : 'Name'}</TableHead>
                <TableHead>{language === 'ar' ? 'النوع' : 'Category'}</TableHead>
                <TableHead>{language === 'ar' ? 'النقاط' : 'Points'}</TableHead>
                <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                <TableHead>{language === 'ar' ? 'الإجراءات' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {achievements.map((achievement) => (
                <TableRow key={achievement.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: achievement.badge_color }}
                      >
                        <span className="text-white text-sm">
                          {achievement.badge_icon === 'star' ? '⭐' :
                           achievement.badge_icon === 'crown' ? '👑' :
                           achievement.badge_icon === 'trophy' ? '🏆' :
                           achievement.badge_icon === 'medal' ? '🏅' :
                           achievement.badge_icon === 'shield' ? '🛡️' :
                           achievement.badge_icon === 'target' ? '🎯' :
                           achievement.badge_icon === 'lightbulb' ? '💡' :
                           achievement.badge_icon === 'rocket' ? '🚀' : '⭐'}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{achievement.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {achievement.description}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getCategoryColor(achievement.category)}>
                      <div className="flex items-center gap-1">
                        {getCategoryIcon(achievement.category)}
                        {achievement.category}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>{achievement.points_required}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={achievement.is_active}
                        onCheckedChange={(checked) => 
                          toggleAchievementStatus(achievement.id, checked)
                        }
                      />
                      <span className="text-sm">
                        {achievement.is_active ? 
                          (language === 'ar' ? 'نشط' : 'Active') :
                          (language === 'ar' ? 'غير نشط' : 'Inactive')
                        }
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(achievement)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteAchievement(achievement.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};