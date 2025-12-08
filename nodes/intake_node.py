from pydantic import BaseModel, Field
from typing import Optional
from state import State
from config import model, PromptTemplate, json_parser

class Claim(BaseModel):
    claim_id: str = Field(..., description="Unique claim identifier")
    type: str = Field(..., description="Claim type, e.g. property_damage, auto_accident")
    date: str = Field(..., description="Date of incident in YYYY-MM-DD format")
    amount: float = Field(..., description="Claim amount in USD")
    description: str
    customer_id: str
    policy_number: str
    incident_location: str
    police_report: Optional[str] = None
    injuries_reported: bool
    other_party_involved: bool
    timestamp_submitted: str
    customer_tenure_days: int
    previous_claims_count: int


claim_model = model.with_structured_output(Claim)


claim_prompt = """You are an AI assistant that helps to extract structured insurance claim information from unstructured text.
Given the following claim description, extract the relevant fields and return them in a structured format this is the claim_description : {claim_description}.
Repond only in the Following JSON format:
{{
  "claim_id": str,
  "type": str,
  "date": str,
  "amount": float,
  "description": str,
  "customer_id": str,
  "policy_number": str,
  "incident_location": str,
  "police_report": Optional[str],
  "injuries_reported": bool,
  "other_party_involved": bool,
  "timestamp_submitted": str,
  "customer_tenure_days": int,
  "previous_claims_count": int
}}"""


prompt = PromptTemplate(template=claim_prompt,input_variables=["claim_description"])

chain = prompt | claim_model


def extract_claim_info(state : State):
    response = chain.invoke({"claim_description": state["claim_description"]})
    state.update(response)
    return state