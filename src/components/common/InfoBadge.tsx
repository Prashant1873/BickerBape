'use client';

import React, { useState, useRef, useEffect } from 'react';

interface InfoBadgeProps {
  term: string;
  definition: string;
  className?: string;
}

/**
 * Small `i` button that opens a plain-English popover for a financial term.
 * Closes on outside-click or Escape.
 */
export const InfoBadge: React.FC<InfoBadgeProps> = ({ term, definition, className = '' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  return (
    <div ref={ref} className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(p => !p); }}
        className="w-3.5 h-3.5 rounded-full bg-on-surface-variant/15 hover:bg-primary/20 text-on-surface-variant hover:text-primary flex items-center justify-center text-[8px] font-black leading-none transition-colors cursor-pointer flex-shrink-0 border border-on-surface-variant/20 hover:border-primary/40"
        aria-label={`What is ${term}?`}
        title={`What is ${term}?`}
      >
        i
      </button>

      {open && (
        <div
          className="absolute bottom-full left-0 mb-1.5 z-[200] w-60 p-3 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xl text-[11px] text-on-surface animate-in fade-in zoom-in-95 duration-100"
          role="tooltip"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-black text-primary text-xs">{term}</span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setOpen(false); }}
              className="text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-xs">close</span>
            </button>
          </div>
          <p className="text-on-surface-variant leading-relaxed">{definition}</p>
        </div>
      )}
    </div>
  );
};

/** Glossary of every jargon term used in the platform */
export const GLOSSARY: Record<string, string> = {
  // SmartScore
  'SmartScore™': "BickerBape's composite institutional rating (0–10) combining rolling returns, risk-adjusted performance, cost efficiency, and track record seasoning across four weighted pillars.",

  // CAGR variants (FundCard labels)
  'CAGR': 'Compounded Annual Growth Rate — the annualised rate at which an investment has grown, assuming profits were reinvested each year.',
  '1Y CAGR': 'Compounded Annual Growth Rate over the past 1 year. Short-term; can be heavily influenced by recent market conditions.',
  '3Y CAGR': 'Compounded Annual Growth Rate over the past 3 years. Covers at least one market correction, making it more reliable than 1Y.',
  '5Y CAGR': 'Compounded Annual Growth Rate over the past 5 years. Covers a full market cycle (bull + bear), the minimum horizon for meaningful equity fund assessment.',
  '10Y CAGR': 'Compounded Annual Growth Rate over 10 years. Best metric to judge consistency through multiple market cycles.',

  // KPI catalog column labels
  '1Y Return': 'Trailing 1-year absolute return. Short-term signal — useful for recency, but don\'t pick a fund on this alone.',
  '3Y Ret & Ratio': '3-year Compounded Annual Growth Rate paired with the outperformance ratio vs. the category average. Shows both returns AND how much better than peers.',
  '5Y Ret & Ratio': '5-year Compounded Annual Growth Rate paired with the outperformance ratio vs. the category average. A 5-year window covers a full market cycle.',
  '3Y Rolling Avg': 'Average of all possible 3-year CAGR periods within the data window. Smooths lucky/unlucky start dates and reveals true consistency.',
  '3M Growth': 'Last 3-month return. A recent momentum signal — not a selection criterion on its own.',
  'Sharpe Ratio': 'Risk-adjusted return. Measures excess return (above risk-free rate) per unit of total volatility. Higher = better reward for risk taken.',
  'Sortino Ratio': 'Like Sharpe, but only penalises downside volatility (bad risk). Better than Sharpe when you only care about protecting against losses.',
  'Volatility (σ)': 'Annualised standard deviation (σ) of daily returns. Higher volatility = wider swings in portfolio value. Lower is generally safer for conservative investors.',
  'Max Drawdown': 'Peak-to-trough decline in portfolio value. The worst loss experienced from a high point before a new peak was reached.',
  'Beta': "Sensitivity to market movements. Beta = 1 → moves with the index. Beta < 1 → lower swings; > 1 → amplified swings.",
  'Direct TER': 'Total Expense Ratio of the Direct Plan. Annual fee (as % of NAV) charged to manage your money. No distributor commission in Direct = lower TER = higher returns.',
  'Exit Load': 'Redemption penalty charged if you withdraw before a specified holding period (usually 1 year for equity funds). 0% = no lock-in penalty.',
  'AUM (₹ Cr)': 'Assets Under Management in ₹ Crores — total investor money the fund manages. Very large AUM can limit agility in small/mid cap categories.',
  'P/E Ratio': "Price-to-Earnings ratio of the fund's underlying stock portfolio. Lower P/E = cheaper valuation; higher P/E = growth premium or overvaluation risk.",
  'P/B Ratio': "Price-to-Book ratio of the fund's underlying portfolio. Lower P/B = more asset-backed value; higher P/B = intangibles/brand premium.",
  'Manager Tenure': 'Years the current fund manager has run this specific scheme continuously. Longer tenure = more of the track record is attributable to this manager.',

  // Drawer strip labels
  'TER': 'Total Expense Ratio — annual fee (as % of NAV) charged to manage your money. Lower TER means more of your returns stay with you.',
  'AUM': 'Assets Under Management — total market value of all investor money managed. Very large AUM can limit agility in small/mid cap categories.',
  'Turnover': 'Portfolio Turnover Ratio — how frequently the manager buys/sells holdings. High turnover = more churn, taxes, and transaction costs.',
  'Sharpe': 'Sharpe Ratio — excess return per unit of total volatility. Higher = better reward per unit of risk.',
  'Sortino': 'Sortino Ratio — like Sharpe but only counts downside volatility. Better metric when protecting against losses is the priority.',

  // FundCard footer
  'NAV': 'Net Asset Value — the per-unit price of the mutual fund. Changes daily based on the underlying portfolio market value.',

  // SimSim page
  'XIRR': 'Extended Internal Rate of Return — annualised return accounting for the exact timing and size of all cash flows (SIP installments). More accurate than simple CAGR for SIPs.',
  'Drawdown': 'Peak-to-trough decline in portfolio value. Max Drawdown = the worst loss from a peak before a new high was reached.',
  'Alpha': 'Return generated above the benchmark index after accounting for market-level risk. Positive alpha = the manager added genuine value beyond riding the market.',

  // Other
  'SIP': 'Systematic Investment Plan — fixed periodic investment regardless of NAV. Exploits rupee-cost averaging to smooth out market timing risk.',
  'Lumpsum': 'One-time single investment at a fixed NAV, as opposed to periodic SIP installments.',
  'Backtesting': 'Simulating what a portfolio would have returned using historical price data. Results are hypothetical; past performance does not guarantee future returns.',
  'Direct Plan': 'Fund plan without a distributor/agent. No commission = lower TER = higher long-term returns vs. Regular Plan of the same fund.',
  'ELSS': 'Equity Linked Savings Scheme — tax-saving equity fund with a 3-year lock-in, eligible for ₹1.5L deduction under Section 80C.',
  'Cat Avg': 'Category Average — the median performance of all funds in the same SEBI category. A ratio > 1x means this fund beat its peers.',
  'Category Ratio': "This fund's CAGR divided by the category average CAGR. A ratio of 1.3x means the fund returned 30% more than its peers in that period.",
};
