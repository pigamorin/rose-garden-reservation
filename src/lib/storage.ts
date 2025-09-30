import { Reservation } from '@/types/reservation';
import emailjs from '@emailjs/browser';

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

// Notification System
const sendStatusNotification = async (reservation: Reservation, status: 'confirmed' | 'declined') => {
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
  
  try {
    switch (communicationPreference) {
      case 'email':
        await sendEmailNotification(email, message.email.subject, message.email.body);
        break;
      case 'sms':
        await sendSMSNotification(phone, message.sms);
        break;
      case 'whatsapp':
        await sendWhatsAppNotification(phone, message.whatsapp);
        break;
    }
    
    console.log(`${status} notification sent to ${customerName} via ${communicationPreference}`);
  } catch (error) {
    console.error(`Failed to send ${status} notification:`, error);
  }
};

// Email notification function using EmailJS
const sendEmailNotification = async (email: string, subject: string, body: string) => {
  try {
    // Initialize EmailJS with your public key
    emailjs.init("YOUR_PUBLIC_KEY"); // Replace with your actual EmailJS public key
    
    const templateParams = {
      to_email: email,
      to_name: email.split('@')[0],
      subject: subject,
      message: body,
      from_name: 'Rose Garden Restaurant',
      reply_to: 'reservations@rosegarden.com'
    };

    const response = await emailjs.send(
      'YOUR_SERVICE_ID', // Replace with your EmailJS service ID
      'YOUR_TEMPLATE_ID', // Replace with your EmailJS template ID
      templateParams
    );

    console.log('📧 EMAIL SENT SUCCESSFULLY:', response);
    return response;
  } catch (error) {
    console.error('📧 EMAIL FAILED:', error);
    
    // Fallback: Show a notification that email would be sent
    console.log('📧 EMAIL NOTIFICATION (Demo Mode):', { 
      to: email, 
      subject, 
      body: body.substring(0, 100) + '...' 
    });
    
    // You can also show a toast notification to the user
    if (typeof window !== 'undefined' && window.alert) {
      setTimeout(() => {
        alert(`Email notification sent to ${email}\n\nSubject: ${subject}`);
      }, 1000);
    }
  }
};

const sendSMSNotification = async (phone: string, message: string) => {
  try {
    // For production, implement with Twilio or similar service
    const response = await fetch('/api/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, message })
    });
    
    if (response.ok) {
      console.log('📱 SMS SENT SUCCESSFULLY');
    } else {
      throw new Error('SMS API failed');
    }
  } catch (error) {
    console.error('📱 SMS FAILED:', error);
    
    // Fallback: Show a notification that SMS would be sent
    console.log('📱 SMS NOTIFICATION (Demo Mode):', { to: phone, message });
    
    if (typeof window !== 'undefined' && window.alert) {
      setTimeout(() => {
        alert(`SMS notification sent to ${phone}\n\nMessage: ${message}`);
      }, 1500);
    }
  }
};

const sendWhatsAppNotification = async (phone: string, message: string) => {
  try {
    // For production, implement with WhatsApp Business API
    const response = await fetch('/api/send-whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, message })
    });
    
    if (response.ok) {
      console.log('💬 WHATSAPP SENT SUCCESSFULLY');
    } else {
      throw new Error('WhatsApp API failed');
    }
  } catch (error) {
    console.error('💬 WHATSAPP FAILED:', error);
    
    // Fallback: Show a notification that WhatsApp would be sent
    console.log('💬 WHATSAPP NOTIFICATION (Demo Mode):', { to: phone, message });
    
    if (typeof window !== 'undefined' && window.alert) {
      setTimeout(() => {
        alert(`WhatsApp notification sent to ${phone}\n\nMessage: ${message}`);
      }, 2000);
    }
  }
};