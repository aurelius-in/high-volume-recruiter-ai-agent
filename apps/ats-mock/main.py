from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import time, uuid

app = FastAPI(title="ATS Mock")

APPLICATIONS = {}
EVENTS = []

class AppIn(BaseModel):
    candidate_id: str
    job_id: str
    slot: str

@app.post("/applications")
def create_app(body: AppIn):
    app_id = str(uuid.uuid4())
    APPLICATIONS[app_id] = body.model_dump()
    EVENTS.append({"id": str(uuid.uuid4()), "ts": time.time(), "type": "application.created", "payload": {"app_id": app_id, **APPLICATIONS[app_id]}})
    return {"app_id": app_id, **APPLICATIONS[app_id]}

@app.get("/events")
def get_events(limit: int = 100):
    return {"events": EVENTS[-limit:]}


