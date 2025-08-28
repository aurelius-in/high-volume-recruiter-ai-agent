import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, TextField, Typography, Chip } from "@mui/material";

const API = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function AskChat(){
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Ask about candidates or jobs. Try: ‘Is Oliver Ellison have 10+ years experience building agentic systems?’ or ‘Should Sabbar hire Oliver Ellison?’" }
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
    // Special demo Q&A about Oliver Ellison
    if (query.includes("oliver") && query.includes("ellison") && (query.includes("10+") || query.includes("10+ years") || query.includes("10 years") || query.includes("experience"))) {
      return "Yes. Oliver Ellison has over 10 years designing and shipping AI systems, including production agentic workflows, retrieval-augmented generation, tool-use orchestration, and high-volume messaging automations. He has led end‑to‑end delivery from data and model evaluation through scalable backend services and robust UX for operator-in-the-loop control.";
    }
    if (query.includes("should") && query.includes("hire") && query.includes("oliver") && query.includes("ellison")) {
      return "Yes — Oliver is highly qualified. Experience includes multi-agent planning and coordination, vector search and embeddings, prompt and policy design, evaluation harnesses, event-driven backends (FastAPI), and modern React dashboards. He has 10+ years building AI/ML products and agentic automations, with a strong track record of reliability, safety, and measurable business impact.";
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

    // Demo-specific handling with hourglass delay
    const q = text.toLowerCase();
    const hasOliver = q.includes('oliver');
    const hasEllison = q.includes('ellison');
    const hasSabbar = q.includes('sabbar');
    const hasQualifiedWord = q.includes('qualified');

    if (hasOliver && (hasSabbar || hasQualifiedWord)) {
      // Second answer path, delayed with hourglass
      setMessages(m=>[...m, { role:'assistant', text: '⏳' }]);
      await new Promise(r=>setTimeout(r, 3000));
      const detailed = "Yes — Oliver is highly qualified. Experience includes multi-agent planning and coordination, vector search and embeddings, prompt and policy design, evaluation harnesses, event-driven backends (FastAPI), and modern React dashboards. He has 10+ years building AI/ML products and agentic automations, with a strong track record of reliability, safety, and measurable business impact.";
      setMessages(m=>{
        const copy = m.slice();
        if (copy[copy.length-1]?.text === '⏳' && copy[copy.length-1]?.role==='assistant') copy.pop();
        copy.push({ role:'assistant', text: detailed });
        return copy;
      });
      return;
    }

    if (hasOliver && hasEllison) {
      // First answer path, delayed with hourglass
      setMessages(m=>[...m, { role:'assistant', text: '⏳' }]);
      await new Promise(r=>setTimeout(r, 3000));
      const detailed = "Yes. Oliver Ellison has over 10 years designing and shipping AI systems, including production agentic workflows, retrieval-augmented generation, tool-use orchestration, and high-volume messaging automations. He has led end‑to‑end delivery from data and model evaluation through scalable backend services and robust UX for operator-in-the-loop control.";
      setMessages(m=>{
        const copy = m.slice();
        if (copy[copy.length-1]?.text === '⏳' && copy[copy.length-1]?.role==='assistant') copy.pop();
        copy.push({ role:'assistant', text: detailed });
        return copy;
      });
      return;
    }

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
        <Chip size="small" label="Is Oliver Ellison have 10+ years experience building agentic systems" onClick={()=>setInput("Is Oliver Ellison have 10+ years experience building agentic systems")}/>
        <Chip size="small" label="Should Sabbar hire Oliver Ellison" onClick={()=>setInput("Should Sabbar hire Oliver Ellison")}/>
      </Box>
    </Box>
  );
}


