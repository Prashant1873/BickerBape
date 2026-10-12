'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useScreener } from '@/context/ScreenerContext';
import { NavPoint } from '@/types/fund';
import { fetchFundNavHistory } from '@/lib/data-loader';
import { getSuperScoreTheme } from '@/lib/smartscore';
import { DrawerHeader } from './DrawerHeader';
import { DrawerScorecardTab } from './tabs/DrawerScorecardTab';
import { DrawerChartsTab } from './tabs/DrawerChartsTab';
import { DrawerRiskTab } from './tabs/DrawerRiskTab';
import { DrawerChecklistTab } from './tabs/DrawerChecklistTab';

type DrawerTab = 'scorecard' | 'charts' | 'risk' | 'checklist';

export const FundDetailDrawer: React.FC = () => {
  const {
    selectedFundCode,
    setSelectedFundCode,
    funds,
    comparisonList,
    toggleComparison,
    isInBucket,
    addToBucket,
    removeFromBucket,
    setIsComparisonMatrixOpen,
    mood
  } = useScreener();

  const [activeTab, setActiveTab] = useState<DrawerTab>('scorecard');
  const [openPillarKey, setOpenPillarKey] = useState<string | null>(null);
  const [navHistory, setNavHistory] = useState<NavPoint[]>([]);
  const [loadingNav, setLoadingNav] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fund = funds.find((f) => f.code === selectedFundCode);

  // Load NAV history on-demand when fund is selected
  useEffect(() => {
    if (!selectedFundCode) {
      setNavHistory([]);
      return;
    }

    let isMounted = true;
    async function loadNav() {
      setLoadingNav(true);
      const hist = await fetchFundNavHistory(selectedFundCode!);
      if (isMounted) {
        setNavHistory(hist);
        setLoadingNav(false);
      }
    }
    loadNav();

    return () => {
      isMounted = false;
    };
  }, [selectedFundCode]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedFundCode) {
        setSelectedFundCode(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFundCode, setSelectedFundCode]);

  // Lock body scrolling of homepage when details drawer is open
  useEffect(() => {
    if (!selectedFundCode) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [selectedFundCode]);

  if (!fund || !mounted || typeof document === 'undefined') return null;

  const score = fund.smart_score?.overall ?? (fund.suggester_score ? fund.suggester_score / 10 : 6.0);
  const theme = getSuperScoreTheme(score);
  const isCompared = comparisonList.includes(fund.code);
  const inBucket = isInBucket(fund.code);
  const smartScoreObj = (fund.smart_score as any) || {};
  const rawPillars = smartScoreObj.pillars || {};

  // Extract holdings array
  let holdingsList: Array<{ company: string; weight_pct: number }> = [];
  if (Array.isArray(fund.top_holdings)) {
    holdingsList = fund.top_holdings;
  } else if (typeof fund.top_holdings === 'string') {
    try {
      holdingsList = JSON.parse(fund.top_holdings);
    } catch (e) {}
  }

  const ringColor = score >= 8.0 ? '#36B37E' : score >= 6.5 ? '#2563EB' : score >= 5.0 ? '#FF9F0A' : '#FF5630';
  const scorePct = Math.min(100, Math.max(0, Math.round(score * 10)));

  const handleQuickCompareCategory = () => {
    if (!isCompared) {
      toggleComparison(fund.code);
    }
    const peer = funds
      .filter((f) => f.category === fund.category && f.code !== fund.code)
      .sort((a, b) => (b.smart_score?.overall || 0) - (a.smart_score?.overall || 0))[0];
    if (peer && !comparisonList.includes(peer.code)) {
      toggleComparison(peer.code);
    }
    setIsComparisonMatrixOpen(true);
  };

  const tabs = [
    { id: 'scorecard' as DrawerTab, label: 'Scorecard & Overview', icon: 'score' },
    { id: 'charts' as DrawerTab, label: 'Returns & Charts', icon: 'show_chart' },
    { id: 'risk' as DrawerTab, label: 'Risk & Portfolio', icon: 'pie_chart' },
    { id: 'checklist' as DrawerTab, label: '10-Step Verdict', icon: 'fact_check' }
  ];

  return createPortal(
    <div className="fixed inset-0 z-[70] flex justify-end">
      {/* Backdrop blur with touch click dismiss */}
      <div
        onClick={() => setSelectedFundCode(null)}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs apple-spring-backdrop cursor-pointer"
        aria-hidden="true"
      />

      {/* Drawer Container (Desktop 620px right sheet, Mobile full-width bottom sheet) */}
      <div className="relative bg-surface w-full max-w-2xl h-full shadow-floating-dock flex flex-col z-10 border-l border-surface-container overflow-hidden apple-spring-drawer">
        {/* Mobile Pull/Drag Handle */}
        <div className="w-12 h-1.5 rounded-full bg-surface-container-highest mx-auto my-2 block sm:hidden flex-shrink-0" />

        <DrawerHeader
          fund={fund}
          score={score}
          theme={theme}
          ringColor={ringColor}
          scorePct={scorePct}
          smartScoreObj={smartScoreObj}
          mood={mood}
          onClose={() => setSelectedFundCode(null)}
        />

        {/* 4-Tab Segmented Header */}
        <div className="flex items-center border-b border-surface-container bg-surface-container-lowest px-4 py-2 gap-2 overflow-x-auto hide-scrollbar flex-shrink-0">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-[44px] px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 touch-spring flex-shrink-0 cursor-pointer ${
                  active
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Drawer Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 hide-scrollbar">
          {activeTab === 'scorecard' && (
            <DrawerScorecardTab
              fund={fund}
              rawPillars={rawPillars}
              openPillarKey={openPillarKey}
              setOpenPillarKey={setOpenPillarKey}
            />
          )}
          {activeTab === 'charts' && (
            <DrawerChartsTab fund={fund} navHistory={navHistory} loadingNav={loadingNav} />
          )}
          {activeTab === 'risk' && <DrawerRiskTab fund={fund} holdingsList={holdingsList} />}
          {activeTab === 'checklist' && <DrawerChecklistTab fund={fund} />}
        </div>

        {/* Sticky Drawer Footer Actions (Fitts's Law 44px touch targets) */}
        <div className="p-4 pb-6 sm:pb-4 border-t border-surface-container bg-surface-container-lowest flex items-center justify-between gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={handleQuickCompareCategory}
            className="min-h-[44px] px-3.5 py-2 rounded-xl border border-surface-container bg-surface-container-low text-xs font-bold text-on-surface hover:text-primary hover:border-primary/40 flex items-center gap-1.5 touch-spring transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base text-primary">compare_arrows</span>
            <span>Quick Compare with Category</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => (inBucket ? removeFromBucket(fund.code) : addToBucket(fund.code))}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 touch-spring border shadow-xs cursor-pointer ${
                inBucket
                  ? 'bg-[#00F090] text-black border-[#00F090] font-extrabold shadow-sm'
                  : 'bg-surface-container-low border-surface-container text-on-surface hover:text-[#00A86B] dark:hover:text-[#00F090] hover:border-[#00F090]/50'
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {inBucket ? 'check' : 'hourglass_top'}
              </span>
              <span>{inBucket ? 'In SimSim' : 'Add to SimSim'}</span>
            </button>

            <button
              type="button"
              onClick={() => toggleComparison(fund.code)}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 touch-spring border shadow-xs cursor-pointer ${
                isCompared
                  ? 'bg-primary text-white border-primary shadow-xs'
                  : 'bg-surface-container-low border-surface-container text-on-surface hover:text-primary hover:border-primary/40'
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {isCompared ? 'check' : 'add'}
              </span>
              <span>{isCompared ? 'Compared' : 'Compare'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
