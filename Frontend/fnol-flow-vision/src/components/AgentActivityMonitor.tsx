import { Card } from "@/components/ui/card";
import { Activity, CheckCircle, AlertCircle, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentStatus {
  name: string;
  status: "idle" | "processing" | "error";
  last_claim_id: string;
  success_rate: number;
  avg_processing_time: number;
  activity_history: number[];
}

interface AgentActivityMonitorProps {
  agents: AgentStatus[];
}

export function AgentActivityMonitor({ agents }: AgentActivityMonitorProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing": return "text-status-medium";
      case "error": return "text-status-high";
      case "idle": return "text-status-low";
      default: return "text-text-tertiary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processing": return Clock;
      case "error": return AlertCircle;
      case "idle": return CheckCircle;
      default: return Activity;
    }
  };

  const renderMiniChart = (data: number[]) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    return (
      <div className="flex items-end space-x-0.5 h-8">
        {data.map((value, index) => {
          const height = ((value - min) / range) * 24 + 4;
          return (
            <div
              key={index}
              className="w-1 bg-status-action rounded-t-sm transition-all duration-300"
              style={{ height: `${height}px` }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <Card className="p-6 bg-surface-secondary border-border">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-text-primary mb-2">Agent Activity Monitor</h2>
        <p className="text-text-secondary">Real-time status and performance metrics</p>
      </div>

      <div className="space-y-4">
        {agents.map((agent, index) => {
          const StatusIcon = getStatusIcon(agent.status);
          
          return (
            <div
              key={agent.name}
              className="p-4 rounded-lg border border-border bg-surface-tertiary/50 hover:bg-surface-hover transition-colors duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={cn("relative", getStatusColor(agent.status))}>
                    <StatusIcon className="h-5 w-5" />
                    <div className={cn(
                      "absolute -top-1 -right-1 h-2 w-2 rounded-full",
                      agent.status === "processing" && "bg-status-medium animate-pulse-soft",
                      agent.status === "idle" && "bg-status-low",
                      agent.status === "error" && "bg-status-high"
                    )} />
                  </div>
                  <div>
                    <h3 className="font-medium text-text-primary">{agent.name}</h3>
                    <p className="text-sm text-text-secondary capitalize">
                      Status: {agent.status}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-text-tertiary">Last Claim</p>
                  <p className="font-mono text-text-primary">{agent.last_claim_id}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Success Rate */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-status-low" />
                    <span className="text-sm text-text-tertiary">Success Rate</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-surface-primary rounded-full h-2">
                      <div
                        className="bg-status-low h-2 rounded-full transition-all duration-300"
                        style={{ width: `${agent.success_rate}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-text-primary">
                      {agent.success_rate}%
                    </span>
                  </div>
                </div>

                {/* Processing Time */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-status-action" />
                    <span className="text-sm text-text-tertiary">Avg Time</span>
                  </div>
                  <p className="text-lg font-bold text-text-primary">
                    {agent.avg_processing_time}s
                  </p>
                </div>

                {/* Activity Chart */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-status-action" />
                    <span className="text-sm text-text-tertiary">Activity (Last 10)</span>
                  </div>
                  {renderMiniChart(agent.activity_history)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-status-low">
              {agents.filter(a => a.status === "idle").length}
            </p>
            <p className="text-sm text-text-tertiary">Agents Idle</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-status-medium">
              {agents.filter(a => a.status === "processing").length}
            </p>
            <p className="text-sm text-text-tertiary">Agents Processing</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-status-action">
              {(agents.reduce((acc, a) => acc + a.success_rate, 0) / agents.length).toFixed(1)}%
            </p>
            <p className="text-sm text-text-tertiary">Avg Success Rate</p>
          </div>
        </div>
      </div>
    </Card>
  );
}