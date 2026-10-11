import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ActiveFiltersBar } from '@/components/screener/ActiveFiltersBar';
import { SimSimSummaryCards } from '@/components/simsim/SimSimSummaryCards';
import { SimSimChart } from '@/components/simsim/SimSimChart';
import { ScreenerContext, ScreenerContextType } from '@/context/ScreenerContext';

// Helper to provide partial ScreenerContext for static markup rendering
const renderWithScreenerContext = (
  component: React.ReactElement,
  contextOverrides: Partial<ScreenerContextType> = {}
) => {
  const defaultContext: ScreenerContextType = {
    appMode: 'screener',
    setAppMode: () => {},
    funds: [],
    filteredFunds: [],
    categories: {},
    loading: false,
    isPrimed: false,
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
    tableColumns: [],
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

describe('Coordinated Atomic Barrier & Flash Elimination (LOAD-02)', () => {
  it('suppresses zero-count flash and displays shimmer sweep placeholder when isPrimed is false', () => {
    const html = renderWithScreenerContext(
      React.createElement(ActiveFiltersBar),
      {
        loading: true,
        isPrimed: false,
        funds: [],
        filteredFunds: []
      }
    );

    // Should NOT show "Showing 0 of 0 Schemes"
    expect(html).not.toContain('Showing <span class="font-mono text-primary text-sm">0</span> of 0 Schemes');
    expect(html).toContain('aria-label="Loading scheme count"');
    expect(html).toContain('shimmer-sweep');

    // Should NOT show zero-results recovery card
    expect(html).not.toContain('No Funds Matched Your Current Hurdles');
  });

  it('reveals audited scheme count and allows empty-state recovery card only once isPrimed is true', () => {
    // Case A: Primed with results
    const primedHtml = renderWithScreenerContext(
      React.createElement(ActiveFiltersBar),
      {
        loading: false,
        isPrimed: true,
        funds: [{ code: '1001' } as any],
        filteredFunds: [{ code: '1001' } as any]
      }
    );

    expect(primedHtml).toContain('Showing');
    expect(primedHtml).toContain('1</span> of 1 Schemes');
    expect(primedHtml).not.toContain('aria-label="Loading scheme count"');

    // Case B: Primed but filtered to 0
    const emptyPrimedHtml = renderWithScreenerContext(
      React.createElement(ActiveFiltersBar),
      {
        loading: false,
        isPrimed: true,
        funds: [{ code: '1001' } as any],
        filteredFunds: []
      }
    );

    expect(emptyPrimedHtml).toContain('No Funds Matched Your Current Hurdles');
  });

  it('renders SimSimSummarySkeleton when report is loading or null without layout shifts', () => {
    const html = renderToStaticMarkup(
      React.createElement(SimSimSummaryCards, {
        report: null,
        loading: true,
        capital: 100000,
        onUpdateCapital: () => {}
      })
    );

    expect(html).toContain('data-testid="simsim-summary-skeleton"');
    expect(html).not.toContain('hourglass_empty');
  });

  it('renders SimSimChartSkeleton when chartData is unavailable preserving 380px container', () => {
    const html = renderToStaticMarkup(
      React.createElement(SimSimChart, {
        report: null,
        simsimInvestmentMode: 'lumpsum',
        simsimCapital: 100000
      })
    );

    expect(html).toContain('data-testid="simsim-chart-skeleton"');
    expect(html).toContain('min-h-[380px]');
  });
});
