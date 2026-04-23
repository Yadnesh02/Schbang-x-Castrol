import type { Filters, Post } from "./types";

export function applyFilters(posts: Post[], filters: Filters): Post[] {
  return posts.filter((p) => {
    if (filters.creators.length && !filters.creators.includes(p.creator)) return false;
    if (filters.formats.length && !filters.formats.includes(p.format)) return false;
    if (filters.campaigns.length && !filters.campaigns.includes(p.campaign)) return false;
    if (filters.dateFrom && (!p.date || p.date < filters.dateFrom)) return false;
    if (filters.dateTo && (!p.date || p.date > filters.dateTo)) return false;
    return true;
  });
}

export interface KPIs {
  posts: number;
  views: number;
  reach: number;
  engagement: number;
  avgEngagementRate: number;
  avgBrandAttention: number;
  avgSkipRate: number;
  creators: number;
}

export function computeKPIs(posts: Post[]): KPIs {
  let views = 0;
  let reach = 0;
  let engagement = 0;
  let engSum = 0;
  let engCount = 0;
  let attSum = 0;
  let attCount = 0;
  let skipSum = 0;
  let skipCount = 0;
  const creatorSet = new Set<string>();
  for (const p of posts) {
    views += p.views;
    reach += p.reach;
    engagement += p.engagement;
    if (p.engagementRatePct != null) {
      engSum += p.engagementRatePct;
      engCount++;
    }
    if (p.brandIntegrationAttentionPct != null) {
      attSum += p.brandIntegrationAttentionPct;
      attCount++;
    }
    if (p.skipRatePct != null) {
      skipSum += p.skipRatePct;
      skipCount++;
    }
    creatorSet.add(p.creator);
  }
  return {
    posts: posts.length,
    views,
    reach,
    engagement,
    avgEngagementRate: engCount ? engSum / engCount : 0,
    avgBrandAttention: attCount ? attSum / attCount : 0,
    avgSkipRate: skipCount ? skipSum / skipCount : 0,
    creators: creatorSet.size,
  };
}

export interface CreatorAggregate {
  creator: string;
  posts: number;
  views: number;
  reach: number;
  engagement: number;
  avgEngagementRate: number;
  avgBrandAttention: number;
  effectiveReach: number;
}

export function aggregateByCreator(posts: Post[]): CreatorAggregate[] {
  const map = new Map<string, CreatorAggregate & { erSum: number; erCount: number; attSum: number; attCount: number }>();
  for (const p of posts) {
    const curr = map.get(p.creator) ?? {
      creator: p.creator,
      posts: 0,
      views: 0,
      reach: 0,
      engagement: 0,
      avgEngagementRate: 0,
      avgBrandAttention: 0,
      effectiveReach: 0,
      erSum: 0,
      erCount: 0,
      attSum: 0,
      attCount: 0,
    };
    curr.posts += 1;
    curr.views += p.views;
    curr.reach += p.reach;
    curr.engagement += p.engagement;
    if (p.engagementRatePct != null) {
      curr.erSum += p.engagementRatePct;
      curr.erCount++;
    }
    if (p.brandIntegrationAttentionPct != null) {
      curr.attSum += p.brandIntegrationAttentionPct;
      curr.attCount++;
    }
    map.set(p.creator, curr);
  }
  return Array.from(map.values()).map((v) => ({
    creator: v.creator,
    posts: v.posts,
    views: v.views,
    reach: v.reach,
    engagement: v.engagement,
    avgEngagementRate: v.erCount ? v.erSum / v.erCount : 0,
    avgBrandAttention: v.attCount ? v.attSum / v.attCount : 0,
    effectiveReach: v.reach * (v.attCount ? v.attSum / v.attCount / 100 : 0),
  }));
}

export interface FormatAggregate {
  format: string;
  posts: number;
  views: number;
  reach: number;
  engagement: number;
  avgEngagementRate: number;
  avgBrandAttention: number;
  avgSkipRate: number;
  avgWatchTime: number;
}

export function aggregateByFormat(posts: Post[]): FormatAggregate[] {
  const map = new Map<string, {
    format: string;
    posts: number;
    views: number;
    reach: number;
    engagement: number;
    erSum: number;
    erCount: number;
    attSum: number;
    attCount: number;
    skipSum: number;
    skipCount: number;
    watchSum: number;
    watchCount: number;
  }>();
  for (const p of posts) {
    const curr = map.get(p.format) ?? {
      format: p.format,
      posts: 0,
      views: 0,
      reach: 0,
      engagement: 0,
      erSum: 0,
      erCount: 0,
      attSum: 0,
      attCount: 0,
      skipSum: 0,
      skipCount: 0,
      watchSum: 0,
      watchCount: 0,
    };
    curr.posts += 1;
    curr.views += p.views;
    curr.reach += p.reach;
    curr.engagement += p.engagement;
    if (p.engagementRatePct != null) {
      curr.erSum += p.engagementRatePct;
      curr.erCount++;
    }
    if (p.brandIntegrationAttentionPct != null) {
      curr.attSum += p.brandIntegrationAttentionPct;
      curr.attCount++;
    }
    if (p.skipRatePct != null) {
      curr.skipSum += p.skipRatePct;
      curr.skipCount++;
    }
    if (p.avgWatchTimeSec != null) {
      curr.watchSum += p.avgWatchTimeSec;
      curr.watchCount++;
    }
    map.set(p.format, curr);
  }
  return Array.from(map.values()).map((v) => ({
    format: v.format,
    posts: v.posts,
    views: v.views,
    reach: v.reach,
    engagement: v.engagement,
    avgEngagementRate: v.erCount ? v.erSum / v.erCount : 0,
    avgBrandAttention: v.attCount ? v.attSum / v.attCount : 0,
    avgSkipRate: v.skipCount ? v.skipSum / v.skipCount : 0,
    avgWatchTime: v.watchCount ? v.watchSum / v.watchCount : 0,
  }));
}

