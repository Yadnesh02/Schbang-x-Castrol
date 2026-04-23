"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterDropdownProps {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function FilterDropdown({ label, options, selected, onToggle }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useIsoLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const btn = btnRef.current;
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const menuWidth = 240;
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

  const count = selected.length;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl border text-[12.5px] font-medium transition whitespace-nowrap shrink-0",
          count > 0
            ? "bg-brand-50 text-brand-700 border-brand-200"
            : "bg-white text-ink-700 border-surface-border hover:border-brand-200 hover:text-brand-700"
        )}
      >
        <span>{label}</span>
        {count > 0 ? (
          <span className="bg-brand-600 text-white text-[10.5px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-[14px]">
            {count}
          </span>
        ) : null}
        <ChevronDown
          className={cn("w-3.5 h-3.5 transition-transform", open && "rotate-180")}
        />
      </button>

      {mounted && open && pos
        ? createPortal(
            <div
              ref={menuRef}
              className="fixed z-[100] bg-white rounded-xl shadow-hover border border-surface-border p-1.5 max-h-[320px] overflow-y-auto"
              style={{
                top: pos.top,
                left: pos.left,
                width: pos.width,
              }}
            >
              {options.length === 0 ? (
                <div className="px-3 py-2 text-[12px] text-ink-400 italic">No options</div>
              ) : (
                options.map((opt) => {
                  const active = selected.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => onToggle(opt)}
                      className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-[13px] text-ink-700 hover:bg-surface-muted text-left"
                    >
                      <span className="truncate">{opt}</span>
                      <span
                        className={cn(
                          "w-4 h-4 rounded border grid place-items-center shrink-0 transition",
                          active
                            ? "bg-brand-600 border-brand-600 text-white"
                            : "border-ink-300 bg-white"
                        )}
                      >
                        {active ? <Check className="w-3 h-3" strokeWidth={3} /> : null}
                      </span>
                    </button>
                  );
                })
              )}
            </div>,
            document.body
          )
        : null}
    </>
  );
}
