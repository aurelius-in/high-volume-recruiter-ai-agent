import React, { useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Box, Button, Chip, Grid, Paper, Typography, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";

function CandidateJourneyHeader({ candidate }){
  const { t } = useTranslation();
  const navigate = useNavigate();
  const lastSeen = (()=>{
    const m = Number(candidate.lastMins||candidate.last_minutes||0);
    if (!Number.isFinite(m) || m <= 0) return '';
    const h = Math.floor(m/60);
    const mm = String(m%60).padStart(2,'0');
    return `${h}h${mm}m`;
  })();
  const lang = (candidate.locale||'').toUpperCase();
  return (
    <Paper sx={{ p: 1.5, bgcolor:'#000', color:'#e0e0e0', border:'1px solid rgba(46,125,50,0.35)', position:'sticky', top:0, zIndex:2 }}>
      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ mb: 0.5, color:'#a5d6a7', fontWeight: 800 }}>
            {candidate.fullName}
            <Typography component="span" variant="body2" sx={{ ml: 2, color:'#a5d6a7', opacity: 0.9, fontWeight: 600 }}>
              {t('candidateJourney.email')}: mosi1985@gmail.com • {t('candidateJourney.phone')}: 540-500-3300 • 📄 {t('candidateJourney.viewResume')}
            </Typography>
          </Typography>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {/** unified chip style for light green-grey text */}
            <Chip size="small" variant="outlined" sx={{ color:'#a5d6a7', borderColor:'rgba(165,214,167,0.5)' }} label={`${candidate.role||''}`} />
            <Chip size="small" variant="outlined" sx={{ color:'#a5d6a7', borderColor:'rgba(165,214,167,0.5)' }} label={`${candidate.location||''}`} />
            <Chip size="small" variant="outlined" sx={{ color:'#a5d6a7', borderColor:'rgba(165,214,167,0.5)' }} label={`${candidate.channel?.toUpperCase()||''}`} />
            <Chip size="small" variant="outlined" sx={{ color:'#a5d6a7', borderColor:'rgba(165,214,167,0.5)' }} label={`${candidate.stage||''}`} />
            {candidate.gender ? <Chip size="small" variant="outlined" sx={{ color:'#a5d6a7', borderColor:'rgba(165,214,167,0.5)' }} label={`${candidate.gender}`} /> : null}
            {candidate.workPref ? <Chip size="small" variant="outlined" sx={{ color:'#a5d6a7', borderColor:'rgba(165,214,167,0.5)' }} label={`${candidate.workPref}`} /> : null}
            {candidate.expertise || candidate.roleTitle ? <Chip size="small" variant="outlined" sx={{ color:'#a5d6a7', borderColor:'rgba(165,214,167,0.5)' }} label={`${candidate.expertise||''}${candidate.roleTitle?` — ${candidate.roleTitle}`:''}`} /> : null}
            {lang ? <Chip size="small" variant="outlined" sx={{ color:'#a5d6a7', borderColor:'rgba(165,214,167,0.5)' }} label={`${lang}`} /> : null}
            {Number.isFinite(candidate.years) ? <Chip size="small" variant="outlined" sx={{ color:'#a5d6a7', borderColor:'rgba(165,214,167,0.5)' }} label={`${candidate.years}y`} /> : null}
            {candidate.education ? <Chip size="small" variant="outlined" sx={{ color:'#a5d6a7', borderColor:'rgba(165,214,167,0.5)' }} label={`${candidate.education}`} /> : null}
            {candidate.citizenship || candidate.statusCode ? <Chip size="small" variant="outlined" sx={{ color:'#a5d6a7', borderColor:'rgba(165,214,167,0.5)' }} label={`${candidate.citizenship||''} ${candidate.statusCode||''}`.trim()} /> : null}
            {lastSeen ? <Chip size="small" variant="outlined" sx={{ color:'#a5d6a7', borderColor:'rgba(165,214,167,0.5)' }} label={`Last ${lastSeen}`} /> : null}
            {candidate.phone ? <Chip size="small" variant="outlined" sx={{ color:'#a5d6a7', borderColor:'rgba(165,214,167,0.5)' }} label={`${candidate.phone}`} /> : null}
            {typeof candidate.consent === 'boolean' ? <Chip size="small" variant="outlined" sx={{ color:'#a5d6a7', borderColor:'rgba(165,214,167,0.5)' }} label={`Consent: ${candidate.consent ? t('yes') : t('no')}`}/> : null}
          </div>
        </Box>
        <Box sx={{ display:'flex', gap:1 }}>
          <Button
            variant="text"
            size="small"
            onClick={()=>navigate(`/`)}
            sx={{
              position:'relative',
              minWidth: 64,
              px: 2,
              height: 32,
              bgcolor: 'transparent',
              color: '#cfd8dc',
              textTransform: 'none',
              fontSize: 12,
              clipPath: 'polygon(0 50%, 12px 0, 100% 0, 100% 100%, 12px 100%)',
              '&::before': {
                content:'""',
                position:'absolute',
                inset: 0,
                background: 'rgba(176,190,197,0.7)',
                clipPath: 'polygon(0 50%, 12px 0, 100% 0, 100% 100%, 12px 100%)',
                borderRadius: 0
              },
              '&::after': {
                content:'""',
                position:'absolute',
                inset: '1px',
                background: '#000',
                clipPath: 'polygon(0 50%, 12px 0, 100% 0, 100% 100%, 12px 100%)',
                borderRadius: 0
              },
              '&:hover::before': { background:'rgba(176,190,197,0.9)' }
            }}
          >
            BACK
          </Button>
          <Button
            variant="text"
            size="small"
            onClick={()=>navigate(`/scheduling?candidate=${encodeURIComponent(candidate.id)}`)}
            sx={{
              position:'relative',
              minWidth: 88,
              px: 2,
              height: 32,
              bgcolor: '#2e7d32',
              color: '#cfd8dc',
              textTransform: 'none',
              fontSize: 12,
              clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%)',
              '&:hover': { bgcolor: '#1b5e20' }
            }}
          >
            SCHEDULE
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

