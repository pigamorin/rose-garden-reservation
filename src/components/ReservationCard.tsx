import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, ClockIcon, UsersIcon, PhoneIcon, MailIcon, MessageSquareIcon, CheckIcon, XIcon, UserCheckIcon, UserXIcon } from 'lucide-react';
import { Reservation } from '@/types/reservation';
import { hasPermission } from '@/lib/userStorage';

interface ReservationCardProps {
  reservation: Reservation;
  onStatusChange: (id: string, status: Reservation['status']) => void;
  onAttendanceChange: (id: string, attendance: 'attended' | 'no-show') => void;
}

export default function ReservationCard({ reservation, onStatusChange, onAttendanceChange }: ReservationCardProps) {
  const canManageReservations = hasPermission('manage_reservations');
  const canMarkAttendance = hasPermission('mark_attendance');

  const getStatusColor = (status: Reservation['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'declined':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAttendanceBadge = (attendance?: 'attended' | 'no-show') => {
    if (!attendance) return <span className="text-gray-400">Pending</span>;
    
    const config = {
      attended: { variant: 'default' as const, color: 'text-blue-600', icon: UserCheckIcon, label: 'Attended' },
      'no-show': { variant: 'destructive' as const, color: 'text-orange-600', icon: UserXIcon, label: 'No Show' }
    };
    
    const { variant, icon: Icon, label } = config[attendance];
    
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`);
    return {
      date: dateObj.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const { date, time } = formatDateTime(reservation.date, reservation.time);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{reservation.name}</CardTitle>
          <Badge className={getStatusColor(reservation.status)}>
            {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Date & Time */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">{time}</span>
          </div>
        </div>

        {/* Party Size */}
        <div className="flex items-center gap-2">
          <UsersIcon className="h-4 w-4 text-gray-500" />
          <span className="text-sm">
            {reservation.partySize} {reservation.partySize === 1 ? 'person' : 'people'}
          </span>
        </div>

        {/* Contact Information */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MailIcon className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{reservation.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <PhoneIcon className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{reservation.phone}</span>
          </div>
        </div>

        {/* Special Requests */}
        {reservation.specialRequests && (
          <div className="flex items-start gap-2">
            <MessageSquareIcon className="h-4 w-4 text-gray-500 mt-0.5" />
            <div className="text-sm text-gray-600">
              <span className="font-medium">Special requests:</span> {reservation.specialRequests}
            </div>
          </div>
        )}

        {/* Attendance Section */}
        <div className="border-t pt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Attendance:</span>
            <div className="flex items-center gap-2">
              {canMarkAttendance && reservation.status === 'confirmed' ? (
                <Select
                  value={reservation.attendance || 'pending'}
                  onValueChange={(value) => {
                    if (value !== 'pending') {
                      onAttendanceChange(reservation.id, value as 'attended' | 'no-show');
                    }
                  }}
                >
                  <SelectTrigger className="w-32 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">
                      <span className="text-gray-500">Pending</span>
                    </SelectItem>
                    <SelectItem value="attended">
                      <div className="flex items-center gap-2">
                        <UserCheckIcon className="h-4 w-4 text-blue-600" />
                        <span>Attended</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="no-show">
                      <div className="flex items-center gap-2">
                        <UserXIcon className="h-4 w-4 text-orange-600" />
                        <span>No Show</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                getAttendanceBadge(reservation.attendance)
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {canManageReservations && reservation.status === 'pending' && (
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={() => onStatusChange(reservation.id, 'confirmed')}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              Confirm
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onStatusChange(reservation.id, 'declined')}
              className="flex-1"
            >
              <XIcon className="h-4 w-4 mr-2" />
              Decline
            </Button>
          </div>
        )}

        {reservation.status === 'confirmed' && (
          <div className="pt-2">
            <Badge variant="outline" className="text-xs">
              Reservation Confirmed
            </Badge>
          </div>
        )}

        {reservation.status === 'declined' && (
          <div className="pt-2">
            <Badge variant="outline" className="text-xs text-red-600">
              Reservation Declined
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}