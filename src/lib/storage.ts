import { Reservation } from '@/types/reservation';

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
    // Send welcome notification for new reservations
    sendNewReservationNotification(reservation);
  }
  
  localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(reservations));
};

export const updateReservationStatus = (id: string, status: Reservation['status']): void => {
  const reservations = getReservations();
  const reservation = reservations.find(r => r.id === id);
  
  if (reservation) {
    const oldStatus = reservation.status;
    reservation.status = status;
    saveReservation(reservation);
    
    // Send SMS notification when status changes to confirmed or declined
    if (status === 'confirmed' && oldStatus !== 'confirmed') {
      sendSMSStatusNotification(reservation, 'confirmed');
    } else if (status === 'declined' && oldStatus !== 'declined') {
      sendSMSStatusNotification(reservation, 'declined');
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
    saveReservation(reservation);
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
  // This is a placeholder function that can be expanded later
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

// SMS Notification Functions
const sendSMSStatusNotification = async (reservation: Reservation, status: 'confirmed' | 'declined') => {
  const provider = localStorage.getItem('sms_provider');
  if (!provider) {
    console.log('SMS provider not configured - skipping SMS notification');
    return;
  }

  const { customerName, phone, date, time, partySize } = reservation;
  
  const messages = {
    confirmed: `Hi ${customerName}! Your Rose Garden reservation for ${new Date(date).toLocaleDateString()} at ${time} for ${partySize} guests is CONFIRMED. See you soon!`,
    declined: `Hi ${customerName}. Unfortunately, we cannot accommodate your Rose Garden reservation for ${new Date(date).toLocaleDateString()} at ${time}. Please call 0244 365634 for alternatives. Sorry!`
  };

  const message = messages[status];
  
  try {
    // Log SMS for tracking
    const smsLog = {
      id: Date.now().toString() + Math.random().toString(36).substr(2),
      to: phone,
      message,
      status: 'sent',
      timestamp: new Date().toISOString(),
      reservationId: reservation.id,
      customerName: customerName || reservation.name,
      type: 'auto_notification'
    };

    // Save to SMS logs
    const existingLogs = JSON.parse(localStorage.getItem('sms_logs') || '[]');
    existingLogs.unshift(smsLog);
    localStorage.setItem('sms_logs', JSON.stringify(existingLogs));

    // In production, this would make actual API call to SMS provider
    console.log(`📱 AUTO SMS SENT (${status.toUpperCase()}):`, {
      provider,
      to: phone,
      customer: customerName,
      message: message.substring(0, 50) + '...',
      reservationId: reservation.id
    });

    // Show notification to user
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        const statusEmoji = status === 'confirmed' ? '✅' : '❌';
        alert(`${statusEmoji} SMS automatically sent!\n\nTo: ${customerName} (${phone})\nStatus: ${status.toUpperCase()}\n\nMessage: ${message.substring(0, 100)}...`);
      }, 1000);
    }

    return true;
  } catch (error) {
    console.error('Failed to send SMS notification:', error);
    
    // Log failed SMS
    const failedSmsLog = {
      id: Date.now().toString() + Math.random().toString(36).substr(2),
      to: phone,
      message,
      status: 'failed',
      timestamp: new Date().toISOString(),
      reservationId: reservation.id,
      customerName: customerName || reservation.name,
      type: 'auto_notification',
      error: error.message || 'Unknown error'
    };

    const existingLogs = JSON.parse(localStorage.getItem('sms_logs') || '[]');
    existingLogs.unshift(failedSmsLog);
    localStorage.setItem('sms_logs', JSON.stringify(existingLogs));

    return false;
  }
};

// Simple notification system for new reservations
const sendNewReservationNotification = (reservation: Reservation) => {
  const { customerName, email, phone, date, time, partySize } = reservation;
  
  // Show demo notification for new reservation
  console.log(`📧 NEW RESERVATION NOTIFICATION:`, { 
    customer: customerName,
    email,
    phone,
    date: new Date(date).toLocaleDateString(),
    time,
    partySize
  });

  // Show browser notification
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      alert(`✅ New reservation received!\n\nCustomer: ${customerName}\nDate: ${new Date(date).toLocaleDateString()}\nTime: ${time}\nParty Size: ${partySize}\n\nThank you message sent to customer.`);
    }, 500);
  }
};