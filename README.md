 # Agentic AI Recruiter

Production-minded agentic AI recruiter for high-volume hiring. It contacts candidates (SMS/WhatsApp/web), captures consent, screens with knockout rules, schedules interviews, writes to the ATS, and updates a live dashboard with KPIs and a signed, append-only audit trail. Ships with a polished UI and a fully offline demo mode.

## Quick Start

### Docker (fastest)
```bash
cp .env.example .env
docker compose up --build
```
Services:
- Orchestrator http://localhost:8000
- ATS Mock http://localhost:8001
- Dashboard http://localhost:5173

### Local development
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

### Configuration
Copy `.env.example` to `.env` and set values. Empty values keep you in demo mode.
```
MODE=demo
VITE_API_BASE=http://localhost:8000
ATS_BASE=http://localhost:8001
SIGNING_SECRET=dev-signing-secret

# Optional real adapters
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_SMS_NUMBER=
GREENHOUSE_API_TOKEN=
LEVER_API_TOKEN=
WORKDAY_BASE_URL=
```

## Demo Script (90 seconds)
1) Create Job — “We just opened 200 Retail Associate roles in Jeddah night shift.”
2) Simulate Outreach — “Agent contacts candidates; Arabic is auto-handled; we can show per-message cost in real deployments.”
3) Run Flow — “We capture consent, ask 3–5 knockout questions, collect documents, schedule interviews, and write to the ATS.”
4) KPIs — “Tiles show reply, qualified, show, and cost per qualified; they update live.”
5) Audit — “Every step is governed by policy.yaml and hashed into an append-only ledger; hover for hash; click Replay.”
6) Hiring Simulator — “Leaders can model volume and capacity and see hires/week instantly.”

## Architecture

```
/apps
  /orchestrator       # FastAPI: agent runtime, audit, KPIs, SSE, scheduling, policy
  /ats-mock           # Minimal ATS mock for demo writebacks
  /ats-connector      # ATS connector skeleton (mock + real-style)
  /channel-connector  # Channel connector skeleton (mock + twilio-like)
  /dashboard          # Main React + Vite UI (auth-capable)
  /dashboard-demo     # Demo UI (no auth, mock-friendly)
/packages
  /policies           # YAML guardrails
  /common             # shared types
  /testing            # pytest config/tests
/infra
  docker-compose.yml
.env.example
```

- Runtime: Python 3.11+, FastAPI, Uvicorn
- Frontend: React + Vite + Material UI
- State: In-memory for demo; SQLite/Postgres-ready seams
- Events: Server-Sent Events (SSE) to push live updates
- Modes: MODE=demo (offline) or MODE=real (adapters), same UI

## Product One‑Pager (Executive Summary)
- What it is: A production-grade, multi-agent recruiter that is governed and measurable.
- What it does: Outreach, consent, screening, document capture, scheduling, ATS sync, real-time KPIs, and a replayable audit trail.
- Why it’s different: Multi-agent flow, explicit policy guardrails, append-only hash chain, Hiring Simulator, bilingual-ready UI.
- How it ships: Orchestrator + connectors (mock and real-style), polished UI, Docker-ready; works offline in demo mode.

## API Reference (Backend)

Health
- GET `/health` → { ok, mode }

Jobs & Candidates
- POST `/jobs` body: { title, location, shift, reqs[] }
- GET `/jobs`
- POST `/candidates` body: { name, phone, locale?, consent?, status? }
- GET `/candidates`

Outreach & Flow
- POST `/simulate/outreach?job_id=...` (alias: POST `/outreach/start`)
- POST `/simulate/flow?job_id=...&fast=true`

Scheduling
- POST `/schedule/propose?candidate_id=...`
- POST `/schedule/confirm?candidate_id=...`

Audit & Events
- GET `/audit?limit=250&cursor=` → { events[], next_cursor }
- GET `/audit/verify` → { ok, broken_at? }
- GET `/events/stream` (SSE, event: "audit")

Metrics & Simulator
- GET `/kpi` → tiles
- GET `/funnel` → { contacted, replied, qualified, scheduled, showed }
- POST `/simulate/hiring` query/body: { vol_per_day, reply_rate, qual_rate, show_rate, interviewer_capacity }

Channels & Ops
- POST `/send` body: { to, body, locale, channel } → emits `message.sent` with policy checks
- POST `/channels/inbound` (Twilio-like) → handles consent; logs inbound
- POST `/ops/force` body: { action: schedule_propose|schedule_confirm|ats_resync, candidate_id }

Policy
- GET `/policy` → current policy loaded from `packages/policies/policy.yaml`

## UI Tour
- KPI Overview: live tiles; auto-refresh via SSE.
- Funnel: Contacted → Replied → Qualified → Scheduled → Showed.
- Audit Explorer: latest 250, signed hash on hover; compliance badge; Replay modal to step through events.
- Hiring Simulator: inputs (volume, reply, qual, show, capacity) and outputs (hires/week, scheduled, shows).
- Ops Console: send messages; force propose/confirm; ATS re-sync; see instant updates.
- Jobs & Candidates: simple lists with status and quick scanning.
- Timezone Footer: local and KSA times rendered together.
- Dark Mode + Policy Dialog: quick toggle and governance visibility.

## Implementation Notes
Agents (hand-rolled orchestrations, swappable to LangGraph later):
- Planner (implicit via orchestrated endpoints), Sourcing, Screening, Scheduling, Compliance (policy checks), QA/Eval (tags outcomes), Data Agent (ATS writeback).

Policy & Governance:
- `packages/policies/policy.yaml` defines allowed_channels, max_questions, redactions, language. Loaded at runtime.
- Every outbound message includes a `compliance` section; all audit events are chained: `sha256(ts + payload_sorted + prev_hash + SIGNING_SECRET)`.
- `/audit/verify` validates the chain end-to-end.

Scheduling:
- Greedy slot proposal and confirmation; utilization surfaced via the simulator (hires/week approximation).

Connectors:
- `apps/ats-connector`, `apps/channel-connector` provide mock and real-style stubs.
- Orchestrator currently writes to `apps/ats-mock` for demo.

Events:
- SSE endpoint streams `audit` events that the UI consumes for near-real-time updates.

## Test Plan & Acceptance Criteria
Unit
- Policy loader and compliance checks.
- Hash chaining and verification logic.
- Simulator math.

Integration
- Mock ATS application creation path.
- Channel inbound consent handling updates candidate state and audit.

E2E (demo mode)
- Create Job → Simulate Outreach → Run Flow → KPI tiles update → ATS application exists → Audit shows signed events → Replay works.

Definition of Done
- Full-path happy flow in demo mode works offline; real mode ready to swap connectors.
- Dashboard is business-presentable (dark mode, policy visibility, badges, toasts).
- Audit chain verifies; `/policy` endpoint reflects configured rules.
- README includes Quick Start, Demo Script, Architecture, One-Pager, API Reference, UI tour, and Test Plan.

## License
MIT. Replace organization identifiers before sharing externally.
