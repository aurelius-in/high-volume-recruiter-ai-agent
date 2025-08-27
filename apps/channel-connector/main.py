from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel
import os, time, uuid

MODE = os.getenv("MODE", "demo")

app = FastAPI(title="Channel Connector")

class Outbound(BaseModel):
    to: str
    body: str
    locale: str = "en"
    channel: str = "sms"

@app.post("/send")
def send_message(payload: Outbound):
    if MODE == "demo":
        return {"ok": True, "provider": "mock", "id": str(uuid.uuid4())}
    # placeholder for real provider (twilio-like)
    return {"ok": True, "provider": "twilio_like", "id": str(uuid.uuid4())}

@app.post("/inbound")
def inbound_webhook(data: dict = Body(...)):
    # forward to orchestrator later; for now echo
    return {"ok": True, "received": True, "ts": time.time()}


