import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckIcon, XIcon, ClockIcon, UserCheckIcon, UserXIcon } from 'lucide-react';
import { Reservation } from '@/types/reservation';
import { hasPermission } from '@/lib/userStorage';

interface ReservationTableProps {
  reservations: Reservation[];
  onStatusChange: (id: string, status: Reservation['status']) => void;
  onAttendanceChange: (id: string, attendance: 'attended' | 'no-show') => void;
}

export default function ReservationTable({ 
  reservations, 
  onStatusChange, 
  onAttendanceChange 
}: ReservationTableProps) {
  const getStatusBadge = (status: Reservation['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'confirmed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'declined':
        return <Badge variant="destructive">Declined</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getAttendanceBadge = (attendance?: 'attended' | 'no-show') => {
    if (!attendance) return <span className="text-gray-400">-</span>;
    
    switch (attendance) {
      case 'attended':
        return <Badge variant="default" className="bg-blue-100 text-blue-800 flex items-center gap-1">
          <UserCheckIcon className="h-3 w-3" />
          Attended
        </Badge>;
      case 'no-show':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <UserXIcon className="h-3 w-3" />
          No Show
        </Badge>;
      default:
        return <span className="text-gray-400">-</span>;
    }
  };

  const handleAttendanceSelect = (reservationId: string, value: string) => {
    if (value === 'attended' || value === 'no-show') {
      onAttendanceChange(reservationId, value);
    }
  };

  if (reservations.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No reservations found</h3>
        <p className="text-gray-500">
          Reservations will appear here when customers make bookings.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>Customer</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Party Size</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Attendance</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.map((reservation) => (
            <TableRow key={reservation.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{reservation.name}</div>
                  {reservation.specialRequests && (
                    <div className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Note:</span> {reservation.specialRequests}
                    </div>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                <div>
                  <div className="font-medium">{reservation.date}</div>
                  <div className="text-sm text-gray-600">{reservation.time}</div>
                </div>
              </TableCell>
              
              <TableCell>
                <Badge variant="outline">{reservation.partySize} people</Badge>
              </TableCell>
              
              <TableCell>
                <div className="text-sm">
                  <div>{reservation.email}</div>
                  <div className="text-gray-600">{reservation.phone}</div>
                </div>
              </TableCell>
              
              <TableCell>
                {getStatusBadge(reservation.status)}
              </TableCell>
              
              <TableCell>
                <div className="flex flex-col gap-2">
                  {/* Current attendance status */}
                  {getAttendanceBadge(reservation.attendance)}
                  
                  {/* Attendance dropdown - only show for confirmed reservations */}
                  {reservation.status === 'confirmed' && hasPermission('mark_attendance') && (
                    <Select
                      value={reservation.attendance || ''}
                      onValueChange={(value) => handleAttendanceSelect(reservation.id, value)}
                    >
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue placeholder="Mark..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="attended" className="text-xs">
                          <div className="flex items-center gap-2">
                            <UserCheckIcon className="h-3 w-3 text-blue-600" />
                            Attended
                          </div>
                        </SelectItem>
                        <SelectItem value="no-show" className="text-xs">
                          <div className="flex items-center gap-2">
                            <UserXIcon className="h-3 w-3 text-red-600" />
                            No Show
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex gap-2">
                  {reservation.status === 'pending' && hasPermission('manage_reservations') && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => onStatusChange(reservation.id, 'confirmed')}
                      >
                        <CheckIcon className="h-3 w-3 mr-1" />
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => onStatusChange(reservation.id, 'declined')}
                      >
                        <XIcon className="h-3 w-3 mr-1" />
                        Decline
                      </Button>
                    </>
                  )}
                  
                  {reservation.status === 'confirmed' && hasPermission('manage_reservations') && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => onStatusChange(reservation.id, 'declined')}
                    >
                      <XIcon className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}