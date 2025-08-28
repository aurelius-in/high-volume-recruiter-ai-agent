from fastapi import FastAPI, HTTPException, UploadFile, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os, time, json, uuid, hashlib, asyncio
import httpx
from math import floor
from sse_starlette.sse import EventSourceResponse
# add YAML import (optional)
try:
    import yaml  # type: ignore
except Exception:
    yaml = None

MODE = os.getenv("MODE", "demo")
ATS_BASE = os.getenv("ATS_BASE", "http://localhost:8001")
ATS_CONNECTOR_BASE = os.getenv("ATS_CONNECTOR_BASE")
CHANNEL_CONNECTOR_BASE = os.getenv("CHANNEL_CONNECTOR_BASE")

app = FastAPI(title="Recruiter Orchestrator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- simple in-memory stores for demo ----
AUDIT = []
LAST_HASH = None
JOBS = {}
CANDIDATES = {}
INTERACTIONS = []
SCHEDULE = {}
POLICY = {}

SIGNING_SECRET = os.getenv("SIGNING_SECRET", "dev-signing-secret")

# load policy.yaml if present
def _load_policy():
    global POLICY
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    policy_path = os.path.join(base_dir, "packages", "policies", "policy.yaml")
    try:
        if yaml and os.path.exists(policy_path):
            with open(policy_path, "r", encoding="utf-8") as f:
                POLICY = yaml.safe_load(f) or {}
        else:
            POLICY = {"allowed_channels": ["sms", "whatsapp", "web"], "max_questions": 5}
    except Exception:
        POLICY = {"allowed_channels": ["sms", "whatsapp", "web"], "max_questions": 5}

_load_policy()

def audit(actor, action, payload):
    ts = time.time()
    body = json.dumps(payload, sort_keys=True)
    base = (str(ts) + body + (LAST_HASH or "") + SIGNING_SECRET)
    h = hashlib.sha256(base.encode()).hexdigest()
    AUDIT.append({
        "id": str(uuid.uuid4()),
        "ts": ts,
        "actor": actor,
        "action": action,
        "payload": payload,
        "hash": h,
        "prev_hash": LAST_HASH
    })
    global LAST_HASH
    LAST_HASH = h

class CreateJob(BaseModel):
    title: str
    location: str
    shift: str
    reqs: list[str] = []

class Candidate(BaseModel):
    name: str
    phone: str
    locale: str = "en"
    consent: bool = False
    status: str = "new"

@app.get("/health")
def health():
    return {"ok": True, "mode": MODE}

@app.post("/jobs")
def create_job(body: CreateJob):
    job_id = str(uuid.uuid4())
    JOBS[job_id] = body.model_dump()
    audit("system", "job.created", {"job_id": job_id, **JOBS[job_id]})
    return {"job_id": job_id, **JOBS[job_id]}

@app.get("/jobs")
def list_jobs():
    return {"jobs": [{"id": jid, **data} for jid, data in JOBS.items()]}

@app.post("/candidates")
def create_candidate(body: Candidate):
    cid = str(uuid.uuid4())
    CANDIDATES[cid] = body.model_dump()
    audit("system", "candidate.created", {"candidate_id": cid, **CANDIDATES[cid]})
    return {"candidate_id": cid, **CANDIDATES[cid]}

@app.get("/candidates")
def list_candidates():
    return {"candidates": [{"id": cid, **data} for cid, data in CANDIDATES.items()]}

@app.post("/simulate/outreach")
def simulate_outreach(job_id: str):
    if job_id not in JOBS:
        raise HTTPException(404, "job not found")
    # seed 25 demo candidates
    for i in range(25):
        cid = str(uuid.uuid4())
        locale = "ar" if i % 5 == 0 else "en"
        CANDIDATES[cid] = {
            "name": f"Candidate {i+1}",
            "phone": f"+100000000{i:02d}",
            "locale": locale,
            "consent": False,
            "status": "contacted"
        }
        cost = 0.02 + (0.001 if locale == "ar" else 0.0)
        audit("agent", "outreach.sent", {"job_id": job_id, "candidate_id": cid, "locale": locale, "cost_usd": round(cost, 3)})
        if locale == "ar":
            audit("agent", "translation.applied", {"candidate_id": cid, "direction": "en->ar", "provider": "demo"})
    return {"ok": True, "count": 25}

# Spec-aligned alias
@app.post("/outreach/start")
def outreach_start(job_id: str):
    return simulate_outreach(job_id)

# Demo layer aliases
@app.post("/demo/seed")
def demo_seed(job_id: str):
    return simulate_outreach(job_id)

@app.post("/simulate/flow")
def simulate_flow(job_id: str, fast: bool = True):
    # move a few through the full funnel quickly
    moved = 0
    for cid, c in list(CANDIDATES.items())[:8]:
        # consent
        c["consent"] = True
        audit("agent", "consent.captured", {"candidate_id": cid})

        # knockout (pass 75%)
        qualified = (hash(cid) % 4 != 0)
        c["status"] = "qualified" if qualified else "disqualified"
        audit("agent", "qualification.done", {"candidate_id": cid, "qualified": qualified})

        if qualified:
            # schedule
            slot = f"2025-08-29T0{(hash(cid)%8)+1}:00:00Z"
            audit("agent", "schedule.slot.hold", {"candidate_id": cid, "slot": slot})
            # write to ATS mock
            try:
                with httpx.Client(timeout=5.0) as client:
                    resp = client.post(f"{ATS_BASE}/applications", json={
                        "candidate_id": cid, "job_id": job_id, "slot": slot
                    })
                    resp.raise_for_status()
                audit("agent", "ats.write", {"candidate_id": cid, "job_id": job_id, "slot": slot})
            except Exception as e:
                audit("agent", "ats.error", {"error": str(e)})
        moved += 1
        if not fast:
            time.sleep(0.15)
    return {"ok": True, "moved": moved}

@app.post("/demo/walkthrough")
def demo_walkthrough(job_id: str, fast: bool = True):
    return simulate_flow(job_id, fast=fast)

@app.post("/schedule/propose")
def schedule_propose(candidate_id: str):
    if candidate_id not in CANDIDATES:
        raise HTTPException(404, "candidate not found")
    slot = f"2025-08-29T0{(hash(candidate_id)%8)+1}:00:00Z"
    SCHEDULE[candidate_id] = {"slot": slot, "status": "hold"}
    audit("agent", "schedule.proposed", {"candidate_id": candidate_id, "slot": slot})
    return {"candidate_id": candidate_id, "slot": slot}

@app.post("/schedule/confirm")
def schedule_confirm(candidate_id: str):
    if candidate_id not in CANDIDATES:
        raise HTTPException(404, "candidate not found")
    slot = SCHEDULE.get(candidate_id, {}).get("slot") or f"2025-08-29T0{(hash(candidate_id)%8)+1}:00:00Z"
    SCHEDULE[candidate_id] = {"slot": slot, "status": "confirmed"}
    CANDIDATES[candidate_id]["status"] = "scheduled"
    audit("agent", "schedule.confirmed", {"candidate_id": candidate_id, "slot": slot})
    # write to ATS mock
    try:
        with httpx.Client(timeout=5.0) as client:
            if ATS_CONNECTOR_BASE:
                resp = client.post(f"{ATS_CONNECTOR_BASE}/application", json={
                    "candidate_id": candidate_id, "job_id": next(iter(JOBS.keys()), "demo-job"), "slot": slot
                })
            else:
                resp = client.post(f"{ATS_BASE}/applications", json={
                    "candidate_id": candidate_id, "job_id": next(iter(JOBS.keys()), "demo-job"), "slot": slot
                })
            resp.raise_for_status()
        audit("agent", "ats.write", {"candidate_id": candidate_id, "job_id": next(iter(JOBS.keys()), "demo-job"), "slot": slot})
    except Exception as e:
        audit("agent", "ats.error", {"error": str(e)})
    return {"ok": True}

@app.get("/audit")
def get_audit(limit: int = 250, cursor: int | None = None):
    if cursor is None:
        # latest page
        page = AUDIT[-limit:]
        next_cursor = len(AUDIT)
    else:
        start = max(0, cursor - limit)
        page = AUDIT[start:cursor]
        next_cursor = start
    return {"events": page, "next_cursor": next_cursor}

@app.get("/events/stream")
async def events_stream():
    async def event_generator():
        idx = 0
        while True:
            # yield any new events since last index
            while idx < len(AUDIT):
                e = AUDIT[idx]
                yield {"event": "audit", "data": json.dumps(e)}
                idx += 1
            await asyncio.sleep(0.5)
    return EventSourceResponse(event_generator())

@app.get("/audit/verify")
def verify_audit():
    prev = None
    for idx, e in enumerate(AUDIT):
        ts = e["ts"]
        body = json.dumps(e["payload"], sort_keys=True)
        expected = hashlib.sha256((str(ts) + body + (prev or "") + SIGNING_SECRET).encode()).hexdigest()
        if e.get("hash") != expected or e.get("prev_hash") != prev:
            return {"ok": False, "broken_at": idx}
        prev = e["hash"]
    return {"ok": True, "count": len(AUDIT)}

# helper
def _find_candidate_by_phone(phone: str):
    for cid, c in CANDIDATES.items():
        if c.get("phone") == phone:
            return cid, c
    return None, None

@app.post("/channels/inbound")
async def channels_inbound(From: str = Form(None), Body: str = Form(None), request: Request = None):
    # accept JSON fallback
    if From is None or Body is None:
        try:
            data = await request.json() if request is not None else None
        except Exception:
            data = None
        if data:
            From = data.get("From") or data.get("from")
            Body = data.get("Body") or data.get("body")
    if not From or not Body:
        raise HTTPException(400, "missing From/Body")
    cid, c = _find_candidate_by_phone(From)
    if cid:
        audit("candidate", "channel.inbound", {"candidate_id": cid, "from": From, "body": Body})
        if "yes" in Body.lower():
            c["consent"] = True
            audit("agent", "consent.captured", {"candidate_id": cid})
    else:
        audit("candidate", "channel.inbound.unknown", {"from": From, "body": Body})
    return {"ok": True}

@app.get("/kpi")
def kpi():
    contacted = sum(1 for c in CANDIDATES.values() if c["status"] in ["contacted","qualified","disqualified","scheduled"])
    consented = sum(1 for c in CANDIDATES.values() if c.get("consent"))
    qualified = sum(1 for c in CANDIDATES.values() if c["status"] == "qualified")
    scheduled = sum(1 for e in AUDIT if e["action"] == "ats.write")
    show_rate = 0.72  # demo constant
    cpp = max(1, scheduled) * 3.5  # demo calc
    return {
        "time_to_first_touch": "45s",
        "reply_rate": f"{(consented/max(1,contacted))*100:.0f}%",
        "qualified_rate": f"{(qualified/max(1,consented))*100:.0f}%",
        "show_rate": f"{show_rate*100:.0f}%",
        "cost_per_qualified": f"${cpp:.0f}"
    }

@app.get("/funnel")
def funnel():
    contacted = sum(1 for c in CANDIDATES.values() if c["status"] in ["contacted","qualified","disqualified","scheduled"])
    replied = sum(1 for c in CANDIDATES.values() if c.get("consent"))
    qualified = sum(1 for c in CANDIDATES.values() if c["status"] == "qualified")
    scheduled = sum(1 for e in AUDIT if e["action"] == "ats.write")
    showed = int(scheduled * 0.7)
    return {"contacted": contacted, "replied": replied, "qualified": qualified, "scheduled": scheduled, "showed": showed}

@app.get("/policy")
def get_policy():
    return {"policy": POLICY}

class SendMessage(BaseModel):
    to: str
    body: str
    locale: str = "en"
    channel: str = "sms"

@app.post("/send")
def send(body: SendMessage):
    checks = []
    ok = True
    if POLICY.get("allowed_channels") and body.channel not in POLICY.get("allowed_channels"):
        ok = False
        checks.append({"rule": "allowed_channels", "ok": False})
    else:
        checks.append({"rule": "allowed_channels", "ok": True})
    payload = {**body.model_dump(), "compliance": {"ok": ok, "checks": checks}}
    audit("agent", "message.sent", payload)
    # optional forward to channel connector in real mode
    if CHANNEL_CONNECTOR_BASE:
        try:
            with httpx.Client(timeout=5.0) as client:
                client.post(f"{CHANNEL_CONNECTOR_BASE}/send", json=body.model_dump())
        except Exception as e:
            audit("agent", "channel.forward.error", {"error": str(e)})
    return {"ok": True}

@app.post("/simulate/hiring")
def hiring_sim(vol_per_day: int = 500, reply_rate: float = 0.35, qual_rate: float = 0.25, show_rate: float = 0.7, interviewer_capacity: int = 50):
    replies = vol_per_day * reply_rate
    qualified = replies * qual_rate
    scheduled = min(qualified, interviewer_capacity)
    shows = scheduled * show_rate
    hires_week = floor(shows * 5 * 0.6)
    return {
        "replies": int(replies),
        "qualified": int(qualified),
        "scheduled": int(scheduled),
        "shows": int(shows),
        "hires_per_week": int(hires_week)
    }

class ForceOp(BaseModel):
    action: str
    candidate_id: str

@app.post("/ops/force")
def ops_force(body: ForceOp):
    action = body.action
    cid = body.candidate_id
    if action == "schedule_propose":
        return schedule_propose(cid)
    if action == "schedule_confirm":
        return schedule_confirm(cid)
    if action == "ats_resync":
        try:
            slot = SCHEDULE.get(cid, {}).get("slot") or f"2025-08-29T0{(hash(cid)%8)+1}:00:00Z"
            with httpx.Client(timeout=5.0) as client:
                if ATS_CONNECTOR_BASE:
                    resp = client.post(f"{ATS_CONNECTOR_BASE}/application", json={
                        "candidate_id": cid, "job_id": next(iter(JOBS.keys()), "demo-job"), "slot": slot
                    })
                else:
                    resp = client.post(f"{ATS_BASE}/applications", json={
                        "candidate_id": cid, "job_id": next(iter(JOBS.keys()), "demo-job"), "slot": slot
                    })
                resp.raise_for_status()
            audit("agent", "ats.write", {"candidate_id": cid, "job_id": next(iter(JOBS.keys()), "demo-job"), "slot": slot})
        except Exception as e:
            audit("agent", "ats.error", {"error": str(e)})
        return {"ok": True}
    audit("system", "ops.ignored", {"action": action, "candidate_id": cid})
    return {"ok": True}


