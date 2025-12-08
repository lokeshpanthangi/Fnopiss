from nodes.intake_node import extract_claim_info
from fastapi import FastAPI



app = FastAPI()


@app.post("/extract-claim/")
async def extract_claim(claim_description: str):
    claim_info = extract_claim_info(claim_description)
    return claim_info