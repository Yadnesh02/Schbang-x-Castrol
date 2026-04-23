import { NextResponse } from "next/server";
import { fetchSheetCsv, parseCsvToDashboard } from "@/lib/csv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

let cache: { expiresAt: number; payload: unknown } | null = null;
const TTL_MS = 5 * 60 * 1000;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const force = url.searchParams.get("refresh") === "1";
  const now = Date.now();

  if (!force && cache && cache.expiresAt > now) {
    return NextResponse.json(cache.payload, {
      headers: { "X-Cache": "HIT", "X-Cache-Expires": new Date(cache.expiresAt).toISOString() },
    });
  }

  try {
    const csv = await fetchSheetCsv();
    const data = parseCsvToDashboard(csv);
    cache = { expiresAt: now + TTL_MS, payload: data };
    return NextResponse.json(data, {
      headers: { "X-Cache": "MISS", "X-Cache-Expires": new Date(cache.expiresAt).toISOString() },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown fetch error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
