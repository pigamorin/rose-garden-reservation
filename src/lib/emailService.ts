import emailjs from '@emailjs/browser';

// EmailJS configuration
const EMAILJS_SERVICE_ID = 'service_emdyfkx'; // Your working service ID
const EMAILJS_TEMPLATE_ID = 'template_reservation'; // You'll need to create this template
const EMAILJS_PUBLIC_KEY = 'your_public_key'; // Get this from EmailJS dashboard

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

export interface ReservationEmailData {
  to_email: string;
  to_name: string;
  reservation_id: string;
  date: string;
  time: string;
  party_size: number;
  status: 'confirmed' | 'declined' | 'pending';
  restaurant_name: string;
  restaurant_phone: string;
  restaurant_email: string;
}

export const sendReservationEmail = async (data: ReservationEmailData): Promise<boolean> => {
  try {
    // Get configuration from localStorage
    const serviceId = localStorage.getItem('emailjs_service_id') || EMAILJS_SERVICE_ID;
    const templateId = localStorage.getItem('emailjs_template_id') || EMAILJS_TEMPLATE_ID;
    const publicKey = localStorage.getItem('emailjs_public_key') || EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      console.error('EmailJS not configured properly');
      return false;
    }

    // Prepare email template parameters
    const templateParams = {
      to_email: data.to_email,
      to_name: data.to_name,
      customer_name: data.to_name,
      reservation_id: data.reservation_id,
      date: data.date,
      time: data.time,
      party_size: data.party_size,
      status: data.status,
      restaurant_name: data.restaurant_name,
      restaurant_phone: data.restaurant_phone,
      restaurant_email: data.restaurant_email,
      // Add status-specific content
      subject: getEmailSubject(data.status),
      message: getEmailMessage(data)
    };

    console.log('Sending email with EmailJS:', {
      serviceId,
      templateId,
      to: data.to_email,
      customer: data.to_name,
      status: data.status
    });

    // Send email using EmailJS
    const response = await emailjs.send(
      serviceId,
      templateId,
      templateParams,
      publicKey
    );

    console.log('Email sent successfully:', response);
    return true;

  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
};

const getEmailSubject = (status: string): string => {
  switch (status) {
    case 'confirmed':
      return '✅ Reservation Confirmed - Rose Garden Restaurant';
    case 'declined':
      return '❌ Reservation Update - Rose Garden Restaurant';
    case 'pending':
      return '📋 Reservation Received - Rose Garden Restaurant';
    default:
      return 'Reservation Update - Rose Garden Restaurant';
  }
};

const getEmailMessage = (data: ReservationEmailData): string => {
  const { to_name, date, time, party_size, status, restaurant_phone } = data;
  
  switch (status) {
    case 'confirmed':
      return `Dear ${to_name},

Great news! Your reservation has been confirmed.

📅 Date: ${date}
🕐 Time: ${time}
👥 Party Size: ${party_size} guests
🏪 Restaurant: Rose Garden Restaurant

We look forward to serving you! If you need to make any changes, please call us at ${restaurant_phone}.

Best regards,
Rose Garden Team`;

    case 'declined':
      return `Dear ${to_name},

We regret to inform you that we cannot accommodate your reservation request for ${date} at ${time}.

This may be due to:
• Full capacity for that time slot
• Restaurant closure
• Special event

Please call us at ${restaurant_phone} to discuss alternative dates and times. We apologize for any inconvenience.

Best regards,
Rose Garden Team`;

    case 'pending':
      return `Dear ${to_name},

Thank you for your reservation request!

📅 Date: ${date}
🕐 Time: ${time}
👥 Party Size: ${party_size} guests
🏪 Restaurant: Rose Garden Restaurant

We will review your request and contact you shortly to confirm. If you have any questions, please call us at ${restaurant_phone}.

Best regards,
Rose Garden Team`;

    default:
      return `Dear ${to_name},

Your reservation details:
Date: ${date}
Time: ${time}
Party Size: ${party_size} guests

Thank you for choosing Rose Garden Restaurant!

Best regards,
Rose Garden Team`;
  }
};

// Function to send automatic emails when reservation status changes
export const sendAutomaticEmail = async (reservation: any, status: 'confirmed' | 'declined'): Promise<boolean> => {
  // Only send if customer prefers email
  if (reservation.communicationPreference !== 'email') {
    console.log('Customer prefers', reservation.communicationPreference, '- skipping email');
    return false;
  }

  const emailData: ReservationEmailData = {
    to_email: reservation.email,
    to_name: reservation.customerName || reservation.name,
    reservation_id: reservation.id,
    date: new Date(reservation.date).toLocaleDateString(),
    time: reservation.time,
    party_size: reservation.partySize,
    status: status,
    restaurant_name: 'Rose Garden Restaurant',
    restaurant_phone: '0244 365634',
    restaurant_email: 'info@rosegarden.com'
  };

  return await sendReservationEmail(emailData);
};