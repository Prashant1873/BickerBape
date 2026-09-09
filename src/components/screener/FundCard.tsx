'use client';

import React from 'react';
import { FundSummary } from '@/types/fund';
import { useScreener } from '@/context/ScreenerContext';
import { getSuperScoreTheme } from '@/lib/smartscore';
import { AmcBadge } from '@/components/common/AmcBadge';
import { InfoBadge, GLOSSARY } from '@/components/common/InfoBadge';

interface FundCardProps {
  fund: FundSummary;
}

export const FundCard: React.FC<FundCardProps> = ({ fund }) => {
  const {
    comparisonList,
    toggleComparison,
    setSelectedFundCode,
    isInBucket,
    addToBucket,
    removeFromBucket
  } = useScreener();

  const isCompared = comparisonList.includes(fund.code);
  const inBucket = isInBucket(fund.code);
  const score = fund.smart_score?.overall ?? (fund.suggester_score ? fund.suggester_score / 10 : 6.0);
  const theme = getSuperScoreTheme(score);

  const handleCardClick = () => {
    setSelectedFundCode(fund.code);
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleComparison(fund.code);
  };

  const handleSimSimClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inBucket) {
      removeFromBucket(fund.code);
    } else {
      addToBucket(fund.code);
    }
  };

  // Conic ring color based on score
  const ringColor = score >= 8.0 ? '#36B37E' : score >= 6.5 ? '#2563EB' : score >= 5.0 ? '#FF9F0A' : '#FF5630';
  const scorePct = Math.min(100, Math.max(0, Math.round(score * 10)));

  return (
    <div
      onClick={handleCardClick}
      className="card-interactive group p-4 sm:p-5 cursor-pointer relative flex flex-col justify-between select-none touch-spring"
      tabIndex={0}
      role="button"
      aria-label={`View details for ${fund.name}`}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleCardClick()}
    >
      <div>
        {/* Card Header: Circular Conic SmartScore Gauge & Compare Toggle */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          {/* SmartScore™ Circular Conic Gauge & Rank */}
          <div className="flex items-center gap-3">
            <div
              className="smartscore-gauge"
              style={{
                background: `conic-gradient(${ringColor} ${scorePct}%, var(--color-surface-container, #edeef0) 0deg)`,
              }}
              title={`SmartScore™: ${score.toFixed(1)}/10 (${theme.label})`}
            >
              <span className="gauge-value" style={{ color: ringColor }}>
                {score.toFixed(1)}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-on-surface-variant/80 leading-none">
                SmartScore™
              </span>
              {fund.smart_score && (fund.smart_score as any).rank_text ? (
                <span className="text-[11px] font-bold text-primary truncate max-w-[130px] sm:max-w-[150px] mt-0.5" title={(fund.smart_score as any).rank_text}>
                  {(fund.smart_score as any).rank_text.split(' of ')[0]}
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-on-surface-variant mt-0.5">
                  {theme.label}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons: SimSim & Compare */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Quick SimSim Bucket Toggle */}
            <button
              type="button"
              onClick={handleSimSimClick}
              className={`min-h-[36px] px-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 touch-spring border shadow-2xs cursor-pointer ${
                inBucket
                  ? 'bg-[#00F090] text-black border-[#00F090] font-extrabold shadow-sm'
                  : 'bg-surface-container-low/70 border-surface-container text-on-surface-variant hover:text-[#00F090] hover:border-[#00F090]/40 hover:bg-surface-container'
              }`}
              aria-label={inBucket ? `Remove ${fund.name} from SimSim` : `Add ${fund.name} to SimSim`}
              title={inBucket ? 'Remove from SimSim portfolio bucket' : 'Add to SimSim portfolio bucket'}
            >
              <span className="material-symbols-outlined text-sm leading-none">
                {inBucket ? 'check' : 'hourglass_top'}
              </span>
              <span className="text-[11px] hidden sm:inline">{inBucket ? 'In SimSim' : 'SimSim'}</span>
            </button>

            {/* Quick Compare Button */}
            <button
              type="button"
              onClick={handleCompareClick}
              className={`min-h-[36px] px-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 touch-spring border shadow-2xs cursor-pointer ${
                isCompared
                  ? 'bg-primary text-white border-primary shadow-xs'
                  : 'bg-surface-container-low/70 border-surface-container text-on-surface-variant hover:text-on-surface hover:border-primary/30 hover:bg-surface-container'
              }`}
              aria-label={isCompared ? `Remove ${fund.name} from comparison` : `Add ${fund.name} to comparison`}
              title={isCompared ? 'Remove from comparison' : 'Add to comparison'}
            >
              <span className="material-symbols-outlined text-sm leading-none">
                {isCompared ? 'check' : 'add'}
              </span>
              <span className="text-[11px] hidden sm:inline">{isCompared ? 'Added' : 'Compare'}</span>
            </button>
          </div>
        </div>

        {/* Fund Identity */}
        <div className="mb-3.5">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <AmcBadge fundHouse={fund.fund_house} size="sm" />
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant">
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
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant">1Y CAGR</span>
              <InfoBadge term="1Y CAGR" definition={GLOSSARY['1Y CAGR']} />
            </div>
            <span className={`font-bold text-xs tabular-nums ${fund.cagr_1y && fund.cagr_1y >= 0 ? 'text-gain' : 'text-loss'}`}>
              {fund.cagr_1y !== null && fund.cagr_1y !== undefined ? `${fund.cagr_1y > 0 ? '+' : ''}${fund.cagr_1y.toFixed(1)}%` : 'N/A'}
            </span>
          </div>

          <div>
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant">3Y CAGR</span>
              <InfoBadge term="3Y CAGR" definition={GLOSSARY['3Y CAGR']} />
            </div>
            <span className={`font-bold text-xs tabular-nums ${fund.cagr_3y && fund.cagr_3y >= 0 ? 'text-gain' : 'text-loss'}`}>
              {fund.cagr_3y !== null && fund.cagr_3y !== undefined ? `${fund.cagr_3y > 0 ? '+' : ''}${fund.cagr_3y.toFixed(1)}%` : 'N/A'}
            </span>
            {fund.ratio_3y && (
              <span className="block text-[9px] font-bold text-primary tabular-nums">
                {fund.ratio_3y}x cat
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant">5Y CAGR</span>
              <InfoBadge term="5Y CAGR" definition={GLOSSARY['5Y CAGR']} />
            </div>
            <span className={`font-bold text-xs tabular-nums ${fund.cagr_5y && fund.cagr_5y >= 0 ? 'text-gain' : 'text-loss'}`}>
              {fund.cagr_5y !== null && fund.cagr_5y !== undefined ? `${fund.cagr_5y > 0 ? '+' : ''}${fund.cagr_5y.toFixed(1)}%` : 'N/A'}
            </span>
            {fund.ratio_5y && (
              <span className="block text-[9px] font-medium text-on-surface-variant tabular-nums">
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
            <span className="text-[10px] px-1 py-0.2 rounded bg-surface-container tabular-nums font-semibold">
              {fund.manager_tenure_years.toFixed(0)}y
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 tabular-nums flex-shrink-0">
          {fund.expense_ratio !== null && fund.expense_ratio !== undefined && (
            <span className="flex items-center gap-0.5">
              <InfoBadge term="TER" definition={GLOSSARY['TER']} />
              <span className="ml-0.5">TER: <strong className="text-on-surface font-bold">{fund.expense_ratio.toFixed(2)}%</strong></span>
            </span>
          )}
          {fund.sharpe_ratio !== null && fund.sharpe_ratio !== undefined && (
            <span className="flex items-center gap-0.5">
              <InfoBadge term="Sharpe" definition={GLOSSARY['Sharpe']} />
              <span className="ml-0.5">Sh: <strong className="text-on-surface font-bold">{fund.sharpe_ratio.toFixed(2)}</strong></span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
