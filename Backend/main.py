from fastapi import FastAPI
from langgraph import graph

app = FastAPI()


@app.get("/")
async def read_root():
    return {"Hello": "World"}
