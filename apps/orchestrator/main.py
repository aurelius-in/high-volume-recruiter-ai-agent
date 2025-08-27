from fastapi import FastAPI, HTTPException, UploadFile, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os, time, json, uuid, hashlib
import httpx
from math import floor

MODE = os.getenv("MODE", "demo")
ATS_BASE = os.getenv("ATS_BASE", "http://localhost:8001")

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

SIGNING_SECRET = os.getenv("SIGNING_SECRET", "dev-signing-secret")

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

@app.post("/candidates")
def create_candidate(body: Candidate):
    cid = str(uuid.uuid4())
    CANDIDATES[cid] = body.model_dump()
    audit("system", "candidate.created", {"candidate_id": cid, **CANDIDATES[cid]})
    return {"candidate_id": cid, **CANDIDATES[cid]}

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

@app.get("/audit")
def get_audit():
    return {"events": AUDIT[-250:]}

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


