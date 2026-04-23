import Papa from "papaparse";
import type { DashboardData, Post, RawRow } from "./types";
import { toPost } from "./transforms";

export const SHEET_ID = "1tFxOq7j1jDjV696OWLefZhNCSW76aFZ9SMjFsiVblxQ";
export const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

export async function fetchSheetCsv(): Promise<string> {
  const res = await fetch(SHEET_CSV_URL, {
    redirect: "follow",
    cache: "no-store",
    headers: { "User-Agent": "Mozilla/5.0 Castrol-Dashboard" },
  });
  if (!res.ok) throw new Error(`Failed to fetch sheet: ${res.status} ${res.statusText}`);
  return res.text();
}

export function parseCsvToDashboard(csv: string): DashboardData {
  const result = Papa.parse<RawRow>(csv, { header: true, skipEmptyLines: true });
  const posts: Post[] = [];
  for (const raw of result.data) {
    if (!raw || !raw.Source) continue;
    const post = toPost(raw);
    posts.push(post);
  }

  const creators = Array.from(new Set(posts.map((p) => p.creator))).sort();
  const formats = Array.from(new Set(posts.map((p) => p.format))).sort();
  const campaigns = Array.from(new Set(posts.map((p) => p.campaign))).sort();
  const insights = Array.from(new Set(posts.map((p) => p.insight))).sort();

  const dates = posts.map((p) => p.date).filter((d): d is Date => !!d);
  dates.sort((a, b) => a.getTime() - b.getTime());
  const dateRange = {
    min: dates[0] ?? null,
    max: dates[dates.length - 1] ?? null,
  };

  return {
    posts,
    creators,
    formats,
    campaigns,
    insights,
    dateRange,
    fetchedAt: new Date().toISOString(),
  };
}
