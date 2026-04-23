import type { Post } from "./types";
import { aggregateByCreator, aggregateByFormat } from "./metrics";

export type RecommendationTag =
  | "Invest More"
  | "Reduce Volume"
  | "Shift Format"
  | "Fix Hooks"
  | "Extend Integration"
  | "Retention Risk"
  | "Steady Performer";

export interface CreatorRecommendation {
  creator: string;
  posts: number;
  tags: RecommendationTag[];
  summary: string;
  metrics: {
    effectiveReach: number;
    avgEngagementRate: number;
    avgBrandAttention: number;
    skipRateAvg: number;
    hookIssueRate: number;
    retentionIssueRate: number;
  };
}

export function generateCreatorRecommendations(posts: Post[]): CreatorRecommendation[] {
  const creatorAggs = aggregateByCreator(posts);
  const creatorEffReach = creatorAggs.map((c) => c.effectiveReach).sort((a, b) => a - b);
  const median = (arr: number[]): number => {
    if (!arr.length) return 0;
    const i = Math.floor(arr.length / 2);
    return arr.length % 2 ? arr[i] : (arr[i - 1] + arr[i]) / 2;
  };
  const medianEff = median(creatorEffReach);

  const erValues = creatorAggs.map((c) => c.avgEngagementRate).filter((x) => x > 0);
  const medianER = median(erValues);

  const results: CreatorRecommendation[] = [];
  const byCreator = new Map<string, Post[]>();
  for (const p of posts) {
    const list = byCreator.get(p.creator) ?? [];
    list.push(p);
    byCreator.set(p.creator, list);
  }

  for (const agg of creatorAggs) {
    const tags: RecommendationTag[] = [];
    const creatorPosts = byCreator.get(agg.creator) ?? [];

    const skips = creatorPosts.map((p) => p.skipRatePct).filter((x): x is number => x != null);
    const skipAvg = skips.length ? skips.reduce((a, b) => a + b, 0) / skips.length : 0;
    const hookIssues = creatorPosts.filter((p) => p.insight === "Needs better hook next time").length;
    const hookRate = creatorPosts.length ? hookIssues / creatorPosts.length : 0;
    const retentionIssues = creatorPosts.filter(
      (p) => p.insight === "Audience retention dropped halfway"
    ).length;
    const retentionRate = creatorPosts.length ? retentionIssues / creatorPosts.length : 0;

    if (agg.effectiveReach >= medianEff * 1.25 && agg.avgEngagementRate >= medianER) {
      tags.push("Invest More");
    }
    if (agg.effectiveReach < medianEff * 0.7) tags.push("Reduce Volume");
    if (hookRate > 0.18 || skipAvg > 45) tags.push("Fix Hooks");
    if (retentionRate > 0.15) tags.push("Retention Risk");
    if (agg.avgBrandAttention > 0 && agg.avgBrandAttention < 40) tags.push("Extend Integration");

    const fmtAggs = aggregateByFormat(creatorPosts);
    if (fmtAggs.length >= 2) {
      const best = [...fmtAggs].sort((a, b) => b.avgEngagementRate - a.avgEngagementRate)[0];
      const worst = [...fmtAggs].sort((a, b) => a.avgEngagementRate - b.avgEngagementRate)[0];
      if (best && worst && best.avgEngagementRate > worst.avgEngagementRate * 2) {
        tags.push("Shift Format");
      }
    }

    if (!tags.length) tags.push("Steady Performer");

    const parts: string[] = [];
    if (tags.includes("Invest More")) parts.push("Top-quartile effective reach.");
    if (tags.includes("Reduce Volume")) parts.push("Below-median effective reach.");
    if (tags.includes("Fix Hooks")) parts.push(`${Math.round(skipAvg)}% avg skip rate.`);
    if (tags.includes("Retention Risk")) parts.push(`${Math.round(retentionRate * 100)}% posts with retention drop.`);
    if (tags.includes("Extend Integration"))
      parts.push(`${agg.avgBrandAttention.toFixed(0)}% brand-moment attention — test longer integration.`);
    if (tags.includes("Shift Format")) parts.push("Format performance gap — rebalance content mix.");
    if (tags.includes("Steady Performer")) parts.push("Solid across all metrics.");

    results.push({
      creator: agg.creator,
      posts: agg.posts,
      tags,
      summary: parts.join(" "),
      metrics: {
        effectiveReach: agg.effectiveReach,
        avgEngagementRate: agg.avgEngagementRate,
        avgBrandAttention: agg.avgBrandAttention,
        skipRateAvg: skipAvg,
        hookIssueRate: hookRate,
        retentionIssueRate: retentionRate,
      },
    });
  }

  return results.sort((a, b) => b.metrics.effectiveReach - a.metrics.effectiveReach);
}

export function topInsightCallouts(posts: Post[]): string[] {
  const creatorAggs = aggregateByCreator(posts);
  const formatAggs = aggregateByFormat(posts);
  const out: string[] = [];
  if (creatorAggs.length) {
    const topCreator = [...creatorAggs].sort((a, b) => b.effectiveReach - a.effectiveReach)[0];
    out.push(
      `${topCreator.creator} delivers the highest effective reach (${Math.round(
        topCreator.effectiveReach / 1_000_000
      )}M) — strongest brand-attention performer.`
    );
  }
  if (formatAggs.length) {
    const topFormat = [...formatAggs].sort((a, b) => b.avgBrandAttention - a.avgBrandAttention)[0];
    if (topFormat.avgBrandAttention > 0) {
      out.push(
        `${topFormat.format} holds ${topFormat.avgBrandAttention.toFixed(
          0
        )}% attention during brand integration — the best-converting format.`
      );
    }
  }
  const viral = posts.filter((p) => p.insight === "Viral potential shown").length;
  if (viral && posts.length) {
    out.push(`${((viral / posts.length) * 100).toFixed(1)}% of posts flagged with viral potential — scalable creative signal.`);
  }
  return out;
}
