import React from 'react';
import { TrendingUp, TrendingDown, Minus, FileText, Clock, Target, PieChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { SystemMetrics } from '@/types/dashboard';

interface SystemMetricsProps {
  metrics: SystemMetrics;
}

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="h-4 w-4 text-status-low" />;
    case 'down':
      return <TrendingDown className="h-4 w-4 text-status-high" />;
    default:
      return <Minus className="h-4 w-4 text-muted-foreground" />;
  }
};

const SystemMetrics: React.FC<SystemMetricsProps> = ({ metrics }) => {
  const totalRisk = metrics.risk_distribution.low + metrics.risk_distribution.medium + metrics.risk_distribution.high;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <PieChart className="h-5 w-5" />
          <span>System Metrics Dashboard</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Total Claims Processed */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    Total Claims
                  </div>
                  <div className="text-3xl font-bold count-up">
                    {metrics.total_claims.toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  {getTrendIcon(metrics.processing_trend)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Average Processing Time */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Avg Processing
                  </div>
                  <div className="text-3xl font-bold count-up">
                    {metrics.avg_processing_time}s
                  </div>
                </div>
                <div className="text-right">
                  {getTrendIcon(metrics.processing_trend)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Success Rate */}
          <Card>
            <CardContent className="p-4">
              <div>
                <div className="text-sm text-muted-foreground flex items-center mb-2">
                  <Target className="h-4 w-4 mr-1" />
                  Success Rate
                </div>
                <div className="text-3xl font-bold mb-2 count-up">
                  {metrics.success_rate}%
                </div>
                <div className="relative">
                  <Progress 
                    value={metrics.success_rate} 
                    className="h-2"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div 
                      className="h-2 bg-status-low rounded-full transition-all duration-1000"
                      style={{ width: `${metrics.success_rate}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Distribution */}
          <Card>
            <CardContent className="p-4">
              <div>
                <div className="text-sm text-muted-foreground mb-3">
                  Risk Distribution
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Low</span>
                    <span className="text-xs font-medium text-status-low">
                      {Math.round((metrics.risk_distribution.low / totalRisk) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(metrics.risk_distribution.low / totalRisk) * 100}
                    className="h-1.5"
                  />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Medium</span>
                    <span className="text-xs font-medium text-status-medium">
                      {Math.round((metrics.risk_distribution.medium / totalRisk) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(metrics.risk_distribution.medium / totalRisk) * 100}
                    className="h-1.5"
                  />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs">High</span>
                    <span className="text-xs font-medium text-status-high">
                      {Math.round((metrics.risk_distribution.high / totalRisk) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(metrics.risk_distribution.high / totalRisk) * 100}
                    className="h-1.5"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemMetrics;