import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Activity, CheckCircle, Clock, AlertTriangle, FileText, Eye, Wifi, WifiOff } from "lucide-react";
import { SystemMetrics } from "./SystemMetrics";
import { ClaimSubmissionModal } from "./ClaimSubmissionModal";
import { DebugClaimStorage } from "./DebugClaimStorage";
import { useNavigate } from "react-router-dom";
import { apiService, type ClaimProcessingResult } from "@/services/api";
import { useClaim } from "@/contexts/ClaimContext";

interface ClaimHistoryItem {
  claim_id: string;
  type: string;
  amount: number;
  date: string;
  status: "approved" | "rejected" | "processing";
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  customer_id: string;
}

interface ProcessingLog {
  id: string;
  timestamp: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
}

export function Dashboard() {
  const navigate = useNavigate();
  const { setClaimResult } = useClaim();
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [currentProcessingResult, setCurrentProcessingResult] = useState<ClaimProcessingResult | null>(null);
  const [processingResult, setProcessingResult] = useState<ClaimProcessingResult | null>(null);
  const [processingLogs, setProcessingLogs] = useState<ProcessingLog[]>([
    { id: "1", timestamp: new Date().toISOString(), message: "System initialized", type: "info" },
  ]);
  
  const [systemMetrics, setSystemMetrics] = useState({
    total_processed: 1247,
    avg_processing_time: 4.2,
    success_rate: 94.7,
    risk_distribution: { low: 65, medium: 28, high: 7 }
  });

  const [claimsHistory, setClaimsHistory] = useState<ClaimHistoryItem[]>([
    {
      claim_id: "CLM-2024-001",
      type: "auto_collision",
      amount: 7500,
      date: "2024-01-15",
      status: "approved",
      risk_level: "MEDIUM",
      customer_id: "CUST-001"
    },
    {
      claim_id: "CLM-2024-002", 
      type: "property_damage",
      amount: 2300,
      date: "2024-01-14",
      status: "approved",
      risk_level: "LOW",
      customer_id: "CUST-002"
    },
    {
      claim_id: "CLM-2024-003",
      type: "liability",
      amount: 15000,
      date: "2024-01-13",
      status: "rejected",
      risk_level: "HIGH",
      customer_id: "CUST-003"
    },
    {
      claim_id: "CLM-2024-004",
      type: "comprehensive",
      amount: 4200,
      date: "2024-01-12",
      status: "processing",
      risk_level: "MEDIUM",
      customer_id: "CUST-004"
    }
  ]);

  // Check backend connectivity on component mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const isConnected = await apiService.checkHealth();
        setIsBackendConnected(isConnected);
        addLog(
          isConnected ? "Backend connection established" : "Backend connection failed", 
          isConnected ? "success" : "error"
        );
      } catch (error) {
        setIsBackendConnected(false);
        addLog("Failed to connect to backend", "error");
      }
    };
    checkBackend();
  }, []);

  const addLog = (message: string, type: "info" | "success" | "warning" | "error") => {
    const newLog: ProcessingLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      message,
      type
    };
    setProcessingLogs(prev => [newLog, ...prev].slice(0, 20)); // Keep last 20 logs
  };

  const handleSubmitClaim = async (claimData: any) => {
    setIsLoading(true);
    addLog(`Processing new claim submission for ${claimData.customer_id}`, "info");
    
    try {
      // Process claim through backend API
      addLog("Connecting to backend processing system...", "info");
      const result = await apiService.processClaimData(claimData);
      setProcessingResult(result);
      
      if (result && result.claim) {
        const newClaimId = result.claim.claim_id || `CLM-2024-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
        
        // Store the result in context and localStorage for persistence
        setClaimResult(newClaimId, result);
        apiService.saveClaimToStorage(newClaimId, result);
        
        // Extract risk level from backend result
        const riskCategory = result.risk_report?.category || "medium";
        const riskScore = result.risk_report?.risk_score || 0.5;
        const riskLevel = riskScore > 0.7 ? "HIGH" : riskScore > 0.4 ? "MEDIUM" : "LOW";
        const status = riskLevel === "HIGH" ? "rejected" : "approved";
        
        const newClaim: ClaimHistoryItem = {
          claim_id: newClaimId,
          type: claimData.type,
          amount: claimData.amount,
          date: new Date().toISOString().split('T')[0],
          status,
          risk_level: riskLevel,
          customer_id: claimData.customer_id
        };
        
        setClaimsHistory(prev => [newClaim, ...prev]);
        
        // Log processing results
        addLog(`Risk Assessment: ${riskLevel} (Score: ${(riskScore * 100).toFixed(1)}%)`, "info");
        addLog(`Risk Category: ${riskCategory}`, "info");
        if (result.routing_decision?.adjuster_tier) {
          addLog(`Assigned to: ${result.routing_decision.adjuster_tier} adjuster`, "info");
        }
        if (result.routing_decision?.processing_path) {
          addLog(`Processing Path: ${result.routing_decision.processing_path}`, "info");
        }
        
        addLog(`Claim ${newClaimId} ${status}`, status === "approved" ? "success" : "warning");
        
        // Update metrics
        setSystemMetrics(prev => ({
          ...prev,
          total_processed: prev.total_processed + 1
        }));
      } else {
        // Handle processing failure
        addLog(`Backend processing failed: Invalid response format`, "error");
        
        // Fallback to local processing
        const newClaimId = `CLM-2024-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
        const riskLevel = claimData.amount > 10000 ? "HIGH" : claimData.amount > 3000 ? "MEDIUM" : "LOW";
        const status = "processing"; // Mark as needing manual review
        
        const newClaim: ClaimHistoryItem = {
          claim_id: newClaimId,
          type: claimData.type,
          amount: claimData.amount,
          date: new Date().toISOString().split('T')[0],
          status,
          risk_level: riskLevel,
          customer_id: claimData.customer_id
        };
        
        setClaimsHistory(prev => [newClaim, ...prev]);
        addLog(`Claim ${newClaimId} requires manual review`, "warning");
      }
    } catch (error) {
      // Handle connection errors
      const errorMessage = error instanceof Error ? error.message : "Connection failed";
      addLog(`Backend connection error: ${errorMessage}`, "error");
      
      // Fallback to local processing
      const newClaimId = `CLM-2024-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      const riskLevel = claimData.amount > 10000 ? "HIGH" : claimData.amount > 3000 ? "MEDIUM" : "LOW";
      const status = "processing"; // Mark as needing manual review
      
      const newClaim: ClaimHistoryItem = {
        claim_id: newClaimId,
        type: claimData.type,
        amount: claimData.amount,
        date: new Date().toISOString().split('T')[0],
        status,
        risk_level: riskLevel,
        customer_id: claimData.customer_id
      };
      
      setClaimsHistory(prev => [newClaim, ...prev]);
      addLog(`Offline mode: Claim ${newClaimId} requires manual review`, "warning");
    }
    
    setIsLoading(false);
    setIsSubmissionModalOpen(false);
  };

  const getStatusIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle className="h-4 w-4 text-status-low" />;
      case "error": return <AlertTriangle className="h-4 w-4 text-status-high" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-status-medium" />;
      default: return <Clock className="h-4 w-4 text-text-tertiary" />;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "LOW": return "text-status-low";
      case "MEDIUM": return "text-status-medium"; 
      case "HIGH": return "text-status-high";
      default: return "text-text-secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-status-low/20 text-status-low";
      case "rejected": return "bg-status-high/20 text-status-high";
      case "processing": return "bg-status-medium/20 text-status-medium";
      default: return "bg-text-tertiary/20 text-text-tertiary";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface-secondary">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="h-8 w-8 text-status-action" />
              <h1 className="text-2xl font-bold text-text-primary">FNOL Multi-Agent System</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {isBackendConnected ? (
                  <>
                    <Wifi className="h-4 w-4 text-status-low" />
                    <div className="h-2 w-2 bg-status-low rounded-full animate-pulse-soft"></div>
                    <span className="text-sm text-status-low">Backend Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-status-high" />
                    <div className="h-2 w-2 bg-status-high rounded-full"></div>
                    <span className="text-sm text-status-high">Backend Offline</span>
                  </>
                )}
              </div>
              <Button
                onClick={() => setIsSubmissionModalOpen(true)}
                className="bg-status-action hover:bg-status-action/90 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Claim
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <div className="container mx-auto px-6 py-8">
        <DebugClaimStorage />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* Processing Status & Logs */}
          <Card className="p-6 bg-surface-secondary border-border">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Processing Status & Logs</h2>
            
            {isLoading && (
              <div className="mb-4 p-3 border border-status-medium/30 rounded-lg bg-status-medium/10">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-status-medium rounded-full animate-pulse"></div>
                  <span className="text-sm text-status-medium">Processing new claim submission...</span>
                </div>
              </div>
            )}
            
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {processingLogs.map((log) => (
                <div key={log.id} className="flex items-start space-x-3 p-2 rounded border border-border">
                  {getStatusIcon(log.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary">{log.message}</p>
                    <p className="text-xs text-text-tertiary">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* System Metrics */}
          <SystemMetrics metrics={systemMetrics} />

          {/* Claims History */}
          <div className="xl:col-span-2">
            <Card className="p-6 bg-surface-secondary border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-text-primary">Claims History</h2>
                <span className="text-sm text-text-tertiary">{claimsHistory.length} total claims</span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-text-tertiary font-medium">Claim ID</th>
                      <th className="text-left py-2 text-text-tertiary font-medium">Type</th>
                      <th className="text-left py-2 text-text-tertiary font-medium">Amount</th>
                      <th className="text-left py-2 text-text-tertiary font-medium">Date</th>
                      <th className="text-left py-2 text-text-tertiary font-medium">Status</th>
                      <th className="text-left py-2 text-text-tertiary font-medium">Risk</th>
                      <th className="text-left py-2 text-text-tertiary font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {claimsHistory.map((claim) => (
                      <tr key={claim.claim_id} className="border-b border-border hover:bg-surface-secondary/50">
                        <td className="py-3 text-text-primary font-mono">{claim.claim_id}</td>
                        <td className="py-3 text-text-primary capitalize">{claim.type.replace('_', ' ')}</td>
                        <td className="py-3 text-text-primary font-mono">${claim.amount.toLocaleString()}</td>
                        <td className="py-3 text-text-secondary">{new Date(claim.date).toLocaleDateString()}</td>
                        <td className="py-3">
                          <Badge className={getStatusColor(claim.status)}>
                            {claim.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <span className={getRiskColor(claim.risk_level)}>{claim.risk_level}</span>
                        </td>
                        <td className="py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/claim/${claim.claim_id}`)}
                            className="text-status-action hover:text-status-action/80"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      <Button
        onClick={() => setIsSubmissionModalOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-status-action hover:bg-status-action/90 shadow-glow xl:hidden"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Claim Submission Modal */}
      <ClaimSubmissionModal
        open={isSubmissionModalOpen}
        onClose={() => setIsSubmissionModalOpen(false)}
        onSubmit={handleSubmitClaim}
      />
    </div>
  );
}