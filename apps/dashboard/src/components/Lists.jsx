import React, { useEffect, useState } from "react";
import axios from "axios";
import { Paper, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

const API = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export function JobsList({ searchTerm = "", selectedJobId = null, onSelectJob = ()=>{} }){
  const { t } = useTranslation();
  const [jobs, setJobs] = useState([]);
  useEffect(()=>{ axios.get(`${API}/jobs`).then(r=>setJobs(r.data.jobs||[])); },[]);
  // Fallback demo: 50 clear, easy-to-explain roles/cities/shifts
  const titles = [
    "Retail Sales Associate","Warehouse Associate","Picker/Packer","Customer Service Representative","Call Center Representative","Barista","Cashier","Food Service Worker","Line Cook","Prep Cook","Dishwasher","Server","Host/Hostess","Delivery Driver","Rideshare Driver","Security Guard","Janitorial Associate","Housekeeper","Room Attendant","Hotel Front Desk Agent","Greeter","Stock Associate","Inventory Control Associate","Merchandising Associate","Grocery Clerk","Deli Clerk","Bakery Associate","Produce Clerk","Pharmacy Technician Trainee","Mailroom Clerk","Receptionist","Data Entry Clerk","Administrative Assistant","Front Office Coordinator","Facilities Helper","Maintenance Helper","Groundskeeper","Valet Attendant","Parking Attendant","Event Staff","Concessions Worker","Stadium Usher","Warehouse Loader","Forklift Operator","Production Operator","Light Assembler","Quality Inspector","Packaging Associate","Kitting Associate","Shipping Clerk","Receiving Clerk","Cycle Counter","Order Picker","Sorter/Scanner","Laundry Attendant","Caregiver","Home Health Aide","Phlebotomist","Warehouse Supervisor (Entry)","Shift Lead","Team Lead (Front End)",
    // Software & AI roles (demo)
    "Software Engineer I","Software Engineer II","Senior Software Engineer","Frontend Engineer (React)","Backend Engineer (Python/FastAPI)","Full‑Stack Engineer","Mobile Engineer (React Native)","Data Engineer","Machine Learning Engineer","MLOps Engineer","AI Research Engineer","AI Product Manager","Product Manager (AI)","Engineering Manager (Applications)","Staff Software Engineer","Principal Engineer","Solutions Architect (Cloud)","DevOps Engineer","Director of AI Platform","Director of Engineering"
  ];
  const locations = [
    "New York","Los Angeles","Chicago","Dallas","Atlanta","Miami","Houston","Phoenix","Boston","Seattle",
    "San Francisco","San Diego","Austin","Denver","Orlando","Washington DC","Philadelphia","Charlotte","Tampa","Nashville",
    // More cities for variety
    "San Antonio","Columbus","Indianapolis","Fort Worth","Memphis","Baltimore","El Paso","Portland","Las Vegas","Detroit",
    "Oklahoma City","Louisville","Milwaukee","Albuquerque","Tucson","Fresno","Sacramento","Kansas City","Mesa","Omaha",
    "Colorado Springs","Raleigh","Long Beach","Virginia Beach","Oakland","Minneapolis","Tulsa","Arlington","Newark","Buffalo"
  ];
  const rawShifts = ["Day","Swing","Night"]; // standardized
  const shiftLabel = (s)=>{
    const x = String(s||"").toLowerCase();
    if (x.startsWith("night")) return "Night (3rd)";
    if (x.startsWith("swing") || x.startsWith("evening") || x.startsWith("afternoon")) return "Swing (2nd)";
    if (x.startsWith("day") || x.startsWith("morning")) return "Day (1st)";
    return "Day (1st)";
  };
  const types = ["FT","PT","Seasonal","Contract"];
  const modes = ["Onsite","Hybrid","Remote"];
  const priorities = ["High","Med","Low"];
  const departments = ["Stores","Ops","Logistics","CX","Sales","Manufacturing","Healthcare","Hospitality","Admin"];
  const managers = ["L. Chen","P. Alvarez","R. Porter","K. Singh","A. Ruiz","J. Park","G. Patel","T. Monroe","C. Dizon","F. Bennett","D. Romero","S. Ahmed","E. Morales","H. Davies","V. Rao","I. García","B. Whitaker","O. Kowalski","K. Brooks","N. Rahman"];
  // Stable hashing for deterministic selections (no flicker on re-render)
  function hashString(s){
    let h = 0;
    const str = String(s||"");
    for (let i=0; i<str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return h >>> 0;
  }
  function pickStable(arr, key){
    if (!arr || arr.length === 0) return undefined;
    const idx = hashString(key) % arr.length;
    return arr[idx];
  }
  function payForStable(key, title){
    const hourly = ["$16–$18/hr","$17–$20/hr","$19–$22/hr","$21–$24/hr","$22–$25/hr","$24–$28/hr"];
    const salary = ["$38k–$48k","$42k–$52k","$45k–$55k"];
    const t = String(title||"").toLowerCase();
    if (
      t.includes("support") || t.includes("reception") ||
      t.includes("engineer") || t.includes("developer") || t.includes("architect") ||
      t.includes("manager") || t.includes("director") || t.includes("product") ||
      t.includes("ai") || t.includes("ml") || t.includes("platform") || t.includes("cloud")
    ) return pickStable(salary, key);
    return pickStable(hourly, key);
  }

  // Sanitize incoming API jobs and map to recruiter-friendly labels
  const cityMap = { Riyadh: "Dallas, TX", Jeddah: "San Diego, CA", Dammam: "Houston, TX", Dubai: "Miami, FL", Doha: "Austin, TX", Cairo: "Chicago, IL", Casablanca: "Boston, MA" };
  const isBad = (s)=> !s || String(s).length < 2;
  const sanitized = (jobs||[])
    .map((j, idx)=>{
      const id = j.id || `api-${Math.random().toString(36).slice(2,8)}`;
      const title = isBad(j.title) ? titles[idx % titles.length] : j.title;
      const location = isBad(j.location) ? `${locations[idx % locations.length]}` : (cityMap[j.location] || j.location);
      const shift = shiftLabel(j.shift || rawShifts[idx % rawShifts.length]);
      const reqId = (j.id && String(j.id).length >= 6) ? `REQ-${String(j.id).slice(0,6)}` : `REQ-2025-${(1000 + (idx%9000))}`;
      const target = 10 + (idx % 40);
      const filled = Math.max(0, Math.min(target, Math.floor(target * 0.4 + (idx%5))));
      const type = types[idx % types.length];
      const workMode = modes[idx % modes.length];
      const dept = departments[idx % departments.length];
      const hm = managers[idx % managers.length];
      const priority = priorities[idx % priorities.length];
      const ageDays = 2 + (idx % 14);
      const applied = 200 + (idx * 7) % 1200;
      const contacted = Math.floor(applied * 0.8);
      const replied = Math.floor(contacted * 0.4);
      const qualified = Math.floor(replied * 0.3);
      const scheduled = Math.floor(qualified * 0.6);
      const slaHours = 3 + (idx % 8);
      const notes = (String(title).toLowerCase().includes("retail") ? "Bilingual EN/ES" : String(title).toLowerCase().includes("driver") ? "CDL not required" : "");
      const pay = payForStable(`${id}|${title}|${location}|${shift}`, title);
      return { id, title, location, shift, reqId, openings: { filled, target }, type, workMode, pay, dept, hm, priority, ageDays, pipeline: { applied, contacted, replied, qualified, scheduled }, slaHours, notes };
    })
    .filter(j=> j.title && j.location && j.shift);
  const fallbackJobs = Array.from({ length: 1000 }).map((_, i) => {
    const title = titles[i % titles.length];
    const location = locations[i % locations.length];
    const shift = shiftLabel(rawShifts[i % rawShifts.length]);
    const reqId = `REQ-2025-${(1000 + i)}`;
    const target = 10 + (i % 50);
    const filled = Math.max(0, Math.min(target, Math.floor(target * 0.5 + (i%6))));
    const type = types[i % types.length];
    const workMode = modes[i % modes.length];
    const dept = departments[i % departments.length];
    const hm = managers[i % managers.length];
    const priority = priorities[i % priorities.length];
    const ageDays = 2 + (i % 15);
    const applied = 300 + (i * 9) % 1500;
    const contacted = Math.floor(applied * 0.8);
    const replied = Math.floor(contacted * 0.4);
    const qualified = Math.floor(replied * 0.3);
    const scheduled = Math.floor(qualified * 0.6);
    const slaHours = 3 + (i % 8);
    const notes = title.includes("Associate") ? "Weekend rotation" : (title.includes("Technician") ? "State license" : "");
    const id = `demo-${i}`;
    const pay = payForStable(`${id}|${title}|${location}|${shift}`, title);
    return { id, title, location, shift, reqId, openings: { filled, target }, type, workMode, pay, dept, hm, priority, ageDays, pipeline: { applied, contacted, replied, qualified, scheduled }, slaHours, notes };
  });
  // Always show a rich list: pad API jobs with deterministic fallback up to a target count
  const TARGET_COUNT = 360;
  const display = (sanitized.length >= TARGET_COUNT)
    ? sanitized
    : [...sanitized, ...fallbackJobs].slice(0, TARGET_COUNT);
  const q = String(searchTerm||"").trim().toLowerCase();
  const filtered = q ? display.filter(j => {
    const hay = [
      j.title,j.location,j.shift,j.reqId,j.type,j.workMode,j.pay,j.dept,j.hm,j.priority,j.notes,
      String(j.ageDays),String(j.openings?.filled??""),String(j.openings?.target??""),
      String(j.pipeline?.applied??""),String(j.pipeline?.contacted??""),String(j.pipeline?.replied??""),String(j.pipeline?.qualified??""),String(j.pipeline?.scheduled??"")
    ].join(" ").toLowerCase();
    return hay.includes(q);
  }) : display;
  return (
    <Paper sx={{ p:2, bgcolor:'#000', color:'#cfd8d3', border:'1px solid rgba(46,125,50,0.35)', height: 360 }}>
      <Typography variant="subtitle1" sx={{ mb:1 }}>{t('jobs')}</Typography>
      <div style={{ height: 300, overflowY: 'auto' }}>
        <ul style={{ margin:0, paddingLeft:20 }}>
          {filtered.map(j => (
            <li key={j.id} style={{ marginBottom: 10, cursor:'pointer' }} onClick={()=>onSelectJob(j.id)}>
              <div style={{
                background: selectedJobId===j.id ? 'rgba(46,125,50,0.35)' : 'transparent',
                color: selectedJobId===j.id ? '#ffcc80' : 'inherit',
                borderRadius: 6,
                padding: selectedJobId===j.id ? '2px 4px' : 0
              }}>{j.title} — {j.location} — {j.shift}</div>
              <div style={{ opacity: 0.9, fontSize: 12 }}>
                📄 {t('labels.reqId')}: {j.reqId} • {t('labels.openings')}: {j.openings?.filled ?? 0}/{j.openings?.target ?? 0} • {j.type} • {j.workMode} • {j.pay} • {t('labels.dept')}: {j.dept} • {t('labels.hm')}: {j.hm} • {t('labels.priority')}: {j.priority} • {t('labels.age')}: {j.ageDays}d • {t('labels.pipeline')}: {j.pipeline?.applied ?? 0}/{j.pipeline?.contacted ?? 0}/{j.pipeline?.replied ?? 0}/{j.pipeline?.qualified ?? 0}/{j.pipeline?.scheduled ?? 0} • {t('labels.sla')}: {j.slaHours}h{j.notes ? ` • ${j.notes}` : ''}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Paper>
  );
}

export function CandidatesList({ searchTerm = "", selectedCandidateId = null, onSelectCandidate = ()=>{} }){
  const { t } = useTranslation();
  const [cands, setCands] = useState([]);
  useEffect(()=>{ axios.get(`${API}/candidates`).then(r=>setCands(r.data.candidates||[])); },[]);
  const demoNames = [
    // Arabic / Middle Eastern (expanded)
    "Ahmed Al‑Mutairi","Fatima Al‑Harbi","Yousef Al‑Qahtani","Mona Al‑Otaibi","Omar Al‑Shammari","Layla Al‑Rashid","Hassan Al‑Zahrani","Sara Al‑Ghamdi","Khalid Al‑Anazi","Noura Al‑Saud",
    "Aisha Rahman","Omar Haddad","Layla Nasser","Yusuf Qureshi","Zainab Fadel","Tariq Nasser","Rana Karim","Ali Hassan","Amal Samir","Rami Jaber",
    "Huda Taleb","Sami Barakat","Nadia Azmi","Faisal Haddad","Mariam Kamel","Khaled Farouk","Omar Shammari","Reem Saleh","Basem Khoury","Dalia Mansour",
    "Abdullah Al‑Harbi","Mohammed Al‑Shehri","Saud Al‑Qahtani","Badr Al‑Malki","Fahad Al‑Subaie","Mashari Al‑Dosari","Sultan Al‑Otaibi","Turki Al‑Shuraim","Nasser Al‑Juhani","Ibrahim Al‑Harthy",
    "Abdulrahman Al‑Ghamdi","Bandar Al‑Amri","Yazeed Al‑Ajmi","Ziad Al‑Enezi","Majed Al‑Mutlaq","Nawaf Al‑Zaid","Yasir Al‑Humaidi","Hamad Al‑Balawi","Saeed Al‑Ghamdi","Talal Al‑Shamri",
    "Heba Al‑Sayegh","Maha Al‑Anzi","Noor Al‑Omari","Reema Al‑Faisal","Razan Al‑Najjar","Hind Al‑Shamrani","Nisreen Al‑Hassan","Duaa Al‑Ali","Salma Al‑Jaber","Lamah Al‑Khaldi",
    "Iman Al‑Sultan","Lama Al‑Hamad","Ahlam Al‑Qassim","Eman Al‑Ruwais","Amani Al‑Yousef","Maha Al‑Qahtani","Areej Al‑Mazrou","Bushra Al‑Harith","Dalal Al‑Aqeel","Hana Al‑Khalifah",
    "Yasmin Al‑Zahrani","Mariam Al‑Mutairi","Razan Al‑Sindi","Dina Al‑Mansour","Nada Al‑Sharif","Raghad Al‑Nasser","Hala Al‑Subaie","Amna Al‑Shehri","Wadha Al‑Jasser","Shaikha Al‑Shatti",
    "Othman Al‑Saif","Ziyad Al‑Fadhel","Murad Al‑Khatib","Jamal Al‑Masri","Rashed Al‑Mahdi","Hani Al‑Samadi","Walid Al‑Qadi","Bilal Al‑Rifai","Tamer Al‑Sharif","Kareem Al‑Sabbagh",
    // Spanish / Latin
    "Juan Pérez","María García","Luis Hernández","Lucía Martínez","Carlos Sánchez","Sofía López","Diego Gómez","Camila Díaz","Miguel Torres","Elena Ruiz",
    "Ricardo Morales","Isabella Castillo","Andrés Navarro","Valentina Rojas","Pedro Romero","Paula Vega","Javier Ortega","Hugo Cabrera","Carmen Soto","Gabriela Morales",
    "Fernando Álvarez","Lucía Herrera","Marcos Medina","Daniela Pineda","Santiago Rivera","Ximena Castillo","José Luis Morales","Adriana Delgado","Pablo Castillo","Rosa Álvarez",
    "Manuel Ortiz","Teresa Molina","Eduardo Santos","Alejandra Cruz","Roberto Navarro","Carolina Mendoza","Vicente Campos","Miguel Santos","Mateo López","Alejandra Ruiz",
    // English / American
    "John Miller","Emily Johnson","Michael Smith","Olivia Brown","David Wilson","Ava Davis","Daniel Anderson","Sophia Thomas","James Taylor","Emma Moore",
    "William Clark","Charlotte Martin","Benjamin Lee","Amelia Walker","Henry Hall","Mia Allen","Alexander Young","Harper King","Ethan Wright","Abigail Scott",
    "Noah Green","Ella Baker","Lucas Nelson","Grace Adams","Jacob Hill","Lily Campbell","Logan Mitchell","Chloe Turner","Mason Parker","Aria Rogers",
    // Chinese
    "Li Wei","Wang Fang","Zhang Wei","Chen Jie","Liu Yang","Huang Lei","Zhao Min","Zhou Ling","Wu Hao","Sun Mei"
  ];
  const statuses = ["contacted","replied","qualified","scheduled"];

  // Helpers for stable, deterministic values per candidate
  function hashString(s){
    let h = 0; const str = String(s||"");
    for (let i=0;i<str.length;i++) h = (h*31 + str.charCodeAt(i)) >>> 0;
    return h >>> 0;
  }
  function pickStable(arr, key){
    if (!arr || arr.length === 0) return undefined;
    return arr[hashString(key) % arr.length];
  }
  function maskedPhone(phone){
    const p = String(phone||"").replace(/\D/g,"");
    if (!p) return "";
    const tail = p.slice(-2);
    return `+••• ••• ••${tail}`;
  }

  const genders = ["Female","Male","Non-binary"];
  const cities = [
    "New York, NY","Los Angeles, CA","Chicago, IL","Dallas, TX","Atlanta, GA","Miami, FL","Houston, TX","Phoenix, AZ","Boston, MA","Seattle, WA",
    "San Francisco, CA","San Diego, CA","Austin, TX","Denver, CO","Orlando, FL","Washington, DC","Philadelphia, PA","Charlotte, NC","Tampa, FL","Nashville, TN"
  ];
  const locales = ["en","es","ar","zh"];
  const channels = ["sms","whatsapp","web"];
  const workPrefs = ["Onsite","Remote","Hybrid"];
  const notesPool = ["Open to nights","Weekend-only","Bilingual EN/ES","Bilingual EN/AR","Immediate start","Healthcare experience","Retail background","Relocation OK","Prefers hybrid","Looking for FT"];
  const educationLevels = ["HS Diploma","GED","Associate's","Bachelor's","Bachelor's (In Progress)"];
  const citizenshipCodes = ["US","AR","ZH"];
  const statusCodes = ["USC","GC","H1B","OPT"];
  // Expertise domains and representative titles to map candidates to jobs
  const expertiseDomains = ["Software","Sales","Customer Service","Warehouse","Hospitality","Healthcare","Security","Logistics","Manufacturing","Admin"];
  const expertiseTitles = {
    Software: [
      "Software Engineer I","Software Engineer II","Senior Software Engineer","Frontend Engineer (React)",
      "Backend Engineer (Python)","Full‑Stack Engineer","Data Engineer","Machine Learning Engineer","MLOps Engineer","DevOps Engineer"
    ],
    Sales: ["Sales Associate","Retail Sales Associate","Account Executive","Inside Sales Rep","Store Associate"],
    "Customer Service": ["Customer Support Specialist","Call Center Agent","Customer Service Representative","Front Desk Associate"],
    Warehouse: ["Warehouse Picker","Warehouse Loader","Forklift Operator","Order Picker","Inventory Control Associate"],
    Hospitality: ["Housekeeping Attendant","Hotel Front Desk Agent","Server","Line Cook","Barista"],
    Healthcare: ["Medical Assistant","Pharmacy Technician","Caregiver","Home Health Aide","Phlebotomist"],
    Security: ["Security Guard","Security Officer (Unarmed)"],
    Logistics: ["Delivery Driver","Last‑Mile Driver","Kitting Associate","Packaging Associate"],
    Manufacturing: ["Light Assembler","Assembler (Electronics)","QA Inspector","Production Operator"],
    Admin: ["Receptionist","Administrative Assistant","Data Entry Clerk","Mailroom Clerk"]
  };

  function toLangCode(loc){
    const m = String(loc||"").toLowerCase();
    if (m.startsWith("en")) return "EN";
    if (m.startsWith("es")) return "ES";
    if (m.startsWith("ar")) return "AR";
    if (m.startsWith("zh")) return "ZH";
    return m.toUpperCase() || "EN";
  }

  function withMiddleInitial(nameKey){
    const base = pickStable(demoNames, nameKey) || "Alex Kim";
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const add = (hashString(nameKey) % 3) === 0;
    if (!add) return base;
    const mid = letters[hashString(nameKey+"mid") % letters.length];
    const parts = base.split(" ");
    if (parts.length >= 2) return `${parts[0]} ${mid}. ${parts.slice(1).join(" ")}`;
    return `${base} ${mid}.`;
  }

  function statusBadge(c){
    const s = String(c.status || '').toLowerCase();
    if (s === 'qualified'){
      const y = Number.isFinite(c.years) ? c.years : 0;
      if (y >= 10) return { emoji: '🏅', text: 'highly qualified' };
      if (y >= 5) return { emoji: '✅', text: 'qualified' };
      return { emoji: '☑️', text: 'pre-qualified' };
    }
    if (s === 'scheduled') return { emoji: '📅', text: 'scheduled' };
    if (s === 'replied') return { emoji: '✉️', text: 'replied' };
    if (s === 'contacted') return { emoji: '📞', text: 'contacted' };
    return { emoji: 'ℹ️', text: s || 'unknown' };
  }

  // Enrich API candidates or build deterministic fallback
  const enriched = (cands||[]).map((c, i)=>{
    const id = c.id || `api-${i}`;
    const key = `${id}|${c.name||''}`;
    const isPlaceholder = /^candidate\s+\d+$/i.test(String(c.name||""));
    const name = isPlaceholder ? withMiddleInitial(key) : (c.name || withMiddleInitial(key));
    const gender = pickStable(genders, key);
    const location = pickStable(cities, key);
    const locale = c.locale || pickStable(locales, key);
    const channel = pickStable(channels, key);
    const consent = Boolean(c.consent);
    const status = c.status || statuses[i % statuses.length];
    const years = (hashString(key) % 11); // 0..10 yrs
    const lastMins = 5 + (hashString(key) % 240); // 5..245 min
    const phone = maskedPhone(c.phone);
    const notes = pickStable(notesPool, key);
    const education = pickStable(educationLevels, key);
    const citizenship = pickStable(citizenshipCodes, key);
    const expertise = pickStable(expertiseDomains, key);
    const roleTitle = pickStable(expertiseTitles[expertise] || ["Generalist"], key+"role");
    const workPref = pickStable(workPrefs, key);
    // immigration status code: US -> bias USC/GC, others mixed
    const statusBias = citizenship === "US" ? ["USC","GC"] : statusCodes;
    const statusCode = pickStable(statusBias, key+"status");
    return { id, name, gender, location, locale, channel, consent, status, years, lastMins, phone, notes, education, citizenship, statusCode, expertise, roleTitle, workPref };
  });

  const fallback = Array.from({ length: 1200 }).map((_, i)=>{
    const id = `cand-${i}`;
    const name = withMiddleInitial(id);
    const key = `${id}|${name}`;
    const gender = pickStable(genders, key);
    const location = pickStable(cities, key);
    const locale = pickStable(locales, key);
    const channel = pickStable(channels, key);
    const consent = (hashString(key) % 3) !== 0;
    const status = statuses[i % statuses.length];
    const years = (hashString(key) % 11);
    const lastMins = 5 + (hashString(key) % 240);
    const phone = maskedPhone(`+100000000${(i%100).toString().padStart(2,'0')}`);
    const notes = pickStable(notesPool, key);
    const education = pickStable(educationLevels, key);
    const citizenship = pickStable(citizenshipCodes, key);
    const statusCode = pickStable(citizenship === "US" ? ["USC","GC"] : statusCodes, key+"status");
    const expertise = pickStable(expertiseDomains, key);
    const roleTitle = pickStable(expertiseTitles[expertise] || ["Generalist"], key+"role");
    const workPref = pickStable(workPrefs, key);
    return { id, name, gender, location, locale, channel, consent, status, years, lastMins, phone, notes, education, citizenship, statusCode, expertise, roleTitle, workPref };
  });

  // For high-volume demo, ensure at least 10x current baseline
  const CANDIDATE_TARGET = 1200;
  const base = (enriched.length >= CANDIDATE_TARGET) ? enriched : fallback.slice(0, CANDIDATE_TARGET);
  // Seed 30 management-focused candidates across AI/Product/Software/IT/Sales/Customer Service
  const seedManagers = [
    { id:'seed-1', name:'Aisha Rahman', gender:'Female', location:'San Francisco, CA', locale:'en', channel:'web', consent:true, status:'qualified', years:8, lastMins:37, phone:'+••• ••• ••31', notes:'Relocation OK', education:"Bachelor's", citizenship:'US', statusCode:'USC', expertise:'Software', roleTitle:'AI Product Manager', workPref:'Hybrid' },
    { id:'seed-2', name:'Mohammed Al‑Shehri', gender:'Male', location:'Riyadh, SA', locale:'ar', channel:'sms', consent:true, status:'qualified', years:10, lastMins:74, phone:'+••• ••• ••32', notes:'Bilingual EN/AR', education:"Bachelor's", citizenship:'US', statusCode:'GC', expertise:'Software', roleTitle:'Product Manager (AI)', workPref:'Onsite' },
    { id:'seed-3', name:'Emily Johnson', gender:'Female', location:'Austin, TX', locale:'en', channel:'web', consent:true, status:'qualified', years:9, lastMins:15, phone:'+••• ••• ••33', notes:'Prefers hybrid', education:"Bachelor's", citizenship:'US', statusCode:'USC', expertise:'Software', roleTitle:'Engineering Manager', workPref:'Hybrid' },
    { id:'seed-4', name:'Li Wei', gender:'Male', location:'Seattle, WA', locale:'zh', channel:'whatsapp', consent:true, status:'qualified', years:11, lastMins:64, phone:'+••• ••• ••34', notes:'Immediate start', education:"Bachelor's", citizenship:'US', statusCode:'H1B', expertise:'Software', roleTitle:'Software Development Manager', workPref:'Hybrid' },
    { id:'seed-5', name:'María García', gender:'Female', location:'Miami, FL', locale:'es', channel:'sms', consent:true, status:'qualified', years:7, lastMins:52, phone:'+••• ••• ••35', notes:'Bilingual EN/ES', education:"Bachelor's", citizenship:'US', statusCode:'USC', expertise:'Customer Service', roleTitle:'Customer Support Manager', workPref:'Onsite' },
    { id:'seed-6', name:'Carlos Sánchez', gender:'Male', location:'Dallas, TX', locale:'es', channel:'web', consent:true, status:'qualified', years:12, lastMins:21, phone:'+••• ••• ••36', notes:'Weekend-only', education:"Bachelor's", citizenship:'US', statusCode:'USC', expertise:'Sales', roleTitle:'Sales Manager', workPref:'Hybrid' },
    { id:'seed-7', name:'Wang Fang', gender:'Female', location:'Remote (US)', locale:'zh', channel:'web', consent:true, status:'qualified', years:9, lastMins:43, phone:'+••• ••• ••37', notes:'Remote only', education:"Bachelor's", citizenship:'US', statusCode:'OPT', expertise:'Software', roleTitle:'AI Product Manager', workPref:'Remote' },
    { id:'seed-8', name:'Zhang Wei', gender:'Male', location:'New York, NY', locale:'zh', channel:'whatsapp', consent:true, status:'qualified', years:10, lastMins:58, phone:'+••• ••• ••38', notes:'Prefers hybrid', education:"Bachelor's", citizenship:'US', statusCode:'H1B', expertise:'Software', roleTitle:'Product Manager (AI)', workPref:'Hybrid' },
    { id:'seed-9', name:'John Miller', gender:'Male', location:'Chicago, IL', locale:'en', channel:'sms', consent:true, status:'qualified', years:13, lastMins:33, phone:'+••• ••• ••39', notes:'Team lead experience', education:"Bachelor's", citizenship:'US', statusCode:'USC', expertise:'IT', roleTitle:'IT Manager', workPref:'Onsite' },
    { id:'seed-10', name:'Olivia Brown', gender:'Female', location:'Boston, MA', locale:'en', channel:'web', consent:true, status:'qualified', years:8, lastMins:19, phone:'+••• ••• ••40', notes:'Relocation OK', education:"Bachelor's", citizenship:'US', statusCode:'USC', expertise:'IT', roleTitle:'IT Project Manager', workPref:'Hybrid' },
    { id:'seed-11', name:'David Wilson', gender:'Male', location:'San Jose, CA', locale:'en', channel:'web', consent:true, status:'qualified', years:9, lastMins:27, phone:'+••• ••• ••41', notes:'DevOps background', education:"Bachelor's", citizenship:'US', statusCode:'USC', expertise:'Software', roleTitle:'DevOps Manager', workPref:'Hybrid' },
    { id:'seed-12', name:'Sophia Thomas', gender:'Female', location:'Phoenix, AZ', locale:'en', channel:'sms', consent:true, status:'qualified', years:7, lastMins:49, phone:'+••• ••• ••42', notes:'Contact center ops', education:"Associate's", citizenship:'US', statusCode:'USC', expertise:'Customer Service', roleTitle:'Contact Center Manager', workPref:'Onsite' },
    { id:'seed-13', name:'Hassan Al‑Zahrani', gender:'Male', location:'Jeddah, SA', locale:'ar', channel:'sms', consent:true, status:'qualified', years:10, lastMins:41, phone:'+••• ••• ••43', notes:'Bilingual EN/AR', education:"Bachelor's", citizenship:'US', statusCode:'GC', expertise:'Sales', roleTitle:'Account Manager', workPref:'Hybrid' },
    { id:'seed-14', name:'Sara Al‑Ghamdi', gender:'Female', location:'Dubai, UAE', locale:'ar', channel:'web', consent:true, status:'qualified', years:9, lastMins:23, phone:'+••• ••• ••44', notes:'Retail background', education:"Bachelor's", citizenship:'US', statusCode:'USC', expertise:'Sales', roleTitle:'Store Manager', workPref:'Onsite' },
    { id:'seed-15', name:'James Taylor', gender:'Male', location:'Remote (US)', locale:'en', channel:'web', consent:true, status:'qualified', years:14, lastMins:38, phone:'+••• ••• ••45', notes:'Global teams', education:"Bachelor's", citizenship:'US', statusCode:'USC', expertise:'Software', roleTitle:'Director of Engineering', workPref:'Remote' },
    { id:'seed-16', name:'Emma Moore', gender:'Female', location:'Los Angeles, CA', locale:'en', channel:'whatsapp', consent:true, status:'qualified', years:11, lastMins:32, phone:'+••• ••• ••46', notes:'Strong UX focus', education:"Bachelor's", citizenship:'US', statusCode:'USC', expertise:'Software', roleTitle:'Product Manager', workPref:'Hybrid' },
    { id:'seed-17', name:'Chen Jie', gender:'Male', location:'Seattle, WA', locale:'zh', channel:'web', consent:true, status:'qualified', years:12, lastMins:36, phone:'+••• ••• ••47', notes:'ML systems', education:"Bachelor's", citizenship:'US', statusCode:'H1B', expertise:'Software', roleTitle:'AI Product Manager', workPref:'Hybrid' },
    { id:'seed-18', name:'Lucía Martínez', gender:'Female', location:'Austin, TX', locale:'es', channel:'sms', consent:true, status:'qualified', years:8, lastMins:26, phone:'+••• ••• ••48', notes:'Bilingual EN/ES', education:"Bachelor's", citizenship:'US', statusCode:'USC', expertise:'Customer Service', roleTitle:'Customer Success Manager', workPref:'Hybrid' },
    { id:'seed-19', name:'Carlos Romero', gender:'Male', location:'Houston, TX', locale:'es', channel:'web', consent:true, status:'qualified', years:9, lastMins:44, phone:'+••• ••• ••49', notes:'Enterprise sales', education:"Bachelor's", citizenship:'US', statusCode:'USC', expertise:'Sales', roleTitle:'Regional Sales Manager', workPref:'Hybrid' },
    { id:'seed-20', name:'Noor Al‑Omari', gender:'Female', location:'Amman, JO', locale:'ar', channel:'web', consent:true, status:'qualified', years:10, lastMins:29, phone:'+••• ••• ••50', notes:'Remote only', education:"Bachelor's", citizenship:'US', statusCode:'OPT', expertise:'Software', roleTitle:'Product Operations Manager', workPref:'Remote' },
    { id:'seed-21', name:'Benjamin Lee', gender:'Male', location:'San Diego, CA', locale:'en', channel:'web', consent:true, status:'qualified', years:7, lastMins:31, phone:'+••• ••• ••51', notes:'SaaS growth', education:"Bachelor's", citizenship:'US', statusCode:'USC', expertise:'Sales', roleTitle:'Sales Operations Manager', workPref:'Hybrid' },
    { id:'seed-22', name:'Charlotte Martin', gender:'Female', location:'Denver, CO', locale:'en', channel:'sms', consent:true, status:'qualified', years:9, lastMins:22, phone:'+••• ••• ••52', notes:'Support QA', education:"Associate's", citizenship:'US', statusCode:'USC', expertise:'Customer Service', roleTitle:'Support Manager', workPref:'Onsite' },
    { id:'seed-23', name:'Huang Lei', gender:'Male', location:'San Jose, CA', locale:'zh', channel:'web', consent:true, status:'qualified', years:11, lastMins:35, phone:'+••• ••• ••53', notes:'Platform PM', education:"Bachelor's", citizenship:'US', statusCode:'H1B', expertise:'Software', roleTitle:'Platform Product Manager', workPref:'Hybrid' },
    { id:'seed-24', name:'Zhao Min', gender:'Female', location:'Remote (US)', locale:'zh', channel:'web', consent:true, status:'qualified', years:8, lastMins:47, phone:'+••• ••• ••54', notes:'Data PM', education:"Bachelor's", citizenship:'US', statusCode:'OPT', expertise:'Software', roleTitle:'Data Product Manager', workPref:'Remote' },
    { id:'seed-25', name:'Luis Hernández', gender:'Male', location:'Phoenix, AZ', locale:'es', channel:'web', consent:true, status:'qualified', years:10, lastMins:39, phone:'+••• ••• ••55', notes:'Retail leadership', education:"Bachelor's", citizenship:'US', statusCode:'USC', expertise:'Sales', roleTitle:'District Manager', workPref:'Onsite' },
    { id:'seed-26', name:'Fatima Al‑Harbi', gender:'Female', location:'Dubai, UAE', locale:'ar', channel:'sms', consent:true, status:'qualified', years:9, lastMins:28, phone:'+••• ••• ••56', notes:'Bilingual EN/AR', education:"Bachelor's", citizenship:'US', statusCode:'GC', expertise:'Customer Service', roleTitle:'Service Delivery Manager', workPref:'Hybrid' },
    { id:'seed-27', name:'Alexander Young', gender:'Male', location:'Remote (US)', locale:'en', channel:'web', consent:true, status:'qualified', years:12, lastMins:34, phone:'+••• ••• ••57', notes:'Cloud PM', education:"Bachelor's", citizenship:'US', statusCode:'USC', expertise:'Software', roleTitle:'Cloud Product Manager', workPref:'Remote' },
    { id:'seed-28', name:'Harper King', gender:'Female', location:'Nashville, TN', locale:'en', channel:'sms', consent:true, status:'qualified', years:8, lastMins:42, phone:'+••• ••• ••58', notes:'Contact center ops', education:"Associate's", citizenship:'US', statusCode:'USC', expertise:'Customer Service', roleTitle:'Customer Care Manager', workPref:'Onsite' },
    { id:'seed-29', name:'Omar Al‑Shammari', gender:'Male', location:'Jeddah, SA', locale:'ar', channel:'web', consent:true, status:'qualified', years:11, lastMins:37, phone:'+••• ••• ••59', notes:'Bilingual EN/AR', education:"Bachelor's", citizenship:'US', statusCode:'GC', expertise:'Software', roleTitle:'Scrum Master / Delivery Manager', workPref:'Hybrid' },
    { id:'seed-30', name:'Sofía López', gender:'Female', location:'Los Angeles, CA', locale:'es', channel:'whatsapp', consent:true, status:'qualified', years:9, lastMins:25, phone:'+••• ••• ••60', notes:'SaaS CS', education:"Bachelor's", citizenship:'US', statusCode:'USC', expertise:'Customer Service', roleTitle:'Customer Success Manager', workPref:'Hybrid' },
  ];
  const combined = [...seedManagers, ...base];
  const qC = String(searchTerm||"").trim().toLowerCase();
  const display = qC ? combined.filter(c => {
    const hay = [
      c.name,c.gender,c.location,toLangCode(c.locale),c.education,c.citizenship,c.statusCode,c.status,c.channel,c.notes,c.phone,c.expertise,c.roleTitle,c.workPref,
      String(c.years), String(c.lastMins)
    ].join(" ").toLowerCase();
    return hay.includes(qC);
  }) : combined;
  return (
    <Paper sx={{ p:2, bgcolor:'#000', color:'#cfd8d3', border:'1px solid rgba(46,125,50,0.35)', height: 360 }}>
      <Typography variant="subtitle1" sx={{ mb:1 }}>{t('candidates')}</Typography>
      <div style={{ height: 300, overflowY: 'auto' }}>
        <ul style={{ margin:0, paddingLeft:20 }}>
          {display.map(c => (
            <li key={c.id} style={{ marginBottom: 10, cursor:'pointer' }} onClick={()=>onSelectCandidate(c.id)}>
              <div style={{
                background: selectedCandidateId===c.id ? 'rgba(46,125,50,0.35)' : 'transparent',
                color: selectedCandidateId===c.id ? '#ffcc80' : 'inherit',
                borderRadius: 6,
                padding: selectedCandidateId===c.id ? '2px 4px' : 0
              }}>
                {c.name} — <span style={{ fontSize: 11, opacity: 0.85 }}>{t('labels.status')}: {statusBadge(c).emoji} ({statusBadge(c).text})</span>
              </div>
              <div style={{ opacity: 0.9, fontSize: 12 }}>
                👤 {c.gender} • {c.location} • {t('labels.locPref')}: {c.workPref} • {t('labels.expertise')}: {c.expertise} — {c.roleTitle} • {t('labels.lang')}: {toLangCode(c.locale)} • {t('labels.exp')}: {c.years} {t('labels.years')} • {t('labels.education')}: {c.education || pickStable(educationLevels, c.id)} • {t('labels.citizenship')}: {c.citizenship || pickStable(citizenshipCodes, c.id)} {c.statusCode || ''} • {t('labels.last')}: {Math.floor(c.lastMins/60)}h{String(c.lastMins%60).padStart(2,'0')}m • {c.phone || ''}{c.notes ? ` • ${c.notes}` : ''} • {t('labels.channel')}: {c.channel} • {t('labels.consent')}: {c.consent ? t('yes') : t('no')}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Paper>
  );
}


