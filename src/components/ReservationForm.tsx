import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, ClockIcon, UsersIcon, PhoneIcon, MailIcon, MessageSquareIcon } from 'lucide-react';
import { saveReservation, generateId, isSlotBlocked } from '@/lib/storage';
import { Reservation } from '@/types/reservation';
import { toast } from 'sonner';

export default function ReservationForm() {
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    partySize: 2,
    specialRequests: '',
    communicationPreference: 'email' as 'email' | 'sms' | 'whatsapp'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.email || !formData.phone || !formData.date || !formData.time) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Validate phone format (basic validation)
    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      toast.error('Please enter a valid phone number');
      return;
    }

    // Check if date is in the future
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      toast.error('Please select a future date');
      return;
    }

    // Check if the selected time slot is blocked
    if (isSlotBlocked(formData.date, formData.time)) {
      toast.error('Sorry, this time slot is not available. Please choose a different time.');
      return;
    }

    // Show large party message
    if (formData.partySize >= 10) {
      toast.info('For parties of 10 or more, please call us at 0244 365634 for special arrangements');
    }

    setIsSubmitting(true);

    try {
      const reservation: Reservation = {
        id: generateId(),
        customerName: formData.customerName,
        email: formData.email,
        phone: formData.phone,
        date: formData.date,
        time: formData.time,
        partySize: formData.partySize,
        specialRequests: formData.specialRequests,
        status: 'pending',
        communicationPreference: formData.communicationPreference,
        createdAt: new Date().toISOString()
      };

      saveReservation(reservation);
      
      // Show success message with communication preference
      const communicationMethod = {
        email: 'email',
        sms: 'text message',
        whatsapp: 'WhatsApp'
      }[formData.communicationPreference];

      toast.success(`Reservation submitted successfully! We'll contact you via ${communicationMethod} to confirm your booking.`);
      
      // Reset form
      setFormData({
        customerName: '',
        email: '',
        phone: '',
        date: '',
        time: '',
        partySize: 2,
        specialRequests: '',
        communicationPreference: 'email'
      });
    } catch (error) {
      toast.error('Failed to submit reservation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customerName" className="flex items-center gap-2">
              <UsersIcon className="h-4 w-4" />
              Full Name *
            </Label>
            <Input
              id="customerName"
              type="text"
              value={formData.customerName}
              onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <PhoneIcon className="h-4 w-4" />
              Phone Number *
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="0244 365634"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <MailIcon className="h-4 w-4" />
            Email Address *
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="your.email@example.com"
            required
          />
        </div>
      </div>

      {/* Reservation Details */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Date *
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              min={getMinDate()}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time" className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4" />
              Time *
            </Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              required
            />
            {formData.date && formData.time && isSlotBlocked(formData.date, formData.time) && (
              <p className="text-xs text-red-600">⚠️ This time slot is not available</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="partySize" className="flex items-center gap-2">
              <UsersIcon className="h-4 w-4" />
              Party Size *
            </Label>
            <Input
              id="partySize"
              type="number"
              min="1"
              max="20"
              value={formData.partySize}
              onChange={(e) => setFormData(prev => ({ ...prev, partySize: parseInt(e.target.value) || 1 }))}
              required
            />
          </div>
        </div>
      </div>

      {/* Communication Preference */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <MessageSquareIcon className="h-4 w-4" />
          How would you like us to contact you? *
        </Label>
        <Select 
          value={formData.communicationPreference} 
          onValueChange={(value: 'email' | 'sms' | 'whatsapp') => 
            setFormData(prev => ({ ...prev, communicationPreference: value }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="email">📧 Email</SelectItem>
            <SelectItem value="sms">📱 Text Message (SMS)</SelectItem>
            <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">
          We'll use this method to confirm your reservation and send updates
        </p>
      </div>

      {/* Special Requests */}
      <div className="space-y-2">
        <Label htmlFor="specialRequests">Special Requests</Label>
        <Textarea
          id="specialRequests"
          value={formData.specialRequests}
          onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
          placeholder="Any dietary restrictions, allergies, or special occasions we should know about?"
          rows={3}
        />
      </div>

      {/* Large Party Notice */}
      {formData.partySize >= 10 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-orange-800 text-sm">Large Party Notice</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-orange-700">
              For parties of 10 or more guests, we recommend calling us directly at{' '}
              <strong>0244 365634</strong> to ensure we can accommodate your group with the best possible service.
            </CardDescription>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <Button 
        type="submit" 
        className="w-full bg-pink-600 hover:bg-pink-700 text-white"
        disabled={isSubmitting || (formData.date && formData.time && isSlotBlocked(formData.date, formData.time))}
      >
        {isSubmitting ? 'Submitting...' : 'Reserve'}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        By submitting this form, you agree to receive confirmation messages via your selected communication method.
      </p>
    </form>
  );
}