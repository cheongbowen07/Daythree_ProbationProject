import React, { useState, useEffect } from "react";
import { 
  Users, BarChart3, Shield, Info, LayoutDashboard, 
  Settings as SettingsIcon, LogOut, Bell, Menu, X, FileUp
} from "lucide-react";

// Local modular imports
import { 
  NAV_HRBP, NAV_LM, ROLE_MAP, 
  monthFromStatus, isActiveProbation 
} from "./constants";
import { seedRecords, seedAudit } from "./data";
import { StyleVars, Btn, Mono } from "./components/ui";
import { InitiateModal } from "./components/modals";

// Screens
import HRBPPipeline from "./components/screens/HRBPPipeline";
import LMDashboard from "./components/screens/LMDashboard";
import DRHome from "./components/screens/DRHome";
import CaseDetail from "./components/screens/CaseDetail";
import SLATracker from "./components/screens/SLATracker";
import AuditTrail from "./components/screens/AuditTrail";
import SystemConsole from "./components/screens/SystemConsole";
import Settings from "./components/screens/Settings";
import About from "./components/screens/About";

export default function App() {
  const [role, setRole] = useState("HRBP");
  const [records, setRecords] = useState(seedRecords);
  const [audit, setAudit] = useState(seedAudit);
  const [activeTab, setActiveTab] = useState("pipeline");
  const [selId, setSelId] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [modal, setModal] = useState(null);

  // Sync role-based default tab
  useEffect(() => {
    if (role === 'HRBP') setActiveTab('pipeline');
    if (role === 'LM') setActiveTab('dashboard');
    if (role === 'DR') setActiveTab('my-home');
    setSelId(null);
  }, [role]);

  const selRec = records.find(r => r.id === selId);
  const navItems = role === "HRBP" ? NAV_HRBP : (role === "LM" ? NAV_LM : []);

  // Handlers
  const handleInitiate = (form) => {
    const newRec = {
      id: records.length + 1,
      ...form,
      status: form.wf === 'WF2' ? 'KPI-Review(Acting)' : 'KPI-Review',
      day: 1, reviews: [], kpis: [], phase: 'INIT',
      employmentStatus: 'Full Time', gradeBand: 'E06_E08',
      lm: 'Current User'
    };
    setRecords([newRec, ...records]);
    setModal(null);
    logAudit(newRec.id, 'WORKFLOW_INITIATED', 'System-wide trigger');
  };

  const logAudit = (refId, event, details) => {
    const newEntry = {
      id: audit.length + 1,
      ts: new Date().toISOString().replace('T', ' ').split('.')[0],
      ref: `ID-${refId}`,
      event,
      actor: role,
      ip: '10.2.34.11'
    };
    setAudit([newEntry, ...audit]);
  };

  const updateStatus = (id, status, then) => {
    setRecords(records.map(r => r.id === id ? { ...r, status, ...then } : r));
    logAudit(id, `STATUS_CHANGE: ${status}`, 'Pipeline move');
  };

  // View Mapping
  const renderScreen = () => {
    if (selId) return (
      <CaseDetail 
        rec={selRec} role={role} 
        onBack={() => setSelId(null)}
        onSubmitReview={(id, rpm, comment) => {
          const rec = records.find(r => r.id === id);
          const next = rec.status.includes('(Acting)') ? 'Mth1-Acceptance' : 'KPI-Acceptance'; // Simplified for demo
          updateStatus(id, next, { reviews: [...rec.reviews, { cycle: monthFromStatus(rec.status), rpm, comment }] });
          setSelId(null);
        }}
        onSaveKpis={(id, kpis) => updateStatus(id, 'KPI-Review', { kpis })}
        onGenerate={(id, type, label, lt) => {
          updateStatus(id, 'Pending-Signature', { letterId: `L-${Math.random().toString(36).substr(2,5).toUpperCase()}`, letterType: lt });
          setSelId(null);
        }}
      />
    );

    switch (activeTab) {
      case 'pipeline': return <HRBPPipeline records={records} onSelectRecord={r => setSelId(r.id)} onInitiate={() => setModal('init')} />;
      case 'dashboard': return <LMDashboard records={records} onSelectRecord={r => setSelId(r.id)} />;
      case 'my-home': return <DRHome rec={records[0]} onAccept={id => updateStatus(id, 'Mth1-Review')} />;
      case 'sla': return <SLATracker records={records} />;
      case 'audit': return <AuditTrail audit={audit} />;
      case 'system': return <SystemConsole />;
      case 'settings': return <Settings />;
      case 'about': return <About />;
      default: return <div className="p-20 text-center text-slate-400">Screen under construction</div>;
    }
  };

  return (
    <div className="flex h-screen bg-[#FDFDFF] text-slate-800 antialiased overflow-hidden font-sans">
      <StyleVars />
      
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-100 transform transition-transform lg:relative lg:translate-x-0 ${mobileMenu ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 grid place-items-center text-white font-black italic">F</div>
            <span className="font-serif italic text-xl font-black tracking-tight text-slate-900">FAITH<span className="text-indigo-600">.</span></span>
          </div>

          <nav className="space-y-1">
             {navItems.map(item => {
               const Icon = item.icon;
               return (
                 <button 
                   key={item.id} 
                   onClick={() => { setActiveTab(item.id); setMobileMenu(false); setSelId(null); }}
                   className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === item.id ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                 >
                   <Icon size={18} /> {item.label}
                 </button>
               );
             })}
          </nav>
        </div>

        <div className="absolute bottom-6 left-6 right-6 space-y-4">
           <Card className="p-4 bg-slate-50/50 border-slate-100 ring-0">
             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Authenticated As</div>
             <select 
               value={role} 
               onChange={e => setRole(e.target.value)}
               className="w-full bg-white ring-1 ring-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold outline-none"
             >
               {Object.keys(ROLE_MAP).map(k => <option key={k} value={k}>{ROLE_MAP[k]}</option>)}
             </select>
           </Card>
           <button className="w-full flex items-center gap-3 px-3 py-2 text-rose-500 font-bold text-sm hover:bg-rose-50 rounded-lg transition-colors">
              <LogOut size={16} /> Logout
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-white lg:bg-slate-50/30 overflow-hidden">
         <header className="h-16 lg:h-20 flex items-center justify-between px-6 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
            <button onClick={() => setMobileMenu(true)} className="lg:hidden p-2 text-slate-600"><Menu size={20} /></button>
            <div className="flex-1">
               {selId && <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <span>Pipeline</span> <span className="text-slate-200">/</span> <span>Case Details</span>
               </div>}
            </div>
            <div className="flex items-center gap-4">
               <button className="p-2 text-slate-400 hover:text-indigo-600 transition relative">
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
               </button>
               <div className="flex items-center gap-3 pl-4 border-l border-slate-100 cursor-pointer group">
                  <div className="text-right hidden sm:block">
                     <div className="text-sm font-bold text-slate-900 leading-none">B. Wen</div>
                     <div className="text-[10px] font-bold text-indigo-500 uppercase mt-1 tracking-tight">{ROLE_MAP[role]}</div>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-slate-100 ring-1 ring-slate-200 overflow-hidden group-hover:ring-indigo-300 transition-all">
                     <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${role}`} alt="avatar" />
                  </div>
               </div>
            </div>
         </header>

         <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
            <div className="max-w-6xl mx-auto pb-20">
               {renderScreen()}
            </div>
         </div>
      </main>

      {/* Modals */}
      {modal === 'init' && <InitiateModal onClose={() => setModal(null)} onAdd={handleInitiate} />}
      {mobileMenu && <div className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden" onClick={() => setMobileMenu(false)} />}
    </div>
  );
}
