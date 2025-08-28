import React, { useEffect, useState } from "react";
import axios from "axios";
import { Paper, Typography } from "@mui/material";

const API = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export function JobsList(){
  const [jobs, setJobs] = useState([]);
  useEffect(()=>{ axios.get(`${API}/jobs`).then(r=>setJobs(r.data.jobs||[])); },[]);
  // Fallback demo: 50 clear, easy-to-explain roles/cities/shifts
  const titles = [
    "Store Associate","Warehouse Associate","Customer Service Rep","Barista","Delivery Driver","Security Officer","Cleaner","Stock Clerk","Kitchen Assistant","Cashier",
    "Front Desk Agent","Server","Host","Dishwasher","Prep Cook","Call Center Agent","Data Entry Clerk","Receptionist","Forklift Operator","Sorter",
    "Grocery Associate","Picker/Packer","Shift Lead","Greeter","Lot Attendant","Laundry Attendant","Maintenance Helper","Line Cook","Sandwich Artist","Food Runner",
    "Merchandiser","Order Picker","Car Wash Attendant","Usher","Ticket Taker","Valet Attendant","Bellhop","Housekeeper","Room Attendant","Front of House",
    "Back of House","Janitor","Mailroom Clerk","Onsite Support","Courier","Kitchen Porter","Barback","Bagger","Cafe Attendant","Counter Clerk",
    // More roles for richer variety
    "Stock Associate","Inventory Specialist","Produce Clerk","Deli Clerk","Baker Assistant","Pharmacy Clerk","Photo Lab Tech","Garden Associate","Pet Care Associate","Electronics Associate",
    "Meat Cutter Apprentice","Seafood Clerk","Bakery Associate","Lot Porter","Parts Runner","Warehouse Loader","Returns Clerk","Quality Checker","Packaging Associate","Sorter/Scanner",
    "Catering Assistant","Event Staff","Stadium Usher","Concessions Worker","Set Up Crew","Tear Down Crew","Grounds Crew","Parking Attendant","Shuttle Driver","Route Driver",
    "Copy Center Associate","Print Shop Assistant","Library Aide","Records Clerk","File Clerk","Front Office Assistant","Office Runner","Mail Courier","Facilities Helper","Utility Worker",
    "Recycling Sorter","Dock Worker","Yard Associate","Assembler","Light Machine Operator","Production Helper","Kitting Associate","Shipping Clerk","Receiving Clerk","Cycle Counter"
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


