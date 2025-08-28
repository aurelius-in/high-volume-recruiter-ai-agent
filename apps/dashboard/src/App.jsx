import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Grid, Paper, Typography, Button, TextField, Snackbar, Alert, Switch, FormControlLabel, Skeleton, Chip, Tabs, Tab, Box } from "@mui/material";
import Simulator from "./Simulator.jsx";
import AskChat from "./components/AskChat.jsx";
import FunnelChart from "./components/FunnelChart.jsx";
import TimezoneFooter from "./components/TimezoneFooter.jsx";
import OpsConsole from "./components/OpsConsole.jsx";
import { useEventStream } from "./hooks/useEventStream.js";
import AuthGate from "./components/AuthGate.jsx";
import { JobsList, CandidatesList } from "./components/Lists.jsx";
import ReplayModal from "./components/ReplayModal.jsx";
import { useTranslation } from "react-i18next";
import KpiGrid from "./components/KpiGrid.jsx";
import CapacityGauge from "./components/CapacityGauge.jsx";
import SlaHeatmap from "./components/SlaHeatmap.jsx";

const API = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function App() {
  const { t, i18n } = useTranslation();
  const [kpi, setKpi] = useState(null);
  const [audit, setAudit] = useState([]);
  const [jobId, setJobId] = useState("");
  const [funnel, setFunnel] = useState(null);
  const [replayOpen, setReplayOpen] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [dark, setDark] = useState(true);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [health, setHealth] = useState(null);
  const [locale, setLocale] = useState(import.meta.env.VITE_LOCALE || "en");
  const [tab, setTab] = useState(0);

  const refresh = async () => {
    const h = await axios.get(`${API}/health`);
    setHealth(h.data);
    const k = await axios.get(`${API}/kpi`);
    setKpi({ ...k.data, active_candidates: k.data?.active_candidates || 12483 });
    const a = await axios.get(`${API}/audit`);
    setAudit(a.data.events);
    const f = await axios.get(`${API}/funnel`);
    setFunnel(f.data);
  };

  useEffect(() => {
    const tmr = setInterval(refresh, 1000);
    return () => clearInterval(tmr);
  }, []);

  useEffect(() => { i18n.changeLanguage(locale); }, [locale, i18n]);

  useEventStream(`${API}/events/stream`, (evt) => {
    if (evt.type === "audit") {
      setAudit((cur) => [...cur, evt.data].slice(-250));
    }
  });

  const createJob = async () => {
    try {
      const res = await axios.post(`${API}/jobs`, {
        title: "Store Associate",
        location: "Dallas",
        shift: "Morning",
        reqs: ["English or Arabic OK", "18+", "High school diploma"]
      });
      setJobId(res.data.job_id);
    } catch (e) {
      setToast({ open: true, message: t("errorCreateJob") || "Failed to create job", severity: "error" });
    }
  };

  const seedOutreach = async () => {
    if (!jobId) return;
    try {
      await axios.post(`${API}/simulate/outreach?job_id=${jobId}`);
      setToast({ open: true, message: t("outreachSeeded") || "Outreach started", severity: "success" });
    } catch (e) {
      setToast({ open: true, message: t("outreachFailed") || "Outreach failed", severity: "error" });
    }
  };

  const runFlow = async () => {
    if (!jobId) return;
    try {
      await axios.post(`${API}/simulate/flow?job_id=${jobId}`);
      await refresh();
      setToast({ open: true, message: t("flowExecuted") || "Automation executed", severity: "success" });
    } catch (e) {
      setToast({ open: true, message: t("flowFailed") || "Automation failed", severity: "error" });
    }
  };

  return (
    <Container disableGutters maxWidth={false} sx={{
      py: 2,
      minHeight: '100vh',
      bgcolor: '#0b0d0b',
      color: '#e0e0e0',
      backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(13,71,20,0.25), transparent 300px), radial-gradient(circle at 80% 30%, rgba(183,28,28,0.15), transparent 260px)'
    }}>
      <AuthGate>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#000', padding: '6px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <img src="/hirefalcon.png" alt="HIRE FALCON" style={{ height: 58 }} />
          <div>
            <Tabs value={tab} onChange={(_,v)=>setTab(v)} aria-label="workflow tabs" variant="scrollable" scrollButtons="auto"
              TabIndicatorProps={{ sx: { height: 4, backgroundColor: 'rgba(46,125,50,0.9)', boxShadow: '0 0 12px rgba(46,125,50,0.8)' } }}>
              <Tab label={t("outreachTab")} sx={{ color: tab===0?'#ffeb3b':'#cfd8dc',
                mx: 0.5,
                borderRadius: 2,
                minWidth: 160,
                height: 44,
                fontSize: '0.95rem',
                fontWeight: 700,
                border: tab===0?'1px solid rgba(46,125,50,0.7)':'1px solid rgba(46,125,50,0.3)',
                background: tab===0?'linear-gradient(180deg, rgba(0,0,0,0.7), rgba(46,125,50,0.5))':'linear-gradient(180deg, rgba(0,0,0,0.6), rgba(38,50,56,0.4))',
                textDecoration: 'none',
                '&.Mui-selected': { color: '#ffeb3b !important' }
              }} />
              <Tab label={t("qualificationTab")} sx={{ color: tab===1?'#ffeb3b':'#cfd8dc',
                mx: 0.5,
                borderRadius: 2,
                minWidth: 160,
                height: 44,
                fontSize: '0.95rem',
                fontWeight: 700,
                border: tab===1?'1px solid rgba(46,125,50,0.7)':'1px solid rgba(46,125,50,0.3)',
                background: tab===1?'linear-gradient(180deg, rgba(0,0,0,0.7), rgba(46,125,50,0.5))':'linear-gradient(180deg, rgba(0,0,0,0.6), rgba(38,50,56,0.4))',
                textDecoration: 'none',
                '&.Mui-selected': { color: '#ffeb3b !important' }
              }} />
              <Tab label={t("auditTab")} sx={{ color: tab===2?'#ffeb3b':'#cfd8dc',
                mx: 0.5,
                borderRadius: 2,
                minWidth: 160,
                height: 44,
                fontSize: '0.95rem',
                fontWeight: 700,
                border: tab===2?'1px solid rgba(46,125,50,0.7)':'1px solid rgba(46,125,50,0.3)',
                background: tab===2?'linear-gradient(180deg, rgba(0,0,0,0.7), rgba(46,125,50,0.5))':'linear-gradient(180deg, rgba(0,0,0,0.6), rgba(38,50,56,0.4))',
                textDecoration: 'none',
                '&.Mui-selected': { color: '#ffeb3b !important' }
              }} />
            </Tabs>
          </div>
        </div>
        <div>
          {health && (
            <Chip size="small" label={t("systemOk")} sx={{ mr: 1, bgcolor: 'rgba(46,125,50,0.3)', color: '#e8f5e9', border: '1px solid rgba(46,125,50,0.6)' }} />
          )}
          {/* Dark mode is always on; toggle removed */}
          <select style={{ marginLeft: 8, background: '#000', color: '#e0e0e0', border: '1px solid rgba(46,125,50,0.4)', borderRadius: 6, padding: '4px 6px' }} value={locale} onChange={(e)=>setLocale(e.target.value)}>
            <option value="en">English</option>
            <option value="ar">العربية</option>
            <option value="zh">中文</option>
          </select>
        </div>
      </div>


      {tab === 0 && (
        <Box>
          <Grid container spacing={1.25}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ pt: 0.5, pb: 1, px: 1.25, bgcolor: 'rgba(0,0,0,0.55)', border: '1px solid rgba(183,28,28,0.35)' }}>
                <Typography variant="subtitle1" sx={{ fontFamily: "'Amiri','Cairo', serif", fontSize: 14, mb: 0.25 }}>{t("kpiTiles")}</Typography>
                <Box sx={{ mb: 0.75 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
                    <Button onClick={createJob} fullWidth variant="contained" sx={{
                      color: '#fff', fontWeight: 800, fontSize: '0.82rem', lineHeight: 1.1, py: 0.85, borderRadius: '12px',
                      border: '1px solid rgba(255,190,100,0.7)',
                      background: 'linear-gradient(180deg, rgba(15,15,15,0.95) 0%, rgba(0,0,0,0.95) 60%), repeating-linear-gradient(135deg, rgba(255,180,0,0.15) 0 6px, rgba(0,0,0,0) 6px 12px)',
                      boxShadow: '0 0 12px rgba(255,170,0,0.35), 0 6px 16px rgba(0,0,0,0.7), inset 0 0 12px rgba(255,170,0,0.22)',
                      '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 0 16px rgba(255,170,0,0.45), 0 10px 20px rgba(0,0,0,0.75), inset 0 0 14px rgba(255,170,0,0.28)'}
                    }}>{t("createJob")}</Button>
                    <Button onClick={seedOutreach} fullWidth variant="contained" sx={{
                      color: '#fff', fontWeight: 800, fontSize: '0.82rem', lineHeight: 1.1, py: 0.85, borderRadius: '12px',
                      border: '1px solid rgba(255,190,100,0.7)',
                      background: 'linear-gradient(180deg, rgba(15,15,15,0.95) 0%, rgba(0,0,0,0.95) 60%), repeating-linear-gradient(135deg, rgba(255,180,0,0.15) 0 6px, rgba(0,0,0,0) 6px 12px)',
                      boxShadow: '0 0 12px rgba(255,170,0,0.35), 0 6px 16px rgba(0,0,0,0.7), inset 0 0 12px rgba(255,170,0,0.22)',
                      '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 0 16px rgba(255,170,0,0.45), 0 10px 20px rgba(0,0,0,0.75), inset 0 0 14px rgba(255,170,0,0.28)'}
                    }}>{t("simulateOutreach")}</Button>
                    <Button onClick={runFlow} fullWidth variant="contained" sx={{
                      color: '#fff', fontWeight: 800, fontSize: '0.82rem', lineHeight: 1.1, py: 0.85, borderRadius: '12px',
                      border: '1px solid rgba(255,190,100,0.7)',
                      background: 'linear-gradient(180deg, rgba(15,15,15,0.95) 0%, rgba(0,0,0,0.95) 60%), repeating-linear-gradient(135deg, rgba(255,180,0,0.15) 0 6px, rgba(0,0,0,0) 6px 12px)',
                      boxShadow: '0 0 12px rgba(255,170,0,0.35), 0 6px 16px rgba(0,0,0,0.7), inset 0 0 12px rgba(255,170,0,0.22)',
                      '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 0 16px rgba(255,170,0,0.45), 0 10px 20px rgba(0,0,0,0.75), inset 0 0 14px rgba(255,170,0,0.28)'}
                    }}>{t("runFlow")}</Button>
                  </div>
                  {jobId && (
                    <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>Job ID: {jobId}</Typography>
                  )}
                </Box>
                {kpi ? (
                  <KpiGrid data={kpi} />
                ) : (
                  <Grid container spacing={1}>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Grid item key={i}>
                        <Paper sx={{ p: 1.25, minWidth: 140, bgcolor: 'rgba(0,0,0,0.6)', border: '1px solid rgba(46,125,50,0.2)' }}>
                          <Skeleton variant="text" width={100} height={16} />
                          <Skeleton variant="text" width={70} height={24} />
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ pt: 0.5, pb: 1, px: 1.25, bgcolor: 'rgba(0,0,0,0.55)', border: '1px solid rgba(46,125,50,0.35)' }}>
                <Typography variant="subtitle1" sx={{ fontSize: 14, mb: 0.25 }}>{t("controls")}</Typography>
                <div style={{ marginTop: 6 }}>
                  <OpsConsole />
                </div>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ pt: 0, pb: 1, px: 1, bgcolor: 'rgba(0,0,0,0.55)', border: '1px solid rgba(46,125,50,0.35)' }}>
                <Box sx={{ mt: 0 }}>
                  <SlaHeatmap />
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ pt: 0, pb: 1, px: 1, bgcolor: 'rgba(0,0,0,0.55)', border: '1px solid rgba(183,28,28,0.35)' }}>
                <Typography variant="subtitle1" sx={{ fontSize: 16, mb: 0.25 }}>{t("capacity") || "Capacity"}</Typography>
                <Box sx={{ mt: 0 }}>
                  <CapacityGauge />
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ pt: 0, pb: 1, px: 1, bgcolor: 'rgba(0,0,0,0.55)', border: '1px solid rgba(46,125,50,0.35)' }}>
                <Typography variant="subtitle1" sx={{ fontSize: 16, mb: 0.25 }}>{t("funnel")}</Typography>
                {funnel ? (
                  <FunnelChart data={funnel} />
                ) : (
                  <Skeleton variant="rectangular" height={160} />
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {tab === 1 && (
        <Box>
          <Grid container spacing={1.25}>
            <Grid item xs={12} md={6}><JobsList /></Grid>
            <Grid item xs={12} md={6}><CandidatesList /></Grid>
          </Grid>
          <Paper sx={{ p: 2, mt: 1.25, bgcolor: '#000', color:'#fff', border: '1px solid rgba(46,125,50,0.4)' }}>
            <Typography variant="subtitle1" gutterBottom sx={{ color:'#fff' }}>{t("qualificationTab")}</Typography>
            <Typography variant="body2" sx={{ color: '#cfd8dc', mb: 1 }}>Use Ops Console to propose/confirm schedules, or send messages for consent.</Typography>
            <OpsConsole />
          </Paper>
        </Box>
      )}

      {tab === 2 && (
        <Box>
          <Grid container spacing={1.25}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, bgcolor: '#000', color:'#fff', border: '1px solid rgba(46,125,50,0.4)' }}>
                <Typography variant="subtitle1" gutterBottom sx={{ color:'#fff' }}>{t("auditTrail")}</Typography>
                <div style={{ maxHeight: 300, overflow: "auto", fontFamily: "ui-monospace, SFMono-Regular", color:'#e0e0e0' }}>
                  {audit.length === 0 ? (
                    <Typography variant="body2" sx={{ color: '#bdbdbd' }}>{t("noActivity")}</Typography>
                  ) : (
                    audit.slice().reverse().map(e => {
                      const icon = e.actor === 'agent' ? '🤖' : e.actor === 'candidate' ? '👤' : e.actor === 'system' ? '🛠️' : '🔹';
                      return (
                      <div key={e.id} title={e.hash || ""}>
                        <b style={{ color:'#fff', fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, "Noto Sans", Arial, Helvetica, "Apple Color Emoji", "Segoe UI Emoji"' }}>{new Date(e.ts * 1000).toLocaleTimeString()}</b> — <i style={{ color:'#e0e0e0', fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, "Noto Sans", Arial, Helvetica, "Apple Color Emoji", "Segoe UI Emoji"', fontStyle: 'italic' }}>{e.actor}</i> {icon} :: <code style={{ color:'#cfd8dc' }}>{e.action}</code>
                        {e.payload?.locale === 'ar' && (
                          <span style={{ marginLeft: 8, padding: '2px 6px', background: '#263238', borderRadius: 4, fontSize: 12, color: '#e0e0e0' }}>AR</span>
                        )}
                        {typeof e.payload?.cost_usd === 'number' && (
                          <span style={{ marginLeft: 8, color: '#bdbdbd' }}>${e.payload.cost_usd.toFixed(3)}</span>
                        )}
                        {e.payload?.compliance && (
                          <span style={{ marginLeft: 8, color: e.payload.compliance.ok ? '#66bb6a' : '#ef5350' }}>
                            policy:{e.payload.compliance.ok ? 'ok' : 'violation'}
                          </span>
                        )}
                      </div>
                    )})
                  )}
                </div>
                <Button size="small" sx={{ mt: 1, color: '#e0e0e0' }} onClick={()=>setReplayOpen(true)}>Replay</Button>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, bgcolor: '#000', color:'#fff', border: '1px solid rgba(46,125,50,0.4)' }}>
                <Typography variant="subtitle1" gutterBottom sx={{ color:'#fff' }}>Ask Anything</Typography>
                <AskChat />
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      <TimezoneFooter />
      <ReplayModal open={replayOpen} onClose={()=>setReplayOpen(false)} events={audit} />
      <Snackbar open={toast.open} autoHideDuration={2000} onClose={()=>setToast({...toast, open:false})}>
        <Alert severity={toast.severity} onClose={()=>setToast({...toast, open:false})}>{toast.message}</Alert>
      </Snackbar>
      </AuthGate>
    </Container>
  );
}


