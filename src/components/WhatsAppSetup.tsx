import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageCircleIcon, CheckCircleIcon, AlertCircleIcon, ExternalLinkIcon, CopyIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function WhatsAppSetup() {
  const [config, setConfig] = useState({
    businessAccountId: '',
    accessToken: '',
    phoneNumberId: '',
    webhookVerifyToken: '',
    appId: '',
    appSecret: ''
  });
  const [isTestingWhatsApp, setIsTestingWhatsApp] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [testPhoneNumber, setTestPhoneNumber] = useState('');

  useEffect(() => {
    // Load saved configuration
    const savedConfig = {
      businessAccountId: localStorage.getItem('whatsapp_business_account_id') || '',
      accessToken: localStorage.getItem('whatsapp_access_token') || '',
      phoneNumberId: localStorage.getItem('whatsapp_phone_number_id') || '',
      webhookVerifyToken: localStorage.getItem('whatsapp_webhook_verify_token') || '',
      appId: localStorage.getItem('whatsapp_app_id') || '',
      appSecret: localStorage.getItem('whatsapp_app_secret') || ''
    };
    setConfig(savedConfig);
  }, []);

  const handleSaveConfig = () => {
    // Save configuration to localStorage
    localStorage.setItem('whatsapp_business_account_id', config.businessAccountId);
    localStorage.setItem('whatsapp_access_token', config.accessToken);
    localStorage.setItem('whatsapp_phone_number_id', config.phoneNumberId);
    localStorage.setItem('whatsapp_webhook_verify_token', config.webhookVerifyToken);
    localStorage.setItem('whatsapp_app_id', config.appId);
    localStorage.setItem('whatsapp_app_secret', config.appSecret);
    
    toast.success('WhatsApp configuration saved successfully!');
  };

  const handleTestWhatsApp = async () => {
    if (!testPhoneNumber) {
      toast.error('Please enter a test phone number');
      return;
    }

    if (!config.accessToken || !config.phoneNumberId) {
      toast.error('Please configure WhatsApp settings first');
      return;
    }

    setIsTestingWhatsApp(true);
    setTestResult(null);

    try {
      // Simulate WhatsApp API call
      const response = await fetch(`https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: testPhoneNumber.replace(/\D/g, ''),
          type: 'text',
          text: {
            body: '🌹 Rose Garden Test Message\n\nThis is a test message from your reservation system. WhatsApp integration is working correctly!'
          }
        })
      });

      if (response.ok) {
        setTestResult('success');
        toast.success('Test WhatsApp message sent successfully!');
      } else {
        throw new Error('WhatsApp API failed');
      }
    } catch (error) {
      console.error('WhatsApp test error:', error);
      setTestResult('error');
      toast.error('Failed to send test WhatsApp message. Please check your configuration.');
    } finally {
      setIsTestingWhatsApp(false);
    }
  };

  const copyWebhookUrl = () => {
    const webhookUrl = `${window.location.origin}/api/whatsapp/webhook`;
    navigator.clipboard.writeText(webhookUrl);
    toast.success('Webhook URL copied to clipboard!');
  };

  const isConfigured = config.businessAccountId && config.accessToken && config.phoneNumberId;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircleIcon className="h-5 w-5 text-green-600" />
            WhatsApp Business API Configuration
            {isConfigured && <Badge variant="secondary" className="ml-2">Configured</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>
              To enable WhatsApp notifications, you need a WhatsApp Business API account. Follow the setup guide below.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessAccountId">Business Account ID</Label>
              <Input
                id="businessAccountId"
                value={config.businessAccountId}
                onChange={(e) => setConfig(prev => ({ ...prev, businessAccountId: e.target.value }))}
                placeholder="123456789012345"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="accessToken">Access Token</Label>
              <Input
                id="accessToken"
                type="password"
                value={config.accessToken}
                onChange={(e) => setConfig(prev => ({ ...prev, accessToken: e.target.value }))}
                placeholder="EAAxxxxxxxxxx..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phoneNumberId">Phone Number ID</Label>
              <Input
                id="phoneNumberId"
                value={config.phoneNumberId}
                onChange={(e) => setConfig(prev => ({ ...prev, phoneNumberId: e.target.value }))}
                placeholder="123456789012345"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="webhookVerifyToken">Webhook Verify Token</Label>
              <Input
                id="webhookVerifyToken"
                value={config.webhookVerifyToken}
                onChange={(e) => setConfig(prev => ({ ...prev, webhookVerifyToken: e.target.value }))}
                placeholder="your_verify_token"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="appId">App ID</Label>
              <Input
                id="appId"
                value={config.appId}
                onChange={(e) => setConfig(prev => ({ ...prev, appId: e.target.value }))}
                placeholder="123456789012345"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="appSecret">App Secret</Label>
              <Input
                id="appSecret"
                type="password"
                value={config.appSecret}
                onChange={(e) => setConfig(prev => ({ ...prev, appSecret: e.target.value }))}
                placeholder="xxxxxxxxxxxxxxxx"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                value={`${window.location.origin}/api/whatsapp/webhook`}
                readOnly
                className="bg-gray-50"
              />
              <Button variant="outline" size="sm" onClick={copyWebhookUrl}>
                <CopyIcon className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500">Use this URL in your WhatsApp Business API webhook configuration</p>
          </div>

          <Button onClick={handleSaveConfig} className="w-full">
            Save WhatsApp Configuration
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test WhatsApp Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="testPhoneNumber">Test Phone Number (with country code)</Label>
            <Input
              id="testPhoneNumber"
              type="tel"
              value={testPhoneNumber}
              onChange={(e) => setTestPhoneNumber(e.target.value)}
              placeholder="+1234567890"
            />
          </div>

          <Button 
            onClick={handleTestWhatsApp} 
            disabled={isTestingWhatsApp || !isConfigured}
            className="w-full"
          >
            {isTestingWhatsApp ? 'Sending Test Message...' : 'Send Test WhatsApp Message'}
          </Button>

          {testResult === 'success' && (
            <Alert>
              <CheckCircleIcon className="h-4 w-4" />
              <AlertDescription className="text-green-600">
                Test WhatsApp message sent successfully! Check your phone.
              </AlertDescription>
            </Alert>
          )}

          {testResult === 'error' && (
            <Alert variant="destructive">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertDescription>
                Failed to send test WhatsApp message. Please check your configuration and try again.
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
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline">1</Badge>
              <span>Create a Meta Developer Account at</span>
              <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline flex items-center gap-1">
                developers.facebook.com <ExternalLinkIcon className="h-3 w-3" />
              </a>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline">2</Badge>
              <span>Create a new WhatsApp Business API app</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline">3</Badge>
              <span>Add WhatsApp Business API product to your app</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline">4</Badge>
              <span>Get your Business Account ID, Phone Number ID, and Access Token</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline">5</Badge>
              <span>Configure webhook with the URL provided above</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline">6</Badge>
              <span>Test your configuration using the test form above</span>
            </div>
          </div>

          <Alert className="mt-4">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> WhatsApp Business API requires approval for production use. 
              Test numbers work immediately, but you'll need Meta's approval to send messages to any phone number.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}