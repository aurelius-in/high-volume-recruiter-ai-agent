import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, TextField, Typography, Chip } from "@mui/material";
import { useTranslation } from "react-i18next";

const API = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function AskChat(){
  const { t, i18n } = useTranslation();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", text: t('ask.suggestionLine') }
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

  // Update the initial assistant suggestion whenever language changes.
  useEffect(()=>{
    setMessages((cur)=>{
      // If the first message looks like our suggestion, replace it to the current locale
      if (cur.length > 0 && cur[0].role === 'assistant') {
        const rest = cur.slice(1);
        return [{ role:'assistant', text: t('ask.suggestionLine') }, ...rest];
      }
      return [{ role:'assistant', text: t('ask.suggestionLine') }];
    });
  }, [i18n.language, t]);

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

  // Stream from backend /chat/stream via fetch (text/event-stream)
  const streamFromBackend = async (userText) => {
    const history = messages.map(m => ({ role: m.role, content: m.text }));
    const controller = new AbortController();
    setMessages(m=>[...m, { role:'assistant', text: '⏳' }]);
    try {
      const res = await fetch(`${API}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
        body: JSON.stringify({ messages: [...history, { role:'user', content: userText }], include_context: true }),
        signal: controller.signal
      });
      if (!res.ok || !res.body) {
        throw new Error('chat stream failed');
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      let started = false;
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        const parts = acc.split(/\n\n/);
        acc = parts.pop() || '';
        for (const chunk of parts) {
          const lines = chunk.split(/\n/);
          let ev = null; let data = '';
          for (const line of lines) {
            if (line.startsWith('event:')) ev = line.slice(6).trim();
            if (line.startsWith('data:')) data += line.slice(5).trim();
          }
          if (ev === 'chat' && data) {
            setMessages(m=>{
              const copy = m.slice();
              if (!started && copy[copy.length-1]?.text === '⏳' && copy[copy.length-1]?.role==='assistant') {
                copy.pop();
                copy.push({ role:'assistant', text: data });
              } else {
                copy[copy.length-1].text += data;
              }
              started = true;
              return copy;
            });
          } else if (ev === 'done') {
            controller.abort();
            break;
          }
        }
      }
    } catch (e) {
      setMessages(m=>{
        const copy = m.slice();
        if (copy[copy.length-1]?.text === '⏳') copy.pop();
        copy.push({ role:'assistant', text: 'Sorry — the assistant is unavailable right now.' });
        return copy;
      });
    }
  };

  const onSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMessages(m=>[...m, { role:'user', text }]);
    // Prefer backend assistant; fallback to local heuristics if it fails
    try {
      await streamFromBackend(text);
    } catch (e) {
      const reply = await answer(text);
      setMessages(m=>[...m, { role:'assistant', text: reply }]);
    }
  };

  return (
    <Box sx={{ display:'flex', flexDirection:'column', height: 360, bgcolor:'#000', color:'#cfd8d3' }}>
      <Typography variant="subtitle1" sx={{ mb: 1, color:'#cfd8d3' }}>{t('ask.title')}</Typography>
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
          placeholder={t('ask.placeholder')}
          InputLabelProps={{ sx:{ color:'#b0bec5' } }}
          sx={{
            '& .MuiInputBase-root': { bgcolor:'rgba(38,50,56,0.6)', color:'#e0e0e0' },
            '& .MuiOutlinedInput-notchedOutline': { borderColor:'rgba(176,190,197,0.4)' }
          }}
        />
        <Button variant="contained" onClick={onSend} sx={{ bgcolor:'#2e7d32' }}>{t('ops.send')}</Button>
      </div>
      <Box sx={{ mt: 1, display:'flex', gap: 0.5, flexWrap:'wrap' }}>
        <Chip size="small" label={t('ask.suggest1')} onClick={()=>setInput(t('ask.suggest1'))}/>
        <Chip size="small" label={t('ask.suggest2')} onClick={()=>setInput(t('ask.suggest2'))}/>
        <Chip size="small" label={t('ask.suggest3')} onClick={()=>setInput(t('ask.suggest3'))}/>
        <Chip size="small" label={t('ask.suggest4')} onClick={()=>setInput(t('ask.suggest4'))}/>
      </Box>
    </Box>
  );
}


