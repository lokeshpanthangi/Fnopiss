from state import State, RiskAssessment
from typing import List, cast
from pydantic import BaseModel
from config import model, PromptTemplate


class Airisk(BaseModel):
    risk_score: int
    reasons : list[str]
    category: str

risk_model = model.with_structured_output(Airisk)

risk_prompt = """You are a Insurance Risk analysis Expert. your task is to analyze the users Claim Information and reason
through it and provide a risk score from 1 to 10, with 1 being the lowest risk and 10 being the highest risk.
and the Category of risk as Low, Medium or High. and also The reasosns for the given score based on the rules of Insurance.
here is the Clamin description : {claim_description} ,  
and response only in JSON format:
{{
    "risk_score": int,
    "category": str,
    "reasons": [str]
}}
"""

risk_template = PromptTemplate(
    input_variables=["claim_description"],
    template=risk_prompt,
)

chain = risk_template | risk_model

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

    ai_result = cast(Airisk, chain.invoke({"claim_description": state["claim_description"]}))

    # Override with AI result for consistency (access Pydantic model attributes)
    final_score = (final_score + ai_result.risk_score) // 2
    category = ai_result.category
    reasons = ai_result.reasons

    risk_assessment_report: RiskAssessment = {
        "claim_id": claim_id,
        "risk_score": final_score,
        "category": category,
        "reasons": reasons,
    }
    
    state["risk_assessment_report"] = risk_assessment_report
    
    return state