# Agentic AI Recruiter

**Short description:** Agentic AI recruiter for high-volume hiring: SMS/chat outreach, screening, scheduling, ATS sync, live KPIs, and audit-ready guardrails. Works offline or via an SMS gateway.

## Highlights

- End to end flow: outreach, consent, knockout screening, doc capture, scheduling, ATS writeback
- Live dashboard: reply rate, qualified rate, show rate, time to first touch, cost per qualified
- Governance you can point to: policy as code, append-only audit trail, replay
- Two modes: offline demo with mocks, provider mode using an SMS gateway like Twilio
- Wow factor: Hiring Simulator to model volume, SLAs, and interviewer capacity
- Bilingual friendly: easy to toggle Arabic in seeded candidates and UI badges

## Architecture

```
/apps
  /orchestrator   - FastAPI service that runs the agent flow and emits audit logs
  /ats-mock       - Greenhouse or Lever flavored mock with REST and webhook stubs
  /dashboard      - React + Vite dashboard (auth-capable UI)
  /dashboard-demo - React + Vite demo-only UI (no auth, mock-friendly)
/packages
  /policies       - YAML guardrails and evaluator settings
/infra
  docker-compose.yml
.env.example
```

Runtime: Python 3.11+, FastAPI, Uvicorn  
Frontend: React + Vite + Material UI  
Storage: In-memory and SQLite for demo. Postgres ready later.  
Channels: SMS first. Web chat fallback. Email optional.

## Quick start

### Option A - Docker
```bash
# copy env and keep defaults for offline
cp .env.example .env

# build and run
docker compose up --build
```

- Orchestrator at http://localhost:8000  
- ATS Mock at http://localhost:8001  
- Dashboard at http://localhost:5173

### Option B - Local dev
Terminal A
```bash
cd apps/orchestrator
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Terminal B
```bash
cd apps/ats-mock
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```
Terminal C
```bash
cd apps/dashboard
npm i
npm run dev
```

## Configure

Copy `.env.example` to `.env` and set values. Empty values keep you in offline mode.
```
MODE=demo            # demo or real
VITE_API_BASE=http://localhost:8000
ATS_BASE=http://localhost:8001
SIGNING_SECRET=dev-signing-secret

# Only needed in provider mode
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_SMS_NUMBER=
```

## Run the flow

1. Open the dashboard at http://localhost:5173
2. Click **Create Job**
3. Click **Simulate Outreach** to seed 25 candidates
4. Click **Run Flow** to perform consent, screening, scheduling, and ATS sync
5. Watch KPI tiles and the audit trail update in real time
6. Open **Hiring Simulator** and play with volume and capacity

## API snapshot

Orchestrator:
- `GET /health` - service and mode
- `POST /jobs` - create a job
- `POST /candidates` - create a candidate
- `POST /simulate/outreach?job_id=...` - seed outreach
- `POST /simulate/flow?job_id=...` - drive a few candidates to scheduled
- `GET /kpi` - KPI tiles
- `GET /audit` - recent audit events
- `POST /simulate/hiring` - what-if simulator
- `POST /twilio/inbound` - SMS webhook in provider mode

ATS mock:
- `POST /applications` - create application with slot
- `GET /events` - recent ATS events

## Governance in plain view

- `packages/policies/policy.yaml` holds rules for consent, channel limits, and redactions
- Every action is logged to an append-only audit list with an integrity hash
- The dashboard shows the log so you can replay or explain decisions

## Roadmap

- Real ATS connectors: Greenhouse, Lever, Workday
- Real-time websocket stream for events
- Interview slot packing and utilization
- Arabic auto-translate with a cost line item
- Postgres migrations and materialized KPI views

## License

MIT. Replace company names in artifacts before sharing outside your org.
