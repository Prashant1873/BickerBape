import { describe, it, expect } from 'vitest';
import {
  MOOD_WEIGHTS,
  recalculateSmartScoresForMood,
  getSuperScoreTheme,
  getOrdinalSuffix
} from '@/lib/smartscore';
import { FundSummary } from '@/types/fund';

function createMockFund(overrides: Partial<FundSummary> = {}): FundSummary {
  return {
    code: '123456',
    name: 'Sample Direct Growth Fund',
    category: 'Flexi Cap',
    fund_house: 'Sample AMC',
    latest_nav: 50.0,
    history_years: 5.0,
    aum_cr: 1000,
    expense_ratio: 0.75,
    cagr_1y: 15.0,
    cagr_3y: 18.0,
    cagr_5y: 16.0,
    smart_score: {
      overall: 7.5,
      seasoning_cap: null,
      pillars: {
        return_ratios: 8.0,
        track_record: 7.0,
        risk_volatility: 7.5,
        expense_ratio: 8.0,
        performance: { score: 8.0, weight: 0.45 },
        track_record_pillar: { score: 7.0, weight: 0.25 },
        risk: { score: 7.5, weight: 0.20 },
        cost: { score: 8.0, weight: 0.10 }
      }
    },
    ...overrides
  } as FundSummary;
}

