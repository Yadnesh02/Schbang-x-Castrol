"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

interface EChartProps {
  option: Record<string, unknown>;
  height?: number | string;
  className?: string;
  onEvents?: Record<string, (params: unknown) => void>;
}

export function EChart({ option, height = 320, className, onEvents }: EChartProps) {
  return (
    <div className={cn("panel p-2", className)}>
      <ReactECharts
        option={option}
        notMerge
        lazyUpdate
        style={{ height, width: "100%" }}
        onEvents={onEvents}
        opts={{ renderer: "canvas" }}
      />
    </div>
  );
}
