import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Grid, Paper, Typography, Button, TextField, Snackbar, Alert, Switch, FormControlLabel, Skeleton, Chip } from "@mui/material";
import Simulator from "./Simulator.jsx";
import FunnelChart from "./components/FunnelChart.jsx";
import TimezoneFooter from "./components/TimezoneFooter.jsx";
import OpsConsole from "./components/OpsConsole.jsx";
import { useEventStream } from "./hooks/useEventStream.js";
import AuthGate from "./components/AuthGate.jsx";
import { JobsList, CandidatesList } from "./components/Lists.jsx";
import ReplayModal from "./components/ReplayModal.jsx";
import PolicyDialog from "./components/PolicyDialog.jsx";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useTranslation } from "react-i18next";

const API = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function App() {
  const { t, i18n } = useTranslation();
  const [kpi, setKpi] = useState(null);
  const [audit, setAudit] = useState([]);
  const [jobId, setJobId] = useState("");
  const [funnel, setFunnel] = useState(null);
  const [replayOpen, setReplayOpen] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [health, setHealth] = useState(null);
  const [locale, setLocale] = useState(import.meta.env.VITE_LOCALE || "en");

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
      setToast({ open: true, message: t("outreachSeeded") || "Outreach seeded", severity: "success" });
    } catch (e) {
      setToast({ open: true, message: t("outreachFailed") || "Outreach failed", severity: "error" });
    }
  };

  const runFlow = async () => {
    if (!jobId) return;
    try {
      await axios.post(`${API}/simulate/flow?job_id=${jobId}`);
      await refresh();
      setToast({ open: true, message: t("flowExecuted") || "Flow executed", severity: "success" });
    } catch (e) {
      setToast({ open: true, message: t("flowFailed") || "Flow failed", severity: "error" });
    }
  };

  return (
    <Container sx={{ py: 4, bgcolor: dark ? '#111' : undefined, color: dark ? '#eee' : undefined }}>
      <AuthGate>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" gutterBottom>{t("title")}</Typography>
        <div>
          {health && (
            <Chip size="small" label={t("systemOk")} color={'success'} sx={{ mr: 1 }} />
          )}
          <FormControlLabel control={<Switch checked={dark} onChange={e=>setDark(e.target.checked)} />} label={t("dark")} />
          <Button size="small" onClick={()=>setPolicyOpen(true)}>{t("viewPolicy")}</Button>
          <select style={{ marginLeft: 8 }} value={locale} onChange={(e)=>setLocale(e.target.value)}>
            <option value="en">EN</option>
            <option value="es">ES</option>
            <option value="ar">AR</option>
            <option value="zh">中文</option>
          </select>
        </div>
      </div>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>{t("kpiTiles")}</Typography>
            {kpi ? (
              <Grid container spacing={2}>
                {Object.entries(kpi).map(([k, v]) => (
                  <Grid item key={k}>
                    <Paper sx={{ p: 2, minWidth: 160 }}>
                      <Typography variant="caption">{k.replaceAll("_", " ")}</Typography>
                      <Typography variant="h6">{v}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Grid container spacing={2}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Grid item key={i}>
                    <Paper sx={{ p: 2, minWidth: 160 }}>
                      <Skeleton variant="text" width={120} />
                      <Skeleton variant="text" width={80} height={32} />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>{t("funnel")}</Typography>
            {funnel ? (
              <FunnelChart data={funnel} />
            ) : (
              <Skeleton variant="rectangular" height={200} />
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>{t("opsConsole")}</Typography>
            <OpsConsole />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>{t("controls")}</Typography>
            <Button onClick={createJob} variant="contained" sx={{ mr: 1 }}>{t("createJob")}</Button>
            <Button onClick={seedOutreach} variant="outlined" sx={{ mr: 1 }}>{t("simulateOutreach")}</Button>
            <Button onClick={runFlow} variant="text">{t("runFlow")}</Button>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>Job ID: {jobId || "(create a job)"}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>{t("auditTrail")}</Typography>
            <div style={{ maxHeight: 300, overflow: "auto", fontFamily: "ui-monospace, SFMono-Regular" }}>
              {audit.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#777' }}>{t("noActivity")}</Typography>
              ) : (
                audit.slice().reverse().map(e => {
                  const icon = e.actor === 'agent' ? '🤖' : e.actor === 'candidate' ? '👤' : e.actor === 'system' ? '🛠️' : '🔹';
                  return (
                  <div key={e.id} title={e.hash || ""}>
                    <b>{new Date(e.ts * 1000).toLocaleTimeString()}</b> — <i>{e.actor}</i> {icon} :: <code>{e.action}</code>
                    {e.payload?.locale === 'ar' && (
                      <span style={{ marginLeft: 8, padding: '2px 6px', background: '#eee', borderRadius: 4, fontSize: 12 }}>AR</span>
                    )}
                    {typeof e.payload?.cost_usd === 'number' && (
                      <span style={{ marginLeft: 8, color: '#555' }}>${e.payload.cost_usd.toFixed(3)}</span>
                    )}
                    {e.payload?.compliance && (
                      <span style={{ marginLeft: 8, color: e.payload.compliance.ok ? 'green' : 'crimson' }}>
                        policy:{e.payload.compliance.ok ? 'ok' : 'violation'}
                      </span>
                    )}
                  </div>
                )})
              )}
            </div>
            <Button size="small" sx={{ mt: 1 }} onClick={()=>setReplayOpen(true)}>Replay</Button>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>{t("hiringSimulator")}</Typography>
            <Simulator />
          </Paper>
        </Grid>
      </Grid>
      <Grid container spacing={2} sx={{ mt: 0 }}>
        <Grid item xs={12} md={6}><JobsList /></Grid>
        <Grid item xs={12} md={6}><CandidatesList /></Grid>
      </Grid>
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


