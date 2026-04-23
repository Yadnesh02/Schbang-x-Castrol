"use client";

import { useSheetData } from "@/hooks/useSheetData";
import { Loader2, AlertTriangle } from "lucide-react";
import { useFilters } from "@/store/filters";
import { applyFilters } from "@/lib/metrics";
import type { Post } from "@/lib/types";
import type { ReactNode } from "react";

interface Props {
  children: (filteredPosts: Post[], allPosts: Post[]) => ReactNode;
}

export function DataBoundary({ children }: Props) {
  const { data, isLoading, isError, error } = useSheetData();
  const filters = useFilters();

  if (isLoading) {
    return (
      <div className="card p-10 flex items-center gap-3 text-ink-500 text-[14px]">
        <Loader2 className="w-5 h-5 animate-spin text-brand-600" /> Loading live data from Google Sheets…
      </div>
    );
  }
  if (isError) {
    return (
      <div className="card p-10 flex items-center gap-3 text-red-600 text-[14px]">
        <AlertTriangle className="w-5 h-5" />
        <div>
          <strong>Failed to load:</strong> {String(error?.message ?? "unknown error")}
        </div>
      </div>
    );
  }
  if (!data) return null;

  const filteredPosts = applyFilters(data.posts, filters);
  return <>{children(filteredPosts, data.posts)}</>;
}
