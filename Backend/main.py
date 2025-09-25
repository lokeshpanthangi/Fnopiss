from fastapi import FastAPI, HTTPException, Body
from langchain_openai import ChatOpenAI
from Agents.orchestrator import orchestrator_agent, test
from langchain_core.prompts import PromptTemplate
from dotenv import load_dotenv
from langchain_core.output_parsers import StrOutputParser
#cors
import logging
from fastapi.middleware.cors import CORSMiddleware
from typing import TypedDict
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s",filename="sent.logs",filemode="a", encoding="utf-8")

# -------------------------------
# cors setup
# -------------------------------

app = FastAPI(title="Claims Processing Orchestrator API",
              description="Orchestrates Intake, Risk, and Routing Agents",
              version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to your needs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


app.include_router(test, prefix="/test", tags=["Test"])

# -------------------------------
# Root endpoint for health checks
# -------------------------------

@app.get("/")
def read_root():
    """
    Root endpoint that provides API information and health status.
    """
    return {
        "message": "Claims Processing Orchestrator API is running",
        "version": "1.0.0",
        "status": "healthy",
        "endpoints": {
            "health": "/",
            "process_claim": "/process-claim",
            "actual_claim": "/actual_claim",
            "test": "/test"
        }
    }

# -------------------------------
# Request / Response Schemas
# -------------------------------

class ClaimTextRequest(BaseModel):
    text: str

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
def actual_claim(claim_text: str = Body(...)):
    print(f"Received claim_text: {claim_text}, type: {type(claim_text)}")
    """
    Accept a raw string containing the claim text for processing.
    The frontend sends the claim text as a JSON-encoded string.
    """
    result = process_claim(claim_text)
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
    logging.info(f"Extracted JSON: {response}")
    return response
