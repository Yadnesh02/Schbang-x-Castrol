"use client";

import { create } from "zustand";
import type { Filters } from "@/lib/types";

interface FilterState extends Filters {
  toggleCreator: (c: string) => void;
  toggleFormat: (f: string) => void;
  toggleCampaign: (c: string) => void;
  setDateRange: (from: Date | null, to: Date | null) => void;
  reset: () => void;
}

const initial: Filters = {
  creators: [],
  formats: [],
  campaigns: [],
  dateFrom: null,
  dateTo: null,
};

export const useFilters = create<FilterState>((set) => ({
  ...initial,
  toggleCreator: (c) =>
    set((state) => ({
      creators: state.creators.includes(c)
        ? state.creators.filter((x) => x !== c)
        : [...state.creators, c],
    })),
  toggleFormat: (f) =>
    set((state) => ({
      formats: state.formats.includes(f)
        ? state.formats.filter((x) => x !== f)
        : [...state.formats, f],
    })),
  toggleCampaign: (c) =>
    set((state) => ({
      campaigns: state.campaigns.includes(c)
        ? state.campaigns.filter((x) => x !== c)
        : [...state.campaigns, c],
    })),
  setDateRange: (from, to) => set({ dateFrom: from, dateTo: to }),
  reset: () => set(initial),
}));
