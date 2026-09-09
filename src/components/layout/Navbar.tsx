'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useScreener } from '@/context/ScreenerContext';
import { InvestorMood } from '@/types/fund';
import { MOOD_CONFIG } from '@/lib/smartscore';

export const Navbar: React.FC = () => {
  const {
    appMode,
    setAppMode,
    mood,
    setMood,
    filters,
    updateFilter,
    activeFilterCount,
    setSidebarOpen,
    sidebarCollapsed,
    toggleSidebarCollapse,
    simsimBucket
  } = useScreener();

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut '/' to focus search, '\' or Ctrl+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName);
      if (isInput) return;

      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      } else if (e.key === '\\' || (e.key.toLowerCase() === 'b' && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        toggleSidebarCollapse();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebarCollapse]);

  return (
    <header className="sticky top-0 z-30 glass-chrome transition-colors border-b border-surface-container/80">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand & Sidebar Toggles */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Mobile Sidebar Sheet Trigger (Screener Filters OR SimSim Controls) */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="md:hidden w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-surface-container-low border border-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center relative touch-spring shadow-2xs cursor-pointer"
            aria-label={appMode === 'simsim' ? 'Open SimSim controls' : 'Open filter sidebar'}
            title={appMode === 'simsim' ? 'SimSim Controls' : 'Filters'}
          >
            <span className={`material-symbols-outlined text-xl ${appMode === 'simsim' ? 'text-[#00A86B] dark:text-[#00F090]' : ''}`}>
              tune
            </span>
            {appMode === 'screener' && activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                {activeFilterCount}
              </span>
            )}
            {appMode === 'simsim' && simsimBucket.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#00F090] text-black text-[10px] font-black rounded-full flex items-center justify-center shadow-xs">
                {simsimBucket.length}
              </span>
            )}
          </button>

          {/* Unified Desktop Sidebar Toggle (Works for Screener & SimSim) */}
          <button
            type="button"
            onClick={toggleSidebarCollapse}
            className="hidden md:flex w-9 h-9 min-w-[36px] min-h-[36px] rounded-xl bg-surface-container-low border border-surface-container text-on-surface-variant hover:text-on-surface items-center justify-center touch-spring shadow-2xs cursor-pointer"
            title={sidebarCollapsed ? (appMode === 'simsim' ? 'Expand SimSim Sidebar (\\)' : 'Expand Filters Sidebar (\\)') : (appMode === 'simsim' ? 'Collapse SimSim Sidebar (\\)' : 'Collapse Filters Sidebar (\\)')}
            aria-label={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <span className="material-symbols-outlined text-lg">
              {sidebarCollapsed ? 'view_sidebar' : 'dock_to_left'}
            </span>
          </button>

          <div
            onClick={() => setAppMode('screener')}
            className="flex items-center gap-2.5 group select-none cursor-pointer"
            title="BickerBape Mutual Fund Platform"
          >
            <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-md border border-white/20 group-hover:scale-105 transition-transform flex items-center justify-center bg-[#07090E]">
              <img
                src="/assets/logo.png"
                alt="BickerBape Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Graceful fallback if image path ever differs
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="font-mono font-black text-sm text-primary hidden">BB</span>
            </div>
            <div className="hidden sm:flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-headline-md font-bold text-base tracking-tight text-on-surface leading-none">
                  BickerBape
                </span>
              </div>
              <span className="text-[10px] font-medium text-on-surface-variant tracking-wider uppercase mt-0.5">
                Fiscal Clarity Platform
              </span>
            </div>
          </div>
        </div>

        {/* Center: The Single Canonical Mode Switcher (Screener <-> SimSim™) */}
        <div className="flex items-center p-1 bg-surface-container/70 dark:bg-[#0c1322] border border-surface-container-high dark:border-white/10 rounded-2xl shadow-sm backdrop-blur-md">
          <button
            type="button"
            onClick={() => setAppMode('screener')}
            className={`min-h-[40px] px-3.5 sm:px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 touch-spring select-none cursor-pointer ${
              appMode === 'screener'
                ? 'bg-surface-container-lowest dark:bg-white/10 text-primary dark:text-white shadow-xs font-extrabold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50'
            }`}
            aria-label="Switch to Screener Mode"
            title="Mutual Fund Screener"
          >
            <span className="material-symbols-outlined text-base">analytics</span>
            <span className="font-semibold">Screener</span>
          </button>

          <button
            type="button"
            onClick={() => setAppMode('simsim')}
            className={`min-h-[40px] px-3.5 sm:px-5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 touch-spring select-none cursor-pointer relative ${
              appMode === 'simsim'
                ? 'bg-[#00F090] text-[#0A0E18] font-black shadow-[0_0_16px_rgba(0,240,144,0.35)] border border-[#00F090]'
                : 'text-on-surface-variant hover:text-[#00A86B] dark:hover:text-[#00F090] hover:bg-[#00F090]/10'
            }`}
            aria-label="Switch to SimSim Backtest Engine"
            title="Launch SimSim™ Backtester"
          >
            <span className={`material-symbols-outlined text-base leading-none ${appMode === 'simsim' ? 'text-[#0A0E18]' : 'text-[#00A86B] dark:text-[#00F090] simsim-pulse-icon'}`}>
              hourglass_top
            </span>
            <span className="tracking-tight font-extrabold">SimSim™ Time Machine</span>
            {simsimBucket.length > 0 && (
              <span className={`min-w-[20px] h-[20px] px-1.5 rounded-full font-black text-[11px] flex items-center justify-center transition-transform ${
                appMode === 'simsim'
                  ? 'bg-black text-[#00F090]'
                  : 'bg-[#00F090] text-black shadow-xs'
              }`}>
                {simsimBucket.length}
              </span>
            )}
          </button>
        </div>

        {/* Right: Search + 3-Way Mood Controller */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Desktop Search */}
          <div className="relative hidden xl:block w-48">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-base pointer-events-none">
              search
            </span>
            <input
              ref={searchInputRef}
              type="text"
              value={filters.searchQuery}
              onChange={(e) => updateFilter('searchQuery', e.target.value)}
              placeholder="Search /"
              className="w-full bg-surface-container-low border border-surface-container rounded-xl py-1.5 pl-8 pr-3 text-xs text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-1 focus:ring-primary min-h-[36px]"
            />
          </div>

          {/* Mood 3-Way Switcher */}
          <div
            className="flex items-center p-1 bg-surface-container-low/80 dark:bg-surface-container-low border border-surface-container rounded-xl shadow-2xs"
            role="radiogroup"
            aria-label="Investor Mood Scoring Weight"
          >
            {(['growth', 'safety', 'income'] as InvestorMood[]).map((m) => {
              const cfg = MOOD_CONFIG[m];
              const active = mood === m;
              let activeClass = '';
              if (active) {
                if (m === 'growth') activeClass = 'mood-btn-growth-active';
                else if (m === 'safety') activeClass = 'mood-btn-safety-active';
                else if (m === 'income') activeClass = 'mood-btn-income-active';
              } else {
                activeClass = 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50';
              }

              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(m)}
                  className={`min-h-[34px] px-2 sm:px-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 touch-spring select-none ${activeClass}`}
                  title={`${cfg.label} Mood: ${cfg.focus}`}
                  aria-checked={active}
                  role="radio"
                >
                  <span className="material-symbols-outlined text-sm leading-none">{cfg.icon}</span>
                  <span className="hidden md:inline text-[11px]">{cfg.label}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Mobile-only Search Bar row */}
      <div className="md:hidden px-3 pb-3">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => updateFilter('searchQuery', e.target.value)}
            placeholder="Search funds, AMC, manager..."
            className="w-full bg-surface-container-low border border-surface-container rounded-xl py-2 pl-9 pr-9 text-xs text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[44px]"
            aria-label="Search mutual funds"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => updateFilter('searchQuery', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-on-surface-variant hover:text-on-surface flex items-center justify-center rounded-full"
              aria-label="Clear search"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
