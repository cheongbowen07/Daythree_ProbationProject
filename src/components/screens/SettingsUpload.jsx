import { FileText, Upload, CheckCircle2, Trash2, AlertCircle, Settings, ShieldCheck, Mail, Bell } from "lucide-react";
import { Card, Btn, PageHead, Mono } from "../ui";
import { useState } from "react";

export default function SettingsUpload() {
  const [activeTab, setActiveTab] = useState("documents");
  const [docs, setDocs] = useState([
    { id: 1, name: "Employee Confirmation Template v4.docx", type: "Acceptance", size: "1.2 MB", uploaded: "12 May 2026" },
    { id: 2, name: "Extension Letter Template v2.pdf", type: "Extension", size: "450 KB", uploaded: "15 May 2026" },
    { id: 3, name: "Non-Confirmation Notice.pdf", type: "Rejection", size: "320 KB", uploaded: "18 May 2026" },
  ]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Workflow Settings State
  const [config, setConfig] = useState({
    autoAcceptAcceptance: true,
    requireHodEarlyConf: true,
    emailFrequency: "daily",
    slaGracePeriod: 5,
  });

  const categories = [
    { key: "Acceptance", title: "Confirmation (Acceptance)", desc: "Templates for successful probation completion." },
    { key: "Extension", title: "Probation Extension", desc: "Templates for extending the review period." },
    { key: "Rejection", title: "Non-Confirmation (Rejection)", desc: "Legal templates for termination outcomes." }
  ];

  const handleUpload = (type) => {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setDocs([{
          id: Date.now(),
          name: file.name,
          type: type,
          size: (file.size / 1024 / 1024).toFixed(1) + " MB",
          uploaded: "Today"
        }, ...docs]);
        setHasChanges(true);
      }
    };
    input.click();
  };

  const updateConfig = (key, val) => {
    setConfig(prev => ({ ...prev, [key]: val }));
    setHasChanges(true);
  };

  const removeDoc = (id) => {
    setDocs(docs.filter(d => d.id !== id));
    setHasChanges(true);
  };

  const saveChanges = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setHasChanges(false);
    }, 1000);
  };

  return (
    <div className="fadeUp pb-20">
      <PageHead
        code="A-05 Settings / Documents"
        title="Settings & Uploads"
        sub="Configure global probation parameters and manage document templates."
      />

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-6 shadow-sm border border-slate-200">
        <button 
          onClick={() => setActiveTab("documents")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'documents' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <FileText size={16} /> Document Center
        </button>
        <button 
          onClick={() => setActiveTab("config")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'config' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Settings size={16} /> Workflow Config
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          {activeTab === "documents" ? (
            <div className="space-y-6 animate-in fade-in duration-500">
              {categories.map((cat) => (
                <Card key={cat.key} className="p-0 overflow-hidden border-l-4" style={{ borderColor: cat.key === 'Acceptance' ? '#3CC49F' : cat.key === 'Extension' ? '#FFB84D' : '#C8102E' }}>
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                      <div className="font-semibold text-slate-800">{cat.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{cat.desc}</div>
                    </div>
                    <Btn size="sm" variant="outline" icon={Upload} onClick={() => handleUpload(cat.key)}>Upload</Btn>
                  </div>
                  <div className="divide-y divide-slate-100 min-h-[40px]">
                    {docs.filter(d => d.type === cat.key).length > 0 ? (
                      docs.filter(d => d.type === cat.key).map((d) => (
                        <div key={d.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50 transition">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 grid place-items-center shrink-0"><FileText size={16} /></div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-slate-800 truncate">{d.name}</div>
                            <div className="text-[10px] text-slate-400 uppercase font-mono">{d.size} · {d.uploaded}</div>
                          </div>
                          <button onClick={() => removeDoc(d.id)} className="text-slate-300 hover:text-rose-600 p-2"><Trash2 size={16} /></button>
                        </div>
                      ))
                    ) : (
                      <div className="px-5 py-6 text-center text-xs text-slate-400 italic">No files in this category</div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-500">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4 text-indigo-600">
                  <ShieldCheck size={20} />
                  <div className="font-semibold text-slate-800">Governance & Approval Logic</div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-800">Auto-accept Acceptance</div>
                      <div className="text-xs text-slate-500">Move to completion automatically if DR doesn't sign within 7 days.</div>
                    </div>
                    <button onClick={() => updateConfig('autoAcceptAcceptance', !config.autoAcceptAcceptance)} className={`w-10 h-5 rounded-full relative transition ${config.autoAcceptAcceptance ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all`} style={{ left: config.autoAcceptAcceptance ? '22px' : '2px' }} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-800">HOD Approval (WF2)</div>
                      <div className="text-xs text-slate-500">Require Head of Dept to verify all Acting-Role confirmations.</div>
                    </div>
                    <button onClick={() => updateConfig('requireHodEarlyConf', !config.requireHodEarlyConf)} className={`w-10 h-5 rounded-full relative transition ${config.requireHodEarlyConf ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all`} style={{ left: config.requireHodEarlyConf ? '22px' : '2px' }} />
                    </button>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4 text-indigo-600">
                  <Bell size={20} />
                  <div className="font-semibold text-slate-800">System Notifications</div>
                </div>
                <div className="space-y-6">
                  <div>
                    <div className="text-sm font-semibold text-slate-800 mb-2">SLA Grace Period (Days)</div>
                    <input 
                      type="range" min="1" max="14" 
                      value={config.slaGracePeriod} 
                      onChange={(e) => updateConfig('slaGracePeriod', parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1 uppercase font-bold">
                      <span>1 Day</span>
                      <span className="text-indigo-600">{config.slaGracePeriod} Days</span>
                      <span>14 Days</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                    <div className="flex items-center gap-2">
                       <Mail size={16} className="text-slate-400" />
                       <span className="text-sm text-slate-700">Audit Log Summaries</span>
                    </div>
                    <select 
                      value={config.emailFrequency}
                      onChange={(e) => updateConfig('emailFrequency', e.target.value)}
                      className="text-xs border-none bg-slate-100 rounded-md px-2 py-1 font-medium text-slate-600 outline-none"
                    >
                      <option value="none">None</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="font-semibold mb-3 flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-500" />
              <span>Submission Control</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Pending changes must be saved to the database to update the workflow engine.
            </p>
            <Btn 
              className="w-full" 
              disabled={!hasChanges || isSaving} 
              icon={isSaving ? null : CheckCircle2}
              onClick={saveChanges}
            >
              {isSaving ? "Saving..." : "Confirm All Changes"}
            </Btn>
            {!hasChanges && <div className="text-[10px] text-center text-slate-400 mt-2 font-medium">System is up to date</div>}
          </Card>
        </div>
      </div>
    </div>
  );
}
