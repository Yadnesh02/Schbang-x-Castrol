"use client";

import { useQuery } from "@tanstack/react-query";
import type { DashboardData } from "@/lib/types";

interface ApiResponse extends Omit<DashboardData, "posts" | "dateRange"> {
  posts: (Omit<DashboardData["posts"][number], "date"> & { date: string | null })[];
  dateRange: { min: string | null; max: string | null };
}

async function fetchDashboardData(): Promise<DashboardData> {
  const res = await fetch("/api/sheet-data", { cache: "no-store" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `Failed to load (${res.status})`);
  }
  const json = (await res.json()) as ApiResponse;
  return {
    ...json,
    posts: json.posts.map((p) => ({ ...p, date: p.date ? new Date(p.date) : null })),
    dateRange: {
      min: json.dateRange.min ? new Date(json.dateRange.min) : null,
      max: json.dateRange.max ? new Date(json.dateRange.max) : null,
    },
  };
}

export function useSheetData() {
  return useQuery<DashboardData>({
    queryKey: ["sheet-data"],
    queryFn: fetchDashboardData,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 4 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
