import React from 'react';
import { BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';
import { mockMetrics as mockSystemMetrics } from '@/data/mockData';

const Analytics: React.FC = () => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-status-low" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-status-high" />;
      default: return <Minus className="h-4 w-4 text-status-medium" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-status-low';
      case 'down': return 'text-status-high';
      default: return 'text-status-medium';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header connectionStatus="connected" />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
              <p className="text-muted-foreground">System performance metrics and insights</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockSystemMetrics.total_claims.toLocaleString()}</div>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    {getTrendIcon(mockSystemMetrics.processing_trend)}
                    <span className={getTrendColor(mockSystemMetrics.processing_trend)}>
                      {mockSystemMetrics.processing_trend === 'up' ? '+12%' : 
                       mockSystemMetrics.processing_trend === 'down' ? '-5%' : '0%'} from last month
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockSystemMetrics.avg_processing_time}s</div>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <TrendingDown className="h-4 w-4 text-status-low" />
                    <span className="text-status-low">-8% faster</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockSystemMetrics.success_rate}%</div>
                  <Progress value={mockSystemMetrics.success_rate} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Processing Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(mockSystemMetrics.processing_trend)}
                    <Badge className={
                      mockSystemMetrics.processing_trend === 'up' ? 'bg-status-low text-white' :
                      mockSystemMetrics.processing_trend === 'down' ? 'bg-status-high text-white' :
                      'bg-status-medium text-black'
                    }>
                      {mockSystemMetrics.processing_trend.toUpperCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Risk Distribution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-status-high"></div>
                        <span className="text-sm">High Risk</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono">{mockSystemMetrics.risk_distribution.high}</span>
                        <span className="text-xs text-muted-foreground">
                          {Math.round((mockSystemMetrics.risk_distribution.high / mockSystemMetrics.total_claims) * 100)}%
                        </span>
                      </div>
                    </div>
                    <Progress 
                      value={(mockSystemMetrics.risk_distribution.high / mockSystemMetrics.total_claims) * 100} 
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-status-medium"></div>
                        <span className="text-sm">Medium Risk</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono">{mockSystemMetrics.risk_distribution.medium}</span>
                        <span className="text-xs text-muted-foreground">
                          {Math.round((mockSystemMetrics.risk_distribution.medium / mockSystemMetrics.total_claims) * 100)}%
                        </span>
                      </div>
                    </div>
                    <Progress 
                      value={(mockSystemMetrics.risk_distribution.medium / mockSystemMetrics.total_claims) * 100} 
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-status-low"></div>
                        <span className="text-sm">Low Risk</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono">{mockSystemMetrics.risk_distribution.low}</span>
                        <span className="text-xs text-muted-foreground">
                          {Math.round((mockSystemMetrics.risk_distribution.low / mockSystemMetrics.total_claims) * 100)}%
                        </span>
                      </div>
                    </div>
                    <Progress 
                      value={(mockSystemMetrics.risk_distribution.low / mockSystemMetrics.total_claims) * 100} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="font-medium text-sm">Peak Processing Hours</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Highest claim volume: 9:00 AM - 11:00 AM
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <div className="font-medium text-sm">Average Resolution Time</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      High Risk: 8.2 minutes | Medium: 4.1 minutes | Low: 2.3 minutes
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <div className="font-medium text-sm">Top Claim Types</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      1. Auto Collision (35%) | 2. Property Damage (28%) | 3. Personal Injury (22%)
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <div className="font-medium text-sm">Agent Efficiency</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Risk Assessment: 98.5% | Routing: 97.2% | Intake: 99.1%
                    </div>
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

export default Analytics;