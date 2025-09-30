import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FlowerIcon, LogOutIcon, CalendarIcon, ClockIcon, UsersIcon, TrendingUpIcon, TableIcon, BarChartIcon, HomeIcon, UserCheckIcon } from 'lucide-react';
import ReservationCard from '@/components/ReservationCard';
import ReservationTable from '@/components/ReservationTable';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import { Reservation } from '@/types/reservation';
import { 
  getReservations, 
  updateReservationStatus, 
  updateReservationAttendance,
  isStaffLoggedIn, 
  logoutStaff, 
  getCurrentStaff 
} from '@/lib/storage';

export default function StaffDashboard() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [activeTab, setActiveTab] = useState('cards');
  const [filterTab, setFilterTab] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if staff is logged in
    if (!isStaffLoggedIn()) {
      navigate('/staff-login');
      return;
    }

    // Load reservations
    loadReservations();
  }, [navigate]);

  const loadReservations = () => {
    const allReservations = getReservations();
    // Sort by date and time (most recent first)
    const sortedReservations = allReservations.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateB.getTime() - dateA.getTime();
    });
    setReservations(sortedReservations);
  };

  const handleStatusChange = (id: string, status: Reservation['status']) => {
    updateReservationStatus(id, status);
    loadReservations();
  };

  const handleAttendanceChange = (id: string, attendance: 'attended' | 'no-show') => {
    const currentStaff = getCurrentStaff();
    if (currentStaff) {
      updateReservationAttendance(id, attendance, currentStaff);
      loadReservations();
    }
  };

  const handleLogout = () => {
    logoutStaff();
    navigate('/staff-login');
  };

  const filterReservations = (status?: Reservation['status']) => {
    if (!status) return reservations;
    return reservations.filter(reservation => reservation.status === status);
  };

  const getStats = () => {
    const total = reservations.length;
    const pending = reservations.filter(r => r.status === 'pending').length;
    const confirmed = reservations.filter(r => r.status === 'confirmed').length;
    const declined = reservations.filter(r => r.status === 'declined').length;
    const attended = reservations.filter(r => r.attendance === 'attended').length;
    const noShow = reservations.filter(r => r.attendance === 'no-show').length;

    return { total, pending, confirmed, declined, attended, noShow };
  };

  const stats = getStats();
  const currentStaff = getCurrentStaff();

  const getFilteredReservations = () => {
    return filterTab === 'all' ? reservations : filterReservations(filterTab as Reservation['status']);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FlowerIcon className="h-8 w-8 text-pink-600" />
                <h1 className="text-2xl font-bold text-pink-600">Rose Garden</h1>
              </div>
              <Badge variant="secondary">Staff Dashboard</Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <HomeIcon className="h-4 w-4" />
                  Back to Reservations
                </Button>
              </Link>
              <span className="text-sm text-gray-600">
                Welcome, <strong>{currentStaff}</strong>
              </span>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOutIcon className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <ClockIcon className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <TrendingUpIcon className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Declined</CardTitle>
              <UsersIcon className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.declined}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attended</CardTitle>
              <UserCheckIcon className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.attended}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">No Shows</CardTitle>
              <UserCheckIcon className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.noShow}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Dashboard</CardTitle>
            <CardDescription>
              Manage reservations, track attendance, and view analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="cards" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Card View
                </TabsTrigger>
                <TabsTrigger value="table" className="flex items-center gap-2">
                  <TableIcon className="h-4 w-4" />
                  Table View
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChartIcon className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="cards">
                {/* Filter Tabs for Cards */}
                <Tabs value={filterTab} onValueChange={setFilterTab}>
                  <TabsList className="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger value="all">
                      All ({stats.total})
                    </TabsTrigger>
                    <TabsTrigger value="pending">
                      Pending ({stats.pending})
                    </TabsTrigger>
                    <TabsTrigger value="confirmed">
                      Confirmed ({stats.confirmed})
                    </TabsTrigger>
                    <TabsTrigger value="declined">
                      Declined ({stats.declined})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value={filterTab}>
                    <ReservationsList 
                      reservations={getFilteredReservations()}
                      onStatusChange={handleStatusChange}
                      onAttendanceChange={handleAttendanceChange}
                    />
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value="table">
                {/* Filter Tabs for Table */}
                <Tabs value={filterTab} onValueChange={setFilterTab}>
                  <TabsList className="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger value="all">
                      All ({stats.total})
                    </TabsTrigger>
                    <TabsTrigger value="pending">
                      Pending ({stats.pending})
                    </TabsTrigger>
                    <TabsTrigger value="confirmed">
                      Confirmed ({stats.confirmed})
                    </TabsTrigger>
                    <TabsTrigger value="declined">
                      Declined ({stats.declined})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value={filterTab}>
                    <ReservationTable 
                      reservations={getFilteredReservations()}
                      onStatusChange={handleStatusChange}
                      onAttendanceChange={handleAttendanceChange}
                    />
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value="analytics">
                <AnalyticsDashboard reservations={reservations} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

interface ReservationsListProps {
  reservations: Reservation[];
  onStatusChange: (id: string, status: Reservation['status']) => void;
  onAttendanceChange: (id: string, attendance: 'attended' | 'no-show') => void;
}

function ReservationsList({ reservations, onStatusChange, onAttendanceChange }: ReservationsListProps) {
  if (reservations.length === 0) {
    return (
      <div className="text-center py-12">
        <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No reservations found</h3>
        <p className="text-gray-500">
          Reservations will appear here when customers make bookings.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {reservations.map((reservation) => (
        <ReservationCard
          key={reservation.id}
          reservation={reservation}
          onStatusChange={onStatusChange}
          onAttendanceChange={onAttendanceChange}
        />
      ))}
    </div>
  );
}