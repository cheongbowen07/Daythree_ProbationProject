import React, { useState } from "react";
import { 
  Plus, Settings, FileUp, CheckCircle, 
  XCircle, FileText, Info, AlertCircle 
} from "lucide-react";
import { Card, Btn, PageHead, Mono, Tag } from "./components/ui";

export default function SettingsScreen() {
  const [docs, setDocs] = useState([
    { id: 1, type: "Acceptance Letter", template: "LT-01", status: "Active", lastUpdate: "2026-05-10" },
    { id: 2, type: "Extension Letter", template: "LT-02", status: "Active", lastUpdate: "2026-05-12" },
    { id: 3, type: "Rejection (Non-Conf)", template: "LT-03", status: "Active", lastUpdate: "2026-06-01" },
    { id: 4, type: "Acting Confirmation", template: "LT-04", status: "Active", lastUpdate: "2026-06-05" },
  ]);

  return (
    <div className="fadeUp">
      <PageHead 
        title="Settings & Document Config" 
        subtitle="Manage probation document templates and system-wide upload requirements." 
      />

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-5">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FileText size={18} className="text-indigo-500" /> Outcome Templates
          </h3>
          <div className="space-y-3">
            {docs.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl ring-1 ring-slate-100 bg-white hover:ring-indigo-200 transition">
                <div>
                  <div className="text-sm font-bold text-slate-900">{doc.type}</div>
                  <Mono className="text-[10px] text-slate-400">{doc.template} · Updated {doc.lastUpdate}</Mono>
                </div>
                <div className="flex items-center gap-3">
                  <Tag className="bg-emerald-50 text-emerald-600 border-emerald-100">{doc.status}</Tag>
                  <button className="text-[10px] font-bold text-indigo-600 uppercase hover:underline">Edit</button>
                </div>
              </div>
            ))}
          </div>
          <Btn variant="ghost" icon={Plus} size="sm" className="w-full mt-4">Add New Template</Btn>
        </Card>

        <Card className="p-5 border-amber-100 bg-amber-50/20">
          <h3 className="font-bold text-amber-800 mb-4 flex items-center gap-2">
            <AlertCircle size={18} /> Global Upload Rules
          </h3>
          <div className="space-y-4">
            <UploadRule 
              label="Mandatory ID Capture" 
              desc="Require ID upload for external new-hire probation starts." 
              checked={true} 
            />
            <UploadRule 
              label="Signed Copy Archival" 
              desc="Automatically sync signed PDFs to personnel e-folders." 
              checked={true} 
            />
            <UploadRule 
              label="Acting Role Proof" 
              desc="Require HOD email upload for acting role starts (WF2)." 
              checked={false} 
            />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
           <div className="w-12 h-12 rounded-2xl bg-slate-50 grid place-items-center"><FileUp size={24} className="text-slate-400" /></div>
           <div>
              <h3 className="text-lg font-bold text-slate-900">Upload Master Document</h3>
              <p className="text-sm text-slate-500">Quickly upload global policy updates or blanket confirmation lists.</p>
           </div>
        </div>
        
        <div className="border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center hover:border-indigo-400 transition-colors group cursor-pointer">
           <div className="inline-flex w-16 h-16 rounded-full bg-slate-50 items-center justify-center mb-4 group-hover:bg-indigo-50 transition-colors">
              <Plus size={32} className="text-slate-300 group-hover:text-indigo-500" />
           </div>
           <div className="text-sm font-bold text-slate-900 mb-1">Click to select or drag and drop</div>
           <p className="text-xs text-slate-400">Supporting PDF, DOCX, XLSX (Max 10MB)</p>
        </div>
      </Card>
    </div>
  );
}

function UploadRule({ label, desc, checked }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="text-sm font-bold text-slate-800">{label}</div>
        <p className="text-[11px] text-slate-500 leading-tight">{desc}</p>
      </div>
      <div className={`w-10 h-6 rounded-full p-1 transition ${checked ? 'bg-indigo-500' : 'bg-slate-200'}`}>
        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </div>
    </div>
  );
}
