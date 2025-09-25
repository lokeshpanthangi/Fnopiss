from pydantic import BaseModel, Field
from typing import Optional
from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import InMemorySaver
from langchain_core.tools import tool
from dotenv import load_dotenv
import json

# -------------------------------
# Setup
# -------------------------------
load_dotenv()
checkpointer = InMemorySaver()

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)


# -------------------------------
# Risk Assessment Schema
# -------------------------------
class RiskAssessment(BaseModel):
    claim_id: str = Field(..., description="Unique claim identifier")
    risk_score: int = Field(..., description="Risk score from 1 to 10")
    category: str = Field(..., description="One of: Low, Medium, High")
    reasons: list[str] = Field(..., description="List of fraud/risk indicators identified")


# -------------------------------
# Risk Assessment Logic
# -------------------------------
@tool
def assess_risk(claim_data: str) -> str:
    """
    Analyze a claim object and return a risk assessment as formatted string.
    Input should be a string representation of claim data.
    """
    import json
    
    try:
        # Parse the claim data
        if isinstance(claim_data, str):
            # Try to extract JSON from the string
            if '{' in claim_data and '}' in claim_data:
                start = claim_data.find('{')
                end = claim_data.rfind('}') + 1
                json_str = claim_data[start:end]
                claim = json.loads(json_str)
            else:
                # If no JSON found, return error
                return "ERROR: Could not parse claim data. Expected JSON format."
        else:
            claim = claim_data
            
        # Convert dict to values for easy use
        claim_id = claim.get("claim_id", "unknown")
        amount = claim.get("amount", 0)
        previous_claims = claim.get("previous_claims_count", 0)
        tenure_days = claim.get("customer_tenure_days", 0)
        injuries = claim.get("injuries_reported", False)
        other_party = claim.get("other_party_involved", False)

        score = 1
        reasons = []

        # Rule 1: High claim amount
        if amount > 50000:
            score += 3
            reasons.append("High claim amount (> $50,000)")

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
            reasons.append("Injuries reported with no other party involved")

        # Rule 5: Zero or unrealistic claim amount
        if amount <= 0:
            score += 2
            reasons.append("Invalid or zero claim amount")

        # Cap score between 1–10
        score = max(1, min(score, 10))

        # Categorize
        if score <= 3:
            category = "Low"
        elif score <= 6:
            category = "Medium"
        else:
            category = "High"

        # Create the risk assessment
        risk_assessment = RiskAssessment(
            claim_id=claim_id,
            risk_score=score,
            category=category,
            reasons=reasons,
        )
        
        # Return as formatted string
        return f"RISK_ASSESSMENT: {risk_assessment.json()}"
        
    except json.JSONDecodeError as e:
        return f"ERROR: Invalid JSON format - {str(e)}"
    except Exception as e:
        return f"ERROR: Risk assessment failed - {str(e)}"


# -------------------------------
# Risk Assessment Agent
# -------------------------------
risk_agent = create_react_agent(
    model=llm,
    tools=[assess_risk],
    checkpointer=checkpointer,
    # Remove response_format as it conflicts with tool usage
)


def risk_agent_node(claim: dict):
    """
    Passes the intake agent's result (a dict or Claim object) 
    into the Risk Assessment Agent.
    """
    # Add system message to guide the agent
    messages = [
        ("system", """You are a risk assessment agent. Your job is to:
1. Use the assess_risk tool to analyze the provided claim data
2. The tool will return a RiskAssessment with risk_score, category, and reasons
3. Return the risk assessment results
4. Stop once you have completed the risk assessment"""),
        ("user", f"Please assess the risk for this claim: {str(claim)}")
    ]
    
    result = risk_agent.invoke(
        {"messages": messages},
        config={
            "recursion_limit": 10,  # Reasonable limit
            "configurable": {
                "thread_id": f"risk-assessment-{claim.get('claim_id','unknown')}"
            }
        },
    )
    
    # Extract the final result from agent messages
    final_message = result["messages"][-1].content
    
    # Try to extract valid risk assessment JSON from the final message
    if "RISK_ASSESSMENT:" in final_message:
        risk_json = final_message.split("RISK_ASSESSMENT: ")[1]
        try:
            return json.loads(risk_json)
        except json.JSONDecodeError:
            # If JSON parsing fails, return the raw content
            return {"content": risk_json, "source": "agent_response"}
        except:
            return {"content": risk_json, "source": "agent_response"}
    else:
        # Return error if no valid risk assessment found
        return {"error": "Failed to extract risk assessment", "details": final_message}
