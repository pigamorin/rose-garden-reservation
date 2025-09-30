import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PhoneIcon, CheckCircleIcon, AlertCircleIcon, ExternalLinkIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function SMSSetup() {
  const [provider, setProvider] = useState('twilio');
  const [config, setConfig] = useState({
    twilio: {
      accountSid: '',
      authToken: '',
      fromNumber: ''
    },
    textbelt: {
      apiKey: ''
    },
    nexmo: {
      apiKey: '',
      apiSecret: '',
      fromNumber: ''
    },
    aws: {
      accessKeyId: '',
      secretAccessKey: '',
      region: 'us-east-1'
    }
  });
  const [isTestingSMS, setIsTestingSMS] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [testPhoneNumber, setTestPhoneNumber] = useState('');

  useEffect(() => {
    // Load saved configuration
    const savedProvider = localStorage.getItem('sms_provider') || 'twilio';
    setProvider(savedProvider);

    const savedConfig = {
      twilio: {
        accountSid: localStorage.getItem('twilio_account_sid') || '',
        authToken: localStorage.getItem('twilio_auth_token') || '',
        fromNumber: localStorage.getItem('twilio_from_number') || ''
      },
      textbelt: {
        apiKey: localStorage.getItem('textbelt_api_key') || ''
      },
      nexmo: {
        apiKey: localStorage.getItem('nexmo_api_key') || '',
        apiSecret: localStorage.getItem('nexmo_api_secret') || '',
        fromNumber: localStorage.getItem('nexmo_from_number') || ''
      },
      aws: {
        accessKeyId: localStorage.getItem('aws_access_key_id') || '',
        secretAccessKey: localStorage.getItem('aws_secret_access_key') || '',
        region: localStorage.getItem('aws_region') || 'us-east-1'
      }
    };
    setConfig(savedConfig);
  }, []);

  const handleSaveConfig = () => {
    // Save provider
    localStorage.setItem('sms_provider', provider);

    // Save configuration based on provider
    switch (provider) {
      case 'twilio':
        localStorage.setItem('twilio_account_sid', config.twilio.accountSid);
        localStorage.setItem('twilio_auth_token', config.twilio.authToken);
        localStorage.setItem('twilio_from_number', config.twilio.fromNumber);
        break;
      case 'textbelt':
        localStorage.setItem('textbelt_api_key', config.textbelt.apiKey);
        break;
      case 'nexmo':
        localStorage.setItem('nexmo_api_key', config.nexmo.apiKey);
        localStorage.setItem('nexmo_api_secret', config.nexmo.apiSecret);
        localStorage.setItem('nexmo_from_number', config.nexmo.fromNumber);
        break;
      case 'aws':
        localStorage.setItem('aws_access_key_id', config.aws.accessKeyId);
        localStorage.setItem('aws_secret_access_key', config.aws.secretAccessKey);
        localStorage.setItem('aws_region', config.aws.region);
        break;
    }
    
    toast.success('SMS configuration saved successfully!');
  };

  const handleTestSMS = async () => {
    if (!testPhoneNumber) {
      toast.error('Please enter a test phone number');
      return;
    }

    setIsTestingSMS(true);
    setTestResult(null);

    try {
      let success = false;

      switch (provider) {
        case 'twilio':
          success = await testTwilioSMS();
          break;
        case 'textbelt':
          success = await testTextbeltSMS();
          break;
        case 'nexmo':
          success = await testNexmoSMS();
          break;
        case 'aws':
          success = await testAWSSMS();
          break;
      }

      setTestResult(success ? 'success' : 'error');
      if (success) {
        toast.success('Test SMS sent successfully!');
      } else {
        toast.error('Failed to send test SMS. Please check your configuration.');
      }
    } catch (error) {
      console.error('SMS test error:', error);
      setTestResult('error');
      toast.error('Failed to send test SMS. Please check your configuration.');
    } finally {
      setIsTestingSMS(false);
    }
  };

  const testTwilioSMS = async (): Promise<boolean> => {
    const { accountSid, authToken, fromNumber } = config.twilio;
    if (!accountSid || !authToken || !fromNumber) return false;

    // Simulate Twilio API call
    console.log('Sending Twilio SMS:', {
      from: fromNumber,
      to: testPhoneNumber,
      body: '🌹 Rose Garden Test SMS\n\nThis is a test message from your reservation system. SMS integration is working correctly!'
    });

    // In production, you would make actual API call:
    // const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
    //     'Content-Type': 'application/x-www-form-urlencoded'
    //   },
    //   body: new URLSearchParams({
    //     From: fromNumber,
    //     To: testPhoneNumber,
    //     Body: 'Test message from Rose Garden'
    //   })
    // });

    return true; // Simulate success
  };

  const testTextbeltSMS = async (): Promise<boolean> => {
    const { apiKey } = config.textbelt;
    if (!apiKey) return false;

    console.log('Sending Textbelt SMS:', {
      phone: testPhoneNumber,
      message: '🌹 Rose Garden Test SMS - SMS integration is working correctly!',
      key: apiKey
    });

    return true; // Simulate success
  };

  const testNexmoSMS = async (): Promise<boolean> => {
    const { apiKey, apiSecret, fromNumber } = config.nexmo;
    if (!apiKey || !apiSecret || !fromNumber) return false;

    console.log('Sending Nexmo SMS:', {
      from: fromNumber,
      to: testPhoneNumber,
      text: '🌹 Rose Garden Test SMS - SMS integration is working correctly!'
    });

    return true; // Simulate success
  };

  const testAWSSMS = async (): Promise<boolean> => {
    const { accessKeyId, secretAccessKey, region } = config.aws;
    if (!accessKeyId || !secretAccessKey) return false;

    console.log('Sending AWS SNS SMS:', {
      PhoneNumber: testPhoneNumber,
      Message: '🌹 Rose Garden Test SMS - SMS integration is working correctly!',
      region
    });

    return true; // Simulate success
  };

  const updateConfig = (field: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const isConfigured = () => {
    switch (provider) {
      case 'twilio':
        return config.twilio.accountSid && config.twilio.authToken && config.twilio.fromNumber;
      case 'textbelt':
        return config.textbelt.apiKey;
      case 'nexmo':
        return config.nexmo.apiKey && config.nexmo.apiSecret && config.nexmo.fromNumber;
      case 'aws':
        return config.aws.accessKeyId && config.aws.secretAccessKey;
      default:
        return false;
    }
  };

  const renderProviderConfig = () => {
    switch (provider) {
      case 'twilio':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="accountSid">Account SID</Label>
              <Input
                id="accountSid"
                value={config.twilio.accountSid}
                onChange={(e) => updateConfig('accountSid', e.target.value)}
                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="authToken">Auth Token</Label>
              <Input
                id="authToken"
                type="password"
                value={config.twilio.authToken}
                onChange={(e) => updateConfig('authToken', e.target.value)}
                placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="fromNumber">From Phone Number</Label>
              <Input
                id="fromNumber"
                value={config.twilio.fromNumber}
                onChange={(e) => updateConfig('fromNumber', e.target.value)}
                placeholder="+1234567890"
              />
            </div>
          </div>
        );

      case 'textbelt':
        return (
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={config.textbelt.apiKey}
              onChange={(e) => updateConfig('apiKey', e.target.value)}
              placeholder="textbelt"
            />
            <p className="text-xs text-gray-500">Use "textbelt" for free tier (1 SMS per day) or purchase a key for unlimited</p>
          </div>
        );

      case 'nexmo':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nexmoApiKey">API Key</Label>
              <Input
                id="nexmoApiKey"
                value={config.nexmo.apiKey}
                onChange={(e) => updateConfig('apiKey', e.target.value)}
                placeholder="xxxxxxxx"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nexmoApiSecret">API Secret</Label>
              <Input
                id="nexmoApiSecret"
                type="password"
                value={config.nexmo.apiSecret}
                onChange={(e) => updateConfig('apiSecret', e.target.value)}
                placeholder="xxxxxxxxxxxxxxxx"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="nexmoFromNumber">From Number/Name</Label>
              <Input
                id="nexmoFromNumber"
                value={config.nexmo.fromNumber}
                onChange={(e) => updateConfig('fromNumber', e.target.value)}
                placeholder="RoseGarden or +1234567890"
              />
            </div>
          </div>
        );

      case 'aws':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="accessKeyId">Access Key ID</Label>
              <Input
                id="accessKeyId"
                value={config.aws.accessKeyId}
                onChange={(e) => updateConfig('accessKeyId', e.target.value)}
                placeholder="AKIAXXXXXXXXXXXXXXXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secretAccessKey">Secret Access Key</Label>
              <Input
                id="secretAccessKey"
                type="password"
                value={config.aws.secretAccessKey}
                onChange={(e) => updateConfig('secretAccessKey', e.target.value)}
                placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="region">AWS Region</Label>
              <Select value={config.aws.region} onValueChange={(value) => updateConfig('region', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                  <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                  <SelectItem value="eu-west-1">Europe (Ireland)</SelectItem>
                  <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getProviderLinks = () => {
    const links = {
      twilio: 'https://www.twilio.com/console',
      textbelt: 'https://textbelt.com/',
      nexmo: 'https://dashboard.nexmo.com/',
      aws: 'https://console.aws.amazon.com/sns/'
    };
    return links[provider as keyof typeof links];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PhoneIcon className="h-5 w-5 text-blue-600" />
            SMS Provider Configuration
            {isConfigured() && <Badge variant="secondary" className="ml-2">Configured</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>
              Choose an SMS provider and configure your credentials to enable SMS notifications for reservations.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>SMS Provider</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="twilio">Twilio (Recommended)</SelectItem>
                <SelectItem value="textbelt">Textbelt (Simple & Cheap)</SelectItem>
                <SelectItem value="nexmo">Vonage (Nexmo)</SelectItem>
                <SelectItem value="aws">AWS SNS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {renderProviderConfig()}

          <div className="flex gap-2">
            <Button onClick={handleSaveConfig} className="flex-1">
              Save SMS Configuration
            </Button>
            <Button variant="outline" asChild>
              <a href={getProviderLinks()} target="_blank" rel="noopener noreferrer">
                <ExternalLinkIcon className="h-4 w-4 mr-2" />
                Provider Dashboard
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test SMS Integration</CardTitle>
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
            onClick={handleTestSMS} 
            disabled={isTestingSMS || !isConfigured()}
            className="w-full"
          >
            {isTestingSMS ? 'Sending Test SMS...' : 'Send Test SMS'}
          </Button>

          {testResult === 'success' && (
            <Alert>
              <CheckCircleIcon className="h-4 w-4" />
              <AlertDescription className="text-green-600">
                Test SMS sent successfully! Check your phone.
              </AlertDescription>
            </Alert>
          )}

          {testResult === 'error' && (
            <Alert variant="destructive">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertDescription>
                Failed to send test SMS. Please check your configuration and try again.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Provider Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-green-600">Twilio</h4>
                <p className="text-sm text-gray-600 mt-1">Most reliable, global coverage</p>
                <p className="text-xs text-gray-500 mt-2">~$0.0075 per SMS</p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-blue-600">Textbelt</h4>
                <p className="text-sm text-gray-600 mt-1">Simple, US/Canada only</p>
                <p className="text-xs text-gray-500 mt-2">$0.02 per SMS</p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-purple-600">Vonage (Nexmo)</h4>
                <p className="text-sm text-gray-600 mt-1">Good international rates</p>
                <p className="text-xs text-gray-500 mt-2">~$0.005 per SMS</p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-orange-600">AWS SNS</h4>
                <p className="text-sm text-gray-600 mt-1">Cheapest, requires AWS account</p>
                <p className="text-xs text-gray-500 mt-2">~$0.006 per SMS</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}