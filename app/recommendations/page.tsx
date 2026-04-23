"use client";

import { DataBoundary } from "@/components/DataBoundary";
import { Card } from "@/components/Card";
import { SectionHeader } from "@/components/SectionHeader";
import { generateCreatorRecommendations, type RecommendationTag } from "@/lib/insights";
import { formatCompact, formatPercent } from "@/lib/metrics";
import { TrendingUp, TrendingDown, Film, Hammer, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

const TAG_META: Record<RecommendationTag, { color: string; bg: string; Icon: typeof TrendingUp }> = {
  "Invest More": { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100", Icon: TrendingUp },
  "Reduce Volume": { color: "text-red-700", bg: "bg-red-50 border-red-100", Icon: TrendingDown },
  "Shift Format": { color: "text-violet-700", bg: "bg-violet-50 border-violet-100", Icon: Film },
  "Fix Hooks": { color: "text-amber-700", bg: "bg-amber-50 border-amber-100", Icon: Hammer },
  "Extend Integration": { color: "text-cyan-700", bg: "bg-cyan-50 border-cyan-100", Icon: Clock },
  "Retention Risk": { color: "text-orange-700", bg: "bg-orange-50 border-orange-100", Icon: AlertTriangle },
  "Steady Performer": { color: "text-slate-700", bg: "bg-slate-50 border-slate-200", Icon: CheckCircle2 },
};

export default function RecommendationsPage() {
  return (
    <DataBoundary>
      {(posts) => {
        const recs = generateCreatorRecommendations(posts);

        return (
          <div className="space-y-6">
            <Card>
              <SectionHeader
                title="Auto-generated creator playbook"
                subtitle="Action tags derived from percentile rank on effective reach, engagement rate, skip rate, retention issues and brand attention."
              />
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 mt-2">
                {recs.map((r) => (
                  <div
                    key={r.creator}
                    className="border border-surface-border rounded-2xl p-4 bg-white hover-lift"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="text-[15px] font-bold">{r.creator}</div>
                        <div className="text-[11.5px] text-ink-500">{r.posts} posts tracked</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {r.tags.map((tag) => {
                        const meta = TAG_META[tag];
                        const Icon = meta.Icon;
                        return (
                          <span
                            key={tag}
                            className={`${meta.bg} ${meta.color} text-[10.5px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1`}
                          >
                            <Icon className="w-3 h-3" /> {tag}
                          </span>
                        );
                      })}
                    </div>
                    <p className="text-[12.5px] text-ink-700 leading-relaxed">{r.summary}</p>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-3 text-[11px]">
                      <Metric label="Effective Reach" value={formatCompact(r.metrics.effectiveReach)} />
                      <Metric label="Eng. Rate" value={formatPercent(r.metrics.avgEngagementRate, 2)} />
                      <Metric label="Brand Attn." value={formatPercent(r.metrics.avgBrandAttention, 1)} />
                      <Metric label="Skip Rate" value={formatPercent(r.metrics.skipRateAvg, 0)} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <SectionHeader
                title="Playbook legend"
                subtitle="What each action tag means and when it fires."
              />
              <div className="grid md:grid-cols-2 gap-3">
                {(Object.keys(TAG_META) as RecommendationTag[]).map((tag) => {
                  const meta = TAG_META[tag];
                  const Icon = meta.Icon;
                  return (
                    <div
                      key={tag}
                      className={`${meta.bg} border rounded-xl px-4 py-3 flex items-start gap-3`}
                    >
                      <div className={`${meta.color} shrink-0 mt-0.5`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className={`text-[13px] font-semibold ${meta.color}`}>{tag}</div>
                        <div className="text-[12px] text-ink-700">{getDescription(tag)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        );
      }}
    </DataBoundary>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-500">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function getDescription(tag: RecommendationTag): string {
  switch (tag) {
    case "Invest More":
      return "Top-quartile effective reach AND engagement rate — renew and scale budget.";
    case "Reduce Volume":
      return "Effective reach below 70% of median — cut post volume or rethink brief.";
    case "Shift Format":
      return "Large gap between best and worst format performance — rebalance content mix.";
    case "Fix Hooks":
      return "High skip rates or frequent 'Needs better hook' labels — provide editorial coaching.";
    case "Extend Integration":
      return "Brand attention below 40% — test longer or better-placed integration windows.";
    case "Retention Risk":
      return ">15% posts flagged with mid-way audience drop-off — revisit pacing and narrative arc.";
    case "Steady Performer":
      return "Consistent across all metrics — maintain current cadence.";
  }
}
