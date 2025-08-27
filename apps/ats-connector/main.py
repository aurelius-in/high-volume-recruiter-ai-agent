from fastapi import FastAPI
from pydantic import BaseModel
import os, uuid, time

MODE = os.getenv("MODE", "demo")

app = FastAPI(title="ATS Connector")

class Candidate(BaseModel):
    id: str
    name: str
    phone: str

class Application(BaseModel):
    candidate_id: str
    job_id: str
    slot: str

@app.post("/candidate")
def upsert_candidate(body: Candidate):
    return {"ok": True, "mode": MODE, "candidate_id": body.id}

@app.post("/application")
def create_application(body: Application):
    app_id = str(uuid.uuid4())
    return {"ok": True, "application_id": app_id, "ts": time.time()}


