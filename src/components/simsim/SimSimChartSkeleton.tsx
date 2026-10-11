'use client';

import React from 'react';

export const SimSimChartSkeleton: React.FC = () => {
  return (
    <div
      data-testid="simsim-chart-skeleton"
      className="simsim-card p-4 sm:p-5 space-y-4 min-h-[380px] pointer-events-none select-none"
    >
      {/* Chart Header Placeholders */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="space-y-1.5">
          <div className="h-4 w-64 rounded shimmer-sweep" />
          <div className="h-3 w-80 rounded shimmer-sweep" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-4 w-28 rounded-full shimmer-sweep" />
          <div className="h-4 w-24 rounded-full shimmer-sweep" />
        </div>
      </div>

      {/* Chart Canvas Area Placeholder (Exact h-80 w-full layout with Cartesian grid lines) */}
      <div className="h-80 w-full rounded-xl bg-surface-container-low/40 border border-surface-container/60 p-4 flex flex-col justify-between relative overflow-hidden">
        {/* Horizontal dashed Cartesian grid lines */}
        <div className="w-full border-b border-dashed border-surface-container" />
        <div className="w-full border-b border-dashed border-surface-container" />
        <div className="w-full border-b border-dashed border-surface-container" />
        <div className="w-full border-b border-dashed border-surface-container" />
        <div className="w-full border-b border-surface-container" />

        {/* Faint simulation trajectory wave shimmer overlay */}
        <div className="absolute inset-x-0 bottom-4 top-12 opacity-30 shimmer-sweep rounded" />

        {/* X-axis date tick placeholders */}
        <div className="flex justify-between items-center pt-2">
          <div className="h-2.5 w-12 rounded shimmer-sweep" />
          <div className="h-2.5 w-12 rounded shimmer-sweep" />
          <div className="h-2.5 w-12 rounded shimmer-sweep" />
          <div className="h-2.5 w-12 rounded shimmer-sweep" />
          <div className="h-2.5 w-12 rounded shimmer-sweep" />
        </div>
      </div>
    </div>
  );
};
