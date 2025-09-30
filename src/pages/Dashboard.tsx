import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, ClockIcon, UsersIcon, TrendingUpIcon, CheckCircleIcon, XCircleIcon, SettingsIcon, UserCogIcon, ArrowLeftIcon, LogOutIcon, MailIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getReservations, updateReservationStatus, updateReservationAttendance } from '@/lib/storage';
import { getCurrentUser, hasPermission } from '@/lib/userStorage';
import { Reservation } from '@/types/reservation';
import ReservationCard from '@/components/ReservationCard';
import ReservationTable from '@/components/ReservationTable';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import UserManagement from '@/components/UserManagement';
import SlotManagement from '@/components/SlotManagement';
import EmailSetup from '@/components/EmailSetup';

export default function Dashboard() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [activeTab, setActiveTab] = useState('reservations');
  const currentUser = getCurrentUser();

  console.log('Dashboard - Current user:', currentUser);
  console.log('Dashboard - User permissions:', currentUser?.permissions);
  console.log('Dashboard - Has manage_users permission:', hasPermission('manage_users'));
  console.log('Dashboard - Has view_analytics permission:', hasPermission('view_analytics'));
  console.log('Dashboard - Has manage_slots permission:', hasPermission('manage_slots'));

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = () => {
    const allReservations = getReservations();
    setReservations(allReservations);
  };

  const handleStatusChange = (id: string, status: Reservation['status']) => {
    updateReservationStatus(id, status);
    loadReservations();
  };

  const handleAttendanceChange = (id: string, attendance: 'attended' | 'no-show') => {
    updateReservationAttendance(id, attendance);
    loadReservations();
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    window.location.href = '/';
  };

  const getStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayReservations = reservations.filter(r => r.date === today);
    
    return {
      total: reservations.length,
      pending: reservations.filter(r => r.status === 'pending').length,
      confirmed: reservations.filter(r => r.status === 'confirmed').length,
      todayTotal: todayReservations.length,
      todayAttended: todayReservations.filter(r => r.attendance === 'attended').length,
      todayNoShow: todayReservations.filter(r => r.attendance === 'no-show').length
    };
  };

  const stats = getStats();

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">Please log in to access the dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const availableTabs = [
    { id: 'reservations', label: 'Reservations', icon: CalendarIcon, permission: 'view_reservations' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUpIcon, permission: 'view_analytics' },
    { id: 'slots', label: 'Slot Management', icon: ClockIcon, permission: 'manage_slots' },
    { id: 'users', label: 'User Management', icon: UserCogIcon, permission: 'manage_users' },
    { id: 'email', label: 'Email Setup', icon: MailIcon, permission: 'manage_users' }
  ].filter(tab => hasPermission(tab.permission));

  console.log('Dashboard - Available tabs:', availableTabs.map(t => t.id));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
              <p className="text-gray-600">Welcome back, {currentUser.username}!</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeftIcon className="h-4 w-4" />
                  Back to Reservations
                </Button>
              </Link>
              <Badge variant="outline" className="flex items-center gap-1">
                <SettingsIcon className="h-3 w-3" />
                {currentUser.role}
              </Badge>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOutIcon className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reservations</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.todayAttended}/{stats.todayTotal}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.todayNoShow} no-shows
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            {availableTabs.map(tab => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="reservations" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Reservations</h2>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                >
                  Cards
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                >
                  Table
                </Button>
              </div>
            </div>

            {viewMode === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reservations.map((reservation) => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    onStatusChange={handleStatusChange}
                    onAttendanceChange={handleAttendanceChange}
                  />
                ))}
              </div>
            ) : (
              <ReservationTable
                reservations={reservations}
                onStatusChange={handleStatusChange}
                onAttendanceChange={handleAttendanceChange}
              />
            )}
          </TabsContent>

          {hasPermission('view_analytics') && (
            <TabsContent value="analytics">
              <AnalyticsDashboard reservations={reservations} />
            </TabsContent>
          )}

          {hasPermission('manage_slots') && (
            <TabsContent value="slots">
              <SlotManagement />
            </TabsContent>
          )}

          {hasPermission('manage_users') && (
            <TabsContent value="users">
              <UserManagement />
            </TabsContent>
          )}

          {hasPermission('manage_users') && (
            <TabsContent value="email">
              <EmailSetup />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}