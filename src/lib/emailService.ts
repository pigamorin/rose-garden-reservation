// Simple email service without Gmail API dependencies
// This provides demo functionality until proper EmailJS is configured

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

export const sendReservationEmail = async (emailData: EmailData): Promise<boolean> => {
  try {
    console.log('📧 DEMO EMAIL SERVICE - Reservation Email:', {
      to: emailData.to_email,
      subject: 'Rose Garden Reservation Confirmation',
      reservation_id: emailData.reservation_id,
      date: emailData.date,
      time: emailData.time,
      party_size: emailData.party_size,
      status: emailData.status
    });

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Show success notification
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        alert(`📧 Email sent successfully!\n\nTo: ${emailData.to_email}\nSubject: Rose Garden Reservation\nStatus: ${emailData.status}\n\nThis is a demo notification. Configure EmailJS for real emails.`);
      }, 500);
    }

    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
};

export const sendStatusUpdateEmail = async (emailData: EmailData): Promise<boolean> => {
  try {
    console.log('📧 DEMO EMAIL SERVICE - Status Update:', {
      to: emailData.to_email,
      subject: `Rose Garden Reservation ${emailData.status}`,
      reservation_id: emailData.reservation_id,
      new_status: emailData.status
    });

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Show success notification
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        alert(`📧 Status update email sent!\n\nTo: ${emailData.to_email}\nStatus: ${emailData.status.toUpperCase()}\n\nThis is a demo notification. Configure EmailJS for real emails.`);
      }, 500);
    }

    return true;
  } catch (error) {
    console.error('Failed to send status update email:', error);
    return false;
  }
};

// Configuration check
export const isEmailConfigured = (): boolean => {
  // Check if EmailJS is properly configured
  const serviceId = localStorage.getItem('emailjs_service_id');
  const templateId = localStorage.getItem('emailjs_template_id');
  const userId = localStorage.getItem('emailjs_user_id');
  
  return !!(serviceId && templateId && userId);
};

// Get configuration status
export const getEmailStatus = (): string => {
  if (isEmailConfigured()) {
    return 'EmailJS configured and ready';
  } else {
    return 'Demo mode - Configure EmailJS for real emails';
  }
};