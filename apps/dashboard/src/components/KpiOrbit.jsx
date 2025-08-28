import React from "react";

// A visually distinctive orbit layout for up to 6 KPI metrics
// Places metric bubbles around a rotating ring with a fixed center label
export default function KpiOrbit({ data }) {
  const metrics = Object.entries(data || {});
  const items = metrics.slice(0, 6);

  const size = 360; // container size
  const radius = 120; // orbit radius
  const center = size / 2;

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        {/* Rotating orbit ring */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: size,
          height: size,
          borderRadius: '50%',
          border: '1px dashed rgba(46,125,50,0.35)',
          animation: 'orbit-rotate 32s linear infinite'
        }} />

        {/* Center label removed as requested */}

        {/* Metric bubbles */}
        {items.map(([key, value], idx) => {
          const angle = (idx / Math.max(1, items.length)) * Math.PI * 2 - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          const label = key.replaceAll('_', ' ');

          return (
            <div key={key} style={{ position: 'absolute', left: x - 70, top: y - 34 }}>
              <div style={{
                minWidth: 120,
                maxWidth: 140,
                padding: '10px 12px',
                borderRadius: 12,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.7), rgba(13,71,20,0.6))',
                border: '1px solid rgba(46,125,50,0.4)',
                boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
                transform: 'translateZ(0)'
              }}>
                <div style={{ fontSize: 12, color: '#e0e0e0', textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#66bb6a' }}>{String(value)}</div>
              </div>
            </div>
          );
        })}

        <style>{`
          @keyframes orbit-rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}


