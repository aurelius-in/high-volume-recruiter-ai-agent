import React from "react";
import { useTranslation } from "react-i18next";

// Displays 6 KPIs in a 2x3 grid. Headings use Arabic-style font, values keep default numeric font.
export default function KpiGrid({ data }){
  const { t } = useTranslation();
  const entries = Object.entries(data || {});
  // Normalize to exactly 6 entries (pad if fewer)
  const desiredOrder = ['reply_rate','qualified_rate','show_rate','ats_success_rate','cost_per_qualified','active_candidates'];
  const map = new Map(entries);
  const six = desiredOrder.map(k => {
    let v = map.get(k);
    if (v === undefined || v === null || v === '') {
      // sensible defaults by type
      if (k.includes('rate')) v = '0%';
      else if (k.includes('cost')) v = '$0';
      else v = '0';
    }
    return [k, v];
  });

  const labelFor = (key) => {
    return t(`kpi.${key}`);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
      {six.map(([key, value]) => (
        <div key={key} style={{
          padding: '8px 10px',
          borderRadius: 14,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.72), rgba(13,71,20,0.55))',
          border: '1px solid rgba(46,125,50,0.45)',
          boxShadow: '0 8px 20px rgba(0,0,0,0.35)'
        }}>
          <div style={{
            fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
            fontSize: 16,
            color: '#e8f5e9',
            marginBottom: 0,
            textTransform: 'capitalize'
          }}>{labelFor(key)}</div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: 0.2, color: '#66bb6a', lineHeight: 1.1 }}>
            {key === 'active_candidates' ? (
              (Number(value) || 0).toLocaleString()
            ) : (
              String(value)
            )}
          </div>
        </div>
      ))}
    </div>
  );
}


