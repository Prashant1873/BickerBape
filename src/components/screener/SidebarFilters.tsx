'use client';

import React, { useState, useMemo } from 'react';
import { useScreener } from '@/context/ScreenerContext';

const PRESETS = [
  { id: 'all', label: 'All Funds', icon: 'apps', emblemClass: 'chip-emblem-indigo' },
  { id: 'smartscore_elite', label: 'SmartScore™ Elite (>= 7.5)', icon: 'workspace_premium', emblemClass: 'chip-emblem-purple' },
  { id: 'prashant', label: '10-Step Formula', icon: 'military_tech', emblemClass: 'chip-emblem-gold' },
  { id: 'compounders', label: 'Consistent Compounders', icon: 'trending_up', emblemClass: 'chip-emblem-emerald' },
  { id: 'low_vol', label: 'Low Volatility Titans', icon: 'security', emblemClass: 'chip-emblem-blue' },
  { id: 'alpha', label: 'High Alpha Champions', icon: 'bolt', emblemClass: 'chip-emblem-coral' },
  { id: 'elss', label: 'ELSS Tax Saver', icon: 'savings', emblemClass: 'chip-emblem-teal' }
];

const INSIGHTS = [
  "Chasing rank-1 funds every year triggers taxes and exit loads. Focus on 3-year rolling consistency and stable tenure.",
  "An outperformance ratio >= 1.35x proves the fund manager generates real alpha over their category benchmark, not just sector luck.",
  "Young schemes (<3Y) lack full market cycle validation. BickerBape caps unproven schemes at 7.0/10 to protect fiduciary discipline.",
  "Single-sector thematic funds carry 100% idiosyncratic risk. Keep them capped at max 10-15% as satellite plays in your portfolio."
];

