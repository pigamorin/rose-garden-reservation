import { Reservation } from '@/types/reservation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, ClockIcon, UsersIcon, PhoneIcon, MailIcon, MessageSquareIcon, CheckCircleIcon, XCircleIcon, UserCheckIcon } from 'lucide-react';
import { formatDate, formatTime, getCurrentStaff } from '@/lib/storage';

interface ReservationCardProps {
  reservation: Reservation;
  onStatusChange: (id: string, status: Reservation['status']) => void;
  onAttendanceChange?: (id: string, attendance: 'attended' | 'no-show') => void;
}

export default function ReservationCard({ reservation, onStatusChange, onAttendanceChange }: ReservationCardProps) {
  const getStatusColor = (status: Reservation['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'declined':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getAttendanceColor = (attendance?: string | null) => {
    switch (attendance) {
      case 'attended':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'no-show':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const isPending = reservation.status === 'pending';
  const isConfirmed = reservation.status === 'confirmed';
  const canMarkAttendance = isConfirmed && !reservation.attendance && onAttendanceChange;

  // Check if reservation date has passed
  const reservationDateTime = new Date(`${reservation.date}T${reservation.time}`);
  const now = new Date();
  const hasReservationPassed = reservationDateTime < now;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {reservation.customerName}
          </CardTitle>
          <div className="flex gap-2">
            <Badge className={getStatusColor(reservation.status)}>
              {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
            </Badge>
            {reservation.attendance && (
              <Badge className={getAttendanceColor(reservation.attendance)}>
                {reservation.attendance === 'attended' ? 'Attended' : 'No Show'}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Reservation Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span>{formatDate(reservation.date)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
            <span>{formatTime(reservation.time)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
            <span>{reservation.partySize} {reservation.partySize === 1 ? 'Guest' : 'Guests'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <PhoneIcon className="h-4 w-4 text-muted-foreground" />
            <span>{reservation.phone}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <MailIcon className="h-4 w-4 text-muted-foreground" />
          <span>{reservation.email}</span>
        </div>

        {/* Special Requests */}
        {reservation.specialRequests && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MessageSquareIcon className="h-4 w-4 text-muted-foreground" />
              <span>Special Requests:</span>
            </div>
            <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
              {reservation.specialRequests}
            </p>
          </div>
        )}

        {/* Attendance Information */}
        {reservation.attendance && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <UserCheckIcon className="h-4 w-4 text-muted-foreground" />
              <span>Attendance:</span>
            </div>
            <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
              <p>Status: <strong>{reservation.attendance === 'attended' ? 'Customer Attended' : 'No Show'}</strong></p>
              {reservation.attendanceMarkedAt && (
                <p>Marked: {new Date(reservation.attendanceMarkedAt).toLocaleString()}</p>
              )}
              {reservation.attendanceMarkedBy && (
                <p>By: {reservation.attendanceMarkedBy}</p>
              )}
            </div>
          </div>
        )}

        {/* Booking Time */}
        <div className="text-xs text-muted-foreground">
          Booked: {new Date(reservation.createdAt).toLocaleString()}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {/* Status Change Buttons */}
          {isPending && (
            <div className="flex gap-2">
              <Button
                onClick={() => onStatusChange(reservation.id, 'confirmed')}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Accept
              </Button>
              <Button
                onClick={() => onStatusChange(reservation.id, 'declined')}
                variant="destructive"
                className="flex-1"
              >
                Decline
              </Button>
            </div>
          )}

          {/* Attendance Buttons */}
          {canMarkAttendance && hasReservationPassed && (
            <div className="flex gap-2 pt-2 border-t">
              <Button
                onClick={() => onAttendanceChange(reservation.id, 'attended')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                Mark Attended
              </Button>
              <Button
                onClick={() => onAttendanceChange(reservation.id, 'no-show')}
                variant="outline"
                className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50"
                size="sm"
              >
                <XCircleIcon className="h-4 w-4 mr-1" />
                Mark No Show
              </Button>
            </div>
          )}

          {canMarkAttendance && !hasReservationPassed && (
            <div className="text-xs text-muted-foreground text-center py-2 border-t">
              Attendance can be marked after the reservation time
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}