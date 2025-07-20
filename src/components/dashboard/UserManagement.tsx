import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Users, 
  UserPlus, 
  Edit, 
  Shield, 
  ShieldOff, 
  Key, 
  Trash2, 
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  CheckCircle
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserEditModal } from './UserEditModal';
import { UserCreateModal } from './UserCreateModal';
import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;

interface UserStats {
  total: number;
  active: number;
  blocked: number;
  byRole: {
    management: number;
    evaluator: number;
    submitter: number;
  };
}

export const UserManagement: React.FC = () => {
  const { t } = useLanguage();
  const [users, setUsers] = useState<Profile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    active: 0,
    blocked: 0,
    byRole: { management: 0, evaluator: 0, submitter: 0 }
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setUsers(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (userData: Profile[]) => {
    const newStats: UserStats = {
      total: userData.length,
      active: userData.filter(u => u.is_active).length,
      blocked: userData.filter(u => !u.is_active).length,
      byRole: {
        management: userData.filter(u => u.role === 'management').length,
        evaluator: userData.filter(u => u.role === 'evaluator').length,
        submitter: userData.filter(u => u.role === 'submitter').length,
      }
    };
    setStats(newStats);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => 
        statusFilter === 'active' ? user.is_active : !user.is_active
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter]);

  const handleToggleUserStatus = async (user: Profile) => {
    try {
      const { error } = await supabase.rpc('admin_toggle_user_status', {
        p_user_id: user.id,
        p_is_active: !user.is_active,
        p_reason: `Admin ${!user.is_active ? 'unblocked' : 'blocked'} user`
      });

      if (error) throw error;

      toast.success(t('user_management', !user.is_active ? 'user_unblocked' : 'user_blocked'));
      await fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleResetPassword = async (user: Profile) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-auth', {
        body: {
          action: 'reset_password',
          userId: user.id
        }
      });

      if (error) throw error;

      toast.success(`Password reset for ${user.full_name}. Temporary password: ${data.tempPassword}`);
      await fetchUsers();
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Failed to reset password');
    }
  };

  const handleConfirmEmail = async (user: Profile) => {
    try {
      const { error } = await supabase.functions.invoke('admin-auth', {
        body: {
          action: 'confirm_email',
          userId: user.id
        }
      });

      if (error) throw error;

      toast.success(`Email confirmed for ${user.full_name}`);
      await fetchUsers();
    } catch (error) {
      console.error('Error confirming email:', error);
      toast.error('Failed to confirm email');
    }
  };

  const handleDeleteUser = async (user: Profile) => {
    try {
      const { error } = await supabase.functions.invoke('admin-auth', {
        body: {
          action: 'delete_user',
          userId: user.id
        }
      });

      if (error) throw error;

      toast.success(`User ${user.full_name} deleted successfully`);
      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return t('user_management', 'never');
    return new Date(date).toLocaleDateString();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'management': return 'bg-red-100 text-red-800';
      case 'evaluator': return 'bg-blue-100 text-blue-800';
      case 'submitter': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('user_management', 'total_users')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('user_management', 'active_users')}</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('user_management', 'blocked_users')}</CardTitle>
            <ShieldOff className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.blocked}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Evaluators</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.byRole.evaluator}</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t('user_management', 'search_users')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder={t('user_management', 'filter_by_role')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('user_management', 'all_roles')}</SelectItem>
              <SelectItem value="management">Management</SelectItem>
              <SelectItem value="evaluator">Evaluator</SelectItem>
              <SelectItem value="submitter">Submitter</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">{t('user_management', 'active')}</SelectItem>
              <SelectItem value="blocked">{t('user_management', 'blocked')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          {t('user_management', 'add_user')}
        </Button>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('user_management', 'title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>{t('user_management', 'user_status')}</TableHead>
                <TableHead>{t('user_management', 'last_login')}</TableHead>
                <TableHead>{t('user_management', 'created_at')}</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">No users found</TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.email}
                        {user.email_confirmed && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(user.role || '')}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.department || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? 'default' : 'destructive'}>
                        {user.is_active ? t('user_management', 'active') : t('user_management', 'blocked')}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.last_login)}</TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setShowEditModal(true);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            {t('user_management', 'edit_user')}
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem
                            onClick={() => handleToggleUserStatus(user)}
                          >
                            {user.is_active ? (
                              <><ShieldOff className="mr-2 h-4 w-4" />{t('user_management', 'block_user')}</>
                            ) : (
                              <><Shield className="mr-2 h-4 w-4" />{t('user_management', 'unblock_user')}</>
                            )}
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => handleResetPassword(user)}
                          >
                            <Key className="mr-2 h-4 w-4" />
                            {t('user_management', 'reset_password')}
                          </DropdownMenuItem>

                          {!user.email_confirmed && (
                            <DropdownMenuItem
                              onClick={() => handleConfirmEmail(user)}
                            >
                              <Mail className="mr-2 h-4 w-4" />
                              Confirm Email
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t('user_management', 'delete_user')}
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t('user_management', 'confirm_delete')}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteUser(user)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modals */}
      <UserCreateModal 
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={fetchUsers}
      />

      {selectedUser && (
        <UserEditModal 
          open={showEditModal}
          onOpenChange={setShowEditModal}
          user={selectedUser}
          onSuccess={fetchUsers}
        />
      )}
    </div>
  );
};