import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Clock, Shield, FileText } from "lucide-react";
import { useClaim } from "@/contexts/ClaimContext";
import { apiService, type ClaimProcessingResult } from "@/services/api";

export default function ClaimDetails() {
  const { claimId } = useParams();
  const navigate = useNavigate();
  const { getClaimResult } = useClaim();
  const [claimData, setClaimData] = useState<ClaimProcessingResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadClaimData = async () => {
      if (!claimId) {
        setError("No claim ID provided");
        setIsLoading(false);
        return;
      }

      try {
        console.log('=== CLAIM DETAILS DEBUG ===');
        console.log('Loading claim data for claimId:', claimId);
        console.log('claimId type:', typeof claimId);
        
        // First, try to get the data from context (this checks the Map directly)
        const contextData = getClaimResult(claimId);
        console.log('Context data check:', contextData ? 'Found' : 'Not found');
        
        if (contextData) {
          console.log('Found claim data in context:', claimId, contextData);
          setClaimData(contextData);
          setError(null);
          setIsLoading(false);
          return;
        }

        // If not in context, use the API service to get from localStorage 
        // (this ensures consistent access patterns)
        const storageData = apiService.getClaimFromStorage(claimId);
        console.log('Storage data check:', storageData ? 'Found' : 'Not found');
        
        if (storageData) {
          console.log('Found claim data in localStorage via API service:', claimId, storageData);
          setClaimData(storageData);
          setError(null);
          setIsLoading(false);
          return;
        }

        // If not found anywhere, try the API (for future expansion)
        console.log('Attempting API fetch for claim:', claimId);
        const apiData = await apiService.getClaimDetails(claimId);
        if (apiData) {
          console.log('Found claim data from API:', claimId);
          setClaimData(apiData);
          setError(null);
        } else {
          // No data found anywhere - show error
          console.log('No claim data found for:', claimId);
          setClaimData(null);
          setError("This claim has not been processed yet or the data is not available. Please submit and process the claim first.");
        }
      } catch (err) {
        console.error('Error loading claim data:', err);
        setError(err instanceof Error ? err.message : "Failed to load claim data");
      } finally {
        setIsLoading(false);
      }
    };

    loadClaimData();
  }, [claimId, getClaimResult]);

  // Only show real data - no fallback data
  if (!claimData && !isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-status-medium" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">No Claim Data Available</h2>
          <p className="text-text-secondary mb-6">
            {error || "This claim has not been processed yet. Please submit and process the claim through the dashboard first."}
          </p>
          <div className="space-y-2">
            <p className="text-sm text-text-tertiary">To view claim details:</p>
            <ul className="text-sm text-text-tertiary text-left space-y-1">
              <li>• Go back to the dashboard</li>
              <li>• Submit a new claim</li>
              <li>• Wait for processing to complete</li>
              <li>• Then view the claim details</li>
            </ul>
          </div>
          <Button 
            onClick={() => navigate("/")}
            className="mt-6 bg-status-action hover:bg-status-action/90 text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-status-action" />
          <p className="text-lg text-text-primary">Loading claim details...</p>
        </div>
      </div>
    );
  }



  const getRiskColor = (category: string) => {
    switch (category) {
      case "Low": return "text-status-low";
      case "Medium": return "text-status-medium"; 
      case "High": return "text-status-high";
      default: return "text-text-secondary";
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
      case "passed":
      case "approved":
        return <CheckCircle className="h-4 w-4 text-status-low" />;
      case "failed":
      case "rejected":
        return <XCircle className="h-4 w-4 text-status-high" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-status-medium" />;
      default:
        return <Clock className="h-4 w-4 text-text-tertiary" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface-secondary">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")}
              className="text-text-secondary hover:text-text-primary"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-status-action" />
              <h1 className="text-xl font-bold text-text-primary">Claim Details: {claimData?.claim?.claim_id}</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
        <div className="container mx-auto px-6 py-8">
        {/* Real Data Indicator */}
        <div className="mb-6 p-4 bg-status-low/10 border border-status-low/20 rounded-lg">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-status-low" />
            <div>
              <p className="text-sm font-medium text-status-low">Live Backend Data</p>
              <p className="text-xs text-text-tertiary">
                This claim was processed by your LangGraph agents and shows real results from intake, risk assessment, and routing agents.
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Claim Summary */}
          <Card className="p-6 bg-surface-secondary border-border">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Claim Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-tertiary">Claim ID:</span>
                <span className="text-text-primary font-mono">{claimData?.claim?.claim_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Type:</span>
                <span className="text-text-primary capitalize">{claimData?.claim?.type?.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Amount:</span>
                <span className="text-text-primary font-mono">{formatCurrency(claimData?.claim?.amount || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Date:</span>
                <span className="text-text-primary">{formatDate(claimData?.claim?.date || '')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Customer ID:</span>
                <span className="text-text-primary font-mono">{claimData?.claim?.customer_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Policy Number:</span>
                <span className="text-text-primary font-mono">{claimData?.claim?.policy_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Location:</span>
                <span className="text-text-primary">{claimData?.claim?.incident_location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Police Report:</span>
                <span className="text-text-primary">{claimData?.claim?.police_report || "Not filed"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Injuries:</span>
                <span className={claimData?.claim?.injuries_reported ? "text-status-high" : "text-status-low"}>
                  {claimData?.claim?.injuries_reported ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Customer Tenure:</span>
                <span className="text-text-primary">{Math.round((claimData?.claim?.customer_tenure_days || 0) / 365)} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Previous Claims:</span>
                <span className="text-text-primary">{claimData?.claim?.previous_claims_count || 0}</span>
              </div>
            </div>
          </Card>

          {/* Risk Assessment */}
          <Card className="p-6 bg-surface-secondary border-border">
            <h2 className="text-lg font-semibold text-text-primary mb-4"></h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-text-tertiary">Risk Score:</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 h-2 bg-border rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-status-low rounded-full transition-all duration-300"
                      style={{ width: `${((claimData?.risk_report?.risk_score || 0) / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-text-primary font-mono">{claimData?.risk_report?.risk_score || 0}/10</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Risk Category:</span>
                <Badge className={`${getRiskColor(claimData?.risk_report?.category || 'Low')} border`}>
                  {(claimData?.risk_report?.category || 'Low').toUpperCase()}
                </Badge>
              </div>
              <div>
                <span className="text-text-tertiary block mb-2">Risk Reasons:</span>
                <div className="space-y-1">
                  {(claimData?.risk_report?.reasons || []).map((reason, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="h-1.5 w-1.5 bg-status-action rounded-full mt-2 flex-shrink-0" />
                      <p className="text-sm text-text-secondary">{reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Routing Decision */}
          <Card className="p-6 bg-surface-secondary border-border">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Routing Decision</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-tertiary">Processing Path:</span>
                <span className="text-text-primary">{claimData?.routing_decision?.processing_path}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Priority:</span>
                <Badge variant="outline" className="text-status-medium border-status-medium">
                  {claimData?.routing_decision?.priority}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Adjuster Tier:</span>
                <span className="text-text-primary">{claimData?.routing_decision?.adjuster_tier}</span>
              </div>
              <div>
                <span className="text-text-tertiary block mb-2">Rationale:</span>
                <p className="text-sm text-text-secondary">{claimData?.routing_decision?.rationale}</p>
              </div>
            </div>
          </Card>

          {/* Processing Logs */}
          <Card className="p-6 bg-surface-secondary border-border">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Processing Logs</h2>
            <div className="space-y-3">
              {(claimData?.logs || []).map((log, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 border border-border rounded-lg">
                  <CheckCircle className="h-4 w-4 text-status-low mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-text-primary">{log}</p>
                    <p className="text-xs text-text-tertiary mt-1">
                      Step {index + 1} completed successfully
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Claim Description */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-surface-secondary border-border">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Claim Description</h2>
              <p className="text-text-secondary leading-relaxed">{claimData?.claim?.description}</p>
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="p-3 border border-border rounded-lg">
                  <h3 className="font-medium text-text-primary mb-2">Other Party Involved</h3>
                  <span className={claimData?.claim?.other_party_involved ? "text-status-medium" : "text-status-low"}>
                    {claimData?.claim?.other_party_involved ? "Yes" : "No"}
                  </span>
                </div>
                <div className="p-3 border border-border rounded-lg">
                  <h3 className="font-medium text-text-primary mb-2">Submitted</h3>
                  <span className="text-text-secondary">{formatDate(claimData?.claim?.timestamp_submitted || '')}</span>
                </div>
              </div>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
