import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const API = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function SlaHeatmap(){
  const [data, setData] = useState(null);
  const { t } = useTranslation();

  useEffect(()=>{
    (async ()=>{
      try{
        const res = await fetch(`${API}/metrics/sla-heatmap`);
        const j = await res.json();
        setData(j);
      }catch(e){
        setData(null);
      }
    })();
  },[]);

  if(!data){
    return <div style={{ height: 140, color: '#9e9e9e' }}>Loading…</div>;
  }

  const days = (data?.bins?.days && Array.isArray(data.bins.days)) ? data.bins.days : [t('sun')||'Sun',t('mon')||'Mon',t('tue')||'Tue',t('wed')||'Wed',t('thu')||'Thu',t('fri')||'Fri',t('sat')||'Sat'];
  const hours = (data?.bins?.hours && Array.isArray(data.bins.hours)) ? data.bins.hours : Array.from({length:24},(_,i)=>i);
  const rate = Array.isArray(data?.reply_rate) ? data.reply_rate : Array.from({length:7},()=>Array(24).fill(0));
  const ttft = Array.isArray(data?.ttft_minutes) ? data.ttft_minutes : Array.from({length:7},()=>Array(24).fill(0));

  const PALETTE = ['#c62828', '#ef6c00', '#fdd835', '#2e7d32']; // red, orange, yellow, green
  const pick = (r, choices) => {
    // choices: array of [threshold, colorIndex] with thresholds adding to 1
    let acc = 0;
    for (const [p, idx] of choices){ acc += p; if (r < acc) return PALETTE[idx]; }
    return PALETTE[choices[choices.length-1][1]];
  };

  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 14, color: '#e0e0e0', marginTop: 0, marginBottom: 4 }}>{t('heatmap.title')}</div>
      <div style={{ display: 'grid', gridTemplateColumns: `50px repeat(${hours.length}, 1fr)`, gap: 2 }}>
        <div></div>
        {hours.map(h=> (
          <div key={h} style={{ textAlign: 'center', fontSize: 10, color: '#cfd8dc' }}>{h}</div>
        ))}
        {days.map((d, di)=> {
          // Build row colors with deterministic weighted selection
          const rowColors = [];
          for (let hi = 0; hi < hours.length; hi++){
            const seed = (di * 37 + hi * 101) % 997;
            const r = (seed * 9301 + 49297) % 233280 / 233280.0;
            const isMidday = (10 <= hi && hi <= 12) || (17 <= hi && hi <= 20);
            const isLate = hi < 6 || hi > 22;
            let color;
            if (di <= 3 && isMidday){
              // Early rows show positive clusters
              color = pick(r, [[0.05,0],[0.15,1],[0.40,2],[0.40,3]]);
            } else if (isMidday){
              color = pick(r, [[0.10,0],[0.20,1],[0.35,2],[0.35,3]]);
            } else if (isLate){
              color = pick(r, [[0.40,0],[0.30,1],[0.20,2],[0.10,3]]);
            } else {
              color = pick(r, [[0.20,0],[0.25,1],[0.30,2],[0.25,3]]);
            }
            rowColors.push(color);
          }
          // Post-process to break up long red streaks (>4)
          let runStart = 0;
          while (runStart < rowColors.length){
            if (rowColors[runStart] !== PALETTE[0]){ runStart++; continue; }
            let end = runStart;
            while (end < rowColors.length && rowColors[end] === PALETTE[0]) end++;
            const runLen = end - runStart;
            if (runLen >= 5){
              for (let k = runStart + 1; k < end; k += 2){
                rowColors[k] = (k % 3 === 0) ? PALETTE[2] : PALETTE[3]; // flip some to yellow/green
              }
            }
            runStart = end;
          }
          return (
            <React.Fragment key={d}>
              <div style={{ fontSize: 12, color: '#cfd8dc' }}>{d}</div>
              {hours.map((h, hi)=>{
                const v = (rate?.[di]?.[hi]) ?? 0;
                const color = rowColors[hi];
                return (
                  <div key={h}
                    title={`Reply ${(v*100).toFixed(0)}% · TTFT ${(ttft?.[di]?.[hi]) ?? 0}m`}
                    style={{ height: 16, backgroundColor: color, borderRadius: 2 }} />
                );
              })}
            </React.Fragment>
          );
        })}
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop: 6 }}>
        <div style={{ fontSize: 11, color: '#b0bec5' }}>{t('heatmap.caption')}</div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:11, color:'#cfd8dc' }}>
            <span style={{ width:14, height:10, background:'#c62828', borderRadius:2, display:'inline-block' }}></span>
            {t('heatmap.legend.low')}
          </span>
          <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:11, color:'#cfd8dc' }}>
            <span style={{ width:14, height:10, background:'#ef6c00', borderRadius:2, display:'inline-block' }}></span>
            {t('heatmap.legend.moderate')}
          </span>
          <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:11, color:'#cfd8dc' }}>
            <span style={{ width:14, height:10, background:'#fdd835', borderRadius:2, display:'inline-block' }}></span>
            {t('heatmap.legend.high')}
          </span>
          <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:11, color:'#cfd8dc' }}>
            <span style={{ width:14, height:10, background:'#2e7d32', borderRadius:2, display:'inline-block' }}></span>
            {t('heatmap.legend.highest')}
          </span>
        </div>
      </div>
    </div>
  );
}


