import React, { useState } from "react";
import { Grid, TextField, Button, Typography } from "@mui/material";

const API = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function Simulator(){
  const [form, setForm] = useState({ vol_per_day: 500, reply_rate: 0.35, qual_rate: 0.25, show_rate: 0.7, interviewer_capacity: 50, target_openings: 50 });
  const [res, setRes] = useState(null);

  const go = async () => {
    const params = new URLSearchParams(Object.entries(form)).toString();
    const out = await fetch(`${API}/simulate/hiring?${params}`, { method: "POST" });
    setRes(await out.json());
  };

  return (
    <div>
      <Grid container spacing={2} alignItems="center">
        {Object.entries(form).map(([k,v]) => (
          <Grid item key={k}>
            <TextField
              label={k}
              size="small"
              value={v}
              onChange={e => setForm({...form, [k]: e.target.value})}
            />
          </Grid>
        ))}
        <Grid item>
          <Button variant="contained" onClick={go}>Run</Button>
        </Grid>
      </Grid>
      {res && (
        <Typography sx={{ mt: 2 }}>
          Hires/week: <b>{res.hires_per_week}</b> • Utilization: {(res.utilization*100).toFixed(0)}% • Time-to-fill: {res.time_to_fill_weeks ?? '—'} weeks • Replies: {res.replies} • Qualified: {res.qualified} • Scheduled: {res.scheduled} • Shows: {res.shows}
        </Typography>
      )}
    </div>
  );
}


