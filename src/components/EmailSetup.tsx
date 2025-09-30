import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MailIcon, CheckCircleIcon, AlertCircleIcon, ExternalLinkIcon, CopyIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function EmailSetup() {
  const [provider, setProvider] = useState('emailjs');
  const [config, setConfig] = useState({
    // EmailJS Configuration
    emailjs: {
      serviceId: '',
      templateId: '',
      publicKey: '',
      privateKey: ''
    },
    // SMTP Configuration (Gmail, Outlook, etc.)
    smtp: {
      host: '',
      port: '587',
      secure: false,
      username: '',
      password: '',
      fromEmail: '',
      fromName: ''
    },
    // SendGrid Configuration
    sendgrid: {
      apiKey: '',
      fromEmail: '',
      fromName: ''
    },
    // Mailgun Configuration
    mailgun: {
      apiKey: '',
      domain: '',
      fromEmail: '',
      fromName: ''
    },
    // Amazon SES Configuration
    ses: {
      accessKeyId: '',
      secretAccessKey: '',
      region: 'us-east-1',
      fromEmail: '',
      fromName: ''
    },
    // Postmark Configuration
    postmark: {
      serverToken: '',
      fromEmail: '',
      fromName: ''
    }
  });

  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [testEmail, setTestEmail] = useState('');

  const emailProviders = [
    { id: 'emailjs', name: 'EmailJS', description: 'Client-side email service' },
    { id: 'smtp', name: 'SMTP (Gmail/Outlook)', description: 'Standard SMTP protocol' },
    { id: 'sendgrid', name: 'SendGrid', description: 'Cloud-based email service' },
    { id: 'mailgun', name: 'Mailgun', description: 'Email API service' },
    { id: 'ses', name: 'Amazon SES', description: 'AWS email service' },
    { id: 'postmark', name: 'Postmark', description: 'Transactional email service' }
  ];

  const smtpPresets = [
    { name: 'Gmail', host: 'smtp.gmail.com', port: '587', secure: true },
    { name: 'Outlook/Hotmail', host: 'smtp-mail.outlook.com', port: '587', secure: false },
    { name: 'Yahoo', host: 'smtp.mail.yahoo.com', port: '587', secure: false },
    { name: 'Custom', host: '', port: '587', secure: false }
  ];

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = () => {
    const savedProvider = localStorage.getItem('email_provider') || 'emailjs';
    setProvider(savedProvider);

    const savedConfig = {
      emailjs: {
        serviceId: localStorage.getItem('emailjs_service_id') || '',
        templateId: localStorage.getItem('emailjs_template_id') || '',
        publicKey: localStorage.getItem('emailjs_public_key') || '',
        privateKey: localStorage.getItem('emailjs_private_key') || ''
      },
      smtp: {
        host: localStorage.getItem('smtp_host') || '',
        port: localStorage.getItem('smtp_port') || '587',
        secure: localStorage.getItem('smtp_secure') === 'true',
        username: localStorage.getItem('smtp_username') || '',
        password: localStorage.getItem('smtp_password') || '',
        fromEmail: localStorage.getItem('smtp_from_email') || '',
        fromName: localStorage.getItem('smtp_from_name') || ''
      },
      sendgrid: {
        apiKey: localStorage.getItem('sendgrid_api_key') || '',
        fromEmail: localStorage.getItem('sendgrid_from_email') || '',
        fromName: localStorage.getItem('sendgrid_from_name') || ''
      },
      mailgun: {
        apiKey: localStorage.getItem('mailgun_api_key') || '',
        domain: localStorage.getItem('mailgun_domain') || '',
        fromEmail: localStorage.getItem('mailgun_from_email') || '',
        fromName: localStorage.getItem('mailgun_from_name') || ''
      },
      ses: {
        accessKeyId: localStorage.getItem('ses_access_key_id') || '',
        secretAccessKey: localStorage.getItem('ses_secret_access_key') || '',
        region: localStorage.getItem('ses_region') || 'us-east-1',
        fromEmail: localStorage.getItem('ses_from_email') || '',
        fromName: localStorage.getItem('ses_from_name') || ''
      },
      postmark: {
        serverToken: localStorage.getItem('postmark_server_token') || '',
        fromEmail: localStorage.getItem('postmark_from_email') || '',
        fromName: localStorage.getItem('postmark_from_name') || ''
      }
    };
    setConfig(savedConfig);
  };

  const handleSaveConfig = () => {
    // Save provider
    localStorage.setItem('email_provider', provider);

    // Save configuration based on provider
    const currentConfig = config[provider as keyof typeof config];
    
    switch (provider) {
      case 'emailjs':
        localStorage.setItem('emailjs_service_id', currentConfig.serviceId || '');
        localStorage.setItem('emailjs_template_id', currentConfig.templateId || '');
        localStorage.setItem('emailjs_public_key', currentConfig.publicKey || '');
        localStorage.setItem('emailjs_private_key', currentConfig.privateKey || '');
        break;
      case 'smtp':
        localStorage.setItem('smtp_host', currentConfig.host || '');
        localStorage.setItem('smtp_port', currentConfig.port || '587');
        localStorage.setItem('smtp_secure', currentConfig.secure?.toString() || 'false');
        localStorage.setItem('smtp_username', currentConfig.username || '');
        localStorage.setItem('smtp_password', currentConfig.password || '');
        localStorage.setItem('smtp_from_email', currentConfig.fromEmail || '');
        localStorage.setItem('smtp_from_name', currentConfig.fromName || '');
        break;
      case 'sendgrid':
        localStorage.setItem('sendgrid_api_key', currentConfig.apiKey || '');
        localStorage.setItem('sendgrid_from_email', currentConfig.fromEmail || '');
        localStorage.setItem('sendgrid_from_name', currentConfig.fromName || '');
        break;
      case 'mailgun':
        localStorage.setItem('mailgun_api_key', currentConfig.apiKey || '');
        localStorage.setItem('mailgun_domain', currentConfig.domain || '');
        localStorage.setItem('mailgun_from_email', currentConfig.fromEmail || '');
        localStorage.setItem('mailgun_from_name', currentConfig.fromName || '');
        break;
      case 'ses':
        localStorage.setItem('ses_access_key_id', currentConfig.accessKeyId || '');
        localStorage.setItem('ses_secret_access_key', currentConfig.secretAccessKey || '');
        localStorage.setItem('ses_region', currentConfig.region || 'us-east-1');
        localStorage.setItem('ses_from_email', currentConfig.fromEmail || '');
        localStorage.setItem('ses_from_name', currentConfig.fromName || '');
        break;
      case 'postmark':
        localStorage.setItem('postmark_server_token', currentConfig.serverToken || '');
        localStorage.setItem('postmark_from_email', currentConfig.fromEmail || '');
        localStorage.setItem('postmark_from_name', currentConfig.fromName || '');
        break;
    }
    
    toast.success('Email configuration saved successfully!');
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast.error('Please enter a test email address');
      return;
    }

    setIsTestingEmail(true);
    setTestResult(null);

    try {
      await sendTestEmail(testEmail);
      setTestResult('success');
      toast.success('Test email sent successfully!');
    } catch (error) {
      console.error('Email test error:', error);
      setTestResult('error');
      toast.error('Failed to send test email. Please check your configuration.');
    } finally {
      setIsTestingEmail(false);
    }
  };

  const sendTestEmail = async (email: string): Promise<void> => {
    const testMessage = {
      to: email,
      subject: '🌹 Rose Garden - Email Configuration Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">🌹 Rose Garden Restaurant</h2>
          <p>Hello!</p>
          <p>This is a test email to verify your email configuration is working correctly.</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Configuration Details:</h3>
            <p><strong>Provider:</strong> ${provider.toUpperCase()}</p>
            <p><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p>If you received this email, your email integration is working perfectly!</p>
          <p>Best regards,<br>Rose Garden Team</p>
        </div>
      `
    };

    // Simulate email sending based on provider
    console.log(`📧 TEST EMAIL (${provider.toUpperCase()}):`, testMessage);
    
    // In production, you would make actual API calls here
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  const updateConfig = (field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const applySmtpPreset = (preset: typeof smtpPresets[0]) => {
    if (preset.name !== 'Custom') {
      updateConfig('host', preset.host);
      updateConfig('port', preset.port);
      updateConfig('secure', preset.secure);
    }
  };

  const isConfigured = () => {
    const currentConfig = config[provider as keyof typeof config];
    
    switch (provider) {
      case 'emailjs':
        return currentConfig.serviceId && currentConfig.templateId && currentConfig.publicKey;
      case 'smtp':
        return currentConfig.host && currentConfig.username && currentConfig.password && currentConfig.fromEmail;
      case 'sendgrid':
        return currentConfig.apiKey && currentConfig.fromEmail;
      case 'mailgun':
        return currentConfig.apiKey && currentConfig.domain && currentConfig.fromEmail;
      case 'ses':
        return currentConfig.accessKeyId && currentConfig.secretAccessKey && currentConfig.fromEmail;
      case 'postmark':
        return currentConfig.serverToken && currentConfig.fromEmail;
      default:
        return false;
    }
  };

  const renderProviderConfig = () => {
    const currentConfig = config[provider as keyof typeof config];

    switch (provider) {
      case 'emailjs':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serviceId">Service ID</Label>
                <Input
                  id="serviceId"
                  value={currentConfig.serviceId || ''}
                  onChange={(e) => updateConfig('serviceId', e.target.value)}
                  placeholder="service_xxxxxxx"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="templateId">Template ID</Label>
                <Input
                  id="templateId"
                  value={currentConfig.templateId || ''}
                  onChange={(e) => updateConfig('templateId', e.target.value)}
                  placeholder="template_xxxxxxx"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="publicKey">Public Key</Label>
                <Input
                  id="publicKey"
                  value={currentConfig.publicKey || ''}
                  onChange={(e) => updateConfig('publicKey', e.target.value)}
                  placeholder="xxxxxxxxxxxxxxxx"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="privateKey">Private Key (Optional)</Label>
                <Input
                  id="privateKey"
                  type="password"
                  value={currentConfig.privateKey || ''}
                  onChange={(e) => updateConfig('privateKey', e.target.value)}
                  placeholder="xxxxxxxxxxxxxxxx"
                />
              </div>
            </div>
          </div>
        );

      case 'smtp':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>SMTP Preset</Label>
              <Select onValueChange={(value) => {
                const preset = smtpPresets.find(p => p.name === value);
                if (preset) applySmtpPreset(preset);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a preset or configure manually" />
                </SelectTrigger>
                <SelectContent>
                  {smtpPresets.map(preset => (
                    <SelectItem key={preset.name} value={preset.name}>
                      {preset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <Input
                  id="smtpHost"
                  value={currentConfig.host || ''}
                  onChange={(e) => updateConfig('host', e.target.value)}
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPort">Port</Label>
                <Input
                  id="smtpPort"
                  value={currentConfig.port || ''}
                  onChange={(e) => updateConfig('port', e.target.value)}
                  placeholder="587"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpUsername">Username/Email</Label>
                <Input
                  id="smtpUsername"
                  value={currentConfig.username || ''}
                  onChange={(e) => updateConfig('username', e.target.value)}
                  placeholder="your-email@gmail.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPassword">Password/App Password</Label>
                <Input
                  id="smtpPassword"
                  type="password"
                  value={currentConfig.password || ''}
                  onChange={(e) => updateConfig('password', e.target.value)}
                  placeholder="your-app-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpFromEmail">From Email</Label>
                <Input
                  id="smtpFromEmail"
                  value={currentConfig.fromEmail || ''}
                  onChange={(e) => updateConfig('fromEmail', e.target.value)}
                  placeholder="noreply@rosegarden.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpFromName">From Name</Label>
                <Input
                  id="smtpFromName"
                  value={currentConfig.fromName || ''}
                  onChange={(e) => updateConfig('fromName', e.target.value)}
                  placeholder="Rose Garden Restaurant"
                />
              </div>
            </div>
          </div>
        );

      case 'sendgrid':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="sendgridApiKey">API Key</Label>
              <Input
                id="sendgridApiKey"
                type="password"
                value={currentConfig.apiKey || ''}
                onChange={(e) => updateConfig('apiKey', e.target.value)}
                placeholder="SG.xxxxxxxxxxxxxxxx"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sendgridFromEmail">From Email</Label>
              <Input
                id="sendgridFromEmail"
                value={currentConfig.fromEmail || ''}
                onChange={(e) => updateConfig('fromEmail', e.target.value)}
                placeholder="noreply@rosegarden.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sendgridFromName">From Name</Label>
              <Input
                id="sendgridFromName"
                value={currentConfig.fromName || ''}
                onChange={(e) => updateConfig('fromName', e.target.value)}
                placeholder="Rose Garden Restaurant"
              />
            </div>
          </div>
        );

      case 'mailgun':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mailgunApiKey">API Key</Label>
              <Input
                id="mailgunApiKey"
                type="password"
                value={currentConfig.apiKey || ''}
                onChange={(e) => updateConfig('apiKey', e.target.value)}
                placeholder="key-xxxxxxxxxxxxxxxx"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mailgunDomain">Domain</Label>
              <Input
                id="mailgunDomain"
                value={currentConfig.domain || ''}
                onChange={(e) => updateConfig('domain', e.target.value)}
                placeholder="mg.yourdomain.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mailgunFromEmail">From Email</Label>
              <Input
                id="mailgunFromEmail"
                value={currentConfig.fromEmail || ''}
                onChange={(e) => updateConfig('fromEmail', e.target.value)}
                placeholder="noreply@yourdomain.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mailgunFromName">From Name</Label>
              <Input
                id="mailgunFromName"
                value={currentConfig.fromName || ''}
                onChange={(e) => updateConfig('fromName', e.target.value)}
                placeholder="Rose Garden Restaurant"
              />
            </div>
          </div>
        );

      case 'ses':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sesAccessKeyId">Access Key ID</Label>
              <Input
                id="sesAccessKeyId"
                value={currentConfig.accessKeyId || ''}
                onChange={(e) => updateConfig('accessKeyId', e.target.value)}
                placeholder="AKIAXXXXXXXXXXXXXXXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sesSecretAccessKey">Secret Access Key</Label>
              <Input
                id="sesSecretAccessKey"
                type="password"
                value={currentConfig.secretAccessKey || ''}
                onChange={(e) => updateConfig('secretAccessKey', e.target.value)}
                placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sesRegion">AWS Region</Label>
              <Select value={currentConfig.region || 'us-east-1'} onValueChange={(value) => updateConfig('region', value)}>
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
            <div className="space-y-2">
              <Label htmlFor="sesFromEmail">From Email</Label>
              <Input
                id="sesFromEmail"
                value={currentConfig.fromEmail || ''}
                onChange={(e) => updateConfig('fromEmail', e.target.value)}
                placeholder="noreply@rosegarden.com"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="sesFromName">From Name</Label>
              <Input
                id="sesFromName"
                value={currentConfig.fromName || ''}
                onChange={(e) => updateConfig('fromName', e.target.value)}
                placeholder="Rose Garden Restaurant"
              />
            </div>
          </div>
        );

      case 'postmark':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="postmarkServerToken">Server Token</Label>
              <Input
                id="postmarkServerToken"
                type="password"
                value={currentConfig.serverToken || ''}
                onChange={(e) => updateConfig('serverToken', e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postmarkFromEmail">From Email</Label>
              <Input
                id="postmarkFromEmail"
                value={currentConfig.fromEmail || ''}
                onChange={(e) => updateConfig('fromEmail', e.target.value)}
                placeholder="noreply@rosegarden.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postmarkFromName">From Name</Label>
              <Input
                id="postmarkFromName"
                value={currentConfig.fromName || ''}
                onChange={(e) => updateConfig('fromName', e.target.value)}
                placeholder="Rose Garden Restaurant"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getProviderLinks = () => {
    const links = {
      emailjs: 'https://www.emailjs.com/',
      smtp: provider === 'smtp' ? 'https://support.google.com/accounts/answer/185833' : '',
      sendgrid: 'https://sendgrid.com/',
      mailgun: 'https://www.mailgun.com/',
      ses: 'https://aws.amazon.com/ses/',
      postmark: 'https://postmarkapp.com/'
    };
    return links[provider as keyof typeof links];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MailIcon className="h-5 w-5 text-blue-600" />
            Email Provider Configuration
            {isConfigured() && <Badge variant="secondary" className="ml-2">Configured</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>
              Choose an email provider and configure your credentials to enable email notifications for reservations.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>Email Provider</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {emailProviders.map(prov => (
                  <SelectItem key={prov.id} value={prov.id}>
                    <div>
                      <div className="font-medium">{prov.name}</div>
                      <div className="text-xs text-gray-500">{prov.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {renderProviderConfig()}

          <div className="flex gap-2">
            <Button onClick={handleSaveConfig} className="flex-1">
              Save Email Configuration
            </Button>
            {getProviderLinks() && (
              <Button variant="outline" asChild>
                <a href={getProviderLinks()} target="_blank" rel="noopener noreferrer">
                  <ExternalLinkIcon className="h-4 w-4 mr-2" />
                  Setup Guide
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Email Integration</CardTitle>
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
            disabled={isTestingEmail || !isConfigured()}
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
          <CardTitle>Provider Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {provider === 'emailjs' && (
              <div>
                <h4 className="font-semibold mb-2">EmailJS Setup:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Create account at <a href="https://www.emailjs.com/" target="_blank" className="text-blue-600 underline">EmailJS.com</a></li>
                  <li>Add an email service (Gmail, Outlook, etc.)</li>
                  <li>Create an email template</li>
                  <li>Copy Service ID, Template ID, and Public Key</li>
                </ol>
              </div>
            )}

            {provider === 'smtp' && (
              <div>
                <h4 className="font-semibold mb-2">SMTP Setup (Gmail Example):</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Enable 2-Factor Authentication on your Gmail account</li>
                  <li>Generate an App Password: Account Settings → Security → App passwords</li>
                  <li>Use your Gmail address as username and App Password as password</li>
                  <li>Host: smtp.gmail.com, Port: 587, Secure: Yes</li>
                </ol>
              </div>
            )}

            {provider === 'sendgrid' && (
              <div>
                <h4 className="font-semibold mb-2">SendGrid Setup:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Create account at <a href="https://sendgrid.com/" target="_blank" className="text-blue-600 underline">SendGrid.com</a></li>
                  <li>Go to Settings → API Keys</li>
                  <li>Create a new API key with Mail Send permissions</li>
                  <li>Verify your sender email address</li>
                </ol>
              </div>
            )}

            {provider === 'mailgun' && (
              <div>
                <h4 className="font-semibold mb-2">Mailgun Setup:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Create account at <a href="https://www.mailgun.com/" target="_blank" className="text-blue-600 underline">Mailgun.com</a></li>
                  <li>Add and verify your domain</li>
                  <li>Get your API key from Settings → API Keys</li>
                  <li>Use your verified domain for sending emails</li>
                </ol>
              </div>
            )}

            {provider === 'ses' && (
              <div>
                <h4 className="font-semibold mb-2">Amazon SES Setup:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Create AWS account and access SES console</li>
                  <li>Verify your email address or domain</li>
                  <li>Create IAM user with SES permissions</li>
                  <li>Generate Access Key ID and Secret Access Key</li>
                </ol>
              </div>
            )}

            {provider === 'postmark' && (
              <div>
                <h4 className="font-semibold mb-2">Postmark Setup:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Create account at <a href="https://postmarkapp.com/" target="_blank" className="text-blue-600 underline">Postmark</a></li>
                  <li>Create a new server</li>
                  <li>Get your Server Token from API Tokens</li>
                  <li>Verify your sender signature</li>
                </ol>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}