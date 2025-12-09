import json
from state import State, RoutingDecision
from typing import List, cast
from pydantic import BaseModel
from config import model, PromptTemplate


class AIroute(BaseModel):
    processing_path: str
    priority: str
    adjuster_tier: str
    rationale: List[str]


routing_model = model.with_structured_output(AIroute)


route_prompt = """You are a Senior Insurance Claim Routing Orchestrator. Your objective is to analyze incoming claims and route them to the most appropriate processing channel based on risk, complexity, and financial exposure.

### INPUT DATA
**Claim Description:** "{claim_description}"
**Risk Assessment Report:** "{risk_report}"

### DECISION FRAMEWORK
Analyze the inputs using standard insurance adjustment protocols and financial risk guidelines. Apply the following logic:

1. **Processing Path:** Determine the workflow.
   - *Automated:* Low risk, low value, clear liability.
   - *Standard:* Moderate risk/value, standard handling required.
   - *Complex/Litigation:* High value, injury involved, or legal complexity.
   - *SIU (Special Investigation Unit):* High fraud risk or suspicious indicators.

2. **Priority:** Determine urgency.
   - *Low:* No immediate action needed, standard timeline.
   - *Medium:* Standard timeline, client waiting.
   - *High:* Significant damage, injury, or customer escalation.
   - *Critical:* Severe injury, total loss, media exposure, or regulatory deadline.

3. **Adjuster Tier:** Assign the appropriate skill level.
   - *Tier 1 (Junior):* Simple property damage, low value (<$5k), automated processing candidate.
   - *Tier 2 (Senior):* Moderate bodily injury, multi-vehicle, or values $5k-$25k.
   - *Tier 3 (Specialist):* Severe injury, fatality, complex liability, fraud suspicion, or values >$25k.

### OUTPUT FORMAT
Provide your response strictly in valid JSON format. Do not include markdown formatting or additional text.

{{
    "processing_path": "Automated" | "Standard" | "Complex/Litigation" | "SIU",
    "priority": "Low" | "Medium" | "High" | "Critical",
    "adjuster_tier": "Tier 1" | "Tier 2" | "Tier 3",
    "rationale": [
        "Primary reason for routing decision...",
        "Secondary factor observed in risk report..."
    ]
}}
"""

routing_template = PromptTemplate(
    input_variables=["claim_description", "risk_report"],
    template=route_prompt,
)

chain = routing_template | routing_model


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
    

    # AI-Driven Routing Decision
    ai_result = cast(AIroute, chain.invoke({
        "claim_description": state["claim_description"],
        "risk_report": json.dumps(risk_report)
    }))

    # Override with AI result for consistency
    processing_path = ai_result.processing_path
    priority = ai_result.priority
    adjuster_tier = ai_result.adjuster_tier
    rationale = ai_result.rationale

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