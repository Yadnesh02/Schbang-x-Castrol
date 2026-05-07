"use client";

import { TrendingUp, IndianRupee, Sparkles, Coins, Receipt, Layers } from "lucide-react";
import type { KPIs } from "@/lib/metrics";
import { formatINR, formatINRPrecise, formatPercent } from "@/lib/metrics";
import { cn } from "@/lib/utils";

interface CommercialPanelProps {
  kpis: KPIs;
}

interface MiniStatProps {
  label: string;
  value: string;
  sublabel?: string;
  Icon: typeof TrendingUp;
  tone?: "default" | "amber" | "violet" | "emerald";
}

const toneMap = {
  default: "bg-white/80 text-brand-700",
  amber: "bg-amber-50 text-amber-700",
  violet: "bg-violet-50 text-violet-700",
  emerald: "bg-emerald-50 text-emerald-700",
};

function MiniStat({ label, value, sublabel, Icon, tone = "default" }: MiniStatProps) {
  return (
    <div className="bg-white/95 backdrop-blur rounded-xl border border-white/60 px-3 sm:px-4 py-3 sm:py-3.5 shadow-sm flex flex-col gap-1 sm:gap-1.5 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9.5px] sm:text-[10.5px] uppercase tracking-wider text-ink-500 font-semibold truncate">
          {label}
        </span>
        <div className={cn("w-6 h-6 sm:w-7 sm:h-7 rounded-lg grid place-items-center shrink-0", toneMap[tone])}>
          <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </div>
      </div>
      <div className="text-[15px] sm:text-[18px] md:text-[19px] font-bold tracking-tight text-ink-900 leading-tight truncate">
        {value}
      </div>
      {sublabel ? <div className="text-[10.5px] sm:text-[11px] text-ink-500 truncate">{sublabel}</div> : null}
    </div>
  );
}

export function CommercialPanel({ kpis }: CommercialPanelProps) {
  const hasData = kpis.totalSpend > 0 || kpis.totalMediaValueWithPremium > 0;
  const multiple = kpis.totalSpend > 0 ? kpis.totalMediaValueWithPremium / kpis.totalSpend : 0;
  const ratioPct = kpis.totalMediaValueWithPremium
    ? Math.min(100, (kpis.totalSpend / kpis.totalMediaValueWithPremium) * 100)
    : 0;
  const positive = kpis.roiPct >= 100;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-brand-200/70 shadow-card bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 text-white">
      <div
        aria-hidden
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 20%, rgba(255,255,255,0.5) 0%, transparent 40%), radial-gradient(circle at 85% 80%, rgba(255,255,255,0.35) 0%, transparent 45%)",
        }}
      />

      <div className="relative grid lg:grid-cols-5 gap-0">
        <div className="lg:col-span-2 p-4 sm:p-6 md:p-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/20">
          <div>
            <div className="flex items-center gap-2 text-white/80 text-[10.5px] sm:text-[11px] uppercase tracking-[0.18em] font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Commercial Impact
            </div>
            <div className="mt-3 flex items-baseline gap-2 flex-wrap">
              <span className="text-[40px] sm:text-[52px] md:text-[60px] font-black tracking-tight leading-none">
                {hasData ? formatPercent(kpis.roiPct, 1) : "—"}
              </span>
              <span
                className={cn(
                  "text-[10.5px] sm:text-[11px] font-bold px-2 py-1 rounded-md",
                  positive ? "bg-emerald-400/25 text-emerald-100" : "bg-amber-400/25 text-amber-100"
                )}
              >
                {positive ? "▲" : "▼"} ROI
              </span>
            </div>
            <div className="mt-1 text-white/85 text-[12.5px] sm:text-[14px] font-medium leading-snug">
              {hasData
                ? `${multiple.toFixed(2)}× return — ₹${multiple.toFixed(2)} of media value generated per ₹1 spent`
                : "Awaiting cost & media value data"}
            </div>
          </div>

          {hasData ? (
            <div className="mt-5 sm:mt-6">
              <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-1 text-[10.5px] sm:text-[11px] text-white/85 mb-2">
                <span className="font-semibold uppercase tracking-wider">Spend vs Media Value</span>
                <span className="font-mono whitespace-nowrap">
                  {formatINR(kpis.totalSpend)} → {formatINR(kpis.totalMediaValueWithPremium)}
                </span>
              </div>
              <div className="relative h-3 rounded-full bg-white/15 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-white/95 rounded-full transition-all"
                  style={{ width: `${ratioPct}%` }}
                />
                <div
                  className="absolute inset-y-0 left-0 bg-emerald-300/90 rounded-full transition-all"
                  style={{
                    left: `${ratioPct}%`,
                    width: `${100 - ratioPct}%`,
                  }}
                />
              </div>
              <div className="mt-2 flex justify-between text-[10.5px] text-white/70">
                <span>
                  <span className="inline-block w-2 h-2 rounded-sm bg-white align-middle mr-1.5" />
                  Spend
                </span>
                <span>
                  <span className="inline-block w-2 h-2 rounded-sm bg-emerald-300 align-middle mr-1.5" />
                  Net media value uplift
                </span>
              </div>
            </div>
          ) : null}
        </div>

        <div className="lg:col-span-3 p-3 sm:p-5 md:p-6 grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 bg-gradient-to-br from-white/10 to-white/5">
          <MiniStat
            label="Total Spend"
            value={formatINR(kpis.totalSpend)}
            sublabel={`${kpis.costedDeliverables.toLocaleString()} costed deliverables`}
            Icon={Receipt}
            tone="amber"
          />
          <MiniStat
            label="Media Value (w/ Premium)"
            value={formatINR(kpis.totalMediaValueWithPremium)}
            sublabel={`Base MV ${formatINR(kpis.totalMediaValue)}`}
            Icon={IndianRupee}
            tone="emerald"
          />
          <MiniStat
            label="Avg CPU"
            value={kpis.avgCpu > 0 ? formatINRPrecise(kpis.avgCpu) : "—"}
            sublabel="Cost per view"
            Icon={Coins}
            tone="violet"
          />
          <MiniStat
            label="Avg Premium"
            value={formatPercent(kpis.avgPremiumPct, 1)}
            sublabel="MV uplift applied"
            Icon={TrendingUp}
            tone="default"
          />
          <MiniStat
            label="Per-Deliverable Cost"
            value={
              kpis.costedDeliverables > 0
                ? formatINR(kpis.totalSpend / kpis.costedDeliverables)
                : "—"
            }
            sublabel="Avg across deliverables"
            Icon={Layers}
            tone="amber"
          />
          <MiniStat
            label="Net Uplift"
            value={
              kpis.totalSpend > 0
                ? formatINR(kpis.totalMediaValueWithPremium - kpis.totalSpend)
                : "—"
            }
            sublabel="Media value − spend"
            Icon={Sparkles}
            tone="emerald"
          />
        </div>
      </div>
    </div>
  );
}
