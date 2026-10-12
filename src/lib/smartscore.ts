import { FundSummary, InvestorMood } from '@/types/fund';

export const MOOD_WEIGHTS: Record<InvestorMood, { perf: number; track: number; risk: number; cost: number }> = {
  growth: { perf: 0.45, track: 0.25, risk: 0.20, cost: 0.10 },
  safety: { risk: 0.45, track: 0.25, perf: 0.20, cost: 0.10 },
  income: { cost: 0.35, risk: 0.30, track: 0.20, perf: 0.15 }
};

export const MOOD_CONFIG: Record<InvestorMood, {
  label: string;
  icon: string;
  focus: string;
  tagClass: string;
  color: string;
}> = {
  growth: {
    label: 'Growth',
    icon: 'rocket_launch',
    focus: 'Alpha & Outperformance',
    tagClass: 'bg-primary/10 text-primary border-primary/25',
    color: '#0052cc'
  },
  safety: {
    label: 'Safety',
    icon: 'shield',
    focus: 'Capital Protection',
    tagClass: 'bg-gain/10 text-gain border-gain/25',
    color: '#36B37E'
  },
  income: {
    label: 'Income',
    icon: 'savings',
    focus: 'Cost Efficiency & Stability',
    tagClass: 'bg-warning/10 text-warning border-warning/25',
    color: '#FF9F0A'
  }
};

export function getOrdinalSuffix(num: number): string {
  if (num % 100 >= 11 && num % 100 <= 13) return 'th';
  switch (num % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

/**
 * Dynamically recalibrates SmartScore™ overall score and category ranks based on active Investor Mood.
 * Preserves fiduciary seasoning penalties (<1Y capped at 5.8, <3Y capped at 7.0).
 */
export function recalculateSmartScoresForMood(funds: FundSummary[], mood: InvestorMood): FundSummary[] {
  const w = MOOD_WEIGHTS[mood] || MOOD_WEIGHTS.growth;

  // 1. Recalculate overall weighted score for each fund
  const updatedFunds = funds.map(fund => {
    const p = (fund.smart_score as any)?.pillars || {};
    const spRaw = p.performance?.score !== undefined 
      ? p.performance.score 
      : (typeof p.return_ratios === 'number' ? p.return_ratios : undefined);
    const srRaw = p.risk?.score !== undefined 
      ? p.risk.score 
      : (typeof p.risk_volatility === 'number' ? p.risk_volatility : undefined);
    const scRaw = p.cost?.score !== undefined 
      ? p.cost.score 
      : (typeof p.expense_ratio === 'number' ? p.expense_ratio : undefined);
    const stRaw = p.track_record?.score !== undefined 
      ? p.track_record.score 
      : (typeof p.track_record === 'number' 
        ? p.track_record 
        : (p.track_record_pillar?.score !== undefined ? p.track_record_pillar.score : undefined));

    const baseFallback = (fund.smart_score?.overall && fund.smart_score.overall > 0)
      ? fund.smart_score.overall
      : ((fund.suggester_score && fund.suggester_score > 0) ? fund.suggester_score / 10 : 6.0);

    const sp = spRaw !== undefined ? spRaw : baseFallback;
    const sr = srRaw !== undefined ? srRaw : baseFallback;
    const sc = scRaw !== undefined ? scRaw : baseFallback;
    const st = stRaw !== undefined ? stRaw : baseFallback;

    let raw = (w.perf * sp) + (w.risk * sr) + (w.cost * sc) + (w.track * st);

    // Fiduciary seasoning penalties strictly enforced across all moods
    const age = fund.history_years !== undefined 
      ? fund.history_years 
      : (fund.manager_tenure_years !== undefined ? fund.manager_tenure_years : 3.0);
    let seasoningCap: number | null = null;
    if (age < 1.0) {
      raw = Math.min(5.8, raw);
      seasoningCap = 5.8;
    } else if (age < 3.0) {
      raw = Math.min(7.0, raw);
      seasoningCap = 7.0;
    }

    const overall = parseFloat(raw.toFixed(1));

    const existingPillars = (fund.smart_score as any)?.pillars || {};
    const smart_score = {
      ...(fund.smart_score || {}),
      overall,
      seasoning_cap: seasoningCap,
      pillars: {
        ...existingPillars,
        return_ratios: sp,
        track_record: st,
        risk_volatility: sr,
        expense_ratio: sc,
        performance: existingPillars.performance || { name: 'Performance & Compounding', score: sp },
        risk: existingPillars.risk || { name: 'Risk & Downside Protection', score: sr },
        cost: existingPillars.cost || { name: 'Cost & Direct Plan Fees', score: sc },
        track_record_pillar: existingPillars.track_record_pillar || { name: 'Track Record & Seasoning', score: st }
      } as any
    };

    return {
      ...fund,
      smart_score
    };
  });

  // 2. Re-rank within category
  const catGroups: Record<string, FundSummary[]> = {};
  updatedFunds.forEach(fund => {
    if (!catGroups[fund.category]) catGroups[fund.category] = [];
    catGroups[fund.category].push(fund);
  });

  Object.entries(catGroups).forEach(([catName, cfunds]) => {
    const total = cfunds.length;
    cfunds.sort((a, b) => ((b.smart_score?.overall || 0) - (a.smart_score?.overall || 0)));
    cfunds.forEach((f, idx) => {
      const rk = idx + 1;
      const suffix = getOrdinalSuffix(rk);
      if (f.smart_score) {
        (f.smart_score as any).rank_in_category = rk;
        (f.smart_score as any).total_in_category = total;
        (f.smart_score as any).category_name = catName;
        (f.smart_score as any).rank_text = `${rk}${suffix} of ${total} ${catName} funds`;
      }
    });
  });

  return updatedFunds;
}

/**
 * Returns dynamic color tokens for SuperScore™ cell badges based on score value.
 */
export function getSuperScoreTheme(score: number): {
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  label: string;
} {
  if (score >= 8.5) {
    return {
      badgeBg: 'bg-primary/10 dark:bg-primary/20',
      badgeText: 'text-primary dark:text-[#38bdf8] font-bold',
      badgeBorder: 'border-primary/30',
      label: 'Elite'
    };
  } else if (score >= 7.0) {
    return {
      badgeBg: 'bg-gain-bg dark:bg-gain/20',
      badgeText: 'text-gain-text dark:text-gain-text font-bold',
      badgeBorder: 'border-gain/30',
      label: 'Solid'
    };
  } else if (score >= 5.5) {
    return {
      badgeBg: 'bg-surface-container-high',
      badgeText: 'text-on-surface-variant font-medium',
      badgeBorder: 'border-surface-container',
      label: 'Par'
    };
  } else {
    return {
      badgeBg: 'bg-loss-bg dark:bg-loss/20',
      badgeText: 'text-loss-text dark:text-loss-text font-medium',
      badgeBorder: 'border-loss/30',
      label: 'Lag'
    };
  }
}