export interface CampaignAggregate {
  campaign: string;
  posts: number;
  views: number;
  reach: number;
  engagement: number;
  avgEngagementRate: number;
  avgBrandAttention: number;
}

export function aggregateByCampaign(posts: Post[]): CampaignAggregate[] {
  const map = new Map<string, {
    campaign: string;
    posts: number;
    views: number;
    reach: number;
    engagement: number;
    erSum: number;
    erCount: number;
    attSum: number;
    attCount: number;
  }>();
  for (const p of posts) {
    const curr = map.get(p.campaign) ?? {
      campaign: p.campaign,
      posts: 0,
      views: 0,
      reach: 0,
      engagement: 0,
      erSum: 0,
      erCount: 0,
      attSum: 0,
      attCount: 0,
    };
    curr.posts += 1;
    curr.views += p.views;
    curr.reach += p.reach;
    curr.engagement += p.engagement;
    if (p.engagementRatePct != null) {
      curr.erSum += p.engagementRatePct;
      curr.erCount++;
    }
    if (p.brandIntegrationAttentionPct != null) {
      curr.attSum += p.brandIntegrationAttentionPct;
      curr.attCount++;
    }
    map.set(p.campaign, curr);
  }
  return Array.from(map.values()).map((v) => ({
    campaign: v.campaign,
    posts: v.posts,
    views: v.views,
    reach: v.reach,
    engagement: v.engagement,
    avgEngagementRate: v.erCount ? v.erSum / v.erCount : 0,
    avgBrandAttention: v.attCount ? v.attSum / v.attCount : 0,
  }));
}

export interface InsightAggregate {
  insight: string;
  posts: number;
  share: number;
}

export function aggregateByInsight(posts: Post[]): InsightAggregate[] {
  const counts = new Map<string, number>();
  for (const p of posts) counts.set(p.insight, (counts.get(p.insight) ?? 0) + 1);
  const total = posts.length || 1;
  return Array.from(counts.entries())
    .map(([insight, n]) => ({ insight, posts: n, share: n / total }))
    .sort((a, b) => b.posts - a.posts);
}

export interface MonthlyBucket {
  month: string;
  date: Date;
  posts: number;
  views: number;
  reach: number;
  engagement: number;
}

export function aggregateByMonth(posts: Post[]): MonthlyBucket[] {
  const map = new Map<string, MonthlyBucket>();
  for (const p of posts) {
    if (!p.date) continue;
    const y = p.date.getUTCFullYear();
    const m = p.date.getUTCMonth();
    const key = `${y}-${String(m + 1).padStart(2, "0")}`;
    const curr = map.get(key) ?? {
      month: key,
      date: new Date(Date.UTC(y, m, 1)),
      posts: 0,
      views: 0,
      reach: 0,
      engagement: 0,
    };
    curr.posts += 1;
    curr.views += p.views;
    curr.reach += p.reach;
    curr.engagement += p.engagement;
    map.set(key, curr);
  }
  return Array.from(map.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
}

export interface CreatorFormatCell {
  creator: string;
  format: string;
  posts: number;
  avgViews: number;
  avgEngagementRate: number;
}

export function creatorFormatMatrix(posts: Post[]): CreatorFormatCell[] {
  const map = new Map<string, { posts: number; views: number; er: number; erCount: number }>();
  for (const p of posts) {
    const key = `${p.creator}__${p.format}`;
    const curr = map.get(key) ?? { posts: 0, views: 0, er: 0, erCount: 0 };
    curr.posts += 1;
    curr.views += p.views;
    if (p.engagementRatePct != null) {
      curr.er += p.engagementRatePct;
      curr.erCount += 1;
    }
    map.set(key, curr);
  }
  const rows: CreatorFormatCell[] = [];
  for (const [key, v] of map.entries()) {
    const [creator, format] = key.split("__");
    rows.push({
      creator,
      format,
      posts: v.posts,
      avgViews: v.posts ? v.views / v.posts : 0,
      avgEngagementRate: v.erCount ? v.er / v.erCount : 0,
    });
  }
  return rows;
}

export function topViralPosts(posts: Post[], n = 10): Post[] {
  return [...posts].sort((a, b) => b.reach - a.reach).slice(0, n);
}

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + "B";
  if (abs >= 1_000_000) return Math.round(n / 1_000_000) + "M";
  if (abs >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return Math.round(n).toString();
}

export function formatPercent(n: number | null | undefined, digits = 1): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${n.toFixed(digits)}%`;
}
