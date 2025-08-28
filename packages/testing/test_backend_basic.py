import json
from fastapi.testclient import TestClient
import importlib

app_module = importlib.import_module("apps.orchestrator.main")
client = TestClient(app_module.app)

def test_health():
  r = client.get("/health")
  assert r.status_code == 200
  assert r.json()["ok"] is True

def test_flow_and_audit_verify():
  # create job
  r = client.post("/jobs", json={"title":"t","location":"l","shift":"s","reqs":[]})
  assert r.status_code == 200
  job_id = r.json()["job_id"]
  # outreach and flow
  assert client.post(f"/simulate/outreach", params={"job_id": job_id}).status_code == 200
  assert client.post(f"/simulate/flow", params={"job_id": job_id}).status_code == 200
  # verify chain
  vr = client.get("/audit/verify")
  assert vr.status_code == 200
  assert vr.json()["ok"] is True

def test_policy_send_message():
  r = client.post("/send", json={"to":"+100","body":"hi","locale":"en","channel":"sms"})
  assert r.status_code == 200
  ar = client.get("/audit")
  assert ar.status_code == 200
  events = ar.json()["events"]
  assert any(e["action"] == "message.sent" for e in events)

