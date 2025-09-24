export interface Claim {
  claim_id: string;
  type: 'auto_collision' | 'property_damage' | 'personal_injury' | 'theft' | 'fire' | 'flood';
  amount: number;
  status: 'new' | 'processing' | 'complete' | 'error';
  current_agent: 'intake' | 'risk_assessment' | 'routing' | 'complete';
  agents_completed: string[];
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  priority: 'normal' | 'urgent' | 'critical';
  processing_time: number;
  timestamp: string;
  customer_id?: string;
  policy_number?: string;
  description?: string;
  location?: string;
  adjuster_tier?: string;
  processing_notes?: string[];
}

export interface Agent {
  id: string;
  name: string;
  status: 'idle' | 'processing' | 'error';
  last_processed_claim?: string;
  success_rate: number;
  avg_processing_time: number;
  activity_history: number[];
}

export interface SystemMetrics {
  total_claims: number;
  avg_processing_time: number;
  success_rate: number;
  risk_distribution: {
    low: number;
    medium: number;
    high: number;
  };
  processing_trend: 'up' | 'down' | 'stable';
}

export interface ProcessingNote {
  timestamp: string;
  agent: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}