import { describe, it, expect } from 'vitest';
import { SimSimEngine } from '@/lib/simsim-engine';

describe('SimSimEngine Quantitative Simulation Engine', () => {
  describe('calculateEarliestCommonDate', () => {
    it('returns default 2021-01-01 when funds array is empty or null', () => {
      expect(SimSimEngine.calculateEarliestCommonDate([])).toBe('2021-01-01');
      expect(SimSimEngine.calculateEarliestCommonDate(null as any)).toBe('2021-01-01');
    });

    it('returns the latest starting date among all funds (common coverage)', () => {
      const funds = [
        {
          nav_history: [
            { date: '2018-01-01', nav: 10.0 },
            { date: '2023-01-01', nav: 20.0 },
          ],
        },
        {
          nav_history: [
            { date: '2020-06-15', nav: 15.0 },
            { date: '2023-01-01', nav: 25.0 },
          ],
        },
      ];

      expect(SimSimEngine.calculateEarliestCommonDate(funds)).toBe('2020-06-15');
    });
  });

  describe('calculateMaxDrawdown', () => {
    it('returns 0.0 for monotonic growth or empty sequences', () => {
      expect(SimSimEngine.calculateMaxDrawdown([])).toBe(0.0);
      expect(SimSimEngine.calculateMaxDrawdown([100])).toBe(0.0);
      expect(SimSimEngine.calculateMaxDrawdown([100, 110, 120, 130])).toBe(0.0);
    });

    it('computes accurate peak-to-trough percentage drawdown', () => {
      // 100 -> 150 (peak) -> 90 (drawdown = (90 - 150)/150 = -40%) -> 120
      const series = [100, 150, 120, 90, 120];
      const maxDd = SimSimEngine.calculateMaxDrawdown(series);
      expect(maxDd).toBeCloseTo(40.0, 4);
    });
  });

  describe('calculateXirr', () => {
    it('returns 0.0 for empty or single cashflow', () => {
      expect(SimSimEngine.calculateXirr([])).toBe(0.0);
      expect(SimSimEngine.calculateXirr([{ date: '2023-01-01', amount: -1000 }])).toBe(0.0);
    });

    it('converges accurately on standard 1-year 15% return scenario', () => {
      // Invest 100,000 on 2022-01-01, receive 115,000 on 2023-01-01 exactly 1 year later (365 days)
      const cashflows = [
        { date: '2022-01-01', amount: -100000 },
        { date: '2023-01-01', amount: 115000 },
      ];

      const xirr = SimSimEngine.calculateXirr(cashflows);
      // Annual rate ~15.0%
      expect(xirr).toBeCloseTo(15.0, 1);
    });

    it('converges on multi-period monthly SIP cash flows', () => {
      const cashflows = [
        { date: '2022-01-01', amount: -10000 },
        { date: '2022-02-01', amount: -10000 },
        { date: '2022-03-01', amount: -10000 },
        { date: '2022-04-01', amount: -10000 },
        { date: '2022-05-01', amount: 42000 }, // Positive terminal portfolio valuation
      ];

      const xirr = SimSimEngine.calculateXirr(cashflows);
      expect(xirr).toBeGreaterThan(0);
      expect(Number.isNaN(xirr)).toBe(false);
      expect(Number.isFinite(xirr)).toBe(true);
    });
  });

  describe('simulateLumpsum', () => {
    const mockFunds = [
      {
        code: '1001',
        name: 'HDFC Top 100 - Direct Growth',
        category: 'Large Cap',
        fund_house: 'HDFC AMC',
        latest_nav: 100.0,
        nav_history: [
          { date: '2022-01-01', nav: 100.0 },
          { date: '2022-06-01', nav: 110.0 },
          { date: '2023-01-01', nav: 120.0 },
        ],
      },
      {
        code: '1002',
        name: 'Nippon Small Cap - Direct Growth',
        category: 'Small Cap',
        fund_house: 'Nippon AMC',
        latest_nav: 50.0,
        nav_history: [
          { date: '2022-01-01', nav: 50.0 },
          { date: '2022-06-01', nav: 60.0 },
          { date: '2023-01-01', nav: 70.0 },
        ],
      },
    ];

    it('returns null for empty funds or non-positive capital', () => {
      expect(SimSimEngine.simulateLumpsum([], {}, 100000, '2022-01-01')).toBeNull();
      expect(SimSimEngine.simulateLumpsum(mockFunds, {}, 0, '2022-01-01')).toBeNull();
    });

    it('simulates lumpsum investment with 50/50 weighting correctly', () => {
      // 100,000 capital:
      // Fund 1001 (50k): buys 50000 / 100 = 500 units. End val = 500 * 120 = 60,000
      // Fund 1002 (50k): buys 50000 / 50 = 1000 units. End val = 1000 * 70 = 70,000
      // Total end val = 130,000. Total gain = 30,000 (30.0%)
      const report = SimSimEngine.simulateLumpsum(
        mockFunds,
        { '1001': 0.5, '1002': 0.5 },
        100000,
        '2022-01-01',
        '2023-01-01'
      );

      expect(report).not.toBeNull();
      expect(report?.type).toBe('lumpsum');
      expect(report?.totalCapital).toBe(100000);
      expect(report?.presentValue).toBe(130000);
      expect(report?.totalGain).toBe(30000);
      expect(report?.totalGainPct).toBeCloseTo(30.0, 1);
      expect(report?.constituents.length).toBe(2);

      const c1001 = report?.constituents.find(c => c.code === '1001');
      expect(c1001?.presentValue).toBe(60000);
      expect(c1001?.units).toBe(500);

      const c1002 = report?.constituents.find(c => c.code === '1002');
      expect(c1002?.presentValue).toBe(70000);
      expect(c1002?.units).toBe(1000);
    });
  });

  describe('simulateSip', () => {
    const mockFunds = [
      {
        code: '1001',
        name: 'SBI Bluechip - Direct Growth',
        category: 'Large Cap',
        fund_house: 'SBI AMC',
        latest_nav: 100.0,
        nav_history: [
          { date: '2022-01-01', nav: 100.0 },
          { date: '2022-02-01', nav: 105.0 },
          { date: '2022-03-01', nav: 110.0 },
          { date: '2022-04-01', nav: 120.0 },
        ],
      },
    ];

    it('simulates monthly SIP installments and unit accumulation accurately', () => {
      const report = SimSimEngine.simulateSip(
        mockFunds,
        { '1001': 1.0 },
        10000,
        '2022-01-01',
        1,
        '2022-04-01'
      );

      expect(report).not.toBeNull();
      expect(report?.type).toBe('sip');
      expect(report?.totalCapital).toBeGreaterThan(0);
      expect(report?.presentValue).toBeGreaterThan(0);
      expect(report?.cagr).toBeDefined();
      expect(Number.isNaN(report?.cagr)).toBe(false);
    });
  });
});
