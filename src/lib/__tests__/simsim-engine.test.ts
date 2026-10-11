import { describe, it, expect } from 'vitest';
import { SimSimEngine } from '@/lib/simsim-engine';

describe('SimSimEngine™ Portfolio Simulator & Quantitative Mathematics', () => {
  describe('Equal Weight Integer Remainder Distribution', () => {
    it('guarantees integer percentages sum to exactly 100% for all basket sizes N from 1 to 10', () => {
      for (let n = 1; n <= 10; n++) {
        const basePct = Math.floor(100 / n);
        const remainder = 100 % n;
        const weights: number[] = [];
        for (let idx = 0; idx < n; idx++) {
          weights.push(basePct + (idx < remainder ? 1 : 0));
        }
        const total = weights.reduce((sum, w) => sum + w, 0);
        expect(total).toBe(100);
      }
    });
  });

  describe('Newton-Raphson & Bisection XIRR Solver', () => {
    it('returns 0.0 when fewer than 2 cashflows are provided', () => {
      expect(SimSimEngine.calculateXirr([])).toBe(0.0);
      expect(SimSimEngine.calculateXirr([{ date: '2023-01-01', amount: -10000 }])).toBe(0.0);
    });

    it('calculates 1-year lumpsum XIRR accurately (20% annual gain)', () => {
      const cashflows = [
        { date: '2023-01-01', amount: -100000 },
        { date: '2024-01-01', amount: 120000 }
      ];
      const xirr = SimSimEngine.calculateXirr(cashflows);
      expect(xirr).toBeCloseTo(20.0, 1);
    });

    it('calculates 12-month regular monthly SIP XIRR accurately (~15% annualized)', () => {
      // 12 monthly installments of ₹10,000 on the 1st of each month in 2023
      const cashflows: Array<{ date: string; amount: number }> = [];
      for (let m = 1; m <= 12; m++) {
        const monthStr = String(m).padStart(2, '0');
        cashflows.push({ date: `2023-${monthStr}-01`, amount: -10000 });
      }
      // Ending present value after 1 year (e.g. ₹1,30,000 on 2024-01-01)
      cashflows.push({ date: '2024-01-01', amount: 130000 });

      const xirr = SimSimEngine.calculateXirr(cashflows);
      // Annualized XIRR should be between 14.5% and 16.5%
      expect(xirr).toBeGreaterThan(14.5);
      expect(xirr).toBeLessThan(16.5);
    });
  });

  describe('Maximum Drawdown Calculation', () => {
    it('returns 0.0 for empty or monotonic ascending portfolio values', () => {
      expect(SimSimEngine.calculateMaxDrawdown([])).toBe(0.0);
      expect(SimSimEngine.calculateMaxDrawdown([100, 105, 110, 120])).toBe(0.0);
    });

    it('calculates peak-to-trough maximum drawdown accurately (25% drop)', () => {
      // Peak = 120, Trough = 90 -> Drop is (120 - 90)/120 = 25%
      const values = [100, 110, 120, 105, 90, 95, 115];
      const mdd = SimSimEngine.calculateMaxDrawdown(values);
      expect(mdd).toBeCloseTo(25.0, 1);
    });
  });

  describe('Earliest Common Date Alignment', () => {
    it('identifies the latest inception date across multiple scheme series', () => {
      const funds = [
        {
          nav_history: [
            { date: '2020-01-01', nav: 10 },
            { date: '2021-01-01', nav: 12 }
          ]
        },
        {
          nav_history: [
            { date: '2021-06-01', nav: 15 },
            { date: '2022-01-01', nav: 18 }
          ]
        }
      ];

      const earliestCommon = SimSimEngine.calculateEarliestCommonDate(funds);
      expect(earliestCommon).toBe('2021-06-01');
    });

    it('returns fallback date for empty funds array', () => {
      expect(SimSimEngine.calculateEarliestCommonDate([])).toBe('2021-01-01');
    });
  });

  describe('NAV Alignment & Forward-Filling', () => {
    it('aligns dates and forward-fills missing trading days across multiple funds', () => {
      const funds = [
        {
          code: 'F1',
          nav_history: [
            { date: '2023-01-01', nav: 100 },
            { date: '2023-01-02', nav: 102 },
            { date: '2023-01-04', nav: 105 }
          ]
        },
        {
          code: 'F2',
          nav_history: [
            { date: '2023-01-01', nav: 50 },
            { date: '2023-01-03', nav: 52 },
            { date: '2023-01-04', nav: 53 }
          ]
        }
      ];

      const { dates, fundNavMap } = SimSimEngine.alignNavHistories(funds, '2023-01-01');

      expect(dates).toEqual(['2023-01-01', '2023-01-02', '2023-01-03', '2023-01-04']);
      // F1 on 2023-01-03 should be forward-filled from 2023-01-02 (102)
      expect(fundNavMap['F1'][2]).toBe(102);
      // F2 on 2023-01-02 should be forward-filled from 2023-01-01 (50)
      expect(fundNavMap['F2'][1]).toBe(50);
    });
  });

  describe('Lumpsum & SIP End-to-End Simulation', () => {
    const mockFunds = [
      {
        code: 101,
        name: 'Alpha Equity Fund - Direct Plan - Growth',
        category: 'Large Cap',
        fund_house: 'Alpha AMC',
        latest_nav: 120,
        nav_history: [
          { date: '2023-01-01', nav: 100 },
          { date: '2023-06-01', nav: 110 },
          { date: '2024-01-01', nav: 120 }
        ]
      },
      {
        code: 102,
        name: 'Beta Flexi Cap Fund - Direct - Growth',
        category: 'Flexi Cap',
        fund_house: 'Beta AMC',
        latest_nav: 130,
        nav_history: [
          { date: '2023-01-01', nav: 100 },
          { date: '2023-06-01', nav: 115 },
          { date: '2024-01-01', nav: 130 }
        ]
      }
    ];

    it('simulates 50-50 lumpsum growth over 1 year accurately', () => {
      const weights = { 101: 50, 102: 50 };
      const report = SimSimEngine.simulateLumpsum(mockFunds as any, weights, 100000, '2023-01-01');

      expect(report).not.toBeNull();
      expect(report!.type).toBe('lumpsum');
      expect(report!.totalCapital).toBe(100000);
      // 50k in 101 (100 -> 120) = 60,000; 50k in 102 (100 -> 130) = 65,000. Total = 125,000
      expect(report!.presentValue).toBe(125000);
      expect(report!.totalGain).toBe(25000);
      expect(report!.totalGainPct).toBe(25.0);
      expect(report!.constituents).toHaveLength(2);
      expect(report!.constituents[0].allocatedCap).toBe(50000);
      expect(report!.constituents[1].allocatedCap).toBe(50000);
    });

    it('simulates monthly SIP investment and records installments', () => {
      const weights = { 101: 50, 102: 50 };
      const report = SimSimEngine.simulateSip(mockFunds as any, weights, 10000, '2023-01-01', 1);

      expect(report).not.toBeNull();
      expect(report!.type).toBe('sip');
      expect(report!.totalCapital).toBeGreaterThan(0);
      expect(report!.presentValue).toBeGreaterThan(0);
      expect(report!.cagr).toBeDefined();
      expect(report!.constituents).toHaveLength(2);
    });
  });
});
