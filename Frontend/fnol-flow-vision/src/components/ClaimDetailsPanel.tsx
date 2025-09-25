import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, FileText, Calendar, User, Shield, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClaimData {
  claim_id: string;
  type: string;
  amount: number;
  status: "waiting" | "processing" | "complete" | "error";
  risk_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  priority: "normal" | "urgent" | "critical";
  processing_time: number;
  timestamp: string;
  customer_id: string;
  policy_number: string;
  adjuster_tier?: string;
  notes?: string[];
}

interface ClaimDetailsPanelProps {
  claim: ClaimData | null;
}

export function ClaimDetailsPanel({ claim }: ClaimDetailsPanelProps) {
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "HIGH": return "bg-status-high/20 text-status-high border-status-high";
      case "MEDIUM": return "bg-status-medium/20 text-status-medium border-status-medium";
      case "LOW": return "bg-status-low/20 text-status-low border-status-low";
      default: return "bg-surface-tertiary text-text-tertiary border-border";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-status-high/20 text-status-high border-status-high";
      case "urgent": return "bg-status-medium/20 text-status-medium border-status-medium";
      case "normal": return "bg-status-low/20 text-status-low border-status-low";
      default: return "bg-surface-tertiary text-text-tertiary border-border";
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getClaimTypeIcon = (type: string) => {
    switch (type) {
      case "auto_collision": return "🚗";
      case "property_damage": return "🏠";
      case "theft": return "🔒";
      case "water_damage": return "💧";
      case "fire_damage": return "🔥";
      default: return "📋";
    }
  };

  if (!claim) {
    return (
      <Card className="p-6 bg-surface-secondary border-border">
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-text-tertiary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">No Active Claim</h3>
          <p className="text-text-secondary">Submit a new claim to start processing</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-surface-secondary border-border">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Current Claim Details</h2>
        
        {/* Main claim info grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column - Basic info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getClaimTypeIcon(claim.type)}</span>
              <div>
                <h3 className="text-2xl font-bold text-text-primary font-mono">{claim.claim_id}</h3>
                <p className="text-text-secondary capitalize">{claim.type.replace('_', ' ')}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <DollarSign className="h-5 w-5 text-status-action" />
                <div>
                  <span className="text-text-tertiary text-sm">Claim Amount</span>
                  <p className="text-2xl font-bold text-text-primary">{formatAmount(claim.amount)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-status-action" />
                <div>
                  <span className="text-text-tertiary text-sm">Date Submitted</span>
                  <p className="text-text-primary font-medium">{formatDate(claim.timestamp)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-status-action" />
                <div>
                  <span className="text-text-tertiary text-sm">Customer ID</span>
                  <p className="text-text-primary font-mono">{claim.customer_id}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-status-action" />
                <div>
                  <span className="text-text-tertiary text-sm">Policy Number</span>
                  <p className="text-text-primary font-mono">{claim.policy_number}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Live updates */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-text-primary">Live Assessment</h4>

            {/* Risk Score Visualization */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-text-tertiary text-sm">Risk Score</span>
                <span className="text-text-primary font-bold">{claim.risk_score}/10</span>
              </div>
              <div className="flex space-x-1">
                {Array.from({ length: 10 }, (_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-3 flex-1 rounded-sm transition-colors duration-300",
                      i < claim.risk_score
                        ? claim.risk_score <= 3
                          ? "bg-status-low"
                          : claim.risk_score <= 6
                          ? "bg-status-medium"
                          : "bg-status-high"
                        : "bg-surface-tertiary"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Risk Level Badge */}
            <div className="space-y-2">
              <span className="text-text-tertiary text-sm">Risk Level</span>
              <Badge className={cn("text-lg font-bold py-2 px-4", getRiskLevelColor(claim.risk_level))}>
                {claim.risk_level}
              </Badge>
            </div>

            {/* Priority Badge */}
            <div className="space-y-2">
              <span className="text-text-tertiary text-sm">Priority</span>
              <Badge className={cn("text-sm font-medium py-1 px-3", getPriorityColor(claim.priority))}>
                {claim.priority.toUpperCase()}
              </Badge>
            </div>

            {/* Adjuster Tier */}
            {claim.adjuster_tier && (
              <div className="space-y-2">
                <span className="text-text-tertiary text-sm">Assigned Adjuster</span>
                <p className="text-text-primary font-medium">{claim.adjuster_tier}</p>
              </div>
            )}
          </div>
        </div>

        {/* Processing Notes */}
        {claim.notes && claim.notes.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border">
            <h4 className="text-lg font-medium text-text-primary mb-3">Processing Notes</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {claim.notes.map((note, index) => (
                <div key={index} className="flex items-start space-x-2 text-sm">
                  <div className="h-2 w-2 bg-status-action rounded-full mt-2 flex-shrink-0" />
                  <span className="text-text-secondary">{note}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}