'use client';

import React from 'react';

interface SimSimEmptyStateProps {
  loadModelPreset: (presetKey: 'aggressive' | 'defensive' | 'titan') => void;
  setAppMode: (mode: 'screener' | 'simsim') => void;
  sidebarCollapsed: boolean;
  toggleSidebarCollapse: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const SimSimEmptyState: React.FC<SimSimEmptyStateProps> = ({
  loadModelPreset,
  setAppMode,
  sidebarCollapsed,
  toggleSidebarCollapse,
  setSidebarOpen
}) => {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8 animate-in fade-in duration-300">
      {/* Hero Section */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#00F090]/15 border border-[#00F090]/30 mb-2">
          <span className="material-symbols-outlined text-4xl text-[#00A86B] dark:text-[#00F090] simsim-pulse-icon">
            hourglass_top
          </span>
        </div>
        <h1 className="text-[clamp(1.875rem,4vw,2.25rem)] font-extrabold text-on-surface dark:text-white tracking-tight leading-[1.15]">
          Welcome to SimSim<span className="text-[#00A86B] dark:text-[#00F090]">™</span> Time Machine
        </h1>
        <p className="text-[0.9375rem] font-normal text-on-surface-variant dark:text-slate-400 max-w-lg mx-auto leading-[1.45]">
          Institutional backtester simulating portfolio growth on daily audited NAV data. Select a curated model
          basket below or explore schemes in the Screener to add to your custom bucket.
        </p>
      </div>

      {/* 3 Curated Model Baskets Cards */}
      <div className="space-y-3">
        <h2 className="text-[0.75rem] font-bold uppercase tracking-[0.04em] text-on-surface-variant dark:text-slate-400 text-center">
          Start with an Institutional Model Portfolio:
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Titan */}
          <div className="p-5 rounded-2xl bg-surface-container-low dark:bg-[#0D1322] border border-surface-container dark:border-[#00F090]/30 flex flex-col justify-between space-y-4 hover:border-[#00F090]/60 transition-all shadow-resting-card hover:shadow-elevated-hover">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#00F090]/15 text-[#00A86B] dark:text-[#00F090] flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">shield</span>
                </div>
                <span className="text-[0.75rem] tabular-nums font-bold px-2 py-0.5 rounded-md bg-[#00F090]/15 text-[#00A86B] dark:text-[#00F090] border border-[#00F090]/30 tracking-[0.04em] uppercase">
                  40/35/25
                </span>
              </div>
              <h3 className="font-semibold text-[1.125rem] leading-[1.3] text-on-surface dark:text-white">
                The Titan
              </h3>
              <p className="text-[0.9375rem] font-normal leading-[1.45] text-on-surface-variant dark:text-slate-400">
                All-weather balanced compounder combining resilient Flexi Cap core with high-growth Mid & Small Cap
                alpha.
              </p>
            </div>
            <button
              type="button"
              onClick={() => loadModelPreset('titan')}
              className="w-full py-2.5 rounded-xl bg-[#00F090] hover:bg-[#00d880] text-black font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md touch-spring cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">rocket_launch</span>
              <span>Load & Backtest</span>
            </button>
          </div>

          {/* High-Alpha Rocket */}
          <div className="p-5 rounded-2xl bg-surface-container-low dark:bg-[#0D1322] border border-surface-container dark:border-[#FF5630]/30 flex flex-col justify-between space-y-4 hover:border-[#FF5630]/60 transition-all shadow-resting-card hover:shadow-elevated-hover">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#FF5630]/15 text-[#DE350B] dark:text-[#FF5630] flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">rocket_launch</span>
                </div>
                <span className="text-[0.75rem] tabular-nums font-bold px-2 py-0.5 rounded-md bg-[#FF5630]/15 text-[#DE350B] dark:text-[#FF5630] border border-[#FF5630]/30 tracking-[0.04em] uppercase">
                  40/30/30
                </span>
              </div>
              <h3 className="font-semibold text-[1.125rem] leading-[1.3] text-on-surface dark:text-white">
                High-Alpha Rocket
              </h3>
              <p className="text-[0.9375rem] font-normal leading-[1.45] text-on-surface-variant dark:text-slate-400">
                High-octane multi-cycle wealth creation prioritizing maximum alpha through proven Mid & Small Cap
                champions.
              </p>
            </div>
            <button
              type="button"
              onClick={() => loadModelPreset('aggressive')}
              className="w-full py-2.5 rounded-xl bg-[#FF5630] hover:bg-[#ff431a] text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md touch-spring cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">rocket_launch</span>
              <span>Load & Backtest</span>
            </button>
          </div>

          {/* Defensive Compounder */}
          <div className="p-5 rounded-2xl bg-surface-container-low dark:bg-[#0D1322] border border-surface-container dark:border-[#FFB800]/30 flex flex-col justify-between space-y-4 hover:border-[#FFB800]/60 transition-all shadow-resting-card hover:shadow-elevated-hover">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#FFB800]/15 text-[#975800] dark:text-[#FFB800] flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">savings</span>
                </div>
                <span className="text-[0.75rem] tabular-nums font-bold px-2 py-0.5 rounded-md bg-[#FFB800]/15 text-[#975800] dark:text-[#FFB800] border border-[#FFB800]/30 tracking-[0.04em] uppercase">
                  40/30/30
                </span>
              </div>
              <h3 className="font-semibold text-[1.125rem] leading-[1.3] text-on-surface dark:text-white">
                Defensive Anchor
              </h3>
              <p className="text-[0.9375rem] font-normal leading-[1.45] text-on-surface-variant dark:text-slate-400">
                Downside-protected wealth preservation combining large-cap stability with value-oriented contra alpha.
              </p>
            </div>
            <button
              type="button"
              onClick={() => loadModelPreset('defensive')}
              className="w-full py-2.5 rounded-xl bg-[#FFB800] hover:bg-[#e6a600] text-black font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md touch-spring cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">rocket_launch</span>
              <span>Load & Backtest</span>
            </button>
          </div>
        </div>
      </div>

      {/* Or Build Custom Basket */}
      <div className="text-center pt-2 flex items-center justify-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined' && window.innerWidth < 768) {
              setSidebarOpen(true);
            } else if (sidebarCollapsed) {
              toggleSidebarCollapse();
            }
          }}
          className="px-5 py-3 rounded-2xl bg-[#00F090]/15 hover:bg-[#00F090]/25 border border-[#00F090]/40 text-xs font-bold text-[#00A86B] dark:text-[#00F090] transition-all touch-spring inline-flex items-center gap-2 shadow-xs cursor-pointer"
          title="Configure simulation controls in sidebar"
        >
          <span className="material-symbols-outlined text-base">tune</span>
          <span>Configure Controls</span>
        </button>

        <button
          type="button"
          onClick={() => setAppMode('screener')}
          className="px-6 py-3 rounded-2xl bg-surface-container-low border border-surface-container hover:border-primary/40 text-xs font-bold text-on-surface hover:text-primary dark:hover:text-[#00F090] transition-all touch-spring inline-flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">search</span>
          <span>Browse 620 Schemes in Screener to Add</span>
        </button>
      </div>
    </div>
  );
};
