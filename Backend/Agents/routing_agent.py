from pydantic import BaseModel, Field
from typing import Literal
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
# Routing Schema
# -------------------------------
class RoutingDecision(BaseModel):
    claim_id: str = Field(..., description="Unique claim identifier")
    processing_path: str = Field(..., description="Workflow path assigned to this claim")
    priority: Literal["Low", "Medium", "High"] = Field(..., description="Claim priority level")
    adjuster_tier: Literal["Tier 1", "Tier 2", "Tier 3"] = Field(..., description="Assigned adjuster tier")
    rationale: str = Field(..., description="Explanation of routing decision")


# -------------------------------
# Routing Logic
# -------------------------------
@tool
def route_claim(risk_data: str) -> str:
    """
    Determine claim routing based on risk assessment data.
    Input should be a string containing risk assessment information.
    """    
    try:
        # Parse the risk data
        if isinstance(risk_data, str):
            # Try to extract JSON from the string
            if '{' in risk_data and '}' in risk_data:
                start = risk_data.find('{')
                end = risk_data.rfind('}') + 1
                json_str = risk_data[start:end]
                data = json.loads(json_str)
            else:
                # If no JSON found, try to extract key information from text
                return "ERROR: Could not parse risk assessment data. Expected JSON format."
        else:
            data = risk_data
            
        claim_id = data.get("claim_id", "unknown")
        claim_type = data.get("type", "general")
        risk_category = data.get("category", "Low")  # from RiskAssessment
        risk_score = data.get("risk_score", 1)

        # Default values
        processing_path = "Standard Processing"
        priority = "Medium"
        adjuster_tier = "Tier 2"
        rationale = []

        # Rule 1: High risk → fast track
        if risk_category == "High":
            processing_path = "Special Investigation Unit"
            priority = "High"
            adjuster_tier = "Tier 3"
            rationale.append("High risk category requires SIU review")

        # Rule 2: Medium risk → regular adjuster
        elif risk_category == "Medium":
            processing_path = "Detailed Review"
            priority = "Medium"
            adjuster_tier = "Tier 2"
            rationale.append("Medium risk category, assigned to experienced adjuster")

        # Rule 3: Low risk → fast-track for some types
        elif risk_category == "Low":
            if claim_type in ["auto_accident", "property_damage"]:
                processing_path = "Fast-Track Processing"
                priority = "Low"
                adjuster_tier = "Tier 1"
                rationale.append("Low risk and common claim type eligible for fast-track")
            else:
                processing_path = "Standard Processing"
                priority = "Medium"
                adjuster_tier = "Tier 2"
                rationale.append("Low risk but less common type, standard routing")

        # Create the routing decision
        routing_decision = RoutingDecision(
            claim_id=claim_id,
            processing_path=processing_path,
            priority=priority,
            adjuster_tier=adjuster_tier,
            rationale="; ".join(rationale),
        )
        
        # Return as formatted string
        return f"ROUTING_DECISION: {routing_decision.json()}"
        
    except json.JSONDecodeError as e:
        return f"ERROR: Invalid JSON format - {str(e)}"
    except Exception as e:
        return f"ERROR: Routing failed - {str(e)}"


# -------------------------------
# Routing Agent
# -------------------------------
routing_agent = create_react_agent(
    model=llm,
    tools=[route_claim],
    checkpointer=checkpointer,
    # Remove response_format as it conflicts with tool usage
)


def routing_agent_node(risk_result: dict):
    """
    Takes the output of the Risk Assessment Agent and determines routing.
    """
    # Add system message to guide the agent
    messages = [
        ("system", """You are a claim routing agent. Your job is to:
1. Use the route_claim tool to determine the best processing path for the claim
2. The tool will analyze the risk assessment data and return a RoutingDecision
3. Return the routing decision with processing path, priority, and adjuster tier
4. Stop once you have completed the routing decision"""),
        ("user", f"Please route this claim based on the risk assessment: {str(risk_result)}")
    ]
    
    result = routing_agent.invoke(
        {"messages": messages},
        config={
            "recursion_limit": 10,  # Reasonable limit
            "configurable": {
                "thread_id": f"routing-{risk_result.get('claim_id','unknown')}"
            }
        },
    )
    
    # Extract the final result from agent messages
    final_message = result["messages"][-1].content
    
    # Try to extract valid routing decision JSON from the final message
    if "ROUTING_DECISION:" in final_message:
        routing_json = final_message.split("ROUTING_DECISION: ")[1]
        try:
            return json.loads(routing_json)
        except json.JSONDecodeError:
            # If JSON parsing fails, return the raw content
            return {"content": routing_json, "source": "agent_response"}
        except:
            return {"content": routing_json, "source": "agent_response"}
    else:
        # Return error if no valid routing decision found
        return {"error": "Failed to extract routing decision", "details": final_message}
