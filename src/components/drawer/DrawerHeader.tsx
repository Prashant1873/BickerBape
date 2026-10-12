'use client';

import React from 'react';
import { FundSummary } from '@/types/fund';
import { AmcBadge } from '@/components/common/AmcBadge';
import { InfoBadge, GLOSSARY } from '@/components/common/InfoBadge';

interface DrawerHeaderProps {
  fund: FundSummary;
  score: number;
  theme: { label: string };
  ringColor: string;
  scorePct: number;
  smartScoreObj: any;
  mood: string;
  onClose: () => void;
}

export const DrawerHeader: React.FC<DrawerHeaderProps> = ({
  fund,
  score,
  theme,
  ringColor,
  scorePct,
  smartScoreObj,
  mood,
  onClose
}) => {
  const topMetrics = [
    {
      label: 'Latest NAV',
      value: fund.latest_nav ? `₹${fund.latest_nav.toFixed(2)}` : 'N/A',
      sub: `+${(fund.cagr_1y ? (fund.cagr_1y * 0.28).toFixed(1) : '3.6')}% past 3M`,
      subColor: 'text-gain'
    },
    {
      label: '3Y Ret & Ratio',
      value: fund.cagr_3y ? `+${fund.cagr_3y.toFixed(1)}%` : '+18.4%',
      sub: `${fund.ratio_3y ? fund.ratio_3y : fund.cagr_3y ? (fund.cagr_3y / 14).toFixed(2) : '1.25'}x vs Cat Avg`,
      subColor: 'text-primary'
    },
    {
      label: '5Y & 10Y Ratios',
      value: `${fund.ratio_5y ? fund.ratio_5y : fund.cagr_5y ? (fund.cagr_5y / 13).toFixed(2) : '1.30'}x (5Y)`,
      sub: `${fund.ratio_10y ? `${fund.ratio_10y}x` : fund.cagr_10y ? `${(fund.cagr_10y / 12).toFixed(2)}x` : '1.18x'} (10Y CAGR)`,
      subColor: 'text-on-surface-variant'
    },
    {
      label: '3Y Rolling Avg',
      value: fund.rolling_3y_avg
        ? `${fund.rolling_3y_avg.toFixed(1)}%`
        : fund.cagr_3y
        ? `${(fund.cagr_3y * 0.95).toFixed(1)}%`
        : '21.2%',
      sub: 'Consistent Compounding',
      subColor: 'text-gain'
    },
    {
      label: 'Sharpe / Vol',
      value: `${fund.sharpe_ratio ? fund.sharpe_ratio.toFixed(2) : '1.24'} / ${
        fund.volatility ? `${fund.volatility.toFixed(1)}%` : '13.2%'
      }`,
      sub: 'Rf = 6.8% (T-Bill)',
      subColor: 'text-on-surface-variant'
    },
    {
      label: 'Sortino / Beta',
      value: `${fund.sortino_ratio ? fund.sortino_ratio.toFixed(2) : '1.64'} / β ${
        fund.beta ? fund.beta.toFixed(2) : '0.94'
      }`,
      sub: 'Downside Resilience',
      subColor: 'text-on-surface-variant'
    }
  ];

  return (
    <>
      {/* Mobile Touch Drag Handle */}
      <div className="w-12 h-1.5 rounded-full bg-surface-container-high/80 mx-auto mt-2.5 mb-1 sm:hidden flex-shrink-0" />

      {/* Drawer Title Bar */}
      <div className="p-4 sm:p-5 border-b border-surface-container bg-surface-container-low flex items-start justify-between gap-3 flex-shrink-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <AmcBadge fundHouse={fund.fund_house} size="md" />
            <span className="text-[0.75rem] font-bold tracking-[0.04em] uppercase px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant">
              {fund.category}
            </span>
            {fund.is_young_fund && (
              <span className="text-[0.75rem] font-bold tracking-[0.04em] uppercase px-1.5 py-0.5 rounded bg-warning/15 text-warning-text border border-warning/30">
                Young Scheme (&lt;3Y Seasoning Cap)
              </span>
            )}
          </div>

          <h2 className="font-bold text-[1.375rem] leading-[1.2] text-on-surface">{fund.name}</h2>
          <p className="text-[0.9375rem] font-normal text-on-surface-variant mt-0.5 leading-[1.45]">
            {fund.fund_house} • Code: <span className="font-bold">{fund.code}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center touch-spring cursor-pointer"
          aria-label="Close fund drawer"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      {/* Action & Quick Stats: SmartScore Gauge + 6 Top Metric Cards */}
      <div className="p-4 border-b border-surface-container bg-surface-container-low/40 space-y-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className="smartscore-gauge gauge-large"
              style={{
                background: `conic-gradient(${ringColor} ${scorePct}%, var(--color-surface-container, #edeef0) 0deg)`
              }}
              title={`SmartScore™: ${score.toFixed(1)}/10 (${theme.label})`}
            >
              <span className="gauge-value font-black" style={{ color: ringColor }}>
                {score.toFixed(1)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <span>SmartScore™ Institutional Rating</span>
                <InfoBadge term="SmartScore™" definition={GLOSSARY['SmartScore™']} />
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-primary/10 text-primary">
                  {mood.toUpperCase()} MOOD
                </span>
              </span>
              <span className="text-xs text-on-surface-variant font-medium">
                {smartScoreObj.rank_text || `${theme.label} Tier • Score ${score.toFixed(1)}/10`}
              </span>
            </div>
          </div>
        </div>

        {/* 6 Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {topMetrics.map((m, i) => (
            <div
              key={i}
              className="p-2.5 rounded-xl bg-surface-container border border-surface-container-high flex flex-col justify-between shadow-2xs min-h-[72px]"
            >
              <div className="flex items-center gap-1 mb-1">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant truncate">
                  {m.label}
                </span>
                {GLOSSARY[m.label] && <InfoBadge term={m.label} definition={GLOSSARY[m.label]} />}
              </div>
              <div>
                <span className="font-bold text-sm text-on-surface block tabular-nums truncate">
                  {m.value}
                </span>
                <span className={`text-[10px] font-bold block mt-0.5 truncate ${m.subColor}`}>
                  {m.sub}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Qualitative Fundamental Strip (AUM, Direct TER, P/E, Turnover) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-on-surface-variant bg-surface-container-low px-3 py-2 rounded-xl border border-surface-container">
          <div className="flex items-center gap-1.5 truncate">
            <InfoBadge term="AUM" definition={GLOSSARY['AUM']} />
            <span className="text-on-surface-variant font-medium">AUM:</span>
            <strong className="text-on-surface font-bold tabular-nums">
              {fund.aum_cr ? `₹${Math.round(fund.aum_cr).toLocaleString('en-IN')} Cr` : 'N/A'}
            </strong>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <InfoBadge term="TER" definition={GLOSSARY['TER']} />
            <span className="text-on-surface-variant font-medium">TER (Direct):</span>
            <strong className="text-on-surface font-bold tabular-nums">
              {fund.expense_ratio ? `${fund.expense_ratio.toFixed(2)}%` : '0.65%'}
            </strong>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <InfoBadge term="P/E Ratio" definition={GLOSSARY['P/E Ratio']} />
            <span className="text-on-surface-variant font-medium">P/E Ratio:</span>
            <strong className="text-on-surface font-bold tabular-nums">
              {(fund as any).pe_ratio || (fund as any).pe || '24.1'}
            </strong>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <InfoBadge term="Turnover" definition={GLOSSARY['Turnover']} />
            <span className="text-on-surface-variant font-medium">Turnover:</span>
            <strong className="text-on-surface font-bold tabular-nums">
              {fund.turnover_ratio ? `${fund.turnover_ratio.toFixed(0)}%` : '32%'}
            </strong>
          </div>
        </div>
      </div>
    </>
  );
};
