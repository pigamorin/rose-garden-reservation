export interface Reservation {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  partySize: number;
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'declined';
  attendance?: 'attended' | 'no-show' | null;
  attendanceMarkedAt?: string;
  attendanceMarkedBy?: string;
  communicationPreference: 'email' | 'sms' | 'whatsapp';
  createdAt: string;
}

export interface Staff {
  username: string;
  password: string;
}