'use client';

import React from 'react';

export const SimSimSummarySkeleton: React.FC = () => {
  return (
    <div
      data-testid="simsim-summary-skeleton"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pointer-events-none select-none"
    >
      {[...Array(4)].map((_, i) => (
        <div key={i} className="simsim-kpi-card p-4 min-h-[116px] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <div className="h-3 w-28 rounded shimmer-sweep" />
            <div className="w-7 h-7 rounded-lg shimmer-sweep shrink-0" />
          </div>
          <div className="my-1">
            <div className="h-7 w-32 rounded shimmer-sweep" />
          </div>
          <div className="h-3 w-40 rounded shimmer-sweep mt-0.5" />
        </div>
      ))}
    </div>
  );
};
