'use client';

import React from 'react';
import { useScreener } from '@/context/ScreenerContext';
import { getSuperScoreTheme } from '@/lib/smartscore';

interface MetricDef {
  label: string;
  category: string;
  getter: (f: any) => number | string | null | undefined;
  format: (v: any) => string;
  best: 'higher' | 'lower' | 'none';
}

const COMPARISON_METRICS: MetricDef[] = [
  {
    label: 'SmartScore™',
    category: 'Rating',
    getter: f => f.smart_score?.overall ?? (f.suggester_score ? f.suggester_score / 10 : 0),
    format: v => v ? `${Number(v).toFixed(1)} / 10` : 'N/A',
    best: 'higher'
  },
  {
    label: '3Y CAGR',
    category: 'Returns',
    getter: f => f.cagr_3y,
    format: v => v !== null && v !== undefined ? `${v > 0 ? '+' : ''}${Number(v).toFixed(1)}%` : 'N/A',
    best: 'higher'
  },
  {
    label: '5Y CAGR',
    category: 'Returns',
    getter: f => f.cagr_5y,
    format: v => v !== null && v !== undefined ? `${v > 0 ? '+' : ''}${Number(v).toFixed(1)}%` : 'N/A',
    best: 'higher'
  },
  {
    label: '10Y CAGR',
    category: 'Returns',
    getter: f => f.cagr_10y,
    format: v => v !== null && v !== undefined ? `${v > 0 ? '+' : ''}${Number(v).toFixed(1)}%` : 'N/A',
    best: 'higher'
  },
  {
    label: '1Y CAGR',
    category: 'Returns',
    getter: f => f.cagr_1y,
    format: v => v !== null && v !== undefined ? `${v > 0 ? '+' : ''}${Number(v).toFixed(1)}%` : 'N/A',
    best: 'higher'
  },
  {
    label: '3Y Rolling Return Avg',
    category: 'Returns',
    getter: f => f.rolling_3y_avg,
    format: v => v !== null && v !== undefined ? `${Number(v).toFixed(1)}%` : 'N/A',
    best: 'higher'
  },
  {
    label: 'Sharpe Ratio',
    category: 'Risk',
    getter: f => f.sharpe_ratio,
    format: v => v !== null && v !== undefined ? Number(v).toFixed(2) : 'N/A',
    best: 'higher'
  },
  {
    label: 'Sortino Ratio',
    category: 'Risk',
    getter: f => f.sortino_ratio,
    format: v => v !== null && v !== undefined ? Number(v).toFixed(2) : 'N/A',
    best: 'higher'
  },
  {
    label: 'Annualized Volatility (σ)',
    category: 'Risk',
    getter: f => f.volatility,
    format: v => v !== null && v !== undefined ? `${Number(v).toFixed(1)}%` : 'N/A',
    best: 'lower'
  },
  {
    label: 'Max Drawdown',
    category: 'Risk',
    getter: f => f.max_drawdown,
    format: v => v !== null && v !== undefined ? `-${Math.abs(Number(v)).toFixed(1)}%` : 'N/A',
    best: 'lower'
  },
  {
    label: 'Direct TER (Expense Ratio)',
    category: 'Cost',
    getter: f => f.expense_ratio,
    format: v => v !== null && v !== undefined ? `${Number(v).toFixed(2)}%` : 'N/A',
    best: 'lower'
  },
  {
    label: 'AUM (₹ Crores)',
    category: 'Size',
    getter: f => f.aum_cr,
    format: v => v !== null && v !== undefined ? `₹${Number(v).toLocaleString()} Cr` : 'N/A',
    best: 'none'
  },
  {
    label: 'Portfolio P/E Ratio',
    category: 'Valuation',
    getter: f => f.pe_ratio,
    format: v => v !== null && v !== undefined ? Number(v).toFixed(1) : 'N/A',
    best: 'none'
  },
  {
    label: 'Manager Tenure',
    category: 'Fiduciary',
    getter: f => f.manager_tenure_years,
    format: v => v !== null && v !== undefined ? `${Number(v).toFixed(1)} Years` : 'N/A',
    best: 'higher'
  }
];

