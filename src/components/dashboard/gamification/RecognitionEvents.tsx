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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, Calendar as CalendarIcon, Users, Award, Star } from "lucide-react";
import { format } from "date-fns";

interface RecognitionEvent {
  id: string;
  title: string;
  description: string;
  event_type: 'ceremony' | 'announcement' | 'award';
  event_date: string;
  recipients: string[];
  created_by: string;
  status: 'planned' | 'completed' | 'cancelled';
  event_details: any;
  created_at: string;
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  department: string;
}

export const RecognitionEvents: React.FC = () => {
  const [events, setEvents] = useState<RecognitionEvent[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<RecognitionEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_type: "announcement" as 'ceremony' | 'announcement' | 'award',
    event_date: new Date(),
    recipients: [] as string[],
    status: "planned" as 'planned' | 'completed' | 'cancelled',
    event_details: {}
  });
  const { language } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
    fetchProfiles();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("recognition_events")
        .select("*")
        .order("event_date", { ascending: false });

      if (error) throw error;
      setEvents(data as RecognitionEvent[] || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في جلب الفعاليات' : 'Failed to fetch events',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, department")
        .eq("role", "submitter")
        .eq("is_active", true);

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const eventData = {
        ...formData,
        event_date: formData.event_date.toISOString().split('T')[0],
        event_details: JSON.stringify(formData.event_details),
        created_by: (await supabase.auth.getUser()).data.user?.id || ''
      };

      if (editingEvent) {
        const { error } = await supabase
          .from("recognition_events")
          .update(eventData)
          .eq("id", editingEvent.id);

        if (error) throw error;

        toast({
          title: language === 'ar' ? 'تم التحديث' : 'Updated',
          description: language === 'ar' ? 'تم تحديث الفعالية بنجاح' : 'Event updated successfully'
        });
      } else {
        const { error } = await supabase
          .from("recognition_events")
          .insert([eventData]);

        if (error) throw error;

        toast({
          title: language === 'ar' ? 'تم الإنشاء' : 'Created',
          description: language === 'ar' ? 'تم إنشاء الفعالية بنجاح' : 'Event created successfully'
        });
      }

      resetForm();
      fetchEvents();
    } catch (error) {
      console.error("Error saving event:", error);
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في حفظ الفعالية' : 'Failed to save event',
        variant: "destructive"
      });
    }
  };

  const updateEventStatus = async (id: string, status: 'planned' | 'completed' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from("recognition_events")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      setEvents(prev => 
        prev.map(event => 
          event.id === id ? { ...event, status } : event
        )
      );

      toast({
        title: language === 'ar' ? 'تم التحديث' : 'Updated',
        description: language === 'ar' ? 'تم تحديث حالة الفعالية' : 'Event status updated'
      });
    } catch (error) {
      console.error("Error updating event status:", error);
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في تحديث حالة الفعالية' : 'Failed to update event status',
        variant: "destructive"
      });
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه الفعالية؟' : 'Are you sure you want to delete this event?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from("recognition_events")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setEvents(prev => prev.filter(event => event.id !== id));
      
      toast({
        title: language === 'ar' ? 'تم الحذف' : 'Deleted',
        description: language === 'ar' ? 'تم حذف الفعالية بنجاح' : 'Event deleted successfully'
      });
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في حذف الفعالية' : 'Failed to delete event',
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      event_type: "announcement",
      event_date: new Date(),
      recipients: [],
      status: "planned",
      event_details: {}
    });
    setEditingEvent(null);
    setIsCreateDialogOpen(false);
    setSelectedDate(new Date());
  };

  const openEditDialog = (event: RecognitionEvent) => {
    setFormData({
      title: event.title,
      description: event.description || "",
      event_type: event.event_type,
      event_date: new Date(event.event_date),
      recipients: event.recipients || [],
      status: event.status,
      event_details: typeof event.event_details === 'string' ? JSON.parse(event.event_details) : event.event_details || {}
    });
    setEditingEvent(event);
    setSelectedDate(new Date(event.event_date));
    setIsCreateDialogOpen(true);
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'ceremony': return <Award className="h-4 w-4" />;
      case 'announcement': return <Star className="h-4 w-4" />;
      case 'award': return <CalendarIcon className="h-4 w-4" />;
      default: return <CalendarIcon className="h-4 w-4" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'ceremony': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'announcement': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'award': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'planned': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
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
          {language === 'ar' ? 'فعاليات التقدير' : 'Recognition Events'}
        </h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'فعالية جديدة' : 'New Event'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? 
                  (language === 'ar' ? 'تعديل الفعالية' : 'Edit Event') :
                  (language === 'ar' ? 'فعالية جديدة' : 'New Event')
                }
              </DialogTitle>
              <DialogDescription>
                {language === 'ar' ? 
                  'قم بإنشاء أو تعديل فعالية تقدير للمشاركين المتميزين' : 
                  'Create or edit a recognition event for outstanding submitters'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">
                    {language === 'ar' ? 'عنوان الفعالية' : 'Event Title'}
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="event_type">
                    {language === 'ar' ? 'نوع الفعالية' : 'Event Type'}
                  </Label>
                  <Select
                    value={formData.event_type}
                    onValueChange={(value: 'ceremony' | 'announcement' | 'award') => 
                      setFormData(prev => ({ ...prev, event_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ceremony">
                        {language === 'ar' ? 'حفل تكريم' : 'Ceremony'}
                      </SelectItem>
                      <SelectItem value="announcement">
                        {language === 'ar' ? 'إعلان' : 'Announcement'}
                      </SelectItem>
                      <SelectItem value="award">
                        {language === 'ar' ? 'جائزة' : 'Award'}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>
                    {language === 'ar' ? 'تاريخ الفعالية' : 'Event Date'}
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : (
                          language === 'ar' ? 'اختر التاريخ' : 'Pick a date'
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          setSelectedDate(date);
                          if (date) {
                            setFormData(prev => ({ ...prev, event_date: date }));
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="status">
                    {language === 'ar' ? 'الحالة' : 'Status'}
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: 'planned' | 'completed' | 'cancelled') => 
                      setFormData(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">
                        {language === 'ar' ? 'مخطط' : 'Planned'}
                      </SelectItem>
                      <SelectItem value="completed">
                        {language === 'ar' ? 'مكتمل' : 'Completed'}
                      </SelectItem>
                      <SelectItem value="cancelled">
                        {language === 'ar' ? 'ملغي' : 'Cancelled'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button type="submit">
                  {editingEvent ? 
                    (language === 'ar' ? 'تحديث' : 'Update') :
                    (language === 'ar' ? 'إنشاء' : 'Create')
                  }
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {language === 'ar' ? 'الفعاليات المجدولة' : 'Scheduled Events'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === 'ar' ? 'العنوان' : 'Title'}</TableHead>
                <TableHead>{language === 'ar' ? 'النوع' : 'Type'}</TableHead>
                <TableHead>{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
                <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                <TableHead>{language === 'ar' ? 'المستلمون' : 'Recipients'}</TableHead>
                <TableHead>{language === 'ar' ? 'الإجراءات' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {event.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getEventTypeColor(event.event_type)}>
                      <div className="flex items-center gap-1">
                        {getEventTypeIcon(event.event_type)}
                        {event.event_type}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(event.event_date), "PPP")}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={event.status}
                      onValueChange={(value: 'planned' | 'completed' | 'cancelled') => 
                        updateEventStatus(event.id, value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planned">
                          {language === 'ar' ? 'مخطط' : 'Planned'}
                        </SelectItem>
                        <SelectItem value="completed">
                          {language === 'ar' ? 'مكتمل' : 'Completed'}
                        </SelectItem>
                        <SelectItem value="cancelled">
                          {language === 'ar' ? 'ملغي' : 'Cancelled'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {event.recipients?.length || 0} {language === 'ar' ? 'مستلم' : 'recipients'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(event)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteEvent(event.id)}
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