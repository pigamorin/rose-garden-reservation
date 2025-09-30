// SMS Service for sending automated notifications
export interface SMSConfig {
  provider: string;
  accountSid?: string;
  authToken?: string;
  fromNumber?: string;
  apiKey?: string;
  apiSecret?: string;
}

export interface SMSMessage {
  to: string;
  message: string;
  reservationId?: string;
  customerName?: string;
}

export const getSMSConfig = (): SMSConfig | null => {
  const provider = localStorage.getItem('sms_provider');
  if (!provider) return null;

  return {
    provider,
    accountSid: localStorage.getItem('sms_account_sid') || '',
    authToken: localStorage.getItem('sms_auth_token') || '',
    fromNumber: localStorage.getItem('sms_from_number') || '',
    apiKey: localStorage.getItem('sms_api_key') || '',
    apiSecret: localStorage.getItem('sms_api_secret') || ''
  };
};

export const isSMSConfigured = (): boolean => {
  const config = getSMSConfig();
  if (!config) return false;

  switch (config.provider) {
    case 'twilio':
      return !!(config.accountSid && config.authToken && config.fromNumber);
    case 'nexmo':
    case 'messagebird':
    case 'plivo':
    case 'clicksend':
    case 'textmagic':
      return !!(config.apiKey && config.apiSecret && config.fromNumber);
    default:
      return false;
  }
};

export const sendSMS = async (smsMessage: SMSMessage): Promise<boolean> => {
  const config = getSMSConfig();
  if (!config || !isSMSConfigured()) {
    console.error('SMS not configured');
    return false;
  }

  try {
    switch (config.provider) {
      case 'twilio':
        return await sendTwilioSMS(config, smsMessage);
      case 'nexmo':
        return await sendNexmoSMS(config, smsMessage);
      case 'messagebird':
        return await sendMessageBirdSMS(config, smsMessage);
      case 'plivo':
        return await sendPlivoSMS(config, smsMessage);
      case 'clicksend':
        return await sendClickSendSMS(config, smsMessage);
      case 'textmagic':
        return await sendTextMagicSMS(config, smsMessage);
      default:
        console.error('Unknown SMS provider:', config.provider);
        return false;
    }
  } catch (error) {
    console.error('SMS sending failed:', error);
    return false;
  }
};

const sendTwilioSMS = async (config: SMSConfig, smsMessage: SMSMessage): Promise<boolean> => {
  // In production, this would make actual API call to Twilio
  console.log('Sending Twilio SMS:', {
    from: config.fromNumber,
    to: smsMessage.to,
    body: smsMessage.message,
    accountSid: config.accountSid?.substring(0, 10) + '...'
  });

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate success (in production, check actual API response)
  return true;
};

const sendNexmoSMS = async (config: SMSConfig, smsMessage: SMSMessage): Promise<boolean> => {
  console.log('Sending Nexmo SMS:', {
    from: config.fromNumber,
    to: smsMessage.to,
    text: smsMessage.message,
    apiKey: config.apiKey?.substring(0, 8) + '...'
  });

  await new Promise(resolve => setTimeout(resolve, 1000));
  return true;
};

const sendMessageBirdSMS = async (config: SMSConfig, smsMessage: SMSMessage): Promise<boolean> => {
  console.log('Sending MessageBird SMS:', {
    originator: config.fromNumber,
    recipients: [smsMessage.to],
    body: smsMessage.message,
    apiKey: config.apiKey?.substring(0, 8) + '...'
  });

  await new Promise(resolve => setTimeout(resolve, 1000));
  return true;
};

const sendPlivoSMS = async (config: SMSConfig, smsMessage: SMSMessage): Promise<boolean> => {
  console.log('Sending Plivo SMS:', {
    src: config.fromNumber,
    dst: smsMessage.to,
    text: smsMessage.message,
    authId: config.apiKey?.substring(0, 8) + '...'
  });

  await new Promise(resolve => setTimeout(resolve, 1000));
  return true;
};

const sendClickSendSMS = async (config: SMSConfig, smsMessage: SMSMessage): Promise<boolean> => {
  console.log('Sending ClickSend SMS:', {
    from: config.fromNumber,
    to: smsMessage.to,
    body: smsMessage.message,
    username: config.apiKey?.substring(0, 8) + '...'
  });

  await new Promise(resolve => setTimeout(resolve, 1000));
  return true;
};

const sendTextMagicSMS = async (config: SMSConfig, smsMessage: SMSMessage): Promise<boolean> => {
  console.log('Sending TextMagic SMS:', {
    from: config.fromNumber,
    phones: smsMessage.to,
    text: smsMessage.message,
    username: config.apiKey?.substring(0, 8) + '...'
  });

  await new Promise(resolve => setTimeout(resolve, 1000));
  return true;
};

// Message templates for different scenarios
export const getSMSTemplate = (type: 'confirmed' | 'declined' | 'reminder', reservation: any): string => {
  const templates = {
    confirmed: `Hi ${reservation.customerName}! Your Rose Garden reservation for ${new Date(reservation.date).toLocaleDateString()} at ${reservation.time} for ${reservation.partySize} guests is CONFIRMED. See you soon!`,
    declined: `Hi ${reservation.customerName}. Unfortunately, we cannot accommodate your Rose Garden reservation for ${new Date(reservation.date).toLocaleDateString()} at ${reservation.time}. Please call 0244 365634 for alternatives. Sorry!`,
    reminder: `Reminder: Your Rose Garden reservation is tomorrow ${new Date(reservation.date).toLocaleDateString()} at ${reservation.time} for ${reservation.partySize} guests. We look forward to seeing you!`
  };

  return templates[type];
};