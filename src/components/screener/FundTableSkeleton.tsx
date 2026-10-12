'use client';

import React from 'react';
import { KPI_CATALOG, DEFAULT_TABLE_COLUMNS } from '@/lib/kpi-catalog';

interface FundTableSkeletonProps {
  columns?: string[];
  rowCount?: number;
}

export const FundTableSkeleton: React.FC<FundTableSkeletonProps> = ({
  columns = DEFAULT_TABLE_COLUMNS,
  rowCount = 12
}) => {
  return (
    <div
      data-testid="fund-table-skeleton"
      className="space-y-4 pointer-events-none select-none"
    >
      <div className="rounded-2xl border border-surface-container bg-surface-container-lowest overflow-hidden shadow-xs relative">
        {/* Mobile horizontal scroll gradient hint */}
        <div className="pointer-events-none absolute top-0 bottom-0 right-0 w-6 bg-gradient-to-l from-surface-container-lowest to-transparent sm:hidden z-20" />

        <div className="overflow-x-auto max-h-[75vh] hide-scrollbar scroll-smooth">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 z-30 bg-surface-container-low/95 backdrop-blur-sm shadow-xs">
              <tr className="border-b border-surface-container text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                {/* Sticky Left Header: Compare & Fund Name */}
                <th className="sticky left-0 top-0 z-40 bg-surface-container-low py-3 px-4 min-w-[280px] sm:min-w-[360px] shadow-[2px_0_5px_rgba(0,0,0,0.04)] dark:shadow-[2px_0_5px_rgba(0,0,0,0.25)] border-r border-surface-container">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-on-surface-variant/70 w-6 shrink-0 text-center">#</span>
                    <div className="w-[84px] sm:w-[96px] shrink-0 text-center">
                      <span className="text-[10px] text-[#00A86B] dark:text-[#00F090] font-bold">SimSim</span>
                    </div>
                    <div className="w-10 shrink-0 text-center">
                      <span className="text-[10px] text-on-surface-variant/70 font-bold">Compare</span>
                    </div>
                    <div className="min-w-0 flex-1 pl-1">
                      <span className="truncate">Scheme &amp; Category</span>
                    </div>
                  </div>
                </th>

                {/* Dynamic Columns Headers */}
                {columns.map((colId) => {
                  const metric = KPI_CATALOG[colId];
                  const label = metric ? metric.label : colId;
                  const isRight = metric?.align === 'text-right';
                  const isCenter = metric?.align === 'text-center';
                  return (
                    <th
                      key={colId}
                      className={`py-3 px-3 min-w-[110px] ${
                        isRight ? 'text-right' : isCenter ? 'text-center' : 'text-left'
                      }`}
                    >
                      <div className={`w-full flex items-center gap-1 ${
                        isRight ? 'justify-end' : isCenter ? 'justify-center' : 'justify-start'
                      }`}>
                        <span>{label}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-surface-container/60">
              {[...Array(rowCount)].map((_, idx) => (
                <tr key={idx} className="min-h-[52px]">
                  {/* Sticky Left Cell: Index, Buttons, and Scheme Identity Placeholder */}
                  <td className="sticky left-0 z-10 bg-surface-container-lowest py-2.5 px-4 shadow-[2px_0_5px_rgba(0,0,0,0.03)] dark:shadow-[2px_0_5px_rgba(0,0,0,0.2)] border-r border-surface-container">
                    <div className="flex items-center gap-2">
                      <span className="tabular-nums text-[11px] text-on-surface-variant/60 w-6 shrink-0 text-center">
                        {idx + 1}
                      </span>

                      {/* SimSim button placeholder */}
                      <div className="w-[84px] sm:w-[96px] shrink-0 flex items-center justify-center">
                        <div className="w-full h-8 rounded-lg shimmer-sweep" />
                      </div>

                      {/* Compare checkbox placeholder */}
                      <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                        <div className="w-5 h-5 rounded-md shimmer-sweep" />
                      </div>

                      {/* Scheme & Category placeholder */}
                      <div className="min-w-0 flex-1 space-y-1.5 pl-1">
                        <div className="h-3.5 w-4/5 rounded shimmer-sweep" />
                        <div className="flex items-center gap-1.5">
                          <div className="h-3 w-12 rounded shimmer-sweep" />
                          <div className="h-3 w-16 rounded shimmer-sweep" />
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Dynamic Columns Placeholders */}
                  {columns.map((colId) => {
                    const metric = KPI_CATALOG[colId];
                    const isRight = metric?.align === 'text-right';
                    const isCenter = metric?.align === 'text-center';
                    return (
                      <td
                        key={colId}
                        className={`py-3 px-3 min-h-[52px] ${
                          isRight ? 'text-right' : isCenter ? 'text-center' : 'text-left'
                        }`}
                      >
                        <div className={`w-full flex items-center ${
                          isRight ? 'justify-end' : isCenter ? 'justify-center' : 'justify-start'
                        }`}>
                          <div className="h-4 w-14 rounded shimmer-sweep" />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
