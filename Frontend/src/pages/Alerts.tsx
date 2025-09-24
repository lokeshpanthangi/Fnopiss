import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, X, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  dismissed: boolean;
}

const mockAlerts: Alert[] = [
  {
    id: 'ALT-001',
    type: 'error',
    title: 'Agent Processing Error',
    message: 'Risk Assessment Agent failed to process claim CLM-2024-157',
    timestamp: '2024-01-15T14:45:00Z',
    dismissed: false
  },
  {
    id: 'ALT-002',
    type: 'warning',
    title: 'High Volume Alert',
    message: 'Claims volume 25% above normal threshold',
    timestamp: '2024-01-15T14:30:00Z',
    dismissed: false
  },
  {
    id: 'ALT-003',
    type: 'info',
    title: 'System Update Complete',
    message: 'Routing Agent updated to version 2.1.3',
    timestamp: '2024-01-15T14:15:00Z',
    dismissed: false
  },
  {
    id: 'ALT-004',
    type: 'warning',
    title: 'Processing Delay',
    message: 'Average processing time increased by 15% in last hour',
    timestamp: '2024-01-15T14:00:00Z',
    dismissed: false
  }
];

const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-5 w-5 text-status-high" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-status-medium" />;
      case 'info': return <Bell className="h-5 w-5 text-primary" />;
      default: return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getAlertBadgeColor = (type: string) => {
    switch (type) {
      case 'error': return 'bg-status-high text-white';
      case 'warning': return 'bg-status-medium text-black';
      case 'info': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, dismissed: true } : alert
    ));
  };

  const dismissAllAlerts = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, dismissed: true })));
  };

  const activeAlerts = alerts.filter(alert => !alert.dismissed);

  return (
    <div className="min-h-screen bg-background">
      <Header connectionStatus="connected" />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">System Alerts</h1>
                <p className="text-muted-foreground">Monitor system health and issues</p>
              </div>
              {activeAlerts.length > 0 && (
                <Button onClick={dismissAllAlerts} variant="outline">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Dismiss All
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeAlerts.length}</div>
                  <div className="text-xs text-muted-foreground">
                    {activeAlerts.filter(a => a.type === 'error').length} errors, {' '}
                    {activeAlerts.filter(a => a.type === 'warning').length} warnings
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Last 24 Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{alerts.length}</div>
                  <div className="text-xs text-muted-foreground">Total alerts generated</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">System Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-status-low"></div>
                    <span className="text-sm font-medium">Operational</span>
                  </div>
                  <div className="text-xs text-muted-foreground">All critical systems online</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Alert History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border transition-smooth ${
                        alert.dismissed ? 'opacity-50 bg-muted/50' : 'bg-card'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          {getAlertIcon(alert.type)}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium">{alert.title}</h3>
                              <Badge className={getAlertBadgeColor(alert.type)}>
                                {alert.type.toUpperCase()}
                              </Badge>
                              {alert.dismissed && (
                                <Badge variant="outline">DISMISSED</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {alert.message}
                            </p>
                            <div className="text-xs text-muted-foreground mt-2">
                              {new Date(alert.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        {!alert.dismissed && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => dismissAlert(alert.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Alerts;