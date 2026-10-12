'use client';

import React from 'react';
import { FundSummary, NavPoint } from '@/types/fund';
import { NavChart } from '@/components/charts/NavChart';

interface DrawerChartsTabProps {
  fund: FundSummary;
  navHistory: NavPoint[];
  loadingNav: boolean;
}

export const DrawerChartsTab: React.FC<DrawerChartsTabProps> = ({
  fund,
  navHistory,
  loadingNav
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-primary">monitoring</span>
            <span>Daily Audited NAV Trajectory</span>
          </h3>
          {navHistory.length > 0 && (
            <span className="text-[10px] text-on-surface-variant font-medium">
              {navHistory.length} Daily Data Points
            </span>
          )}
        </div>

        <div className="h-64 sm:h-72 w-full p-2 bg-surface-container-lowest rounded-2xl border border-surface-container">
          {loadingNav ? (
            <div className="h-full flex items-center justify-center text-xs text-on-surface-variant animate-pulse">
              Loading NAV trajectory...
            </div>
          ) : navHistory.length > 0 ? (
            <NavChart navHistory={navHistory} fundName={fund.name} />
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-on-surface-variant">
              No daily historical NAV data available for this scheme.
            </div>
          )}
        </div>
      </section>

      {/* Trailing Returns Matrix */}
      <section className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm text-primary">trending_up</span>
          <span>Compound Annual Growth Rate (CAGR)</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: '1Y CAGR', val: fund.cagr_1y, ratio: null },
            { label: '3Y CAGR', val: fund.cagr_3y, ratio: fund.ratio_3y },
            { label: '5Y CAGR', val: fund.cagr_5y, ratio: fund.ratio_5y },
            { label: '10Y CAGR', val: fund.cagr_10y, ratio: fund.ratio_10y }
          ].map((ret, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-surface-container-low border border-surface-container text-center shadow-2xs"
            >
              <span className="text-[10px] font-bold uppercase text-on-surface-variant block">{ret.label}</span>
              <span
                className={`font-bold text-sm tabular-nums ${
                  ret.val && ret.val >= 0 ? 'text-gain' : 'text-loss'
                }`}
              >
                {ret.val !== null && ret.val !== undefined ? `${ret.val > 0 ? '+' : ''}${ret.val.toFixed(1)}%` : 'N/A'}
              </span>
              {ret.ratio && (
                <span className="block text-[9px] text-primary font-bold mt-0.5 tabular-nums">
                  {ret.ratio}x vs cat
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Core Compounding Rule */}
      <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container text-xs text-on-surface-variant flex items-center gap-2.5">
        <span className="material-symbols-outlined text-gain text-base flex-shrink-0">check_circle</span>
        <span>
          <strong className="text-on-surface font-bold">Consistency Rule:</strong> Evaluate 3-year rolling returns
          instead of CAGR alone to neutralize point-to-point entry timing bias and verify persistent compounding.
        </span>
      </div>
    </div>
  );
};
