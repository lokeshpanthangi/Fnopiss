from nodes.intake_node import extract_claim_info
from nodes.risk_analyze_node import risk_assessment_agent
from nodes.routing_node import routing_node
from orchestrator import app as graph_app
from fastapi import FastAPI, HTTPException
from state import State
from langchain_core.runnables import RunnableConfig
import uuid


app = FastAPI()


@app.post("/extract-claim/")
async def extract_claim(state : State) -> State:
    response = extract_claim_info(state)
    return response

@app.post("/assess-risk/")
async def assess_risk(state : State) -> State:
    response = risk_assessment_agent(state)
    return response


@app.post("/route-claim/")
async def route_claim(state : State) -> State:
    response = routing_node(state)
    return response


@app.post("/process-claim/")
async def process_claim(state : State):
    thread_id = str(uuid.uuid4())
    config = RunnableConfig(configurable={"thread_id": thread_id})

    try:
        state["claim_Extracted"] = False
        state["risk_assessment_report"] = None
        state["routing_decision_report"] = None
        final_state = await graph_app.ainvoke(state, config=config)
        
        return final_state
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))