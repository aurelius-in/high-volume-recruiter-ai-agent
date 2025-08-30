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
  const [jobSearch, setJobSearch] = useState("");
  const [candSearch, setCandSearch] = useState("");

  // Demo data for Audit & Ask replacements (recruiter-facing)
  const recruiterNamePool = [
    // Saudi
    "Abdullah Al‑Harbi","Fatima Al‑Harbi","Yousef Al‑Qahtani","Mona Al‑Otaibi","Khalid Al‑Anazi","Sara Al‑Ghamdi",
    // English
    "Emily Johnson","Michael Smith","David Wilson","Olivia Brown","James Taylor","Emma Moore",
    // Spanish
    "Juan Pérez","María García","Luis Hernández","Lucía Martínez","Carlos Sánchez","Sofía López",
    // Chinese
    "Li Wei","Wang Fang","Zhang Wei","Chen Jie","Liu Yang","Huang Lei"
  ];
  const topRecruiters = Array.from({ length: 30 }).map((_, i) => {
    const name = recruiterNamePool[i % recruiterNamePool.length];
    const hires = 150 - i * 3; // descending, min will still be > 7
    const offerRate = 65 + (i % 20); // 65..84
    const ttf = 7 + (i % 10); // 7..16 days
    const reqs = 5 + (i % 12);
    return { id: `r-${i}`, name, hires, offerRate, ttf, reqs };
  }).sort((a, b) => b.hires - a.hires);

  const matchTitles = [
    // software/AI heavy pay first
    { title: "Director of AI Platform", pay: 290000, currency: "USD", loc: "Remote", tag: "Software" },
    { title: "Director of Engineering", pay: 275000, currency: "USD", loc: "Hybrid", tag: "Software" },
    { title: "Principal Engineer", pay: 245000, currency: "USD", loc: "Seattle, WA", tag: "Software" },
    { title: "Staff Software Engineer", pay: 225000, currency: "USD", loc: "Austin, TX", tag: "Software" },
    { title: "AI Research Engineer", pay: 210000, currency: "USD", loc: "Remote", tag: "Software" },
    { title: "Machine Learning Engineer", pay: 195000, currency: "USD", loc: "San Francisco, CA", tag: "Software" },
    { title: "MLOps Engineer", pay: 185000, currency: "USD", loc: "Remote", tag: "Software" },
    { title: "Backend Engineer (Python/FastAPI)", pay: 175000, currency: "USD", loc: "New York, NY", tag: "Software" },
    { title: "Frontend Engineer (React)", pay: 165000, currency: "USD", loc: "Los Angeles, CA", tag: "Software" },
    { title: "Full‑Stack Engineer", pay: 160000, currency: "USD", loc: "Hybrid", tag: "Software" },
    // general matches
    { title: "Data Engineer", pay: 155000, currency: "USD", loc: "Boston, MA", tag: "Software" },
    { title: "DevOps Engineer", pay: 150000, currency: "USD", loc: "Remote", tag: "Software" },
    { title: "AI Product Manager", pay: 185000, currency: "USD", loc: "Hybrid", tag: "Software" },
    { title: "Product Manager (AI)", pay: 175000, currency: "USD", loc: "Chicago, IL", tag: "Software" },
    { title: "Sales Associate", pay: 26, currency: "USD/hr", loc: "Dallas, TX", tag: "Sales" },
    { title: "Customer Support Specialist", pay: 24, currency: "USD/hr", loc: "Remote", tag: "Customer Service" },
    { title: "Warehouse Picker", pay: 22, currency: "USD/hr", loc: "Memphis, TN", tag: "Warehouse" },
    { title: "Housekeeping Attendant", pay: 18, currency: "USD/hr", loc: "Orlando, FL", tag: "Hospitality" },
    { title: "Security Guard (Unarmed)", pay: 21, currency: "USD/hr", loc: "Phoenix, AZ", tag: "Security" },
    { title: "Assembler (Electronics)", pay: 23, currency: "USD/hr", loc: "Austin, TX", tag: "Manufacturing" },
    { title: "Medical Assistant", pay: 26, currency: "USD/hr", loc: "Atlanta, GA", tag: "Healthcare" },
    { title: "Pharmacy Technician", pay: 25, currency: "USD/hr", loc: "Houston, TX", tag: "Healthcare" },
    { title: "Delivery Driver (Last‑Mile)", pay: 24, currency: "USD/hr", loc: "Dallas, TX", tag: "Logistics" },
    { title: "Data Entry Clerk", pay: 20, currency: "USD/hr", loc: "Remote", tag: "Admin" },
    { title: "Receptionist", pay: 21, currency: "USD/hr", loc: "London, UK", tag: "Admin" },
    { title: "QA Inspector", pay: 24, currency: "USD/hr", loc: "Tijuana, MX", tag: "Manufacturing" },
    { title: "Forklift Operator", pay: 23, currency: "USD/hr", loc: "Memphis, TN", tag: "Warehouse" },
    { title: "Hotel Front Desk", pay: 19, currency: "USD/hr", loc: "Dubai, UAE", tag: "Hospitality" },
    { title: "Barista", pay: 18, currency: "USD/hr", loc: "Seattle, WA", tag: "Hospitality" },
    { title: "Software Engineer I", pay: 130000, currency: "USD", loc: "Hybrid", tag: "Software" },
    { title: "Software Engineer II", pay: 150000, currency: "USD", loc: "Remote", tag: "Software" }
  ].slice(0, 30).sort((a, b) => (b.pay - a.pay));

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
                      color: '#cfd8d3', fontWeight: 800, fontSize: '0.82rem', lineHeight: 1.1, py: 0.85, borderRadius: '12px',
                      border: '1px solid rgba(255,190,100,0.7)',
                      background: 'linear-gradient(180deg, rgba(15,15,15,0.95) 0%, rgba(0,0,0,0.95) 60%), repeating-linear-gradient(135deg, rgba(255,180,0,0.15) 0 6px, rgba(0,0,0,0) 6px 12px)',
                      boxShadow: '0 0 12px rgba(255,170,0,0.35), 0 6px 16px rgba(0,0,0,0.7), inset 0 0 12px rgba(255,170,0,0.22)',
                      '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 0 16px rgba(255,170,0,0.45), 0 10px 20px rgba(0,0,0,0.75), inset 0 0 14px rgba(255,170,0,0.28)'}
                    }}>{t("createJob")}</Button>
                    <Button onClick={seedOutreach} fullWidth variant="contained" sx={{
                      color: '#cfd8d3', fontWeight: 800, fontSize: '0.82rem', lineHeight: 1.1, py: 0.85, borderRadius: '12px',
                      border: '1px solid rgba(255,190,100,0.7)',
                      background: 'linear-gradient(180deg, rgba(15,15,15,0.95) 0%, rgba(0,0,0,0.95) 60%), repeating-linear-gradient(135deg, rgba(255,180,0,0.15) 0 6px, rgba(0,0,0,0) 6px 12px)',
                      boxShadow: '0 0 12px rgba(255,170,0,0.35), 0 6px 16px rgba(0,0,0,0.7), inset 0 0 12px rgba(255,170,0,0.22)',
                      '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 0 16px rgba(255,170,0,0.45), 0 10px 20px rgba(0,0,0,0.75), inset 0 0 14px rgba(255,170,0,0.28)'}
                    }}>{t("simulateOutreach")}</Button>
                    <Button onClick={runFlow} fullWidth variant="contained" sx={{
                      color: '#cfd8d3', fontWeight: 800, fontSize: '0.82rem', lineHeight: 1.1, py: 0.85, borderRadius: '12px',
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
              <Paper sx={{ pt: 0, pb: 1, px: 1, bgcolor: 'rgba(0,0,0,0.55)', border: '1px solid rgba(183,28,28,0.35)', width: 'calc(100% - 20px)' }}>
                <Typography variant="subtitle1" sx={{ fontSize: 16, mb: 0.25 }}>{t("capacity") || "Capacity"}</Typography>
                <Box sx={{ mt: 0 }}>
                  <CapacityGauge />
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ pt: 0, pb: 1, pl: 3, pr: 1, bgcolor: 'rgba(0,0,0,0.55)', border: '1px solid rgba(46,125,50,0.35)', ml: '-20px', width: 'calc(100% + 20px)' }}>
                <Typography variant="subtitle1" sx={{ fontSize: 16, mb: 0.25, color:'#cfd8d3' }}>{t('hireFunnel')}</Typography>
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
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 1, mb: 1, bgcolor: 'rgba(0,0,0,0.55)', border: '1px solid rgba(46,125,50,0.35)' }}>
                <TextField fullWidth size="small" placeholder={t('searchJobsPlaceholder')}
                  value={jobSearch} onChange={(e)=>setJobSearch(e.target.value)}
                  InputProps={{ sx:{ color:'#e0e0e0' } }}
                />
              </Paper>
              <JobsList searchTerm={jobSearch} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 1, mb: 1, bgcolor: 'rgba(0,0,0,0.55)', border: '1px solid rgba(46,125,50,0.35)' }}>
                <TextField fullWidth size="small" placeholder={t('searchCandidatesPlaceholder')}
                  value={candSearch} onChange={(e)=>setCandSearch(e.target.value)}
                  InputProps={{ sx:{ color:'#e0e0e0' } }}
                />
              </Paper>
              <CandidatesList searchTerm={candSearch} />
            </Grid>
          </Grid>
        </Box>
      )}

      {tab === 2 && (
        <Box>
          <Grid container spacing={1.25}>
            <Grid item xs={12} md={6}>
              <Grid container spacing={1.25}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: '#000', color:'#e3d6c9', border: '1px solid rgba(46,125,50,0.4)' }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ color:'#e3d6c9' }}>{t('topRecruiters')}</Typography>
                    <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                      <ul style={{ margin:0, paddingLeft: 16 }}>
                        {topRecruiters.map(r => (
                          <li key={r.id} style={{ marginBottom: 8 }}>
                            <div style={{ fontWeight: 700 }}>{r.name} — {t('labels.hires')}: {r.hires}</div>
                            <div style={{ opacity: 0.9, fontSize: 12 }}>{t('labels.offers')}: {r.offerRate}% • {t('labels.ttf')}: {r.ttf}d • {t('labels.openReqs')}: {r.reqs}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: '#000', color:'#a9bcb2', border: '1px solid rgba(46,125,50,0.4)' }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ color:'#a9bcb2' }}>{t('topMatches')}</Typography>
                    <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                      <ul style={{ margin:0, paddingLeft: 16 }}>
                        {matchTitles.map((m, idx) => (
                          <li key={`m-${idx}`} style={{ marginBottom: 8 }}>
                            <div style={{ fontWeight: 700 }}>{m.title} — {m.currency.includes('hr') ? `$${m.pay}/${m.currency.split('/')[1]}` : `$${m.pay.toLocaleString()} ${m.currency}`}</div>
                            <div style={{ opacity: 0.9, fontSize: 12 }}>{t('labels.domain')}: {m.tag} • {t('labels.location')}: {m.loc}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, bgcolor: '#000', color:'#cfd8d3', border: '1px solid rgba(46,125,50,0.4)' }}>
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


