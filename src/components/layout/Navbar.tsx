'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useScreener } from '@/context/ScreenerContext';
import { InvestorMood } from '@/types/fund';
import { MOOD_CONFIG } from '@/lib/smartscore';

export const Navbar: React.FC = () => {
  const {
    mood,
    setMood,
    filters,
    updateFilter,
    activeFilterCount,
    setSidebarOpen,
    setIsSimSimModalOpen
  } = useScreener();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isDark, setIsDark] = useState<boolean>(false);

  // Initialize theme from HTML class
  useEffect(() => {
    if (typeof document !== 'undefined') {
      setIsDark(document.documentElement.classList.contains('dark'));
    }
  }, []);

  // Keyboard shortcut '/' to focus search input (Jakob's Law)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (typeof document !== 'undefined') {
      if (next) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        localStorage.setItem('theme', 'light');
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-surface/90 dark:bg-surface/95 backdrop-blur-md border-b border-surface-container transition-colors">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand & Mobile Drawer Button */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Mobile Filter Sheet Trigger Button (Fitts's Law: 44x44px min touch target) */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-surface-container-low border border-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center relative touch-spring"
            aria-label="Open filter sidebar"
          >
            <span className="material-symbols-outlined text-xl">tune</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                {activeFilterCount}
              </span>
            )}
          </button>

          <a href="#" className="flex items-center gap-2.5 group select-none">
            <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-black shadow-xs font-mono text-base tracking-tighter group-hover:scale-105 transition-transform">
              BB
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-headline-md font-bold text-base tracking-tight text-on-surface leading-none">
                BickerBape
              </span>
              <span className="text-[10px] font-medium text-on-surface-variant tracking-wider uppercase mt-0.5">
                Fiscal Clarity Screener
              </span>
            </div>
          </a>
        </div>

        {/* Center: Search Bar with '/' Shortcut */}
        <div className="flex-1 max-w-md relative hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg pointer-events-none">
            search
          </span>
          <input
            ref={searchInputRef}
            type="text"
            value={filters.searchQuery}
            onChange={(e) => updateFilter('searchQuery', e.target.value)}
            placeholder="Search 620 funds by scheme, AMC, or fund manager..."
            className="w-full bg-surface-container-low border border-surface-container rounded-xl py-2 pl-9 pr-14 text-xs text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all min-h-[40px]"
            aria-label="Search mutual funds"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {filters.searchQuery ? (
              <button
                type="button"
                onClick={() => updateFilter('searchQuery', '')}
                className="w-5 h-5 text-on-surface-variant hover:text-on-surface flex items-center justify-center rounded-full"
                aria-label="Clear search"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            ) : (
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono text-on-surface-variant bg-surface-container border border-surface-container rounded shadow-2xs">
                /
              </kbd>
            )}
          </div>
        </div>

        {/* Right: 3-Way Mood Controller & Theme Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mood 3-Way Switcher */}
          <div
            className="flex items-center p-1 bg-surface-container-low border border-surface-container rounded-xl shadow-2xs"
            role="radiogroup"
            aria-label="Investor Mood Scoring Weight"
          >
            {(['growth', 'safety', 'income'] as InvestorMood[]).map((m) => {
              const cfg = MOOD_CONFIG[m];
              const active = mood === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(m)}
                  className={`min-h-[38px] px-2.5 sm:px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 touch-spring select-none ${
                    active
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50'
                  }`}
                  title={`${cfg.label} Mood: ${cfg.focus}`}
                  aria-checked={active}
                  role="radio"
                >
                  <span className="material-symbols-outlined text-sm leading-none">{cfg.icon}</span>
                  <span className="hidden sm:inline text-[11px]">{cfg.label}</span>
                </button>
              );
            })}
          </div>

          {/* SimSim™ AI Wizard Trigger */}
          <button
            type="button"
            onClick={() => setIsSimSimModalOpen(true)}
            className="min-h-[40px] px-3 rounded-xl bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 hover:from-primary/25 hover:to-primary/15 text-primary border border-primary/25 text-xs font-bold transition-all flex items-center gap-1.5 touch-spring shadow-2xs"
            title="Open SimSim™ Portfolio Backtester"
            aria-label="Open SimSim Portfolio Backtester"
          >
            <span className="material-symbols-outlined text-base leading-none text-primary">auto_awesome</span>
            <span className="hidden sm:inline font-mono">SimSim™</span>
          </button>

          {/* Theme Mode Toggle (Min 44x44px Touch Target) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-surface-container-low border border-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center touch-spring"
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <span className="material-symbols-outlined text-lg">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
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
