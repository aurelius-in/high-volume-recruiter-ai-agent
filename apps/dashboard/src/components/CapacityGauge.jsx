import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const API = import.meta.env.VITE_API_BASE || "http://localhost:8000";

function Radial({ confirmed, available }){
  const pct = available ? Math.min(1, confirmed / available) : 0;
  const size = 120;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * pct;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} stroke="#263238" strokeWidth={stroke} fill="none" />
      <circle cx={size/2} cy={size/2} r={r} stroke="#2e7d32" strokeWidth={stroke} fill="none"
        strokeDasharray={`${dash} ${c-dash}`} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#e0e0e0" fontSize="20" fontWeight="700">{Math.round(pct*100)}%</text>
    </svg>
  );
}

export default function CapacityGauge(){
  const [data, setData] = useState(null);
  const { t } = useTranslation();
  const handleAutoPack = async () => {
    try {
      await fetch(`${API}/actions/auto-pack-slots`, { method: 'POST' });
    } catch (e) { /* ignore demo errors */ }
    setData(prev => {
      const todayPrev = (prev && prev.today) ? prev.today : { available: 160, held: 120, confirmed: 109, no_show_forecast: 0.21 };
      const available = todayPrev.available || 160;
      const confirmed = todayPrev.confirmed || 0;
      const delta = Math.max(1, Math.round((available - confirmed) * 0.3)); // pack ~30% of remaining
      const nextConfirmed = Math.min(available, confirmed + delta);
      const nextHeld = Math.max(todayPrev.held || 0, nextConfirmed);
      return { ...(prev || {}), today: { ...todayPrev, confirmed: nextConfirmed, held: nextHeld } };
    });
  };
  useEffect(()=>{
    (async ()=>{
      try{
        const res = await fetch(`${API}/metrics/capacity`);
        const j = await res.json();
        setData(j);
      }catch(e){ setData(null); }
    })();
  },[]);

  if(!data){
    return <div style={{ height: 160, color: '#9e9e9e' }}>Loading…</div>;
  }

  const today = (data && typeof data === 'object' && data.today) ? data.today : { available: 160, held: 120, confirmed: 109, no_show_forecast: 0.21 };
  const util = today && today.available ? today.confirmed / today.available : 0.68;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      <div>
        <button onClick={handleAutoPack}
          style={{ background:'linear-gradient(180deg, rgba(15,15,15,0.95) 0%, rgba(0,0,0,0.95) 60%), repeating-linear-gradient(135deg, rgba(76,175,80,0.18) 0 6px, rgba(0,0,0,0) 6px 12px)', color:'#e0e0e0', border:'1px solid rgba(76,175,80,0.6)', borderRadius:8, padding:'6px 10px', boxShadow:'0 0 10px rgba(76,175,80,0.35), 0 6px 14px rgba(0,0,0,0.7), inset 0 0 10px rgba(76,175,80,0.22)' }}>{t('actions.autoPackSlots')}</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <div style={{ transform: 'scale(0.85)', transformOrigin: 'left center' }}>
          <Radial confirmed={today.confirmed} available={today.available} />
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:6, marginLeft: -8 }}>
          <span style={{ background:'#1b5e20', color:'#e8f5e9', border:'1px solid rgba(46,125,50,0.6)', borderRadius:12, padding:'2px 8px', fontSize:12, width:'fit-content' }}>{t('capacityLabels.holds')} {today.held}</span>
          <span style={{ background:'#0d47a1', color:'#e3f2fd', border:'1px solid rgba(100,181,246,0.5)', borderRadius:12, padding:'2px 8px', fontSize:12, width:'fit-content' }}>{t('capacityLabels.confirmed')} {today.confirmed}</span>
          <span style={{ background:'#37474f', color:'#eceff1', border:'1px solid rgba(176,190,197,0.5)', borderRadius:12, padding:'2px 8px', fontSize:12, width:'fit-content' }}>{t('capacityLabels.noShow')} {Math.round((today.no_show_forecast||0)*100)}%</span>
        </div>
      </div>
    </div>
  );
}


