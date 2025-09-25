import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Clock, Target, PieChart, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SystemMetricsProps {
  metrics: {
    total_processed: number;
    avg_processing_time: number;
    success_rate: number;
    risk_distribution: { low: number; medium: number; high: number };
  };
}

export function SystemMetrics({ metrics }: SystemMetricsProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const renderDonutChart = (distribution: { low: number; medium: number; high: number }) => {
    const total = distribution.low + distribution.medium + distribution.high;
    const lowAngle = (distribution.low / total) * 360;
    const mediumAngle = (distribution.medium / total) * 360;
    const highAngle = (distribution.high / total) * 360;

    const radius = 40;
    const strokeWidth = 8;
    const center = 50;

    const getCoords = (angle: number, r: number) => {
      const rad = (angle - 90) * (Math.PI / 180);
      return {
        x: center + r * Math.cos(rad),
        y: center + r * Math.sin(rad)
      };
    };

    let currentAngle = 0;
    const lowStart = getCoords(currentAngle, radius);
    currentAngle += lowAngle;
    const lowEnd = getCoords(currentAngle, radius);
    
    const mediumStart = lowEnd;
    currentAngle += mediumAngle;
    const mediumEnd = getCoords(currentAngle, radius);
    
    const highStart = mediumEnd;
    currentAngle += highAngle;
    const highEnd = getCoords(currentAngle, radius);

    const createPath = (start: any, end: any, angle: number) => {
      const largeArcFlag = angle > 180 ? 1 : 0;
      return `M ${center} ${center} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
    };

    return (
      <div className="relative w-24 h-24">
        <svg width="100" height="100" className="transform -rotate-90">
          {/* Low risk segment */}
          <path
            d={createPath(lowStart, lowEnd, lowAngle)}
            fill="hsl(var(--status-low))"
            opacity="0.8"
          />
          {/* Medium risk segment */}
          <path
            d={createPath(mediumStart, mediumEnd, mediumAngle)}
            fill="hsl(var(--status-medium))"
            opacity="0.8"
          />
          {/* High risk segment */}
          <path
            d={createPath(highStart, highEnd, highAngle)}
            fill="hsl(var(--status-high))"
            opacity="0.8"
          />
          {/* Center hole */}
          <circle
            cx={center}
            cy={center}
            r={radius - strokeWidth}
            fill="hsl(var(--surface-secondary))"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-text-primary">{total}</span>
        </div>
      </div>
    );
  };

  const renderProgressRing = (percentage: number) => {
    const radius = 20;
    const strokeWidth = 4;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative w-12 h-12">
        <svg width="48" height="48" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="24"
            cy="24"
            r={radius}
            stroke="hsl(var(--surface-tertiary))"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="24"
            cy="24"
            r={radius}
            stroke="hsl(var(--status-low))"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-text-primary">{percentage}%</span>
        </div>
      </div>
    );
  };

  return (
    <Card className="p-6 bg-surface-secondary border-border">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-text-primary mb-2">System Metrics Dashboard</h2>
        <p className="text-text-secondary">Real-time performance and processing statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Claims Processed */}
        <div className="bg-surface-tertiary/50 rounded-lg p-4 border border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-status-action" />
              <span className="text-sm text-text-tertiary">Total Processed</span>
            </div>
            <TrendingUp className="h-4 w-4 text-status-low" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-text-primary animate-count-up">
              {formatNumber(metrics.total_processed)}
            </p>
            <p className="text-xs text-status-low">+12% this week</p>
          </div>
        </div>

        {/* Average Processing Time */}
        <div className="bg-surface-tertiary/50 rounded-lg p-4 border border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-status-action" />
              <span className="text-sm text-text-tertiary">Avg Processing</span>
            </div>
            <TrendingDown className="h-4 w-4 text-status-low" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-text-primary">
              {metrics.avg_processing_time}s
            </p>
            <p className="text-xs text-status-low">-8% faster</p>
          </div>
        </div>

        {/* Success Rate with Ring Chart */}
        <div className="bg-surface-tertiary/50 rounded-lg p-4 border border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-status-action" />
              <span className="text-sm text-text-tertiary">Success Rate</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {renderProgressRing(metrics.success_rate)}
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {metrics.success_rate}%
              </p>
              <p className="text-xs text-status-low">+2.1% improvement</p>
            </div>
          </div>
        </div>

        {/* Risk Distribution with Donut Chart */}
        <div className="bg-surface-tertiary/50 rounded-lg p-4 border border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-status-action" />
              <span className="text-sm text-text-tertiary">Risk Distribution</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {renderDonutChart(metrics.risk_distribution)}
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-status-low rounded-full" />
                <span className="text-text-secondary">Low {metrics.risk_distribution.low}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-status-medium rounded-full" />
                <span className="text-text-secondary">Med {metrics.risk_distribution.medium}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-status-high rounded-full" />
                <span className="text-text-secondary">High {metrics.risk_distribution.high}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics Row */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <p className="text-text-tertiary text-sm">Claims Today</p>
            <p className="text-2xl font-bold text-text-primary">47</p>
            <p className="text-xs text-status-low">+23% vs yesterday</p>
          </div>
          <div className="space-y-1">
            <p className="text-text-tertiary text-sm">Peak Hour</p>
            <p className="text-2xl font-bold text-text-primary">2PM</p>
            <p className="text-xs text-text-secondary">15 claims/hour</p>
          </div>
          <div className="space-y-1">
            <p className="text-text-tertiary text-sm">System Uptime</p>
            <p className="text-2xl font-bold text-text-primary">99.8%</p>
            <p className="text-xs text-status-low">Last 30 days</p>
          </div>
        </div>
      </div>
    </Card>
  );
}