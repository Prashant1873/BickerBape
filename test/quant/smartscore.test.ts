import { describe, it, expect } from 'vitest';
import {
  recalculateSmartScoresForMood,
  getOrdinalSuffix,
  getSuperScoreTheme,
  MOOD_WEIGHTS,
} from '@/lib/smartscore';
import { FundSummary } from '@/types/fund';

describe('SmartScore Quantitative Engine', () => {
  describe('getOrdinalSuffix', () => {
    it('handles standard ordinal numbers correctly', () => {
      expect(getOrdinalSuffix(1)).toBe('st');
      expect(getOrdinalSuffix(2)).toBe('nd');
      expect(getOrdinalSuffix(3)).toBe('rd');
      expect(getOrdinalSuffix(4)).toBe('th');
      expect(getOrdinalSuffix(10)).toBe('th');
    });

    it('handles teen numbers (11th, 12th, 13th exception) correctly', () => {
      expect(getOrdinalSuffix(11)).toBe('th');
      expect(getOrdinalSuffix(12)).toBe('th');
      expect(getOrdinalSuffix(13)).toBe('th');
      expect(getOrdinalSuffix(111)).toBe('th');
      expect(getOrdinalSuffix(112)).toBe('th');
      expect(getOrdinalSuffix(113)).toBe('th');
    });

    it('handles numbers ending in 21st, 22nd, 23rd correctly', () => {
      expect(getOrdinalSuffix(21)).toBe('st');
      expect(getOrdinalSuffix(22)).toBe('nd');
      expect(getOrdinalSuffix(23)).toBe('rd');
      expect(getOrdinalSuffix(101)).toBe('st');
    });
  });

  describe('getSuperScoreTheme', () => {
    it('classifies scores into appropriate tier labels', () => {
      expect(getSuperScoreTheme(9.2).label).toBe('Elite');
      expect(getSuperScoreTheme(8.5).label).toBe('Elite');
      expect(getSuperScoreTheme(7.8).label).toBe('Solid');
      expect(getSuperScoreTheme(7.0).label).toBe('Solid');
      expect(getSuperScoreTheme(6.2).label).toBe('Par');
      expect(getSuperScoreTheme(5.5).label).toBe('Par');
      expect(getSuperScoreTheme(4.9).label).toBe('Lag');
      expect(getSuperScoreTheme(2.1).label).toBe('Lag');
    });
  });

  describe('recalculateSmartScoresForMood', () => {
    const createMockFund = (
      code: string,
      name: string,
      category: string,
      historyYears: number,
      pillars?: {
        performance?: { score: number };
        risk?: { score: number };
        cost?: { score: number };
        track_record?: { score: number };
      }
    ): FundSummary => ({
      code,
      name,
      category,
      fund_house: 'Quant AMC',
      history_years: historyYears,
      smart_score: {
        overall: 7.0,
        pillars: (pillars || {
          performance: { score: 8.0 },
          risk: { score: 7.0 },
          cost: { score: 6.0 },
          track_record: { score: 9.0 },
        }) as any,
      },
    });

    it('applies Growth mood weights accurately (perf: 0.45, track: 0.25, risk: 0.20, cost: 0.10)', () => {
      // Raw calculation: (0.45 * 8.0) + (0.20 * 7.0) + (0.10 * 6.0) + (0.25 * 9.0)
      // = 3.6 + 1.4 + 0.6 + 2.25 = 7.85 -> 7.9 or 7.8
      const funds = [
        createMockFund('101', 'Fund A', 'Flexi Cap', 5.0, {
          performance: { score: 8.0 },
          risk: { score: 7.0 },
          cost: { score: 6.0 },
          track_record: { score: 9.0 },
        }),
      ];

      const recalculated = recalculateSmartScoresForMood(funds, 'growth');
      expect(recalculated[0].smart_score?.overall).toBe(7.8);
      expect(recalculated[0].smart_score?.seasoning_cap).toBeNull();
    });

    it('applies Safety mood weights accurately (risk: 0.45, track: 0.25, perf: 0.20, cost: 0.10)', () => {
      // Raw calculation: (0.20 * 8.0) + (0.45 * 7.0) + (0.10 * 6.0) + (0.25 * 9.0)
      // = 1.6 + 3.15 + 0.6 + 2.25 = 7.60 -> 7.6
      const funds = [
        createMockFund('101', 'Fund A', 'Flexi Cap', 5.0, {
          performance: { score: 8.0 },
          risk: { score: 7.0 },
          cost: { score: 6.0 },
          track_record: { score: 9.0 },
        }),
      ];

      const recalculated = recalculateSmartScoresForMood(funds, 'safety');
      expect(recalculated[0].smart_score?.overall).toBe(7.6);
      expect(recalculated[0].smart_score?.seasoning_cap).toBeNull();
    });

    it('applies Income mood weights accurately (cost: 0.35, risk: 0.30, track: 0.20, perf: 0.15)', () => {
      // Raw calculation: (0.15 * 8.0) + (0.30 * 7.0) + (0.35 * 6.0) + (0.20 * 9.0)
      // = 1.2 + 2.1 + 2.1 + 1.8 = 7.20 -> 7.2
      const funds = [
        createMockFund('101', 'Fund A', 'Flexi Cap', 5.0, {
          performance: { score: 8.0 },
          risk: { score: 7.0 },
          cost: { score: 6.0 },
          track_record: { score: 9.0 },
        }),
      ];

      const recalculated = recalculateSmartScoresForMood(funds, 'income');
      expect(recalculated[0].smart_score?.overall).toBe(7.2);
      expect(recalculated[0].smart_score?.seasoning_cap).toBeNull();
    });

    it('enforces strict fiduciary seasoning cap (<1 year history capped at 5.8)', () => {
      const highPillarFund = createMockFund('102', 'New Unseasoned Fund', 'Large Cap', 0.8, {
        performance: { score: 9.5 },
        risk: { score: 9.5 },
        cost: { score: 9.0 },
        track_record: { score: 9.0 },
      });

      const recalculated = recalculateSmartScoresForMood([highPillarFund], 'growth');
      expect(recalculated[0].smart_score?.overall).toBe(5.8);
      expect(recalculated[0].smart_score?.seasoning_cap).toBe(5.8);
    });

    it('enforces strict fiduciary seasoning cap (<3 years history capped at 7.0)', () => {
      const highPillarFund = createMockFund('103', 'Partially Seasoned Fund', 'Large Cap', 2.1, {
        performance: { score: 9.5 },
        risk: { score: 9.5 },
        cost: { score: 9.0 },
        track_record: { score: 9.0 },
      });

      const recalculated = recalculateSmartScoresForMood([highPillarFund], 'growth');
      expect(recalculated[0].smart_score?.overall).toBe(7.0);
      expect(recalculated[0].smart_score?.seasoning_cap).toBe(7.0);
    });

    it('does not artificially inflate low scores with seasoning caps', () => {
      const lowScoreFund = createMockFund('104', 'Weak Young Fund', 'Mid Cap', 0.5, {
        performance: { score: 4.0 },
        risk: { score: 3.0 },
        cost: { score: 4.0 },
        track_record: { score: 4.0 },
      });

      // Raw: (0.45 * 4) + (0.2 * 3) + (0.1 * 4) + (0.25 * 4) = 1.8 + 0.6 + 0.4 + 1.0 = 3.8
      const recalculated = recalculateSmartScoresForMood([lowScoreFund], 'growth');
      expect(recalculated[0].smart_score?.overall).toBe(3.8);
      expect(recalculated[0].smart_score?.seasoning_cap).toBe(5.8);
    });

    it('handles missing or uncalculated pillars gracefully without producing NaN', () => {
      const incompleteFund: FundSummary = {
        code: '105',
        name: 'Incomplete Metrics Fund',
        category: 'Small Cap',
        fund_house: 'Test House',
        smart_score: {
          overall: 0,
          pillars: {} as any,
        },
      };

      const recalculated = recalculateSmartScoresForMood([incompleteFund], 'growth');
      expect(recalculated[0].smart_score?.overall).toBeDefined();
      expect(Number.isNaN(recalculated[0].smart_score?.overall)).toBe(false);
      expect(recalculated[0].smart_score?.overall).toBe(6.0); // 6.0 default baseline
    });

    it('ranks funds within category and sets rank_text correctly', () => {
      const funds = [
        createMockFund('A', 'Alpha Fund', 'Mid Cap', 5.0, {
          performance: { score: 7.0 },
          risk: { score: 7.0 },
          cost: { score: 7.0 },
          track_record: { score: 7.0 },
        }),
        createMockFund('B', 'Beta Fund', 'Mid Cap', 5.0, {
          performance: { score: 9.0 },
          risk: { score: 9.0 },
          cost: { score: 9.0 },
          track_record: { score: 9.0 },
        }),
        createMockFund('C', 'Gamma Fund', 'Large Cap', 5.0, {
          performance: { score: 8.0 },
          risk: { score: 8.0 },
          cost: { score: 8.0 },
          track_record: { score: 8.0 },
        }),
      ];

      const recalculated = recalculateSmartScoresForMood(funds, 'growth');
      const fundB = recalculated.find(f => f.code === 'B');
      const fundA = recalculated.find(f => f.code === 'A');
      const fundC = recalculated.find(f => f.code === 'C');

      expect((fundB?.smart_score as any)?.rank_in_category).toBe(1);
      expect((fundB?.smart_score as any)?.rank_text).toBe('1st of 2 Mid Cap funds');

      expect((fundA?.smart_score as any)?.rank_in_category).toBe(2);
      expect((fundA?.smart_score as any)?.rank_text).toBe('2nd of 2 Mid Cap funds');

      expect((fundC?.smart_score as any)?.rank_in_category).toBe(1);
      expect((fundC?.smart_score as any)?.rank_text).toBe('1st of 1 Large Cap funds');
    });
  });
});
