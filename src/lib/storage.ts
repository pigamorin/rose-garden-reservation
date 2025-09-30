import { Reservation } from '@/types/reservation';
import { sendReservationEmail, sendStatusUpdateEmail } from './emailService';

const STORAGE_KEY = 'rose_garden_reservations';
const BLOCKED_SLOTS_KEY = 'rose_garden_blocked_slots';
const MESSAGES_KEY = 'rose_garden_messages';

export interface BlockedSlot {
  id: string;
  date: string;
  time: string;
  reason: string;
  createdBy: string;
  createdAt: string;
}

export interface Message {
  id: string;
  reservationId: string;
  content: string;
  timestamp: string;
  sender: string;
  type: 'note' | 'alert' | 'reminder';
}

export const getReservations = (): Reservation[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading reservations:', error);
    return [];
  }
};

export const saveReservation = async (reservation: Reservation): Promise<boolean> => {
  try {
    const reservations = getReservations();
    reservations.push(reservation);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
    
    // Send confirmation email
    const emailSent = await sendReservationEmail({
      to_email: reservation.email,
      to_name: reservation.name,
      reservation_id: reservation.id,
      date: new Date(reservation.date).toLocaleDateString(),
      time: reservation.time,
      party_size: reservation.partySize,
      status: reservation.status,
      restaurant_name: 'Rose Garden Restaurant',
      restaurant_phone: '(555) 123-4567',
      restaurant_email: 'info@rosegarden.com'
    });

    if (emailSent) {
      console.log('Confirmation email sent successfully');
    } else {
      console.warn('Failed to send confirmation email');
    }

    return true;
  } catch (error) {
    console.error('Error saving reservation:', error);
    return false;
  }
};

export const updateReservationStatus = async (id: string, status: Reservation['status']): Promise<boolean> => {
  try {
    const reservations = getReservations();
    const index = reservations.findIndex(r => r.id === id);
    
    if (index !== -1) {
      const oldStatus = reservations[index].status;
      reservations[index].status = status;
      reservations[index].updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
      
      // Send status update email if status changed
      if (oldStatus !== status) {
        const reservation = reservations[index];
        const emailSent = await sendStatusUpdateEmail({
          to_email: reservation.email,
          to_name: reservation.name,
          reservation_id: reservation.id,
          date: new Date(reservation.date).toLocaleDateString(),
          time: reservation.time,
          party_size: reservation.partySize,
          status: status,
          restaurant_name: 'Rose Garden Restaurant',
          restaurant_phone: '(555) 123-4567',
          restaurant_email: 'info@rosegarden.com'
        });

        if (emailSent) {
          console.log(`Status update email sent for reservation ${id}`);
        } else {
          console.warn(`Failed to send status update email for reservation ${id}`);
        }
      }
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating reservation status:', error);
    return false;
  }
};

export const updateReservationAttendance = (id: string, attendance: 'attended' | 'no-show', markedBy?: string): boolean => {
  try {
    const reservations = getReservations();
    const index = reservations.findIndex(r => r.id === id);
    
    if (index !== -1) {
      reservations[index].attendance = attendance;
      reservations[index].attendanceMarkedBy = markedBy;
      reservations[index].attendanceMarkedAt = new Date().toISOString();
      reservations[index].updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating reservation attendance:', error);
    return false;
  }
};

export const deleteReservation = (id: string): boolean => {
  try {
    const reservations = getReservations();
    const filtered = reservations.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting reservation:', error);
    return false;
  }
};

// Blocked slots management
export const getBlockedSlots = (): BlockedSlot[] => {
  try {
    const stored = localStorage.getItem(BLOCKED_SLOTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading blocked slots:', error);
    return [];
  }
};

export const saveBlockedSlot = (slot: BlockedSlot): boolean => {
  try {
    const slots = getBlockedSlots();
    slots.push(slot);
    localStorage.setItem(BLOCKED_SLOTS_KEY, JSON.stringify(slots));
    return true;
  } catch (error) {
    console.error('Error saving blocked slot:', error);
    return false;
  }
};

export const deleteBlockedSlot = (id: string): boolean => {
  try {
    const slots = getBlockedSlots();
    const filtered = slots.filter(s => s.id !== id);
    localStorage.setItem(BLOCKED_SLOTS_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting blocked slot:', error);
    return false;
  }
};

export const isSlotBlocked = (date: string, time: string): boolean => {
  const blockedSlots = getBlockedSlots();
  return blockedSlots.some(slot => slot.date === date && slot.time === time);
};

// Messages management
export const getMessages = (): Message[] => {
  try {
    const stored = localStorage.getItem(MESSAGES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading messages:', error);
    return [];
  }
};

export const saveMessage = (message: Message): boolean => {
  try {
    const messages = getMessages();
    messages.push(message);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
    return true;
  } catch (error) {
    console.error('Error saving message:', error);
    return false;
  }
};

export const getReservationMessages = (reservationId: string): Message[] => {
  const messages = getMessages();
  return messages.filter(m => m.reservationId === reservationId);
};

// Utility functions
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};