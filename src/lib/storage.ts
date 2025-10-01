import { Reservation } from '@/types/reservation';
import { amazonSNS } from './amazonSNSService';

const RESERVATIONS_KEY = 'rose_garden_reservations';
const BLOCKED_SLOTS_KEY = 'rose_garden_blocked_slots';

export interface BlockedSlot {
  id: string;
  date: string;
  time: string;
  reason?: string;
  blockedBy: string;
  blockedAt: string;
}

export const getReservations = (): Reservation[] => {
  const stored = localStorage.getItem(RESERVATIONS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveReservation = (reservation: Reservation): void => {
  const reservations = getReservations();
  const existingIndex = reservations.findIndex(r => r.id === reservation.id);
  
  if (existingIndex >= 0) {
    reservations[existingIndex] = reservation;
  } else {
    reservations.push(reservation);
    // Show new reservation notification
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        alert(`🎉 NEW RESERVATION!\n\nCustomer: ${reservation.customerName}\nDate: ${new Date(reservation.date).toLocaleDateString()}\nTime: ${reservation.time}\nParty Size: ${reservation.partySize}\n\nReservation saved successfully!`);
      }, 500);
    }
  }
  
  localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(reservations));
};

export const updateReservationStatus = (id: string, status: Reservation['status']): void => {
  const reservations = getReservations();
  const reservation = reservations.find(r => r.id === id);
  
  if (reservation) {
    const oldStatus = reservation.status;
    reservation.status = status;
    localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(reservations));
    
    console.log(`🔄 Status updated from ${oldStatus} to ${status} for reservation ${id}`);
    
    // Send Amazon SNS notification when status changes
    if ((status === 'confirmed' || status === 'declined') && oldStatus !== status) {
      console.log(`📧 Triggering Amazon SNS notification for ${reservation.customerName}`);
      sendSNSNotification(reservation, status);
    }
  }
};

export const updateReservationAttendance = (
  id: string, 
  attendance: 'attended' | 'no-show',
  markedBy: string
): void => {
  const reservations = getReservations();
  const reservation = reservations.find(r => r.id === id);
  
  if (reservation) {
    reservation.attendance = attendance;
    reservation.attendanceMarkedAt = new Date().toISOString();
    reservation.attendanceMarkedBy = markedBy;
    localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(reservations));
  }
};

export const deleteReservation = (id: string): void => {
  const reservations = getReservations();
  const filtered = reservations.filter(r => r.id !== id);
  localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(filtered));
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Utility functions for formatting
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatTime = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes));
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export const getCurrentStaff = () => {
  return { username: 'current_staff' };
};

// Blocked Slots Management
export const getBlockedSlots = (): BlockedSlot[] => {
  const stored = localStorage.getItem(BLOCKED_SLOTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveBlockedSlot = (slot: BlockedSlot): void => {
  const slots = getBlockedSlots();
  const existingIndex = slots.findIndex(s => s.id === slot.id);
  
  if (existingIndex >= 0) {
    slots[existingIndex] = slot;
  } else {
    slots.push(slot);
  }
  
  localStorage.setItem(BLOCKED_SLOTS_KEY, JSON.stringify(slots));
};

export const deleteBlockedSlot = (id: string): void => {
  const slots = getBlockedSlots();
  const filtered = slots.filter(s => s.id !== id);
  localStorage.setItem(BLOCKED_SLOTS_KEY, JSON.stringify(filtered));
};

export const isSlotBlocked = (date: string, time: string): boolean => {
  const blockedSlots = getBlockedSlots();
  return blockedSlots.some(slot => slot.date === date && slot.time === time);
};

// AMAZON SNS NOTIFICATION SYSTEM
const sendSNSNotification = async (reservation: Reservation, status: 'confirmed' | 'declined') => {
  const { customerName, email, phone, communicationPreference } = reservation;
  
  console.log(`📧 SENDING SNS NOTIFICATION:`, {
    customer: customerName,
    email: email,
    phone: phone,
    status: status,
    preference: communicationPreference
  });

  // Check if Amazon SNS is configured
  const snsStatus = amazonSNS.getStatus();
  if (!snsStatus.configured) {
    console.log('⚠️ Amazon SNS not configured - falling back to browser notification');
    
    // Show fallback notification
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        alert(`📧 Notification Ready!\n\nCustomer: ${customerName}\nEmail: ${email || 'Not provided'}\nPhone: ${phone || 'Not provided'}\nStatus: ${status.toUpperCase()}\n\n⚠️ Configure Amazon SNS in Dashboard → SNS Setup for automatic delivery.`);
      }, 1000);
    }
    return;
  }

  // Prepare reservation details
  const reservationDetails = {
    id: reservation.id,
    date: new Date(reservation.date).toLocaleDateString(),
    time: reservation.time,
    partySize: reservation.partySize,
    status: status
  };

  // Determine communication preference
  let commPref: 'email' | 'sms' | 'both' = 'email';
  if (communicationPreference === 'sms') {
    commPref = 'sms';
  } else if (communicationPreference === 'both' || (!communicationPreference && email && phone)) {
    commPref = 'both';
  }

  try {
    // Send notification via Amazon SNS
    const success = await amazonSNS.sendReservationNotification(
      email || '',
      phone || '',
      customerName,
      reservationDetails,
      commPref
    );

    if (success) {
      console.log(`✅ SNS notification sent successfully to ${customerName}`);
    } else {
      console.log(`❌ SNS notification failed for ${customerName}`);
    }

  } catch (error) {
    console.error('❌ SNS notification error:', error);
    
    // Show error notification
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        alert(`❌ SNS Notification Failed!\n\nCustomer: ${customerName}\nError: ${error.message}\n\nPlease check your Amazon SNS configuration.`);
      }, 1000);
    }
  }
};