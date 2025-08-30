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

def test_analytics_endpoints():
  r = client.get("/analytics/top-recruiters")
  assert r.status_code == 200
  items = r.json().get("items", [])
  assert isinstance(items, list)
  assert len(items) >= 1

  r2 = client.get("/analytics/top-matches")
  assert r2.status_code == 200
  items2 = r2.json().get("items", [])
  assert isinstance(items2, list)
  assert len(items2) >= 1

def test_chat_stream_demo():
  # Without provider configured, should stream demo tokens
  payload = {
    "messages": [{"role":"user","content":"Hello"}],
    "include_context": False
  }
  with client.stream("POST", "/chat/stream", json=payload) as s:
    assert s.status_code == 200
    # read a bit from stream
    chunk = next(s.iter_text())
    assert "data:" in chunk

