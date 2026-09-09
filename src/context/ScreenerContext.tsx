'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { FundSummary, CategoriesSummary, InvestorMood, ViewMode } from '@/types/fund';
import { fetchFundsSummary, fetchCategoriesSummary } from '@/lib/data-loader';
import { recalculateSmartScoresForMood } from '@/lib/smartscore';
import { AnalyticsEngine } from '@/lib/analytics';
import { DEFAULT_TABLE_COLUMNS } from '@/lib/kpi-catalog';
import { useToast } from '@/context/ToastContext';
import { MARKET_REGIMES } from '@/lib/simsim-models';

export type AppPlatformMode = 'screener' | 'simsim';
export type SimSimHorizon = '6M' | '1Y' | '2Y' | '3Y' | '5Y' | '7Y' | '10Y' | 'ALL' | 'CUSTOM';

interface FilterValues {
  category: string;
  preset: string;
  searchQuery: string;
  minSmartScore: number;
  minRollingReturn: number;
  minSharpe: number;
  maxVolatility: number;
  sortBy: string;
  sortDir: 'asc' | 'desc';
}

const DEFAULT_FILTERS: FilterValues = {
  category: 'All Funds',
  preset: 'all',
  searchQuery: '',
  minSmartScore: 0,
  minRollingReturn: -100,
  minSharpe: -10,
  maxVolatility: 100,
  sortBy: 'smart_score',
  sortDir: 'desc'
};

interface ScreenerContextType {
  // Mode
  appMode: AppPlatformMode;
  setAppMode: (mode: AppPlatformMode) => void;

  // Data
  funds: FundSummary[];
  filteredFunds: FundSummary[];
  categories: CategoriesSummary;
  loading: boolean;
  mood: InvestorMood;
  setMood: (mood: InvestorMood) => void;

  // Filters
  filters: FilterValues;
  updateFilter: <K extends keyof FilterValues>(key: K, value: FilterValues[K]) => void;
  resetFilters: () => void;
  relaxFilters: () => void;
  activeFilterCount: number;

  // Screener Views
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  tableColumns: string[];
  setTableColumns: (cols: string[]) => void;

  // Comparison
  comparisonList: (string | number)[];
  toggleComparison: (code: string | number) => void;
  clearComparison: () => void;

  // Selected Fund Drawer
  selectedFundCode: string | number | null;
  setSelectedFundCode: (code: string | number | null) => void;

  // Sidebar controls
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapse: () => void;

  // Modals
  isComparisonMatrixOpen: boolean;
  setIsComparisonMatrixOpen: (open: boolean) => void;
  isKpiModalOpen: boolean;
  setIsKpiModalOpen: (open: boolean) => void;
  isBasketModalOpen: boolean;
  setIsBasketModalOpen: (open: boolean) => void;
  activeBasketPreset: 'titan' | 'aggressive' | 'defensive';
  setActiveBasketPreset: (preset: 'titan' | 'aggressive' | 'defensive') => void;

  // Pagination
  displayLimit: number;
  loadMoreFunds: () => void;

  // SimSim Bucket & Parameters
  simsimBucket: (string | number)[];
  simsimWeights: Record<string | number, number>;
  addToBucket: (code: string | number) => void;
  removeFromBucket: (code: string | number) => void;
  isInBucket: (code: string | number) => boolean;
  clearBucket: () => void;
  setFundWeight: (code: string | number, weightPct: number) => void;
  setBatchWeights: (weights: Record<string | number, number>) => void;
  equalizeWeights: () => void;
  loadModelPreset: (presetKey: 'titan' | 'aggressive' | 'defensive') => void;
  simsimInvestmentMode: 'lumpsum' | 'sip';
  setSimsimInvestmentMode: (mode: 'lumpsum' | 'sip') => void;
  simsimCapital: number;
  setSimsimCapital: (capital: number) => void;
  simsimHorizon: SimSimHorizon;
  setSimsimHorizon: (horizon: SimSimHorizon) => void;
  simsimCustomStartDate: string;
  setSimsimCustomStartDate: (date: string) => void;
  simsimCustomEndDate: string;
  setSimsimCustomEndDate: (date: string) => void;
  applyRegimePreset: (regimeId: string) => void;
}

const ScreenerContext = createContext<ScreenerContextType | undefined>(undefined);

