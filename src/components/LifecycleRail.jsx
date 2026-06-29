import { CheckCircle2 } from "lucide-react";
import { getStages, currentStageKey } from "../utils/lifecycle";

export default function LifecycleRail({ rec }) {
  const stages = getStages(rec);
  const curKey = currentStageKey(rec);
  const curIdx = stages.findIndex((s) => s.key === curKey);
  const done       = rec.status === "Complete-Conf" || rec.status === "Complete-NConf";

  return (
    <div className="pb-2">
      <div className="flex flex-wrap items-start gap-y-3">
        {stages.map((s, i) => {
          const past   = i < curIdx || done;
          const isCur  = i === curIdx && !done;
          const future = !past && !isCur;
          return (
            <div key={s.key} className="flex items-center">
              <div className="flex flex-col items-center w-[88px] text-center">
                <div
                  className={`grid place-items-center w-7 h-7 rounded-full text-[11px] font-semibold transition
                    ${past   ? "bg-[#3CC49F] text-[#0F4B37]" : ""}
                    ${isCur  ? "text-white" : ""}
                    ${future ? "bg-white text-slate-300" : ""}`}
                  style={{
                    ...(isCur  ? { background: "var(--brand-red)" } : {}),
                    ...(future ? { border: "2px solid #C3B1F5" } : {}),
                    ...(past   ? {} : isCur ? { border: "2px solid #C8102E" } : {}),
                  }}
                >
                  {past ? <CheckCircle2 size={15} /> : i + 1}
                </div>
                <div className={`mt-1.5 text-[10.5px] leading-tight ${isCur ? "text-[#C8102E] font-semibold" : past ? "text-[#4D4D4D]" : "text-slate-400"}`}>
                  {s.label}
                </div>
              </div>
              {i < stages.length - 1 && (
                <div className={`h-0.5 w-5 -mt-4 ${i < curIdx || done ? "bg-[#3CC49F]" : "bg-[#C3B1F5]"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