export const ComparisonMatrixModal: React.FC = () => {
  const {
    isComparisonMatrixOpen,
    setIsComparisonMatrixOpen,
    comparisonList,
    funds,
    toggleComparison
  } = useScreener();

  if (!isComparisonMatrixOpen) return null;

  const comparedFunds = comparisonList
    .map(code => funds.find(f => f.code === code))
    .filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-surface rounded-3xl border border-surface-container max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-surface-container flex items-center justify-between bg-surface-container-low flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-xl">difference</span>
            </div>
            <div>
              <h3 className="font-headline-md font-bold text-base sm:text-lg text-on-surface">
                Scheme Comparison Matrix
              </h3>
              <p className="text-xs text-on-surface-variant">
                Side-by-side institutional scorecard for {comparedFunds.length} selected funds
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsComparisonMatrixOpen(false)}
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center touch-spring"
            aria-label="Close matrix modal"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Matrix Table Body */}
        <div className="p-4 sm:p-6 overflow-x-auto overflow-y-auto hide-scrollbar flex-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-surface-container text-on-surface">
                {/* Metric Label Column */}
                <th className="py-3 px-3 min-w-[170px] bg-surface font-bold uppercase text-[11px] text-on-surface-variant">
                  Quantitative Metric
                </th>

                {/* Fund Columns */}
                {comparedFunds.map(fund => {
                  const score = fund!.smart_score?.overall ?? 6.0;
                  const theme = getSuperScoreTheme(score);
                  return (
                    <th key={String(fund!.code)} className="py-3 px-3 min-w-[180px] align-top bg-surface-container-low/40 rounded-t-xl">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded-md border ${theme.badgeBg} ${theme.badgeBorder} ${theme.badgeText}`}>
                          {score.toFixed(1)}/10
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleComparison(fund!.code)}
                          className="w-6 h-6 rounded-full hover:bg-surface-container text-on-surface-variant hover:text-error flex items-center justify-center"
                          title="Remove from matrix"
                        >
                          <span className="material-symbols-outlined text-xs">close</span>
                        </button>
                      </div>
                      <h4 className="font-bold text-on-surface text-xs leading-snug line-clamp-2">
                        {fund!.name}
                      </h4>
                      <div className="text-[10px] text-on-surface-variant font-mono mt-0.5">
                        {fund!.category}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-surface-container/60">
              {COMPARISON_METRICS.map(metric => {
                // Determine best value among funds for highlighting
                const rawValues = comparedFunds.map(f => {
                  const v = metric.getter(f);
                  return typeof v === 'number' && !isNaN(v) ? v : null;
                });

                let bestVal: number | null = null;
                const validVals = rawValues.filter((v): v is number => v !== null);
                if (validVals.length > 0) {
                  if (metric.best === 'higher') bestVal = Math.max(...validVals);
                  else if (metric.best === 'lower') bestVal = Math.min(...validVals);
                }

                return (
                  <tr key={metric.label} className="hover:bg-surface-container-low/40">
                    <td className="py-2.5 px-3 font-semibold text-on-surface text-xs">
                      <div>{metric.label}</div>
                      <span className="text-[10px] font-mono uppercase text-on-surface-variant/70">
                        {metric.category}
                      </span>
                    </td>

                    {comparedFunds.map((fund, idx) => {
                      const val = metric.getter(fund);
                      const isBest = bestVal !== null && typeof val === 'number' && val === bestVal && validVals.length > 1;
                      return (
                        <td
                          key={String(fund!.code)}
                          className={`py-2.5 px-3 font-mono text-xs ${
                            isBest
                              ? 'bg-gain/10 text-gain-text dark:text-emerald-400 font-bold'
                              : 'text-on-surface'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span>{metric.format(val)}</span>
                            {isBest && (
                              <span className="text-[9px] font-bold uppercase px-1 py-0.2 rounded bg-gain/20 text-gain font-mono">
                                Best
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-surface-container bg-surface-container-low flex items-center justify-between flex-shrink-0">
          <span className="text-xs text-on-surface-variant">
            <span className="text-gain font-bold">Green highlight</span> denotes institutional best-in-class within comparison set.
          </span>
          <button
            type="button"
            onClick={() => setIsComparisonMatrixOpen(false)}
            className="min-h-[44px] px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-xs hover:bg-primary-container touch-spring"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
