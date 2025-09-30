import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MailIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react';
import { sendReservationEmail } from '@/lib/emailService';

export default function EmailSetup() {
  const [serviceId, setServiceId] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [userId, setUserId] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const handleSaveConfig = () => {
    // Save configuration to localStorage or environment
    localStorage.setItem('emailjs_service_id', serviceId);
    localStorage.setItem('emailjs_template_id', templateId);
    localStorage.setItem('emailjs_user_id', userId);
    
    alert('Email configuration saved! Please restart the application for changes to take effect.');
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      alert('Please enter a test email address');
      return;
    }

    setIsTestingEmail(true);
    setTestResult(null);

    try {
      const success = await sendReservationEmail({
        to_email: testEmail,
        to_name: 'Test User',
        reservation_id: 'TEST-123',
        date: new Date().toLocaleDateString(),
        time: '7:00 PM',
        party_size: 2,
        status: 'confirmed',
        restaurant_name: 'Rose Garden Restaurant',
        restaurant_phone: '(555) 123-4567',
        restaurant_email: 'info@rosegarden.com'
      });

      setTestResult(success ? 'success' : 'error');
    } catch (error) {
      console.error('Test email error:', error);
      setTestResult('error');
    } finally {
      setIsTestingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MailIcon className="h-5 w-5" />
            Email Configuration (EmailJS)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>
              To enable email notifications, you need to set up EmailJS. Visit{' '}
              <a href="https://www.emailjs.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                emailjs.com
              </a>{' '}
              to create an account and get your configuration details.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serviceId">Service ID</Label>
              <Input
                id="serviceId"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                placeholder="service_xxxxxxx"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="templateId">Template ID</Label>
              <Input
                id="templateId"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                placeholder="template_xxxxxxx"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="user_xxxxxxx"
              />
            </div>
          </div>

          <Button onClick={handleSaveConfig} className="w-full">
            Save Configuration
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="testEmail">Test Email Address</Label>
            <Input
              id="testEmail"
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@example.com"
            />
          </div>

          <Button 
            onClick={handleTestEmail} 
            disabled={isTestingEmail}
            className="w-full"
          >
            {isTestingEmail ? 'Sending Test Email...' : 'Send Test Email'}
          </Button>

          {testResult === 'success' && (
            <Alert>
              <CheckCircleIcon className="h-4 w-4" />
              <AlertDescription className="text-green-600">
                Test email sent successfully! Check your inbox.
              </AlertDescription>
            </Alert>
          )}

          {testResult === 'error' && (
            <Alert variant="destructive">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertDescription>
                Failed to send test email. Please check your configuration and try again.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Create an account at <a href="https://www.emailjs.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">emailjs.com</a></li>
            <li>Create an email service (Gmail, Outlook, etc.)</li>
            <li>Create an email template with variables: to_email, to_name, reservation_id, date, time, party_size, status</li>
            <li>Copy your Service ID, Template ID, and User ID from EmailJS dashboard</li>
            <li>Paste them in the configuration form above</li>
            <li>Test the email functionality</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}