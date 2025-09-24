import React from 'react';
import { CheckCircle, AlertCircle, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Claim } from '@/types/dashboard';

interface ClaimPipelineProps {
  activeClaim: Claim | null;
}

const pipelineStages = [
  { id: 'new', label: 'New Claim', agent: 'intake' },
  { id: 'intake', label: 'Intake Agent', agent: 'intake' },
  { id: 'risk_assessment', label: 'Risk Agent', agent: 'risk_assessment' },
  { id: 'routing', label: 'Routing Agent', agent: 'routing' },
  { id: 'complete', label: 'Complete', agent: 'complete' }
];

const ClaimPipeline: React.FC<ClaimPipelineProps> = ({ activeClaim }) => {
  const getStageStatus = (stageAgent: string) => {
    if (!activeClaim) return 'waiting';
    
    if (activeClaim.agents_completed.includes(stageAgent)) return 'complete';
    if (activeClaim.current_agent === stageAgent) return 'processing';
    if (activeClaim.status === 'error') return 'error';
    return 'waiting';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-status-low" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-status-info animate-spin" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-status-high" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />;
    }
  };

  const getStageClass = (status: string) => {
    const baseClass = 'relative p-6 border-2 rounded-lg transition-smooth min-h-[120px] flex flex-col justify-center items-center';
    
    switch (status) {
      case 'complete':
        return cn(baseClass, 'border-status-low bg-status-low/5');
      case 'processing':
        return cn(baseClass, 'border-status-info bg-status-info/5 pipeline-pulse');
      case 'error':
        return cn(baseClass, 'border-status-high bg-status-high/5');
      default:
        return cn(baseClass, 'border-muted bg-muted/5');
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Live Claim Processing Pipeline</h2>
          {activeClaim && (
            <Badge variant="outline" className="claim-move">
              Processing: {activeClaim.claim_id}
            </Badge>
          )}
        </div>
        
        <div className="grid grid-cols-5 gap-4">
          {pipelineStages.map((stage, index) => {
            const status = getStageStatus(stage.agent);
            
            return (
              <div key={stage.id} className="relative">
                <div className={getStageClass(status)}>
                  <div className="text-center">
                    <div className="mb-2">{getStatusIcon(status)}</div>
                    <div className="font-medium text-sm">{stage.label}</div>
                    
                    {activeClaim && (
                      <div className="mt-2 space-y-1">
                        <Badge 
                          variant="secondary" 
                          className="text-xs"
                        >
                          {status === 'processing' ? 'Processing' : 
                           status === 'complete' ? 'Complete' :
                           status === 'error' ? 'Error' : 'Waiting'}
                        </Badge>
                        
                        {status === 'processing' && (
                          <div className="text-xs text-muted-foreground">
                            {activeClaim.processing_time.toFixed(1)}s
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {index < pipelineStages.length - 1 && (
                  <ArrowRight className="absolute top-1/2 -right-2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground bg-background" />
                )}
              </div>
            );
          })}
        </div>
        
        {!activeClaim && (
          <div className="text-center py-8 text-muted-foreground">
            No active claims in pipeline. Submit a new claim to start processing.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClaimPipeline;