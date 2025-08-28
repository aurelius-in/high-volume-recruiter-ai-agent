import React, { useEffect, useState } from "react";
import axios from "axios";
import { Paper, Typography } from "@mui/material";

const API = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export function JobsList(){
  const [jobs, setJobs] = useState([]);
  useEffect(()=>{ axios.get(`${API}/jobs`).then(r=>setJobs(r.data.jobs||[])); },[]);
  // Fallback demo: 50 varied roles across English/Arabic/Spanish
  const titles = [
    "Retail Associate","Cashier","Warehouse Picker","Customer Support","Line Cook","Barista","Delivery Driver","Security Guard","Janitor","Stock Clerk",
    "Asistente de Ventas","Cajero","Mozo de Almacén","Atención al Cliente","Cocinero","Barista","Repartidor","Guardia de Seguridad","Conserje","Repositor",
    "مندوب مبيعات","أمين صندوق","ملتقط مستودع","دعم العملاء","طباخ","باريستا","سائق توصيل","حارس أمن","عامل نظافة","موظف مخزن",
    "Sales Associate","Call Center Agent","Data Entry Clerk","Receptionist","Host","Dishwasher","Prep Cook","Forklift Operator","Sorter","Greeter",
    "Asistente de Cocina","Operario de Montacargas","Clasificador","Recepcionista","Vigilante","Ayudante de Limpieza","Operador","Mozo","Empaquetador","Telefonista"
  ];
  const locations = ["Riyadh","Jeddah","Dammam","Dubai","Doha","Cairo","Casablanca","Madrid","Barcelona","Ciudad de México","Monterrey","Miami","Houston","London"];
  const shifts = ["Day","Evening","Night"];
  const fallbackJobs = Array.from({ length: 50 }).map((_, i) => ({
    id: `demo-${i}`,
    title: titles[i % titles.length],
    location: locations[i % locations.length],
    shift: shifts[i % shifts.length]
  }));
  const display = (jobs && jobs.length) ? jobs : fallbackJobs;
  return (
    <Paper sx={{ p:2, bgcolor:'#000', color:'#fff', border:'1px solid rgba(46,125,50,0.35)', height: 360 }}>
      <Typography variant="subtitle1" sx={{ mb:1 }}>Jobs</Typography>
      <div style={{ height: 300, overflowY: 'auto' }}>
        <ul style={{ margin:0, paddingLeft:20 }}>
          {display.map(j => (
            <li key={j.id} style={{ marginBottom: 6 }}>📄 {j.title} — {j.location} — {j.shift}</li>
          ))}
        </ul>
      </div>
    </Paper>
  );
}

export function CandidatesList(){
  const [cands, setCands] = useState([]);
  useEffect(()=>{ axios.get(`${API}/candidates`).then(r=>setCands(r.data.candidates||[])); },[]);
  const demoNames = [
    "Ahmed Al‑Mutairi","Fatimah Al‑Harbi","Yousef Al‑Qahtani","Mona Al‑Otaibi","Omar Al‑Shammari","Layla Al‑Rashid","Hassan Al‑Zahrani","Sara Al‑Ghamdi","Khalid Al‑Anazi","Noura Al‑Saud",
    "Juan Pérez","María García","Luis Hernández","Lucía Martínez","Carlos Sánchez","Sofía López","Diego Gómez","Camila Díaz","Miguel Torres","Elena Ruiz",
    "John Miller","Emily Johnson","Michael Smith","Olivia Brown","David Wilson","Ava Davis","Daniel Anderson","Sophia Thomas","James Taylor","Emma Moore",
    "Ricardo Morales","Isabella Castillo","Andrés Navarro","Valentina Rojas","Pedro Romero","Ana Fernández","Javier Ortega","Paula Vega","Hugo Cabrera","Carmen Soto",
    "Ali Hassan","Rana Karim","Tariq Nasser","Zainab Fadel","Faisal Haddad","Amal Samir","Rami Jaber","Huda Taleb","Sami Barakat","Nadia Azmi"
  ];
  const statuses = ["contacted","replied","qualified","scheduled"];
  const fallbackCands = Array.from({ length: 50 }).map((_, i) => ({
    id: `cand-${i}`,
    name: demoNames[i % demoNames.length],
    status: statuses[i % statuses.length]
  }));
  const display = (cands && cands.length) ? cands : fallbackCands;
  return (
    <Paper sx={{ p:2, bgcolor:'#000', color:'#fff', border:'1px solid rgba(46,125,50,0.35)', height: 360 }}>
      <Typography variant="subtitle1" sx={{ mb:1 }}>Candidates</Typography>
      <div style={{ height: 300, overflowY: 'auto' }}>
        <ul style={{ margin:0, paddingLeft:20 }}>
          {display.map(c => (
            <li key={c.id} style={{ marginBottom: 6 }}>
              {c.status === 'qualified' ? '✅' : c.status === 'scheduled' ? '📅' : '👤'} {c.name} — {c.status}
            </li>
          ))}
        </ul>
      </div>
    </Paper>
  );
}


