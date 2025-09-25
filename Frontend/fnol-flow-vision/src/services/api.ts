// API service for connecting to the backend
const API_BASE_URL = 'http://localhost:8000';

export interface ClaimProcessingResult {
  claim: {
    claim_id: string;
    type: string;
    date: string;
    amount: number;
    description: string;
    customer_id: string;
    policy_number: string;
    incident_location: string;
    police_report: string | null;
    injuries_reported: boolean;
    other_party_involved: boolean;
    timestamp_submitted: string;
    customer_tenure_days: number;
    previous_claims_count: number;
  };
  risk_report: {
    claim_id: string;
    risk_score: number;
    category: string;
    reasons: string[];
  };
  routing_decision: {
    claim_id: string;
    processing_path: string;
    priority: string;
    adjuster_tier: string;
    rationale: string;
  };
  logs: string[];
}

export class ApiService {
  private static instance: ApiService;

  private constructor() {}

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  /**
   * Convert claim form data to a natural language string for the backend
   */
  private formatClaimDataAsText(claimData: any): string {
    const date = claimData.date instanceof Date ? claimData.date.toISOString().split('T')[0] : claimData.date;
    
    return `
Customer ${claimData.customer_id} reported ${claimData.type.replace('_', ' ')} incident.
Policy number ${claimData.policy_number}. 
Estimated loss $${claimData.amount}.
Incident occurred on ${date} at ${claimData.location}.
${claimData.police_report ? `Police report number: ${claimData.police_report}.` : 'No police report filed.'}
${claimData.injuries ? 'Injuries were reported.' : 'No injuries reported.'}
Description: ${claimData.description}
Submitted on ${new Date().toISOString()}.
Claim ID should be generated automatically.
    `.trim();
  }

  /**
   * Submit claim data to the backend for processing
   */
  async processClaimData(claimData: any): Promise<ClaimProcessingResult> {
    try {
      console.log('Submitting claim data:', claimData);
      
      // Convert the claim data to natural language text
      const claimText = this.formatClaimDataAsText(claimData);
      console.log('Formatted claim text:', claimText);

      const response = await fetch(`${API_BASE_URL}/actual_claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(claimText)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error Response:', errorData);
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorData}`);
      }

      const responseText = await response.text();
      console.log('Raw API Response:', responseText);

      // Try to parse as JSON
      let result: ClaimProcessingResult;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        console.log('Response was:', responseText);
        throw new Error('Invalid JSON response from server');
      }

      console.log('Parsed result:', result);
      return result;

    } catch (error) {
      console.error('Error processing claim:', error);
      throw error;
    }
  }

  /**
   * Save claim data to localStorage
   */
  saveClaimToStorage(claimId: string, result: ClaimProcessingResult): void {
    try {
      const STORAGE_KEY = 'fnol_claim_results';
      const existing = localStorage.getItem(STORAGE_KEY);
      const claims = existing ? JSON.parse(existing) : {};
      claims[claimId] = result;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(claims));
      console.log('Saved claim to localStorage:', claimId);
    } catch (error) {
      console.error('Failed to save claim to localStorage:', error);
    }
  }

  /**
   * Get claim details by claim ID from localStorage
   */
  getClaimFromStorage(claimId: string): ClaimProcessingResult | null {
    try {
      const STORAGE_KEY = 'fnol_claim_results';
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const claims = JSON.parse(stored);
        return claims[claimId] || null;
      }
      return null;
    } catch (error) {
      console.error('Failed to get claim from localStorage:', error);
      return null;
    }
  }

  /**
   * Get claim details by claim ID
   */
  async getClaimDetails(claimId: string): Promise<ClaimProcessingResult | null> {
    try {
      console.log('Fetching claim details for:', claimId);
      
      // First check localStorage
      const localData = this.getClaimFromStorage(claimId);
      if (localData) {
        console.log('Found claim in localStorage:', claimId);
        return localData;
      }
      
      // For now, since we don't have a GET endpoint for specific claims,
      // we'll return null and the component can handle fallback
      // In a real implementation, this would call GET /claims/{claimId}
      console.warn('GET /claims/{claimId} endpoint not yet implemented');
      return null;

    } catch (error) {
      console.error('Error fetching claim details:', error);
      return null;
    }
  }

  /**
   * Check if the backend is available
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/`, {
        method: 'GET',
      });
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

export const apiService = ApiService.getInstance();
