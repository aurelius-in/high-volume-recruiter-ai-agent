import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, TextField, Typography, Chip } from "@mui/material";

const API = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function AskChat(){
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Ask about jobs or candidates. Try: ‘How many are qualified?’ or ‘List open jobs in Dallas’." }
  ]);
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [kpi, setKpi] = useState(null);
  const listRef = useRef(null);

  useEffect(()=>{
    // Prefetch lightweight context used to answer questions locally
    fetch(`${API}/jobs`).then(r=>r.json()).then(d=>setJobs(d.jobs||[])).catch(()=>{});
    fetch(`${API}/candidates`).then(r=>r.json()).then(d=>setCandidates(d.candidates||[])).catch(()=>{});
    fetch(`${API}/kpi`).then(r=>r.json()).then(setKpi).catch(()=>{});
  },[]);

  useEffect(()=>{
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const stats = useMemo(()=>{
    const totals = {
      totalCandidates: candidates.length,
      qualified: candidates.filter(c=>c.status==='qualified').length,
      scheduled: candidates.filter(c=>c.status==='scheduled').length,
      replied: candidates.filter(c=>c.status==='replied').length,
      contacted: candidates.filter(c=>c.status==='contacted').length,
      jobs: jobs.length
    };
    return totals;
  }, [candidates, jobs]);

  const answer = async (q) => {
    const query = q.toLowerCase();
    // Simple heuristics for demo
    if (query.includes("how many") && query.includes("qualified")) {
      return `Qualified candidates: ${stats.qualified}`;
    }
    if (query.includes("how many") && (query.includes("scheduled") || query.includes("interview"))) {
      return `Scheduled interviews: ${stats.scheduled}`;
    }
    if (query.includes("reply") || query.includes("replied")) {
      return `Replied: ${stats.replied}. Reply rate: ${kpi?.reply_rate ?? '—'}`;
    }
    if (query.includes("active") && query.includes("candidates")) {
      const ac = kpi?.active_candidates ?? stats.totalCandidates;
      return `Active candidates: ${ac}`;
    }
    if (query.includes("jobs in")) {
      const city = q.split(/jobs in/i)[1]?.trim().replace(/[\.?]$/,'');
      if (city) {
        const list = jobs.filter(j=>String(j.location).toLowerCase().includes(city.toLowerCase())).slice(0,5);
        if (list.length === 0) return `No jobs found in ${city}.`;
        return `Jobs in ${city}: ` + list.map(j=>`${j.title} — ${j.location} — ${j.shift}`).join(" | ");
      }
    }
    if (query.includes("list") && query.includes("jobs")) {
      const list = jobs.slice(0,5).map(j=>`${j.title} — ${j.location} — ${j.shift}`).join(" | ");
      return list ? `Open jobs: ${list}` : "No jobs found.";
    }
    if (query.includes("ats") && query.includes("rate")) {
      return `ATS success rate: ${kpi?.ats_success_rate ?? '—'}`;
    }
    // Fallback
    return "I can answer about candidates (qualified/scheduled/replied), active candidates, ATS rate, or list jobs by city.";
  };

  const onSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMessages(m=>[...m, { role:'user', text }]);
    const reply = await answer(text);
    setMessages(m=>[...m, { role:'assistant', text: reply }]);
  };

  return (
    <Box sx={{ display:'flex', flexDirection:'column', height: 360, bgcolor:'#000', color:'#fff' }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>Ask Anything</Typography>
      <div ref={listRef} style={{ flex:1, overflowY:'auto', padding: '6px 8px', border:'1px solid rgba(46,125,50,0.35)', borderRadius: 6, background:'rgba(0,0,0,0.6)' }}>
        {messages.map((m, idx)=> (
          <div key={idx} style={{ marginBottom: 8, display:'flex', justifyContent: m.role==='user'?'flex-end':'flex-start' }}>
            <div style={{
              maxWidth:'78%',
              background: m.role==='user' ? 'linear-gradient(180deg, rgba(15,15,15,0.95), rgba(0,0,0,0.9))' : 'rgba(13,71,20,0.25)',
              border: m.role==='user' ? '1px solid rgba(244,67,54,0.35)' : '1px solid rgba(46,125,50,0.35)',
              color:'#e0e0e0', padding:'6px 10px', borderRadius:10
            }}>
              <Typography variant="body2" sx={{ fontFamily:'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, "Noto Sans", Arial, Helvetica' }}>
                {m.text}
              </Typography>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:8, marginTop:8 }}>
        <TextField size="small" fullWidth value={input} onChange={e=>setInput(e.target.value)}
          placeholder="Ask about candidates or jobs..."
          InputLabelProps={{ sx:{ color:'#b0bec5' } }}
          sx={{
            '& .MuiInputBase-root': { bgcolor:'rgba(38,50,56,0.6)', color:'#e0e0e0' },
            '& .MuiOutlinedInput-notchedOutline': { borderColor:'rgba(176,190,197,0.4)' }
          }}
        />
        <Button variant="contained" onClick={onSend} sx={{ bgcolor:'#2e7d32' }}>Send</Button>
      </div>
      <Box sx={{ mt: 1, display:'flex', gap: 0.5, flexWrap:'wrap' }}>
        <Chip size="small" label="How many are qualified?" onClick={()=>setInput("How many are qualified?")} />
        <Chip size="small" label="List jobs in Dallas" onClick={()=>setInput("List jobs in Dallas")}/>
        <Chip size="small" label="What is the ATS rate?" onClick={()=>setInput("What is the ATS rate?")}/>
      </Box>
    </Box>
  );
}


