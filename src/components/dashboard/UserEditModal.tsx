import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;

interface UserEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: Profile;
  onSuccess: () => void;
}

interface EditUserForm {
  email: string;
  full_name: string;
  role: 'management' | 'evaluator' | 'submitter';
  department: string;
  specialization: ('technology' | 'finance' | 'commercial')[];
}

const SPECIALIZATION_OPTIONS = [
  { value: 'technology', label: 'Technology' },
  { value: 'finance', label: 'Finance' },
  { value: 'commercial', label: 'Commercial' }
];

export const UserEditModal: React.FC<UserEditModalProps> = ({
  open,
  onOpenChange,
  user,
  onSuccess
}) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<EditUserForm>({
    email: '',
    full_name: '',
    role: 'submitter',
    department: '',
    specialization: []
  });

  const [errors, setErrors] = useState<Partial<EditUserForm>>({});

  useEffect(() => {
    if (user && open) {
      setForm({
        email: user.email || '',
        full_name: user.full_name || '',
        role: user.role as 'management' | 'evaluator' | 'submitter',
        department: user.department || '',
        specialization: (user.specialization || []) as ('technology' | 'finance' | 'commercial')[]
      });
      setErrors({});
    }
  }, [user, open]);

  const validateForm = (): boolean => {
    const newErrors: Partial<EditUserForm> = {};

    if (!form.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!form.full_name) {
      newErrors.full_name = 'Full name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: form.full_name,
          department: form.department,
          updated_by: user.id
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update role if changed
      if (form.role !== user.role) {
        const { error: roleError } = await supabase.rpc('admin_update_user_role', {
          p_user_id: user.id,
          p_new_role: form.role,
          p_specialization: form.specialization
        });

        if (roleError) throw roleError;
      } else if (form.specialization.toString() !== (user.specialization || []).toString()) {
        // Update specialization only
        const { error: specError } = await supabase
          .from('profiles')
          .update({
            specialization: form.specialization,
            updated_by: user.id
          })
          .eq('id', user.id);

        if (specError) throw specError;
      }

      // Update email if changed
      if (form.email !== user.email) {
        const { error: emailError } = await supabase.functions.invoke('admin-auth', {
          body: {
            action: 'update_email',
            userId: user.id,
            newEmail: form.email
          }
        });

        if (emailError) throw emailError;
      }

      toast.success(`User ${form.full_name} updated successfully`);
      onSuccess();
      onOpenChange(false);

    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleSpecializationChange = (value: string, checked: boolean) => {
    const validValue = value as 'technology' | 'finance' | 'commercial';
    setForm(prev => ({
      ...prev,
      specialization: checked 
        ? [...prev.specialization, validValue]
        : prev.specialization.filter(s => s !== validValue)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('user_management', 'edit_user')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <span className="text-sm text-red-500">{errors.email}</span>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              value={form.full_name}
              onChange={(e) => setForm(prev => ({ ...prev, full_name: e.target.value }))}
              className={errors.full_name ? 'border-red-500' : ''}
            />
            {errors.full_name && <span className="text-sm text-red-500">{errors.full_name}</span>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select value={form.role} onValueChange={(value: any) => setForm(prev => ({ ...prev, role: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="submitter">Submitter</SelectItem>
                <SelectItem value="evaluator">Evaluator</SelectItem>
                <SelectItem value="management">Management</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={form.department}
              onChange={(e) => setForm(prev => ({ ...prev, department: e.target.value }))}
            />
          </div>

          {form.role === 'evaluator' && (
            <div className="space-y-2">
              <Label>Specialization</Label>
              <div className="space-y-2">
                {SPECIALIZATION_OPTIONS.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.value}
                      checked={form.specialization.includes(option.value as 'technology' | 'finance' | 'commercial')}
                      onCheckedChange={(checked) => 
                        handleSpecializationChange(option.value, checked as boolean)
                      }
                    />
                    <Label htmlFor={option.value} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update User
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};