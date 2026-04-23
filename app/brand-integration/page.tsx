"use client";

import { DataBoundary } from "@/components/DataBoundary";
import { Card } from "@/components/Card";
import { SectionHeader } from "@/components/SectionHeader";
import { EChart } from "@/components/charts/EChart";
import { KPICard } from "@/components/KPICard";
import { formatPercent } from "@/lib/metrics";
import { Target, Clock, Eye, AlertCircle } from "lucide-react";

export default function BrandIntegrationPage() {
  return (
    <DataBoundary>
      {(posts) => {
        const withIntegration = posts.filter(
          (p) => p.brandIntegrationTimeSec != null && p.brandIntegrationAttentionPct != null
        );
        const avgIntegrationTime =
          withIntegration.reduce((a, b) => a + (b.brandIntegrationTimeSec ?? 0), 0) /
          (withIntegration.length || 1);
        const avgAttention =
          withIntegration.reduce((a, b) => a + (b.brandIntegrationAttentionPct ?? 0), 0) /
          (withIntegration.length || 1);
        const highAttention = withIntegration.filter((p) => (p.brandIntegrationAttentionPct ?? 0) >= 60).length;
        const lowAttention = withIntegration.filter((p) => (p.brandIntegrationAttentionPct ?? 0) < 30).length;

        const buckets = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
        const bucketCounts = buckets.slice(0, -1).map((lo, i) => {
          const hi = buckets[i + 1];
          return withIntegration.filter(
            (p) => (p.brandIntegrationAttentionPct ?? 0) >= lo && (p.brandIntegrationAttentionPct ?? 0) < hi
          ).length;
        });
        const histogramOption = {
          tooltip: { trigger: "axis" },
          grid: { left: 8, right: 8, top: 10, bottom: 30, containLabel: true },
          xAxis: {
            type: "category",
            data: buckets.slice(0, -1).map((lo, i) => `${lo}-${buckets[i + 1]}%`),
            axisLine: { lineStyle: { color: "#e2e8f0" } },
            axisLabel: { color: "#64748b", fontSize: 10 },
          },
          yAxis: {
            type: "value",
            splitLine: { lineStyle: { color: "#f1f5f9" } },
            axisLabel: { color: "#64748b", fontSize: 11 },
          },
          series: [
            {
              type: "bar",
              data: bucketCounts,
              itemStyle: {
                color: {
                  type: "linear",
                  x: 0,
                  y: 1,
                  x2: 0,
                  y2: 0,
                  colorStops: [
                    { offset: 0, color: "#f59e0b" },
                    { offset: 1, color: "#10b981" },
                  ],
                },
                borderRadius: [6, 6, 0, 0],
              },
              barWidth: 28,
            },
          ],
        };

        const byCreator = new Map<string, { sumAtt: number; count: number }>();
        for (const p of withIntegration) {
          const curr = byCreator.get(p.creator) ?? { sumAtt: 0, count: 0 };
          curr.sumAtt += p.brandIntegrationAttentionPct ?? 0;
          curr.count += 1;
          byCreator.set(p.creator, curr);
        }
        const creatorAtt = Array.from(byCreator.entries())
          .map(([creator, v]) => ({ creator, avg: v.sumAtt / v.count }))
          .sort((a, b) => b.avg - a.avg);

        const creatorAttOption = {
          tooltip: {
            trigger: "axis",
            axisPointer: { type: "shadow" },
            formatter: (p: { name: string; value: number }[]) =>
              `${p[0].name}<br/>Avg Attention: ${p[0].value.toFixed(1)}%`,
          },
          grid: { left: 8, right: 40, top: 10, bottom: 10, containLabel: true },
          xAxis: {
            type: "value",
            max: 100,
            axisLine: { show: false },
            axisLabel: { color: "#64748b", fontSize: 11, formatter: "{value}%" },
            splitLine: { lineStyle: { color: "#f1f5f9" } },
          },
          yAxis: {
            type: "category",
            data: creatorAtt.map((c) => c.creator).reverse(),
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: "#334155", fontSize: 11 },
          },
          series: [
            {
              type: "bar",
              data: creatorAtt
                .map((c) => ({
                  value: c.avg,
                  itemStyle: {
                    color:
                      c.avg >= 60 ? "#10b981" : c.avg >= 45 ? "#1d72f0" : c.avg >= 30 ? "#f59e0b" : "#e4002b",
                    borderRadius: [0, 6, 6, 0],
                  },
                }))
                .reverse(),
              barWidth: 14,
              label: {
                show: true,
                position: "right",
                formatter: (p: { value: number }) => `${p.value.toFixed(0)}%`,
                color: "#334155",
                fontSize: 10,
                fontWeight: 600,
              },
            },
          ],
        };

        const topAttention = [...withIntegration]
          .sort((a, b) => (b.brandIntegrationAttentionPct ?? 0) - (a.brandIntegrationAttentionPct ?? 0))
          .slice(0, 8);
        const bottomAttention = [...withIntegration]
          .sort((a, b) => (a.brandIntegrationAttentionPct ?? 0) - (b.brandIntegrationAttentionPct ?? 0))
          .slice(0, 8);

        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-4 gap-4">
              <KPICard
                label="Avg Brand Attention"
                value={formatPercent(avgAttention, 1)}
                sublabel={`Across ${withIntegration.length.toLocaleString()} measurable posts`}
                Icon={Target}
                accent="red"
              />
              <KPICard
                label="Avg Integration Time"
                value={`${avgIntegrationTime.toFixed(0)}s`}
                sublabel="Length of brand-mention window"
                Icon={Clock}
                accent="brand"
              />
              <KPICard
                label="High-attention Posts"
                value={highAttention.toLocaleString()}
                sublabel="≥60% retained during brand moment"
                Icon={Eye}
                accent="green"
              />
              <KPICard
                label="Low-attention Posts"
                value={lowAttention.toLocaleString()}
                sublabel="<30% — ad-dilution risk"
                Icon={AlertCircle}
                accent="amber"
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <SectionHeader
                  title="Attention-retention histogram"
                  subtitle="How many posts hold audience through the brand moment."
                />
                <EChart option={histogramOption} height={320} />
              </Card>
              <Card>
                <SectionHeader
                  title="Creator brand-attention ranking"
                  subtitle="Who keeps eyeballs on the brand — renewal signal."
                />
                <EChart option={creatorAttOption} height={Math.max(320, creatorAtt.length * 26)} />
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card padded={false}>
                <div className="p-5 pb-3">
                  <SectionHeader title="Best brand-integration moments" subtitle="Highest retention during brand mention." />
                </div>
                <table className="w-full text-[13px]">
                  <thead className="bg-surface-muted text-[11px] uppercase tracking-wider text-ink-500">
                    <tr>
                      <th className="text-left px-5 py-2 font-semibold">Creator</th>
                      <th className="text-left px-3 py-2 font-semibold">Format</th>
                      <th className="text-right px-3 py-2 font-semibold">Int. Time</th>
                      <th className="text-right px-5 py-2 font-semibold">% Watching</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topAttention.map((p, i) => (
                      <tr key={i} className="border-t border-surface-border hover:bg-surface-muted/60">
                        <td className="px-5 py-2 font-medium">{p.creator}</td>
                        <td className="px-3 py-2 text-ink-500">{p.format}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{p.brandIntegrationTimeSec}s</td>
                        <td className="px-5 py-2 text-right font-semibold text-emerald-600 tabular-nums">
                          {p.brandIntegrationAttentionPct}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
              <Card padded={false}>
                <div className="p-5 pb-3">
                  <SectionHeader title="Ad-dilution risks" subtitle="Lowest brand-moment retention — optimize integration." />
                </div>
                <table className="w-full text-[13px]">
                  <thead className="bg-surface-muted text-[11px] uppercase tracking-wider text-ink-500">
                    <tr>
                      <th className="text-left px-5 py-2 font-semibold">Creator</th>
                      <th className="text-left px-3 py-2 font-semibold">Format</th>
                      <th className="text-right px-3 py-2 font-semibold">Int. Time</th>
                      <th className="text-right px-5 py-2 font-semibold">% Watching</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bottomAttention.map((p, i) => (
                      <tr key={i} className="border-t border-surface-border hover:bg-surface-muted/60">
                        <td className="px-5 py-2 font-medium">{p.creator}</td>
                        <td className="px-3 py-2 text-ink-500">{p.format}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{p.brandIntegrationTimeSec}s</td>
                        <td className="px-5 py-2 text-right font-semibold text-red-600 tabular-nums">
                          {p.brandIntegrationAttentionPct}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          </div>
        );
      }}
    </DataBoundary>
  );
}
