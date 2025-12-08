from state import State, RoutingDecision
from typing import List

def routing_node(state: State) -> State:
    """
    Determines the appropriate processing path, priority, and adjuster tier 
    based on the claim type and its calculated risk category, following the 
    defined routing rules.
    """
    
    claim_id = state.get("claim_id", "unknown")
    claim_type = state.get("type", "general")
    risk_report = state.get("risk_assessment_report")

    risk_category = risk_report.get("category", "Low") if risk_report else "Low"
    risk_score = risk_report.get("risk_score", 1) if risk_report else 1

    # Default routing values
    processing_path = "Standard Processing"
    priority = "Medium"
    adjuster_tier = "Tier 2"
    rationale: List[str] = []

    # --- Routing Logic ---

    # Rule 1: High risk → SIU
    if risk_category == "High":
        processing_path = "Special Investigation Unit"
        priority = "High"
        adjuster_tier = "Tier 3 (Specialist)"
        rationale.append("High risk category requires SIU review")

    # Rule 2: Medium risk → regular adjuster
    elif risk_category == "Medium":
        processing_path = "Detailed Review"
        priority = "Medium"
        adjuster_tier = "Tier 2 (Experienced)"
        rationale.append("Medium risk category, assigned to experienced adjuster")

    # Rule 3: Low risk → fast-track or standard
    elif risk_category == "Low":
        if claim_type in ["auto_accident", "property_damage"]:
            processing_path = "Fast-Track Processing"
            priority = "Low"
            adjuster_tier = "Tier 1 (Junior)"
            rationale.append("Low risk and common claim type eligible for fast-track")
        else:
            processing_path = "Standard Processing"
            priority = "Medium" # Default priority for less common low-risk types
            adjuster_tier = "Tier 2 (Experienced)"
            rationale.append("Low risk but less common type, standard routing")
    

    routing_decision_report: RoutingDecision = {
        "claim_id": claim_id,
        "processing_path": processing_path,
        "priority": priority,
        "adjuster_tier": adjuster_tier,
        "rationale": "; ".join(rationale),
    }

    # Update State
    state["routing_decision_report"] = routing_decision_report
    
    return state