function JourneyTimeline({ events }){
  const { t, i18n } = useTranslation();
  const typeToIcon = { outreach:'📣', reply:'✉️', consent:'✉️', qualification:'✅', schedule:'📅', reschedule:'🔁', ats_update:'🗂️', hired:'🏁', error:'⚠️', reminder:'⏰', no_show:'🚫' };
  const items = (events||[]).map(e=>{
    const dt = new Date(e.at);
    const atDisplay = dt.toLocaleString(i18n.language);
    return {
      ...e,
      icon: typeToIcon[e.type] || '•',
      title: t(`candidateJourney.types.${e.type}`),
      atDisplay,
      summaryText: t(`candidateJourney.eventSummaries.${e.type}`)
    };
  });
  return (
    <Paper sx={{ p:1.5, bgcolor:'#000', color:'#ffcc80', border:'1px solid rgba(46,125,50,0.35)' }}>
      <Typography variant="subtitle1" sx={{ mb:1 }}>{t('candidateJourney.timeline')}</Typography>
      <ul style={{ margin:0, paddingLeft: 16 }}>
        {items.map(it=> (
          <li key={it.id} style={{ marginBottom: 10 }}>
            <div style={{ fontWeight:700 }}>{it.icon} {it.title} — {it.atDisplay}</div>
            <div style={{ opacity:0.9, fontSize:12 }}>{it.summaryText}</div>
          </li>
        ))}
      </ul>
      <Button variant="outlined" size="small" disabled sx={{ mt:1 }}>{t('candidateJourney.replay')}</Button>
    </Paper>
  );
}

