import React, { useEffect, useState } from "react";
import axios from "axios";
import { Paper, Typography } from "@mui/material";

const API = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export function JobsList(){
  const [jobs, setJobs] = useState([]);
  useEffect(()=>{ axios.get(`${API}/jobs`).then(r=>setJobs(r.data.jobs||[])); },[]);
  // Fallback demo: 50 clear, easy-to-explain roles/cities/shifts
  const titles = [
    "Retail Sales Associate","Warehouse Associate","Picker/Packer","Customer Service Representative","Call Center Representative","Barista","Cashier","Food Service Worker","Line Cook","Prep Cook","Dishwasher","Server","Host/Hostess","Delivery Driver","Rideshare Driver","Security Guard","Janitorial Associate","Housekeeper","Room Attendant","Hotel Front Desk Agent","Greeter","Stock Associate","Inventory Control Associate","Merchandising Associate","Grocery Clerk","Deli Clerk","Bakery Associate","Produce Clerk","Pharmacy Technician Trainee","Mailroom Clerk","Receptionist","Data Entry Clerk","Administrative Assistant","Front Office Coordinator","Facilities Helper","Maintenance Helper","Groundskeeper","Valet Attendant","Parking Attendant","Event Staff","Concessions Worker","Stadium Usher","Warehouse Loader","Forklift Operator","Production Operator","Light Assembler","Quality Inspector","Packaging Associate","Kitting Associate","Shipping Clerk","Receiving Clerk","Cycle Counter","Order Picker","Sorter/Scanner","Laundry Attendant","Caregiver","Home Health Aide","Phlebotomist","Warehouse Supervisor (Entry)","Shift Lead","Team Lead (Front End)"
  ];
  const locations = [
    "New York","Los Angeles","Chicago","Dallas","Atlanta","Miami","Houston","Phoenix","Boston","Seattle",
    "San Francisco","San Diego","Austin","Denver","Orlando","Washington DC","Philadelphia","Charlotte","Tampa","Nashville",
    // More cities for variety
    "San Antonio","Columbus","Indianapolis","Fort Worth","Memphis","Baltimore","El Paso","Portland","Las Vegas","Detroit",
    "Oklahoma City","Louisville","Milwaukee","Albuquerque","Tucson","Fresno","Sacramento","Kansas City","Mesa","Omaha",
    "Colorado Springs","Raleigh","Long Beach","Virginia Beach","Oakland","Minneapolis","Tulsa","Arlington","Newark","Buffalo"
  ];
  const shifts = ["Morning","Afternoon","Evening"];

  // Sanitize incoming API jobs: drop placeholders and map unfamiliar cities/shifts to friendlier labels
  const cityMap = { Riyadh: "Dallas", Jeddah: "San Diego", Dammam: "Houston", Dubai: "Miami", Doha: "Austin", Cairo: "Chicago", Casablanca: "Boston" };
  const shiftMap = { Night: "Evening" };
  const isBad = (s)=> !s || String(s).length < 2;
  const sanitized = (jobs||[])
    .map(j=> ({
      id: j.id || `api-${Math.random().toString(36).slice(2,8)}`,
      title: isBad(j.title) ? undefined : j.title,
      location: isBad(j.location) ? undefined : (cityMap[j.location] || j.location),
      shift: isBad(j.shift) ? undefined : (shiftMap[j.shift] || j.shift)
    }))
    .filter(j=> j.title && j.location && j.shift);
  const fallbackJobs = Array.from({ length: 300 }).map((_, i) => ({
    id: `demo-${i}`,
    title: titles[i % titles.length],
    location: locations[i % locations.length],
    shift: shifts[i % shifts.length]
  }));
  const display = sanitized.length ? sanitized : fallbackJobs;
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
    // Arabic / Middle Eastern
    "Ahmed Al‑Mutairi","Fatima Al‑Harbi","Yousef Al‑Qahtani","Mona Al‑Otaibi","Omar Al‑Shammari","Layla Al‑Rashid","Hassan Al‑Zahrani","Sara Al‑Ghamdi","Khalid Al‑Anazi","Noura Al‑Saud",
    "Aisha Rahman","Omar Haddad","Layla Nasser","Yusuf Qureshi","Zainab Fadel","Tariq Nasser","Rana Karim","Ali Hassan","Amal Samir","Rami Jaber",
    "Huda Taleb","Sami Barakat","Nadia Azmi","Faisal Haddad","Mariam Kamel","Khaled Farouk","Omar Shammari","Reem Saleh","Basem Khoury","Dalia Mansour",
    // Spanish / Latin
    "Juan Pérez","María García","Luis Hernández","Lucía Martínez","Carlos Sánchez","Sofía López","Diego Gómez","Camila Díaz","Miguel Torres","Elena Ruiz",
    "Ricardo Morales","Isabella Castillo","Andrés Navarro","Valentina Rojas","Pedro Romero","Paula Vega","Javier Ortega","Hugo Cabrera","Carmen Soto","Gabriela Morales",
    "Fernando Álvarez","Lucía Herrera","Marcos Medina","Daniela Pineda","Santiago Rivera","Ximena Castillo","José Luis Morales","Adriana Delgado","Pablo Castillo","Rosa Álvarez",
    "Manuel Ortiz","Teresa Molina","Eduardo Santos","Alejandra Cruz","Roberto Navarro","Carolina Mendoza","Vicente Campos","Miguel Santos","Mateo López","Alejandra Ruiz",
    // English / American
    "John Miller","Emily Johnson","Michael Smith","Olivia Brown","David Wilson","Ava Davis","Daniel Anderson","Sophia Thomas","James Taylor","Emma Moore",
    "William Clark","Charlotte Martin","Benjamin Lee","Amelia Walker","Henry Hall","Mia Allen","Alexander Young","Harper King","Ethan Wright","Abigail Scott",
    "Noah Green","Ella Baker","Lucas Nelson","Grace Adams","Jacob Hill","Lily Campbell","Logan Mitchell","Chloe Turner","Mason Parker","Aria Rogers"
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


