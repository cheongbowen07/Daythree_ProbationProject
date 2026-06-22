import React from "react";
import { Card, PageHead } from "../ui";
import { Info, ShieldCheck, Zap } from "lucide-react";

export default function About() {
  return (
    <div className="fadeUp space-y-6">
      <PageHead code="System Info" title="About FAITH Prototype" sub="Technical specification and design rationale v2.1." />
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4 text-indigo-600">
            <ShieldCheck size={24} />
            <h3 className="font-semibold text-slate-800">RBAC Engine</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            The system implements a strict Role-Based Access Control model. Security scopes (A-08) are enforced at the UI and data layer, ensuring Line Managers only see their direct reports, while HRBPs maintain organizational visibility.
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4 text-emerald-600">
            <Zap size={24} />
            <h3 className="font-semibold text-slate-800">Automation Layer</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            FAITH uses an event-driven automation layer (A-01, A-02, A-04) to handle review triggers, reminders, and SLA tracking. In this prototype, these are manual via the System Console to demonstrate the underlying logic.
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4 text-slate-700">
          <Info size={20} />
          <h3 className="font-semibold text-slate-800">Compliance & Audit</h3>
        </div>
        <p className="text-sm text-slate-600 mb-4">
          Every action is captured in an append-only audit trail (S-09). This includes timestamps, actors, and document versioning to meet statutory compliance requirements.
        </p>
        <div className="bg-slate-50 rounded-lg p-4 font-mono text-[10px] text-slate-500">
          BUILD: 2026.06.22-PROTOTYPE<br />
          SPEC: BRD_PROB_V2.1.TXT<br />
          STATE: IN-MEMORY (STUBBED)
        </div>
      </Card>
    </div>
  );
}
