'use client';

import React, { useState } from 'react';
import { useScreener } from '@/context/ScreenerContext';
import { MARKET_REGIMES } from '@/lib/simsim-models';

export const SimSimSidebar: React.FC = () => {
  const {
    funds,
    setAppMode,
    loadModelPreset,
    setIsBasketModalOpen,
    simsimInvestmentMode,
    setSimsimInvestmentMode,
    simsimCapital,
    setSimsimCapital,
    simsimHorizon,
    setSimsimHorizon,
    simsimCustomStartDate,
    setSimsimCustomStartDate,
    simsimCustomEndDate,
    setSimsimCustomEndDate,
    applyRegimePreset,
    addToBucket,
    isInBucket,
    simsimBucket,
    sidebarCollapsed,
    toggleSidebarCollapse,
    sidebarOpen,
    setSidebarOpen
  } = useScreener();

  const [searchQuery, setSearchQuery] = useState('');

  // Quick fund search results
  const searchResults = searchQuery.trim()
    ? funds.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const lumpsumChips = [25000, 50000, 100000, 250000, 500000];
  const sipChips = [2000, 5000, 10000, 20000, 25000];
  const activeChips = simsimInvestmentMode === 'lumpsum' ? lumpsumChips : sipChips;

  // Reusable Controls Body
  const controlsBody = (
    <div className="space-y-5">
      {/* Curated Model Baskets */}
      <div className="p-3.5 rounded-2xl bg-surface-container-low dark:bg-[#0D1322] border border-surface-container dark:border-white/10 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant dark:text-[#94A3B8]">
            Curated Model Baskets:
          </span>
          <button
            type="button"
            onClick={() => setIsBasketModalOpen(true)}
            className="text-[10px] font-bold text-primary dark:text-[#00F090] hover:underline cursor-pointer"
          >
            Customize
          </button>
        </div>

        <div className="space-y-1.5">
          {/* Titan */}
          <button
            type="button"
            onClick={() => loadModelPreset('titan')}
            className="w-full text-left p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high dark:bg-[#141B2D] dark:hover:bg-[#1A233A] border border-surface-container dark:border-white/5 hover:border-[#00F090]/40 transition-all cursor-pointer touch-spring flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#00F090]/15 text-[#00A86B] dark:text-[#00F090] flex items-center justify-center">
                <span className="material-symbols-outlined text-xs">shield</span>
              </div>
              <div>
                <span className="text-xs font-bold text-on-surface dark:text-white block group-hover:text-primary dark:group-hover:text-[#00F090] transition-colors">The Titan</span>
                <span className="text-[10px] text-on-surface-variant dark:text-[#94A3B8]">Flexi + Mid + Small</span>
              </div>
            </div>
            <span className="text-[10px] font-bold tabular-nums text-[#00A86B] dark:text-[#00F090] px-1.5 py-0.5 rounded bg-[#00F090]/10 border border-[#00F090]/20">
              40/35/25
            </span>
          </button>

          {/* High-Alpha Rocket */}
          <button
            type="button"
            onClick={() => loadModelPreset('aggressive')}
            className="w-full text-left p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high dark:bg-[#141B2D] dark:hover:bg-[#1A233A] border border-surface-container dark:border-white/5 hover:border-[#FF5630]/40 transition-all cursor-pointer touch-spring flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#FF5630]/15 text-[#DE350B] dark:text-[#FF5630] flex items-center justify-center">
                <span className="material-symbols-outlined text-xs">rocket_launch</span>
              </div>
              <div>
                <span className="text-xs font-bold text-on-surface dark:text-white block group-hover:text-[#DE350B] dark:group-hover:text-[#FF5630] transition-colors">High-Alpha Rocket</span>
                <span className="text-[10px] text-on-surface-variant dark:text-[#94A3B8]">Mid & Small Cap Alpha</span>
              </div>
            </div>
            <span className="text-[10px] font-bold tabular-nums text-[#DE350B] dark:text-[#FF5630] px-1.5 py-0.5 rounded bg-[#FF5630]/10 border border-[#FF5630]/20">
              40/30/30
            </span>
          </button>

          {/* Defensive Compounder */}
          <button
            type="button"
            onClick={() => loadModelPreset('defensive')}
            className="w-full text-left p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high dark:bg-[#141B2D] dark:hover:bg-[#1A233A] border border-surface-container dark:border-white/5 hover:border-[#FFB800]/40 transition-all cursor-pointer touch-spring flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#FFB800]/15 text-[#975800] dark:text-[#FFB800] flex items-center justify-center">
                <span className="material-symbols-outlined text-xs">savings</span>
              </div>
              <div>
                <span className="text-xs font-bold text-on-surface dark:text-white block group-hover:text-primary dark:group-hover:text-[#FFB800] transition-colors">Defensive Anchor</span>
                <span className="text-[10px] text-on-surface-variant dark:text-[#94A3B8]">Large-Mid + Large + ELSS</span>
              </div>
            </div>
            <span className="text-[10px] font-bold tabular-nums text-[#975800] dark:text-[#FFB800] px-1.5 py-0.5 rounded bg-[#FFB800]/10 border border-[#FFB800]/20">
              40/30/30
            </span>
          </button>
        </div>
      </div>

      {/* Investment Style Toggle */}
      <div className="p-3.5 rounded-2xl bg-surface-container-low dark:bg-[#0D1322] border border-surface-container dark:border-white/10 space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant dark:text-[#94A3B8] block">
          Investment Style:
        </span>
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-surface-container dark:bg-[#07090E] rounded-full border border-surface-container dark:border-white/10">
          <button
            type="button"
            onClick={() => setSimsimInvestmentMode('lumpsum')}
            className={`py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer text-center touch-spring flex items-center justify-center gap-1 ${
              simsimInvestmentMode === 'lumpsum'
                ? 'bg-primary text-white dark:bg-[#00F090] dark:text-black shadow-md font-extrabold'
                : 'text-on-surface-variant dark:text-[#94A3B8] hover:text-on-surface dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm">diamond</span>
            <span>Lumpsum</span>
          </button>

          <button
            type="button"
            onClick={() => setSimsimInvestmentMode('sip')}
            className={`py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer text-center touch-spring flex items-center justify-center gap-1 ${
              simsimInvestmentMode === 'sip'
                ? 'bg-primary text-white dark:bg-[#00F090] dark:text-black shadow-md font-extrabold'
                : 'text-on-surface-variant dark:text-[#94A3B8] hover:text-on-surface dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm">calendar_month</span>
            <span>Monthly SIP</span>
          </button>
        </div>
      </div>

      {/* Capital & Horizon Setup */}
      <div className="p-3.5 rounded-2xl bg-surface-container-low dark:bg-[#0D1322] border border-surface-container dark:border-white/10 space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="simsim-capital-field" className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant dark:text-[#94A3B8]">
              {simsimInvestmentMode === 'lumpsum' ? 'Lumpsum Principal:' : 'Monthly Installment:'}
            </label>
            <span className="text-xs font-bold tabular-nums text-[#00A86B] dark:text-[#00F090]">
              ₹{simsimCapital.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface dark:text-white font-bold text-sm">₹</span>
            <input
              id="simsim-capital-field"
              type="number"
              min="1000"
              step="5000"
              value={simsimCapital}
              onChange={(e) => setSimsimCapital(Math.max(1000, Number(e.target.value) || 0))}
              className="w-full bg-surface-container dark:bg-[#07090E] border border-surface-container-high dark:border-white/15 rounded-xl py-2 pl-7 pr-3 text-xs text-on-surface dark:text-white font-bold tabular-nums outline-none focus:border-[#00F090] transition-colors"
            />
          </div>

          {/* Quick Preset Chips */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {activeChips.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setSimsimCapital(c)}
                className={`px-2 py-1 rounded-full text-[10px] font-bold tabular-nums border transition-colors touch-spring cursor-pointer ${
                  simsimCapital === c
                    ? 'bg-[#00F090] text-black border-[#00F090] font-extrabold shadow-xs'
                    : 'bg-surface-container dark:bg-white/5 border-surface-container-high dark:border-white/10 text-on-surface-variant dark:text-[#94A3B8] hover:text-on-surface dark:hover:text-white'
                }`}
              >
                ₹{(c / 1000).toFixed(0)}k
              </button>
            ))}
          </div>
        </div>

        {/* Backtest Horizon */}
        <div className="pt-2 border-t border-surface-container dark:border-white/10">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant dark:text-[#94A3B8]">
              Simulation Horizon:
            </span>
            <span className="text-[10px] font-bold tabular-nums text-[#00A86B] dark:text-[#00F090]">
              {simsimHorizon === 'ALL' ? 'Full Track Record' : simsimHorizon === 'CUSTOM' ? 'Custom Window' : `${simsimHorizon} Compound`}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1 p-1 bg-surface-container dark:bg-[#07090E] rounded-xl border border-surface-container dark:border-white/10">
            {(['1Y', '3Y', '5Y', 'ALL', 'CUSTOM'] as const).map(h => (
              <button
                key={h}
                type="button"
                onClick={() => setSimsimHorizon(h)}
                className={`py-1 rounded-lg text-xs font-bold transition-all cursor-pointer text-center touch-spring ${
                  simsimHorizon === h
                    ? 'bg-primary text-white dark:bg-[#00F090] dark:text-black shadow-xs font-black'
                    : 'text-on-surface-variant dark:text-[#94A3B8] hover:text-on-surface dark:hover:text-white'
                }`}
              >
                {h === 'ALL' ? 'Max' : h === 'CUSTOM' ? 'Custom' : h}
              </button>
            ))}
          </div>

          {/* Custom Date Range Picker when CUSTOM is selected */}
          {simsimHorizon === 'CUSTOM' && (
            <div className="mt-2.5 p-2.5 rounded-xl bg-surface-container dark:bg-[#07090E] border border-primary/30 dark:border-[#00F090]/30 space-y-2 animate-in fade-in duration-150">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant dark:text-[#94A3B8] uppercase block mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={simsimCustomStartDate}
                    max={simsimCustomEndDate}
                    onChange={(e) => setSimsimCustomStartDate(e.target.value)}
                    className="w-full bg-surface-container-lowest dark:bg-[#0D1322] border border-surface-container-high dark:border-white/15 rounded-lg py-1 px-1.5 text-[11px] tabular-nums text-on-surface dark:text-white outline-none focus:border-primary dark:focus:border-[#00F090]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant dark:text-[#94A3B8] uppercase block mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={simsimCustomEndDate}
                    min={simsimCustomStartDate}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setSimsimCustomEndDate(e.target.value)}
                    className="w-full bg-surface-container-lowest dark:bg-[#0D1322] border border-surface-container-high dark:border-white/15 rounded-lg py-1 px-1.5 text-[11px] tabular-nums text-on-surface dark:text-white outline-none focus:border-primary dark:focus:border-[#00F090]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Historical Market Regimes */}
          <div className="mt-3 pt-3 border-t border-surface-container dark:border-white/10 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant dark:text-[#94A3B8] block">
              Stress-Test Market Regimes:
            </span>
            <div className="space-y-1">
              {MARKET_REGIMES.map(regime => (
                <button
                  key={regime.id}
                  type="button"
                  onClick={() => applyRegimePreset(regime.id)}
                  className="w-full text-left p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high dark:bg-[#07090E] dark:hover:bg-[#141B2D] border border-surface-container dark:border-white/5 hover:border-primary/40 dark:hover:border-[#00D2FF]/40 text-xs text-on-surface dark:text-white transition-all flex items-center justify-between group touch-spring cursor-pointer"
                >
                  <span className="text-[11px] font-medium group-hover:text-primary dark:group-hover:text-[#00D2FF] truncate">
                    {regime.name}
                  </span>
                  <span className="text-[9px] font-semibold tabular-nums px-1.5 py-0.5 rounded bg-surface-container-high dark:bg-white/5 text-on-surface-variant dark:text-[#94A3B8] flex-shrink-0">
                    {regime.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Fund Search in Sidebar */}
      <div className="p-3.5 rounded-2xl bg-surface-container-low dark:bg-[#0D1322] border border-surface-container dark:border-white/10 space-y-2 relative">
        <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant dark:text-[#94A3B8] block">
          Add Funds to Basket:
        </span>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant dark:text-[#94A3B8] text-sm pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scheme, AMC..."
            className="w-full bg-surface-container dark:bg-[#07090E] border border-surface-container-high dark:border-white/15 rounded-xl py-1.5 pl-8 pr-3 text-xs text-on-surface dark:text-white placeholder:text-on-surface-variant/60 dark:placeholder:text-[#64748B] outline-none focus:border-primary dark:focus:border-[#00F090] transition-colors"
          />
        </div>

        {/* Search Dropdown Results */}
        {searchResults.length > 0 && (
          <div className="space-y-1 pt-1">
            {searchResults.map(f => {
              const inB = isInBucket(f.code);
              return (
                <div
                  key={String(f.code)}
                  className="p-2 rounded-lg bg-surface-container dark:bg-[#141B2D] border border-surface-container-high dark:border-white/5 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-on-surface dark:text-white truncate">{f.name.split(' - Direct')[0]}</p>
                    <p className="text-[9px] text-on-surface-variant dark:text-[#94A3B8]">{f.category}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addToBucket(f.code)}
                    disabled={inB}
                    className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-0.5 flex-shrink-0 cursor-pointer touch-spring ${
                      inB
                        ? 'bg-[#00F090]/20 text-[#00A86B] dark:text-[#00F090]'
                        : 'bg-[#00F090] text-black hover:bg-[#00d880]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[10px]">{inB ? 'check' : 'add'}</span>
                    <span>{inB ? 'Added' : 'Add'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop View: Expanded Sidebar OR Collapsed Mini-Rail */}
      {!sidebarCollapsed ? (
        <aside className="hidden md:flex flex-col w-80 flex-shrink-0 border-r border-surface-container bg-surface text-on-surface dark:bg-[#0A0E18] dark:text-white max-h-[calc(100vh-4rem)] transition-all">
          {/* 1. Portal Context Header with Collapse Button */}
          <div className="p-3.5 border-b border-surface-container dark:border-white/10 bg-surface-container-low dark:bg-[#0D1322] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#00F090]/20 border border-[#00F090]/40 flex items-center justify-center text-[#00F090]">
                <span className="material-symbols-outlined text-base simsim-pulse-icon">hourglass_top</span>
              </div>
              <div>
                <span className="text-xs font-bold text-[#00A86B] dark:text-[#00F090] uppercase tracking-wider block">SimSim™ Portal</span>
                <span className="text-[10px] text-on-surface-variant dark:text-[#94A3B8]">Historical Backtester</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleSidebarCollapse}
                className="w-7 h-7 rounded-lg hover:bg-surface-container dark:hover:bg-white/10 text-on-surface-variant dark:text-[#94A3B8] hover:text-on-surface dark:hover:text-white flex items-center justify-center touch-spring cursor-pointer"
                title="Collapse controls sidebar (\)"
                aria-label="Collapse controls sidebar"
              >
                <span className="material-symbols-outlined text-base">dock_to_left</span>
              </button>
              <button
                type="button"
                onClick={() => setAppMode('screener')}
                className="text-[11px] font-bold text-on-surface-variant dark:text-[#94A3B8] hover:text-primary dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-surface-container dark:hover:bg-white/5"
                title="Return to Mutual Fund Screener"
              >
                <span className="material-symbols-outlined text-xs">arrow_back</span>
                <span>Exit</span>
              </button>
            </div>
          </div>

          {/* Scrollable Controls Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 hide-scrollbar">
            {controlsBody}
          </div>

          {/* Sidebar Footer Status */}
          <div className="p-3 border-t border-surface-container dark:border-white/10 bg-surface dark:bg-[#07090E] flex items-center justify-between text-xs text-on-surface-variant dark:text-[#94A3B8] flex-shrink-0">
            <span className="flex items-center gap-1.5 font-medium text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[#00F090] animate-pulse" />
              <span>SimSim Engine</span>
            </span>
            <span className="font-bold text-[#00A86B] dark:text-[#00F090] text-[11px] tabular-nums">
              {simsimBucket.length} Schemes in Bucket
            </span>
          </div>
        </aside>
      ) : (
        /* Collapsed Desktop Mini-Rail (1-click expand from workspace edge) */
        <aside
          onClick={toggleSidebarCollapse}
          className="hidden md:flex flex-col w-12 flex-shrink-0 border-r border-surface-container dark:border-white/10 bg-surface-container-lowest/50 dark:bg-[#07090E]/90 max-h-[calc(100vh-4rem)] items-center py-4 justify-between cursor-pointer transition-colors group select-none hover:bg-surface-container-low/60 dark:hover:bg-[#0D1322]/80"
          title="Expand SimSim controls (\)"
          aria-label="Expand SimSim controls"
        >
          <div className="w-8 h-8 rounded-xl bg-[#00F090]/15 group-hover:bg-[#00F090] text-[#00A86B] dark:text-[#00F090] group-hover:text-black border border-[#00F090]/30 flex items-center justify-center transition-all shadow-2xs">
            <span className="material-symbols-outlined text-base">dock_to_right</span>
          </div>

          <div className="text-[10px] font-bold text-on-surface-variant dark:text-[#94A3B8] group-hover:text-[#00A86B] dark:group-hover:text-[#00F090] tracking-widest uppercase transition-colors flex flex-col items-center gap-1.5">
            <span className="material-symbols-outlined text-xs group-hover:translate-x-0.5 transition-transform">chevron_right</span>
            <span className="[writing-mode:vertical-rl] rotate-180">CONTROLS</span>
          </div>

          <div className="w-6 h-6 rounded-full bg-[#00F090]/20 text-[#00A86B] dark:text-[#00F090] text-[10px] font-bold flex items-center justify-center tabular-nums">
            {simsimBucket.length}
          </div>
        </aside>
      )}

      {/* Mobile Slide-Over Bottom Sheet / Drawer for SimSim */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          <div className="relative bg-surface dark:bg-[#0A0E18] text-on-surface dark:text-white rounded-t-3xl border-t border-surface-container dark:border-white/15 shadow-2xl max-h-[85vh] flex flex-col overflow-hidden z-10 animate-in slide-in-from-bottom duration-200">
            <div className="p-4 border-b border-surface-container dark:border-white/10 bg-surface-container-low dark:bg-[#0D1322] flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00A86B] dark:text-[#00F090] text-xl">tune</span>
                <h3 className="font-headline-md font-bold text-base text-on-surface dark:text-white">SimSim™ Controls</h3>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-surface-container dark:bg-white/5 text-on-surface-variant dark:text-[#94A3B8] hover:text-on-surface dark:hover:text-white flex items-center justify-center touch-spring cursor-pointer"
                aria-label="Close controls"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-4 overflow-y-auto hide-scrollbar flex-1">
              {controlsBody}
            </div>

            <div className="p-4 border-t border-surface-container dark:border-white/10 bg-surface-container-low dark:bg-[#0D1322] flex items-center gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-[#00F090] text-black text-xs font-black shadow-xs hover:bg-[#00d880] touch-spring flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">rocket_launch</span>
                <span>View Backtest Results ({simsimBucket.length} Schemes)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
