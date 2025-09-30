import { User, AVAILABLE_PERMISSIONS, ROLE_PERMISSIONS } from '@/types/user';

export const userStorageKeys = {
  users: 'restaurant_users',
  currentUser: 'current_user_session'
};

// Initialize default users
const DEFAULT_USERS: User[] = [
  {
    id: 'user_1',
    username: 'admin',
    password: 'restaurant123',
    email: 'admin@rosegarden.com',
    fullName: 'System Administrator',
    role: 'manager',
    permissions: AVAILABLE_PERMISSIONS,
    isActive: true,
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'user_2',
    username: 'manager',
    password: 'manager123',
    email: 'manager@rosegarden.com',
    fullName: 'Restaurant Manager',
    role: 'manager',
    permissions: AVAILABLE_PERMISSIONS.filter(p => ROLE_PERMISSIONS.manager.includes(p.id)),
    isActive: true,
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'user_3',
    username: 'staff1',
    password: 'staff123',
    email: 'staff1@rosegarden.com',
    fullName: 'Staff Member 1',
    role: 'staff',
    permissions: AVAILABLE_PERMISSIONS.filter(p => ROLE_PERMISSIONS.staff.includes(p.id)),
    isActive: true,
    createdAt: new Date().toISOString(),
    createdBy: 'system'
  }
];

export const initializeUsers = (): void => {
  const existingUsers = localStorage.getItem(userStorageKeys.users);
  if (!existingUsers) {
    localStorage.setItem(userStorageKeys.users, JSON.stringify(DEFAULT_USERS));
  }
};

export const getUsers = (): User[] => {
  initializeUsers();
  const stored = localStorage.getItem(userStorageKeys.users);
  return stored ? JSON.parse(stored) : [];
};

export const saveUser = (user: User): void => {
  const users = getUsers();
  const existingIndex = users.findIndex(u => u.id === user.id);
  
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  
  localStorage.setItem(userStorageKeys.users, JSON.stringify(users));
};

export const deleteUser = (userId: string): void => {
  const users = getUsers();
  const filteredUsers = users.filter(u => u.id !== userId);
  localStorage.setItem(userStorageKeys.users, JSON.stringify(filteredUsers));
};

export const authenticateUser = (username: string, password: string): User | null => {
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password && u.isActive);
  
  if (user) {
    // Update last login
    user.lastLogin = new Date().toISOString();
    saveUser(user);
    localStorage.setItem(userStorageKeys.currentUser, JSON.stringify(user));
    return user;
  }
  
  return null;
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(userStorageKeys.currentUser);
  return stored ? JSON.parse(stored) : null;
};

export const isUserLoggedIn = (): boolean => {
  return !!getCurrentUser();
};

export const logoutUser = (): void => {
  localStorage.removeItem(userStorageKeys.currentUser);
};

export const hasPermission = (permissionId: string): boolean => {
  const currentUser = getCurrentUser();
  if (!currentUser) return false;
  
  // Managers automatically get all permissions
  if (currentUser.role === 'manager') {
    return true;
  }
  
  return currentUser.permissions.some(p => p.id === permissionId);
};

export const generateUserId = (): string => {
  return 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const getUsersByRole = (role?: 'manager' | 'staff'): User[] => {
  const users = getUsers();
  return role ? users.filter(u => u.role === role) : users;
};

export const isManager = (): boolean => {
  const currentUser = getCurrentUser();
  return currentUser?.role === 'manager' || false;
};