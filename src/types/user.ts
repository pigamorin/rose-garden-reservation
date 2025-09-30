export interface User {
  id: string;
  username: string;
  password: string;
  email: string;
  fullName: string;
  role: 'manager' | 'staff';
  permissions: Permission[];
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  lastLogin?: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export const AVAILABLE_PERMISSIONS: Permission[] = [
  { id: 'view_reservations', name: 'View Reservations', description: 'Can view all reservations' },
  { id: 'manage_reservations', name: 'Manage Reservations', description: 'Can accept/decline reservations' },
  { id: 'mark_attendance', name: 'Mark Attendance', description: 'Can mark customer attendance' },
  { id: 'view_analytics', name: 'View Analytics', description: 'Can view analytics dashboard' },
  { id: 'export_data', name: 'Export Data', description: 'Can download CSV reports' },
  { id: 'manage_users', name: 'Manage Users', description: 'Can create and manage user accounts' },
  { id: 'view_all_data', name: 'View All Data', description: 'Can see data from all users (manager only)' }
];

export const ROLE_PERMISSIONS = {
  manager: ['view_reservations', 'manage_reservations', 'mark_attendance', 'view_analytics', 'export_data', 'manage_users', 'view_all_data'],
  staff: ['view_reservations', 'manage_reservations', 'mark_attendance']
};