"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from "lucide-react";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isAfter,
  isBefore,
  startOfDay,
  endOfDay,
  subDays,
  startOfYear,
  format,
} from "date-fns";
import { cn } from "@/lib/utils";

interface DateRangeFilterProps {
  from: Date | null;
  to: Date | null;
  min?: Date | null;
  max?: Date | null;
  onChange: (from: Date | null, to: Date | null) => void;
}

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function fmtChip(d: Date): string {
  return format(d, "MMM d, yyyy");
}

function fmtShort(d: Date): string {
  return format(d, "MMM d");
}

interface Preset {
  label: string;
  range: () => [Date, Date];
}

function buildPresets(min: Date | null, max: Date | null): Preset[] {
  const today = endOfDay(new Date());
  const clamp = (d: Date): Date => {
    if (min && isBefore(d, startOfDay(min))) return startOfDay(min);
    if (max && isAfter(d, endOfDay(max))) return endOfDay(max);
    return d;
  };
  const range = (start: Date, end: Date): [Date, Date] => [clamp(start), clamp(end)];
  return [
    { label: "Last 7 days", range: () => range(startOfDay(subDays(today, 6)), today) },
    { label: "Last 30 days", range: () => range(startOfDay(subDays(today, 29)), today) },
    { label: "Last 90 days", range: () => range(startOfDay(subDays(today, 89)), today) },
    { label: "This month", range: () => range(startOfMonth(today), today) },
    { label: "Year to date", range: () => range(startOfYear(today), today) },
  ];
}

function defaultViewMonth(
  from: Date | null,
  to: Date | null,
  min: Date | null | undefined,
  max: Date | null | undefined
): Date {
  if (from) return startOfMonth(from);
  if (to) return startOfMonth(to);
  const today = new Date();
  if (max && isAfter(today, endOfDay(max))) return startOfMonth(max);
  if (min && isBefore(today, startOfDay(min))) return startOfMonth(min);
  return startOfMonth(today);
}

