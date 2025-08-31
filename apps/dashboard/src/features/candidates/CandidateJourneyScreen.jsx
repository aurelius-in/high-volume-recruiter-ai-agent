import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Button, Chip, Grid, Paper, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

function CandidateJourneyHeader({ candidate }){
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <Paper sx={{ p: 1.5, bgcolor:'#000', color:'#e0e0e0', border:'1px solid rgba(46,125,50,0.35)', position:'sticky', top:0, zIndex:2 }}>
      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ mb: 0.5 }}>{candidate.fullName}</Typography>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <Chip size="small" label={`${candidate.role}`} />
            <Chip size="small" label={`${candidate.location||''}`} />
            <Chip size="small" label={`${candidate.channel?.toUpperCase()||''}`} />
            <Chip size="small" color="success" label={`${candidate.stage}`} />
          </div>
        </Box>
        <Box sx={{ display:'flex', gap:1 }}>
          <Button variant="outlined" onClick={()=>navigate(`/`)}>{t('candidateJourney.back')}</Button>
          <Button variant="contained" color="primary" onClick={()=>navigate(`/scheduling?candidate=${encodeURIComponent(candidate.id)}`)}>{t('candidateJourney.schedule')}</Button>
        </Box>
      </Box>
    </Paper>
  );
}

function JourneyTimeline(){
  const { t } = useTranslation();
  const items = [
    { id:'e1', icon:'📣', title:'Outreach', at:'2025-06-03 09:10', details:'Initial SMS sent with job details.' },
    { id:'e2', icon:'✉️', title:'Reply', at:'2025-06-03 09:25', details:'Candidate replied and consented.' },
    { id:'e3', icon:'✅', title:'Qualification', at:'2025-06-03 10:10', details:'Passed screen; preferred Hybrid.' },
    { id:'e4', icon:'📅', title:'Scheduling', at:'2025-06-04 13:00', details:'Proposed Thursday 10:00; confirmed.' },
    { id:'e5', icon:'🔁', title:'Reschedule', at:'2025-06-05 11:30', details:'Moved to Friday 11:00.' },
    { id:'e6', icon:'🗂️', title:'ATS Update', at:'2025-06-06 15:45', details:'Progress set to Interviewed.' },
    { id:'e7', icon:'🏁', title:'Hired', at:'2025-06-10 09:00', details:'Marked hired in ATS.' }
  ];
  return (
    <Paper sx={{ p:1.5, bgcolor:'#000', color:'#e0e0e0', border:'1px solid rgba(46,125,50,0.35)' }}>
      <Typography variant="subtitle1" sx={{ mb:1 }}>{t('candidateJourney.timeline')}</Typography>
      <ul style={{ margin:0, paddingLeft: 16 }}>
        {items.map(it=> (
          <li key={it.id} style={{ marginBottom: 10 }}>
            <div style={{ fontWeight:700 }}>{it.icon} {it.title} — {it.at}</div>
            <div style={{ opacity:0.9, fontSize:12 }}>{it.details}</div>
          </li>
        ))}
      </ul>
      <Button variant="outlined" size="small" disabled sx={{ mt:1 }}>Replay</Button>
    </Paper>
  );
}

function ActivityCalendar(){
  const { t } = useTranslation();
  // Simplified static calendar mock
  const legend = [
    { key:'green', dot:'●', label:t('candidateJourney.legend.green'), color:'#2e7d32' },
    { key:'yellow', dot:'●', label:t('candidateJourney.legend.yellow'), color:'#fdd835' },
    { key:'orange', dot:'●', label:t('candidateJourney.legend.orange'), color:'#fb8c00' },
    { key:'red', dot:'●', label:t('candidateJourney.legend.red'), color:'#e53935' }
  ];
  return (
    <Paper sx={{ p:1.5, bgcolor:'#000', color:'#e0e0e0', border:'1px solid rgba(46,125,50,0.35)' }}>
      <Typography variant="subtitle1" sx={{ mb:1 }}>{t('candidateJourney.calendar')}</Typography>
      <div style={{ height: 220, border:'1px dashed rgba(176,190,197,0.4)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'#90a4ae' }}>
        Calendar mock (month view)
      </div>
      <div style={{ display:'flex', gap:12, marginTop:10, flexWrap:'wrap' }}>
        {legend.map(l => (
          <span key={l.key} style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
            <span style={{ color:l.color }}>{l.dot}</span> {l.label}
          </span>
        ))}
      </div>
    </Paper>
  );
}

function NotesPanel(){
  const { t } = useTranslation();
  const notes = [
    { id:'n1', author:'Emily Johnson', at:'2025‑06‑03 10:15', body:'Strong PM background. Prefers hybrid.' },
    { id:'n2', author:'David Wilson', at:'2025‑06‑04 14:05', body:'Confirmed interview; good communication.' },
    { id:'n3', author:'Olivia Brown', at:'2025‑06‑06 16:10', body:'ATS updated to Interviewed.' }
  ];
  return (
    <Paper sx={{ p:1.5, bgcolor:'#000', color:'#e0e0e0', border:'1px solid rgba(46,125,50,0.35)', height:'100%' }}>
      <Typography variant="subtitle1" sx={{ mb:1 }}>{t('candidateJourney.notes')}</Typography>
      <div style={{ height: 220, overflowY:'auto' }}>
        <ul style={{ margin:0, paddingLeft:16 }}>
          {notes.map(n=> (
            <li key={n.id} style={{ marginBottom: 10 }}>
              <div style={{ fontWeight:700 }}>{n.author} — {n.at}</div>
              <div style={{ opacity:0.9, fontSize:12 }}>{n.body}</div>
            </li>
          ))}
        </ul>
      </div>
      <Button variant="outlined" size="small" disabled sx={{ mt:1, opacity:0.7 }}>Notes disabled in demo</Button>
    </Paper>
  );
}

export default function CandidateJourneyScreen(){
  const { t } = useTranslation();
  const { candidateId } = useParams();
  const candidate = useMemo(()=>({
    id: candidateId,
    fullName: 'Selected Candidate',
    role: 'AI Product Manager',
    location: 'San Francisco, CA',
    channel: 'web',
    stage: 'qualified'
  }), [candidateId]);

  return (
    <Box sx={{ py: 1.25, px: 1, minHeight:'100vh', bgcolor:'#0b0d0b' }}>
      <CandidateJourneyHeader candidate={candidate} />
      <Grid container spacing={1.25} sx={{ mt: 0.5 }}>
        <Grid item xs={12} md={4}><JourneyTimeline /></Grid>
        <Grid item xs={12} md={4}><ActivityCalendar /></Grid>
        <Grid item xs={12} md={4}><NotesPanel /></Grid>
      </Grid>
    </Box>
  );
}


