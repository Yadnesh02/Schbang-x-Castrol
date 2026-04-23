import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}

export function Card({ children, className, padded = true }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl shadow-card border border-surface-border",
        "bg-gradient-to-b from-[#f4f7fc] to-[#e8edf5]",
        padded && "p-5",
        className
      )}
    >
      {children}
    </div>
  );
}
