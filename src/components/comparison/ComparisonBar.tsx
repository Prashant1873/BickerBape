'use client';

import React, { useState } from 'react';
import { useScreener } from '@/context/ScreenerContext';

export const ComparisonBar: React.FC = () => {
  const {
    comparisonList,
    funds,
    toggleComparison,
    clearComparison,
    setIsComparisonMatrixOpen
  } = useScreener();

  const [isMinimized, setIsMinimized] = useState(false);

  if (comparisonList.length === 0) return null;

  const comparedFunds = comparisonList
    .map(code => funds.find(f => f.code === code))
    .filter(Boolean);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-4xl px-3 pointer-events-none">
      <div className="glass-chrome rounded-[20px] border border-primary/30 shadow-2xl p-3 sm:p-4 pointer-events-auto transition-all animate-in slide-in-from-bottom-5 duration-200">
        
        {/* Minimized Pill on Mobile / Small screens */}
        {isMinimized ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-bold text-on-surface">
                {comparisonList.length} Scheme{comparisonList.length > 1 ? 's' : ''} in Compare Tray
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMinimized(false)}
                className="min-h-[38px] px-3 rounded-xl bg-surface-container text-xs font-bold text-on-surface hover:text-primary touch-spring flex items-center gap-1"
              >
                <span>Expand</span>
                <span className="material-symbols-outlined text-sm">expand_less</span>
              </button>
              {comparisonList.length >= 2 && (
                <button
                  type="button"
                  onClick={() => setIsComparisonMatrixOpen(true)}
                  className="min-h-[38px] px-4 rounded-xl bg-primary text-white text-xs font-bold shadow-xs hover:bg-primary-container touch-spring flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">compare_arrows</span>
                  <span>Compare</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div>
            {/* Header / Tray controls */}
            <div className="flex items-center justify-between pb-2 border-b border-surface-container/60 gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">compare_arrows</span>
                <span className="text-xs font-bold text-on-surface">
                  Comparison Tray ({comparisonList.length}/4)
                </span>
                <span className="text-[10px] text-on-surface-variant hidden sm:inline">
                  Select 2 to 4 schemes to contrast institutional metrics
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={clearComparison}
                  className="px-2 py-1 text-[11px] font-bold text-on-surface-variant hover:text-error transition-colors"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setIsMinimized(true)}
                  className="w-8 h-8 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center touch-spring"
                  title="Minimize tray"
                >
                  <span className="material-symbols-outlined text-base">expand_more</span>
                </button>
              </div>
            </div>

            {/* Selected Funds Chips & Compare Trigger */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3">
              {/* Chips List */}
              <div className="flex items-center gap-2 flex-wrap max-h-20 overflow-y-auto hide-scrollbar">
                {comparedFunds.map(fund => (
                  <div
                    key={String(fund!.code)}
                    className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-xl bg-surface-container-low border border-surface-container text-xs font-semibold text-on-surface shadow-2xs"
                  >
                    <span className="truncate max-w-[160px] sm:max-w-[180px]">
                      {fund!.name.split(' - Direct')[0]}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleComparison(fund!.code)}
                      className="w-5 h-5 rounded-full hover:bg-surface-container text-on-surface-variant hover:text-error flex items-center justify-center touch-spring"
                      aria-label={`Remove ${fund!.name}`}
                    >
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Action Button: Compare Matrix */}
              <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
                <button
                  type="button"
                  disabled={comparisonList.length < 2}
                  onClick={() => setIsComparisonMatrixOpen(true)}
                  className={`w-full sm:w-auto min-h-[44px] px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 touch-spring ${
                    comparisonList.length >= 2
                      ? 'bg-primary text-white hover:bg-primary-container shadow-md cursor-pointer'
                      : 'bg-surface-container text-on-surface-variant/50 cursor-not-allowed'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">difference</span>
                  <span>
                    {comparisonList.length < 2 ? 'Select 1 More to Compare' : 'Open Comparison Matrix'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
