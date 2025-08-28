import React from "react";

// Displays 6 KPIs in a 2x3 grid. Headings use Arabic-style font, values keep default numeric font.
export default function KpiGrid({ data }){
  const entries = Object.entries(data || {});
  // Normalize to exactly 6 entries (pad if fewer)
  const six = Array.from({ length: 6 }).map((_, i) => entries[i] || [
    i === 0 ? 'time_to_first_touch' : i === 1 ? 'reply_rate' : i === 2 ? 'qualified_rate' : i === 3 ? 'show_rate' : i === 4 ? 'cost_per_qualified' : 'ats_success_rate',
    '-'
  ]);

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
            fontSize: 16,
            color: '#e8f5e9',
            marginBottom: 6,
            textTransform: 'capitalize'
          }}>{key.replaceAll('_',' ')}</div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: 0.3, color: '#66bb6a' }}>{String(value)}</div>
        </div>
      ))}
    </div>
  );
}


