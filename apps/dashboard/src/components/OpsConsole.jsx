import React, { useState } from "react";
import { Grid, TextField, Button } from "@mui/material";

const API = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function OpsConsole(){
  const [to, setTo] = useState("");
  const [body, setBody] = useState("");
  const [locale, setLocale] = useState("en");
  const [candidateId, setCandidateId] = useState("");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const labelSx = { color: '#b0bec5' };
  const fieldSx = {
    '& .MuiInputBase-root': {
      bgcolor: 'rgba(38,50,56,0.6)',
      color: '#e0e0e0',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(176,190,197,0.4)'
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(176,190,197,0.7)'
    }
  };

  const send = async () => {
    await fetch(`${API}/send`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ to, body, locale, channel: "sms" }) });
    setBody("");
  };

  const force = async (action) => {
    if (!candidateId) return;
    await fetch(`${API}/ops/force`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, candidate_id: candidateId }) });
  };

  const createCandidate = async () => {
    if (!newName || !newPhone) return;
    await fetch(`${API}/candidates`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newName, phone: newPhone, locale }) });
    setNewName("");
    setNewPhone("");
  };

  const resendLast = async () => {
    const res = await fetch(`${API}/audit`);
    const data = await res.json();
    const last = (data.events || []).slice().reverse().find(e => e.action === 'message.sent');
    if (last?.payload) {
      const p = last.payload;
      await fetch(`${API}/send`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ to: p.to, body: p.body, locale: p.locale || 'en', channel: p.channel || 'sms' }) });
    }
  };

  return (
    <Grid container spacing={2} alignItems="center" sx={{ color: '#b0bec5' }}>
      <Grid item>
        <TextField label="To" size="small" value={to} onChange={e=>setTo(e.target.value)} InputLabelProps={{ sx: labelSx }} sx={fieldSx} />
      </Grid>
      <Grid item>
        <TextField label="Locale" size="small" value={locale} onChange={e=>setLocale(e.target.value)} InputLabelProps={{ sx: labelSx }} sx={fieldSx} />
      </Grid>
      <Grid item>
        <TextField label="Candidate ID" size="small" value={candidateId} onChange={e=>setCandidateId(e.target.value)} InputLabelProps={{ sx: labelSx }} sx={fieldSx} />
      </Grid>
      <Grid item>
        <TextField label="Name" size="small" value={newName} onChange={e=>setNewName(e.target.value)} InputLabelProps={{ sx: labelSx }} sx={fieldSx} />
      </Grid>
      <Grid item>
        <TextField label="Phone" size="small" value={newPhone} onChange={e=>setNewPhone(e.target.value)} InputLabelProps={{ sx: labelSx }} sx={fieldSx} />
      </Grid>
      <Grid item xs>
        <TextField fullWidth label="Message" size="small" value={body} onChange={e=>setBody(e.target.value)} InputLabelProps={{ sx: labelSx }} sx={fieldSx} />
      </Grid>
      <Grid item>
        <Button variant="contained" onClick={send}>Send</Button>
      </Grid>
      <Grid item>
        <Button onClick={()=>force("schedule_propose")} sx={{ ml: 1 }}>Propose</Button>
        <Button onClick={()=>force("schedule_confirm")} sx={{ ml: 1 }}>Confirm</Button>
      </Grid>
      <Grid item>
        <Button onClick={createCandidate} sx={{ ml: 1 }}>Create Candidate</Button>
        <Button onClick={resendLast} sx={{ ml: 1 }}>Resend Last</Button>
      </Grid>
    </Grid>
  );
}


