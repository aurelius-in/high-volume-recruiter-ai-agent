import fetch from "node-fetch";

const API = process.env.API || process.env.VITE_API_BASE || "http://localhost:8000";

async function main() {
  const h = await fetch(`${API}/health`);
  if (!h.ok) throw new Error(`/health failed: ${h.status}`);
  const job = {
    title: "Retail Associate",
    location: "Jeddah",
    shift: "Night",
    reqs: ["Arabic or English", "18+", "High school"],
  };
  const r1 = await fetch(`${API}/jobs`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(job) });
  const j1 = await r1.json();
  const jobId = j1.job_id;
  console.log(`Created job: ${jobId}`);

  const r2 = await fetch(`${API}/simulate/outreach?job_id=${encodeURIComponent(jobId)}`, { method: "POST" });
  if (!r2.ok) throw new Error("seed outreach failed");
  console.log("Outreach seeded.");

  const r3 = await fetch(`${API}/simulate/flow?job_id=${encodeURIComponent(jobId)}&fast=true`, { method: "POST" });
  const j3 = await r3.json();
  console.log(`Flow executed. Moved=${j3.moved}`);

  const r4 = await fetch(`${API}/kpi`);
  const kpi = await r4.json();
  console.log("KPI Tiles:");
  for (const [k, v] of Object.entries(kpi)) console.log(`  - ${k}: ${v}`);

  const r5 = await fetch(`${API}/audit/verify`);
  const verify = await r5.json();
  console.log(`Audit verify: ${JSON.stringify(verify)}`);
}

main().catch((e) => { console.error(e); process.exit(1); });


