import { Card } from "@/components/ui/card";
import { CheckCircle, Clock, AlertCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface ClaimData {
  claim_id: string;
  type: string;
  amount: number;
  status: "waiting" | "processing" | "complete" | "error";
  current_agent: "intake" | "risk_assessment" | "routing" | "complete";
  agents_completed: string[];
  processing_time: number;
}

interface ProcessingPipelineProps {
  claim: ClaimData | null;
}

const pipelineStages = [
  { id: "new_claim", label: "New Claim", icon: Clock },
  { id: "intake", label: "Intake Agent", icon: CheckCircle },
  { id: "risk_assessment", label: "Risk Agent", icon: AlertCircle },
  { id: "routing", label: "Routing Agent", icon: ArrowRight },
  { id: "complete", label: "Complete", icon: CheckCircle }
];

export function ProcessingPipeline({ claim }: ProcessingPipelineProps) {
  const navigate = useNavigate();

  const getStageStatus = (stageId: string) => {
    if (!claim) return "waiting";
    
    if (claim.agents_completed.includes(stageId) || 
        (stageId === "complete" && claim.current_agent === "complete")) {
      return "complete";
    }
    
    if (claim.current_agent === stageId || 
        (stageId === "new_claim" && claim.status === "processing")) {
      return "active";
    }
    
    return "waiting";
  };

  const getStageClasses = (status: string) => {
    switch (status) {
      case "complete":
        return "bg-status-low/20 border-status-low text-status-low";
      case "active":
        return "bg-status-action/20 border-status-action text-status-action animate-pulse";
      case "error":
        return "bg-status-high/20 border-status-high text-status-high";
      default:
        return "bg-surface-tertiary border-border text-text-tertiary";
    }
  };

  return (
    <Card className="p-6 bg-surface-secondary border-border">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-text-primary mb-2">Live Claim Processing Pipeline</h2>
        {claim ? (
          <div className="flex items-center space-x-4 text-sm text-text-secondary">
            <span>Processing: 
              <button 
                onClick={() => navigate(`/claim/${claim.claim_id}`)}
                className="text-status-action font-mono hover:underline ml-1"
              >
                {claim.claim_id}
              </button>
            </span>
            <span>Time: <span className="text-text-primary font-mono">{claim.processing_time.toFixed(1)}s</span></span>
            <span>Status: <span className="text-text-primary capitalize">{claim.status}</span></span>
          </div>
        ) : (
          <p className="text-text-secondary">No active claim processing</p>
        )}
      </div>

      <div className="relative">
        {/* Pipeline stages */}
        <div className="flex items-center justify-between space-x-4">
          {pipelineStages.map((stage, index) => {
            const status = getStageStatus(stage.id);
            const Icon = stage.icon;
            
            return (
              <div key={stage.id} className="flex-1 flex flex-col items-center">
                {/* Stage box */}
                <div className={cn(
                  "w-full max-w-32 p-4 rounded-lg border-2 transition-all duration-500",
                  "flex flex-col items-center space-y-2 min-h-[100px]",
                  getStageClasses(status)
                )}>
                  <Icon className="h-6 w-6" />
                  <span className="text-xs font-medium text-center leading-tight">
                    {stage.label}
                  </span>
                  
                  {/* Status indicator */}
                  <div className="flex flex-col items-center space-y-1">
                    {status === "complete" && (
                      <CheckCircle className="h-4 w-4 text-status-low" />
                    )}
                    {status === "active" && (
                      <div className="h-2 w-2 bg-status-action rounded-full animate-pulse" />
                    )}
                    {status === "waiting" && (
                      <Clock className="h-4 w-4 text-text-tertiary" />
                    )}
                    
                    <span className="text-xs capitalize">{status}</span>
                  </div>
                </div>

                {/* Connection arrow */}
                {index < pipelineStages.length - 1 && (
                  <div className="absolute top-12 flex items-center" style={{
                    left: `${((index + 1) / pipelineStages.length) * 100 - 10}%`,
                    width: `${(1 / pipelineStages.length) * 100 - 5}%`
                  }}>
                    <div className={cn(
                      "h-0.5 flex-1 transition-colors duration-300",
                      status === "complete" ? "bg-status-low" : "bg-border"
                    )} />
                    <ArrowRight className={cn(
                      "h-4 w-4 ml-1 transition-colors duration-300",
                      status === "complete" ? "text-status-low" : "text-text-tertiary"
                    )} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Claim moving indicator */}
        {claim && claim.status === "processing" && (
          <div className="absolute top-2 left-0 w-full h-8 pointer-events-none">
            <div 
              className="absolute h-4 w-4 bg-status-action rounded-full transition-all duration-700 ease-in-out flex items-center justify-center"
              style={{
                left: `${(claim.agents_completed.length / (pipelineStages.length - 1)) * 90}%`,
                transform: 'translateX(-50%)'
              }}
            >
              <div className="h-1.5 w-1.5 bg-white rounded-full" />
            </div>
          </div>
        )}
      </div>

      {/* Processing details */}
      {claim && (
        <div className="mt-6 pt-4 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-text-tertiary">Current Agent:</span>
              <span className="text-text-primary font-medium ml-2 capitalize">
                {claim.current_agent.replace('_', ' ')}
              </span>
            </div>
            <div>
              <span className="text-text-tertiary">Completed Steps:</span>
              <span className="text-text-primary font-medium ml-2">
                {claim.agents_completed.length}/{pipelineStages.length - 1}
              </span>
            </div>
            <div>
              <span className="text-text-tertiary">Progress:</span>
              <span className="text-text-primary font-medium ml-2">
                {Math.round((claim.agents_completed.length / (pipelineStages.length - 1)) * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}