import React from 'react';
import { Users, Activity, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';
import { mockAgents } from '@/data/mockData';

const Agents: React.FC = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'bg-status-low text-white';
      case 'processing': return 'bg-status-medium text-black';
      case 'error': return 'bg-status-high text-white';
      default: return 'bg-muted text-muted-foreground';
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
              <h1 className="text-3xl font-bold">Agent Management</h1>
              <p className="text-muted-foreground">Monitor and manage AI agents performance</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {mockAgents.map((agent) => (
                <Card key={agent.id} className="relative">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="h-5 w-5" />
                        <span>{agent.name}</span>
                      </div>
                      <Badge className={getStatusColor(agent.status)}>
                        {agent.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Success Rate</span>
                        <span className="font-mono">{agent.success_rate}%</span>
                      </div>
                      <Progress value={agent.success_rate} className="h-2" />
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Avg: {agent.avg_processing_time}s</span>
                    </div>

                    {agent.last_processed_claim && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-mono">{agent.last_processed_claim}</span>
                      </div>
                    )}

                    <div className="pt-2 border-t">
                      <div className="text-xs text-muted-foreground mb-2">Activity (Last 10 claims)</div>
                      <div className="flex space-x-1">
                        {agent.activity_history.map((activity, index) => (
                          <div
                            key={index}
                            className={`w-3 h-6 rounded-sm ${
                              activity > 3 ? 'bg-status-low' : 
                              activity > 1 ? 'bg-status-medium' : 
                              'bg-status-high'
                            }`}
                            title={`${activity}s processing time`}
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Agent Performance Comparison</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAgents.map((agent) => (
                    <div key={agent.id} className="flex items-center space-x-4">
                      <div className="w-32 font-medium">{agent.name}</div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Performance Score</span>
                          <span>{Math.round((agent.success_rate + (100 - agent.avg_processing_time * 10)) / 2)}%</span>
                        </div>
                        <Progress value={Math.round((agent.success_rate + (100 - agent.avg_processing_time * 10)) / 2)} />
                      </div>
                      <Badge className={getStatusColor(agent.status)}>
                        {agent.status}
                      </Badge>
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

export default Agents;