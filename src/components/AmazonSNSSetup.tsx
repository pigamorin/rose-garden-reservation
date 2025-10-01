import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { amazonSNS, SNSConfig } from '@/lib/amazonSNSService';

const AmazonSNSSetup: React.FC = () => {
  const [config, setConfig] = useState<SNSConfig>({
    accessKeyId: '',
    secretAccessKey: '',
    region: 'us-east-1',
    topicArn: '',
    smsEnabled: true
  });
  
  const [isConfigured, setIsConfigured] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('Test message from Rose Garden Restaurant');

  useEffect(() => {
    const status = amazonSNS.getStatus();
    setIsConfigured(status.configured);
    if (status.config) {
      setConfig(status.config);
    }
  }, []);

  const handleSaveConfig = () => {
    try {
      amazonSNS.configure(config);
      setIsConfigured(true);
      alert('✅ Amazon SNS configuration saved successfully!');
    } catch (error) {
      alert(`❌ Failed to save SNS configuration: ${error.message}`);
    }
  };

  const handleTestConnection = async () => {
    await amazonSNS.testConnection();
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      alert('Please enter a test email address');
      return;
    }

    await amazonSNS.sendEmail(
      testEmail,
      'Test Email - Rose Garden Restaurant',
      `This is a test email from Rose Garden Restaurant reservation system.\n\n${testMessage}\n\nIf you received this, Amazon SNS email is working correctly!`
    );
  };

  const handleTestSMS = async () => {
    if (!testPhone) {
      alert('Please enter a test phone number');
      return;
    }

    await amazonSNS.sendSMS(
      testPhone,
      `Test SMS from Rose Garden Restaurant: ${testMessage}`
    );
  };

  const handleSendTestReservation = async () => {
    if (!testEmail && !testPhone) {
      alert('Please enter either a test email or phone number');
      return;
    }

    const testReservation = {
      id: 'TEST-' + Date.now(),
      date: new Date().toLocaleDateString(),
      time: '7:00 PM',
      partySize: 2,
      status: 'confirmed' as const
    };

    await amazonSNS.sendReservationNotification(
      testEmail,
      testPhone,
      'Test Customer',
      testReservation,
      testEmail && testPhone ? 'both' : testEmail ? 'email' : 'sms'
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🚀 Amazon SNS Setup
            {isConfigured && <Badge variant="secondary">Configured</Badge>}
          </CardTitle>
          <CardDescription>
            Configure Amazon Simple Notification Service for reliable email and SMS notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="config" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="config">Configuration</TabsTrigger>
              <TabsTrigger value="test">Test Notifications</TabsTrigger>
              <TabsTrigger value="help">Setup Guide</TabsTrigger>
            </TabsList>

            <TabsContent value="config" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accessKeyId">AWS Access Key ID</Label>
                  <Input
                    id="accessKeyId"
                    type="password"
                    placeholder="AKIA..."
                    value={config.accessKeyId}
                    onChange={(e) => setConfig({...config, accessKeyId: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secretAccessKey">AWS Secret Access Key</Label>
                  <Input
                    id="secretAccessKey"
                    type="password"
                    placeholder="Secret key..."
                    value={config.secretAccessKey}
                    onChange={(e) => setConfig({...config, secretAccessKey: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="region">AWS Region</Label>
                  <select
                    id="region"
                    className="w-full p-2 border rounded-md"
                    value={config.region}
                    onChange={(e) => setConfig({...config, region: e.target.value})}
                  >
                    <option value="us-east-1">US East (N. Virginia)</option>
                    <option value="us-west-2">US West (Oregon)</option>
                    <option value="eu-west-1">Europe (Ireland)</option>
                    <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                    <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topicArn">SNS Topic ARN (for email)</Label>
                  <Input
                    id="topicArn"
                    placeholder="arn:aws:sns:region:account:topic-name"
                    value={config.topicArn}
                    onChange={(e) => setConfig({...config, topicArn: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="smsEnabled"
                  checked={config.smsEnabled}
                  onCheckedChange={(checked) => setConfig({...config, smsEnabled: checked})}
                />
                <Label htmlFor="smsEnabled">Enable SMS notifications</Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveConfig} className="flex-1">
                  Save Configuration
                </Button>
                <Button onClick={handleTestConnection} variant="outline">
                  Test Connection
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="test" className="space-y-4">
              <Alert>
                <AlertDescription>
                  Test your SNS configuration by sending sample notifications
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="testEmail">Test Email Address</Label>
                  <Input
                    id="testEmail"
                    type="email"
                    placeholder="test@example.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="testPhone">Test Phone Number</Label>
                  <Input
                    id="testPhone"
                    type="tel"
                    placeholder="+1234567890"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="testMessage">Test Message</Label>
                <Input
                  id="testMessage"
                  placeholder="Custom test message"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button onClick={handleTestEmail} disabled={!isConfigured || !testEmail}>
                  Test Email
                </Button>
                <Button onClick={handleTestSMS} disabled={!isConfigured || !testPhone}>
                  Test SMS
                </Button>
                <Button onClick={handleSendTestReservation} disabled={!isConfigured}>
                  Test Reservation
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="help" className="space-y-4">
              <Alert>
                <AlertDescription>
                  <strong>Step-by-step setup guide for Amazon SNS</strong>
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">1. Create AWS Account</h4>
                  <p className="text-sm text-muted-foreground">
                    Sign up at aws.amazon.com and navigate to the SNS console
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">2. Create SNS Topic</h4>
                  <p className="text-sm text-muted-foreground">
                    Create a topic for email notifications and note the ARN
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">3. Subscribe Email Addresses</h4>
                  <p className="text-sm text-muted-foreground">
                    Add email addresses to your topic and confirm subscriptions
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">4. Create IAM User</h4>
                  <p className="text-sm text-muted-foreground">
                    Create an IAM user with SNS permissions and get Access Key ID + Secret
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">5. Configure Above</h4>
                  <p className="text-sm text-muted-foreground">
                    Enter your AWS credentials and topic ARN in the Configuration tab
                  </p>
                </div>
              </div>

              <Alert>
                <AlertDescription>
                  <strong>Required IAM Permissions:</strong><br/>
                  - sns:Publish<br/>
                  - sns:ListTopics<br/>
                  - sns:GetTopicAttributes
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AmazonSNSSetup;