"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useSheetData } from "@/hooks/useSheetData";
import { RefreshCcw, CheckCircle2, AlertTriangle, Loader2, Menu } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useMemo } from "react";
import { useUI } from "@/store/ui";

export function TopBar() {
  const { data, isLoading, isFetching, isError, error, dataUpdatedAt } = useSheetData();
  const qc = useQueryClient();
  const toggleSidebar = useUI((s) => s.toggleSidebar);

  const timeAgo = useMemo(() => {
    if (!dataUpdatedAt) return null;
    try {
      return formatDistanceToNow(new Date(dataUpdatedAt), { addSuffix: true });
    } catch {
      return null;
    }
  }, [dataUpdatedAt]);

  return (
    <header className="bg-white border-b border-surface-border px-4 md:px-8 py-3.5 flex items-center justify-between gap-3 sticky top-0 z-20">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={toggleSidebar}
          className="md:hidden p-2 rounded-lg hover:bg-surface-muted text-ink-700 shrink-0"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-[17px] md:text-[20px] font-bold tracking-tight truncate">
            Castrol x Schbang
          </h1>
          <p className="text-[11.5px] md:text-[12.5px] text-ink-500 truncate">
            {data ? (
              <>
                <span className="hidden sm:inline">
                  {data.posts.length.toLocaleString()} posts · {data.creators.length} creators ·
                </span>{" "}
                live from Google Sheets
              </>
            ) : (
              "Loading dataset…"
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <div className="text-[12px] flex items-center gap-2">
          {isError ? (
            <span className="flex items-center gap-1.5 text-red-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">{String(error?.message ?? "Load failed")}</span>
            </span>
          ) : isLoading ? (
            <span className="flex items-center gap-1.5 text-ink-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="hidden sm:inline">Loading…</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-ink-500 hidden md:inline">
                Last sync <strong className="text-ink-700">{timeAgo ?? "just now"}</strong>
              </span>
            </span>
          )}
        </div>
        <button
          onClick={() => qc.invalidateQueries({ queryKey: ["sheet-data"] })}
          disabled={isFetching}
          className="text-[13px] font-medium px-2.5 md:px-3 py-2 rounded-xl bg-surface-muted hover:bg-brand-50 text-ink-700 hover:text-brand-700 flex items-center gap-2 transition"
        >
          <RefreshCcw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>
    </header>
  );
}