function ActivityCalendar({ events }){
  const { t, i18n } = useTranslation();
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
  const monthLabel = viewDate.toLocaleDateString(i18n.language, { year:'numeric', month:'long' });

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
              color: useFill ? '#a5d6a7' : (cell.inMonth ? '#a5d6a7' : '#546e7a'),
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
  const { t, i18n } = useTranslation();
  const fmt = (s)=> new Date(s.replace(/\u202f|\u200f/g,'')).toLocaleString(i18n.language);
  const notes = [
    { id:'n1', author:'Emily Johnson', at:'2025-06-18T09:40:00', bodyKey:'note1' },
    { id:'n2', author:'David Wilson', at:'2025-07-03T13:45:00', bodyKey:'note2' },
    { id:'n3', author:'Olivia Brown', at:'2025-08-06T16:20:00', bodyKey:'note3' },
    { id:'n4', author:'Emily Johnson', at:'2025-08-28T10:15:00', bodyKey:'note4' }
  ];
  return (
    <Paper sx={{ p:1.5, bgcolor:'#000', color:'#fff59d', border:'1px solid rgba(46,125,50,0.35)', height:'100%', display:'flex', flexDirection:'column' }}>
      <Typography variant="subtitle1" sx={{ mb:1 }}>{t('candidateJourney.notes')}</Typography>
      <div style={{ height: 220, overflowY:'auto' }}>
        <ul style={{ margin:0, paddingLeft:16 }}>
          {notes.map(n=> (
            <li key={n.id} style={{ marginBottom: 10 }}>
              <div style={{ fontWeight:700 }}>{n.author} — {fmt(n.at)}</div>
              <div style={{ opacity:0.9, fontSize:12 }}>{t(`candidateJourney.notesText.${n.bodyKey}`)}</div>
            </li>
          ))}
        </ul>
      </div>
      <TextField
        multiline
        placeholder={t('candidateJourney.addNotePlaceholder')}
        sx={{
          mt:1,
          flex:1,
          minHeight: 120,
          '& .MuiInputBase-root': { bgcolor:'rgba(38,50,56,0.6)', color:'#e0e0e0', alignItems:'flex-start' },
          '& .MuiOutlinedInput-notchedOutline': { borderColor:'rgba(176,190,197,0.4)' },
          '& .MuiInputBase-input::placeholder': { color:'#b0bec5', opacity:1 }
        }}
        minRows={5}
      />
      <Button variant="contained" color="success" sx={{ mt:1, alignSelf:'flex-end' }}>ADD</Button>
    </Paper>
  );
}

export default function CandidateJourneyScreen(){
  const { t } = useTranslation();
  const { candidateId } = useParams();
  const location = useLocation();
  const candidate = useMemo(()=>{
    const stateCand = location.state && location.state.candidate;
    let cand = stateCand;
    if (!cand){
      try {
        const cached = sessionStorage.getItem('selectedCandidate');
        if (cached) cand = JSON.parse(cached);
      } catch(_){/* ignore */}
    }
    if (cand) return {
      id: cand.id,
      fullName: cand.name || cand.fullName || 'Candidate',
      role: cand.roleTitle || '—',
      location: cand.location || '—',
      channel: cand.channel || '—',
      stage: cand.status || '—',
      gender: cand.gender,
      workPref: cand.workPref,
      expertise: cand.expertise,
      roleTitle: cand.roleTitle,
      locale: cand.locale,
      years: cand.years,
      education: cand.education,
      citizenship: cand.citizenship,
      statusCode: cand.statusCode,
      lastMins: cand.lastMins,
      phone: cand.phone,
      consent: cand.consent
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
    // ~10-week journey ending late August 2025
    { id:'e1', type:'outreach',    at:'2025-06-17T09:10:00', summary:'Initial SMS sent with job details.' },
    { id:'e2', type:'reply',       at:'2025-06-17T09:25:00', summary:'Candidate replied and consented.' },
    { id:'e3', type:'qualification', at:'2025-06-20T10:10:00', summary:'Passed screen; prefers Hybrid.' },
    { id:'e4', type:'schedule',    at:'2025-07-02T13:00:00', summary:'Proposed interview; confirmed.' },
    { id:'e5', type:'reschedule',  at:'2025-07-18T11:30:00', summary:'Rescheduled due to conflict.' },
    { id:'e6', type:'ats_update',  at:'2025-08-05T15:45:00', summary:'ATS updated to “Interviewed”.' },
    { id:'e7', type:'hired',       at:'2025-08-28T09:00:00', summary:'Marked hired in ATS.' }
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


