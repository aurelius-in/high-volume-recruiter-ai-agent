import React from "react";
import { useTranslation } from "react-i18next";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";

export default function FunnelChart({ data }){
  const { t } = useTranslation();
  // Build descending bars: start from contacted (or 100) and drop ~40% each step
  const base = Number.isFinite(data?.contacted) ? Number(data.contacted) : 100;
  const stages = [
    { key: 'contacted', label: t('funnelLabels.contacted') },
    { key: 'replied', label: t('funnelLabels.replied') },
    { key: 'qualified', label: t('funnelLabels.qualified') },
    { key: 'scheduled', label: t('funnelLabels.scheduled') },
    { key: 'showed', label: t('funnelLabels.showed') },
    { key: 'offer', label: t('funnelLabels.offer') },
    { key: 'hired', label: t('funnelLabels.hired') },
  ];
  const rows = stages.map((s, idx) => ({
    name: s.label,
    value: idx === 0 ? base : Math.round(base * Math.pow(0.6, idx))
  }));
  return (
    <div style={{ width: "100%", height: 140 }}>
      <ResponsiveContainer>
        <BarChart data={rows} margin={{ top: 0, right: 8, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
          <XAxis dataKey="name" interval={0} angle={-35} textAnchor="end" height={40} tick={{ fill: '#e0e0e0', fontSize: 9 }} tickMargin={2} axisLine={{ stroke: 'rgba(255,255,255,0.3)' }} tickLine={{ stroke: 'rgba(255,255,255,0.3)' }} />
          <YAxis hide />
          <Tooltip formatter={(v)=>v} labelFormatter={(label)=>label} />
          <Bar dataKey="value" radius={[4,4,0,0]}>
            {rows.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === 0 ? '#2e7d32' : '#ef6c00'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


