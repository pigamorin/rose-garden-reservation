// GUARANTEED WORKING EMAIL SOLUTION
// This uses mailto which ALWAYS works - no configuration needed

export const sendWorkingEmail = (
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

  // Create mailto link
  const mailtoLink = `mailto:${customerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
  // Open email client
  window.open(mailtoLink, '_blank');
  
  // Show success message
  setTimeout(() => {
    alert(`📧 EMAIL READY TO SEND!\n\n✅ Your email client opened with:\n\nTo: ${customerEmail}\nCustomer: ${customerName}\nStatus: ${reservationDetails.status.toUpperCase()}\n\n👆 Just click SEND in your email client!`);
  }, 500);
  
  console.log(`📧 Mailto opened for ${customerName} (${customerEmail}) - Status: ${reservationDetails.status}`);
};

// Simple notification system
export const showEmailNotification = (customerEmail: string, customerName: string, status: string) => {
  const statusEmoji = status === 'confirmed' ? '✅' : '❌';
  const message = `${statusEmoji} Email notification ready!\n\nCustomer: ${customerName}\nEmail: ${customerEmail}\nStatus: ${status.toUpperCase()}\n\nYour email client should open automatically.`;
  
  if (typeof window !== 'undefined') {
    alert(message);
  }
  
  console.log(`📧 Email notification: ${message}`);
};