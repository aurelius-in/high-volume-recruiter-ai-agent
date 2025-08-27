import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function FunnelChart({ data }){
  const rows = [
    { name: "Contacted", value: data?.contacted || 0 },
    { name: "Replied", value: data?.replied || 0 },
    { name: "Qualified", value: data?.qualified || 0 },
    { name: "Scheduled", value: data?.scheduled || 0 },
    { name: "Showed", value: data?.showed || 0 },
  ];
  return (
    <div style={{ width: "100%", height: 240 }}>
      <ResponsiveContainer>
        <BarChart data={rows} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" fill="#1976d2" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


