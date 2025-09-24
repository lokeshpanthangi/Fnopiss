import React from 'react';
import { Activity, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Agent } from '@/types/dashboard';

interface AgentMonitorProps {
  agents: Agent[];
}

const getStatusDotClass = (status: string) => {
  switch (status) {
    case 'idle':
      return 'agent-idle';
    case 'processing':
      return 'agent-processing';
    case 'error':
      return 'agent-error';
    default:
      return 'bg-muted';
  }
};

const AgentMonitor: React.FC<AgentMonitorProps> = ({ agents }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>Agent Activity Monitor</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {agents.map((agent) => (
            <Card key={agent.id} className="relative">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div 
                      className={cn(
                        'w-3 h-3 rounded-full',
                        getStatusDotClass(agent.status)
                      )}
                    />
                    <span className="font-medium text-sm">{agent.name}</span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      'text-xs',
                      agent.status === 'processing' && 'animate-pulse'
                    )}
                  >
                    {agent.status}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-muted-foreground">Last Processed</div>
                    <div className="text-sm font-medium">
                      {agent.last_processed_claim || 'None'}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs text-muted-foreground">Success Rate</div>
                      <div className="text-sm font-bold text-status-low">
                        {agent.success_rate}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Avg Time
                      </div>
                      <div className="text-sm font-medium">
                        {agent.avg_processing_time}s
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-muted-foreground mb-1 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Activity (Last 10)
                    </div>
                    <div className="flex space-x-1">
                      {agent.activity_history.map((value, index) => (
                        <div
                          key={index}
                          className="flex-1 bg-muted rounded-sm"
                          style={{
                            height: `${Math.max(value * 2, 4)}px`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentMonitor;