'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { FundSummary, CategoriesSummary, InvestorMood, ViewMode, ScreenerFilterState } from '@/types/fund';
import { fetchFundsSummary, fetchCategoriesSummary } from '@/lib/data-loader';
import { recalculateSmartScoresForMood } from '@/lib/smartscore';
import { AnalyticsEngine } from '@/lib/analytics';
import { DEFAULT_TABLE_COLUMNS } from '@/lib/kpi-catalog';

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
  funds: FundSummary[];
  filteredFunds: FundSummary[];
  categories: CategoriesSummary;
  loading: boolean;
  mood: InvestorMood;
  setMood: (mood: InvestorMood) => void;
  filters: FilterValues;
  updateFilter: <K extends keyof FilterValues>(key: K, value: FilterValues[K]) => void;
  resetFilters: () => void;
  activeFilterCount: number;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  tableColumns: string[];
  setTableColumns: (cols: string[]) => void;
  comparisonList: (string | number)[];
  toggleComparison: (code: string | number) => void;
  clearComparison: () => void;
  selectedFundCode: string | number | null;
  setSelectedFundCode: (code: string | number | null) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isComparisonMatrixOpen: boolean;
  setIsComparisonMatrixOpen: (open: boolean) => void;
  isKpiModalOpen: boolean;
  setIsKpiModalOpen: (open: boolean) => void;
  displayLimit: number;
  loadMoreFunds: () => void;
}

const ScreenerContext = createContext<ScreenerContextType | undefined>(undefined);

export const ScreenerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
  const [isComparisonMatrixOpen, setIsComparisonMatrixOpen] = useState<boolean>(false);
  const [isKpiModalOpen, setIsKpiModalOpen] = useState<boolean>(false);
  const [displayLimit, setDisplayLimit] = useState<number>(36);

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
  };

  const updateFilter = useCallback(<K extends keyof FilterValues>(key: K, value: FilterValues[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setDisplayLimit(36); // Reset pagination on filter change
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setDisplayLimit(36);
  }, []);

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
    setComparisonList(prev => {
      let next: (string | number)[];
      if (prev.includes(code)) {
        next = prev.filter(c => c !== code);
      } else {
        if (prev.length >= 4) {
          alert('Maximum 4 funds can be compared simultaneously.');
          return prev;
        }
        next = [...prev, code];
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
  };

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
        funds,
        filteredFunds,
        categories,
        loading,
        mood,
        setMood,
        filters,
        updateFilter,
        resetFilters,
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
        isComparisonMatrixOpen,
        setIsComparisonMatrixOpen,
        isKpiModalOpen,
        setIsKpiModalOpen,
        displayLimit,
        loadMoreFunds
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
