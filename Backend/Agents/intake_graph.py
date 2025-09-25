from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field
from typing import Optional
from langchain_core.prompts import PromptTemplate
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import InMemorySaver
from langchain_core.output_parsers import StrOutputParser
from langchain_core.tools import tool
from dotenv import load_dotenv
import json

load_dotenv()
checkpointer = InMemorySaver()
parser = StrOutputParser()



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



llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)



@tool
def parse_claim_text(input_text: str) -> str:
    """
    Parse raw text input to extract claim information and return as JSON string.
    Use this tool first to extract structured data from unstructured claim text.
    """
    prompt = PromptTemplate(
        input_variables=["input"],
        template="""
        Extract the following claim details from the input text and format them as a JSON object:
        - claim_id
        - type  
        - date (YYYY-MM-DD)
        - amount (float)
        - description
        - customer_id
        - policy_number
        - incident_location
        - police_report (optional, can be null)
        - injuries_reported (boolean)
        - other_party_involved (boolean)
        - timestamp_submitted (ISO 8601 format)
        - customer_tenure_days (int)
        - previous_claims_count (int)

        Input: {input}

        Return only the JSON object, no additional text.
        """,
    )
    response = llm.invoke(prompt.format(input=input_text))
    return str(response.content)

@tool
def validate_claim_json(claim_json_str: str) -> str:
    """
    Validate a JSON claim string and return validation results.
    Use this tool after parsing to ensure the claim data is valid.
    If valid, return the claim JSON. If invalid, return error message.
    """
    try:
        claim_data = json.loads(claim_json_str)
        
        # Create Claim object to validate
        claim = Claim(**claim_data)
        
        # Additional validation logic
        errors = []
        if not claim.claim_id:
            errors.append("claim_id is required.")
        if claim.amount <= 0:
            errors.append("amount must be greater than 0.")
        if not claim.date:
            errors.append("date is required.")
        if not claim.customer_id:
            errors.append("customer_id is required.")
        if not claim.policy_number:
            errors.append("policy_number is required.")
        if not claim.incident_location:
            errors.append("incident_location is required.")
            
        if errors:
            return f"VALIDATION_ERRORS: {'; '.join(errors)}"
        
        return f"VALID_CLAIM: {claim_json_str}"
        
    except json.JSONDecodeError as e:
        return f"JSON_ERROR: Invalid JSON format - {str(e)}"
    except Exception as e:
        return f"VALIDATION_ERROR: {str(e)}"

tools = [parse_claim_text, validate_claim_json]

# -------------------------------
# 5. Agent Node
# -------------------------------
intake_agent = create_react_agent(
    model=llm,
    tools=tools,
    checkpointer=checkpointer,
    # Remove response_format as it conflicts with tool usage
)


def intake_agent_node(user_input: str):
    # Add system message to guide the agent
    messages = [
        ("system", """You are a claim intake agent. Your job is to:
1. First, use parse_claim_text tool to extract claim information from the user input
2. Then, use validate_claim_json tool to validate the extracted data
3. If validation passes, return the final valid claim JSON
4. If validation fails, try to fix the issues and validate again
5. Stop once you have a valid claim or after 3 attempts"""),
        ("user", user_input)
    ]
    
    result = intake_agent.invoke(
        {"messages": messages},
        config={
            "recursion_limit": 10,  # Reasonable limit
            "configurable": {
                "thread_id": f"intake-{hash(user_input)}"  # Unique per input
            }
        }
    )
    
    # Extract the final result from agent messages
    final_message = result["messages"][-1].content
    
    # Try to extract valid claim JSON from the final message
    if "VALID_CLAIM:" in final_message:
        claim_json = final_message.split("VALID_CLAIM: ")[1]
        return json.loads(claim_json)
    else:
        # Return error if no valid claim found
        return {"error": "Failed to extract valid claim", "details": final_message}

