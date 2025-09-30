import emailjs from 'emailjs-com';

// EmailJS configuration
const EMAILJS_SERVICE_ID = 'service_your_service_id'; // Replace with your EmailJS service ID
const EMAILJS_TEMPLATE_ID = 'template_your_template_id'; // Replace with your EmailJS template ID
const EMAILJS_USER_ID = 'your_user_id'; // Replace with your EmailJS user ID

// Initialize EmailJS
emailjs.init(EMAILJS_USER_ID);

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
    console.log('Sending email with data:', emailData);
    
    const templateParams = {
      to_email: emailData.to_email,
      to_name: emailData.to_name,
      reservation_id: emailData.reservation_id,
      date: emailData.date,
      time: emailData.time,
      party_size: emailData.party_size,
      status: emailData.status,
      restaurant_name: emailData.restaurant_name || 'Rose Garden Restaurant',
      restaurant_phone: emailData.restaurant_phone || '(555) 123-4567',
      restaurant_email: emailData.restaurant_email || 'info@rosegarden.com'
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    console.log('Email sent successfully:', response);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
};

export const sendStatusUpdateEmail = async (emailData: EmailData): Promise<boolean> => {
  try {
    console.log('Sending status update email:', emailData);
    
    const templateParams = {
      to_email: emailData.to_email,
      to_name: emailData.to_name,
      reservation_id: emailData.reservation_id,
      date: emailData.date,
      time: emailData.time,
      party_size: emailData.party_size,
      status: emailData.status,
      restaurant_name: emailData.restaurant_name || 'Rose Garden Restaurant',
      restaurant_phone: emailData.restaurant_phone || '(555) 123-4567',
      restaurant_email: emailData.restaurant_email || 'info@rosegarden.com'
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      'template_status_update', // Different template for status updates
      templateParams
    );

    console.log('Status update email sent successfully:', response);
    return true;
  } catch (error) {
    console.error('Failed to send status update email:', error);
    return false;
  }
};