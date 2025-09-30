import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { PhoneIcon, SendIcon, CheckCircleIcon, AlertCircleIcon, ClockIcon, UsersIcon } from 'lucide-react';
import { toast } from 'sonner';
import { getReservations } from '@/lib/storage';
import { Reservation } from '@/types/reservation';

interface SMSLog {
  id: string;
  to: string;
  message: string;
  status: 'sent' | 'failed' | 'pending';
  timestamp: string;
  reservationId?: string;
  customerName?: string;
}

export default function SMSIntegration() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [smsLogs, setSmsLogs] = useState<SMSLog[]>([]);
  const [selectedReservations, setSelectedReservations] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState('');
  const [customPhoneNumber, setCustomPhoneNumber] = useState('');
  const [messageTemplate, setMessageTemplate] = useState('confirmation');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadReservations();
    loadSMSLogs();
  }, []);

  const loadReservations = () => {
    const allReservations = getReservations();
    setReservations(allReservations);
  };

  const loadSMSLogs = () => {
    const stored = localStorage.getItem('sms_logs');
    if (stored) {
      setSmsLogs(JSON.parse(stored));
    }
  };

  const saveSMSLog = (log: SMSLog) => {
    const updatedLogs = [log, ...smsLogs];
    setSmsLogs(updatedLogs);
    localStorage.setItem('sms_logs', JSON.stringify(updatedLogs));
  };

  const messageTemplates = {
    confirmation: 'Hi {{customer_name}}! Your Rose Garden reservation for {{date}} at {{time}} for {{party_size}} guests is CONFIRMED. See you soon!',
    reminder: 'Reminder: Your Rose Garden reservation is tomorrow {{date}} at {{time}} for {{party_size}} guests. We look forward to seeing you!',
    declined: 'Hi {{customer_name}}. Unfortunately, we cannot accommodate your Rose Garden reservation for {{date}} at {{time}}. Please call 0244 365634 for alternatives. Sorry!',
    followup: 'Thank you for dining with us at Rose Garden! We hope you enjoyed your experience. Please leave us a review!',
    custom: customMessage
  };

  const replaceTemplateVariables = (template: string, reservation: Reservation): string => {
    return template
      .replace(/{{customer_name}}/g, reservation.customerName || reservation.name)
      .replace(/{{date}}/g, new Date(reservation.date).toLocaleDateString())
      .replace(/{{time}}/g, reservation.time)
      .replace(/{{party_size}}/g, reservation.partySize.toString());
  };

  const sendSMSToReservations = async () => {
    if (selectedReservations.length === 0) {
      toast.error('Please select at least one reservation');
      return;
    }

    const provider = localStorage.getItem('sms_provider');
    if (!provider) {
      toast.error('SMS provider not configured. Please configure SMS settings first.');
      return;
    }

    setIsSending(true);

    try {
      for (const reservationId of selectedReservations) {
        const reservation = reservations.find(r => r.id === reservationId);
        if (!reservation) continue;

        const template = messageTemplates[messageTemplate as keyof typeof messageTemplates];
        const message = replaceTemplateVariables(template, reservation);

        // Simulate SMS sending
        await new Promise(resolve => setTimeout(resolve, 1000));

        const smsLog: SMSLog = {
          id: Date.now().toString() + Math.random().toString(36).substr(2),
          to: reservation.phone,
          message,
          status: 'sent',
          timestamp: new Date().toISOString(),
          reservationId: reservation.id,
          customerName: reservation.customerName || reservation.name
        };

        saveSMSLog(smsLog);
        
        console.log('SMS sent:', {
          provider,
          to: reservation.phone,
          message,
          customer: reservation.customerName || reservation.name
        });
      }

      toast.success(`SMS sent to ${selectedReservations.length} customers successfully!`);
      setSelectedReservations([]);
    } catch (error) {
      console.error('Failed to send SMS:', error);
      toast.error('Failed to send SMS messages');
    } finally {
      setIsSending(false);
    }
  };

  const sendCustomSMS = async () => {
    if (!customPhoneNumber || !customMessage) {
      toast.error('Please enter both phone number and message');
      return;
    }

    const provider = localStorage.getItem('sms_provider');
    if (!provider) {
      toast.error('SMS provider not configured. Please configure SMS settings first.');
      return;
    }

    setIsSending(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const smsLog: SMSLog = {
        id: Date.now().toString() + Math.random().toString(36).substr(2),
        to: customPhoneNumber,
        message: customMessage,
        status: 'sent',
        timestamp: new Date().toISOString()
      };

      saveSMSLog(smsLog);
      
      console.log('Custom SMS sent:', {
        provider,
        to: customPhoneNumber,
        message: customMessage
      });

      toast.success('Custom SMS sent successfully!');
      setCustomPhoneNumber('');
      setCustomMessage('');
    } catch (error) {
      console.error('Failed to send custom SMS:', error);
      toast.error('Failed to send custom SMS');
    } finally {
      setIsSending(false);
    }
  };

  const toggleReservationSelection = (reservationId: string) => {
    setSelectedReservations(prev => 
      prev.includes(reservationId) 
        ? prev.filter(id => id !== reservationId)
        : [...prev, reservationId]
    );
  };

  const selectAllReservations = () => {
    if (selectedReservations.length === reservations.length) {
      setSelectedReservations([]);
    } else {
      setSelectedReservations(reservations.map(r => r.id));
    }
  };

  const getProviderStatus = () => {
    const provider = localStorage.getItem('sms_provider');
    const isConfigured = provider && (
      localStorage.getItem('sms_account_sid') || localStorage.getItem('sms_api_key')
    );
    
    return {
      provider: provider || 'Not configured',
      isConfigured: !!isConfigured
    };
  };

  const providerStatus = getProviderStatus();

  return (
    <div className="space-y-6">
      {/* Provider Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PhoneIcon className="h-5 w-5" />
            SMS Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${providerStatus.isConfigured ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">
                Provider: {providerStatus.provider}
              </span>
            </div>
            {!providerStatus.isConfigured && (
              <Alert className="flex-1">
                <AlertCircleIcon className="h-4 w-4" />
                <AlertDescription>
                  SMS provider not configured. Please configure SMS settings in the SMS Setup tab first.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulk SMS to Reservations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5" />
            Send SMS to Reservations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Message Template</Label>
            <Select value={messageTemplate} onValueChange={setMessageTemplate}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="confirmation">Confirmation Message</SelectItem>
                <SelectItem value="reminder">Reminder Message</SelectItem>
                <SelectItem value="declined">Declined Message</SelectItem>
                <SelectItem value="followup">Follow-up Message</SelectItem>
                <SelectItem value="custom">Custom Message</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {messageTemplate === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="customTemplate">Custom Message</Label>
              <Textarea
                id="customTemplate"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Enter your custom message here..."
                rows={3}
              />
              <p className="text-xs text-gray-500">
                Available variables: {{customer_name}}, {{date}}, {{time}}, {{party_size}}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Message Preview</Label>
            <div className="p-3 bg-gray-50 rounded-lg text-sm">
              {messageTemplates[messageTemplate as keyof typeof messageTemplates] || 'Select a template'}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Select Reservations ({selectedReservations.length} selected)</Label>
              <Button variant="outline" size="sm" onClick={selectAllReservations}>
                {selectedReservations.length === reservations.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            
            <div className="max-h-60 overflow-y-auto border rounded-lg">
              {reservations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No reservations found</div>
              ) : (
                reservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                      selectedReservations.includes(reservation.id) ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => toggleReservationSelection(reservation.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{reservation.customerName || reservation.name}</div>
                        <div className="text-sm text-gray-500">
                          {reservation.phone} • {new Date(reservation.date).toLocaleDateString()} at {reservation.time}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={reservation.status === 'confirmed' ? 'default' : 'secondary'}>
                          {reservation.status}
                        </Badge>
                        <input
                          type="checkbox"
                          checked={selectedReservations.includes(reservation.id)}
                          onChange={() => toggleReservationSelection(reservation.id)}
                          className="h-4 w-4"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <Button 
            onClick={sendSMSToReservations} 
            disabled={isSending || !providerStatus.isConfigured || selectedReservations.length === 0}
            className="w-full"
          >
            <SendIcon className="h-4 w-4 mr-2" />
            {isSending ? 'Sending SMS...' : `Send SMS to ${selectedReservations.length} Customers`}
          </Button>
        </CardContent>
      </Card>

      {/* Custom SMS */}
      <Card>
        <CardHeader>
          <CardTitle>Send Custom SMS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customPhoneNumber">Phone Number</Label>
              <Input
                id="customPhoneNumber"
                type="tel"
                value={customPhoneNumber}
                onChange={(e) => setCustomPhoneNumber(e.target.value)}
                placeholder="+1234567890"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customSMSMessage">Message</Label>
            <Textarea
              id="customSMSMessage"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Enter your message here..."
              rows={4}
            />
            <div className="text-xs text-gray-500">
              Character count: {customMessage.length}/160
            </div>
          </div>

          <Button 
            onClick={sendCustomSMS} 
            disabled={isSending || !providerStatus.isConfigured}
            className="w-full"
          >
            <SendIcon className="h-4 w-4 mr-2" />
            {isSending ? 'Sending...' : 'Send Custom SMS'}
          </Button>
        </CardContent>
      </Card>

      {/* SMS Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5" />
            SMS History ({smsLogs.length} messages)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {smsLogs.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No SMS messages sent yet</div>
            ) : (
              smsLogs.slice(0, 20).map((log) => (
                <div key={log.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{log.customerName || 'Custom SMS'}</span>
                        <Badge variant={log.status === 'sent' ? 'default' : 'destructive'}>
                          {log.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">To: {log.to}</div>
                      <div className="text-sm bg-gray-50 p-2 rounded">
                        {log.message}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 ml-4">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}