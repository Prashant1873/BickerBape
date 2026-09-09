'use client';

import React from 'react';
import { FundSummary } from '@/types/fund';
import { useScreener } from '@/context/ScreenerContext';
import { getSuperScoreTheme } from '@/lib/smartscore';

interface FundCardProps {
  fund: FundSummary;
}

export const FundCard: React.FC<FundCardProps> = ({ fund }) => {
  const {
    comparisonList,
    toggleComparison,
    setSelectedFundCode
  } = useScreener();

  const isCompared = comparisonList.includes(fund.code);
  const score = fund.smart_score?.overall ?? (fund.suggester_score ? fund.suggester_score / 10 : 6.0);
  const theme = getSuperScoreTheme(score);

  const handleCardClick = () => {
    setSelectedFundCode(fund.code);
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleComparison(fund.code);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group p-4 sm:p-5 rounded-2xl bg-surface-container-lowest border border-surface-container hover:border-primary/40 hover:shadow-md transition-all cursor-pointer relative flex flex-col justify-between select-none touch-spring"
      tabIndex={0}
      role="button"
      aria-label={`View details for ${fund.name}`}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleCardClick()}
    >
      <div>
        {/* Card Header: SuperScore Badge & Compare Toggle */}
        <div className="flex items-start justify-between gap-3 mb-3">
          {/* SuperScore™ Scorecard Pill */}
          <div className="flex items-center gap-2">
            <div
              className={`px-2.5 py-1 rounded-xl border flex items-center gap-1.5 shadow-2xs ${theme.badgeBg} ${theme.badgeBorder}`}
              title={`SmartScore™: ${score.toFixed(1)}/10 (${theme.label})`}
            >
              <span className="material-symbols-outlined text-sm leading-none text-primary">
                stars
              </span>
              <span className={`font-mono font-black text-sm leading-none ${theme.badgeText}`}>
                {score.toFixed(1)}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/80">
                /10
              </span>
            </div>

            {/* Rank in Category */}
            {fund.smart_score && (fund.smart_score as any).rank_text && (
              <span className="text-[11px] font-medium text-on-surface-variant truncate max-w-[140px] sm:max-w-[160px]" title={(fund.smart_score as any).rank_text}>
                {(fund.smart_score as any).rank_text.split(' of ')[0]}
              </span>
            )}
          </div>

          {/* Quick Compare Button (Fitts's Law: 44x44px Touch Target) */}
          <button
            type="button"
            onClick={handleCompareClick}
            className={`min-h-[38px] px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 touch-spring border ${
              isCompared
                ? 'bg-primary text-white border-primary shadow-xs'
                : 'bg-surface-container-low border-surface-container text-on-surface-variant hover:text-on-surface hover:border-primary/30'
            }`}
            aria-label={isCompared ? `Remove ${fund.name} from comparison` : `Add ${fund.name} to comparison`}
            title={isCompared ? 'Remove from comparison' : 'Add to comparison'}
          >
            <span className="material-symbols-outlined text-base">
              {isCompared ? 'check' : 'add'}
            </span>
            <span className="text-[11px]">{isCompared ? 'Added' : 'Compare'}</span>
          </button>
        </div>

        {/* Fund Identity */}
        <div className="mb-3.5">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-mono">
              {fund.category}
            </span>
            {fund.is_young_fund && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-warning/15 text-warning-text border border-warning/30" title="Scheme <3Y track record seasoning cap applied">
                Young (&lt;3Y)
              </span>
            )}
          </div>
          <h3 className="font-headline-md font-bold text-sm text-on-surface line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {fund.name}
          </h3>
          <p className="text-xs text-on-surface-variant mt-0.5 truncate">
            {fund.fund_house}
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-surface-container-low/60 border border-surface-container mb-3 text-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-on-surface-variant block">1Y CAGR</span>
            <span className={`font-mono font-bold text-xs ${fund.cagr_1y && fund.cagr_1y >= 0 ? 'text-gain' : 'text-loss'}`}>
              {fund.cagr_1y !== null && fund.cagr_1y !== undefined ? `${fund.cagr_1y > 0 ? '+' : ''}${fund.cagr_1y.toFixed(1)}%` : 'N/A'}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-on-surface-variant block">3Y CAGR</span>
            <span className={`font-mono font-bold text-xs ${fund.cagr_3y && fund.cagr_3y >= 0 ? 'text-gain' : 'text-loss'}`}>
              {fund.cagr_3y !== null && fund.cagr_3y !== undefined ? `${fund.cagr_3y > 0 ? '+' : ''}${fund.cagr_3y.toFixed(1)}%` : 'N/A'}
            </span>
            {fund.ratio_3y && (
              <span className="block text-[9px] font-bold text-primary font-mono">
                {fund.ratio_3y}x cat
              </span>
            )}
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-on-surface-variant block">5Y CAGR</span>
            <span className={`font-mono font-bold text-xs ${fund.cagr_5y && fund.cagr_5y >= 0 ? 'text-gain' : 'text-loss'}`}>
              {fund.cagr_5y !== null && fund.cagr_5y !== undefined ? `${fund.cagr_5y > 0 ? '+' : ''}${fund.cagr_5y.toFixed(1)}%` : 'N/A'}
            </span>
            {fund.ratio_5y && (
              <span className="block text-[9px] font-medium text-on-surface-variant font-mono">
                {fund.ratio_5y}x cat
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer: Fiduciary & Cost Highlights */}
      <div className="flex items-center justify-between pt-2 border-t border-surface-container/60 text-[11px] text-on-surface-variant">
        <div className="flex items-center gap-1.5 truncate">
          <span className="material-symbols-outlined text-xs">person</span>
          <span className="truncate max-w-[120px]" title={fund.manager || 'AMC Team'}>
            {fund.manager ? fund.manager.split(',')[0] : 'AMC Team'}
          </span>
          {fund.manager_tenure_years && (
            <span className="font-mono text-[10px] px-1 py-0.2 rounded bg-surface-container">
              {fund.manager_tenure_years.toFixed(0)}y
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 font-mono flex-shrink-0">
          {fund.expense_ratio !== null && fund.expense_ratio !== undefined && (
            <span title="Direct Expense Ratio (TER)">
              TER: <strong className="text-on-surface">{fund.expense_ratio.toFixed(2)}%</strong>
            </span>
          )}
          {fund.sharpe_ratio !== null && fund.sharpe_ratio !== undefined && (
            <span title="Sharpe Ratio">
              Sh: <strong className="text-on-surface">{fund.sharpe_ratio.toFixed(2)}</strong>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
