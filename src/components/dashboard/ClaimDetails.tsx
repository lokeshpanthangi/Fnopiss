import React from 'react';
import { Car, Home, User, AlertTriangle, Clock, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { Claim } from '@/types/dashboard';

interface ClaimDetailsProps {
  claim: Claim | null;
}

const getClaimIcon = (type: string) => {
  switch (type) {
    case 'auto_collision':
      return <Car className="h-5 w-5" />;
    case 'property_damage':
      return <Home className="h-5 w-5" />;
    case 'personal_injury':
      return <User className="h-5 w-5" />;
    default:
      return <AlertTriangle className="h-5 w-5" />;
  }
};

const getRiskLevelClass = (level: string) => {
  switch (level) {
    case 'HIGH':
      return 'status-high';
    case 'MEDIUM':
      return 'status-medium';
    case 'LOW':
      return 'status-low';
    default:
      return 'bg-muted';
  }
};

const getPriorityClass = (priority: string) => {
  switch (priority) {
    case 'critical':
      return 'status-high';
    case 'urgent':
      return 'status-medium';
    default:
      return 'status-info';
  }
};

const ClaimDetails: React.FC<ClaimDetailsProps> = ({ claim }) => {
  if (!claim) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Active Claim</h3>
            <p>Select a claim from the history or submit a new one to view details.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Current Claim Details</span>
          <Badge variant="outline" className="animate-pulse">
            Live Updates
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Basic Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              {getClaimIcon(claim.type)}
              <div>
                <div className="text-2xl font-bold">{claim.claim_id}</div>
                <div className="text-sm text-muted-foreground capitalize">
                  {claim.type.replace('_', ' ')}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Amount</div>
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-xl font-semibold">
                    {claim.amount.toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">Processing Time</div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-xl font-semibold count-up">
                    {claim.processing_time.toFixed(1)}s
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">Customer ID: </span>
                <span className="font-medium">{claim.customer_id}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Policy Number: </span>
                <span className="font-medium">{claim.policy_number}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Date Submitted: </span>
                <span className="font-medium">
                  {new Date(claim.timestamp).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          
          {/* Right Column - Live Updates */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Risk Score</span>
                <span className="font-bold">{claim.risk_score}/10</span>
              </div>
              <Progress value={claim.risk_score * 10} className="h-2" />
            </div>
            
            <div className="flex space-x-2">
              <Badge className={cn('text-xs font-medium', getRiskLevelClass(claim.risk_level))}>
                {claim.risk_level} RISK
              </Badge>
              <Badge className={cn('text-xs font-medium', getPriorityClass(claim.priority))}>
                {claim.priority.toUpperCase()}
              </Badge>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground mb-1">Assigned Adjuster Tier</div>
              <div className="font-medium">{claim.adjuster_tier || 'Pending Assignment'}</div>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground mb-2">Processing Notes</div>
              <div className="bg-muted rounded-lg p-3 max-h-32 overflow-y-auto space-y-1">
                {claim.processing_notes?.map((note, index) => (
                  <div key={index} className="text-sm">
                    • {note}
                  </div>
                )) || (
                  <div className="text-sm text-muted-foreground italic">
                    No processing notes available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClaimDetails;