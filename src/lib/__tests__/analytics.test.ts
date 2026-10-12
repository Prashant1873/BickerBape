import { describe, it, expect } from 'vitest';
import { AnalyticsEngine } from '@/lib/analytics';
import { FundSummary } from '@/types/fund';

function createSampleFunds(): FundSummary[] {
  return [
    {
      code: '101',
      name: 'Parag Parikh Flexi Cap Fund - Direct Plan',
      category: 'Flexi Cap',
      fund_house: 'PPFAS Mutual Fund',
      manager: 'Rajeev Thakkar',
      latest_nav: 85.5,
      history_years: 11.0,
      aum_cr: 65000,
      expense_ratio: 0.65,
      rolling_3y_avg: 19.5,
      rolling_3y_positive_pct: 98.0,
      sharpe_ratio: 1.15,
      volatility: 11.2,
      volatility_vs_category: -1.2,
      returns_vs_category_3y: 2.5,
      manager_tenure_years: 11.0,
      manager_change_recently: false,
      smart_score: { overall: 8.8, seasoning_cap: null, pillars: {} as any },
      cagr_1y: 24.5,
      cagr_3y: 21.0,
      cagr_5y: 19.8
    },
    {
      code: '102',
      name: 'HDFC Small Cap Fund - Direct - Growth',
      category: 'Small Cap',
      fund_house: 'HDFC Mutual Fund',
      manager: 'Chirag Setalvad',
      latest_nav: 120.0,
      history_years: 14.0,
      aum_cr: 32000,
      expense_ratio: 0.72,
      rolling_3y_avg: 22.0,
      rolling_3y_positive_pct: 94.0,
      sharpe_ratio: 0.95,
      volatility: 14.5,
      volatility_vs_category: -0.3,
      returns_vs_category_3y: 1.8,
      manager_tenure_years: 12.0,
      manager_change_recently: false,
      smart_score: { overall: 8.2, seasoning_cap: null, pillars: {} as any },
      cagr_1y: 35.0,
      cagr_3y: 26.5,
      cagr_5y: 20.1
    },
    {
      code: '103',
      name: 'Mirae Asset Large Cap Fund - Direct Plan',
      category: 'Large Cap',
      fund_house: 'Mirae Asset Mutual Fund',
      manager: 'Gaurav Misra',
      latest_nav: 95.0,
      history_years: 8.0,
      aum_cr: 38000,
      expense_ratio: 0.55,
      rolling_3y_avg: 14.0,
      rolling_3y_positive_pct: 90.0,
      sharpe_ratio: 0.60,
      volatility: 12.0,
      volatility_vs_category: 0.5,
      returns_vs_category_3y: -0.5,
      manager_tenure_years: 4.0,
      manager_change_recently: false,
      smart_score: { overall: 6.8, seasoning_cap: null, pillars: {} as any },
      cagr_1y: 16.5,
      cagr_3y: 15.0,
      cagr_5y: 14.2
    },
    {
      code: '104',
      name: 'Quant ELSS Tax Saver Fund - Direct - Growth',
      category: 'ELSS Tax Saver',
      fund_house: 'Quant Mutual Fund',
      manager: 'Sandeep Tandon',
      latest_nav: 320.0,
      history_years: 9.0,
      aum_cr: 9500,
      expense_ratio: 0.78,
      rolling_3y_avg: 24.5,
      rolling_3y_positive_pct: 96.0,
      sharpe_ratio: 1.25,
      volatility: 17.5,
      volatility_vs_category: 1.5,
      returns_vs_category_3y: 4.5,
      manager_tenure_years: 6.0,
      manager_change_recently: false,
      smart_score: { overall: 7.9, seasoning_cap: null, pillars: {} as any },
      cagr_1y: 42.0,
      cagr_3y: 31.0,
      cagr_5y: 26.5
    }
  ] as FundSummary[];
}

