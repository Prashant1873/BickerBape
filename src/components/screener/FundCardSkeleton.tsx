'use client';

import React from 'react';

export const FundCardSkeleton: React.FC = () => {
  return (
    <div
      data-testid="fund-card-skeleton"
      className="card-interactive group p-4 sm:p-5 relative flex flex-col justify-between select-none min-h-[224px] pointer-events-none"
    >
      <div>
        {/* Card Header: Circular Gauge Placeholder & Category Pill Placeholder */}
        <div className="flex items-center justify-between gap-2.5 mb-3">
          <div className="flex items-center gap-2.5">
            {/* Circular Gauge */}
            <div className="w-10 h-10 rounded-full shimmer-sweep shrink-0" />
            <div className="flex flex-col gap-1.5">
              <div className="h-2.5 w-16 rounded shimmer-sweep" />
              <div className="h-3 w-24 rounded shimmer-sweep" />
            </div>
          </div>

          {/* Category Pill Placeholder */}
          <div className="h-5 w-20 rounded-md shimmer-sweep shrink-0" />
        </div>

        {/* Fund Identity Placeholders */}
        <div className="mb-3.5 space-y-2">
          <div className="flex items-center gap-1.5">
            <div className="h-5 w-16 rounded-md shimmer-sweep" />
            <div className="h-5 w-24 rounded-md shimmer-sweep" />
          </div>
          <div className="h-5 w-4/5 rounded shimmer-sweep" />
          <div className="h-3.5 w-1/2 rounded shimmer-sweep" />
        </div>

        {/* 3-Column Key Metrics Grid Placeholder */}
        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-surface-container-low/60 border border-surface-container mb-3 text-center">
          <div className="flex flex-col items-center gap-1 py-1">
            <div className="h-2.5 w-12 rounded shimmer-sweep" />
            <div className="h-3.5 w-10 rounded shimmer-sweep" />
          </div>
          <div className="flex flex-col items-center gap-1 py-1">
            <div className="h-2.5 w-12 rounded shimmer-sweep" />
            <div className="h-3.5 w-10 rounded shimmer-sweep" />
          </div>
          <div className="flex flex-col items-center gap-1 py-1">
            <div className="h-2.5 w-12 rounded shimmer-sweep" />
            <div className="h-3.5 w-10 rounded shimmer-sweep" />
          </div>
        </div>

        {/* Action Buttons Placeholders (min-h 44px Fitts's law) */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="h-11 rounded-xl shimmer-sweep" />
          <div className="h-11 rounded-xl shimmer-sweep" />
        </div>
      </div>

      {/* Footer / Horizon Subtext Placeholder */}
      <div className="flex items-center justify-between pt-1 border-t border-surface-container/40">
        <div className="h-3 w-20 rounded shimmer-sweep" />
        <div className="h-3 w-16 rounded shimmer-sweep" />
      </div>
    </div>
  );
};
