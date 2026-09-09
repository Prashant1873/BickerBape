'use client';

import React from 'react';
import { useScreener } from '@/context/ScreenerContext';

const SORT_OPTIONS = [
  { value: 'smart_score', label: 'SmartScore™' },
  { value: 'cagr_3y', label: '3Y CAGR' },
  { value: 'cagr_5y', label: '5Y CAGR' },
  { value: 'cagr_10y', label: '10Y CAGR' },
  { value: 'rolling_3y_avg', label: '3Y Rolling Avg' },
  { value: 'sharpe_ratio', label: 'Sharpe Ratio' },
  { value: 'volatility', label: 'Volatility (Low to High)' },
  { value: 'expense_ratio', label: 'TER (Low to High)' },
  { value: 'aum_cr', label: 'AUM' }
];

export const ActiveFiltersBar: React.FC = () => {
  const {
    funds,
    filteredFunds,
    filters,
    updateFilter,
    resetFilters,
    activeFilterCount,
    viewMode,
    setViewMode,
    setIsKpiModalOpen
  } = useScreener();

  return (
    <div className="space-y-3">
      {/* Top Controls Bar: Counter, View Switcher, Sort */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-surface-container">
        {/* Results Counter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-on-surface">
            Showing <span className="font-mono text-primary text-sm">{filteredFunds.length}</span> of {funds.length} Schemes
          </span>
          {activeFilterCount > 0 && (
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {activeFilterCount} active filter{activeFilterCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Action Controls: View Switcher, Customize Columns, Sort */}
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-between sm:justify-end">
          {/* View Mode Segmented Switcher (Cards vs Table) */}
          <div className="flex items-center p-0.5 bg-surface-container-low border border-surface-container rounded-xl shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`min-h-[36px] px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 touch-spring ${
                viewMode === 'cards'
                  ? 'bg-surface text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              aria-label="Cards View"
            >
              <span className="material-symbols-outlined text-base">grid_view</span>
              <span className="hidden md:inline">Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`min-h-[36px] px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 touch-spring ${
                viewMode === 'table'
                  ? 'bg-surface text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              aria-label="Table View"
            >
              <span className="material-symbols-outlined text-base">table_chart</span>
              <span className="hidden md:inline">Table</span>
            </button>
          </div>

          {/* Customize Columns Button (Only in Table View) */}
          {viewMode === 'table' && (
            <button
              type="button"
              onClick={() => setIsKpiModalOpen(true)}
              className="min-h-[36px] px-3 py-1.5 rounded-xl border border-surface-container bg-surface-container-low text-xs font-bold text-on-surface hover:text-primary hover:border-primary/40 flex items-center gap-1.5 transition-all touch-spring"
            >
              <span className="material-symbols-outlined text-base">view_column</span>
              <span>Customize KPIs</span>
            </button>
          )}

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1 bg-surface-container-low border border-surface-container rounded-xl px-2 py-1">
            <span className="material-symbols-outlined text-on-surface-variant text-base">sort</span>
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="bg-transparent text-xs font-bold text-on-surface focus:outline-none cursor-pointer pr-2"
              aria-label="Sort funds by"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => updateFilter('sortDir', filters.sortDir === 'asc' ? 'desc' : 'asc')}
              className="w-7 h-7 rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface touch-spring"
              title={`Sort ${filters.sortDir === 'asc' ? 'Ascending' : 'Descending'}`}
              aria-label={`Sort ${filters.sortDir === 'asc' ? 'Ascending' : 'Descending'}`}
            >
              <span className="material-symbols-outlined text-base">
                {filters.sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Chips Bar (Zeigarnik Effect & Postel's Law) */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap py-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Active:</span>

          {filters.category !== 'All Funds' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container border border-surface-container text-xs font-semibold text-on-surface">
              <span>Category: {filters.category}</span>
              <button
                type="button"
                onClick={() => updateFilter('category', 'All Funds')}
                className="hover:text-error"
                aria-label="Remove category filter"
              >
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
            </span>
          )}

          {filters.preset !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
              <span>Preset: {filters.preset.replace('_', ' ')}</span>
              <button
                type="button"
                onClick={() => updateFilter('preset', 'all')}
                className="hover:text-error"
                aria-label="Remove preset filter"
              >
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
            </span>
          )}

          {filters.searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container border border-surface-container text-xs font-semibold text-on-surface">
              <span>Search: &quot;{filters.searchQuery}&quot;</span>
              <button
                type="button"
                onClick={() => updateFilter('searchQuery', '')}
                className="hover:text-error"
                aria-label="Remove search filter"
              >
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
            </span>
          )}

          {filters.minSmartScore > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container border border-surface-container text-xs font-semibold text-on-surface">
              <span>Score &gt;= {filters.minSmartScore}</span>
              <button
                type="button"
                onClick={() => updateFilter('minSmartScore', 0)}
                className="hover:text-error"
                aria-label="Remove minimum score filter"
              >
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
            </span>
          )}

          {filters.minRollingReturn > -100 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container border border-surface-container text-xs font-semibold text-on-surface">
              <span>Rolling 3Y &gt;= {filters.minRollingReturn}%</span>
              <button
                type="button"
                onClick={() => updateFilter('minRollingReturn', -100)}
                className="hover:text-error"
                aria-label="Remove minimum rolling return filter"
              >
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
            </span>
          )}

          {filters.minSharpe > -10 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container border border-surface-container text-xs font-semibold text-on-surface">
              <span>Sharpe &gt;= {filters.minSharpe}</span>
              <button
                type="button"
                onClick={() => updateFilter('minSharpe', -10)}
                className="hover:text-error"
                aria-label="Remove minimum Sharpe ratio filter"
              >
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
            </span>
          )}

          {filters.maxVolatility < 100 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container border border-surface-container text-xs font-semibold text-on-surface">
              <span>Volatility &lt;= {filters.maxVolatility}%</span>
              <button
                type="button"
                onClick={() => updateFilter('maxVolatility', 100)}
                className="hover:text-error"
                aria-label="Remove maximum volatility filter"
              >
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={resetFilters}
            className="text-xs text-primary font-bold hover:underline ml-1 touch-spring"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Zero-Results Friendly Recovery Card (Postel's Law) */}
      {filteredFunds.length === 0 && (
        <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-container text-center space-y-3 my-6 shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-warning/10 border border-warning/20 flex items-center justify-center text-warning">
            <span className="material-symbols-outlined text-3xl">filter_alt_off</span>
          </div>
          <h3 className="font-headline-md font-bold text-base text-on-surface">
            No Funds Matched Your Current Hurdles
          </h3>
          <p className="text-xs text-on-surface-variant max-w-md mx-auto">
            Your combined filter hurdles (such as minimum rolling returns or Sharpe ratio) eliminated all schemes in this category.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="min-h-[44px] px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-xs hover:bg-primary-container touch-spring inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">restart_alt</span>
            <span>Reset to Sensible Defaults</span>
          </button>
        </div>
      )}
    </div>
  );
};
