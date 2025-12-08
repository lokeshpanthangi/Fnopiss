from state import State, RiskAssessment
from typing import List



def risk_assessment_agent(state: State) -> State:
    """
    Analyzes the claim state using the defined risk rules, calculates the score 
    and reasons, and updates the state object with a structured risk report.
    """
    
    score = 1 
    reasons: List[str] = []
    
    # --- Input Variables Mapping ---
    claim_id = state["claim_id"]
    amount = state["amount"]
    previous_claims = state["previous_claims_count"]
    tenure_days = state["customer_tenure_days"]
    injuries = state["injuries_reported"]
    other_party = state["other_party_involved"]


    # --- Apply Rules (Score Calculation) ---
    
    # Rule 1: High claim amount
    if amount > 50000:
        score += 3
        reasons.append("High claim amount (> $50,000 USD)")

    # Rule 2: Many previous claims
    if previous_claims >= 3:
        score += 2
        reasons.append("Multiple previous claims (>= 3)")

    # Rule 3: Very new customer
    if tenure_days < 30:
        score += 2
        reasons.append("New customer (< 30 days tenure)")

    # Rule 4: Injuries reported but no other party
    if injuries and not other_party:
        score += 1
        reasons.append("Injuries reported with no other party involved (Potential Solo Accident Fraud)")

    # Rule 5: Zero or unrealistic claim amount
    if amount <= 0:
        score += 2
        reasons.append("Invalid or zero claim amount")


    # 2. Cap Score and Categorize
    final_score = max(1, min(score, 10))

    if final_score <= 3:
        category = "Low"
    elif final_score <= 6:
        category = "Medium"
    else:
        category = "High"

    risk_assessment_report: RiskAssessment = {
        "claim_id": claim_id,
        "risk_score": final_score,
        "category": category,
        "reasons": reasons,
    }
    
    state["risk_assessment_report"] = risk_assessment_report
    
    return state