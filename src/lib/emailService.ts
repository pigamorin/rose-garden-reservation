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

// Initialize EmailJS with public key
const initEmailJS = () => {
  const publicKey = localStorage.getItem('emailjs_public_key') || localStorage.getItem('emailjs_user_id');
  if (publicKey && publicKey !== 'your_public_key') {
    emailjs.init(publicKey);
    console.log('EmailJS initialized with public key:', publicKey.substring(0, 10) + '...');
  }
};

export const sendReservationEmail = async (emailData: EmailData): Promise<boolean> => {
  try {
    // Get configuration from localStorage
    const serviceId = localStorage.getItem('emailjs_service_id') || 'service_emdyfkx';
    const templateId = localStorage.getItem('emailjs_template_id') || 'template_reservation';
    const publicKey = localStorage.getItem('emailjs_public_key') || localStorage.getItem('emailjs_user_id');

    console.log('EmailJS Configuration Check:', {
      serviceId: serviceId ? serviceId : 'MISSING',
      templateId: templateId ? templateId : 'MISSING',
      publicKey: publicKey ? publicKey.substring(0, 10) + '...' : 'MISSING',
      toEmail: emailData.to_email
    });

    if (!serviceId || !templateId || !publicKey || publicKey === 'your_public_key') {
      console.error('❌ EmailJS not configured properly');
      
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          alert('❌ EmailJS not configured!\n\nPlease go to Email Setup tab and configure:\n- Service ID: service_emdyfkx\n- Template ID: (create in EmailJS dashboard)\n- Public Key: (from EmailJS dashboard)\n\nThen try again.');
        }, 500);
      }
      
      return false;
    }

    // Initialize EmailJS
    initEmailJS();

    // Prepare template parameters for EmailJS
    const templateParams = {
      // Standard EmailJS parameters
      to_email: emailData.to_email,
      to_name: emailData.to_name,
      from_name: emailData.restaurant_name,
      reply_to: emailData.restaurant_email,
      
      // Email content
      subject: getEmailSubject(emailData.status),
      message: getEmailMessage(emailData),
      
      // Reservation details
      reservation_id: emailData.reservation_id,
      date: emailData.date,
      time: emailData.time,
      party_size: emailData.party_size.toString(),
      status: emailData.status,
      
      // Restaurant info
      restaurant_name: emailData.restaurant_name,
      restaurant_phone: emailData.restaurant_phone,
      restaurant_email: emailData.restaurant_email,
      
      // Additional variables for template flexibility
      customer_name: emailData.to_name,
      customer_email: emailData.to_email
    };

    console.log('📧 Sending email via EmailJS:', {
      service: serviceId,
      template: templateId,
      to: emailData.to_email,
      customer: emailData.to_name,
      status: emailData.status,
      templateParams: Object.keys(templateParams)
    });

    // Send email using EmailJS
    const response = await emailjs.send(serviceId, templateId, templateParams, publicKey);

    console.log('✅ Email sent successfully:', response);
    
    // Show success notification
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        alert(`✅ Email sent successfully!\n\nTo: ${emailData.to_email}\nCustomer: ${emailData.to_name}\nStatus: ${emailData.status.toUpperCase()}\n\nEmailJS Response: ${response.status} - ${response.text}`);
      }, 500);
    }

    return true;

  } catch (error) {
    console.error('❌ Failed to send email:', error);
    
    // Show detailed error notification
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        let errorMessage = `❌ Email failed to send!\n\nTo: ${emailData.to_email}\nCustomer: ${emailData.to_name}\n\n`;
        
        if (error.status) {
          errorMessage += `Error Code: ${error.status}\n`;
        }
        if (error.text) {
          errorMessage += `Error: ${error.text}\n`;
        } else if (error.message) {
          errorMessage += `Error: ${error.message}\n`;
        }
        
        errorMessage += '\nPlease check:\n1. EmailJS configuration in Email Setup tab\n2. Template exists in EmailJS dashboard\n3. Service is active';
        
        alert(errorMessage);
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

const getEmailMessage = (emailData: EmailData): string => {
  const { to_name, date, time, party_size, status, restaurant_phone } = emailData;
  
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
  
  return !!(serviceId && templateId && publicKey && publicKey !== 'your_public_key');
};

// Get configuration status
export const getEmailStatus = (): string => {
  if (isEmailConfigured()) {
    return 'EmailJS configured and ready';
  } else {
    return 'EmailJS not configured - Please set up in Email Setup tab';
  }
};

// Test email function
export const sendTestEmail = async (testEmail: string): Promise<boolean> => {
  const testData: EmailData = {
    to_email: testEmail,
    to_name: 'Test User',
    reservation_id: 'TEST-' + Date.now(),
    date: new Date().toLocaleDateString(),
    time: '7:00 PM',
    party_size: 2,
    status: 'confirmed',
    restaurant_name: 'Rose Garden Restaurant',
    restaurant_phone: '0244 365634',
    restaurant_email: 'info@rosegarden.com'
  };

  return await sendReservationEmail(testData);
};