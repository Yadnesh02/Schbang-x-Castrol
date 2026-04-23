"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Trophy,
  Target,
  CalendarRange,
  Lightbulb,
  ChevronDown,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUI } from "@/store/ui";

interface NavItem {
  href: string;
  label: string;
  Icon: LucideIcon;
}

interface NavSection {
  title: string;
  items: NavItem[];
  placeholder?: string;
}

const SECTIONS: NavSection[] = [
  {
    title: "Influencer Annual",
    items: [
      { href: "/", label: "Executive Overview", Icon: LayoutDashboard },
      { href: "/leaderboard", label: "Influencer Leaderboard", Icon: Trophy },
      { href: "/brand-integration", label: "Brand Integration", Icon: Target },
      { href: "/temporal", label: "Content Trends", Icon: CalendarRange },
      { href: "/recommendations", label: "Recommendations", Icon: Lightbulb },
    ],
  },
  {
    title: "Influencer Campaign",
    items: [],
    placeholder: "Coming soon",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUI();
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({
    "Influencer Annual": true,
    "Influencer Campaign": false,
  });

  const toggle = (title: string) =>
    setOpenMap((m) => ({ ...m, [title]: !m[title] }));

  const closeMobile = () => setSidebarOpen(false);

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen ? (
        <div
          onClick={closeMobile}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          aria-hidden
        />
      ) : null}

      <aside
        className={cn(
          "w-[260px] shrink-0 bg-white border-r border-surface-border min-h-screen flex flex-col",
          "fixed md:sticky top-0 left-0 z-50 md:z-0 transition-transform duration-200",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="px-5 pt-6 pb-5 border-b border-surface-border">
          <div className="flex items-center gap-3 justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src="/castrol_logo.png"
                alt="Castrol"
                className="w-11 h-11 object-contain shrink-0 mix-blend-multiply"
              />
              <div className="min-w-0">
                <div className="text-[16px] font-bold tracking-tight leading-tight">
                  Castrol
                  <span className="text-ink-400 font-medium"> × </span>
                  Schbang
                </div>
                <div className="text-[10.5px] text-ink-500 uppercase tracking-[0.14em] font-semibold mt-1">
                  Insights Dashboard
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={closeMobile}
              className="md:hidden p-1.5 rounded-lg hover:bg-surface-muted text-ink-500"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="px-3 pb-6 flex-1 overflow-y-auto">
          {SECTIONS.map((section, si) => {
            const isOpen = !!openMap[section.title];
            return (
              <div key={section.title} className={cn(si > 0 && "mt-2")}>
                <button
                  type="button"
                  onClick={() => toggle(section.title)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-muted group transition-colors"
                >
                  <span className="text-[10.5px] uppercase tracking-[0.14em] text-ink-500 font-bold group-hover:text-ink-700">
                    {section.title}
                  </span>
                  <ChevronDown
                    className={cn(
                      "w-3.5 h-3.5 text-ink-400 transition-transform duration-200",
                      !isOpen && "-rotate-90"
                    )}
                  />
                </button>

                <div
                  className={cn(
                    "overflow-hidden transition-all duration-200 ease-in-out",
                    isOpen ? "max-h-[600px] opacity-100 mt-1" : "max-h-0 opacity-0"
                  )}
                >
                  {section.items.length ? (
                    section.items.map(({ href, label, Icon }) => {
                      const isActive = pathname === href;
                      return (
                        <Link
                          key={href}
                          href={href}
                          onClick={closeMobile}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium text-ink-700 hover:bg-surface-muted transition-colors mb-1",
                            isActive && "nav-active"
                          )}
                        >
                          <Icon className="w-[18px] h-[18px] text-ink-500" />
                          <span>{label}</span>
                        </Link>
                      );
                    })
                  ) : (
                    <div className="mx-3 my-1 px-3 py-3 rounded-xl border border-dashed border-surface-border text-[12px] text-ink-400 italic">
                      {section.placeholder ?? "No items yet"}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="px-6 pb-6 text-[11px] text-ink-400">
          Data synced every 5 min from Google Sheets.
        </div>
      </aside>
    </>
  );
}
