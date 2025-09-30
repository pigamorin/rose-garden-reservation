import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckIcon, XIcon, CalendarIcon, ClockIcon, UsersIcon, PhoneIcon, MailIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { Reservation } from '@/types/reservation';
import { formatDate, formatTime } from '@/lib/storage';

interface ReservationTableProps {
  reservations: Reservation[];
  onStatusChange: (id: string, status: Reservation['status']) => void;
  onAttendanceChange?: (id: string, attendance: 'attended' | 'no-show') => void;
}

export default function ReservationTable({ reservations, onStatusChange, onAttendanceChange }: ReservationTableProps) {
  const [columnWidths, setColumnWidths] = useState({
    name: 150,
    contact: 200,
    date: 120,
    time: 100,
    guests: 80,
    status: 100,
    attendance: 120,
    requests: 200,
    actions: 200
  });

  const handleResize = (column: string, width: number) => {
    setColumnWidths(prev => ({ ...prev, [column]: Math.max(80, width) }));
  };

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
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <ResizableTableHead 
                width={columnWidths.name}
                onResize={(width) => handleResize('name', width)}
              >
                <div className="flex items-center gap-2">
                  <UsersIcon className="h-4 w-4" />
                  Customer
                </div>
              </ResizableTableHead>
              <ResizableTableHead 
                width={columnWidths.contact}
                onResize={(width) => handleResize('contact', width)}
              >
                <div className="flex items-center gap-2">
                  <PhoneIcon className="h-4 w-4" />
                  Contact
                </div>
              </ResizableTableHead>
              <ResizableTableHead 
                width={columnWidths.date}
                onResize={(width) => handleResize('date', width)}
              >
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Date
                </div>
              </ResizableTableHead>
              <ResizableTableHead 
                width={columnWidths.time}
                onResize={(width) => handleResize('time', width)}
              >
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-4 w-4" />
                  Time
                </div>
              </ResizableTableHead>
              <ResizableTableHead 
                width={columnWidths.guests}
                onResize={(width) => handleResize('guests', width)}
              >
                Guests
              </ResizableTableHead>
              <ResizableTableHead 
                width={columnWidths.status}
                onResize={(width) => handleResize('status', width)}
              >
                Status
              </ResizableTableHead>
              <ResizableTableHead 
                width={columnWidths.attendance}
                onResize={(width) => handleResize('attendance', width)}
              >
                Attendance
              </ResizableTableHead>
              <ResizableTableHead 
                width={columnWidths.requests}
                onResize={(width) => handleResize('requests', width)}
              >
                Special Requests
              </ResizableTableHead>
              <ResizableTableHead 
                width={columnWidths.actions}
                onResize={(width) => handleResize('actions', width)}
              >
                Actions
              </ResizableTableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.map((reservation) => {
              const reservationDateTime = new Date(`${reservation.date}T${reservation.time}`);
              const now = new Date();
              const hasReservationPassed = reservationDateTime < now;
              const canMarkAttendance = reservation.status === 'confirmed' && !reservation.attendance && onAttendanceChange && hasReservationPassed;

              return (
                <TableRow key={reservation.id} className="hover:bg-gray-50">
                  <TableCell style={{ width: columnWidths.name }}>
                    <div className="font-medium">{reservation.customerName}</div>
                  </TableCell>
                  <TableCell style={{ width: columnWidths.contact }}>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-1">
                        <MailIcon className="h-3 w-3 text-gray-400" />
                        <span className="truncate">{reservation.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <PhoneIcon className="h-3 w-3 text-gray-400" />
                        <span>{reservation.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell style={{ width: columnWidths.date }}>
                    <div className="text-sm">
                      {new Date(reservation.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </TableCell>
                  <TableCell style={{ width: columnWidths.time }}>
                    <div className="text-sm font-mono">
                      {formatTime(reservation.time)}
                    </div>
                  </TableCell>
                  <TableCell style={{ width: columnWidths.guests }}>
                    <div className="text-center font-medium">
                      {reservation.partySize}
                    </div>
                  </TableCell>
                  <TableCell style={{ width: columnWidths.status }}>
                    <Badge className={getStatusColor(reservation.status)}>
                      {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell style={{ width: columnWidths.attendance }}>
                    {reservation.attendance ? (
                      <Badge className={getAttendanceColor(reservation.attendance)}>
                        {reservation.attendance === 'attended' ? 'Attended' : 'No Show'}
                      </Badge>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </TableCell>
                  <TableCell style={{ width: columnWidths.requests }}>
                    <div className="text-sm text-gray-600 truncate" title={reservation.specialRequests}>
                      {reservation.specialRequests || '-'}
                    </div>
                  </TableCell>
                  <TableCell style={{ width: columnWidths.actions }}>
                    <div className="flex gap-1 flex-wrap">
                      {/* Status Actions */}
                      {reservation.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => onStatusChange(reservation.id, 'confirmed')}
                            className="bg-green-600 hover:bg-green-700 px-2 py-1 h-8"
                            title="Accept Reservation"
                          >
                            <CheckIcon className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onStatusChange(reservation.id, 'declined')}
                            className="px-2 py-1 h-8"
                            title="Decline Reservation"
                          >
                            <XIcon className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                      
                      {/* Attendance Actions */}
                      {canMarkAttendance && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => onAttendanceChange(reservation.id, 'attended')}
                            className="bg-blue-600 hover:bg-blue-700 px-2 py-1 h-8"
                            title="Mark as Attended"
                          >
                            <CheckCircleIcon className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onAttendanceChange(reservation.id, 'no-show')}
                            className="border-orange-300 text-orange-700 hover:bg-orange-50 px-2 py-1 h-8"
                            title="Mark as No Show"
                          >
                            <XCircleIcon className="h-3 w-3" />
                          </Button>
                        </>
                      )}

                      {/* No actions available */}
                      {reservation.status !== 'pending' && !canMarkAttendance && (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

interface ResizableTableHeadProps {
  children: React.ReactNode;
  width: number;
  onResize: (width: number) => void;
}

function ResizableTableHead({ children, width, onResize }: ResizableTableHeadProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    setStartX(e.clientX);
    setStartWidth(width);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    const diff = e.clientX - startX;
    const newWidth = startWidth + diff;
    onResize(newWidth);
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, startX, startWidth]);

  return (
    <TableHead style={{ width, position: 'relative' }}>
      {children}
      <div
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-pink-300 bg-transparent"
        onMouseDown={handleMouseDown}
        style={{ zIndex: 10 }}
      />
    </TableHead>
  );
}