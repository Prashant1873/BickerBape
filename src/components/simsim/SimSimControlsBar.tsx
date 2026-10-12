'use client';

import React from 'react';
import { SimulationReport } from '@/lib/simsim-engine';
import { FundSummary } from '@/types/fund';
import { exportSimulationCsv, printSimulationSummary } from '@/lib/export-utils';

interface SimSimControlsBarProps {
  bucketCount: number;
  report: SimulationReport | null;
  bucketFunds?: FundSummary[];
  onEqualizeWeights: () => void;
  onClearBucket: () => void;
  onExitToScreener: () => void;
}

export const SimSimControlsBar: React.FC<SimSimControlsBarProps> = ({
  bucketCount,
  report,
  bucketFunds = [],
  onEqualizeWeights,
  onClearBucket,
  onExitToScreener
}) => {
  return (
    <div className="simsim-card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#00F090]/15 border border-[#00F090]/30 flex items-center justify-center text-[#00A86B] dark:text-[#00F090]">
          <span className="material-symbols-outlined text-2xl simsim-pulse-icon">hourglass_top</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[1.375rem] text-on-surface dark:text-white font-bold leading-[1.2]">
              SimSim™ Simulation Workspace
            </h2>
          </div>
          <div className="text-xs text-on-surface-variant dark:text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
            <span>
              Active Portfolio Basket:{' '}
              <strong className="text-on-surface dark:text-white">
                {bucketCount} Scheme{bucketCount > 1 ? 's' : ''}
              </strong>
            </span>
            {report && (
              <span className="text-[0.75rem] font-mono px-2 py-0.5 rounded-md bg-surface-container border border-surface-container-high text-on-surface dark:bg-white/5 dark:border-white/10 dark:text-white flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-[#00A86B] dark:text-[#00F090]">
                  calendar_today
                </span>
                <span>
                  {report.startDate} to {report.endDate} ({report.years}Y • {report.timeSeries.length} points)
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Controls (Fitts's Law min 44px touch targets) */}
      <div className="flex items-center gap-2 flex-wrap">
        {report && (
          <>
            <button
              type="button"
              onClick={() => exportSimulationCsv(report, bucketFunds)}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high dark:bg-[#182234] dark:hover:bg-[#202d44] border border-surface-container-high dark:border-white/10 text-xs font-bold text-on-surface dark:text-white flex items-center gap-1.5 touch-spring transition-colors cursor-pointer btn-specular"
              title="Download backtest results as CSV"
            >
              <span className="material-symbols-outlined text-sm text-gain-text optical-icon">
                download
              </span>
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={printSimulationSummary}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high dark:bg-[#182234] dark:hover:bg-[#202d44] border border-surface-container-high dark:border-white/10 text-xs font-bold text-on-surface dark:text-white flex items-center gap-1.5 touch-spring transition-colors cursor-pointer btn-specular"
              title="Print institutional summary report"
            >
              <span className="material-symbols-outlined text-sm text-primary optical-icon">
                print
              </span>
              <span>Print</span>
            </button>
          </>
        )}

        <button
          type="button"
          onClick={onEqualizeWeights}
          className="min-h-[44px] px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high dark:bg-[#182234] dark:hover:bg-[#202d44] border border-surface-container-high dark:border-white/10 text-xs font-bold text-primary dark:text-[#38bdf8] flex items-center gap-1.5 touch-spring transition-colors cursor-pointer"
          title="Equalize weights across all schemes"
        >
          <span className="material-symbols-outlined text-sm optical-icon">balance</span>
          <span>Equal Weight</span>
        </button>

        <button
          type="button"
          onClick={onClearBucket}
          className="min-h-[44px] px-3.5 py-2 rounded-xl bg-loss-bg hover:bg-loss/20 dark:bg-[#281518] dark:hover:bg-[#381c20] border border-loss/30 text-xs font-bold text-loss-text flex items-center gap-1.5 touch-spring transition-colors cursor-pointer"
          title="Clear all schemes from bucket"
        >
          <span className="material-symbols-outlined text-sm optical-icon">delete_sweep</span>
          <span>Clear</span>
        </button>

        <button
          type="button"
          onClick={onExitToScreener}
          className="min-h-[44px] px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high dark:bg-white/10 dark:hover:bg-white/15 text-xs font-bold text-on-surface dark:text-white flex items-center gap-1.5 touch-spring transition-colors cursor-pointer"
          title="Return to Mutual Fund Screener"
        >
          <span className="material-symbols-outlined text-sm optical-icon">arrow_back</span>
          <span>Exit to Screener</span>
        </button>
      </div>
    </div>
  );
};
