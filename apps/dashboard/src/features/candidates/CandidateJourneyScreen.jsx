import React, { useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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

function JourneyTimeline({ events }){
  const { t } = useTranslation();
  const typeToIcon = { outreach:'📣', reply:'✉️', consent:'✉️', qualification:'✅', schedule:'📅', reschedule:'🔁', ats_update:'🗂️', hired:'🏁', error:'⚠️', reminder:'⏰', no_show:'🚫' };
  const items = (events||[]).map(e=>({
    ...e,
    icon: typeToIcon[e.type] || '•',
    title: e.type.charAt(0).toUpperCase()+e.type.slice(1).replace('_',' '),
    atDisplay: new Date(e.at).toLocaleString()
  }));
  return (
    <Paper sx={{ p:1.5, bgcolor:'#000', color:'#ffcc80', border:'1px solid rgba(46,125,50,0.35)' }}>
      <Typography variant="subtitle1" sx={{ mb:1 }}>{t('candidateJourney.timeline')}</Typography>
      <ul style={{ margin:0, paddingLeft: 16 }}>
        {items.map(it=> (
          <li key={it.id} style={{ marginBottom: 10 }}>
            <div style={{ fontWeight:700 }}>{it.icon} {it.title} — {it.atDisplay}</div>
            <div style={{ opacity:0.9, fontSize:12 }}>{it.summary || it.details}</div>
          </li>
        ))}
      </ul>
      <Button variant="outlined" size="small" disabled sx={{ mt:1 }}>Replay</Button>
    </Paper>
  );
}

function ActivityCalendar({ events }){
  const { t } = useTranslation();
  const [offset, setOffset] = useState(0); // month offset from current
  const base = new Date();
  const viewDate = new Date(base.getFullYear(), base.getMonth()+offset, 1);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();

  const legend = [
    { key:'green', dot:'●', label:t('candidateJourney.legend.green'), color:'#2e7d32' },
    { key:'yellow', dot:'●', label:t('candidateJourney.legend.yellow'), color:'#fdd835' },
    { key:'orange', dot:'●', label:t('candidateJourney.legend.orange'), color:'#fb8c00' },
    { key:'red', dot:'●', label:t('candidateJourney.legend.red'), color:'#e53935' }
  ];
  const weeks = [];
  let day = 1 - firstDay;
  while (day <= daysInMonth) {
    const week = [];
    for (let i=0;i<7;i++){
      const d = new Date(year, month, day);
      const inMonth = d.getMonth() === month;
      week.push({ date: d, inMonth });
      day++;
    }
    weeks.push(week);
  }
  const monthLabel = viewDate.toLocaleDateString(undefined, { year:'numeric', month:'long' });

  // Map events to Y-M-D -> color
  const colorForType = (type)=>{
    if (type==='outreach' || type==='reply' || type==='consent' || type==='qualification' || type==='ats_update' || type==='hired') return '#2e7d32';
    if (type==='schedule' || type==='reminder') return '#fdd835';
    if (type==='reschedule' || type==='no_show') return '#fb8c00';
    if (type==='error') return '#e53935';
    return undefined;
  };
  const eventByDay = {};
  (events||[]).forEach(e=>{
    const d = new Date(e.at);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const color = colorForType(e.type);
    if (!color) return;
    eventByDay[key] = color; // last one wins; enough for demo
  });

  return (
    <>
      <Paper sx={{ p:1.5, bgcolor:'#000', color:'#a5d6a7', border:'1px solid rgba(46,125,50,0.35)' }}>
        <Typography variant="subtitle1" sx={{ mb:1 }}>{t('candidateJourney.calendar')}</Typography>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
          <Button size="small" variant="outlined" aria-label="Previous month" onClick={()=>setOffset(o=>o-1)}>{'<'}</Button>
          <Typography variant="subtitle2">{monthLabel}</Typography>
          <Button size="small" variant="outlined" aria-label="Next month" onClick={()=>setOffset(o=>o+1)}>{'>'}</Button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:4 }}>
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=>(
            <div key={d} style={{ textAlign:'center', opacity:0.7, fontSize:12 }}>{d}</div>
          ))}
          {weeks.map((week, wi)=> week.map((cell, ci)=> {
            const key = `${cell.date.getFullYear()}-${String(cell.date.getMonth()+1).padStart(2,'0')}-${String(cell.date.getDate()).padStart(2,'0')}`;
            const evColor = eventByDay[key];
            const useFill = !!evColor;
            const style = {
              height: 28,
              border: `1px solid ${evColor || 'rgba(176,190,197,0.25)'}`,
              background: useFill ? evColor : 'transparent',
              color: useFill ? '#000' : (cell.inMonth ? '#a5d6a7' : '#546e7a'),
              borderRadius:6,
              textAlign:'right',
              paddingRight:6,
              paddingTop:4
            };
            return (
              <div key={`${wi}-${ci}`} style={style}>
                {cell.date.getDate()}
              </div>
            );
          }))}
        </div>
      </Paper>

      <Paper sx={{ p:1, mt:'48px', bgcolor:'#000', color:'#a5d6a7', border:'1px solid rgba(46,125,50,0.35)' }}>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'center', fontSize:12 }}>
          {legend.map(l => (
            <span key={l.key} style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
              <span style={{ color:l.color, fontSize:10 }}>{l.dot}</span> <span>{l.label}</span>
            </span>
          ))}
        </div>
      </Paper>
    </>
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
    <Paper sx={{ p:1.5, bgcolor:'#000', color:'#fff59d', border:'1px solid rgba(46,125,50,0.35)', height:'100%' }}>
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
  const location = useLocation();
  const candidate = useMemo(()=>{
    const stateCand = location.state && location.state.candidate;
    if (stateCand) return {
      id: stateCand.id,
      fullName: stateCand.name || stateCand.fullName || 'Candidate',
      role: stateCand.roleTitle || '—',
      location: stateCand.location || '—',
      channel: stateCand.channel || '—',
      stage: stateCand.status || '—'
    };
    return {
      id: candidateId,
      fullName: 'Candidate',
      role: '—',
      location: '—',
      channel: '—',
      stage: '—'
    };
  }, [candidateId, location.state]);

  // Shared demo events powering both Timeline and Calendar
  const events = useMemo(() => ([
    { id:'e1', type:'outreach', at:'2025-06-03T09:10:00', summary:'Initial SMS sent with job details.' },
    { id:'e2', type:'reply', at:'2025-06-03T09:25:00', summary:'Candidate replied and consented.' },
    { id:'e3', type:'qualification', at:'2025-06-03T10:10:00', summary:'Passed screen; preferred Hybrid.' },
    { id:'e4', type:'schedule', at:'2025-06-04T13:00:00', summary:'Proposed Thursday 10:00; confirmed.' },
    { id:'e5', type:'reschedule', at:'2025-06-05T11:30:00', summary:'Moved to Friday 11:00.' },
    { id:'e6', type:'ats_update', at:'2025-06-06T15:45:00', summary:'Progress set to Interviewed.' },
    { id:'e7', type:'hired', at:'2025-06-10T09:00:00', summary:'Marked hired in ATS.' }
  ]), []);

  return (
    <Box sx={{ py: 1.25, px: 1, minHeight:'100vh', bgcolor:'#0b0d0b' }}>
      <CandidateJourneyHeader candidate={candidate} />
      <Grid container spacing={1.25} sx={{ mt: 0.5 }}>
        <Grid item xs={12} md={4}><JourneyTimeline events={events} /></Grid>
        <Grid item xs={12} md={4}><ActivityCalendar events={events} /></Grid>
        <Grid item xs={12} md={4}><NotesPanel /></Grid>
      </Grid>
    </Box>
  );
}


