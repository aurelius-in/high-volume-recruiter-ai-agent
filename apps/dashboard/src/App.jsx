import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Grid, Paper, Typography, Button, TextField, Snackbar, Alert, Switch, FormControlLabel, Skeleton, Chip, Tabs, Tab, Box } from "@mui/material";
import Simulator from "./Simulator.jsx";
import FunnelChart from "./components/FunnelChart.jsx";
import TimezoneFooter from "./components/TimezoneFooter.jsx";
import OpsConsole from "./components/OpsConsole.jsx";
import { useEventStream } from "./hooks/useEventStream.js";
import AuthGate from "./components/AuthGate.jsx";
import { JobsList, CandidatesList } from "./components/Lists.jsx";
import ReplayModal from "./components/ReplayModal.jsx";
import PolicyDialog from "./components/PolicyDialog.jsx";
import { useTranslation } from "react-i18next";
import KpiGrid from "./components/KpiGrid.jsx";

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
    setKpi(k.data);
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
        title: "Retail Associate",
        location: "Jeddah",
        shift: "Night",
        reqs: ["Arabic or English", "18+", "High school"]
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
      py: 4,
      minHeight: '100vh',
      bgcolor: '#0b0d0b',
      color: '#e0e0e0',
      backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(13,71,20,0.25), transparent 300px), radial-gradient(circle at 80% 30%, rgba(183,28,28,0.15), transparent 260px)'
    }}>
      <AuthGate>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#000', padding: '10px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/hirefalcon.png" alt="HIRE FALCON" style={{ height: 70 }} />
          <Typography variant="h6" sx={{ letterSpacing: 1.2 }}>HIRE FALCON</Typography>
        </div>
        <div>
          {health && (
            <Chip size="small" label={t("systemOk")} sx={{ mr: 1, bgcolor: 'rgba(46,125,50,0.3)', color: '#e8f5e9', border: '1px solid rgba(46,125,50,0.6)' }} />
          )}
          {/* Dark mode is always on; toggle removed */}
          <Button size="small" onClick={()=>setPolicyOpen(true)} sx={{ color: '#e0e0e0' }}>{t("viewPolicy")}</Button>
          <select style={{ marginLeft: 8, background: '#000', color: '#e0e0e0', border: '1px solid rgba(46,125,50,0.4)', borderRadius: 6, padding: '4px 6px' }} value={locale} onChange={(e)=>setLocale(e.target.value)}>
            <option value="en">EN</option>
            <option value="es">ES</option>
            <option value="ar">AR</option>
            <option value="zh">中文</option>
          </select>
        </div>
      </div>

      <Paper sx={{ px: 2, pt: 1, mb: 2, bgcolor: 'rgba(0,0,0,0.6)', border: '1px solid rgba(46,125,50,0.4)' }}>
        <Tabs value={tab} onChange={(_,v)=>setTab(v)} aria-label="workflow tabs" variant="scrollable" scrollButtons="auto"
          TabIndicatorProps={{ sx: { height: 4, backgroundColor: 'rgba(46,125,50,0.9)', boxShadow: '0 0 12px rgba(46,125,50,0.8)' } }}>
          <Tab label={t("outreachTab")} sx={{ color: '#e0e0e0',
            mx: 1,
            borderRadius: 2,
            border: '1px solid rgba(46,125,50,0.5)',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.7), rgba(13,71,20,0.5))',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 16px rgba(0,0,0,0.35)'
          }} />
          <Tab label={t("qualificationTab")} sx={{ color: '#e0e0e0',
            mx: 1,
            borderRadius: 2,
            border: '1px solid rgba(183,28,28,0.5)',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.7), rgba(183,28,28,0.4))',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 16px rgba(0,0,0,0.35)'
          }} />
          <Tab label={t("auditTab")} sx={{ color: '#e0e0e0',
            mx: 1,
            borderRadius: 2,
            border: '1px solid rgba(46,125,50,0.5)',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.7), rgba(13,71,20,0.5))',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 16px rgba(0,0,0,0.35)'
          }} />
        </Tabs>
      </Paper>

      {tab === 0 && (
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.55)', border: '1px solid rgba(183,28,28,0.35)' }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontFamily: "'Amiri','Cairo', serif", fontSize: 20 }}>{t("kpiTiles")}</Typography>
                {kpi ? (
                  <KpiGrid data={kpi} />
                ) : (
                  <Grid container spacing={2}>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Grid item key={i}>
                        <Paper sx={{ p: 2, minWidth: 160, bgcolor: 'rgba(0,0,0,0.6)', border: '1px solid rgba(46,125,50,0.2)' }}>
                          <Skeleton variant="text" width={120} />
                          <Skeleton variant="text" width={80} height={32} />
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.55)', border: '1px solid rgba(46,125,50,0.35)' }}>
                <Typography variant="subtitle1" gutterBottom>{t("controls")}</Typography>
                <Button onClick={createJob} variant="contained" sx={{ mr: 1, bgcolor: 'rgba(46,125,50,0.8)' }}>{t("createJob")}</Button>
                <Button onClick={seedOutreach} variant="outlined" sx={{ mr: 1, color: '#e0e0e0', borderColor: 'rgba(183,28,28,0.6)' }}>{t("simulateOutreach")}</Button>
                <Button onClick={runFlow} variant="text" sx={{ color: '#e0e0e0' }}>{t("runFlow")}</Button>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>Job ID: {jobId || "(create a job)"}</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.55)', border: '1px solid rgba(46,125,50,0.35)' }}>
                <Typography variant="subtitle1" gutterBottom>{t("funnel")}</Typography>
                {funnel ? (
                  <FunnelChart data={funnel} />
                ) : (
                  <Skeleton variant="rectangular" height={200} />
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.55)', border: '1px solid rgba(183,28,28,0.35)' }}>
                <Typography variant="subtitle1" gutterBottom>{t("opsConsole")}</Typography>
                <OpsConsole />
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {tab === 1 && (
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}><JobsList /></Grid>
            <Grid item xs={12} md={6}><CandidatesList /></Grid>
          </Grid>
          <Paper sx={{ p: 2, mt: 2, bgcolor: 'rgba(0,0,0,0.6)', border: '1px solid rgba(46,125,50,0.4)' }}>
            <Typography variant="subtitle1" gutterBottom>{t("qualificationTab")}</Typography>
            <Typography variant="body2" sx={{ color: '#a5d6a7', mb: 1 }}>Use Ops Console to propose/confirm schedules, or send messages for consent.</Typography>
            <OpsConsole />
          </Paper>
        </Box>
      )}

      {tab === 2 && (
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.6)', border: '1px solid rgba(46,125,50,0.4)' }}>
                <Typography variant="subtitle1" gutterBottom>{t("auditTrail")}</Typography>
                <div style={{ maxHeight: 300, overflow: "auto", fontFamily: "ui-monospace, SFMono-Regular" }}>
                  {audit.length === 0 ? (
                    <Typography variant="body2" sx={{ color: '#9e9e9e' }}>{t("noActivity")}</Typography>
                  ) : (
                    audit.slice().reverse().map(e => {
                      const icon = e.actor === 'agent' ? '🤖' : e.actor === 'candidate' ? '👤' : e.actor === 'system' ? '🛠️' : '🔹';
                      return (
                      <div key={e.id} title={e.hash || ""}>
                        <b>{new Date(e.ts * 1000).toLocaleTimeString()}</b> — <i>{e.actor}</i> {icon} :: <code>{e.action}</code>
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
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.6)', border: '1px solid rgba(46,125,50,0.4)' }}>
                <Typography variant="subtitle1" gutterBottom>{t("hiringSimulator")}</Typography>
                <Simulator />
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      <TimezoneFooter />
      <ReplayModal open={replayOpen} onClose={()=>setReplayOpen(false)} events={audit} />
      <PolicyDialog open={policyOpen} onClose={()=>setPolicyOpen(false)} />
      <Snackbar open={toast.open} autoHideDuration={2000} onClose={()=>setToast({...toast, open:false})}>
        <Alert severity={toast.severity} onClose={()=>setToast({...toast, open:false})}>{toast.message}</Alert>
      </Snackbar>
      </AuthGate>
    </Container>
  );
}


