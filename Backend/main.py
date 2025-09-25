from fastapi import FastAPI, HTTPException
from langchain_openai import ChatOpenAI
from Agents.orchestrator import orchestrator_agent, test
from langchain_core.prompts import PromptTemplate
from dotenv import load_dotenv
from langchain_core.output_parsers import StrOutputParser


load_dotenv()
parser = StrOutputParser()

model = ChatOpenAI(model="gpt-4", temperature=0.3)

# -------------------------------
# Import your orchestrator
# -------------------------------
# Assuming your orchestrator_agent function is already defined as before
# from orchestrator_module import orchestrator_agent

# -------------------------------
# FastAPI App
# -------------------------------
app = FastAPI(title="Claims Processing Orchestrator API",
              description="Orchestrates Intake, Risk, and Routing Agents",
              version="1.0.0")

app.include_router(test, prefix="/test", tags=["Test"])
# -------------------------------
# Request / Response Schemas
# -------------------------------

@app.post("/process-claim")
def process_claim(request: str):
    """
    Takes raw claim input text, runs it through the orchestrator,
    and returns final results.
    """
    try:
        result = orchestrator_agent(request)

        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])

        return {
            "claim": result.get("claim"),
            "risk_report": result.get("risk_report"),
            "routing_decision": result.get("routing_decision"),
            "logs": result.get("logs"),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@app.post("/actual_claim")
def actual_claim(input : str):
    result = process_claim(input)
    prompt = PromptTemplate(
        template = """You are a JSON extractor.  
You will be given a noisy JSON-like structure that contains errors and text blobs.  
Your task:  
1. Ignore any "error" fields and explanatory text.  
2. Extract only the actual structured data (claim, risk_report, routing_decision, logs).  
3. Return a valid JSON object that strictly follows this schema:

{{
  "claim": {{
    "claim_id": "string",
    "type": "string",
    "date": "YYYY-MM-DD",
    "amount": "number",
    "description": "string",
    "customer_id": "string",
    "policy_number": "string",
    "incident_location": "string",
    "police_report": "string | null",
    "injuries_reported": "boolean",
    "other_party_involved": "boolean",
    "timestamp_submitted": "ISO-8601 string",
    "customer_tenure_days": "number",
    "previous_claims_count": "number"
  }},
  "risk_report": {{
    "claim_id": "string",
    "risk_score": "number",
    "category": "string",
    "reasons": ["string"]
  }},
  "routing_decision": {{
    "claim_id": "string",
    "processing_path": "string",
    "priority": "string",
    "adjuster_tier": "string",
    "rationale": "string"
  }},
  "logs": [
    "string"
  ]
}}

Rules:  
- Do not include markdown formatting.  
- Do not add explanations or commentary.  
- Return only the JSON object.  
Here is the input: {input}""",
        input_variables=["input"]
    )

    chain = prompt | model | parser

    response = chain.invoke({"input": str(result)})
    return response
