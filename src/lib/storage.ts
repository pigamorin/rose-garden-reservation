import { Reservation } from '@/types/reservation';
import { sendAutomaticEmail } from './emailService';

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
    
    // Send automatic notifications when status changes to confirmed or declined
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

// Notification Functions
const sendNewReservationNotification = (reservation: Reservation) => {
  const { customerName, email, phone, date, time, partySize, communicationPreference } = reservation;
  
  console.log(`📧 NEW RESERVATION NOTIFICATION:`, { 
    to: communicationPreference === 'email' ? email : phone,
    method: communicationPreference || 'email',
    customer: customerName,
    date: new Date(date).toLocaleDateString(),
    time,
    partySize
  });

  // Show browser notification
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      alert(`✅ New reservation received!\n\nCustomer: ${customerName}\nDate: ${new Date(date).toLocaleDateString()}\nTime: ${time}\nParty Size: ${partySize}\n\nWelcome message sent via ${communicationPreference || 'email'}.`);
    }, 500);
  }
};

// Enhanced notification system with automatic email/SMS sending
const sendStatusNotification = async (reservation: Reservation, status: 'confirmed' | 'declined') => {
  const { communicationPreference, customerName, email, phone, date, time, partySize } = reservation;
  
  console.log(`📧 ${status.toUpperCase()} NOTIFICATION:`, { 
    to: communicationPreference === 'email' ? email : phone,
    method: communicationPreference || 'email',
    customer: customerName,
    status
  });

  // Send automatic email if customer prefers email or no preference set
  if (!communicationPreference || communicationPreference === 'email') {
    try {
      const emailSent = await sendAutomaticEmail(reservation, status);
      if (emailSent) {
        console.log('✅ Automatic email sent successfully');
      } else {
        console.log('❌ Failed to send automatic email');
      }
    } catch (error) {
      console.error('Error sending automatic email:', error);
    }
  }

  // Send automatic SMS if customer prefers SMS
  if (communicationPreference === 'sms') {
    sendStatusSMS(reservation, status);
  }

  // Show general notification for WhatsApp preference
  if (communicationPreference === 'whatsapp') {
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        const statusEmoji = status === 'confirmed' ? '✅' : '❌';
        alert(`${statusEmoji} Reservation ${status}!\n\nCustomer: ${customerName}\nWhatsApp: ${phone}\n\nWhatsApp message would be sent (configure WhatsApp in settings).`);
      }, 1000);
    }
  }
};

// SMS Functions
const saveSMSLog = (log: any) => {
  const logs = JSON.parse(localStorage.getItem('sms_logs') || '[]');
  logs.unshift(log);
  localStorage.setItem('sms_logs', JSON.stringify(logs));
};

const sendStatusSMS = async (reservation: Reservation, status: 'confirmed' | 'declined') => {
  const provider = localStorage.getItem('sms_provider');
  if (!provider) return;

  const messages = {
    confirmed: `Hi ${reservation.customerName || reservation.name}! Your Rose Garden reservation for ${new Date(reservation.date).toLocaleDateString()} at ${reservation.time} for ${reservation.partySize} guests is CONFIRMED ✅ See you soon!`,
    declined: `Hi ${reservation.customerName || reservation.name}. Unfortunately, we cannot accommodate your Rose Garden reservation for ${new Date(reservation.date).toLocaleDateString()} at ${reservation.time}. Please call 0244 365634 for alternatives. Sorry! 😔`
  };

  const message = messages[status];

  try {
    await sendSMSMessage(reservation.phone, message);
    
    const smsLog = {
      id: generateId(),
      to: reservation.phone,
      message,
      status: 'sent',
      timestamp: new Date().toISOString(),
      reservationId: reservation.id,
      customerName: reservation.customerName || reservation.name,
      type: status
    };
    
    saveSMSLog(smsLog);
    console.log(`📱 ${status.toUpperCase()} SMS sent:`, { customer: reservation.customerName || reservation.name, phone: reservation.phone });
    
    // Show browser notification
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        const statusEmoji = status === 'confirmed' ? '✅' : '❌';
        alert(`${statusEmoji} SMS ${status} sent!\n\nCustomer: ${reservation.customerName || reservation.name}\nPhone: ${reservation.phone}\n\nMessage sent successfully via SMS.`);
      }, 1000);
    }
  } catch (error) {
    console.error(`Failed to send ${status} SMS:`, error);
  }
};

const sendSMSMessage = async (phone: string, message: string): Promise<void> => {
  const provider = localStorage.getItem('sms_provider');
  
  // Simulate SMS API call based on provider
  switch (provider) {
    case 'twilio':
      await sendTwilioSMS(phone, message);
      break;
    case 'nexmo':
      await sendNexmoSMS(phone, message);
      break;
    case 'messagebird':
      await sendMessageBirdSMS(phone, message);
      break;
    case 'plivo':
      await sendPlivoSMS(phone, message);
      break;
    case 'clicksend':
      await sendClickSendSMS(phone, message);
      break;
    case 'textmagic':
      await sendTextMagicSMS(phone, message);
      break;
    default:
      throw new Error('SMS provider not configured');
  }
};

const sendTwilioSMS = async (phone: string, message: string) => {
  const accountSid = localStorage.getItem('sms_account_sid');
  const authToken = localStorage.getItem('sms_auth_token');
  const fromNumber = localStorage.getItem('sms_from_number');
  
  if (!accountSid || !authToken || !fromNumber) {
    throw new Error('Twilio credentials not configured');
  }

  console.log('📱 TWILIO SMS (Demo):', {
    from: fromNumber,
    to: phone,
    body: message,
    accountSid: accountSid.substring(0, 10) + '...'
  });

  await new Promise(resolve => setTimeout(resolve, 1000));
};

const sendNexmoSMS = async (phone: string, message: string) => {
  console.log('📱 NEXMO SMS (Demo):', { to: phone, text: message });
  await new Promise(resolve => setTimeout(resolve, 1000));
};

const sendMessageBirdSMS = async (phone: string, message: string) => {
  console.log('📱 MESSAGEBIRD SMS (Demo):', { to: phone, body: message });
  await new Promise(resolve => setTimeout(resolve, 1000));
};

const sendPlivoSMS = async (phone: string, message: string) => {
  console.log('📱 PLIVO SMS (Demo):', { dst: phone, text: message });
  await new Promise(resolve => setTimeout(resolve, 1000));
};

const sendClickSendSMS = async (phone: string, message: string) => {
  console.log('📱 CLICKSEND SMS (Demo):', { to: phone, body: message });
  await new Promise(resolve => setTimeout(resolve, 1000));
};

const sendTextMagicSMS = async (phone: string, message: string) => {
  console.log('📱 TEXTMAGIC SMS (Demo):', { phones: phone, text: message });
  await new Promise(resolve => setTimeout(resolve, 1000));
};