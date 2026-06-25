import {
  LayoutDashboard, Users, FileText, BarChart3, ShieldCheck,
  Clock, ScrollText, Settings, Building2, UserCog, Bell
} from "lucide-react";

export const TODAY = "19 Jun 2026";
export const LM_SELF   = "Marcus Lee";
export const HRBP_SELF = "Niresha";
export const HOD_SELF  = "Ahmad Razif";
export const HOD_DEPT  = "Operations";

export const TONE_CLASS = {
  kpi:        "bg-[#EFE8FF] text-[#5D3FD3] ring-[#C3B1F5]",
  review:     "bg-[#E8F3FF] text-[#1A6ECC] ring-[#A8D1FF]",
  accept:     "bg-[#E8FAF4] text-[#1A7D5E] ring-[#A8E8D0]",
  pending:    "bg-[#FFF3D6] text-[#9A6400] ring-[#FFD98A]",
  letter:     "bg-[#EFE8FF] text-[#5D3FD3] ring-[#C3B1F5]",
  sign:       "bg-[#FCD9D9] text-[#C8102E] ring-[#F5A5A5]",
  confirmed:  "bg-[#E8FAF4] text-[#1A7D5E] ring-[#A8E8D0]",
  nconf:      "bg-[#FCD9D9] text-[#D62828] ring-[#F0AAAA]",
  terminated: "bg-[#E0E0E0] text-[#4D4D4D] ring-[#B0B0B0]",
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
    ["reports",   "Reports & Analytics", BarChart3,       "S-12"],
    ["settings",  "Manager Settings",    Settings,        "A-15"],
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
  terminate:       ["Terminated", "text-rose-600 bg-rose-50"],
  notify:          ["Notify",     "text-slate-600 bg-slate-100"],
  kpi:             ["KPI",        "text-slate-600 bg-slate-100"],
};

export const OUTCOME_LABEL = {
  Conf: "Confirmation", EarlyConf: "Early Confirmation", Ext: "Extension",
  NConf: "Non-Confirmation", ActingConf: "Acting Confirmation", ActingNConf: "Acting Non-Confirmation",
};

export const PIE_COLORS = ["#3CC49F", "#FFB84D", "#C8102E", "#5D3FD3", "#409CFF", "#FF9E3D"];

export const inputCls = "w-full text-sm rounded-lg ring-1 ring-slate-200 px-3 py-2 outline-none focus:ring-cyan-400";
