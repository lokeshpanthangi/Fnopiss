import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';
import ClaimPipeline from '@/components/dashboard/ClaimPipeline';
import ClaimDetails from '@/components/dashboard/ClaimDetails';
import AgentMonitor from '@/components/dashboard/AgentMonitor';
import SystemMetrics from '@/components/dashboard/SystemMetrics';
import ClaimHistory from '@/components/dashboard/ClaimHistory';
import SubmitClaimModal from '@/components/dashboard/SubmitClaimModal';
import { mockClaims, mockAgents, mockMetrics } from '@/data/mockData';
import type { Claim } from '@/types/dashboard';

const Index = () => {
  const [claims, setClaims] = useState(mockClaims);
  const [agents] = useState(mockAgents);
  const [metrics] = useState(mockMetrics);
  const [activeClaim, setActiveClaim] = useState<Claim | null>(claims[0] || null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('connected');

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeClaim && activeClaim.status === 'processing') {
        setActiveClaim(prev => {
          if (!prev) return null;
          const newProcessingTime = prev.processing_time + 0.1;
          return { ...prev, processing_time: newProcessingTime };
        });
      }
    }, 500);

    return () => clearInterval(interval);
  }, [activeClaim]);

  const handleSubmitClaim = (newClaim: Omit<Claim, 'claim_id' | 'timestamp' | 'agents_completed' | 'processing_time'>) => {
    const claimId = `CLM-2024-${String(claims.length + 1).padStart(3, '0')}`;
    const claim: Claim = {
      ...newClaim,
      claim_id: claimId,
      timestamp: new Date().toISOString(),
      agents_completed: [],
      processing_time: 0
    };
    
    setClaims(prev => [claim, ...prev]);
    setActiveClaim(claim);
    setIsSubmitModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header connectionStatus={connectionStatus} />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Section 1: Live Claim Processing Pipeline */}
            <ClaimPipeline activeClaim={activeClaim} />
            
            {/* Section 2: Current Claim Details Panel */}
            <ClaimDetails claim={activeClaim} />
            
            {/* Section 3: Agent Activity Monitor */}
            <AgentMonitor agents={agents} />
            
            {/* Section 4: System Metrics Dashboard */}
            <SystemMetrics metrics={metrics} />
            
            {/* Claims History Table */}
            <ClaimHistory 
              claims={claims} 
              onClaimSelect={setActiveClaim}
              activeClaim={activeClaim}
            />
          </div>
        </main>
      </div>

      {/* Floating Submit Button */}
      <Button
        onClick={() => setIsSubmitModalOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Submit Claim Modal */}
      <SubmitClaimModal
        open={isSubmitModalOpen}
        onOpenChange={setIsSubmitModalOpen}
        onSubmit={handleSubmitClaim}
      />
    </div>
  );
};

export default Index;