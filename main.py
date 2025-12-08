from nodes.intake_node import extract_claim_info
from nodes.risk_analyze_node import risk_assessment_agent
from nodes.routing_node import routing_node
from fastapi import FastAPI
from state import State


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