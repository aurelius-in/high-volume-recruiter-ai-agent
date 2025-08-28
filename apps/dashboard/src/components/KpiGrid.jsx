import React from "react";

// Displays 6 KPIs in a 2x3 grid. Headings use Arabic-style font, values keep default numeric font.
export default function KpiGrid({ data }){
  const entries = Object.entries(data || {});
  // Normalize to exactly 6 entries (pad if fewer)
  const desiredOrder = ['reply_rate','qualified_rate','show_rate','ats_success_rate','cost_per_qualified','active_candidates'];
  const map = new Map(entries);
  const six = desiredOrder.map(k => [k, map.get(k) ?? '-']);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
      {six.map(([key, value]) => (
        <div key={key} style={{
          padding: '16px 18px',
          borderRadius: 14,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.72), rgba(13,71,20,0.55))',
          border: '1px solid rgba(46,125,50,0.45)',
          boxShadow: '0 8px 20px rgba(0,0,0,0.35)'
        }}>
          <div style={{
            fontFamily: "'Amiri','Cairo', serif",
            fontSize: 20,
            color: '#e8f5e9',
            marginBottom: 6,
            textTransform: 'capitalize'
          }}>{key.replaceAll('_',' ')}</div>
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: 0.3, color: '#66bb6a' }}>{String(value)}</div>
        </div>
      ))}
    </div>
  );
}


