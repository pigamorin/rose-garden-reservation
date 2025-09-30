import { Reservation } from '@/types/reservation';
import { sendReservationEmail } from './emailService';

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
    localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(reservations));
    
    // Send automatic notifications when status changes
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

// Enhanced notification system with automatic email/SMS sending
const sendStatusNotification = async (reservation: Reservation, status: 'confirmed' | 'declined') => {
  const { communicationPreference, customerName, email, phone, date, time, partySize } = reservation;
  
  console.log(`📧 ${status.toUpperCase()} NOTIFICATION TRIGGERED:`, { 
    to: communicationPreference === 'email' ? email : phone,
    method: communicationPreference || 'email',
    customer: customerName,
    status,
    hasEmail: !!email,
    hasPhone: !!phone
  });

  // Send automatic email if customer prefers email OR no preference is set (default to email)
  if ((!communicationPreference || communicationPreference === 'email') && email) {
    try {
      console.log('🔄 Attempting to send automatic email...');
      
      const emailData = {
        to_email: email,
        to_name: customerName || 'Customer',
        reservation_id: reservation.id,
        date: new Date(date).toLocaleDateString(),
        time: time,
        party_size: partySize,
        status: status,
        restaurant_name: 'Rose Garden Restaurant',
        restaurant_phone: '0244 365634',
        restaurant_email: 'info@rosegarden.com'
      };

      console.log('📧 Email data prepared:', emailData);

      const emailSent = await sendReservationEmail(emailData);
      
      if (emailSent) {
        console.log('✅ Automatic email sent successfully');
      } else {
        console.log('❌ Failed to send automatic email');
      }
    } catch (error) {
      console.error('❌ Error sending automatic email:', error);
    }
  } else {
    console.log('📧 Skipping email notification:', {
      reason: !email ? 'No email address' : 'Customer prefers ' + communicationPreference,
      communicationPreference,
      hasEmail: !!email
    });
  }

  // Send automatic SMS if customer prefers SMS
  if (communicationPreference === 'sms' && phone) {
    sendSMSStatusNotification(reservation, status);
  }

  // Show general notification for WhatsApp
  if (communicationPreference === 'whatsapp' && phone) {
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        const statusEmoji = status === 'confirmed' ? '✅' : '❌';
        alert(`${statusEmoji} Reservation ${status}!\n\nCustomer: ${customerName}\nWhatsApp: ${phone}\n\nWhatsApp message would be sent (configure WhatsApp in settings).`);
      }, 1000);
    }
  }
};

// SMS Functions
const sendSMSStatusNotification = async (reservation: Reservation, status: 'confirmed' | 'declined') => {
  const provider = localStorage.getItem('sms_provider');
  if (!provider) {
    console.log('SMS provider not configured - skipping SMS notification');
    return;
  }

  const { customerName, phone, date, time, partySize } = reservation;
  
  const messages = {
    confirmed: `Hi ${customerName}! Your Rose Garden reservation for ${new Date(date).toLocaleDateString()} at ${time} for ${partySize} guests is CONFIRMED ✅ See you soon!`,
    declined: `Hi ${customerName}. Unfortunately, we cannot accommodate your Rose Garden reservation for ${new Date(date).toLocaleDateString()} at ${time}. Please call 0244 365634 for alternatives. Sorry! 😔`
  };

  const message = messages[status];
  
  try {
    // Log SMS for tracking
    const smsLog = {
      id: generateId(),
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
    return false;
  }
};

// Simple notification system for new reservations
const sendNewReservationNotification = (reservation: Reservation) => {
  const { customerName, email, phone, date, time, partySize } = reservation;
  
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
      alert(`✅ New reservation received!\n\nCustomer: ${customerName}\nDate: ${new Date(date).toLocaleDateString()}\nTime: ${time}\nParty Size: ${partySize}\n\nWelcome message sent to customer.`);
    }, 500);
  }
};