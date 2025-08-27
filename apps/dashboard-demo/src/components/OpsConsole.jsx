import React, { useState } from "react";
import { Grid, TextField, Button } from "@mui/material";

const API = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function OpsConsole(){
  const [to, setTo] = useState("");
  const [body, setBody] = useState("");
  const [locale, setLocale] = useState("en");
  const [candidateId, setCandidateId] = useState("");

  const send = async () => {
    await fetch(`${API}/send`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ to, body, locale, channel: "sms" }) });
    setBody("");
  };

  const force = async (action) => {
    if (!candidateId) return;
    await fetch(`${API}/ops/force`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, candidate_id: candidateId }) });
  };

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item>
        <TextField label="To" size="small" value={to} onChange={e=>setTo(e.target.value)} />
      </Grid>
      <Grid item>
        <TextField label="Locale" size="small" value={locale} onChange={e=>setLocale(e.target.value)} />
      </Grid>
      <Grid item>
        <TextField label="Candidate ID" size="small" value={candidateId} onChange={e=>setCandidateId(e.target.value)} />
      </Grid>
      <Grid item xs>
        <TextField fullWidth label="Message" size="small" value={body} onChange={e=>setBody(e.target.value)} />
      </Grid>
      <Grid item>
        <Button variant="contained" onClick={send}>Send</Button>
      </Grid>
      <Grid item>
        <Button onClick={()=>force("schedule_propose")} sx={{ ml: 1 }}>Propose</Button>
        <Button onClick={()=>force("schedule_confirm")} sx={{ ml: 1 }}>Confirm</Button>
      </Grid>
    </Grid>
  );
}


