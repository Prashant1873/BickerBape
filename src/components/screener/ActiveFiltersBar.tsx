'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useScreener } from '@/context/ScreenerContext';
import { ViewMode } from '@/types/fund';

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
    relaxFilters,
    activeFilterCount,
    viewMode,
    setViewMode,
    setIsKpiModalOpen,
    isPrimed
  } = useScreener();

  // Fluid Segmented Control Pin: Cards vs Table Switcher
  const viewContainerRef = useRef<HTMLDivElement>(null);
  const cardsBtnRef = useRef<HTMLButtonElement>(null);
  const tableBtnRef = useRef<HTMLButtonElement>(null);
  const [viewPinStyle, setViewPinStyle] = useState<{ left: number; width: number; height: number; ready: boolean }>({
    left: 2,
    width: 0,
    height: 44,
    ready: false
  });
  const [isViewStretching, setIsViewStretching] = useState(false);
  const viewAnimationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Measure and align view mode pin
  useEffect(() => {
    const updateViewPin = () => {
      const activeBtn = viewMode === 'cards' ? cardsBtnRef.current : tableBtnRef.current;
      if (!activeBtn || !viewContainerRef.current) return;
      setViewPinStyle({
        left: activeBtn.offsetLeft,
        width: activeBtn.offsetWidth,
        height: activeBtn.offsetHeight,
        ready: true
      });
    };

    updateViewPin();
    window.addEventListener('resize', updateViewPin);
    return () => window.removeEventListener('resize', updateViewPin);
  }, [viewMode]);

  // Fluid Stretch & Squish Transition Handler
  const handleSwitchView = (targetView: ViewMode) => {
    if (targetView === viewMode) return;
    const fromBtn = viewMode === 'cards' ? cardsBtnRef.current : tableBtnRef.current;
    const toBtn = targetView === 'cards' ? cardsBtnRef.current : tableBtnRef.current;

    if (fromBtn && toBtn) {
      if (viewAnimationTimerRef.current) clearTimeout(viewAnimationTimerRef.current);

      const leftA = fromBtn.offsetLeft;
      const rightA = fromBtn.offsetLeft + fromBtn.offsetWidth;
      const leftB = toBtn.offsetLeft;
      const rightB = toBtn.offsetLeft + toBtn.offsetWidth;

      // Phase 1: Stretch to bridge both buttons
      const stretchLeft = Math.min(leftA, leftB);
      const stretchWidth = Math.max(rightA, rightB) - stretchLeft;

      setIsViewStretching(true);
      setViewPinStyle(prev => ({
        ...prev,
        left: stretchLeft,
        width: stretchWidth,
        height: toBtn.offsetHeight
      }));

      setViewMode(targetView);

      // Phase 2: Squish into only the target button
      viewAnimationTimerRef.current = setTimeout(() => {
        setViewPinStyle(prev => ({
          ...prev,
          left: toBtn.offsetLeft,
          width: toBtn.offsetWidth,
          height: toBtn.offsetHeight
        }));
        setIsViewStretching(false);
      }, 120);
    } else {
      setViewMode(targetView);
    }
  };

  return (
    <div className="space-y-3">
      {/* Top Controls Bar: Counter, View Switcher, Sort */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-surface-container">
        {/* Results Counter */}
        <div className="flex items-center gap-2 min-h-[24px]">
          {!isPrimed ? (
            <div className="h-5 w-36 rounded-md bg-surface-container-high/60 shimmer-sweep" aria-label="Loading scheme count" />
          ) : (
            <span className="text-xs font-bold text-on-surface">
              Showing <span className="tabular-nums font-bold text-primary text-sm">{filteredFunds.length}</span> of {funds.length} Schemes
            </span>
          )}
          {isPrimed && activeFilterCount > 0 && (
            <span className="text-[0.75rem] font-bold tracking-[0.04em] uppercase px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
              {activeFilterCount} active filter{activeFilterCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Action Controls: View Switcher, Customize Columns, Sort */}
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-between sm:justify-end">
          {/* View Mode Segmented Switcher (Cards vs Table) */}
          <div
            ref={viewContainerRef}
            className="relative flex items-center p-0.5 bg-surface-container-low border border-surface-container rounded-xl shadow-2xs"
          >
            {/* Fluid Stretching Selection Pin */}
            {viewPinStyle.ready && (
              <div
                className={`absolute top-0.5 rounded-lg segmented-pin bg-surface shadow-xs btn-specular border border-black/5 dark:border-white/10 ${
                  isViewStretching ? 'segmented-pin-stretching' : 'segmented-pin-settling'
                }`}
                style={{
                  left: `${viewPinStyle.left}px`,
                  width: `${viewPinStyle.width}px`,
                  height: `${viewPinStyle.height}px`,
                }}
              />
            )}

            <button
              ref={cardsBtnRef}
              type="button"
              onClick={() => handleSwitchView('cards')}
              className={`relative z-10 min-h-[44px] px-3.5 rounded-lg text-xs font-bold transition-colors duration-150 flex items-center gap-1.5 select-none cursor-pointer ${
                viewMode === 'cards'
                  ? 'text-primary font-extrabold'
                  : 'text-on-surface-variant hover:text-on-surface'
              } ${
                !viewPinStyle.ready && viewMode === 'cards'
                  ? 'bg-surface shadow-xs btn-specular border border-black/5 dark:border-white/10'
                  : ''
              }`}
              aria-label="Cards View"
            >
              <span className="material-symbols-outlined text-base optical-icon">grid_view</span>
              <span className="hidden md:inline">Cards</span>
            </button>
            <button
              ref={tableBtnRef}
              type="button"
              onClick={() => handleSwitchView('table')}
              className={`relative z-10 min-h-[44px] px-3.5 rounded-lg text-xs font-bold transition-colors duration-150 flex items-center gap-1.5 select-none cursor-pointer ${
                viewMode === 'table'
                  ? 'text-primary font-extrabold'
                  : 'text-on-surface-variant hover:text-on-surface'
              } ${
                !viewPinStyle.ready && viewMode === 'table'
                  ? 'bg-surface shadow-xs btn-specular border border-black/5 dark:border-white/10'
                  : ''
              }`}
              aria-label="Table View"
            >
              <span className="material-symbols-outlined text-base optical-icon">table_chart</span>
              <span className="hidden md:inline">Table</span>
            </button>
          </div>

          {/* Customize Columns Button (Only in Table View) */}
          {viewMode === 'table' && (
            <button
              type="button"
              onClick={() => setIsKpiModalOpen(true)}
              className="min-h-[44px] px-3.5 py-2 rounded-xl border border-surface-container bg-surface-container-low text-xs font-bold text-on-surface hover:text-primary hover:border-primary/40 flex items-center gap-1.5 transition-all touch-spring cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">view_column</span>
              <span>Customize KPIs</span>
            </button>
          )}

          {/* Sort Dropdown */}
          <div className="min-h-[44px] flex items-center gap-1.5 bg-surface-container-low border border-surface-container rounded-xl px-2.5 py-1">
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
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface touch-spring cursor-pointer"
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
            <span className="inline-flex items-center gap-1.5 pl-3 pr-1 py-1 rounded-lg bg-surface-container border border-surface-container text-xs font-semibold text-on-surface min-h-[36px]">
              <span>Category: {filters.category}</span>
              <button
                type="button"
                onClick={() => updateFilter('category', 'All Funds')}
                className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-surface-container-high/60 hover:text-error touch-spring cursor-pointer"
                aria-label="Remove category filter"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </span>
          )}

          {filters.preset !== 'all' && (
            <span className="inline-flex items-center gap-1.5 pl-3 pr-1 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs font-semibold text-primary min-h-[36px]">
              <span>Preset: {filters.preset.replace('_', ' ')}</span>
              <button
                type="button"
                onClick={() => updateFilter('preset', 'all')}
                className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-primary/20 hover:text-error touch-spring cursor-pointer"
                aria-label="Remove preset filter"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </span>
          )}

          {filters.searchQuery && (
            <span className="inline-flex items-center gap-1.5 pl-3 pr-1 py-1 rounded-lg bg-surface-container border border-surface-container text-xs font-semibold text-on-surface min-h-[36px]">
              <span>Search: &quot;{filters.searchQuery}&quot;</span>
              <button
                type="button"
                onClick={() => updateFilter('searchQuery', '')}
                className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-surface-container-high/60 hover:text-error touch-spring cursor-pointer"
                aria-label="Remove search filter"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </span>
          )}

          {filters.minSmartScore > 0 && (
            <span className="inline-flex items-center gap-1.5 pl-3 pr-1 py-1 rounded-lg bg-surface-container border border-surface-container text-xs font-semibold text-on-surface min-h-[36px]">
              <span>Score &gt;= {filters.minSmartScore}</span>
              <button
                type="button"
                onClick={() => updateFilter('minSmartScore', 0)}
                className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-surface-container-high/60 hover:text-error touch-spring cursor-pointer"
                aria-label="Remove minimum score filter"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </span>
          )}

          {filters.minRollingReturn > -100 && (
            <span className="inline-flex items-center gap-1.5 pl-3 pr-1 py-1 rounded-lg bg-surface-container border border-surface-container text-xs font-semibold text-on-surface min-h-[36px]">
              <span>Rolling 3Y &gt;= {filters.minRollingReturn}%</span>
              <button
                type="button"
                onClick={() => updateFilter('minRollingReturn', -100)}
                className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-surface-container-high/60 hover:text-error touch-spring cursor-pointer"
                aria-label="Remove minimum rolling return filter"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </span>
          )}

          {filters.minSharpe > -10 && (
            <span className="inline-flex items-center gap-1.5 pl-3 pr-1 py-1 rounded-lg bg-surface-container border border-surface-container text-xs font-semibold text-on-surface min-h-[36px]">
              <span>Sharpe &gt;= {filters.minSharpe}</span>
              <button
                type="button"
                onClick={() => updateFilter('minSharpe', -10)}
                className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-surface-container-high/60 hover:text-error touch-spring cursor-pointer"
                aria-label="Remove minimum Sharpe ratio filter"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </span>
          )}

          {filters.maxVolatility < 100 && (
            <span className="inline-flex items-center gap-1.5 pl-3 pr-1 py-1 rounded-lg bg-surface-container border border-surface-container text-xs font-semibold text-on-surface min-h-[36px]">
              <span>Volatility &lt;= {filters.maxVolatility}%</span>
              <button
                type="button"
                onClick={() => updateFilter('maxVolatility', 100)}
                className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-surface-container-high/60 hover:text-error touch-spring cursor-pointer"
                aria-label="Remove maximum volatility filter"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={resetFilters}
            className="min-h-[44px] px-3 rounded-xl text-xs text-primary font-bold hover:underline hover:bg-primary/10 ml-1 touch-spring flex items-center cursor-pointer"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Zero-Results Friendly Recovery Card (Postel's Law) */}
      {isPrimed && filteredFunds.length === 0 && (
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
          <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={relaxFilters}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-xs hover:bg-primary-container touch-spring inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">tune</span>
              <span>Relax Filter Constraints</span>
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="min-h-[44px] px-5 py-2 rounded-xl border border-surface-container bg-surface-container-low text-xs font-bold text-on-surface hover:text-primary touch-spring inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">restart_alt</span>
              <span>Reset All Filters</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
