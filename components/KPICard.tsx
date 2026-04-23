"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KPICardProps {
  label: string;
  value: string;
  sublabel?: string;
  Icon?: LucideIcon;
  accent?: "brand" | "red" | "green" | "amber" | "violet";
  trend?: { value: number; direction: "up" | "down" | "flat" };
}

const accentMap = {
  brand: "bg-brand-50 text-brand-700",
  red: "bg-red-50 text-red-600",
  green: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  violet: "bg-violet-50 text-violet-600",
};

export function KPICard({ label, value, sublabel, Icon, accent = "brand", trend }: KPICardProps) {
  return (
    <div className="card hover-lift p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <span className="text-[12px] uppercase tracking-wider text-ink-500 font-semibold">
          {label}
        </span>
        {Icon ? (
          <div className={cn("w-9 h-9 rounded-xl grid place-items-center", accentMap[accent])}>
            <Icon className="w-4 h-4" />
          </div>
        ) : null}
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-[26px] font-bold tracking-tight text-ink-900">{value}</div>
        {trend ? (
          <span
            className={cn(
              "text-[11px] font-semibold px-1.5 py-0.5 rounded-md",
              trend.direction === "up" && "bg-emerald-50 text-emerald-600",
              trend.direction === "down" && "bg-red-50 text-red-600",
              trend.direction === "flat" && "bg-slate-100 text-ink-500"
            )}
          >
            {trend.direction === "up" ? "▲" : trend.direction === "down" ? "▼" : "●"}{" "}
            {Math.abs(trend.value).toFixed(1)}%
          </span>
        ) : null}
      </div>
      {sublabel ? <div className="text-[12px] text-ink-500">{sublabel}</div> : null}
    </div>
  );
}
