import React, { useEffect, useState } from "react";
import axios from "axios";
import { Paper, Typography } from "@mui/material";

const API = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export function JobsList(){
  const [jobs, setJobs] = useState([]);
  useEffect(()=>{ axios.get(`${API}/jobs`).then(r=>setJobs(r.data.jobs||[])); },[]);
  return (
    <Paper sx={{ p:2 }}>
      <Typography variant="subtitle1">Jobs</Typography>
      <ul>
        {jobs.map(j => (<li key={j.id}>{j.title} — {j.location} — {j.shift}</li>))}
      </ul>
    </Paper>
  );
}

export function CandidatesList(){
  const [cands, setCands] = useState([]);
  useEffect(()=>{ axios.get(`${API}/candidates`).then(r=>setCands(r.data.candidates||[])); },[]);
  return (
    <Paper sx={{ p:2 }}>
      <Typography variant="subtitle1">Candidates</Typography>
      <ul>
        {cands.map(c => (<li key={c.id}>{c.name} — {c.status}</li>))}
      </ul>
    </Paper>
  );
}


