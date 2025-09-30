import emailjs from '@emailjs/browser';

export interface EmailData {
  to_email: string;
  to_name: string;
  reservation_id: string;
  date: string;
  time: string;
  party_size: number;
  status: string;
  restaurant_name: string;
  restaurant_phone: string;
  restaurant_email: string;
}

// Initialize EmailJS with public key from localStorage
const initializeEmailJS = () => {
  const publicKey = localStorage.getItem('emailjs_public_key') || localStorage.getItem('emailjs_user_id');
  if (publicKey) {
    emailjs.init(publicKey);
  }
};

export const sendReservationEmail = async (emailData: EmailData): Promise<boolean> => {
  try {
    // Initialize EmailJS
    initializeEmailJS();

    // Get configuration from localStorage
    const serviceId = localStorage.getItem('emailjs_service_id');
    const templateId = localStorage.getItem('emailjs_template_id');
    const publicKey = localStorage.getItem('emailjs_public_key') || localStorage.getItem('emailjs_user_id');

    console.log('EmailJS Configuration:', {
      serviceId: serviceId ? serviceId.substring(0, 10) + '...' : 'NOT SET',
      templateId: templateId ? templateId.substring(0, 10) + '...' : 'NOT SET',
      publicKey: publicKey ? publicKey.substring(0, 10) + '...' : 'NOT SET'
    });

    if (!serviceId || !templateId || !publicKey) {
      console.error('EmailJS not configured properly');
      
      // Show configuration error
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          alert('❌ EmailJS not configured!\n\nPlease go to Email Setup tab and configure:\n- Service ID\n- Template ID\n- Public Key\n\nThen try again.');
        }, 500);
      }
      
      return false;
    }

    // Prepare email template parameters
    const templateParams = {
      to_email: emailData.to_email,
      to_name: emailData.to_name,
      customer_name: emailData.to_name,
      reservation_id: emailData.reservation_id,
      date: emailData.date,
      time: emailData.time,
      party_size: emailData.party_size.toString(),
      status: emailData.status,
      restaurant_name: emailData.restaurant_name,
      restaurant_phone: emailData.restaurant_phone,
      restaurant_email: emailData.restaurant_email,
      subject: getEmailSubject(emailData.status),
      message: getEmailMessage(emailData)
    };

    console.log('Sending email with EmailJS:', {
      serviceId,
      templateId,
      to: emailData.to_email,
      customer: emailData.to_name,
      status: emailData.status
    });

    // Send email using EmailJS
    const response = await emailjs.send(
      serviceId,
      templateId,
      templateParams,
      publicKey
    );

    console.log('Email sent successfully:', response);
    
    // Show success notification
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        alert(`✅ Email sent successfully!\n\nTo: ${emailData.to_email}\nCustomer: ${emailData.to_name}\nStatus: ${emailData.status.toUpperCase()}\n\nEmail delivered via EmailJS.`);
      }, 500);
    }
    
    return true;

  } catch (error) {
    console.error('Failed to send email:', error);
    
    // Show detailed error
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        alert(`❌ Email failed to send!\n\nError: ${error.message || 'Unknown error'}\n\nPlease check your EmailJS configuration in the Email Setup tab.`);
      }, 500);
    }
    
    return false;
  }
};

export const sendStatusUpdateEmail = async (emailData: EmailData): Promise<boolean> => {
  return await sendReservationEmail(emailData);
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

const getEmailMessage = (data: EmailData): string => {
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

// Configuration check
export const isEmailConfigured = (): boolean => {
  const serviceId = localStorage.getItem('emailjs_service_id');
  const templateId = localStorage.getItem('emailjs_template_id');
  const publicKey = localStorage.getItem('emailjs_public_key') || localStorage.getItem('emailjs_user_id');
  
  return !!(serviceId && templateId && publicKey);
};

// Get configuration status
export const getEmailStatus = (): string => {
  if (isEmailConfigured()) {
    return 'EmailJS configured and ready';
  } else {
    return 'EmailJS not configured - Please set up in Email Setup tab';
  }
};

// Function to send automatic emails when reservation status changes
export const sendAutomaticEmail = async (reservation: any, status: 'confirmed' | 'declined'): Promise<boolean> => {
  // Check if customer prefers email communication
  if (reservation.communicationPreference && reservation.communicationPreference !== 'email') {
    console.log('Customer prefers', reservation.communicationPreference, '- skipping email');
    return false;
  }

  const emailData: EmailData = {
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