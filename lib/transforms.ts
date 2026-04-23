import type { Post, RawRow, ContentFormat, CampaignBucket, InsightLabel } from "./types";
import { INSIGHT_LABELS } from "./types";

const CREATOR_PATTERNS: Array<[RegExp, string]> = [
  [/Shweta Chithrode/i, "Shweta Chithrode"],
  [/Priyanka Kochhar/i, "Priyanka Kochhar"],
  [/RACR/i, "RACR"],
  [/xBhp.*MG/i, "xBhp & MG"],
  [/Deepak Gupta/i, "Deepak Gupta"],
  [/Baidik Chatterjee/i, "Baidik Chatterjee"],
  [/Atharva Mandke/i, "Atharva Mandke"],
  [/Tanisha Arora/i, "Tanisha Arora"],
  [/Murthaza Junaid/i, "Murthaza Junaid"],
  [/Omkar Khanna/i, "Omkar Khanna"],
  [/Punam Pait/i, "Punam Pait"],
  [/KL Rider/i, "KL Rider"],
  [/Bombay Custom Works/i, "Bombay Custom Works"],
  [/The Bike Factory/i, "The Bike Factory"],
  [/Red Rooster/i, "Red Rooster"],
];

export function shortenCreator(source: string): string {
  for (const [pattern, shortName] of CREATOR_PATTERNS) {
    if (pattern.test(source)) return shortName;
  }
  const match = source.match(/\|\s*([^-|]+?)(?:\s*-|\s*Deliverables|\s*Tracker|\s*Annual|\s*$)/i);
  return match ? match[1].trim() : source;
}

const KNOWN_FORMATS = [
  "Instagram Story",
  "Static Post",
  "Instagram Reels/Video",
  "Youtube Video",
];

export function normalizeFormat(value: string): ContentFormat | string {
  const v = (value ?? "").trim();
  for (const f of KNOWN_FORMATS) {
    if (f.toLowerCase() === v.toLowerCase()) return f as ContentFormat;
  }
  return v || "Unknown";
}

const KNOWN_CAMPAIGNS: CampaignBucket[] = ["Campaign A", "Campaign B", "Promo", "N/A"];

export function normalizeCampaign(value: string): CampaignBucket | string {
  const v = (value ?? "").trim();
  for (const c of KNOWN_CAMPAIGNS) if (c.toLowerCase() === v.toLowerCase()) return c;
  if (!v) return "N/A";
  if (v.toLowerCase().includes("instagram") || v.toLowerCase().includes("static") || v.toLowerCase().includes("youtube")) {
    return "N/A";
  }
  return v;
}

export function parseNumber(value: unknown): number {
  if (value == null) return 0;
  const s = String(value).replace(/[^0-9.-]/g, "");
  if (!s) return 0;
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

export function parsePercent(value: unknown): number | null {
  if (value == null) return null;
  const s = String(value).trim();
  if (!s || s.toUpperCase() === "N/A") return null;
  const cleaned = s.replace(/[^0-9.-]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function parseTimeToSeconds(value: unknown): number | null {
  if (value == null) return null;
  const s = String(value).trim();
  if (!s || s.toUpperCase() === "N/A") return null;
  const parts = s.split(":").map((p) => Number(p));
  if (parts.some((n) => !Number.isFinite(n))) return null;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 1) return parts[0];
  return null;
}

export function parseDate(value: unknown): Date | null {
  if (value == null) return null;
  const s = String(value).trim();
  if (!s || s.toUpperCase() === "USER INPUT") return null;
  const sep = s.includes("/") ? "/" : s.includes("-") ? "-" : null;
  if (!sep) return null;
  const parts = s.split(sep).map((p) => p.trim());
  if (parts.length !== 3) return null;
  let [d, m, y] = parts;
  let day = Number(d);
  let month = Number(m);
  let year = Number(y);
  if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) return null;
  if (year < 100) year += 2000;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function normalizeInsight(value: string): InsightLabel | string {
  const v = (value ?? "").trim();
  for (const label of INSIGHT_LABELS) if (label.toLowerCase() === v.toLowerCase()) return label;
  if (v.startsWith("http") || v.toUpperCase() === "USER INPUT- LINK" || /^\d/.test(v)) {
    return "Unlabeled";
  }
  return v || "Unlabeled";
}

export function toPost(raw: RawRow): Post {
  const source = raw.Source ?? "";
  return {
    creator: shortenCreator(source),
    creatorFull: source,
    format: normalizeFormat(raw["Annual Deliverables"]),
    campaign: normalizeCampaign(raw.Drag),
    date: parseDate(raw["Date Completed"]),
    dateRaw: raw["Date Completed"] ?? "",
    link: raw["Post Link"] ?? "",
    views: parseNumber(raw.Views),
    engagement: parseNumber(raw["Engagement(Likes+Comments+Shares)"]),
    reach: parseNumber(raw.Reach),
    avgWatchTimeSec: parseTimeToSeconds(raw["Average Watch Time"]),
    skipRatePct: parsePercent(raw["Reel Skip Rate"]),
    brandIntegrationTimeSec: parseTimeToSeconds(raw["Brand Integration Time"]),
    brandIntegrationAttentionPct: parsePercent(
      raw["Percentage of People Watching During Brand Integration"]
    ),
    engagementRatePct: parsePercent(raw["Engagement Rate"]),
    insight: normalizeInsight(raw.Insights),
  };
}
