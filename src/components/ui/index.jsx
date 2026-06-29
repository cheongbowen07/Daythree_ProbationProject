import { Lock, Bell, Users, ClipboardList, CheckCircle2 } from "lucide-react";
import { ROLES, TONE_CLASS } from "../../constants";
import { statusLabel, tone } from "../../utils/status";

export function StyleVars() {
  return (
    <style>{`
      :root{
        --brand:#5D3FD3; --brand-2:#C8102E; --brand-purple:#5D3FD3; --brand-red:#C8102E;
        --mint:#3CC49F; --sky:#409CFF; --coral:#FF9E3D; --amber:#FFB84D;
        --charcoal:#4D4D4D; --graphite:#4D4D4D; --paper:#f9f9f9; --smoke:#F4F4F4; --lavender:#C3B1F5;
        --sans:"Source Sans 3","Source Sans Pro",ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
        --mono:ui-monospace,"SF Mono",Menlo,Monaco,"Cascadia Code","Roboto Mono",monospace; }
      *{ -webkit-font-smoothing:antialiased; }
      body{ background:var(--paper); }
      button:focus-visible{ box-shadow:0 0 0 3px rgba(194,45,56,.26); border-radius:8px; outline:none; }
      @keyframes fadeUp{ from{ opacity:0; transform:translateY(6px);} to{ opacity:1; transform:none;} }
      .fadeUp{ animation:fadeUp .25s ease both; }
      .brand-card{ border-color:rgba(211,199,223,.82); box-shadow:0 10px 24px rgba(47,48,51,.06); }
      .recharts-tooltip-wrapper .recharts-default-tooltip{ border:1px solid var(--lavender)!important; border-radius:8px!important; box-shadow:0 10px 24px rgba(47,48,51,.10)!important; }
      ::-webkit-scrollbar{ width:10px; height:10px; }
      ::-webkit-scrollbar-thumb{ background:#C3B1F5; border-radius:8px; border:2px solid var(--paper); }
      @media (prefers-reduced-motion: reduce){ .fadeUp{ animation:none; } }
    `}</style>
  );
}

export function Mono({ children, className = "" }) {
  return <span className={className} style={{ fontFamily: "var(--mono)" }}>{children}</span>;
}

export function StatusBadge({ status, sm }) {
  const t = tone(status);
  return (
    <span className={`inline-flex items-center rounded-full ring-1 font-medium ${TONE_CLASS[t]} ${sm ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"}`}>
      {statusLabel(status)}
    </span>
  );
}

export function Tag({ children, className = "" }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${className}`} style={{ fontFamily: "var(--mono)" }}>
      {children}
    </span>
  );
}

export function PageHead({ code, title, sub, right }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4 flex-wrap">
      <div>
        <Mono className="text-[11px] font-semibold tracking-wide text-[#C8102E] bg-[#FCD9D9] px-1.5 py-0.5 rounded ring-1 ring-[#F5A5A5]">{code}</Mono>
        <h1 className="text-[22px] font-semibold tracking-tight text-[#4D4D4D] mt-1.5">{title}</h1>
        {sub && <p className="text-sm text-[#6E6E6E] mt-0.5 max-w-2xl">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function Card({ children, className = "" }) {
  return <div className={`rounded-lg bg-white ring-1 brand-card ${className}`}>{children}</div>;
}

// Clickable table header that drives column sorting. Pair with useSort:
//   <SortTh label="Status" sortKey="status" sort={sort} onSort={toggle} />
export function SortTh({ label, sortKey, sort, onSort, align = "left", className = "" }) {
  const active = sort?.key === sortKey;
  const arrow = !active ? "↕" : sort.dir === "asc" ? "▲" : "▼";
  return (
    <th className={`px-4 py-2.5 font-medium ${align === "right" ? "text-right" : ""} ${className}`}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1 uppercase tracking-wider transition hover:text-slate-600 ${active ? "text-slate-600" : ""} ${align === "right" ? "flex-row-reverse" : ""}`}
        title={`Sort by ${label}`}
      >
        {label}
        <span className={`text-[9px] leading-none ${active ? "opacity-100" : "opacity-30"}`}>{arrow}</span>
      </button>
    </th>
  );
}

export function Btn({ children, onClick, variant = "primary", size = "md", disabled, icon: Icon, className = "" }) {
  const sizes = { md: "px-3.5 py-2 text-sm", sm: "px-2.5 py-1.5 text-xs", lg: "px-4 py-2.5 text-sm" };
  const styles = {
    primary: "text-white hover:brightness-110",
    ghost:   "text-[#4D4D4D] ring-1 ring-[#C3B1F5] hover:bg-[#EFE8FF] bg-white",
    danger:  "text-white bg-[#C8102E] hover:brightness-110",
    soft:    "text-[#5D3FD3] bg-[#EFE8FF] ring-1 ring-[#C3B1F5] hover:bg-[#E0D6FF]",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed ${sizes[size]} ${styles[variant]} ${className}`}
      style={variant === "primary" ? { background: "linear-gradient(90deg, var(--brand-purple), var(--brand-red))" } : {}}
    >
      {Icon && <Icon size={size === "sm" ? 14 : 16} />} {children}
    </button>
  );
}

export function RoleCard({ role }) {
  const R = ROLES.find((x) => x.id === role);
  const I = R.icon;
  return (
    <div className="rounded-lg ring-1 ring-slate-200 bg-slate-50 px-3 py-2.5">
      <div className="flex items-center gap-2 text-slate-700"><I size={15} /> <span className="text-sm font-medium">{R.label}</span></div>
      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500"><Lock size={11} /> {R.scope}</div>
    </div>
  );
}

export function Empty({ icon: Icon, title, sub }) {
  return (
    <div className="grid place-items-center py-16 text-center">
      <div className="grid place-items-center w-12 h-12 rounded-xl bg-slate-100 text-slate-400 mb-3"><Icon size={22} /></div>
      <p className="font-medium text-slate-700">{title}</p>
      {sub && <p className="text-sm text-slate-500 mt-1 max-w-sm">{sub}</p>}
    </div>
  );
}

export function Row({ k, v }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-400">{k}</dt>
      <dd className="text-slate-700 text-right">{v}</dd>
    </div>
  );
}

export function RpmDots({ score }) {
  const meets = score >= 6; // ≥6 of 10 meets expectations
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
        <div key={i} className={`w-2 h-2.5 rounded-sm ${i <= score ? (meets ? "bg-[#3CC49F]" : "bg-[#C8102E]") : "bg-[#F4F4F4]"}`} />
      ))}
      <Mono className="ml-1.5 text-xs text-slate-500">{score}/10</Mono>
    </div>
  );
}

export function Stat({ label, value, icon: Icon, tone: t = "slate" }) {
  const tones = {
    slate:   "text-[#5D3FD3] bg-[#EFE8FF]",
    amber:   "text-[#9A6400] bg-[#FFF3D6]",
    emerald: "text-[#1A7D5E] bg-[#E8FAF4]",
  };
  return (
    <Card className="px-4 py-3.5 flex items-center gap-3">
      <div className={`grid place-items-center w-9 h-9 rounded-lg ${tones[t]}`}><Icon size={18} /></div>
      <div>
        <div className="text-xl font-semibold text-slate-900 leading-none">{value}</div>
        <div className="text-xs text-slate-500 mt-1">{label}</div>
      </div>
    </Card>
  );
}
