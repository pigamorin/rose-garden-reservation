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
    
    // Send notification when status changes to confirmed or declined
    if (status === 'confirmed' && oldStatus !== 'confirmed') {
      sendStatusNotification(reservation, 'confirmed');
    } else if (status === 'declined' && oldStatus !== 'declined') {
      sendStatusNotification(reservation, 'declined');
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

// Simple notification system without Gmail API
const sendNewReservationNotification = (reservation: Reservation) => {
  const { communicationPreference, customerName, email, phone, date, time, partySize } = reservation;
  
  const messages = {
    email: {
      subject: 'Reservation Received - Rose Garden Restaurant',
      body: `Dear ${customerName},\n\nThank you for your reservation request!\n\nDetails:\n- Date: ${new Date(date).toLocaleDateString()}\n- Time: ${time}\n- Party Size: ${partySize} guests\n- Restaurant: Rose Garden\n\nWe will review your request and contact you shortly to confirm.\n\nBest regards,\nRose Garden Team`
    },
    sms: `Hi ${customerName}! Thanks for your Rose Garden reservation request for ${new Date(date).toLocaleDateString()} at ${time} for ${partySize} guests. We'll confirm shortly!`,
    whatsapp: `🌹 Rose Garden - Reservation Received\n\nHi ${customerName}!\n\nThanks for your reservation request:\n📅 ${new Date(date).toLocaleDateString()}\n🕐 ${time}\n👥 ${partySize} guests\n\nWe'll confirm shortly! 🍽️`
  };

  const message = messages[communicationPreference];
  
  // Show demo notification
  console.log(`📧 NEW RESERVATION NOTIFICATION (Demo Mode):`, { 
    to: communicationPreference === 'email' ? email : phone,
    method: communicationPreference,
    subject: message.subject || 'Reservation Notification',
    preview: (message.body || message).substring(0, 100) + '...'
  });

  // Show browser notification
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      alert(`✅ Reservation submitted!\n\nCustomer: ${customerName}\nMethod: ${communicationPreference}\n\nNotification would be sent via ${communicationPreference === 'email' ? 'email' : 'SMS/WhatsApp'}.`);
    }, 500);
  }
};

// Notification System
const sendStatusNotification = (reservation: Reservation, status: 'confirmed' | 'declined') => {
  const { communicationPreference, customerName, email, phone, date, time, partySize } = reservation;
  
  const messages = {
    confirmed: {
      email: {
        subject: 'Reservation Confirmed - Rose Garden Restaurant',
        body: `Dear ${customerName},\n\nGreat news! Your reservation has been confirmed.\n\nDetails:\n- Date: ${new Date(date).toLocaleDateString()}\n- Time: ${time}\n- Party Size: ${partySize} guests\n- Restaurant: Rose Garden\n\nWe look forward to serving you!\n\nBest regards,\nRose Garden Team`
      },
      sms: `Hi ${customerName}! Your Rose Garden reservation for ${new Date(date).toLocaleDateString()} at ${time} for ${partySize} guests is CONFIRMED. See you soon!`,
      whatsapp: `🌹 Rose Garden Confirmation\n\nHi ${customerName}!\n\nYour reservation is CONFIRMED ✅\n📅 ${new Date(date).toLocaleDateString()}\n🕐 ${time}\n👥 ${partySize} guests\n\nWe can't wait to serve you! 🍽️`
    },
    declined: {
      email: {
        subject: 'Reservation Update - Rose Garden Restaurant',
        body: `Dear ${customerName},\n\nWe regret to inform you that we cannot accommodate your reservation request for ${new Date(date).toLocaleDateString()} at ${time}.\n\nThis may be due to:\n- Full capacity for that time slot\n- Restaurant closure\n- Special event\n\nPlease call us at 0244 365634 to discuss alternative dates and times.\n\nWe apologize for any inconvenience.\n\nBest regards,\nRose Garden Team`
      },
      sms: `Hi ${customerName}. Unfortunately, we cannot accommodate your Rose Garden reservation for ${new Date(date).toLocaleDateString()} at ${time}. Please call 0244 365634 for alternatives. Sorry!`,
      whatsapp: `🌹 Rose Garden Update\n\nHi ${customerName},\n\nWe're sorry, but we cannot accommodate your reservation for:\n📅 ${new Date(date).toLocaleDateString()}\n🕐 ${time}\n\nPlease call 0244 365634 to find alternative times. We apologize for the inconvenience! 🙏`
    }
  };

  const message = messages[status];
  const notification = message[communicationPreference] || message.email;
  
  // Show demo notification
  console.log(`📧 ${status.toUpperCase()} NOTIFICATION (Demo Mode):`, { 
    to: communicationPreference === 'email' ? email : phone,
    method: communicationPreference,
    subject: notification.subject || `Reservation ${status}`,
    preview: (notification.body || notification).substring(0, 100) + '...'
  });

  // Show browser notification
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      const statusEmoji = status === 'confirmed' ? '✅' : '❌';
      alert(`${statusEmoji} Reservation ${status}!\n\nCustomer: ${customerName}\nMethod: ${communicationPreference}\n\nNotification sent via ${communicationPreference === 'email' ? 'email' : 'SMS/WhatsApp'}.`);
    }, 1000);
  }
};