export const SidebarFilters: React.FC = () => {
  const {
    funds,
    filters,
    updateFilter,
    resetFilters,
    sidebarOpen,
    setSidebarOpen,
    sidebarCollapsed,
    toggleSidebarCollapse,
    activeFilterCount,
  } = useScreener();

  const [insightIndex, setInsightIndex] = useState(0);

  // Compute unique categories and scheme counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { 'All Funds': funds.length };
    funds.forEach(f => {
      counts[f.category] = (counts[f.category] || 0) + 1;
    });
    return counts;
  }, [funds]);

  const categoriesList = useMemo(() => {
    return Object.keys(categoryCounts).sort((a, b) => {
      if (a === 'All Funds') return -1;
      if (b === 'All Funds') return 1;
      return a.localeCompare(b);
    });
  }, [categoryCounts]);

  const nextInsight = () => {
    setInsightIndex(prev => (prev + 1) % INSIGHTS.length);
  };

  const filterBody = (
    <div className="space-y-5">
      {/* 1. Reset Filters Action Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5 text-primary font-bold text-xs">
          <span className="material-symbols-outlined text-base">tune</span>
          <span>Screener Filters</span>
        </div>
        <button
          type="button"
          onClick={resetFilters}
          className="px-2 py-1 text-xs text-primary hover:underline font-bold cursor-pointer touch-spring"
        >
          Reset All
        </button>
      </div>

      {/* 2. Strategy Presets (1-Click Strategies) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
            1-Click Strategies
          </span>
          {filters.preset !== 'all' && (
            <button
              type="button"
              onClick={() => updateFilter('preset', 'all')}
              className="text-[11px] text-primary hover:underline font-semibold cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
        <div className="space-y-1.5">
          {PRESETS.map(p => {
            const active = filters.preset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => updateFilter('preset', p.id)}
                className={`w-full text-left p-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all touch-spring border ${
                  active
                    ? 'bg-primary-container text-white border-primary shadow-xs'
                    : 'bg-surface-container-low border-surface-container text-on-surface hover:bg-surface-container hover:border-primary/30'
                }`}
              >
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                  active ? 'bg-white/20 text-white' : 'bg-surface-container text-primary'
                }`}>
                  <span className="material-symbols-outlined text-sm">{p.icon}</span>
                </span>
                <span className="truncate flex-1">{p.label}</span>
                {active && (
                  <span className="material-symbols-outlined text-xs text-white">check</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Equity Categories Universe (Legacy Vertical Pill List) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
            Equity Categories
          </span>
          {filters.category !== 'All Funds' && (
            <button
              type="button"
              onClick={() => updateFilter('category', 'All Funds')}
              className="text-[11px] text-primary hover:underline font-semibold cursor-pointer"
            >
              All Funds
            </button>
          )}
        </div>
        <div className="space-y-1 max-h-56 overflow-y-auto hide-scrollbar pr-1" id="sidebar-categories-list">
          {categoriesList.map(cat => {
            const active = filters.category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => updateFilter('category', cat)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all touch-spring border ${
                  active
                    ? 'bg-primary/10 border-primary text-primary font-bold shadow-2xs'
                    : 'bg-surface-container-lowest dark:bg-surface-container-low border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                <span className="truncate pr-2">{cat === 'All Funds' ? 'All Equity Funds' : cat}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  active ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'
                }`}>
                  {categoryCounts[cat] || 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Quantitative Hurdle Sliders */}
      <div className="space-y-4 pt-2 border-t border-surface-container">
        <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block">
          Quantitative Hurdles
        </span>

        {/* Min 3Y Rolling Return */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-on-surface font-medium">Min 3Y Rolling Return</span>
            <span className="font-mono font-bold text-primary px-2 py-0.5 rounded-lg bg-surface-container text-[11px] tabular-nums">
              {filters.minRollingReturn > -100 ? `${filters.minRollingReturn}%` : 'Off'}
            </span>
          </div>
          <input
            type="range"
            min="-10"
            max="30"
            step="1"
            value={filters.minRollingReturn}
            onChange={(e) => updateFilter('minRollingReturn', Number(e.target.value))}
            className="apple-slider"
            aria-label="Minimum 3-Year Rolling Return"
          />
        </div>

        {/* Min Sharpe */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-on-surface font-medium">Min Sharpe Ratio</span>
            <span className="font-mono font-bold text-primary px-2 py-0.5 rounded-lg bg-surface-container text-[11px] tabular-nums">
              {filters.minSharpe > -10 ? filters.minSharpe.toFixed(1) : 'Off'}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="2.5"
            step="0.1"
            value={filters.minSharpe}
            onChange={(e) => updateFilter('minSharpe', Number(e.target.value))}
            className="apple-slider"
            aria-label="Minimum Sharpe Ratio"
          />
        </div>

        {/* Max Volatility */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-on-surface font-medium">Max Annualized Volatility</span>
            <span className="font-mono font-bold text-primary px-2 py-0.5 rounded-lg bg-surface-container text-[11px] tabular-nums">
              {filters.maxVolatility < 100 ? `${filters.maxVolatility}%` : 'Off'}
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="35"
            step="1"
            value={filters.maxVolatility}
            onChange={(e) => updateFilter('maxVolatility', Number(e.target.value))}
            className="apple-slider"
            aria-label="Maximum Volatility"
          />
        </div>

        {/* Min SmartScore */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-on-surface font-medium">Min SmartScore™</span>
            <span className="font-mono font-bold text-primary px-2 py-0.5 rounded-lg bg-surface-container text-[11px] tabular-nums">
              {filters.minSmartScore > 0 ? `${filters.minSmartScore.toFixed(1)}/10` : 'Off'}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="9.0"
            step="0.5"
            value={filters.minSmartScore}
            onChange={(e) => updateFilter('minSmartScore', Number(e.target.value))}
            className="apple-slider"
            aria-label="Minimum SmartScore"
          />
        </div>
      </div>

      {/* 6. Quantitative Strategy Tip Card (Rotating) */}
      <div
        onClick={nextInsight}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && nextInsight()}
        tabIndex={0}
        role="button"
        className="p-3.5 rounded-2xl bg-gradient-to-br from-primary/10 via-surface-container-low to-primary/5 border border-primary/20 cursor-pointer touch-spring group select-none"
        title="Click to cycle quant strategy insights"
      >
        <div className="flex items-center justify-between text-[10px] font-bold text-primary uppercase mb-1.5">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">psychology</span>
            <span>Quant Insight</span>
          </span>
          <span className="text-on-surface-variant font-mono flex items-center gap-0.5 group-hover:text-primary">
            <span>Next</span>
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </span>
        </div>
        <p className="text-xs text-on-surface italic leading-relaxed">
          &quot;{INSIGHTS[insightIndex]}&quot;
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (320px w-80 left pane) */}
      {!sidebarCollapsed ? (
        <aside className="hidden md:flex flex-col w-80 flex-shrink-0 border-r border-surface-container bg-surface/50 max-h-[calc(100vh-4rem)] transition-all duration-200">
          {/* Sidebar Header: Title, Active Status & Collapse Action */}
          <div className="p-3.5 border-b border-surface-container flex items-center justify-between bg-surface-container-lowest/60">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-base">tune</span>
              </div>
              <div>
                <span className="text-xs font-bold text-on-surface block leading-tight">Mutual Fund Filters</span>
                <span className="text-[10px] text-on-surface-variant font-medium">
                  {activeFilterCount > 0 ? `${activeFilterCount} active filter${activeFilterCount > 1 ? 's' : ''}` : 'Configure Screener'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-2 py-1 rounded-lg text-[10px] font-bold text-primary hover:bg-primary/10 transition-colors touch-spring cursor-pointer"
                  title="Reset all filters"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Filters Body */}
          <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
            {filterBody}
          </div>

          {/* Sidebar Footer Status */}
          <div className="p-3 border-t border-surface-container bg-surface flex items-center justify-between text-xs text-on-surface-variant flex-shrink-0">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-gain animate-pulse" />
              <span>AMFI Live</span>
            </span>
            <span className="font-mono font-bold text-primary text-[11px]">
              {funds.length} Schemes
            </span>
          </div>
        </aside>
      ) : (
        /* Collapsed Desktop Mini-Rail (1-click expand right from workspace edge) */
        <aside
          onClick={toggleSidebarCollapse}
          className="hidden md:flex flex-col w-12 flex-shrink-0 border-r border-surface-container bg-surface-container-lowest/60 hover:bg-surface-container-low max-h-[calc(100vh-4rem)] items-center py-4 justify-between cursor-pointer transition-colors group select-none"
          title="Expand filters sidebar (\)"
          aria-label="Expand filters sidebar"
        >
          <div className="w-8 h-8 rounded-xl bg-surface-container group-hover:bg-primary group-hover:text-white text-primary flex items-center justify-center transition-all shadow-2xs">
            <span className="material-symbols-outlined text-base">dock_to_right</span>
          </div>

          <div className="text-[10px] font-bold text-on-surface-variant group-hover:text-primary tracking-widest uppercase transition-colors flex flex-col items-center gap-1.5">
            <span className="material-symbols-outlined text-xs group-hover:translate-x-0.5 transition-transform">chevron_right</span>
            <span className="[writing-mode:vertical-rl] rotate-180">FILTERS</span>
          </div>

          <div className="w-6 h-6 rounded-full bg-surface-container text-[10px] font-bold text-primary flex items-center justify-center tabular-nums">
            {funds.length}
          </div>
        </aside>
      )}

      {/* Mobile Slide-Over Bottom Sheet / Drawer */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          <div className="relative bg-surface rounded-t-3xl border-t border-surface-container shadow-2xl max-h-[85vh] flex flex-col overflow-hidden z-10 animate-in slide-in-from-bottom duration-200">
            <div className="p-4 border-b border-surface-container flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">tune</span>
                <h3 className="font-headline-md font-bold text-base text-on-surface">Filter Mutual Funds</h3>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-surface-container-low text-on-surface-variant hover:text-on-surface flex items-center justify-center touch-spring"
                aria-label="Close filters"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-4 overflow-y-auto hide-scrollbar">
              {filterBody}
            </div>

            <div className="p-4 border-t border-surface-container bg-surface-container-low flex items-center gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={resetFilters}
                className="flex-1 min-h-[44px] py-2.5 rounded-xl border border-surface-container bg-surface text-xs font-bold text-on-surface-variant hover:text-on-surface touch-spring"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="flex-2 min-h-[44px] py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-xs hover:bg-primary-container touch-spring flex items-center justify-center gap-1.5"
              >
                <span>View Results ({funds.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
