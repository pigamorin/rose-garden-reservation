import emailjs from '@emailjs/browser';

// EmailJS configuration with your public key
const EMAILJS_CONFIG = {
  serviceId: 'service_emdyfkx', // Your working service
  publicKey: '2fKyEzMJhgw-SDMp2', // Your actual public key
  templateId: 'template_simple' // Simple template we'll create
};

// Initialize EmailJS with your public key
emailjs.init(EMAILJS_CONFIG.publicKey);

export const sendSimpleEmail = async (
  customerEmail: string,
  customerName: string,
  reservationDetails: {
    id: string;
    date: string;
    time: string;
    partySize: number;
    status: 'confirmed' | 'declined';
  }
): Promise<boolean> => {
  try {
    console.log('📧 Sending email to:', customerEmail);

    const emailContent = reservationDetails.status === 'confirmed' 
      ? `Great news! Your reservation has been CONFIRMED.

Date: ${reservationDetails.date}
Time: ${reservationDetails.time}
Party Size: ${reservationDetails.partySize} guests
Reservation ID: ${reservationDetails.id}

We look forward to serving you at Rose Garden Restaurant!
Call us at 0244 365634 if you need to make changes.

Best regards,
Rose Garden Team`
      : `We regret to inform you that we cannot accommodate your reservation for ${reservationDetails.date} at ${reservationDetails.time}.

Please call us at 0244 365634 to discuss alternative dates.

We apologize for any inconvenience.

Best regards,
Rose Garden Team`;

    // Simple template parameters
    const templateParams = {
      to_email: customerEmail,
      to_name: customerName,
      from_name: 'Rose Garden Restaurant',
      subject: reservationDetails.status === 'confirmed' 
        ? '✅ Reservation Confirmed - Rose Garden Restaurant'
        : '❌ Reservation Update - Rose Garden Restaurant',
      message: emailContent,
      reply_to: 'info@rosegarden.com'
    };

    console.log('📧 Sending with EmailJS:', {
      service: EMAILJS_CONFIG.serviceId,
      template: EMAILJS_CONFIG.templateId,
      to: customerEmail,
      customer: customerName
    });

    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams,
      EMAILJS_CONFIG.publicKey
    );

    console.log('✅ Email sent successfully:', response);
    
    // Show success notification
    alert(`✅ Email sent successfully!\n\nTo: ${customerEmail}\nCustomer: ${customerName}\nStatus: ${reservationDetails.status.toUpperCase()}\n\nEmailJS Response: ${response.status}`);
    
    return true;

  } catch (error) {
    console.error('❌ Failed to send email:', error);
    
    // Show error with solution
    alert(`❌ Email failed to send!\n\nError: ${error.message || 'Unknown error'}\n\nSOLUTION:\n1. Go to https://www.emailjs.com/\n2. Create a template called 'template_simple'\n3. Add variables: {{to_email}}, {{to_name}}, {{subject}}, {{message}}\n\nThen try again!`);
    
    return false;
  }
};

// Alternative: Use browser's mailto (always works as backup)
export const sendMailtoEmail = (
  customerEmail: string,
  customerName: string,
  reservationDetails: {
    id: string;
    date: string;
    time: string;
    partySize: number;
    status: 'confirmed' | 'declined';
  }
): void => {
  const subject = reservationDetails.status === 'confirmed' 
    ? '✅ Reservation Confirmed - Rose Garden Restaurant'
    : '❌ Reservation Update - Rose Garden Restaurant';

  const body = reservationDetails.status === 'confirmed' 
    ? `Dear ${customerName},

Great news! Your reservation has been CONFIRMED.

Date: ${reservationDetails.date}
Time: ${reservationDetails.time}
Party Size: ${reservationDetails.partySize} guests
Reservation ID: ${reservationDetails.id}

We look forward to serving you at Rose Garden Restaurant!
Call us at 0244 365634 if you need to make changes.

Best regards,
Rose Garden Team`
    : `Dear ${customerName},

We regret to inform you that we cannot accommodate your reservation for ${reservationDetails.date} at ${reservationDetails.time}.

Please call us at 0244 365634 to discuss alternative dates.

We apologize for any inconvenience.

Best regards,
Rose Garden Team`;

  const mailtoLink = `mailto:${customerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
  // Open default email client
  window.open(mailtoLink);
  
  console.log('📧 Opened email client for:', customerEmail);
  alert(`📧 Email client opened!\n\nTo: ${customerEmail}\nPlease send the email from your email client.`);
};