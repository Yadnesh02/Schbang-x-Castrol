"use client";

import { useMemo, useState } from "react";
import { DataBoundary } from "@/components/DataBoundary";
import { Card } from "@/components/Card";
import { SectionHeader } from "@/components/SectionHeader";
import { EChart } from "@/components/charts/EChart";
import {
  aggregateByCreator,
  formatCompact,
  formatPercent,
  CreatorAggregate,
} from "@/lib/metrics";
import type { Post } from "@/lib/types";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

type SortKey = keyof Pick<
  CreatorAggregate,
  "posts" | "views" | "reach" | "engagement" | "avgEngagementRate" | "avgBrandAttention" | "effectiveReach"
>;

const COLS: { key: SortKey; label: string; fmt: (n: number) => string }[] = [
  { key: "posts", label: "Posts", fmt: (n) => n.toString() },
  { key: "reach", label: "Reach", fmt: formatCompact },
  { key: "views", label: "Views", fmt: formatCompact },
  { key: "engagement", label: "Engagement", fmt: formatCompact },
  { key: "avgEngagementRate", label: "Eng. Rate", fmt: (n) => formatPercent(n, 2) },
  { key: "avgBrandAttention", label: "Brand Attn.", fmt: (n) => formatPercent(n, 1) },
  { key: "effectiveReach", label: "Eff. Reach", fmt: formatCompact },
];

function LeaderboardView({ posts }: { posts: Post[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("effectiveReach");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(k);
      setSortDir("desc");
    }
  };

  const aggs = useMemo(() => aggregateByCreator(posts), [posts]);
  const sorted = useMemo(() => {
    const copy = [...aggs];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      return sortDir === "desc" ? bv - av : av - bv;
    });
    return copy;
  }, [aggs, sortKey, sortDir]);

  const byEffReach = useMemo(
    () => [...aggs].sort((a, b) => b.effectiveReach - a.effectiveReach),
    [aggs]
  );

  const rankingOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: { name: string; value: number }[]) => {
        const p = params[0];
        return `<strong>${p.name}</strong><br/>Eff. Reach: ${formatCompact(p.value)}`;
      },
    },
    grid: { left: 8, right: 50, top: 10, bottom: 10, containLabel: true },
    xAxis: {
      type: "value",
      axisLine: { show: false },
      axisLabel: {
        color: "#64748b",
        fontSize: 11,
        formatter: (v: number) => formatCompact(v),
      },
      splitLine: { lineStyle: { color: "#f1f5f9" } },
    },
    yAxis: {
      type: "category",
      data: byEffReach.map((c) => c.creator).reverse(),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: "#334155", fontSize: 11 },
    },
    series: [
      {
        type: "bar",
        data: byEffReach.map((c) => c.effectiveReach).reverse(),
        barWidth: 14,
        itemStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: "#3390fb" },
              { offset: 1, color: "#1d72f0" },
            ],
          },
          borderRadius: [0, 6, 6, 0],
        },
        label: {
          show: true,
          position: "right",
          formatter: (p: { value: number }) => formatCompact(p.value),
          color: "#334155",
          fontSize: 10,
          fontWeight: 600,
        },
      },
    ],
  };

  return (
    <div className="space-y-6">
      <Card>
        <SectionHeader
          title="Creator ranking by Effective Reach"
          subtitle="Effective Reach = Reach × avg. % watching during brand integration. Rewards attention, not vanity."
        />
        <EChart option={rankingOption} height={Math.max(360, aggs.length * 28)} />
      </Card>

      <Card padded={false}>
        <div className="p-5 pb-3">
          <SectionHeader title="Full leaderboard" subtitle="Click any column header to sort." />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-ink-500 bg-surface-muted">
                <th className="text-left font-semibold px-5 py-3">#</th>
                <th className="text-left font-semibold px-3 py-3">Creator</th>
                {COLS.map((c) => (
                  <th
                    key={c.key}
                    className={cn(
                      "px-3 py-3 font-semibold cursor-pointer select-none hover:text-brand-700 text-right"
                    )}
                    onClick={() => toggleSort(c.key)}
                  >
                    <span className="inline-flex items-center gap-1 justify-end">
                      {c.label}
                      {sortKey === c.key ? (
                        sortDir === "desc" ? (
                          <ArrowDown className="w-3 h-3" />
                        ) : (
                          <ArrowUp className="w-3 h-3" />
                        )
                      ) : null}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((c, i) => (
                <tr
                  key={c.creator}
                  className="border-t border-surface-border hover:bg-surface-muted/60"
                >
                  <td className="px-5 py-3 text-ink-500">{i + 1}</td>
                  <td className="px-3 py-3 font-semibold text-ink-900">{c.creator}</td>
                  {COLS.map((col) => (
                    <td key={col.key} className="px-3 py-3 text-right tabular-nums">
                      {col.fmt(c[col.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default function LeaderboardPage() {
  return <DataBoundary>{(posts) => <LeaderboardView posts={posts} />}</DataBoundary>;
}
