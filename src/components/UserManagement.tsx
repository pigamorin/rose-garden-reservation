import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { UserPlusIcon, EditIcon, TrashIcon, ShieldIcon, UsersIcon, MailIcon, CalendarIcon } from 'lucide-react';
import { User, AVAILABLE_PERMISSIONS, ROLE_PERMISSIONS } from '@/types/user';
import { getUsers, saveUser, deleteUser, generateUserId, getCurrentUser } from '@/lib/userStorage';
import { toast } from 'sonner';

interface FormData {
  username: string;
  password: string;
  email: string;
  fullName: string;
  role: 'manager' | 'staff';
  permissions: string[];
  isActive: boolean;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    email: '',
    fullName: '',
    role: 'staff',
    permissions: [],
    isActive: true
  });

  const currentUser = getCurrentUser();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const allUsers = getUsers();
    setUsers(allUsers);
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      email: '',
      fullName: '',
      role: 'staff',
      permissions: [],
      isActive: true
    });
  };

  const handleCreateUser = () => {
    if (!formData.username || !formData.password || !formData.email || !formData.fullName) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check if username already exists
    const existingUser = users.find(u => u.username === formData.username);
    if (existingUser) {
      toast.error('Username already exists');
      return;
    }

    const newUser: User = {
      id: generateUserId(),
      username: formData.username,
      password: formData.password,
      email: formData.email,
      fullName: formData.fullName,
      role: formData.role,
      permissions: AVAILABLE_PERMISSIONS.filter(p => formData.permissions.includes(p.id)),
      isActive: formData.isActive,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.username || 'unknown'
    };

    saveUser(newUser);
    loadUsers();
    setIsCreateDialogOpen(false);
    resetForm();
    toast.success('User created successfully');
  };

  const handleEditUser = () => {
    if (!editingUser || !formData.username || !formData.email || !formData.fullName) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check if username already exists (excluding current user)
    const existingUser = users.find(u => u.username === formData.username && u.id !== editingUser.id);
    if (existingUser) {
      toast.error('Username already exists');
      return;
    }

    const updatedUser: User = {
      ...editingUser,
      username: formData.username,
      email: formData.email,
      fullName: formData.fullName,
      role: formData.role,
      permissions: AVAILABLE_PERMISSIONS.filter(p => formData.permissions.includes(p.id)),
      isActive: formData.isActive
    };

    // Only update password if provided
    if (formData.password) {
      updatedUser.password = formData.password;
    }

    saveUser(updatedUser);
    loadUsers();
    setIsEditDialogOpen(false);
    setEditingUser(null);
    resetForm();
    toast.success('User updated successfully');
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser?.id) {
      toast.error('You cannot delete your own account');
      return;
    }

    if (confirm('Are you sure you want to delete this user?')) {
      deleteUser(userId);
      loadUsers();
      toast.success('User deleted successfully');
    }
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '', // Don't pre-fill password for security
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      permissions: user.permissions.map(p => p.id),
      isActive: user.isActive
    });
    setIsEditDialogOpen(true);
  };

  const handleRoleChange = (role: 'manager' | 'staff') => {
    const defaultPermissions = ROLE_PERMISSIONS[role];
    setFormData(prev => ({
      ...prev,
      role,
      permissions: defaultPermissions
    }));
  };

  const togglePermission = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-gray-600">Manage staff accounts and permissions</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <UserPlusIcon className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new staff member to the system
              </DialogDescription>
            </DialogHeader>
            <UserForm
              formData={formData}
              setFormData={setFormData}
              onRoleChange={handleRoleChange}
              onTogglePermission={togglePermission}
              isEdit={false}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateUser}>Create User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Managers</CardTitle>
            <ShieldIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.role === 'manager').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff</CardTitle>
            <UsersIcon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.role === 'staff').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            Manage user accounts, roles, and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.fullName}</div>
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <MailIcon className="h-3 w-3" />
                          {user.email}
                        </div>
                        <div className="text-sm text-gray-500">@{user.username}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'manager' ? 'default' : 'secondary'}>
                        {user.role === 'manager' ? 'Manager' : 'Staff'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {user.permissions.length} permissions
                        <div className="text-xs text-gray-500">
                          {user.permissions.slice(0, 2).map(p => p.name).join(', ')}
                          {user.permissions.length > 2 && ` +${user.permissions.length - 2} more`}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? 'default' : 'secondary'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {user.lastLogin ? (
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3 text-gray-400" />
                            {new Date(user.lastLogin).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-gray-500">Never</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(user)}
                        >
                          <EditIcon className="h-3 w-3" />
                        </Button>
                        {user.id !== currentUser?.id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <TrashIcon className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions
            </DialogDescription>
          </DialogHeader>
          <UserForm
            formData={formData}
            setFormData={setFormData}
            onRoleChange={handleRoleChange}
            onTogglePermission={togglePermission}
            isEdit={true}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditUser}>Update User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface UserFormProps {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
  onRoleChange: (role: 'manager' | 'staff') => void;
  onTogglePermission: (permissionId: string) => void;
  isEdit: boolean;
}

function UserForm({ formData, setFormData, onRoleChange, onTogglePermission, isEdit }: UserFormProps) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
            placeholder="John Doe"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">Username *</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
            placeholder="johndoe"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="john@rosegarden.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{isEdit ? 'New Password (optional)' : 'Password *'}</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            placeholder={isEdit ? "Leave blank to keep current" : "Enter password"}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select value={formData.role} onValueChange={onRoleChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="staff">Staff</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Permissions</Label>
        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border rounded p-3">
          {AVAILABLE_PERMISSIONS.map((permission) => (
            <div key={permission.id} className="flex items-center space-x-2">
              <Checkbox
                id={permission.id}
                checked={formData.permissions.includes(permission.id)}
                onCheckedChange={() => onTogglePermission(permission.id)}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor={permission.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {permission.name}
                </label>
                <p className="text-xs text-muted-foreground">
                  {permission.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
        />
        <Label htmlFor="isActive">Account Active</Label>
      </div>
    </div>
  );
}