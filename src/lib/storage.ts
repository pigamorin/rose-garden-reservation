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
    
    // IMMEDIATE EMAIL NOTIFICATION - Send email when status changes to confirmed or declined
    if ((status === 'confirmed' || status === 'declined') && oldStatus !== status) {
      console.log(`📧 Triggering email notification for ${reservation.customerName}`);
      sendEmailNotificationNow(reservation, status);
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

// IMMEDIATE EMAIL NOTIFICATION SYSTEM
const sendEmailNotificationNow = (reservation: Reservation, status: 'confirmed' | 'declined') => {
  const { customerName, email, communicationPreference } = reservation;
  
  console.log(`📧 IMMEDIATE EMAIL NOTIFICATION:`, {
    customer: customerName,
    email: email,
    status: status,
    preference: communicationPreference
  });

  // Always try to send email if customer has email address
  if (email) {
    const reservationDetails = {
      id: reservation.id,
      date: new Date(reservation.date).toLocaleDateString(),
      time: reservation.time,
      partySize: reservation.partySize,
      status: status
    };

    // Create the email content
    const subject = status === 'confirmed' 
      ? '✅ Reservation Confirmed - Rose Garden Restaurant'
      : '❌ Reservation Update - Rose Garden Restaurant';

    const body = status === 'confirmed' 
      ? `Dear ${customerName},

✅ GREAT NEWS! Your reservation has been CONFIRMED.

📅 Date: ${reservationDetails.date}
🕐 Time: ${reservationDetails.time}
👥 Party Size: ${reservationDetails.partySize} guests
🆔 Reservation ID: ${reservationDetails.id}

We look forward to serving you at Rose Garden Restaurant!

If you need to make any changes, please call us at:
📞 0244 365634

Thank you for choosing Rose Garden Restaurant!

Best regards,
Rose Garden Team
🌹 Rose Garden Restaurant`
      : `Dear ${customerName},

❌ We regret to inform you that we cannot accommodate your reservation.

📅 Requested Date: ${reservationDetails.date}
🕐 Requested Time: ${reservationDetails.time}
👥 Party Size: ${reservationDetails.partySize} guests

Please call us at 📞 0244 365634 to discuss alternative dates and times.

We sincerely apologize for any inconvenience and look forward to serving you soon.

Best regards,
Rose Garden Team
🌹 Rose Garden Restaurant`;

    // Create mailto link and open immediately
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    console.log(`📧 Opening email client for ${customerName} (${email})`);
    
    // Open email client immediately
    if (typeof window !== 'undefined') {
      window.open(mailtoLink, '_blank');
      
      // Show confirmation
      setTimeout(() => {
        alert(`📧 EMAIL CLIENT OPENED!\n\n✅ Ready to send to:\n\nCustomer: ${customerName}\nEmail: ${email}\nStatus: ${status.toUpperCase()}\n\n👆 Your email client should have opened with the message ready to send!`);
      }, 1000);
    }
    
    console.log(`✅ Email notification triggered for ${customerName} (${email}) - Status: ${status}`);
  } else {
    console.log(`📧 No email address provided for ${customerName} - skipping email notification`);
    
    if (typeof window !== 'undefined') {
      alert(`⚠️ No email address for ${customerName}\n\nReservation status updated to: ${status.toUpperCase()}\n\nCustomer will need to be notified by phone.`);
    }
  }
};