"use client";

import { DataBoundary } from "@/components/DataBoundary";
import { Card } from "@/components/Card";
import { SectionHeader } from "@/components/SectionHeader";
import { EChart } from "@/components/charts/EChart";
import { aggregateByMonth, formatCompact, topViralPosts } from "@/lib/metrics";
import { ExternalLink, Flame } from "lucide-react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const INSIGHT_COLORS: Record<string, string> = {
  "Great performance": "#10b981",
  "Viral potential shown": "#8b5cf6",
  "Shares drove the reach": "#1d72f0",
  "Comments indicate high brand recall": "#06b6d4",
  "Brand integration well received": "#14b8a6",
  "Average reach": "#94a3b8",
  "Audience retention dropped halfway": "#f97316",
  "High skip rate but good engagement": "#f59e0b",
  "Needs better hook next time": "#e4002b",
  Unlabeled: "#cbd5e1",
};

export default function ContentTrendsPage() {
  return (
    <DataBoundary>
      {(posts) => {
        const monthly = aggregateByMonth(posts);
        const viral = topViralPosts(posts, 15);

        const trendOption = {
          tooltip: { trigger: "axis" },
          legend: {
            data: ["Reach", "Views", "Engagement", "Posts"],
            right: 0,
            textStyle: { color: "#64748b" },
          },
          grid: { left: 8, right: 50, top: 40, bottom: 80, containLabel: true },
          xAxis: {
            type: "category",
            data: monthly.map((m) => m.month),
            axisLine: { lineStyle: { color: "#e2e8f0" } },
            axisLabel: { color: "#64748b", fontSize: 11 },
          },
          yAxis: [
            {
              type: "value",
              splitLine: { lineStyle: { color: "#f1f5f9" } },
              axisLabel: { color: "#64748b", fontSize: 11, formatter: (v: number) => formatCompact(v) },
            },
            {
              type: "value",
              position: "right",
              splitLine: { show: false },
              axisLabel: { color: "#64748b", fontSize: 11 },
            },
          ],
          dataZoom: [
            { type: "inside", start: 0, end: 100 },
            { type: "slider", height: 20, bottom: 20, borderColor: "#e2e8f0" },
          ],
          series: [
            {
              name: "Reach",
              type: "line",
              smooth: true,
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
                    { offset: 0, color: "rgba(29,114,240,0.2)" },
                    { offset: 1, color: "rgba(29,114,240,0)" },
                  ],
                },
              },
            },
            {
              name: "Views",
              type: "line",
              smooth: true,
              data: monthly.map((m) => m.views),
              lineStyle: { width: 2, color: "#10b981" },
              itemStyle: { color: "#10b981" },
            },
            {
              name: "Engagement",
              type: "line",
              smooth: true,
              data: monthly.map((m) => m.engagement),
              lineStyle: { width: 2, color: "#f59e0b" },
              itemStyle: { color: "#f59e0b" },
            },
            {
              name: "Posts",
              type: "bar",
              yAxisIndex: 1,
              data: monthly.map((m) => m.posts),
              itemStyle: { color: "rgba(148,163,184,0.45)", borderRadius: [4, 4, 0, 0] },
              barWidth: 8,
            },
          ],
        };

        const weekdayBuckets: Record<number, { posts: number; reach: number; engagement: number }> = {};
        for (const p of posts) {
          if (!p.date) continue;
          const d = p.date.getUTCDay();
          const b = weekdayBuckets[d] ?? { posts: 0, reach: 0, engagement: 0 };
          b.posts += 1;
          b.reach += p.reach;
          b.engagement += p.engagement;
          weekdayBuckets[d] = b;
        }
        const weekdayData = WEEKDAYS.map((label, i) => ({
          label,
          posts: weekdayBuckets[i]?.posts ?? 0,
          avgReach: weekdayBuckets[i]?.posts ? (weekdayBuckets[i]?.reach ?? 0) / (weekdayBuckets[i]?.posts ?? 1) : 0,
          avgEngagement: weekdayBuckets[i]?.posts
            ? (weekdayBuckets[i]?.engagement ?? 0) / (weekdayBuckets[i]?.posts ?? 1)
            : 0,
        }));

        const weekdayOption = {
          tooltip: { trigger: "axis" },
          legend: {
            data: ["Avg Reach", "Avg Engagement"],
            bottom: 0,
            textStyle: { color: "#64748b", fontSize: 11 },
          },
          grid: { left: 8, right: 8, top: 20, bottom: 50, containLabel: true },
          xAxis: {
            type: "category",
            data: weekdayData.map((d) => d.label),
            axisLine: { lineStyle: { color: "#e2e8f0" } },
            axisLabel: { color: "#334155", fontSize: 12 },
          },
          yAxis: {
            type: "value",
            splitLine: { lineStyle: { color: "#f1f5f9" } },
            axisLabel: { color: "#64748b", fontSize: 11, formatter: (v: number) => formatCompact(v) },
          },
          series: [
            {
              name: "Avg Reach",
              type: "bar",
              data: weekdayData.map((d) => Math.round(d.avgReach)),
              itemStyle: { color: "#1d72f0", borderRadius: [6, 6, 0, 0] },
              barWidth: 24,
            },
            {
              name: "Avg Engagement",
              type: "bar",
              data: weekdayData.map((d) => Math.round(d.avgEngagement)),
              itemStyle: { color: "#f59e0b", borderRadius: [6, 6, 0, 0] },
              barWidth: 24,
            },
          ],
        };

        const yearMonths: Record<number, Record<number, number>> = {};
        for (const p of posts) {
          if (!p.date) continue;
          const y = p.date.getUTCFullYear();
          const m = p.date.getUTCMonth();
          yearMonths[y] = yearMonths[y] ?? {};
          yearMonths[y][m] = (yearMonths[y][m] ?? 0) + p.reach;
        }
        const years = Object.keys(yearMonths).map(Number).sort();
        const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const seasonalData: [number, number, number][] = [];
        years.forEach((y, yi) => {
          for (let m = 0; m < 12; m++) {
            const v = yearMonths[y]?.[m] ?? 0;
            if (v > 0) seasonalData.push([m, yi, v]);
          }
        });
        const seasonalMax = Math.max(...seasonalData.map((d) => d[2]), 1);
        const seasonalOption = {
          tooltip: {
            formatter: (p: { data: number[] }) =>
              `${monthLabels[p.data[0]]} ${years[p.data[1]]}<br/>Reach: ${formatCompact(p.data[2])}`,
          },
          grid: { left: 50, right: 20, top: 20, bottom: 60, containLabel: false },
          xAxis: {
            type: "category",
            data: monthLabels,
            axisLine: { show: false },
            axisTick: { show: false },
            splitArea: { show: true },
            axisLabel: { color: "#334155", fontSize: 11 },
          },
          yAxis: {
            type: "category",
            data: years.map(String),
            axisLine: { show: false },
            axisTick: { show: false },
            splitArea: { show: true },
            axisLabel: { color: "#334155", fontSize: 11 },
          },
          visualMap: {
            min: 0,
            max: seasonalMax,
            calculable: true,
            orient: "horizontal",
            left: "center",
            bottom: 10,
            inRange: { color: ["#eef7ff", "#8ecbff", "#3390fb", "#1d72f0", "#184bb2"] },
            textStyle: { color: "#64748b", fontSize: 11 },
            formatter: (v: number) => formatCompact(v),
          },
          series: [
            {
              name: "Reach",
              type: "heatmap",
              data: seasonalData,
              label: { show: false },
              emphasis: { itemStyle: { shadowBlur: 10 } },
            },
          ],
        };

        return (
          <div className="space-y-6">
            <Card>
              <SectionHeader
                title="Full timeline — Reach, Views, Engagement"
                subtitle="Month-by-month with post-volume bar. Use slider to zoom into campaign windows."
              />
              <EChart option={trendOption} height={420} />
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <SectionHeader
                  title="Day-of-week performance"
                  subtitle="Average reach & engagement per post, by publishing day."
                />
                <EChart option={weekdayOption} height={320} />
              </Card>
              <Card>
                <SectionHeader
                  title="Seasonal heatmap (reach by month × year)"
                  subtitle="Spot seasonal spikes and campaign windows."
                />
                <EChart option={seasonalOption} height={Math.max(220, years.length * 50 + 80)} />
              </Card>
            </div>

            <Card padded={false}>
              <div className="p-5 pb-3">
                <SectionHeader
                  title="Top 15 viral-grade posts"
                  subtitle="Sorted by reach. Click to open the original post."
                  right={<Flame className="w-5 h-5 text-orange-500" />}
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead className="bg-surface-muted text-[11px] uppercase tracking-wider text-ink-500">
                    <tr>
                      <th className="text-left px-5 py-2 font-semibold">#</th>
                      <th className="text-left px-3 py-2 font-semibold">Creator</th>
                      <th className="text-left px-3 py-2 font-semibold">Format</th>
                      <th className="text-left px-3 py-2 font-semibold">Campaign</th>
                      <th className="text-right px-3 py-2 font-semibold">Reach</th>
                      <th className="text-right px-3 py-2 font-semibold">Views</th>
                      <th className="text-right px-3 py-2 font-semibold">Eng.</th>
                      <th className="text-left px-3 py-2 font-semibold">Insight</th>
                      <th className="text-center px-5 py-2 font-semibold">Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viral.map((p, i) => (
                      <tr key={i} className="border-t border-surface-border hover:bg-surface-muted/60">
                        <td className="px-5 py-2 text-ink-500 tabular-nums">{i + 1}</td>
                        <td className="px-3 py-2 font-semibold">{p.creator}</td>
                        <td className="px-3 py-2 text-ink-500">{p.format}</td>
                        <td className="px-3 py-2 text-ink-500">{p.campaign}</td>
                        <td className="px-3 py-2 text-right font-semibold text-brand-700 tabular-nums">
                          {formatCompact(p.reach)}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">{formatCompact(p.views)}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{formatCompact(p.engagement)}</td>
                        <td className="px-3 py-2">
                          <span
                            className="inline-block px-2 py-0.5 text-[10.5px] rounded-md font-medium"
                            style={{
                              background: `${INSIGHT_COLORS[p.insight] ?? "#1d72f0"}22`,
                              color: INSIGHT_COLORS[p.insight] ?? "#1d72f0",
                            }}
                          >
                            {p.insight}
                          </span>
                        </td>
                        <td className="px-5 py-2 text-center">
                          {p.link?.startsWith("http") ? (
                            <a
                              href={p.link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex text-brand-600 hover:text-brand-800"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        );
      }}
    </DataBoundary>
  );
}
