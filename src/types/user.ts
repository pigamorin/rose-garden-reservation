export interface Permission {
  id: string;
  name: string;
  description: string;
}

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

export const AVAILABLE_PERMISSIONS: Permission[] = [
  {
    id: 'view_reservations',
    name: 'View Reservations',
    description: 'Can view all reservations in the system'
  },
  {
    id: 'manage_reservations',
    name: 'Manage Reservations',
    description: 'Can accept, decline, and modify reservations'
  },
  {
    id: 'mark_attendance',
    name: 'Mark Attendance',
    description: 'Can mark customers as attended or no-show'
  },
  {
    id: 'view_analytics',
    name: 'View Analytics',
    description: 'Can access analytics and reports dashboard'
  },
  {
    id: 'manage_users',
    name: 'Manage Users',
    description: 'Can create, edit, and delete user accounts'
  },
  {
    id: 'manage_slots',
    name: 'Manage Time Slots',
    description: 'Can block and unblock time slots'
  },
  {
    id: 'system_admin',
    name: 'System Administration',
    description: 'Full system access and configuration'
  }
];

export const ROLE_PERMISSIONS: Record<'manager' | 'staff', string[]> = {
  manager: [
    'view_reservations',
    'manage_reservations', 
    'mark_attendance',
    'view_analytics',
    'manage_users',
    'manage_slots',
    'system_admin'
  ],
  staff: [
    'view_reservations',
    'manage_reservations',
    'mark_attendance'
  ]
};