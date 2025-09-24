import type { Claim, Agent, SystemMetrics } from '@/types/dashboard';

export const mockClaims: Claim[] = [
  {
    claim_id: 'CLM-2024-001',
    type: 'auto_collision',
    amount: 2500,
    status: 'processing',
    current_agent: 'risk_assessment',
    agents_completed: ['intake'],
    risk_score: 3,
    risk_level: 'LOW',
    priority: 'normal',
    processing_time: 2.5,
    timestamp: '2024-01-15T14:30:00Z',
    customer_id: 'CUST-12345',
    policy_number: 'POL-789012',
    description: 'Rear-end collision at traffic light',
    location: 'Downtown intersection',
    adjuster_tier: 'Standard',
    processing_notes: [
      'Initial intake completed',
      'Risk assessment in progress',
      'Low complexity claim detected'
    ]
  },
  {
    claim_id: 'CLM-2024-002',
    type: 'property_damage',
    amount: 15000,
    status: 'complete',
    current_agent: 'complete',
    agents_completed: ['intake', 'risk_assessment', 'routing'],
    risk_score: 7,
    risk_level: 'MEDIUM',
    priority: 'urgent',
    processing_time: 5.2,
    timestamp: '2024-01-15T13:00:00Z',
    customer_id: 'CUST-67890',
    policy_number: 'POL-345678',
    description: 'Storm damage to roof and windows',
    location: 'Residential property',
    adjuster_tier: 'Senior',
    processing_notes: [
      'Intake completed',
      'Risk assessment completed - medium risk',
      'Routed to senior adjuster',
      'Claim approved and processed'
    ]
  }
];

export const mockAgents: Agent[] = [
  {
    id: 'intake',
    name: 'Intake Agent',
    status: 'idle',
    last_processed_claim: 'CLM-2024-001',
    success_rate: 98.5,
    avg_processing_time: 1.2,
    activity_history: [8, 12, 15, 10, 14, 11, 9, 13, 16, 12]
  },
  {
    id: 'risk_assessment',
    name: 'Risk Assessment Agent',
    status: 'processing',
    last_processed_claim: 'CLM-2024-001',
    success_rate: 96.8,
    avg_processing_time: 2.1,
    activity_history: [6, 8, 10, 7, 9, 8, 6, 7, 9, 8]
  },
  {
    id: 'routing',
    name: 'Routing Agent',
    status: 'idle',
    last_processed_claim: 'CLM-2024-002',
    success_rate: 99.2,
    avg_processing_time: 0.8,
    activity_history: [4, 5, 6, 4, 5, 4, 3, 4, 6, 5]
  },
  {
    id: 'validation',
    name: 'Validation Agent',
    status: 'idle',
    success_rate: 97.1,
    avg_processing_time: 1.5,
    activity_history: [3, 4, 5, 3, 4, 3, 2, 3, 4, 3]
  }
];

export const mockMetrics: SystemMetrics = {
  total_claims: 1247,
  avg_processing_time: 4.2,
  success_rate: 98.1,
  risk_distribution: {
    low: 65,
    medium: 28,
    high: 7
  },
  processing_trend: 'up'
};