export type ContentFormat =
  | "Instagram Story"
  | "Static Post"
  | "Instagram Reels/Video"
  | "Youtube Video";

export type CampaignBucket = "Campaign A" | "Campaign B" | "Promo" | "N/A";

export const INSIGHT_LABELS = [
  "Great performance",
  "Viral potential shown",
  "Shares drove the reach",
  "Comments indicate high brand recall",
  "Brand integration well received",
  "Average reach",
  "Audience retention dropped halfway",
  "High skip rate but good engagement",
  "Needs better hook next time",
] as const;

export type InsightLabel = (typeof INSIGHT_LABELS)[number];

export interface RawRow {
  Source: string;
  "Annual Deliverables": string;
  Drag: string;
  "Date Completed": string;
  "Post Link": string;
  Views: string;
  "Engagement(Likes+Comments+Shares)": string;
  Reach: string;
  "Average Watch Time": string;
  "Reel Skip Rate": string;
  "Brand Integration Time": string;
  "Percentage of People Watching During Brand Integration": string;
  "Engagement Rate": string;
  Insights: string;
}

export interface Post {
  creator: string;
  creatorFull: string;
  format: ContentFormat | string;
  campaign: CampaignBucket | string;
  date: Date | null;
  dateRaw: string;
  link: string;
  views: number;
  engagement: number;
  reach: number;
  avgWatchTimeSec: number | null;
  skipRatePct: number | null;
  brandIntegrationTimeSec: number | null;
  brandIntegrationAttentionPct: number | null;
  engagementRatePct: number | null;
  insight: InsightLabel | string;
}

export interface DashboardData {
  posts: Post[];
  creators: string[];
  formats: string[];
  campaigns: string[];
  insights: string[];
  dateRange: { min: Date | null; max: Date | null };
  fetchedAt: string;
}

export interface Filters {
  creators: string[];
  formats: string[];
  campaigns: string[];
  dateFrom: Date | null;
  dateTo: Date | null;
}
