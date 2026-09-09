'use client';

import React, { useState, useMemo } from 'react';
import { useScreener } from '@/context/ScreenerContext';

const PRESETS = [
  { id: 'all', label: 'All Funds', icon: 'apps' },
  { id: 'smartscore_elite', label: 'SmartScore™ Elite (>= 7.5)', icon: 'workspace_premium' },
  { id: 'prashant', label: '10-Step Formula', icon: 'military_tech' },
  { id: 'compounders', label: 'Consistent Compounders', icon: 'trending_up' },
  { id: 'low_vol', label: 'Low Volatility Titans', icon: 'security' },
  { id: 'alpha', label: 'High Alpha Champions', icon: 'bolt' },
  { id: 'elss', label: 'ELSS Tax Saver', icon: 'savings' }
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
    activeFilterCount,
    sidebarOpen,
    setSidebarOpen
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

  const filterContent = (
    <div className="space-y-6">
      {/* Category Dropdown & Quick Counts */}
      <div>
        <label htmlFor="filter-category" className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">
          Category Universe
        </label>
        <select
          id="filter-category"
          value={filters.category}
          onChange={(e) => updateFilter('category', e.target.value)}
          className="w-full bg-surface-container-low border border-surface-container rounded-xl py-2.5 px-3 text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[44px] cursor-pointer"
        >
          {categoriesList.map(cat => (
            <option key={cat} value={cat}>
              {cat} ({categoryCounts[cat] || 0})
            </option>
          ))}
        </select>
      </div>

      {/* 1-Click Strategy Presets (Hick's Law) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
            Strategy Presets
          </span>
          {filters.preset !== 'all' && (
            <button
              type="button"
              onClick={() => updateFilter('preset', 'all')}
              className="text-[11px] text-primary hover:underline font-semibold"
            >
              Reset
            </button>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          {PRESETS.map(p => {
            const active = filters.preset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => updateFilter('preset', p.id)}
                className={`min-h-[40px] px-3 py-2 rounded-xl text-xs font-semibold text-left flex items-center justify-between transition-all touch-spring ${
                  active
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-surface-container-low/60 hover:bg-surface-container text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">{p.icon}</span>
                  <span>{p.label}</span>
                </div>
                {active && <span className="material-symbols-outlined text-sm">check</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantitative Range Sliders */}
      <div className="space-y-4 pt-2 border-t border-surface-container">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
            Quantitative Hurdles
          </span>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-[11px] text-primary hover:underline font-semibold"
            >
              Reset All
            </button>
          )}
        </div>

        {/* Min 3Y Rolling Return */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-on-surface font-medium">Min 3Y Rolling Return</span>
            <span className="font-mono font-bold text-primary px-1.5 py-0.5 rounded bg-surface-container text-[11px]">
              {filters.minRollingReturn > -100 ? `${filters.minRollingReturn}%` : 'Off'}
            </span>
          </div>
          <input
            type="range"
            min="-10"
            max="25"
            step="1"
            value={filters.minRollingReturn > -100 ? filters.minRollingReturn : -10}
            onChange={(e) => updateFilter('minRollingReturn', Number(e.target.value))}
            className="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
            aria-label="Minimum 3 Year Rolling Return"
          />
        </div>

        {/* Min Sharpe Ratio */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-on-surface font-medium">Min Sharpe Ratio</span>
            <span className="font-mono font-bold text-primary px-1.5 py-0.5 rounded bg-surface-container text-[11px]">
              {filters.minSharpe > -10 ? filters.minSharpe.toFixed(1) : 'Off'}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1.5"
            step="0.1"
            value={filters.minSharpe > -10 ? filters.minSharpe : 0}
            onChange={(e) => updateFilter('minSharpe', Number(e.target.value))}
            className="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
            aria-label="Minimum Sharpe Ratio"
          />
        </div>

        {/* Max Volatility */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-on-surface font-medium">Max Volatility</span>
            <span className="font-mono font-bold text-primary px-1.5 py-0.5 rounded bg-surface-container text-[11px]">
              {filters.maxVolatility < 100 ? `${filters.maxVolatility}%` : 'Off'}
            </span>
          </div>
          <input
            type="range"
            min="8"
            max="30"
            step="1"
            value={filters.maxVolatility < 100 ? filters.maxVolatility : 30}
            onChange={(e) => updateFilter('maxVolatility', Number(e.target.value))}
            className="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
            aria-label="Maximum Volatility"
          />
        </div>

        {/* Min SmartScore */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-on-surface font-medium">Min SmartScore™</span>
            <span className="font-mono font-bold text-primary px-1.5 py-0.5 rounded bg-surface-container text-[11px]">
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
            className="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
            aria-label="Minimum SmartScore"
          />
        </div>
      </div>

      {/* Interactive Strategy Insight Card (Micro-Delight) */}
      <div
        onClick={nextInsight}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && nextInsight()}
        tabIndex={0}
        role="button"
        className="p-3.5 rounded-2xl bg-gradient-to-br from-primary/10 via-surface-container-low to-primary/5 border border-primary/20 cursor-pointer touch-spring group select-none"
        title="Click to cycle insights"
      >
        <div className="flex items-center justify-between text-[10px] font-bold text-primary uppercase mb-1.5">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">lightbulb</span>
            <span>Fiduciary Insight</span>
          </span>
          <span className="text-on-surface-variant font-mono">Tap for next</span>
        </div>
        <p className="text-xs text-on-surface italic leading-relaxed">
          &quot;{INSIGHTS[insightIndex]}&quot;
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed 280px left pane) */}
      <aside className="hidden lg:block w-72 flex-shrink-0 p-4 border-r border-surface-container bg-surface/50 overflow-y-auto max-h-[calc(100vh-4rem)] hide-scrollbar">
        {filterContent}
      </aside>

      {/* Mobile Slide-Over Bottom Sheet / Drawer */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop blur with touch dismiss */}
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Bottom Sheet Modal (Touch-Friendly) */}
          <div className="relative bg-surface rounded-t-3xl border-t border-surface-container shadow-2xl max-h-[85vh] flex flex-col overflow-hidden z-10 animate-in slide-in-from-bottom duration-200">
            {/* Sheet Handle & Header */}
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

            {/* Scrollable Filters Body */}
            <div className="p-4 overflow-y-auto hide-scrollbar space-y-6">
              {filterContent}
            </div>

            {/* Sheet Footer */}
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
