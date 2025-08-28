import os
import time
import requests

API = os.getenv("API", os.getenv("VITE_API_BASE", "http://localhost:8000"))

def main():
    print(f"Using API base: {API}")
    # Health
    r = requests.get(f"{API}/health", timeout=5)
    r.raise_for_status()
    mode = r.json().get("mode")
    print(f"Health OK. Mode={mode}")

    # Create Job
    job = {
        "title": "Retail Associate",
        "location": "Jeddah",
        "shift": "Night",
        "reqs": ["Arabic or English", "18+", "High school"],
    }
    r = requests.post(f"{API}/jobs", json=job, timeout=10)
    r.raise_for_status()
    job_id = r.json()["job_id"]
    print(f"Created job: {job_id}")

    # Seed outreach
    r = requests.post(f"{API}/simulate/outreach", params={"job_id": job_id}, timeout=20)
    r.raise_for_status()
    print("Outreach seeded.")

    # Run flow
    r = requests.post(f"{API}/simulate/flow", params={"job_id": job_id, "fast": True}, timeout=30)
    r.raise_for_status()
    moved = r.json().get("moved")
    print(f"Flow executed. Moved={moved}")

    # KPIs
    r = requests.get(f"{API}/kpi", timeout=10)
    r.raise_for_status()
    kpi = r.json()
    print("KPI Tiles:")
    for k, v in kpi.items():
        print(f"  - {k}: {v}")

    # Verify audit chain
    r = requests.get(f"{API}/audit/verify", timeout=10)
    r.raise_for_status()
    verify = r.json()
    print(f"Audit verify: {verify}")

if __name__ == "__main__":
    main()


