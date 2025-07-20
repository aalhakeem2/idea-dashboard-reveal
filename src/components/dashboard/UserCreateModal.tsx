import React, { useState } from 'react';
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

interface UserCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface CreateUserForm {
  email: string;
  password: string;
  confirmPassword: string;
  full_name: string;
  role: 'management' | 'evaluator' | 'submitter';
  department: string;
  specialization: string[];
}

const SPECIALIZATION_OPTIONS = [
  { value: 'technology', label: 'Technology' },
  { value: 'finance', label: 'Finance' },
  { value: 'commercial', label: 'Commercial' }
];

export const UserCreateModal: React.FC<UserCreateModalProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CreateUserForm>({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    role: 'submitter',
    department: '',
    specialization: []
  });

  const [errors, setErrors] = useState<Partial<CreateUserForm>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateUserForm> = {};

    if (!form.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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

      const { data, error } = await supabase.functions.invoke('admin-auth', {
        body: {
          action: 'create_user',
          email: form.email,
          password: form.password,
          userData: {
            full_name: form.full_name,
            role: form.role,
            department: form.department,
            specialization: form.specialization
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      toast.success(`User ${form.full_name} created successfully`);
      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setForm({
        email: '',
        password: '',
        confirmPassword: '',
        full_name: '',
        role: 'submitter',
        department: '',
        specialization: []
      });
      setErrors({});

    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleSpecializationChange = (value: string, checked: boolean) => {
    setForm(prev => ({
      ...prev,
      specialization: checked 
        ? [...prev.specialization, value]
        : prev.specialization.filter(s => s !== value)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('user_management', 'add_user')}</DialogTitle>
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
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && <span className="text-sm text-red-500">{errors.password}</span>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className={errors.confirmPassword ? 'border-red-500' : ''}
            />
            {errors.confirmPassword && <span className="text-sm text-red-500">{errors.confirmPassword}</span>}
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
                      checked={form.specialization.includes(option.value)}
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
              Create User
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};