describe('SmartScore™ Mathematical Model & Seasoning Discipline', () => {
  describe('Investor Mood Weights', () => {
    it('ensures weights for all investor moods sum to exactly 1.00', () => {
      const moods = ['growth', 'safety', 'income'] as const;
      moods.forEach(mood => {
        const w = MOOD_WEIGHTS[mood];
        const sum = w.perf + w.track + w.risk + w.cost;
        expect(sum).toBeCloseTo(1.0, 6);
      });
    });

    it('recalculates scores accurately under Growth mood (45% perf, 25% track, 20% risk, 10% cost)', () => {
      const fund = createMockFund({
        smart_score: {
          overall: 0,
          seasoning_cap: null,
          pillars: {
            performance: { score: 10.0 },
            track_record: { score: 6.0 },
            risk: { score: 4.0 },
            cost: { score: 2.0 }
          } as any
        }
      });

      const [updated] = recalculateSmartScoresForMood([fund], 'growth');
      // expected = (0.45 * 10) + (0.25 * 6) + (0.20 * 4) + (0.10 * 2) = 4.5 + 1.5 + 0.8 + 0.2 = 7.0
      expect(updated.smart_score?.overall).toBe(7.0);
    });

    it('recalculates scores accurately under Safety mood (45% risk, 25% track, 20% perf, 10% cost)', () => {
      const fund = createMockFund({
        smart_score: {
          overall: 0,
          seasoning_cap: null,
          pillars: {
            performance: { score: 10.0 },
            track_record: { score: 6.0 },
            risk: { score: 4.0 },
            cost: { score: 2.0 }
          } as any
        }
      });

      const [updated] = recalculateSmartScoresForMood([fund], 'safety');
      // expected = (0.45 * 4) + (0.25 * 6) + (0.20 * 10) + (0.10 * 2) = 1.8 + 1.5 + 2.0 + 0.2 = 5.5
      expect(updated.smart_score?.overall).toBe(5.5);
    });

    it('recalculates scores accurately under Income mood (35% cost, 30% risk, 20% track, 15% perf)', () => {
      const fund = createMockFund({
        smart_score: {
          overall: 0,
          seasoning_cap: null,
          pillars: {
            performance: { score: 10.0 },
            track_record: { score: 6.0 },
            risk: { score: 4.0 },
            cost: { score: 2.0 }
          } as any
        }
      });

      const [updated] = recalculateSmartScoresForMood([fund], 'income');
      // expected = (0.35 * 2) + (0.30 * 4) + (0.20 * 6) + (0.15 * 10) = 0.7 + 1.2 + 1.2 + 1.5 = 4.6
      expect(updated.smart_score?.overall).toBe(4.6);
    });
  });

  describe('Fiduciary Seasoning Caps', () => {
    it('strictly caps funds with < 1 year history to 5.8 regardless of performance score', () => {
      const youngFund = createMockFund({
        history_years: 0.6,
        smart_score: {
          overall: 9.5,
          seasoning_cap: null,
          pillars: {
            performance: { score: 9.5 },
            track_record: { score: 9.0 },
            risk: { score: 9.0 },
            cost: { score: 9.0 }
          } as any
        }
      });

      const [updated] = recalculateSmartScoresForMood([youngFund], 'growth');
      expect(updated.smart_score?.overall).toBe(5.8);
      expect(updated.smart_score?.seasoning_cap).toBe(5.8);
    });

    it('strictly caps funds with < 3 years history to 7.0', () => {
      const adolescentFund = createMockFund({
        history_years: 2.1,
        smart_score: {
          overall: 8.8,
          seasoning_cap: null,
          pillars: {
            performance: { score: 9.0 },
            track_record: { score: 8.5 },
            risk: { score: 8.5 },
            cost: { score: 8.0 }
          } as any
        }
      });

      const [updated] = recalculateSmartScoresForMood([adolescentFund], 'growth');
      expect(updated.smart_score?.overall).toBe(7.0);
      expect(updated.smart_score?.seasoning_cap).toBe(7.0);
    });

    it('does not artificially elevate poor scores to seasoning caps', () => {
      const lowYoungFund = createMockFund({
        history_years: 0.5,
        smart_score: {
          overall: 3.5,
          seasoning_cap: null,
          pillars: {
            performance: { score: 3.0 },
            track_record: { score: 4.0 },
            risk: { score: 3.0 },
            cost: { score: 4.0 }
          } as any
        }
      });

      const [updated] = recalculateSmartScoresForMood([lowYoungFund], 'growth');
      expect(updated.smart_score?.overall).toBeLessThan(5.8);
      expect(updated.smart_score?.seasoning_cap).toBe(5.8);
    });

    it('allows seasoned funds (>= 3 years) to retain uncapped scores', () => {
      const seasonedFund = createMockFund({
        history_years: 5.5,
        smart_score: {
          overall: 9.2,
          seasoning_cap: null,
          pillars: {
            performance: { score: 9.2 },
            track_record: { score: 9.0 },
            risk: { score: 9.0 },
            cost: { score: 9.0 }
          } as any
        }
      });

      const [updated] = recalculateSmartScoresForMood([seasonedFund], 'growth');
      expect(updated.smart_score?.overall).toBe(9.1);
      expect(updated.smart_score?.seasoning_cap).toBeNull();
    });
  });

  describe('Category Re-ranking', () => {
    it('accurately ranks funds within their respective categories and builds rank text', () => {
      const fundA = createMockFund({
        code: '1',
        category: 'Large Cap',
        history_years: 5.0,
        smart_score: {
          overall: 0,
          pillars: { performance: { score: 8.0 }, track_record: { score: 8.0 }, risk: { score: 8.0 }, cost: { score: 8.0 } } as any
        }
      });
      const fundB = createMockFund({
        code: '2',
        category: 'Large Cap',
        history_years: 5.0,
        smart_score: {
          overall: 0,
          pillars: { performance: { score: 9.0 }, track_record: { score: 9.0 }, risk: { score: 9.0 }, cost: { score: 9.0 } } as any
        }
      });
      const fundC = createMockFund({
        code: '3',
        category: 'Small Cap',
        history_years: 5.0,
        smart_score: {
          overall: 0,
          pillars: { performance: { score: 7.0 }, track_record: { score: 7.0 }, risk: { score: 7.0 }, cost: { score: 7.0 } } as any
        }
      });

      const results = recalculateSmartScoresForMood([fundA, fundB, fundC], 'growth');
      const rankedB = results.find(f => f.code === '2');
      const rankedA = results.find(f => f.code === '1');
      const rankedC = results.find(f => f.code === '3');

      expect((rankedB?.smart_score as any)?.rank_in_category).toBe(1);
      expect((rankedB?.smart_score as any)?.rank_text).toBe('1st of 2 Large Cap funds');

      expect((rankedA?.smart_score as any)?.rank_in_category).toBe(2);
      expect((rankedA?.smart_score as any)?.rank_text).toBe('2nd of 2 Large Cap funds');

      expect((rankedC?.smart_score as any)?.rank_in_category).toBe(1);
      expect((rankedC?.smart_score as any)?.rank_text).toBe('1st of 1 Small Cap funds');
    });
  });

  describe('Score Themes & Helpers', () => {
    it('returns Elite for score >= 8.5', () => {
      expect(getSuperScoreTheme(8.7).label).toBe('Elite');
    });

    it('returns Solid for score between 7.0 and 8.4', () => {
      expect(getSuperScoreTheme(7.2).label).toBe('Solid');
    });

    it('returns Par for score between 5.5 and 6.9', () => {
      expect(getSuperScoreTheme(6.0).label).toBe('Par');
    });

    it('returns Lag for score < 5.5', () => {
      expect(getSuperScoreTheme(4.8).label).toBe('Lag');
    });

    it('formats ordinal suffixes correctly', () => {
      expect(getOrdinalSuffix(1)).toBe('st');
      expect(getOrdinalSuffix(2)).toBe('nd');
      expect(getOrdinalSuffix(3)).toBe('rd');
      expect(getOrdinalSuffix(4)).toBe('th');
      expect(getOrdinalSuffix(11)).toBe('th');
      expect(getOrdinalSuffix(12)).toBe('th');
      expect(getOrdinalSuffix(13)).toBe('th');
      expect(getOrdinalSuffix(21)).toBe('st');
      expect(getOrdinalSuffix(22)).toBe('nd');
      expect(getOrdinalSuffix(23)).toBe('rd');
    });
  });
});
