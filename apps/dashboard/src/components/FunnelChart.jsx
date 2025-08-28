import React from "react";
import { useTranslation } from "react-i18next";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";

export default function FunnelChart({ data }){
  const { t } = useTranslation();
  const rows = [
    { name: t('funnelLabels.contacted'), value: data?.contacted || 0 },
    { name: t('funnelLabels.replied'), value: data?.replied || 0 },
    { name: t('funnelLabels.qualified'), value: data?.qualified || 0 },
    { name: t('funnelLabels.scheduled'), value: data?.scheduled || 0 },
    { name: t('funnelLabels.showed'), value: data?.showed || 0 },
  ];
  return (
    <div style={{ width: "100%", height: 140 }}>
      <ResponsiveContainer>
        <BarChart data={rows} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
          <XAxis dataKey="name" tick={{ fill: '#e0e0e0', fontSize: 9 }} tickMargin={2} axisLine={{ stroke: 'rgba(255,255,255,0.3)' }} tickLine={{ stroke: 'rgba(255,255,255,0.3)' }} />
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


