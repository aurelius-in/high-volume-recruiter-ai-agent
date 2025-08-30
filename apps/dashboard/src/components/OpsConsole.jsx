import React, { useState } from "react";
import { Grid, TextField, Button, MenuItem } from "@mui/material";
import { useTranslation } from "react-i18next";

const API = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function OpsConsole(){
  const { t } = useTranslation();
  const [to, setTo] = useState("");
  const [body, setBody] = useState("");
  const [candidateId, setCandidateId] = useState("");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [mode, setMode] = useState("message"); // 'message' | 'propose' | 'confirm' | 'create' | 'none'
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth()+1));
  const [day, setDay] = useState(String(now.getDate()));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [hour, setHour] = useState("10");
  const [ampm, setAmPm] = useState("AM");
  const [lastProposedCandidateId, setLastProposedCandidateId] = useState("");

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
    await fetch(`${API}/send`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ to, body, channel: "sms" }) });
    setBody("");
  };

  const force = async (action) => {
    if (!candidateId) return;
    await fetch(`${API}/ops/force`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, candidate_id: candidateId }) });
  };

  const createCandidate = async () => {
    if (!newName || !newPhone) return;
    await fetch(`${API}/candidates`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newName, phone: newPhone }) });
    setNewName("");
    setNewPhone("");
  };

  // resendLast removed for simplified demo flow

  return (
    <Grid container spacing={1} direction="column" sx={{ color: '#b0bec5' }}>
      <Grid item>
        <div style={{ display:'flex', gap:8 }}>
          <Button variant="contained" sx={{
            color: '#cfd8d3', fontWeight: 800, fontSize:'0.82rem', lineHeight:1.1, borderRadius:'10px',
            border:'1px solid rgba(244,67,54,0.7)',
            background: 'linear-gradient(180deg, rgba(15,15,15,0.95) 0%, rgba(0,0,0,0.95) 60%), repeating-linear-gradient(135deg, rgba(244,67,54,0.18) 0 6px, rgba(0,0,0,0) 6px 12px)',
            boxShadow:'0 0 10px rgba(244,67,54,0.35), 0 6px 14px rgba(0,0,0,0.7), inset 0 0 10px rgba(244,67,54,0.22)',
            '&:hover':{ transform:'translateY(-1px)', boxShadow:'0 0 14px rgba(244,67,54,0.45), 0 10px 18px rgba(0,0,0,0.75), inset 0 0 12px rgba(244,67,54,0.28)'}
          }} onClick={()=> setMode('create') }>{t('ops.createCandidate')}</Button>
          <Button variant="contained" sx={{
            color: '#cfd8d3', fontWeight: 800, fontSize:'0.82rem', lineHeight:1.1, borderRadius:'10px',
            border:'1px solid rgba(244,67,54,0.7)',
            background: 'linear-gradient(180deg, rgba(15,15,15,0.95) 0%, rgba(0,0,0,0.95) 60%), repeating-linear-gradient(135deg, rgba(244,67,54,0.18) 0 6px, rgba(0,0,0,0) 6px 12px)',
            boxShadow:'0 0 10px rgba(244,67,54,0.35), 0 6px 14px rgba(0,0,0,0.7), inset 0 0 10px rgba(244,67,54,0.22)',
            '&:hover':{ transform:'translateY(-1px)', boxShadow:'0 0 14px rgba(244,67,54,0.45), 0 10px 18px rgba(0,0,0,0.75), inset 0 0 12px rgba(244,67,54,0.28)'}
          }} onClick={()=> setMode('propose') }>{t('ops.addTime')}</Button>
          <Button variant="contained" sx={{
            color: '#cfd8d3', fontWeight: 800, fontSize:'0.82rem', lineHeight:1.1, borderRadius:'10px',
            border:'1px solid rgba(244,67,54,0.7)',
            background: 'linear-gradient(180deg, rgba(15,15,15,0.95) 0%, rgba(0,0,0,0.95) 60%), repeating-linear-gradient(135deg, rgba(244,67,54,0.18) 0 6px, rgba(0,0,0,0) 6px 12px)',
            boxShadow:'0 0 10px rgba(244,67,54,0.35), 0 6px 14px rgba(0,0,0,0.7), inset 0 0 10px rgba(244,67,54,0.22)',
            '&:hover':{ transform:'translateY(-1px)', boxShadow:'0 0 14px rgba(244,67,54,0.45), 0 10px 18px rgba(0,0,0,0.75), inset 0 0 12px rgba(244,67,54,0.28)'}
          }} onClick={()=> setMode('message') }>{t('ops.sendMessage')}</Button>
        </div>
      </Grid>
      {/* Confirm appears only as green action inside confirm mode; no extra yellow */}

      {mode === 'propose' && (
        <>
          <Grid item>
            <TextField label={t('ops.candidateId')} size="small" value={candidateId} onChange={e=>setCandidateId(e.target.value)} InputLabelProps={{ sx: labelSx }} sx={fieldSx} />
          </Grid>
          <Grid item>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <TextField select label={t('ops.month')} size="small" value={month} onChange={e=>setMonth(e.target.value)} InputLabelProps={{ sx: labelSx }} sx={fieldSx}>
                {[...Array(12)].map((_,i)=> <MenuItem key={i+1} value={String(i+1)}>{i+1}</MenuItem>)}
              </TextField>
              <TextField select label={t('ops.day')} size="small" value={day} onChange={e=>setDay(e.target.value)} InputLabelProps={{ sx: labelSx }} sx={fieldSx}>
                {[...Array(31)].map((_,i)=> <MenuItem key={i+1} value={String(i+1)}>{i+1}</MenuItem>)}
              </TextField>
              <TextField select label={t('ops.year')} size="small" value={year} onChange={e=>setYear(e.target.value)} InputLabelProps={{ sx: labelSx }} sx={fieldSx}>
                {[0,1].map((off)=>{
                  const y = String(now.getFullYear()+off);
                  return <MenuItem key={y} value={y}>{y}</MenuItem>;
                })}
              </TextField>
              <TextField select label={t('ops.hour')} size="small" value={hour} onChange={e=>setHour(e.target.value)} InputLabelProps={{ sx: labelSx }} sx={fieldSx}>
                {[...Array(12)].map((_,i)=> <MenuItem key={i+1} value={String(i+1)}>{i+1}</MenuItem>)}
              </TextField>
              <TextField select label={t('ops.ampm')} size="small" value={ampm} onChange={e=>setAmPm(e.target.value)} InputLabelProps={{ sx: labelSx }} sx={fieldSx}>
                <MenuItem value="AM">{t('ops.am')}</MenuItem>
                <MenuItem value="PM">{t('ops.pm')}</MenuItem>
              </TextField>
            </div>
          </Grid>
          <Grid item sx={{ textAlign:'right' }}>
            <Button variant="contained" sx={{ bgcolor:'#2e7d32' }} onClick={async ()=>{ await force('schedule_propose'); setLastProposedCandidateId(candidateId); setMode('confirm'); }}>{t('ops.propose')}</Button>
          </Grid>
        </>
      )}

      {mode === 'create' && (
        <>
          <Grid item>
            <TextField label={t('ops.name')} size="small" value={newName} onChange={e=>setNewName(e.target.value)} InputLabelProps={{ sx: labelSx }} sx={fieldSx} />
          </Grid>
          <Grid item>
            <TextField label={t('ops.phone')} size="small" value={newPhone} onChange={e=>setNewPhone(e.target.value)} InputLabelProps={{ sx: labelSx }} sx={fieldSx} />
          </Grid>
          <Grid item sx={{ textAlign:'right' }}>
            <Button variant="contained" sx={{ bgcolor:'#2e7d32' }} onClick={createCandidate}>{t('ops.create')}</Button>
          </Grid>
        </>
      )}

      {mode === 'confirm' && (
        <>
          <Grid item>
            <TextField label={t('ops.candidateId')} size="small" value={candidateId} onChange={e=>setCandidateId(e.target.value)} InputLabelProps={{ sx: labelSx }} sx={fieldSx} />
          </Grid>
          <Grid item sx={{ textAlign:'right' }}>
            <Button variant="contained" sx={{ bgcolor:'#2e7d32' }} onClick={async ()=>{ await force('schedule_confirm'); setMode('none'); }}>{t('ops.confirmInterview')}</Button>
          </Grid>
        </>
      )}

      {mode === 'message' && (
        <>
          <Grid item>
            <TextField fullWidth multiline minRows={2} label={t('ops.message')} size="small" value={body} onChange={e=>setBody(e.target.value)} InputLabelProps={{ sx: labelSx }} sx={fieldSx} />
          </Grid>
          <Grid item>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <div style={{ flex: 1 }}>
                <TextField fullWidth placeholder={t('ops.recipientPhone')} size="small" value={to} onChange={e=>setTo(e.target.value)} InputLabelProps={{ sx: labelSx }} sx={fieldSx} />
              </div>
              <div>
                <Button variant="contained" onClick={send}>{t('ops.send')}</Button>
              </div>
            </div>
          </Grid>
        </>
      )}
    </Grid>
  );
}


