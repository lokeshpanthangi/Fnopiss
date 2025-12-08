from typing import TypedDict, Optional


class State(TypedDict):
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