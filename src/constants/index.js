import {
  LayoutDashboard, Users, FileText, BarChart3, ShieldCheck,
  Clock, ScrollText, Settings, Building2, UserCog, Bell, ClipboardList
} from "lucide-react";

export const TODAY = "19 Jun 2026";
export const LM_SELF   = "Marcus Lee";
export const HRBP_SELF = "Niresha";
export const HOD_SELF  = "Ahmad Razif";
export const HOD_DEPT  = "Operations";

export const TONE_CLASS = {
  kpi:        "bg-[#F5F3FF] text-[#6D28D9] ring-[#DDD6FE]",
  review:     "bg-[#EFF6FF] text-[#1D4ED8] ring-[#BFDBFE]",
  extension:  "bg-[#FFF7ED] text-[#C2410C] ring-[#FED7AA]",
  accept:     "bg-[#ECFEFF] text-[#0E7490] ring-[#A5F3FC]",
  decision:   "bg-[#F8FAFC] text-[#475569] ring-[#CBD5E1]",
  pending:    "bg-[#FFFBEB] text-[#B45309] ring-[#FCD34D]",
  letter:     "bg-[#EEF2FF] text-[#4338CA] ring-[#C7D2FE]",
  sign:       "bg-[#FFF1F2] text-[#BE123C] ring-[#FDA4AF]",
  complete:   "bg-[#F8FAFC] text-[#64748B] ring-[#CBD5E1]",
};

export const OUTCOME_TO_SIGN = {
  Conf:        "Pending-Conf-Sign-Off",
  EarlyConf:   "Pending-Conf-Sign-Off",
  Ext:         "Pending-Ext-Sign-Off",
  NConf:       "Pending-NConf-Sign-Off",
  ActingConf:  "Pending-ActingConf-Sign-Off",
  ActingNConf: "Pending-ActingNConf-Sign-Off",
};

export const OUTCOME_TO_LETTER = {
  Conf:        "Conf-Letter",
  EarlyConf:   "EarlyConf-Letter",
  Ext:         "Ext-Letter",
  NConf:       "NConf-Letter",
  ActingConf:  "Acting-Conf-Letter",
  ActingNConf: "Acting-NConf-Letter",
};

export const ROLES = [
  { id: "LM",   label: "Line Manager",          who: LM_SELF,      icon: Users,       scope: "Own team only" },
  { id: "DR",   label: "Direct Report",          who: "self",       icon: UserCog,     scope: "Own record only" },
  { id: "HOD",  label: "Head of Department",     who: HOD_SELF,     icon: Building2,   scope: `${HOD_DEPT} dept · read-only` },
  { id: "HRBP", label: "HR Business Partner",    who: HRBP_SELF,    icon: ShieldCheck, scope: "Organisation-wide" },
  { id: "LEAD", label: "Senior Leadership",       who: "HR Director", icon: Building2, scope: "Aggregate, no names" },
  { id: "ADMIN", label: "System Administrator",  who: "IT Core",     icon: Settings,   scope: "Master Override" },
];

export const NAV = {
  LM: [
    ["dashboard", "My Team Probation",   LayoutDashboard, "S-01"],
    ["reviews",   "Reviews & KPIs",      ClipboardList,   "S-03"],
    ["reports",   "Reports & Analytics", BarChart3,       "S-12"],
  ],
  DR: [
    ["myprob", "My Probation", UserCog, "S-04"],
  ],
  HRBP: [
    ["pipeline", "Probation Pipeline",   LayoutDashboard, "S-06"],
    ["sla",      "SLA Tracker",          Clock,           "S-08"],
    ["audit",    "Audit Trail",          ScrollText,      "S-09"],
    ["reports",  "Reports & Analytics",  BarChart3,       "S-12"],
    ["notifications", "Notification Engine", Bell,        "S-05"],
    ["console",  "System Console",       Settings,        "A-01·02·04"],
    ["settings_upload", "Settings/Upload Document", FileText, "A-05"],
  ],
  HOD: [
    ["pipeline",       "Department Pipeline",    LayoutDashboard, "S-06"],
    ["notifications",  "Status Notifications",   Bell,            "N-15"],
  ],
  LEAD: [
    ["reports", "Reports & Analytics", BarChart3, "S-12"],
  ],
  ADMIN: [
    ["console",  "System Console",       Settings,        "A-01"],
    ["audit",    "Master Audit",         ScrollText,      "S-09"],
    ["notifications", "Dispatcher",       Bell,           "S-05"],
  ],
};

export const EVENT_META = {
  create:          ["Created",    "text-slate-600 bg-slate-100"],
  trigger:         ["Trigger",    "text-blue-600 bg-blue-50"],
  schedule:        ["Scheduler",  "text-blue-600 bg-blue-50"],
  "review-submit": ["Review",     "text-blue-600 bg-blue-50"],
  accept:          ["Acceptance", "text-cyan-600 bg-cyan-50"],
  "outcome-set":   ["LM Decision","text-cyan-600 bg-cyan-50"],
  "hrbp-ack":      ["Acknowledged","text-emerald-600 bg-emerald-50"],
  "hrbp-return":   ["Returned",  "text-amber-600 bg-amber-50"],
  "letter-gen":    ["Letter",     "text-indigo-600 bg-indigo-50"],
  dispatch:        ["Dispatch",   "text-violet-600 bg-violet-50"],
  sign:            ["Signed",     "text-violet-600 bg-violet-50"],
  "emp-update":    ["Status",     "text-emerald-600 bg-emerald-50"],
  "sla-start":     ["SLA",        "text-amber-600 bg-amber-50"],
  "sla-breach":    ["SLA breach", "text-rose-600 bg-rose-50"],
  "day91-breach":  ["Day 91 breach", "text-rose-600 bg-rose-50"],
  escalation:      ["Escalation", "text-amber-600 bg-amber-50"],
  notify:          ["Notify",     "text-slate-600 bg-slate-100"],
  kpi:             ["KPI",        "text-slate-600 bg-slate-100"],
};

export const OUTCOME_LABEL = {
  Conf: "Confirmation", EarlyConf: "Early Confirmation", Ext: "Extension",
  NConf: "Non-Confirmation", ActingConf: "Acting Confirmation", ActingNConf: "Acting Non-Confirmation",
};

export const PIE_COLORS = ["#3CC49F", "#FFB84D", "#C8102E", "#5D3FD3", "#409CFF", "#FF9E3D"];

export const inputCls = "w-full text-sm rounded-lg ring-1 ring-slate-200 px-3 py-2 outline-none focus:ring-cyan-400";
