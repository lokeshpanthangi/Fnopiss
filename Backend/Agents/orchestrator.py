from langgraph.graph import StateGraph, END
from typing import TypedDict, Any
from Agents.intake_graph import intake_agent_node
from Agents.risk_agent import risk_agent_node
from Agents.routing_agent import routing_agent_node
import logging
from fastapi import APIRouter
from dotenv import load_dotenv
load_dotenv()


test = APIRouter()
d = {}

# -------------------------------
# Logging Setup
# -------------------------------
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")


# -------------------------------
# Workflow State
# -------------------------------
class WorkflowState(TypedDict, total=False):
    user_input: str          # raw input text from user
    claim: dict              # structured claim (from Intake Agent)
    risk_report: dict        # risk assessment (from Risk Agent)
    routing_decision: dict   # routing decision (from Routing Agent)
    error: str               # error message if something fails
    logs: list[str]          # workflow logs


# -------------------------------
# Node Wrappers
# -------------------------------
def intake_node(state: WorkflowState) -> WorkflowState:
    logging.info("Running Intake Agent...")
    try:
        result = intake_agent_node(state["user_input"])
        state["claim"] = result
        state.setdefault("logs", []).append("Intake Agent completed successfully")
    except Exception as e:
        state["error"] = f"Intake failed: {str(e)}"
        state.setdefault("logs", []).append(state["error"])
    d["intake"] = state
    return state


def risk_node(state: WorkflowState) -> WorkflowState:
    logging.info("Running Risk Assessment Agent...")
    if "error" in state:
        return state
    try:
        result = risk_agent_node(state["claim"])
        state["risk_report"] = result
        state.setdefault("logs", []).append("Risk Agent completed successfully")
    except Exception as e:
        state["error"] = f"Risk assessment failed: {str(e)}"
        state.setdefault("logs", []).append(state["error"])
    d["risk"] = state
    return state


def routing_node(state: WorkflowState) -> WorkflowState:
    logging.info("Running Routing Agent...")
    if "error" in state:
        return state
    try:
        result = routing_agent_node(state["risk_report"])
        state["routing_decision"] = result
        state.setdefault("logs", []).append("Routing Agent completed successfully")
    except Exception as e:
        state["error"] = f"Routing failed: {str(e)}"
        state.setdefault("logs", []).append(state["error"])
    d["routing"] = state
    return state


# -------------------------------
# Orchestrator Graph
# -------------------------------
def build_orchestrator():
    workflow = StateGraph(WorkflowState)

    # Add nodes
    workflow.add_node("intake", intake_node)
    workflow.add_node("risk", risk_node)
    workflow.add_node("routing", routing_node)

    # Define flow (sequential)
    workflow.set_entry_point("intake")
    workflow.add_edge("intake", "risk")
    workflow.add_edge("risk", "routing")
    workflow.add_edge("routing", END)

    return workflow.compile()


# -------------------------------
# Orchestrator Agent
# -------------------------------
orchestrator = build_orchestrator()


def orchestrator_agent(user_input: str) -> WorkflowState:
    logging.info("=== Starting Orchestration ===")
    final_state = orchestrator.invoke({"user_input": user_input})
    logging.info("=== Orchestration Completed ===")
    return final_state  


@test.get("/status")
def status():
    return {"status": d}    