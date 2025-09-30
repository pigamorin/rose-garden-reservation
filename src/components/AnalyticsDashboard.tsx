import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DownloadIcon, PieChartIcon, BarChartIcon } from 'lucide-react';
import { Reservation } from '@/types/reservation';

interface AnalyticsDashboardProps {
  reservations: Reservation[];
}

interface DailyStat {
  date: string;
  count: number;
  confirmed: number;
  pending: number;
  declined: number;
  attended: number;
  noShow: number;
  totalGuests: number;
}

interface Analytics {
  dailyStats: DailyStat[];
  statusStats: {
    confirmed: number;
    pending: number;
    declined: number;
  };
  attendanceStats: {
    attended: number;
    noShow: number;
    pending: number;
  };
  highReservationDays: DailyStat[];
  lowReservationDays: DailyStat[];
  totalReservations: number;
  totalGuests: number;
  attendanceRate: number;
}

export default function AnalyticsDashboard({ reservations }: AnalyticsDashboardProps) {
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');

  const analytics = useMemo((): Analytics => {
    // Group reservations by date
    const reservationsByDate = reservations.reduce((acc, reservation) => {
      const date = reservation.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(reservation);
      return acc;
    }, {} as Record<string, Reservation[]>);

    // Calculate daily stats
    const dailyStats: DailyStat[] = Object.entries(reservationsByDate).map(([date, dayReservations]) => ({
      date,
      count: dayReservations.length,
      confirmed: dayReservations.filter(r => r.status === 'confirmed').length,
      pending: dayReservations.filter(r => r.status === 'pending').length,
      declined: dayReservations.filter(r => r.status === 'declined').length,
      attended: dayReservations.filter(r => r.attendance === 'attended').length,
      noShow: dayReservations.filter(r => r.attendance === 'no-show').length,
      totalGuests: dayReservations.reduce((sum, r) => sum + r.partySize, 0)
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Status distribution
    const statusStats = {
      confirmed: reservations.filter(r => r.status === 'confirmed').length,
      pending: reservations.filter(r => r.status === 'pending').length,
      declined: reservations.filter(r => r.status === 'declined').length
    };

    // Attendance distribution
    const attendanceStats = {
      attended: reservations.filter(r => r.attendance === 'attended').length,
      noShow: reservations.filter(r => r.attendance === 'no-show').length,
      pending: reservations.filter(r => r.status === 'confirmed' && !r.attendance).length
    };

    // Calculate attendance rate
    const totalWithAttendanceData = attendanceStats.attended + attendanceStats.noShow;
    const attendanceRate = totalWithAttendanceData > 0 ? (attendanceStats.attended / totalWithAttendanceData) * 100 : 0;

    // Find high and low reservation days
    const sortedByCount = [...dailyStats].sort((a, b) => b.count - a.count);
    const highReservationDays = sortedByCount.slice(0, 3);
    const lowReservationDays = sortedByCount.slice(-3).reverse();

    return {
      dailyStats,
      statusStats,
      attendanceStats,
      highReservationDays,
      lowReservationDays,
      totalReservations: reservations.length,
      totalGuests: reservations.reduce((sum, r) => sum + r.partySize, 0),
      attendanceRate
    };
  }, [reservations]);

  const downloadCSV = () => {
    const headers = [
      'Date',
      'Customer Name',
      'Email',
      'Phone',
      'Time',
      'Party Size',
      'Status',
      'Attendance',
      'Special Requests',
      'Created At',
      'Attendance Marked At',
      'Attendance Marked By'
    ];

    const csvContent = [
      headers.join(','),
      ...reservations.map(reservation => [
        reservation.date,
        `"${reservation.customerName}"`,
        reservation.email,
        reservation.phone,
        reservation.time,
        reservation.partySize,
        reservation.status,
        reservation.attendance || 'Not Marked',
        `"${reservation.specialRequests || ''}"`,
        new Date(reservation.createdAt).toLocaleString(),
        reservation.attendanceMarkedAt ? new Date(reservation.attendanceMarkedAt).toLocaleString() : '',
        reservation.attendanceMarkedBy || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `rose-garden-reservations-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadDailyStatsCSV = () => {
    const headers = [
      'Date',
      'Total Reservations',
      'Confirmed',
      'Pending',
      'Declined',
      'Attended',
      'No Shows',
      'Total Guests',
      'Attendance Rate %'
    ];

    const csvContent = [
      headers.join(','),
      ...analytics.dailyStats.map(stat => {
        const dayAttendanceRate = (stat.attended + stat.noShow) > 0 
          ? ((stat.attended / (stat.attended + stat.noShow)) * 100).toFixed(1)
          : '0';
        return [
          stat.date,
          stat.count,
          stat.confirmed,
          stat.pending,
          stat.declined,
          stat.attended,
          stat.noShow,
          stat.totalGuests,
          dayAttendanceRate
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `rose-garden-daily-stats-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (reservations.length === 0) {
    return (
      <div className="text-center py-12">
        <PieChartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
        <p className="text-gray-500">
          Analytics will appear here when you have reservation data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Attendance Rate Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-green-600">Attendance Rate</CardTitle>
          <CardDescription>
            Percentage of confirmed reservations that attended
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600 mb-2">
            {analytics.attendanceRate.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">
            {analytics.attendanceStats.attended} attended out of {analytics.attendanceStats.attended + analytics.attendanceStats.noShow} completed reservations
          </div>
        </CardContent>
      </Card>

      {/* Download Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DownloadIcon className="h-5 w-5" />
            Download Reports
          </CardTitle>
          <CardDescription>
            Export reservation data and analytics for reporting (includes attendance data)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={downloadCSV} variant="outline">
              <DownloadIcon className="h-4 w-4 mr-2" />
              All Reservations CSV
            </Button>
            <Button onClick={downloadDailyStatsCSV} variant="outline">
              <DownloadIcon className="h-4 w-4 mr-2" />
              Daily Statistics CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chart Type Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Reservation Analytics</CardTitle>
          <CardDescription>
            Visual representation of reservation data and attendance trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Button
              variant={chartType === 'pie' ? 'default' : 'outline'}
              onClick={() => setChartType('pie')}
              className="flex items-center gap-2"
            >
              <PieChartIcon className="h-4 w-4" />
              Pie Chart
            </Button>
            <Button
              variant={chartType === 'bar' ? 'default' : 'outline'}
              onClick={() => setChartType('bar')}
              className="flex items-center gap-2"
            >
              <BarChartIcon className="h-4 w-4" />
              Bar Chart
            </Button>
          </div>

          {chartType === 'pie' ? (
            <PieChart analytics={analytics} />
          ) : (
            <BarChart analytics={analytics} />
          )}
        </CardContent>
      </Card>

      {/* High/Low Reservation Days */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">High Reservation Days</CardTitle>
            <CardDescription>Days with the most reservations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.highReservationDays.map((day) => (
                <div key={day.date} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-medium">
                      {new Date(day.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-sm text-gray-600">
                      {day.totalGuests} guests • {day.attended} attended • {day.noShow} no-shows
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {day.count} reservations
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-orange-600">Low Reservation Days</CardTitle>
            <CardDescription>Days with the fewest reservations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.lowReservationDays.map((day) => (
                <div key={day.date} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <div className="font-medium">
                      {new Date(day.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-sm text-gray-600">
                      {day.totalGuests} guests • {day.attended} attended • {day.noShow} no-shows
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    {day.count} reservations
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface ChartProps {
  analytics: Analytics;
}

function PieChart({ analytics }: ChartProps) {
  const { attendanceStats } = analytics;
  const total = attendanceStats.attended + attendanceStats.noShow + attendanceStats.pending;
  
  if (total === 0) {
    return <div className="text-center text-gray-500">No attendance data available</div>;
  }
  
  const data = [
    { label: 'Attended', value: attendanceStats.attended, color: '#10b981', percentage: ((attendanceStats.attended / total) * 100).toFixed(1) },
    { label: 'No Show', value: attendanceStats.noShow, color: '#f59e0b', percentage: ((attendanceStats.noShow / total) * 100).toFixed(1) },
    { label: 'Pending Check-in', value: attendanceStats.pending, color: '#6b7280', percentage: ((attendanceStats.pending / total) * 100).toFixed(1) }
  ];

  return (
    <div className="flex flex-col md:flex-row items-center gap-8">
      <div className="relative w-64 h-64">
        <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
          {data.reduce((acc, item, index) => {
            const previousPercentage = data.slice(0, index).reduce((sum, prev) => sum + (prev.value / total), 0);
            const currentPercentage = item.value / total;
            const startAngle = previousPercentage * 360;
            const endAngle = startAngle + (currentPercentage * 360);
            
            const startX = 100 + 80 * Math.cos((startAngle * Math.PI) / 180);
            const startY = 100 + 80 * Math.sin((startAngle * Math.PI) / 180);
            const endX = 100 + 80 * Math.cos((endAngle * Math.PI) / 180);
            const endY = 100 + 80 * Math.sin((endAngle * Math.PI) / 180);
            
            const largeArcFlag = currentPercentage > 0.5 ? 1 : 0;
            
            const pathData = [
              `M 100 100`,
              `L ${startX} ${startY}`,
              `A 80 80 0 ${largeArcFlag} 1 ${endX} ${endY}`,
              'Z'
            ].join(' ');
            
            acc.push(
              <path
                key={item.label}
                d={pathData}
                fill={item.color}
                stroke="white"
                strokeWidth="2"
              />
            );
            
            return acc;
          }, [] as JSX.Element[])}
        </svg>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Attendance Distribution</h3>
        {data.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="font-medium">{item.label}</span>
            <span className="text-gray-600">
              {item.value} ({item.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({ analytics }: ChartProps) {
  const { dailyStats } = analytics;
  const maxCount = Math.max(...dailyStats.map(d => d.count));

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Daily Reservations & Attendance</h3>
      <div className="space-y-3">
        {dailyStats.map((day) => (
          <div key={day.date} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">
                {new Date(day.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
              <span className="text-gray-600">{day.count} reservations</span>
            </div>
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-6">
                <div
                  className="bg-pink-600 h-6 rounded-full flex items-center justify-end pr-2"
                  style={{ width: `${(day.count / maxCount) * 100}%` }}
                >
                  <span className="text-white text-xs font-medium">
                    {day.totalGuests} guests
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 text-xs">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {day.confirmed} confirmed
              </Badge>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                {day.pending} pending
              </Badge>
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                {day.declined} declined
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {day.attended} attended
              </Badge>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                {day.noShow} no-shows
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}