describe('AnalyticsEngine: Filtering, Presets, and Sorting', () => {
  describe('Text Search Filtering', () => {
    it('matches search query across scheme name, fund house, category, and manager', () => {
      const funds = createSampleFunds();

      const byName = AnalyticsEngine.filterAndSortFunds(funds, { searchQuery: 'Parag' });
      expect(byName).toHaveLength(1);
      expect(byName[0].code).toBe('101');

      const byHouse = AnalyticsEngine.filterAndSortFunds(funds, { searchQuery: 'HDFC' });
      expect(byHouse).toHaveLength(1);
      expect(byHouse[0].code).toBe('102');

      const byManager = AnalyticsEngine.filterAndSortFunds(funds, { searchQuery: 'Sandeep' });
      expect(byManager).toHaveLength(1);
      expect(byManager[0].code).toBe('104');
    });

    it('returns empty array when search query matches nothing', () => {
      const funds = createSampleFunds();
      const results = AnalyticsEngine.filterAndSortFunds(funds, { searchQuery: 'NonExistentAMC' });
      expect(results).toHaveLength(0);
    });
  });

  describe('Category Filtering', () => {
    it('filters funds strictly matching selected category', () => {
      const funds = createSampleFunds();
      const flexiFunds = AnalyticsEngine.filterAndSortFunds(funds, { category: 'Flexi Cap' });
      expect(flexiFunds).toHaveLength(1);
      expect(flexiFunds[0].category).toBe('Flexi Cap');
    });

    it('returns all funds when category is "All Funds"', () => {
      const funds = createSampleFunds();
      const allFunds = AnalyticsEngine.filterAndSortFunds(funds, { category: 'All Funds' });
      expect(allFunds).toHaveLength(4);
    });
  });

  describe('Quantitative Slider Thresholds', () => {
    it('filters funds by minimum SmartScore threshold', () => {
      const funds = createSampleFunds();
      const highRated = AnalyticsEngine.filterAndSortFunds(funds, { minSmartScore: 8.0 });
      expect(highRated).toHaveLength(2);
      expect(highRated.map(f => f.code)).toEqual(['101', '102']);
    });

    it('filters funds by Sharpe ratio and maximum Volatility', () => {
      const funds = createSampleFunds();
      const lowRiskHighSharpe = AnalyticsEngine.filterAndSortFunds(funds, {
        minSharpe: 1.0,
        maxVolatility: 15.0
      });
      expect(lowRiskHighSharpe).toHaveLength(1);
      expect(lowRiskHighSharpe[0].code).toBe('101');
    });
  });

  describe('Strategy Presets', () => {
    it('filters smartscore_elite preset (overall >= 7.5)', () => {
      const funds = createSampleFunds();
      const elite = AnalyticsEngine.filterAndSortFunds(funds, { preset: 'smartscore_elite' });
      expect(elite).toHaveLength(3); // 101 (8.8), 102 (8.2), 104 (7.9)
    });

    it('filters prashant / mandeep formula preset', () => {
      const funds = createSampleFunds();
      // Requires: 3Y Rolling >= 16%, Sharpe >= 0.7, Vol vs Cat <= 1.0, Tenure >= 3Y
      const curated = AnalyticsEngine.filterAndSortFunds(funds, { preset: 'prashant' });
      // 101 passes (19.5, 1.15, -1.2, 11Y)
      // 102 passes (22.0, 0.95, -0.3, 12Y)
      // 103 fails (rolling 14 < 16)
      // 104 fails (vol vs cat 1.5 > 1.0)
      expect(curated.map(f => f.code)).toEqual(['101', '102']);
    });

    it('filters compounders preset (3Y Rolling >= 18% & positive pct >= 95%)', () => {
      const funds = createSampleFunds();
      const compounders = AnalyticsEngine.filterAndSortFunds(funds, { preset: 'compounders' });
      // 101: 19.5% & 98% -> PASS
      // 102: 22.0% & 94% -> FAIL (pct < 95%)
      // 104: 24.5% & 96% -> PASS
      expect(compounders.map(f => f.code)).toEqual(['101', '104']);
    });

    it('filters low_vol preset (volatility vs category <= -0.5)', () => {
      const funds = createSampleFunds();
      const lowVol = AnalyticsEngine.filterAndSortFunds(funds, { preset: 'low_vol' });
      // 101 has -1.2 -> PASS
      expect(lowVol).toHaveLength(1);
      expect(lowVol[0].code).toBe('101');
    });

    it('filters elss preset', () => {
      const funds = createSampleFunds();
      const elss = AnalyticsEngine.filterAndSortFunds(funds, { preset: 'elss' });
      expect(elss).toHaveLength(1);
      expect(elss[0].category).toBe('ELSS Tax Saver');
    });
  });

  describe('Multi-column Sorting & Null Resilience', () => {
    it('sorts funds by SmartScore descending by default', () => {
      const funds = createSampleFunds();
      const sorted = AnalyticsEngine.filterAndSortFunds(funds, { sortBy: 'smart_score', sortDir: 'desc' });
      expect(sorted[0].code).toBe('101'); // 8.8
      expect(sorted[1].code).toBe('102'); // 8.2
      expect(sorted[2].code).toBe('104'); // 7.9
      expect(sorted[3].code).toBe('103'); // 6.8
    });

    it('sorts funds by AUM ascending', () => {
      const funds = createSampleFunds();
      const sorted = AnalyticsEngine.filterAndSortFunds(funds, { sortBy: 'aum_cr', sortDir: 'asc' });
      expect(sorted[0].code).toBe('104'); // 9500
      expect(sorted[1].code).toBe('102'); // 32000
      expect(sorted[2].code).toBe('103'); // 38000
      expect(sorted[3].code).toBe('101'); // 65000
    });

    it('sorts funds by string field (name) alphabetically', () => {
      const funds = createSampleFunds();
      const sorted = AnalyticsEngine.filterAndSortFunds(funds, { sortBy: 'name', sortDir: 'asc' });
      expect(sorted[0].name.startsWith('HDFC')).toBe(true);
      expect(sorted[1].name.startsWith('Mirae')).toBe(true);
      expect(sorted[2].name.startsWith('Parag')).toBe(true);
      expect(sorted[3].name.startsWith('Quant')).toBe(true);
    });

    it('safely handles null and undefined metric values during sorting without throwing', () => {
      const fundsWithNulls = [
        { ...createSampleFunds()[0], cagr_5y: null as any },
        { ...createSampleFunds()[1], cagr_5y: 20.0 },
        { ...createSampleFunds()[2], cagr_5y: undefined as any }
      ];

      const sortedDesc = AnalyticsEngine.filterAndSortFunds(fundsWithNulls, { sortBy: 'cagr_5y', sortDir: 'desc' });
      expect(sortedDesc[0].code).toBe('102'); // valid 20.0 comes first
      expect(sortedDesc).toHaveLength(3);
    });
  });
});