export function DateRangeFilter({ from, to, min, max, onChange }: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const [draftFrom, setDraftFrom] = useState<Date | null>(from);
  const [draftTo, setDraftTo] = useState<Date | null>(to);
  const [hover, setHover] = useState<Date | null>(null);
  const [viewMonth, setViewMonth] = useState<Date>(() =>
    defaultViewMonth(from, to, min, max)
  );

  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (open) {
      setDraftFrom(from);
      setDraftTo(to);
      setViewMonth(defaultViewMonth(from, to, min, max));
    }
  }, [open, from, to, min, max]);

  useIsoLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const btn = btnRef.current;
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const menuWidth = 340;
      const desiredLeft = r.left;
      const maxLeft = window.innerWidth - menuWidth - 8;
      setPos({
        top: r.bottom + 6,
        left: Math.max(8, Math.min(desiredLeft, maxLeft)),
        width: menuWidth,
      });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (btnRef.current?.contains(target)) return;
      setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("mousedown", handler);
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("mousedown", handler);
      window.removeEventListener("keydown", esc);
    };
  }, [open]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(viewMonth));
    const end = endOfWeek(endOfMonth(viewMonth));
    return eachDayOfInterval({ start, end });
  }, [viewMonth]);

  const presets = useMemo(() => buildPresets(min ?? null, max ?? null), [min, max]);

  const isDisabled = (d: Date) => {
    if (min && isBefore(d, startOfDay(min))) return true;
    if (max && isAfter(d, endOfDay(max))) return true;
    return false;
  };

  const handleDayClick = (d: Date) => {
    if (isDisabled(d)) return;
    if (!draftFrom || (draftFrom && draftTo)) {
      setDraftFrom(startOfDay(d));
      setDraftTo(null);
      return;
    }
    if (isBefore(d, draftFrom)) {
      setDraftFrom(startOfDay(d));
      setDraftTo(null);
      return;
    }
    setDraftTo(endOfDay(d));
  };

  const apply = () => {
    onChange(draftFrom, draftTo ?? (draftFrom ? endOfDay(draftFrom) : null));
    setOpen(false);
  };

  const clear = () => {
    setDraftFrom(null);
    setDraftTo(null);
    onChange(null, null);
    setOpen(false);
  };

  const applyPreset = (p: Preset) => {
    const [a, b] = p.range();
    setDraftFrom(a);
    setDraftTo(b);
    setViewMonth(startOfMonth(a));
  };

  const active = !!from || !!to;
  const label =
    from && to
      ? `${fmtShort(from)} – ${fmtShort(to)}`
      : from
        ? `From ${fmtShort(from)}`
        : to
          ? `Until ${fmtShort(to)}`
          : "Date";

  const rangeStart = draftFrom;
  const rangeEnd = draftTo ?? (draftFrom && hover && isAfter(hover, draftFrom) ? hover : null);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl border text-[12.5px] font-medium transition whitespace-nowrap shrink-0",
          active
            ? "bg-brand-50 text-brand-700 border-brand-200"
            : "bg-white text-ink-700 border-surface-border hover:border-brand-200 hover:text-brand-700"
        )}
      >
        <CalendarIcon className="w-3.5 h-3.5" />
        <span>{label}</span>
        {active ? (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              clear();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                clear();
              }
            }}
            className="grid place-items-center w-4 h-4 rounded-full bg-brand-600 text-white hover:bg-brand-700"
            aria-label="Clear date range"
          >
            <X className="w-2.5 h-2.5" strokeWidth={3} />
          </span>
        ) : (
          <ChevronDown
            className={cn("w-3.5 h-3.5 transition-transform", open && "rotate-180")}
          />
        )}
      </button>

      {mounted && open && pos
        ? createPortal(
            <div
              ref={menuRef}
              className="fixed z-[100] bg-white rounded-xl shadow-hover border border-surface-border overflow-hidden"
              style={{ top: pos.top, left: pos.left, width: pos.width }}
            >
              <div className="flex flex-wrap gap-1.5 p-2.5 border-b border-surface-border bg-surface-muted">
                {presets.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="text-[11.5px] font-medium px-2.5 py-1 rounded-full border border-surface-border bg-white text-ink-700 hover:border-brand-300 hover:text-brand-700 transition"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="px-3 pt-3 pb-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setViewMonth((m) => subMonths(m, 1))}
                  className="w-7 h-7 grid place-items-center rounded-lg hover:bg-surface-muted text-ink-500"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="text-[13px] font-semibold text-ink-900">
                  {format(viewMonth, "MMMM yyyy")}
                </div>
                <button
                  type="button"
                  onClick={() => setViewMonth((m) => addMonths(m, 1))}
                  className="w-7 h-7 grid place-items-center rounded-lg hover:bg-surface-muted text-ink-500"
                  aria-label="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="px-3 pb-2 grid grid-cols-7 gap-y-1">
                {WEEKDAYS.map((d, i) => (
                  <div
                    key={i}
                    className="text-center text-[10.5px] uppercase tracking-wider font-semibold text-ink-400 py-1"
                  >
                    {d}
                  </div>
                ))}
                {days.map((d) => {
                  const inMonth = isSameMonth(d, viewMonth);
                  const disabled = isDisabled(d);
                  const isStart = rangeStart && isSameDay(d, rangeStart);
                  const isEnd = rangeEnd && isSameDay(d, rangeEnd);
                  const inRange =
                    rangeStart &&
                    rangeEnd &&
                    !isBefore(d, rangeStart) &&
                    !isAfter(d, rangeEnd);
                  const isEdge = isStart || isEnd;

                  return (
                    <button
                      key={d.toISOString()}
                      type="button"
                      disabled={disabled}
                      onMouseEnter={() => setHover(d)}
                      onMouseLeave={() => setHover(null)}
                      onClick={() => handleDayClick(d)}
                      className={cn(
                        "h-8 text-[12px] font-medium grid place-items-center transition relative",
                        !inMonth && "text-ink-300",
                        inMonth && !disabled && !isEdge && !inRange && "text-ink-700 hover:bg-surface-muted rounded-lg",
                        disabled && "text-ink-300 cursor-not-allowed",
                        inRange && !isEdge && "bg-brand-50 text-brand-700",
                        isStart && rangeEnd && !isSameDay(rangeStart!, rangeEnd) && "bg-brand-50 rounded-l-lg",
                        isEnd && rangeStart && !isSameDay(rangeStart, rangeEnd!) && "bg-brand-50 rounded-r-lg"
                      )}
                    >
                      <span
                        className={cn(
                          "w-7 h-7 grid place-items-center rounded-lg",
                          isEdge && "bg-brand-600 text-white shadow-sm"
                        )}
                      >
                        {format(d, "d")}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="px-3 py-2.5 border-t border-surface-border flex items-center justify-between gap-2">
                <div className="text-[11.5px] text-ink-500 min-w-0 truncate">
                  {draftFrom && draftTo ? (
                    <span>
                      <span className="text-ink-700 font-medium">{fmtChip(draftFrom)}</span>
                      <span className="mx-1.5 text-ink-300">→</span>
                      <span className="text-ink-700 font-medium">{fmtChip(draftTo)}</span>
                    </span>
                  ) : draftFrom ? (
                    <span>
                      <span className="text-ink-700 font-medium">{fmtChip(draftFrom)}</span>
                      <span className="ml-1.5 text-ink-400">— pick end date</span>
                    </span>
                  ) : (
                    <span className="text-ink-400">Select a start date</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={clear}
                    className="text-[12px] font-medium px-2.5 py-1.5 rounded-lg text-ink-500 hover:bg-surface-muted"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={apply}
                    disabled={!draftFrom}
                    className={cn(
                      "text-[12px] font-semibold px-3 py-1.5 rounded-lg transition",
                      draftFrom
                        ? "bg-brand-600 text-white hover:bg-brand-700"
                        : "bg-surface-muted text-ink-400 cursor-not-allowed"
                    )}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
