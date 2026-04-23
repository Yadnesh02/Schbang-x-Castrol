"use client";

import { DataBoundary } from "@/components/DataBoundary";
import { KPICard } from "@/components/KPICard";
import { Card } from "@/components/Card";
import { SectionHeader } from "@/components/SectionHeader";
import { InsightCallout } from "@/components/InsightCallout";
import { EChart } from "@/components/charts/EChart";
import {
  aggregateByCampaign,
  aggregateByFormat,
  aggregateByMonth,
  computeKPIs,
  formatCompact,
  formatPercent,
} from "@/lib/metrics";
import { topInsightCallouts } from "@/lib/insights";
import {
  Eye,
  Users,
  BarChart3,
  Target,
  FileText,
  Activity,
} from "lucide-react";

export default function Page() {
  return (
    <DataBoundary>
      {(posts) => {
        const kpis = computeKPIs(posts);
        const monthly = aggregateByMonth(posts);
        const formats = aggregateByFormat(posts).sort((a, b) => b.reach - a.reach);
        const campaigns = aggregateByCampaign(posts).sort((a, b) => b.reach - a.reach);
        const callouts = topInsightCallouts(posts);

        const trendOption = {
          tooltip: {
            trigger: "axis",
            backgroundColor: "#ffffff",
            borderColor: "#e2e8f0",
            textStyle: { color: "#0f172a" },
          },
          legend: {
            data: ["Reach", "Views", "Engagement"],
            right: 0,
            top: 0,
            textStyle: { color: "#64748b" },
          },
          grid: { left: 8, right: 8, bottom: 60, top: 40, containLabel: true },
          xAxis: {
            type: "category",
            data: monthly.map((m) => m.month),
            axisLine: { lineStyle: { color: "#e2e8f0" } },
            axisLabel: { color: "#64748b", fontSize: 11 },
          },
          yAxis: {
            type: "value",
            splitLine: { lineStyle: { color: "#f1f5f9" } },
            axisLabel: {
              color: "#64748b",
              fontSize: 11,
              formatter: (v: number) => formatCompact(v),
            },
          },
          dataZoom: [
            { type: "inside", start: 0, end: 100 },
            { type: "slider", height: 20, bottom: 10, borderColor: "#e2e8f0" },
          ],
          series: [
            {
              name: "Reach",
              type: "line",
              smooth: true,
              symbol: "circle",
              symbolSize: 6,
              data: monthly.map((m) => m.reach),
              lineStyle: { width: 2.5, color: "#1d72f0" },
              itemStyle: { color: "#1d72f0" },
              areaStyle: {
                color: {
                  type: "linear",
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: "rgba(29,114,240,0.25)" },
                    { offset: 1, color: "rgba(29,114,240,0)" },
                  ],
                },
              },
            },
            {
              name: "Views",
              type: "line",
              smooth: true,
              symbol: "circle",
              symbolSize: 5,
              data: monthly.map((m) => m.views),
              lineStyle: { width: 2, color: "#10b981" },
              itemStyle: { color: "#10b981" },
            },
            {
              name: "Engagement",
              type: "line",
              smooth: true,
              symbol: "circle",
              symbolSize: 5,
              data: monthly.map((m) => m.engagement),
              lineStyle: { width: 2, color: "#f59e0b" },
              itemStyle: { color: "#f59e0b" },
            },
          ],
        };

        const formatDonutOption = {
          tooltip: {
            trigger: "item",
            formatter: (p: { name: string; value: number; percent: number }) =>
              `<strong>${p.name}</strong><br/>${formatCompact(p.value)} (${p.percent.toFixed(1)}%)`,
          },
          legend: { show: false },
          series: [
            {
              type: "pie",
              radius: ["52%", "78%"],
              avoidLabelOverlap: true,
              label: {
                show: true,
                position: "outside",
                formatter: (p: { name: string; value: number; percent: number }) =>
                  `{name|${p.name}}\n{val|${formatCompact(p.value)} · ${p.percent.toFixed(0)}%}`,
                rich: {
                  name: { color: "#0f172a", fontSize: 11, fontWeight: 600, lineHeight: 14 },
                  val: { color: "#64748b", fontSize: 10, lineHeight: 14 },
                },
              },
              labelLine: { show: true, length: 10, length2: 8, lineStyle: { color: "#cbd5e1" } },
              itemStyle: { borderRadius: 6, borderWidth: 2, borderColor: "#fff" },
              data: formats.map((f, i) => ({
                name: f.format,
                value: f.reach,
                itemStyle: { color: ["#1d72f0", "#10b981", "#f59e0b", "#8b5cf6"][i % 4] },
              })),
            },
          ],
        };

        const campaignBarOption = {
          tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
          grid: { left: 8, right: 16, top: 10, bottom: 20, containLabel: true },
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
            data: campaigns.map((c) => c.campaign),
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: "#334155", fontSize: 12 },
          },
          series: [
            {
              type: "bar",
              data: campaigns.map((c) => c.reach),
              barWidth: 18,
              itemStyle: { color: "#1d72f0", borderRadius: [0, 6, 6, 0] },
              label: {
                show: true,
                position: "right",
                formatter: (p: { value: number }) => formatCompact(p.value),
                color: "#334155",
                fontSize: 11,
                fontWeight: 600,
              },
            },
          ],
        };

        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
              <KPICard
                label="Total Reach"
                value={formatCompact(kpis.reach)}
                sublabel="Unique people reached"
                Icon={Target}
                accent="brand"
              />
              <KPICard
                label="Total Views"
                value={formatCompact(kpis.views)}
                sublabel="Impressions across formats"
                Icon={Eye}
                accent="green"
              />
              <KPICard
                label="Engagement"
                value={formatCompact(kpis.engagement)}
                sublabel="Likes + comments + shares"
                Icon={Activity}
                accent="amber"
              />
              <KPICard
                label="Avg Engagement Rate"
                value={formatPercent(kpis.avgEngagementRate, 2)}
                sublabel="Per-post average"
                Icon={BarChart3}
                accent="violet"
              />
              <KPICard
                label="Brand Attention"
                value={formatPercent(kpis.avgBrandAttention, 1)}
                sublabel="Avg % watching during integration"
                Icon={Target}
                accent="red"
              />
              <KPICard
                label="Active Creators"
                value={String(kpis.creators)}
                sublabel={`${kpis.posts.toLocaleString()} posts tracked`}
                Icon={Users}
                accent="brand"
              />
            </div>

            {callouts.length ? (
              <div className="grid md:grid-cols-3 gap-3">
                {callouts.slice(0, 3).map((text, i) => (
                  <InsightCallout
                    key={i}
                    text={text}
                    kind={i === 0 ? "success" : i === 1 ? "info" : "warn"}
                  />
                ))}
              </div>
            ) : null}

            <Card>
              <SectionHeader
                title="Performance over time"
                subtitle="Monthly reach, views and engagement — use the slider to zoom."
              />
              <EChart option={trendOption} height={360} />
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <SectionHeader
                  title="Reach by format"
                  subtitle="Which content type compounds audience."
                />
                <EChart option={formatDonutOption} height={300} />
              </Card>
              <Card>
                <SectionHeader
                  title="Reach by campaign"
                  subtitle="Campaign A vs. Campaign B vs. Promo."
                />
                <EChart option={campaignBarOption} height={300} />
              </Card>
            </div>

            <div className="grid md:grid-cols-4 gap-3 text-[12px]">
              <Card className="text-center">
                <div className="text-ink-500 uppercase tracking-wider text-[10px] font-semibold">Avg Skip Rate</div>
                <div className="text-[22px] font-bold mt-1">{formatPercent(kpis.avgSkipRate, 0)}</div>
                <div className="text-ink-400 text-[11px] mt-1">Reel drop-off</div>
              </Card>
              <Card className="text-center">
                <div className="text-ink-500 uppercase tracking-wider text-[10px] font-semibold">Viral Posts</div>
                <div className="text-[22px] font-bold mt-1">
                  {posts.filter((p) => p.insight === "Viral potential shown").length}
                </div>
                <div className="text-ink-400 text-[11px] mt-1">Flagged by analysts</div>
              </Card>
              <Card className="text-center">
                <div className="text-ink-500 uppercase tracking-wider text-[10px] font-semibold">Brand Integration Well Received</div>
                <div className="text-[22px] font-bold mt-1">
                  {posts.filter((p) => p.insight === "Brand integration well received").length}
                </div>
                <div className="text-ink-400 text-[11px] mt-1">Positive integration signal</div>
              </Card>
              <Card className="text-center">
                <div className="text-ink-500 uppercase tracking-wider text-[10px] font-semibold">Needs Better Hook</div>
                <div className="text-[22px] font-bold mt-1 text-amber-600">
                  {posts.filter((p) => p.insight === "Needs better hook next time").length}
                </div>
                <div className="text-ink-400 text-[11px] mt-1">Creative coaching opportunity</div>
              </Card>
            </div>
          </div>
        );
      }}
    </DataBoundary>
  );
}
