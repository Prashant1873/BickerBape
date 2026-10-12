import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FundCard } from '@/components/screener/FundCard';
import { SidebarFilters, CATEGORY_GROUPS } from '@/components/screener/SidebarFilters';
import { FundTable } from '@/components/screener/FundTable';
import { ScreenerContext, ScreenerContextType } from '@/context/ScreenerContext';
import { FundSummary } from '@/types/fund';

const sampleFund: FundSummary = {
  code: '120503',
  name: 'Mirae Asset Large Cap Fund - Direct Plan - Growth',
  category: 'Large Cap',
  fund_house: 'Mirae Asset Mutual Fund',
  manager: 'Neelesh Surana',
  manager_tenure_years: 8.5,
  expense_ratio: 0.54,
  cagr_1y: 18.4,
  cagr_3y: 16.2,
  cagr_5y: 15.8,
  cagr_10y: 16.9,
  ratio_3y: 1.25,
  ratio_5y: 1.15,
  volatility: 13.2,
  sharpe_ratio: 1.12,
  smart_score: {
    overall: 8.2,
    pillars: {
      return_ratios: 8.5,
      track_record: 8.0,
      risk_volatility: 8.2,
      expense_ratio: 8.0
    }
  }
};

const sampleFund2: FundSummary = {
  ...sampleFund,
  code: '120504',
  category: 'Value / Contra'
};

const sampleFund3: FundSummary = {
  ...sampleFund,
  code: '120505',
  category: 'Sectoral / Thematic'
};

const allSampleFunds = [sampleFund, sampleFund2, sampleFund3];

const renderWithContext = (
  component: React.ReactElement,
  contextOverrides: Partial<ScreenerContextType> = {}
) => {
  const defaultContext: ScreenerContextType = {
    appMode: 'screener',
    setAppMode: () => {},
    funds: allSampleFunds,
    filteredFunds: allSampleFunds,
    categories: {
      'Large Cap': { fund_count: 34 },
      'Value / Contra': { fund_count: 23 },
      'Sectoral / Thematic': { fund_count: 246 }
    },
    loading: false,
    isPrimed: true,
    mood: 'growth',
    setMood: () => {},
    filters: {
      searchQuery: '',
      category: 'All Funds',
      preset: 'all',
      minRollingReturn: -100,
      minSharpe: -10,
      maxVolatility: 100,
      minSmartScore: 0,
      sortBy: 'smart_score',
      sortDir: 'desc'
    },
    updateFilter: () => {},
    resetFilters: () => {},
    relaxFilters: () => {},
    activeFilterCount: 0,
    viewMode: 'cards',
    setViewMode: () => {},
    tableColumns: ['smart_score', 'cagr_3y', 'cagr_5y'],
    setTableColumns: () => {},
    comparisonList: [],
    toggleComparison: () => {},
    clearComparison: () => {},
    selectedFundCode: null,
    setSelectedFundCode: () => {},
    sidebarOpen: false,
    setSidebarOpen: () => {},
    sidebarCollapsed: false,
    setSidebarCollapsed: () => {},
    toggleSidebarCollapse: () => {},
    isComparisonMatrixOpen: false,
    setIsComparisonMatrixOpen: () => {},
    isKpiModalOpen: false,
    setIsKpiModalOpen: () => {},
    isBasketModalOpen: false,
    setIsBasketModalOpen: () => {},
    activeBasketPreset: 'titan',
    setActiveBasketPreset: () => {},
    displayLimit: 36,
    loadMoreFunds: () => {},
    simsimBucket: [],
    simsimWeights: {},
    addToBucket: () => {},
    removeFromBucket: () => {},
    isInBucket: () => false,
    clearBucket: () => {},
    setFundWeight: () => {},
    setBatchWeights: () => {},
    equalizeWeights: () => {},
    loadModelPreset: () => {},
    simsimInvestmentMode: 'lumpsum',
    setSimsimInvestmentMode: () => {},
    simsimCapital: 100000,
    setSimsimCapital: () => {},
    simsimHorizon: '3Y',
    setSimsimHorizon: () => {},
    simsimCustomStartDate: '',
    setSimsimCustomStartDate: () => {},
    simsimCustomEndDate: '',
    setSimsimCustomEndDate: () => {},
    applyRegimePreset: () => {},
    ...contextOverrides
  };

  return renderToStaticMarkup(
    React.createElement(
      ScreenerContext.Provider,
      { value: defaultContext },
      component
    )
  );
};

describe('Comprehensive UI/UX Craft Overhaul & Anti-Slop Audit (UX-01, UX-02)', () => {
  it('verifies FundCard metric container has stripped redundant nested borders (UX-02)', () => {
    const html = renderWithContext(React.createElement(FundCard, { fund: sampleFund }));

    expect(html).toContain('data-testid="fund-card-metrics-grid"');
    // Inner metric container should NOT have border-surface-container class
    expect(html).not.toMatch(/class="[^"]*border-surface-container[^"]*"[^>]*data-testid="fund-card-metrics-grid"/);
    expect(html).toMatch(/class="[^"]*bg-surface-container-low[^"]*"[^>]*data-testid="fund-card-metrics-grid"/);
  });

  it('verifies 3Y CAGR is visually elevated as the primary fiduciary anchor in FundCard (UX-01)', () => {
    const html = renderWithContext(React.createElement(FundCard, { fund: sampleFund }));

    expect(html).toContain('3Y CAGR');
    expect(html).toContain('text-primary');
    expect(html).toContain('+16.2%');
  });

  it('verifies SidebarFilters chunks categories into cognitive clusters per Hick\'s Law (UX-01)', () => {
    const html = renderWithContext(React.createElement(SidebarFilters));

    // Verify CATEGORY_GROUPS exported and rendered
    expect(CATEGORY_GROUPS.length).toBeGreaterThan(0);
    expect(html).toContain('Core Market-Cap');
    expect(html).toContain('Strategy &amp; Specialized');
    expect(html).toContain('Thematic &amp; Sectoral');
    expect(html).toContain('data-testid="category-group-core"');
  });

  it('verifies SidebarFilters has consolidated duplicate reset controls into a single header action', () => {
    const html = renderWithContext(React.createElement(SidebarFilters), { activeFilterCount: 0 });

    // Inner filterBody should not have redundant "Reset All" button when filters are 0
    expect(html).not.toContain('>Reset All</button>');
  });

  it('verifies FundTable sticky headers and sorting affordances follow Jakob\'s Law with crisp borders (UX-01, UX-02)', () => {
    const html = renderWithContext(React.createElement(FundTable, { funds: [sampleFund] }));

    // Verify sticky left header has crisp border-r
    expect(html).toContain('sticky left-0 top-0 z-40 bg-surface-container-low py-3 px-4 min-w-[280px] sm:min-w-[360px] border-r border-surface-container');
    // Verify sort headers have group hover class for smooth affordance reveal
    expect(html).toContain('group');
    expect(html).toContain('unfold_more');
  });

  it('verifies tabular numerals and Fitts\'s Law 44px min targets across controls (UX-03)', () => {
    const cardHtml = renderWithContext(React.createElement(FundCard, { fund: sampleFund }));
    // Verify tabular numbers are active on fund metrics
    expect(cardHtml).toContain('tabular-nums');

    // Verify minimum touch targets (44px) exist on interactive buttons
    expect(cardHtml).toContain('min-h-[44px]');
  });
});
