"use client";

import { useFilters } from "@/store/filters";
import { useSheetData } from "@/hooks/useSheetData";
import { FilterDropdown } from "./FilterDropdown";
import { Filter, X } from "lucide-react";

export function FilterBar() {
  const { data } = useSheetData();
  const f = useFilters();
  if (!data) return null;

  const totalSelected =
    f.creators.length + f.formats.length + f.campaigns.length + (f.dateFrom ? 1 : 0);

  return (
    <div className="bg-white border-b border-surface-border px-4 md:px-8 py-3 flex items-center gap-2 md:gap-3 overflow-x-auto">
      <div className="shrink-0 flex items-center gap-1.5 text-ink-500">
        <Filter className="w-4 h-4" />
        <span className="text-[11.5px] uppercase tracking-wider font-semibold hidden sm:inline">
          Filters
        </span>
      </div>

      <div className="shrink-0 h-6 w-px bg-surface-border mx-1 hidden sm:block" />

      <div className="flex items-center gap-2 shrink-0">
        <FilterDropdown
          label="Format"
          options={data.formats}
          selected={f.formats}
          onToggle={f.toggleFormat}
        />
        <FilterDropdown
          label="Campaign"
          options={data.campaigns}
          selected={f.campaigns}
          onToggle={f.toggleCampaign}
        />
        <FilterDropdown
          label="Creator"
          options={data.creators}
          selected={f.creators}
          onToggle={f.toggleCreator}
        />
      </div>

      {totalSelected > 0 ? (
        <button
          onClick={f.reset}
          className="ml-auto shrink-0 flex items-center gap-1 text-[12px] font-medium text-ink-500 hover:text-red-600 px-2 py-1 rounded-md hover:bg-red-50 transition"
        >
          <X className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear all</span>
          <span className="sm:hidden">Clear</span>
        </button>
      ) : (
        <span className="ml-auto shrink-0 text-[11.5px] text-ink-400 hidden md:inline">
          {data.posts.length.toLocaleString()} posts
        </span>
      )}
    </div>
  );
}
