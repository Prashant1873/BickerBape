'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useScreener } from '@/context/ScreenerContext';
import { FundSummary, NavPoint } from '@/types/fund';
import { fetchFundNavHistory } from '@/lib/data-loader';
import { SimSimEngine, SimulationReport } from '@/lib/simsim-engine';
import { MODEL_BASKETS } from '@/lib/simsim-models';
import { AmcBadge } from '@/components/common/AmcBadge';
import { InfoBadge, GLOSSARY } from '@/components/common/InfoBadge';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const SimSimPage: React.FC = () => {
  const {
    funds,
    simsimBucket,
    simsimWeights,
    setFundWeight,
    setBatchWeights,
    removeFromBucket,
    clearBucket,
    equalizeWeights,
    simsimInvestmentMode,
    simsimCapital,
    setSimsimCapital,
    simsimHorizon,
    simsimCustomStartDate,
    simsimCustomEndDate,
    loadModelPreset,
    setAppMode,
    setIsBasketModalOpen,
    sidebarCollapsed,
    toggleSidebarCollapse,
    setSidebarOpen
  } = useScreener();

  const [loadingSim, setLoadingSim] = useState(false);
  const [report, setReport] = useState<SimulationReport | null>(null);
  const [isEditingCapital, setIsEditingCapital] = useState(false);
  const [capitalInputVal, setCapitalInputVal] = useState(simsimCapital);
  const [draggingDividerIdx, setDraggingDividerIdx] = useState<number | null>(null);
  const splitBarRef = useRef<HTMLDivElement>(null);

  // Sync capital input
  useEffect(() => {
    setCapitalInputVal(simsimCapital);
  }, [simsimCapital]);

  // Funds currently in the bucket
  const bucketFunds = useMemo(() => {
    return simsimBucket
      .map(code => funds.find(f => f.code === code))
      .filter(Boolean) as FundSummary[];
  }, [simsimBucket, funds]);

  // Compute divider positions based on cumulative weights
  const dividerPositions = useMemo(() => {
    let accum = 0;
    const pos: number[] = [];
    const n = bucketFunds.length;
    for (let i = 0; i < n - 1; i++) {
      const w = simsimWeights[bucketFunds[i].code] ?? Math.round(100 / n);
      accum += w;
      pos.push(accum);
    }
    return pos;
  }, [bucketFunds, simsimWeights]);

  const handleDividerPointerDown = (dividerIdx: number, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const dividerEl = e.currentTarget as HTMLElement;
    try {
      dividerEl.setPointerCapture(e.pointerId);
    } catch (err) {}
    setDraggingDividerIdx(dividerIdx);

    const k = dividerIdx;
    const n = bucketFunds.length;
    if (n <= 1) return;

    const onPointerMove = (ev: PointerEvent) => {
      if (!splitBarRef.current) return;
      const rect = splitBarRef.current.getBoundingClientRect();
      if (rect.width <= 0) return;
      const rawPct = ((ev.clientX - rect.left) / rect.width) * 100;

      // Left bound: sum of segments 0..k-1 + 1 (or 1 if k=0)
      let leftBound = 1;
      for (let j = 0; j < k; j++) {
        leftBound += (simsimWeights[bucketFunds[j].code] ?? Math.round(100 / n));
      }

      // Right bound: sum of segments 0..k+1 - 1 (or 99 if k=n-2)
      let rightBound = 99;
      if (k < n - 2) {
        let sumUntilK1 = 0;
        for (let j = 0; j <= k + 1; j++) {
          sumUntilK1 += (simsimWeights[bucketFunds[j].code] ?? Math.round(100 / n));
        }
        rightBound = sumUntilK1 - 1;
      }

      const clamped = Math.max(leftBound, Math.min(rightBound, Math.round(rawPct)));

      const prevSumLeft = (k > 0) ? (leftBound - 1) : 0;
      let sumBoth = 0;
      if (k < n - 2) {
        sumBoth = (rightBound + 1) - prevSumLeft;
      } else {
        sumBoth = 100 - prevSumLeft;
      }

      const newPctK = clamped - prevSumLeft;
      const newPctK1 = sumBoth - newPctK;

      const nextWeights = { ...simsimWeights };
      nextWeights[bucketFunds[k].code] = newPctK;
      nextWeights[bucketFunds[k + 1].code] = newPctK1;
      setBatchWeights(nextWeights);
    };

    const onPointerUp = (ev: PointerEvent) => {
      try {
        dividerEl.releasePointerCapture(ev.pointerId);
      } catch (err) {}
      setDraggingDividerIdx(null);
      dividerEl.removeEventListener('pointermove', onPointerMove);
      dividerEl.removeEventListener('pointerup', onPointerUp);
      dividerEl.removeEventListener('pointercancel', onPointerUp);
    };

    dividerEl.addEventListener('pointermove', onPointerMove);
    dividerEl.addEventListener('pointerup', onPointerUp);
    dividerEl.addEventListener('pointercancel', onPointerUp);
  };

  // Determine date range based on horizon
  const calculateDateRange = (horizon: string): { start: string; end: string | null } => {
    if (horizon === 'CUSTOM') {
      return {
        start: simsimCustomStartDate,
        end: simsimCustomEndDate
      };
    }
    const d = new Date();
    if (horizon === '6M') d.setMonth(d.getMonth() - 6);
    else if (horizon === '1Y') d.setFullYear(d.getFullYear() - 1);
    else if (horizon === '2Y') d.setFullYear(d.getFullYear() - 2);
    else if (horizon === '3Y') d.setFullYear(d.getFullYear() - 3);
    else if (horizon === '5Y') d.setFullYear(d.getFullYear() - 5);
    else if (horizon === '7Y') d.setFullYear(d.getFullYear() - 7);
    else if (horizon === '10Y') d.setFullYear(d.getFullYear() - 10);
    else return { start: '2015-01-01', end: null }; // ALL / Max

    return {
      start: d.toISOString().split('T')[0],
      end: null
    };
  };

  // Run simulation whenever bucket, weights, capital, mode, or horizon/dates change
  useEffect(() => {
    if (bucketFunds.length === 0) {
      setReport(null);
      return;
    }

    let isMounted = true;
    async function runSim() {
      setLoadingSim(true);

      // Load NAV histories
      const fundsWithHist = await Promise.all(
        bucketFunds.map(async f => {
          const hist = await fetchFundNavHistory(f.code);
          return {
            ...f,
            nav_history: hist
          };
        })
      );

      if (!isMounted) return;

      const { start: horizonStart, end: horizonEnd } = calculateDateRange(simsimHorizon);
      const earliestCommon = SimSimEngine.calculateEarliestCommonDate(fundsWithHist);
      const effectiveStart = horizonStart > earliestCommon ? horizonStart : earliestCommon;
      const effectiveEnd = horizonEnd;

      // Normalise weights to 1.0 sum
      const weightMap: Record<string | number, number> = {};
      const sumWeights = Object.values(simsimWeights).reduce((a, b) => a + b, 0) || 100;
      bucketFunds.forEach(f => {
        const rawW = simsimWeights[f.code] ?? (100 / bucketFunds.length);
        weightMap[f.code] = rawW / sumWeights;
      });

      const rep = simsimInvestmentMode === 'lumpsum'
        ? SimSimEngine.simulateLumpsum(fundsWithHist, weightMap, simsimCapital, effectiveStart, effectiveEnd)
        : SimSimEngine.simulateSip(fundsWithHist, weightMap, simsimCapital, effectiveStart, 5, effectiveEnd);

      if (isMounted) {
        setReport(rep);
        setLoadingSim(false);
      }
    }

    runSim();
    return () => {
      isMounted = false;
    };
  }, [bucketFunds, simsimWeights, simsimCapital, simsimInvestmentMode, simsimHorizon, simsimCustomStartDate, simsimCustomEndDate]);

  // Chart data setup
  const chartData = useMemo(() => {
    if (!report || !report.timeSeries || report.timeSeries.length === 0) return null;

    // Sample down timeline to ~40-60 points for ultra-smooth rendering
    const step = Math.max(1, Math.floor(report.timeSeries.length / 50));
    const sampledDates: string[] = [];
    const portfolioVals: number[] = [];
    const benchVals: number[] = [];
    const investedVals: number[] = [];

    for (let i = 0; i < report.timeSeries.length; i += step) {
      const p = report.timeSeries[i];
      sampledDates.push(p.date);
      portfolioVals.push(Math.round(p.value));

      const b = report.benchmarkSeries[i];
      if (b) benchVals.push(Math.round(b.value));

      const inv = report.investedSeries?.[i];
      if (inv) {
        investedVals.push(Math.round(inv.value));
      } else if (simsimInvestmentMode === 'lumpsum') {
        investedVals.push(simsimCapital);
      } else {
        const installmentMonths = Math.min(
          report.installmentsCount || 1,
          Math.floor((i / report.timeSeries.length) * (report.installmentsCount || 1)) + 1
        );
        investedVals.push(installmentMonths * (simsimCapital / (report.installmentsCount || 1)));
      }
    }

    return {
      labels: sampledDates,
      datasets: [
        {
          label: 'SimSim™ Portfolio',
          data: portfolioVals,
          borderColor: '#00F090',
          backgroundColor: 'rgba(0, 240, 144, 0.12)',
          fill: true,
          tension: 0.35,
          borderWidth: 2.5,
          pointRadius: 0,
          pointHoverRadius: 5
        },
        {
          label: 'Nifty 50 TRI Benchmark',
          data: benchVals,
          borderColor: '#94A3B8',
          borderDash: [5, 5],
          fill: false,
          tension: 0.35,
          borderWidth: 1.8,
          pointRadius: 0,
          pointHoverRadius: 4
        },
        {
          label: 'Invested Capital',
          data: investedVals,
          borderColor: '#FFB800',
          borderDash: [2, 2],
          fill: false,
          tension: 0,
          borderWidth: 1.5,
          pointRadius: 0
        }
      ]
    };
  }, [report, simsimInvestmentMode, simsimCapital]);

  // =========================================================================
  // VIEW A: EMPTY BUCKET WELCOME BUILDER
  // =========================================================================
  if (bucketFunds.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 space-y-8 animate-in fade-in duration-300">
        {/* Hero Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#00F090]/15 border border-[#00F090]/30 mb-2">
            <span className="material-symbols-outlined text-4xl text-[#00A86B] dark:text-[#00F090] simsim-pulse-icon">
              hourglass_top
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-on-surface dark:text-white tracking-tight font-headline-lg">
            Welcome to SimSim<span className="text-[#00A86B] dark:text-[#00F090]">™</span> Time Machine
          </h1>
          <p className="text-sm text-on-surface-variant dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
            Institutional backtester simulating portfolio growth on daily audited NAV data.
            Select a curated model basket below or explore schemes in the Screener to add to your custom bucket.
          </p>
        </div>

        {/* 3 Curated Model Baskets Cards */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant dark:text-slate-400 text-center">
            Start with an Institutional Model Portfolio:
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Titan */}
            <div className="p-5 rounded-2xl bg-surface-container-low dark:bg-[#0D1322] border border-surface-container dark:border-[#00F090]/30 flex flex-col justify-between space-y-4 hover:border-[#00F090]/60 transition-all shadow-md">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-[#00F090]/15 text-[#00A86B] dark:text-[#00F090] flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl">shield</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#00F090]/15 text-[#00A86B] dark:text-[#00F090] border border-[#00F090]/30">
                    40/35/25
                  </span>
                </div>
                <h3 className="font-bold text-base text-on-surface dark:text-white">The Titan</h3>
                <p className="text-xs text-on-surface-variant dark:text-slate-400 leading-relaxed">
                  All-weather balanced compounder combining resilient Flexi Cap core with high-growth Mid & Small Cap alpha.
                </p>
              </div>
              <button
                type="button"
                onClick={() => loadModelPreset('titan')}
                className="w-full py-2.5 rounded-xl bg-[#00F090] hover:bg-[#00d880] text-black font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md touch-spring cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">rocket_launch</span>
                <span>Load & Backtest</span>
              </button>
            </div>

            {/* High-Alpha Rocket */}
            <div className="p-5 rounded-2xl bg-surface-container-low dark:bg-[#0D1322] border border-surface-container dark:border-[#FF5630]/30 flex flex-col justify-between space-y-4 hover:border-[#FF5630]/60 transition-all shadow-md">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-[#FF5630]/15 text-[#DE350B] dark:text-[#FF5630] flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl">rocket_launch</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FF5630]/15 text-[#DE350B] dark:text-[#FF5630] border border-[#FF5630]/30">
                    40/30/30
                  </span>
                </div>
                <h3 className="font-bold text-base text-on-surface dark:text-white">High-Alpha Rocket</h3>
                <p className="text-xs text-on-surface-variant dark:text-slate-400 leading-relaxed">
                  High-octane multi-cycle wealth creation prioritizing maximum alpha through proven Mid & Small Cap champions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => loadModelPreset('aggressive')}
                className="w-full py-2.5 rounded-xl bg-[#FF5630] hover:bg-[#ff431a] text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md touch-spring cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">rocket_launch</span>
                <span>Load & Backtest</span>
              </button>
            </div>

            {/* Defensive Compounder */}
            <div className="p-5 rounded-2xl bg-surface-container-low dark:bg-[#0D1322] border border-surface-container dark:border-[#FFB800]/30 flex flex-col justify-between space-y-4 hover:border-[#FFB800]/60 transition-all shadow-md">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-[#FFB800]/15 text-[#975800] dark:text-[#FFB800] flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl">savings</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FFB800]/15 text-[#975800] dark:text-[#FFB800] border border-[#FFB800]/30">
                    40/30/30
                  </span>
                </div>
                <h3 className="font-bold text-base text-on-surface dark:text-white">Defensive Anchor</h3>
                <p className="text-xs text-on-surface-variant dark:text-slate-400 leading-relaxed">
                  Downside-protected wealth preservation combining large-cap stability with value-oriented contra alpha.
                </p>
              </div>
              <button
                type="button"
                onClick={() => loadModelPreset('defensive')}
                className="w-full py-2.5 rounded-xl bg-[#FFB800] hover:bg-[#e6a600] text-black font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md touch-spring cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">rocket_launch</span>
                <span>Load & Backtest</span>
              </button>
            </div>
          </div>
        </div>

        {/* Or Build Custom Basket */}
        <div className="text-center pt-2 flex items-center justify-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined' && window.innerWidth < 768) {
                setSidebarOpen(true);
              } else if (sidebarCollapsed) {
                toggleSidebarCollapse();
              }
            }}
            className="px-5 py-3 rounded-2xl bg-[#00F090]/15 hover:bg-[#00F090]/25 border border-[#00F090]/40 text-xs font-bold text-[#00A86B] dark:text-[#00F090] transition-all touch-spring inline-flex items-center gap-2 shadow-xs cursor-pointer"
            title="Configure simulation controls in sidebar"
          >
            <span className="material-symbols-outlined text-base">tune</span>
            <span>Configure Controls</span>
          </button>

          <button
            type="button"
            onClick={() => setAppMode('screener')}
            className="px-6 py-3 rounded-2xl bg-surface-container-low border border-surface-container hover:border-primary/40 text-xs font-bold text-on-surface hover:text-primary dark:hover:text-[#00F090] transition-all touch-spring inline-flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">search</span>
            <span>Browse 620 Schemes in Screener to Add</span>
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW B: ACTIVE SIMULATION WORKSPACE
  // =========================================================================
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Top Portfolio Status & Action Bar */}
      <div className="simsim-card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00F090]/15 border border-[#00F090]/30 flex items-center justify-center text-[#00A86B] dark:text-[#00F090]">
            <span className="material-symbols-outlined text-2xl simsim-pulse-icon">hourglass_top</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-headline-md text-base sm:text-lg text-on-surface dark:text-white font-bold">
                SimSim™ Simulation Workspace
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#00F090]/15 text-[#00A86B] dark:text-[#00F090] border border-[#00F090]/30">
                Audited Daily NAV Backtest
              </span>
            </div>
            <div className="text-xs text-on-surface-variant dark:text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
              <span>Active Portfolio Basket: <strong className="text-on-surface dark:text-white">{bucketFunds.length} Scheme{bucketFunds.length > 1 ? 's' : ''}</strong></span>
              {report && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-surface-container border border-surface-container-high text-on-surface dark:bg-white/5 dark:border-white/10 dark:text-white flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs text-[#00A86B] dark:text-[#00F090]">calendar_today</span>
                  <span>{report.startDate} to {report.endDate} ({report.years}Y • {report.timeSeries.length} points)</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={equalizeWeights}
            className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high dark:bg-[#182234] dark:hover:bg-[#202d44] border border-surface-container-high dark:border-white/10 text-xs font-bold text-primary dark:text-[#00D2FF] flex items-center gap-1.5 touch-spring transition-colors cursor-pointer"
            title="Equalize weights across all schemes"
          >
            <span className="material-symbols-outlined text-sm">balance</span>
            <span>Equal Weight</span>
          </button>

          <button
            type="button"
            onClick={clearBucket}
            className="px-3.5 py-2 rounded-xl bg-loss-bg hover:bg-loss/20 dark:bg-[#281518] dark:hover:bg-[#381c20] border border-loss/30 text-xs font-bold text-loss flex items-center gap-1.5 touch-spring transition-colors cursor-pointer"
            title="Clear all schemes from bucket"
          >
            <span className="material-symbols-outlined text-sm">delete_sweep</span>
            <span>Clear</span>
          </button>

          <button
            type="button"
            onClick={() => setAppMode('screener')}
            className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high dark:bg-white/10 dark:hover:bg-white/15 text-xs font-bold text-on-surface dark:text-white flex items-center gap-1.5 touch-spring transition-colors cursor-pointer"
            title="Return to Mutual Fund Screener"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Exit to Screener</span>
          </button>
        </div>
      </div>

      {/* 2. 4 Key KPI Metric Cards */}
      {loadingSim || !report ? (
        <div className="simsim-card p-12 text-center text-xs text-on-surface-variant dark:text-slate-400">
          <span className="material-symbols-outlined text-3xl text-[#00A86B] dark:text-[#00F090] mb-2 block simsim-pulse-icon">
            hourglass_empty
          </span>
          Calculating historical trajectory on audited daily NAV data...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Present Value */}
          <div className="simsim-kpi-card simsim-kpi-emerald p-4">
            <div className="flex items-center justify-between text-on-surface-variant dark:text-[#94A3B8] mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider">Simulated Present Value</span>
              <div className="w-7 h-7 rounded-lg bg-[#00F090]/15 border border-[#00F090]/30 flex items-center justify-center text-[#00A86B] dark:text-[#00F090]">
                <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
              </div>
            </div>
            <p className="font-display-financial text-2xl font-black simsim-neon-headline">
              ₹{Math.round(report.presentValue).toLocaleString('en-IN')}
            </p>
            <p className={`text-[11px] font-medium ${report.totalGain >= 0 ? 'text-gain-text dark:text-[#00F090]' : 'text-loss-text dark:text-[#FF4D4D]'} mt-1 flex items-center gap-1`}>
              <span>{report.totalGain >= 0 ? '▲' : '▼'} ₹{Math.abs(Math.round(report.totalGain)).toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-on-surface-variant dark:text-[#64748B]">({report.totalGainPct >= 0 ? '+' : ''}{report.totalGainPct.toFixed(2)}%)</span>
            </p>
          </div>

          {/* KPI 2: Annualized CAGR / XIRR */}
          <div className="simsim-kpi-card simsim-kpi-cyan p-4">
            <div className="flex items-center justify-between text-on-surface-variant dark:text-[#94A3B8] mb-1.5">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {report.type === 'lumpsum' ? 'Annualized CAGR' : 'Annualized XIRR'}
                </span>
                <InfoBadge
                  term={report.type === 'lumpsum' ? 'CAGR' : 'XIRR'}
                  definition={GLOSSARY[report.type === 'lumpsum' ? 'CAGR' : 'XIRR']}
                />
              </div>
              <div className="w-7 h-7 rounded-lg bg-[#00D2FF]/15 border border-[#00D2FF]/30 flex items-center justify-center text-primary dark:text-[#00D2FF]">
                <span className="material-symbols-outlined text-sm">trending_up</span>
              </div>
            </div>
            <p className="font-display-financial text-2xl font-black text-on-surface dark:text-white">
              {report.cagr.toFixed(2)}%
            </p>
            <p className={`text-[11px] font-medium ${report.alpha >= 0 ? 'text-primary dark:text-[#00D2FF]' : 'text-loss-text dark:text-[#FF4D4D]'} mt-1`}>
              {report.alpha >= 0 ? '+' : ''}{report.alpha.toFixed(2)}% Alpha vs Nifty 50 TRI
            </p>
          </div>

          {/* KPI 3: Max Drawdown */}
          <div className="simsim-kpi-card simsim-kpi-crimson p-4">
            <div className="flex items-center justify-between text-on-surface-variant dark:text-[#94A3B8] mb-1.5">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Max Drawdown</span>
                <InfoBadge term="Drawdown" definition={GLOSSARY['Drawdown']} />
              </div>
              <div className="w-7 h-7 rounded-lg bg-[#FF4D4D]/15 border border-[#FF4D4D]/30 flex items-center justify-center text-loss">
                <span className="material-symbols-outlined text-sm">shield</span>
              </div>
            </div>
            <p className="font-display-financial text-2xl font-black text-loss-text dark:text-[#FF4D4D]">
              {report.maxDrawdown > 0 ? `-${report.maxDrawdown.toFixed(2)}%` : '0.00%'}
            </p>
            <p className="text-[11px] text-on-surface-variant dark:text-[#64748B] mt-1">Worst peak-to-trough drop</p>
          </div>

          {/* KPI 4: Total Invested (Interactive inline edit) */}
          <div
            onClick={() => setIsEditingCapital(true)}
            className="simsim-kpi-card simsim-kpi-amber p-4 cursor-pointer group select-none"
            title="Click to edit total invested capital"
          >
            <div className="flex items-center justify-between text-on-surface-variant dark:text-[#94A3B8] mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-warning-text dark:text-[#FFB800]">Total Invested</span>
                <span className="material-symbols-outlined text-xs text-warning-text dark:text-[#FFB800] opacity-0 group-hover:opacity-100 transition-opacity">edit</span>
              </div>
              <div className="w-7 h-7 rounded-lg bg-[#FFB800]/15 border border-[#FFB800]/30 flex items-center justify-center text-warning-text dark:text-[#FFB800]">
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
                    className="w-full bg-surface-container dark:bg-[#080C14] border border-warning/60 rounded-lg py-1 px-2 text-xs text-on-surface dark:text-white font-bold font-mono outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSimsimCapital(Math.max(1000, capitalInputVal));
                      setIsEditingCapital(false);
                    }}
                    className="px-2 py-1 rounded-lg bg-[#FFB800] text-black font-extrabold text-[11px] cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingCapital(false)}
                    className="p-1 rounded-lg bg-surface-container hover:bg-surface-container-high dark:bg-white/10 text-on-surface dark:text-white text-xs cursor-pointer"
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
                        setSimsimCapital(chip.val);
                        setCapitalInputVal(chip.val);
                        setIsEditingCapital(false);
                      }}
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-surface-container hover:bg-warning/20 dark:bg-white/10 dark:hover:bg-[#FFB800]/20 text-on-surface dark:text-white border border-surface-container-high dark:border-white/10 touch-spring"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-baseline gap-2">
                  <p className="font-display-financial text-2xl font-black text-on-surface dark:text-white font-mono">
                    ₹{Math.round(report.totalCapital).toLocaleString('en-IN')}
                  </p>
                  <span className="text-[10px] text-warning-text dark:text-[#FFB800] opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                    Edit
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant dark:text-slate-400 mt-1">
                  {report.type === 'lumpsum' ? 'One-time principal • Click to edit' : `${report.installmentsCount || 0} monthly SIP installments`}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Interactive NAV Trajectory Chart */}
      {chartData && (
        <div className="simsim-card p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface dark:text-white">
                Historical Portfolio Growth vs Nifty 50 TRI
              </h3>
              <p className="text-[11px] text-on-surface-variant dark:text-slate-400">
                Daily audited compounded valuation trajectory across your chosen horizon
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="flex items-center gap-1 text-[#00A86B] dark:text-[#00F090]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00F090]" /> SimSim Portfolio
              </span>
              <span className="flex items-center gap-1 text-on-surface-variant dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Nifty 50 TRI
              </span>
            </div>
          </div>

          <div className="h-80 w-full">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: { color: '#64748B', font: { size: 10 }, maxTicksLimit: 8 }
                  },
                  y: {
                    grid: { color: 'rgba(128, 128, 128, 0.12)' },
                    ticks: {
                      color: '#64748B',
                      font: { size: 10 },
                      callback: (val) => `₹${(Number(val) / 1000).toFixed(0)}k`
                    }
                  }
                },
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (ctx) => `${ctx.dataset.label}: ₹${Number(ctx.parsed.y).toLocaleString('en-IN')}`
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      )}

      {/* 4. Portfolio Allocation Split Bar & Constituent Cards */}
      <div className="simsim-card p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface dark:text-white">
              Portfolio Allocation ({bucketFunds.length} Schemes)
            </h3>
            <p className="text-[11px] text-on-surface-variant dark:text-slate-400">
              Adjust weights below to allocate your capital across schemes
            </p>
          </div>
        </div>

        {/* Interactive 100% Split Bar with Movable Dividers */}
        <div ref={splitBarRef} className="simsim-split-bar relative">
          <div className="simsim-split-segments-wrap">
            {bucketFunds.map((f, idx) => {
              const rawW = simsimWeights[f.code] ?? Math.round(100 / bucketFunds.length);
              const colorClass = `simsim-seg-${idx % 6}`;
              const rupeeVal = Math.round((simsimCapital * rawW) / 100);
              return (
                <div
                  key={String(f.code)}
                  className={`simsim-bar-segment ${colorClass} ${draggingDividerIdx !== null ? 'is-dragging' : ''}`}
                  style={{ width: `${rawW}%` }}
                >
                  <span className="text-[11px] font-bold truncate px-1">{f.name.split(' - Direct')[0]}</span>
                  <span className="text-[10px] font-bold">{rawW}% • ₹{(rupeeVal / 1000).toFixed(0)}k</span>
                </div>
              );
            })}
          </div>

          {/* Draggable Divider Handles between adjacent funds */}
          {dividerPositions.map((posPct, idx) => (
            <div
              key={`div-${idx}`}
              onPointerDown={(e) => handleDividerPointerDown(idx, e)}
              className={`simsim-bar-divider ${draggingDividerIdx === idx ? 'is-dragging' : ''}`}
              style={{ left: `calc(${posPct}% - 7px)` }}
              title={`Drag to reallocate between ${bucketFunds[idx].name.split(' - Direct')[0]} and ${bucketFunds[idx + 1].name.split(' - Direct')[0]}`}
            />
          ))}
        </div>

        {/* Constituent Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {bucketFunds.map(f => {
            const currentWeight = simsimWeights[f.code] ?? Math.round(100 / bucketFunds.length);
            const rupeeShare = Math.round((simsimCapital * currentWeight) / 100);

            return (
              <div
                key={String(f.code)}
                className="p-3.5 rounded-2xl bg-surface-container-low dark:bg-[#0F1524] border border-surface-container dark:border-white/10 space-y-2.5 hover:border-primary/40 dark:hover:border-white/20 transition-all shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <AmcBadge fundHouse={f.fund_house} size="sm" />
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-container dark:bg-white/10 text-on-surface-variant dark:text-[#94A3B8] font-bold uppercase">
                        {f.category}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-on-surface dark:text-white truncate" title={f.name}>
                      {f.name.split(' - Direct')[0]}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-on-surface-variant dark:text-[#64748B] font-semibold">
                        NAV: ₹{(f.latest_nav || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromBucket(f.code)}
                    className="w-6 h-6 rounded-full bg-surface-container hover:bg-loss-bg dark:bg-white/5 dark:hover:bg-[#FF4D4D]/20 text-on-surface-variant hover:text-loss dark:text-[#94A3B8] dark:hover:text-[#FF4D4D] flex items-center justify-center transition-colors cursor-pointer"
                    title="Remove scheme from bucket"
                  >
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                </div>

                {/* Weight Slider */}
                <div className="flex items-center gap-2.5">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={currentWeight}
                    onChange={(e) => setFundWeight(f.code, Number(e.target.value))}
                    className="apple-slider flex-1"
                  />
                  <div className="flex items-center gap-0.5 w-14 flex-shrink-0">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={currentWeight}
                      onChange={(e) => setFundWeight(f.code, Number(e.target.value))}
                      className="w-10 bg-surface-container dark:bg-[#07090E] border border-surface-container-high dark:border-white/20 rounded px-1 text-xs text-right font-bold text-on-surface dark:text-white outline-none focus:border-[#00F090]"
                    />
                    <span className="text-xs text-on-surface-variant dark:text-[#94A3B8] font-bold">%</span>
                  </div>
                </div>

                {/* Rupee Share */}
                <div className="flex items-center justify-between text-[11px] text-on-surface-variant dark:text-[#94A3B8] pt-1.5 border-t border-surface-container dark:border-white/5">
                  <span>Allocated Share:</span>
                  <span className="text-on-surface dark:text-white font-bold">
                    ₹{rupeeShare.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Constituent Schemes Performance Breakdown Table */}
      {report && report.constituents && (
        <div className="simsim-card overflow-hidden">
          <div className="p-4 border-b border-surface-container dark:border-white/10 bg-surface-container-low dark:bg-[#0C1018] flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface dark:text-white">
              Constituent Schemes Performance Breakdown
            </h3>
            <span className="text-[11px] font-mono text-on-surface-variant dark:text-[#94A3B8]">
              Period: {report.startDate} to {report.endDate} ({report.years} Years)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container dark:bg-[#090D14] text-on-surface-variant dark:text-[#94A3B8] text-[10px] uppercase font-bold">
                <tr>
                  <th className="py-2.5 px-3">Scheme & Category</th>
                  <th className="py-2.5 px-3 text-right">Weight</th>
                  <th className="py-2.5 px-3 text-right">Invested</th>
                  <th className="py-2.5 px-3 text-right">Present Value</th>
                  <th className="py-2.5 px-3 text-right">Gain / Loss</th>
                  <th className="py-2.5 px-3 text-right">{report.type === 'lumpsum' ? 'CAGR' : 'Return'}</th>
                  <th className="py-2.5 px-3 text-right">Units Held</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container/60 dark:divide-white/5">
                {report.constituents.map(c => (
                  <tr key={String(c.code)} className="hover:bg-surface-container/50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-2.5 px-3">
                      <p className="font-bold text-on-surface dark:text-white text-xs truncate max-w-xs">{c.name.split(' - Direct')[0]}</p>
                      <p className="text-[10px] text-on-surface-variant dark:text-[#94A3B8]">{c.category} • {c.fund_house}</p>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#00A86B] dark:text-[#00F090]">{c.weightPct}%</td>
                    <td className="py-2.5 px-3 text-right font-mono text-on-surface-variant dark:text-[#94A3B8]">₹{Math.round(c.allocatedCap).toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-on-surface dark:text-white">₹{Math.round(c.presentValue).toLocaleString('en-IN')}</td>
                    <td className={`py-2.5 px-3 text-right font-mono font-bold ${c.gain >= 0 ? 'text-gain-text dark:text-[#00F090]' : 'text-loss-text dark:text-[#FF4D4D]'}`}>
                      {c.gain >= 0 ? '+' : ''}₹{Math.round(c.gain).toLocaleString('en-IN')} ({c.gainPct >= 0 ? '+' : ''}{c.gainPct.toFixed(1)}%)
                    </td>
                    <td className={`py-2.5 px-3 text-right font-mono font-bold ${c.cagr >= 0 ? 'text-primary dark:text-[#00D2FF]' : 'text-loss-text dark:text-[#FF4D4D]'}`}>
                      {c.cagr >= 0 ? '+' : ''}{c.cagr.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-on-surface-variant dark:text-[#94A3B8]">{c.units.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
