from typing import TypedDict, Optional, List


class RiskAssessment(TypedDict):
    """Structured output for the risk analysis."""
    claim_id: str
    risk_score: int
    category: str
    reasons: List[str]



class State(TypedDict):
    """State object representing an insurance claim and its risk assessment."""
    claim_description: str
    claim_id: str
    type: str
    date: str
    amount: float 
    description: str
    customer_id: str
    policy_number: str
    incident_location: str
    police_report: Optional[str]
    injuries_reported: bool  
    other_party_involved: bool  
    timestamp_submitted: str
    customer_tenure_days: int  
    previous_claims_count: int  
    
    risk_assessment_report: Optional[RiskAssessment]