'use client';

import React, { useState, useEffect } from 'react';
import { SimulationReport } from '@/lib/simsim-engine';
import { InfoBadge, GLOSSARY } from '@/components/common/InfoBadge';
import { SimSimSummarySkeleton } from './SimSimSummarySkeleton';

interface SimSimSummaryCardsProps {
  report: SimulationReport | null;
  loading: boolean;
  capital: number;
  onUpdateCapital: (newCapital: number) => void;
}

export const SimSimSummaryCards: React.FC<SimSimSummaryCardsProps> = ({
  report,
  loading,
  capital,
  onUpdateCapital
}) => {
  const [isEditingCapital, setIsEditingCapital] = useState(false);
  const [capitalInputVal, setCapitalInputVal] = useState(capital);

  useEffect(() => {
    setCapitalInputVal(capital);
  }, [capital]);

  if (loading || !report) {
    return <SimSimSummarySkeleton />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Present Value */}
      <div className="simsim-kpi-card simsim-kpi-emerald p-4">
        <div className="flex items-center justify-between text-on-surface-variant mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider">Simulated Present Value</span>
          <div className="w-7 h-7 rounded-lg bg-gain-bg border border-gain/30 flex items-center justify-center text-gain-text">
            <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
          </div>
        </div>
        <p className="font-display-financial text-2xl font-black simsim-neon-headline">
          ₹{Math.round(report.presentValue).toLocaleString('en-IN')}
        </p>
        <p className={`text-[11px] font-medium ${report.totalGain >= 0 ? 'text-gain-text' : 'text-loss-text'} mt-1 flex items-center gap-1`}>
          <span>{report.totalGain >= 0 ? '▲' : '▼'} ₹{Math.abs(Math.round(report.totalGain)).toLocaleString('en-IN')}</span>
          <span className="text-[10px] text-on-surface-variant">({report.totalGainPct >= 0 ? '+' : ''}{report.totalGainPct.toFixed(2)}%)</span>
        </p>
      </div>

      {/* KPI 2: Annualized CAGR / XIRR */}
      <div className="simsim-kpi-card simsim-kpi-cyan p-4">
        <div className="flex items-center justify-between text-on-surface-variant mb-1.5">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {report.type === 'lumpsum' ? 'Annualized CAGR' : 'Annualized XIRR'}
            </span>
            <InfoBadge
              term={report.type === 'lumpsum' ? 'CAGR' : 'XIRR'}
              definition={GLOSSARY[report.type === 'lumpsum' ? 'CAGR' : 'XIRR']}
            />
          </div>
          <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-sm">trending_up</span>
          </div>
        </div>
        <p className="font-display-financial text-2xl font-black text-on-surface dark:text-white">
          {report.cagr.toFixed(2)}%
        </p>
        <p className={`text-[11px] font-medium ${report.alpha >= 0 ? 'text-primary' : 'text-loss-text'} mt-1`}>
          {report.alpha >= 0 ? '+' : ''}{report.alpha.toFixed(2)}% Alpha vs Nifty 50 TRI
        </p>
      </div>

      {/* KPI 3: Max Drawdown */}
      <div className="simsim-kpi-card simsim-kpi-crimson p-4">
        <div className="flex items-center justify-between text-on-surface-variant mb-1.5">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Max Drawdown</span>
            <InfoBadge term="Drawdown" definition={GLOSSARY['Drawdown']} />
          </div>
          <div className="w-7 h-7 rounded-lg bg-loss-bg border border-loss/30 flex items-center justify-center text-loss-text">
            <span className="material-symbols-outlined text-sm">shield</span>
          </div>
        </div>
        <p className="font-display-financial text-2xl font-black text-loss-text">
          {report.maxDrawdown > 0 ? `-${report.maxDrawdown.toFixed(2)}%` : '0.00%'}
        </p>
        <p className="text-[11px] text-on-surface-variant mt-1">Worst peak-to-trough drop</p>
      </div>

      {/* KPI 4: Total Invested (Interactive inline edit) */}
      <div
        onClick={() => setIsEditingCapital(true)}
        className="simsim-kpi-card simsim-kpi-amber p-4 cursor-pointer group select-none"
        title="Click to edit total invested capital"
      >
        <div className="flex items-center justify-between text-on-surface-variant mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-warning-text">Total Invested</span>
            <span className="material-symbols-outlined text-xs text-warning-text opacity-0 group-hover:opacity-100 transition-opacity">edit</span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-warning-bg border border-warning/30 flex items-center justify-center text-warning-text">
            <span className="material-symbols-outlined text-sm">savings</span>
          </div>
        </div>

        {isEditingCapital ? (
          <div
            onClick={(e) => e.stopPropagation()}
            className="space-y-2 mt-1"
          >
            <div className="flex items-center gap-1">
              <span className="text-on-surface dark:text-white font-bold text-xs">₹</span>
              <input
                type="number"
                min="1000"
                step="5000"
                value={capitalInputVal}
                onChange={(e) => setCapitalInputVal(Number(e.target.value))}
                className="w-full bg-surface-container dark:bg-[#080C14] border border-warning/60 rounded-lg py-1 px-2 text-xs text-on-surface dark:text-white font-bold tabular-nums outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  onUpdateCapital(Math.max(1000, capitalInputVal));
                  setIsEditingCapital(false);
                }}
                className="px-2.5 py-1 rounded-lg bg-warning-text text-white font-bold text-[11px] cursor-pointer hover:opacity-90 transition-opacity"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditingCapital(false)}
                className="p-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Capital Preset Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              {[
                { label: '₹1L', val: 100000 },
                { label: '₹2.5L', val: 250000 },
                { label: '₹5L', val: 500000 },
                { label: '₹10L', val: 1000000 }
              ].map(chip => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => {
                    onUpdateCapital(chip.val);
                    setCapitalInputVal(chip.val);
                    setIsEditingCapital(false);
                  }}
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-surface-container hover:bg-warning-bg hover:text-warning-text text-on-surface border border-surface-container-high dark:border-white/10 touch-spring"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-baseline gap-2">
              <p className="font-display-financial text-2xl font-black text-on-surface dark:text-white tabular-nums">
                ₹{Math.round(report.totalCapital).toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] text-warning-text opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                Edit
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant mt-1">
              {report.type === 'lumpsum' ? 'One-time principal • Click to edit' : `${report.installmentsCount || 0} monthly SIP installments`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
