import { describe, it, expect } from 'vitest';
import { AnalyticsEngine } from '@/lib/analytics';
import { FundSummary } from '@/types/fund';

describe('AnalyticsEngine Screener Filtering & Sorting', () => {
  const mockFunds: FundSummary[] = [
    {
      code: '101',
      name: 'HDFC Top 100 - Direct Growth',
      category: 'Large Cap',
      fund_house: 'HDFC AMC',
      manager: 'Rahul Baijal',
      manager_tenure_years: 4.5,
      manager_change_recently: false,
      rolling_3y_avg: 17.5,
      rolling_3y_positive_pct: 98.0,
      sharpe_ratio: 0.85,
      volatility: 13.2,
      volatility_vs_category: -0.6,
      returns_vs_category_3y: 2.1,
      smart_score: { overall: 8.2, pillars: {} as any },
    },
    {
      code: '102',
      name: 'Parag Parikh Flexi Cap Fund - Direct Plan',
      category: 'Flexi Cap',
      fund_house: 'PPFAS AMC',
      manager: 'Rajeev Thakkar',
      manager_tenure_years: 10.0,
      manager_change_recently: false,
      rolling_3y_avg: 21.0,
      rolling_3y_positive_pct: 99.0,
      sharpe_ratio: 1.15,
      volatility: 11.5,
      volatility_vs_category: -1.2,
      returns_vs_category_3y: 3.5,
      smart_score: { overall: 9.1, pillars: {} as any },
    },
    {
      code: '103',
      name: 'Nippon India Small Cap Fund - Direct',
      category: 'Small Cap',
      fund_house: 'Nippon India AMC',
      manager: 'Samir Rachh',
      manager_tenure_years: 7.0,
      manager_change_recently: false,
      rolling_3y_avg: 26.5,
      rolling_3y_positive_pct: 96.0,
      sharpe_ratio: 0.95,
      volatility: 18.5,
      volatility_vs_category: 0.5,
      returns_vs_category_3y: 4.0,
      smart_score: { overall: 7.8, pillars: {} as any },
    },
    {
      code: '104',
      name: 'Mirae Asset ELSS Tax Saver Fund',
      category: 'ELSS Tax Saver',
      fund_house: 'Mirae Asset AMC',
      manager: 'Neelesh Surana',
      manager_tenure_years: 1.5, // Tenure < 3
      manager_change_recently: true,
      rolling_3y_avg: 14.0,
      rolling_3y_positive_pct: 88.0,
      sharpe_ratio: 0.55,
      volatility: 15.0,
      volatility_vs_category: 1.5,
      returns_vs_category_3y: -0.5,
      smart_score: { overall: 6.2, pillars: {} as any },
    },
  ];

  describe('Text Search Filtering', () => {
    it('matches case-insensitively on scheme name', () => {
      const results = AnalyticsEngine.filterAndSortFunds(mockFunds, { searchQuery: 'parag' });
      expect(results).toHaveLength(1);
      expect(results[0].code).toBe('102');
    });

    it('matches on AMC fund house name', () => {
      const results = AnalyticsEngine.filterAndSortFunds(mockFunds, { searchQuery: 'nippon' });
      expect(results).toHaveLength(1);
      expect(results[0].code).toBe('103');
    });

    it('matches on category name', () => {
      const results = AnalyticsEngine.filterAndSortFunds(mockFunds, { searchQuery: 'small cap' });
      expect(results).toHaveLength(1);
      expect(results[0].code).toBe('103');
    });

    it('matches on fund manager name', () => {
      const results = AnalyticsEngine.filterAndSortFunds(mockFunds, { searchQuery: 'surana' });
      expect(results).toHaveLength(1);
      expect(results[0].code).toBe('104');
    });

    it('returns empty array when search query matches nothing', () => {
      const results = AnalyticsEngine.filterAndSortFunds(mockFunds, { searchQuery: 'nonexistent crypto token' });
      expect(results).toHaveLength(0);
    });
  });

  describe('Category Filtering', () => {
    it('returns all funds when category is "All Funds"', () => {
      const results = AnalyticsEngine.filterAndSortFunds(mockFunds, { category: 'All Funds' });
      expect(results).toHaveLength(4);
    });

    it('filters strictly by specified category', () => {
      const results = AnalyticsEngine.filterAndSortFunds(mockFunds, { category: 'Large Cap' });
      expect(results).toHaveLength(1);
      expect(results[0].code).toBe('101');
    });
  });

  describe('Quantitative Slider Bounds', () => {
    it('filters by minimum 3Y rolling return threshold', () => {
      const results = AnalyticsEngine.filterAndSortFunds(mockFunds, { minRollingReturn: 20.0 });
      // Only 102 (21.0) and 103 (26.5) pass
      expect(results).toHaveLength(2);
      expect(results.map(f => f.code)).toEqual(['102', '103']);
    });

    it('filters by minimum Sharpe ratio threshold', () => {
      const results = AnalyticsEngine.filterAndSortFunds(mockFunds, { minSharpe: 0.9 });
      // 102 (1.15) and 103 (0.95) pass
      expect(results).toHaveLength(2);
      expect(results.map(f => f.code)).toEqual(['102', '103']);
    });

    it('filters by maximum volatility ceiling', () => {
      const results = AnalyticsEngine.filterAndSortFunds(mockFunds, { maxVolatility: 14.0 });
      // 101 (13.2) and 102 (11.5) pass
      expect(results).toHaveLength(2);
      expect(results.map(f => f.code)).toEqual(['102', '101']);
    });

    it('filters by minimum SmartScore threshold', () => {
      const results = AnalyticsEngine.filterAndSortFunds(mockFunds, { minSmartScore: 8.0 });
      // 101 (8.2) and 102 (9.1) pass
      expect(results).toHaveLength(2);
      expect(results.map(f => f.code)).toEqual(['102', '101']);
    });
  });

  describe('Strategy Presets', () => {
    it('filters smartscore_elite preset (score >= 7.5)', () => {
      const results = AnalyticsEngine.filterAndSortFunds(mockFunds, { preset: 'smartscore_elite' });
      // 101 (8.2), 102 (9.1), 103 (7.8) pass; 104 (6.2) fails
      expect(results).toHaveLength(3);
    });

    it('filters 10-step formula preset (prashant / mandeep)', () => {
      const results = AnalyticsEngine.filterAndSortFunds(mockFunds, { preset: 'prashant' });
      // 101: rolling 17.5>=16, sharpe 0.85>=0.7, vol_vs_cat -0.6<=1.0, tenure 4.5>=3 -> passes
      // 102: rolling 21>=16, sharpe 1.15>=0.7, vol_vs_cat -1.2<=1.0, tenure 10>=3 -> passes
      // 103: rolling 26.5>=16, sharpe 0.95>=0.7, vol_vs_cat 0.5<=1.0, tenure 7>=3 -> passes
      // 104: tenure 1.5 < 3 and recent_change true -> fails
      expect(results).toHaveLength(3);
      expect(results.some(f => f.code === '104')).toBe(false);
    });

    it('filters compounders preset (rolling >= 18% and positive % >= 95%)', () => {
      const results = AnalyticsEngine.filterAndSortFunds(mockFunds, { preset: 'compounders' });
      // 102: 21.0 & 99% (pass)
      // 103: 26.5 & 96% (pass)
      expect(results).toHaveLength(2);
      expect(results.map(f => f.code)).toEqual(['102', '103']);
    });

    it('filters low_vol preset (volatility vs category <= -0.5%)', () => {
      const results = AnalyticsEngine.filterAndSortFunds(mockFunds, { preset: 'low_vol' });
      // 101 (-0.6) and 102 (-1.2) pass
      expect(results).toHaveLength(2);
      expect(results.map(f => f.code)).toEqual(['102', '101']);
    });

    it('filters elss preset', () => {
      const results = AnalyticsEngine.filterAndSortFunds(mockFunds, { preset: 'elss' });
      expect(results).toHaveLength(1);
      expect(results[0].code === '104').toBe(true);
    });
  });

  describe('Multi-column Sorting', () => {
    it('sorts by SmartScore descending (default)', () => {
      const results = AnalyticsEngine.filterAndSortFunds(mockFunds, {
        sortBy: 'smart_score',
        sortDir: 'desc',
      });
      expect(results.map(f => f.code)).toEqual(['102', '101', '103', '104']);
    });

    it('sorts by SmartScore ascending', () => {
      const results = AnalyticsEngine.filterAndSortFunds(mockFunds, {
        sortBy: 'smart_score',
        sortDir: 'asc',
      });
      expect(results.map(f => f.code)).toEqual(['104', '103', '101', '102']);
    });

    it('sorts alphabetically by scheme name', () => {
      const results = AnalyticsEngine.filterAndSortFunds(mockFunds, {
        sortBy: 'name',
        sortDir: 'asc',
      });
      expect(results[0].code).toBe('101'); // HDFC Top 100
      expect(results[1].code).toBe('104'); // Mirae Asset ELSS
      expect(results[2].code).toBe('103'); // Nippon India
      expect(results[3].code).toBe('102'); // Parag Parikh
    });

    it('sorts by numeric metrics (rolling_3y_avg desc)', () => {
      const results = AnalyticsEngine.filterAndSortFunds(mockFunds, {
        sortBy: 'rolling_3y_avg',
        sortDir: 'desc',
      });
      expect(results.map(f => f.code)).toEqual(['103', '102', '101', '104']);
    });
  });
});
