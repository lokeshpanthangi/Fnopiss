import React, { useState } from 'react';
import { Settings, Save, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';
import { useToast } from '@/hooks/use-toast';

const SettingsPage: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    // Agent Configuration
    maxProcessingTime: '300',
    agentTimeout: '60',
    autoRetry: true,
    maxRetries: '3',
    
    // Risk Assessment
    highRiskThreshold: '7',
    mediumRiskThreshold: '4',
    autoEscalation: true,
    
    // Notifications
    emailNotifications: true,
    slackNotifications: false,
    webhookUrl: '',
    
    // System
    logLevel: 'info',
    dataRetention: '90',
    maintenanceMode: false
  });

  const handleSave = () => {
    // In a real app, this would save to backend
    toast({
      title: "Settings saved",
      description: "Configuration has been updated successfully.",
    });
  };

  const handleReset = () => {
    setSettings({
      maxProcessingTime: '300',
      agentTimeout: '60',
      autoRetry: true,
      maxRetries: '3',
      highRiskThreshold: '7',
      mediumRiskThreshold: '4',
      autoEscalation: true,
      emailNotifications: true,
      slackNotifications: false,
      webhookUrl: '',
      logLevel: 'info',
      dataRetention: '90',
      maintenanceMode: false
    });
    toast({
      title: "Settings reset",
      description: "All settings have been reset to default values.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header connectionStatus="connected" />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">System Settings</h1>
                <p className="text-muted-foreground">Configure system behavior and preferences</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Agent Configuration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxProcessingTime">Max Processing Time (seconds)</Label>
                    <Input
                      id="maxProcessingTime"
                      type="number"
                      value={settings.maxProcessingTime}
                      onChange={(e) => setSettings(prev => ({ ...prev, maxProcessingTime: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="agentTimeout">Agent Timeout (seconds)</Label>
                    <Input
                      id="agentTimeout"
                      type="number"
                      value={settings.agentTimeout}
                      onChange={(e) => setSettings(prev => ({ ...prev, agentTimeout: e.target.value }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoRetry">Auto Retry Failed Claims</Label>
                    <Switch
                      id="autoRetry"
                      checked={settings.autoRetry}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoRetry: checked }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxRetries">Max Retry Attempts</Label>
                    <Select value={settings.maxRetries} onValueChange={(value) => setSettings(prev => ({ ...prev, maxRetries: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Assessment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="highRiskThreshold">High Risk Threshold (1-10)</Label>
                    <Input
                      id="highRiskThreshold"
                      type="number"
                      min="1"
                      max="10"
                      value={settings.highRiskThreshold}
                      onChange={(e) => setSettings(prev => ({ ...prev, highRiskThreshold: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mediumRiskThreshold">Medium Risk Threshold (1-10)</Label>
                    <Input
                      id="mediumRiskThreshold"
                      type="number"
                      min="1"
                      max="10"
                      value={settings.mediumRiskThreshold}
                      onChange={(e) => setSettings(prev => ({ ...prev, mediumRiskThreshold: e.target.value }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoEscalation">Auto Escalate High Risk Claims</Label>
                    <Switch
                      id="autoEscalation"
                      checked={settings.autoEscalation}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoEscalation: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <Switch
                      id="emailNotifications"
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="slackNotifications">Slack Notifications</Label>
                    <Switch
                      id="slackNotifications"
                      checked={settings.slackNotifications}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, slackNotifications: checked }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="webhookUrl">Webhook URL</Label>
                    <Input
                      id="webhookUrl"
                      placeholder="https://hooks.slack.com/..."
                      value={settings.webhookUrl}
                      onChange={(e) => setSettings(prev => ({ ...prev, webhookUrl: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="logLevel">Log Level</Label>
                    <Select value={settings.logLevel} onValueChange={(value) => setSettings(prev => ({ ...prev, logLevel: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="debug">Debug</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warn">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dataRetention">Data Retention (days)</Label>
                    <Input
                      id="dataRetention"
                      type="number"
                      value={settings.dataRetention}
                      onChange={(e) => setSettings(prev => ({ ...prev, dataRetention: e.target.value }))}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                      <p className="text-xs text-muted-foreground">Temporarily disable claim processing</p>
                    </div>
                    <Switch
                      id="maintenanceMode"
                      checked={settings.maintenanceMode}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;