export const ScreenerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();

  const [appMode, setAppMode] = useState<AppPlatformMode>('screener');

  // Automatic Theme Synchronization: Screener is strictly LIGHT mode, SimSim is strictly DARK mode
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (appMode === 'simsim') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [appMode]);

  const [rawFunds, setRawFunds] = useState<FundSummary[]>([]);
  const [categories, setCategories] = useState<CategoriesSummary>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [mood, setMoodState] = useState<InvestorMood>('growth');
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [tableColumns, setTableColumnsState] = useState<string[]>(DEFAULT_TABLE_COLUMNS);
  const [comparisonList, setComparisonList] = useState<(string | number)[]>([]);
  const [selectedFundCode, setSelectedFundCode] = useState<string | number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isComparisonMatrixOpen, setIsComparisonMatrixOpen] = useState<boolean>(false);
  const [isKpiModalOpen, setIsKpiModalOpen] = useState<boolean>(false);
  const [isSimSimModalOpen, setIsSimSimModalOpen] = useState<boolean>(false);
  const [isBasketModalOpen, setIsBasketModalOpen] = useState<boolean>(false);
  const [activeBasketPreset, setActiveBasketPreset] = useState<'titan' | 'aggressive' | 'defensive'>('titan');
  const [displayLimit, setDisplayLimit] = useState<number>(36);

  // SimSim Portfolio State
  const [simsimBucket, setSimsimBucket] = useState<(string | number)[]>([]);
  const [simsimWeights, setSimsimWeights] = useState<Record<string | number, number>>({});
  const [simsimInvestmentMode, setSimsimInvestmentMode] = useState<'lumpsum' | 'sip'>('lumpsum');
  const [simsimCapital, setSimsimCapital] = useState<number>(100000);
  const [simsimHorizon, setSimsimHorizon] = useState<SimSimHorizon>('3Y');
  const [simsimCustomStartDate, setSimsimCustomStartDate] = useState<string>('2021-01-01');
  const [simsimCustomEndDate, setSimsimCustomEndDate] = useState<string>('2024-03-31');

  // Initialize from storage
  useEffect(() => {
    try {
      const savedCols = localStorage.getItem('bickerbape_table_cols');
      if (savedCols) {
        const parsed = JSON.parse(savedCols);
        if (Array.isArray(parsed) && parsed.length > 0) setTableColumnsState(parsed);
      }
      const savedCompare = localStorage.getItem('bickerbape_compare_list');
      if (savedCompare) {
        const parsed = JSON.parse(savedCompare);
        if (Array.isArray(parsed)) setComparisonList(parsed);
      }
      const savedBucket = localStorage.getItem('bickerbape_simsim_bucket');
      if (savedBucket) {
        const parsed = JSON.parse(savedBucket);
        if (Array.isArray(parsed)) setSimsimBucket(parsed);
      }
      const savedWeights = localStorage.getItem('bickerbape_simsim_weights');
      if (savedWeights) {
        const parsed = JSON.parse(savedWeights);
        if (typeof parsed === 'object' && parsed !== null) setSimsimWeights(parsed);
      }
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }
  }, []);

  // Fetch initial data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [fundsData, catData] = await Promise.all([
        fetchFundsSummary(),
        fetchCategoriesSummary()
      ]);
      setRawFunds(fundsData);
      setCategories(catData);
      setLoading(false);
    }
    loadData();
  }, []);

  // Recalculate funds dynamically on mood change
  const funds = useMemo(() => {
    if (rawFunds.length === 0) return [];
    return recalculateSmartScoresForMood(rawFunds, mood);
  }, [rawFunds, mood]);

  const setMood = (newMood: InvestorMood) => {
    setMoodState(newMood);
    showToast(`Investor Mood switched to ${newMood.toUpperCase()}`, 'info');
  };

  const updateFilter = useCallback(<K extends keyof FilterValues>(key: K, value: FilterValues[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setDisplayLimit(36);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setDisplayLimit(36);
    showToast('Filters reset to defaults', 'info');
  }, [showToast]);

  const relaxFilters = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      minSmartScore: Math.max(0, prev.minSmartScore - 1.0),
      minRollingReturn: Math.max(-100, prev.minRollingReturn - 4),
      minSharpe: Math.max(-10, prev.minSharpe - 0.3),
      maxVolatility: Math.min(100, prev.maxVolatility + 5)
    }));
    setDisplayLimit(36);
    showToast('Relaxed filter constraints', 'info');
  }, [showToast]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category !== 'All Funds') count++;
    if (filters.preset !== 'all') count++;
    if (filters.searchQuery.trim() !== '') count++;
    if (filters.minSmartScore > 0) count++;
    if (filters.minRollingReturn > -100) count++;
    if (filters.minSharpe > -10) count++;
    if (filters.maxVolatility < 100) count++;
    return count;
  }, [filters]);

  const setTableColumns = (cols: string[]) => {
    setTableColumnsState(cols);
    try {
      localStorage.setItem('bickerbape_table_cols', JSON.stringify(cols));
    } catch (e) {}
  };

  const toggleComparison = (code: string | number) => {
    const fund = funds.find(f => f.code === code);
    const fundName = fund ? fund.name.split(' - Direct')[0] : `Fund ${code}`;

    setComparisonList(prev => {
      let next: (string | number)[];
      if (prev.includes(code)) {
        next = prev.filter(c => c !== code);
        showToast(`Removed ${fundName} from Compare`, 'info');
      } else {
        if (prev.length >= 4) {
          showToast('Maximum 4 funds can be compared simultaneously.', 'warning');
          return prev;
        }
        next = [...prev, code];
        showToast(`Added ${fundName} to Compare`, 'success');
      }
      try {
        localStorage.setItem('bickerbape_compare_list', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const clearComparison = () => {
    setComparisonList([]);
    try {
      localStorage.removeItem('bickerbape_compare_list');
    } catch (e) {}
    showToast('Comparison tray cleared', 'info');
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(prev => !prev);
  };

  // SimSim Bucket Operations
  const isInBucket = useCallback((code: string | number) => {
    return simsimBucket.includes(code);
  }, [simsimBucket]);

  const addToBucket = useCallback((code: string | number) => {
    if (simsimBucket.includes(code)) return;
    if (simsimBucket.length >= 10) {
      showToast('Maximum 10 funds permitted in SimSim portfolio.', 'warning');
      return;
    }

    const fund = funds.find(f => f.code === code);
    const fundName = fund ? fund.name.split(' - Direct')[0] : `Fund ${code}`;

    const nextBucket = [...simsimBucket, code];
    setSimsimBucket(nextBucket);

    // Recompute equal weights
    const equalWeight = Math.round(100 / nextBucket.length);
    const nextWeights: Record<string | number, number> = {};
    nextBucket.forEach((c, idx) => {
      if (idx === nextBucket.length - 1) {
        // Last item absorbs rounding difference
        const currentSum = Object.values(nextWeights).reduce((a, b) => a + b, 0);
        nextWeights[c] = Math.max(1, 100 - currentSum);
      } else {
        nextWeights[c] = equalWeight;
      }
    });
    setSimsimWeights(nextWeights);

    try {
      localStorage.setItem('bickerbape_simsim_bucket', JSON.stringify(nextBucket));
      localStorage.setItem('bickerbape_simsim_weights', JSON.stringify(nextWeights));
    } catch (e) {}

    showToast(`Added ${fundName} to SimSim Bucket`, 'success');
  }, [simsimBucket, funds, showToast]);

  const removeFromBucket = useCallback((code: string | number) => {
    const fund = funds.find(f => f.code === code);
    const fundName = fund ? fund.name.split(' - Direct')[0] : `Fund ${code}`;

    const nextBucket = simsimBucket.filter(c => c !== code);
    setSimsimBucket(nextBucket);

    const nextWeights: Record<string | number, number> = {};
    if (nextBucket.length === 1) {
      nextWeights[nextBucket[0]] = 100;
    } else if (nextBucket.length > 1) {
      let remainingSum = 0;
      nextBucket.forEach(c => {
        remainingSum += (simsimWeights[c] ?? 0);
      });
      if (remainingSum > 0) {
        let allocated = 0;
        const items = nextBucket.map(c => {
          const cur = simsimWeights[c] ?? 0;
          const exact = (cur / remainingSum) * 100;
          const floorVal = Math.floor(exact);
          allocated += floorVal;
          return { code: c, floorVal, frac: exact - floorVal };
        });
        const rem = 100 - allocated;
        items.sort((a, b) => b.frac - a.frac);
        items.forEach((item, idx) => {
          nextWeights[item.code] = item.floorVal + (idx < rem ? 1 : 0);
        });
      } else {
        const equalWeight = Math.round(100 / nextBucket.length);
        nextBucket.forEach((c, idx) => {
          if (idx === nextBucket.length - 1) {
            const currentSum = Object.values(nextWeights).reduce((a, b) => a + b, 0);
            nextWeights[c] = Math.max(1, 100 - currentSum);
          } else {
            nextWeights[c] = equalWeight;
          }
        });
      }
    }
    setSimsimWeights(nextWeights);

    try {
      localStorage.setItem('bickerbape_simsim_bucket', JSON.stringify(nextBucket));
      localStorage.setItem('bickerbape_simsim_weights', JSON.stringify(nextWeights));
    } catch (e) {}

    showToast(`Removed ${fundName} from SimSim Bucket`, 'info');
  }, [simsimBucket, simsimWeights, funds, showToast]);

  const clearBucket = useCallback(() => {
    setSimsimBucket([]);
    setSimsimWeights({});
    try {
      localStorage.removeItem('bickerbape_simsim_bucket');
      localStorage.removeItem('bickerbape_simsim_weights');
    } catch (e) {}
    showToast('SimSim portfolio cleared', 'info');
  }, [showToast]);

  const setFundWeight = useCallback((activeCode: string | number, weightPct: number) => {
    setSimsimWeights(prev => {
      const n = simsimBucket.length;
      if (n <= 1) {
        const single = { [activeCode]: 100 };
        try { localStorage.setItem('bickerbape_simsim_weights', JSON.stringify(single)); } catch (e) {}
        return single;
      }

      const target = Math.max(0, Math.min(100, Math.round(weightPct)));
      const remainingBudget = 100 - target;
      const otherCodes = simsimBucket.filter(c => c !== activeCode);
      let otherSum = 0;
      otherCodes.forEach(c => {
        otherSum += (prev[c] ?? 0);
      });

      const nextWeights: Record<string | number, number> = { [activeCode]: target };

      if (otherSum > 0 && remainingBudget > 0) {
        let allocatedOther = 0;
        const items = otherCodes.map(c => {
          const cur = prev[c] ?? 0;
          const exact = (cur / otherSum) * remainingBudget;
          const floorVal = Math.floor(exact);
          allocatedOther += floorVal;
          return { code: c, floorVal, frac: exact - floorVal };
        });

        const rem = remainingBudget - allocatedOther;
        items.sort((a, b) => b.frac - a.frac);
        items.forEach((item, idx) => {
          nextWeights[item.code] = item.floorVal + (idx < rem ? 1 : 0);
        });
      } else if (remainingBudget > 0) {
        const base = Math.floor(remainingBudget / otherCodes.length);
        const rem = remainingBudget % otherCodes.length;
        otherCodes.forEach((c, idx) => {
          nextWeights[c] = base + (idx < rem ? 1 : 0);
        });
      } else {
        otherCodes.forEach(c => {
          nextWeights[c] = 0;
        });
      }

      try {
        localStorage.setItem('bickerbape_simsim_weights', JSON.stringify(nextWeights));
      } catch (e) {}
      return nextWeights;
    });
  }, [simsimBucket]);

  const setBatchWeights = useCallback((newWeights: Record<string | number, number>) => {
    setSimsimWeights(newWeights);
    try {
      localStorage.setItem('bickerbape_simsim_weights', JSON.stringify(newWeights));
    } catch (e) {}
  }, []);

  const equalizeWeights = useCallback(() => {
    if (simsimBucket.length === 0) return;
    const equalWeight = Math.round(100 / simsimBucket.length);
    const nextWeights: Record<string | number, number> = {};
    simsimBucket.forEach((c, idx) => {
      if (idx === simsimBucket.length - 1) {
        const currentSum = Object.values(nextWeights).reduce((a, b) => a + b, 0);
        nextWeights[c] = Math.max(1, 100 - currentSum);
      } else {
        nextWeights[c] = equalWeight;
      }
    });
    setSimsimWeights(nextWeights);
    try {
      localStorage.setItem('bickerbape_simsim_weights', JSON.stringify(nextWeights));
    } catch (e) {}
    showToast('SimSim weights equalized across schemes', 'info');
  }, [simsimBucket, showToast]);

  const loadModelPreset = useCallback((presetKey: 'titan' | 'aggressive' | 'defensive') => {
    setActiveBasketPreset(presetKey);
    const categoryPairs: Record<string, string[]> = {
      titan: ['Flexi Cap', 'Mid Cap', 'Small Cap'],
      aggressive: ['Mid Cap', 'Small Cap', 'Flexi Cap'],
      defensive: ['Large & Mid Cap', 'Large Cap', 'ELSS']
    };

    const targetCats = categoryPairs[presetKey] || categoryPairs.titan;
    const chosenCodes: (string | number)[] = [];

    targetCats.forEach(cat => {
      const match = funds
        .filter(f => f.category.toLowerCase().includes(cat.toLowerCase()))
        .sort((a, b) => (b.smart_score?.overall || 0) - (a.smart_score?.overall || 0))[0];
      if (match && !chosenCodes.includes(match.code)) {
        chosenCodes.push(match.code);
      }
    });

    if (chosenCodes.length > 0) {
      setSimsimBucket(chosenCodes);
      const presetWeights: Record<string, number[]> = {
        titan: [40, 35, 25],
        aggressive: [40, 30, 30],
        defensive: [40, 30, 30]
      };
      const weightsArr = presetWeights[presetKey] || [34, 33, 33];
      const newWeightsMap: Record<string | number, number> = {};
      chosenCodes.forEach((code, idx) => {
        newWeightsMap[code] = weightsArr[idx] ?? Math.round(100 / chosenCodes.length);
      });
      setSimsimWeights(newWeightsMap);

      try {
        localStorage.setItem('bickerbape_simsim_bucket', JSON.stringify(chosenCodes));
        localStorage.setItem('bickerbape_simsim_weights', JSON.stringify(newWeightsMap));
      } catch (e) {}

      showToast(`Loaded ${presetKey.toUpperCase()} model portfolio`, 'success');
      setAppMode('simsim');
    }
  }, [funds, showToast]);

  const applyRegimePreset = useCallback((regimeId: string) => {
    const regime = MARKET_REGIMES.find(r => r.id === regimeId);
    if (regime) {
      setSimsimHorizon('CUSTOM');
      setSimsimCustomStartDate(regime.startDate);
      setSimsimCustomEndDate(regime.endDate);
      showToast(`Applied Market Regime: ${regime.name}`, 'info');
    }
  }, [showToast]);

  const loadMoreFunds = () => {
    setDisplayLimit(prev => prev + 36);
  };

  // Instant client-side filtering via AnalyticsEngine
  const filteredFunds = useMemo(() => {
    return AnalyticsEngine.filterAndSortFunds(funds, {
      searchQuery: filters.searchQuery,
      category: filters.category,
      preset: filters.preset,
      minRollingReturn: filters.minRollingReturn,
      minSharpe: filters.minSharpe,
      maxVolatility: filters.maxVolatility,
      minSmartScore: filters.minSmartScore,
      sortBy: filters.sortBy,
      sortDir: filters.sortDir
    });
  }, [funds, filters]);

  return (
    <ScreenerContext.Provider
      value={{
        appMode,
        setAppMode,
        funds,
        filteredFunds,
        categories,
        loading,
        mood,
        setMood,
        filters,
        updateFilter,
        resetFilters,
        relaxFilters,
        activeFilterCount,
        viewMode,
        setViewMode,
        tableColumns,
        setTableColumns,
        comparisonList,
        toggleComparison,
        clearComparison,
        selectedFundCode,
        setSelectedFundCode,
        sidebarOpen,
        setSidebarOpen,
        sidebarCollapsed,
        setSidebarCollapsed,
        toggleSidebarCollapse,
        isComparisonMatrixOpen,
        setIsComparisonMatrixOpen,
        isKpiModalOpen,
        setIsKpiModalOpen,
        isBasketModalOpen,
        setIsBasketModalOpen,
        activeBasketPreset,
        setActiveBasketPreset,
        displayLimit,
        loadMoreFunds,
        simsimBucket,
        simsimWeights,
        addToBucket,
        removeFromBucket,
        isInBucket,
        clearBucket,
        setFundWeight,
        setBatchWeights,
        equalizeWeights,
        loadModelPreset,
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
        applyRegimePreset
      }}
    >
      {children}
    </ScreenerContext.Provider>
  );
};

export const useScreener = () => {
  const context = useContext(ScreenerContext);
  if (!context) {
    throw new Error('useScreener must be used within a ScreenerProvider');
  }
  return context;
};
