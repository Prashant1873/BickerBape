'use client';

import React, { useState, useMemo } from 'react';
import { useScreener } from '@/context/ScreenerContext';
import { FundSummary, NavPoint } from '@/types/fund';
import { fetchFundNavHistory } from '@/lib/data-loader';
import { SimSimEngine, SimulationReport } from '@/lib/simsim-engine';
import { Line } from 'react-chartjs-2';

export const MODEL_BASKETS = {
  titan: {
    id: 'titan',
    name: 'The Titan',
    icon: 'shield',
    description: 'All-weather balanced compounder combining resilient Flexi Cap core with high-growth Mid & Small Cap alpha.',
    slots: [
      { category: 'Flexi Cap', suggestedWeight: 40, defaultSubstr: 'Flexi' },
      { category: 'Mid Cap', suggestedWeight: 35, defaultSubstr: 'Mid' },
      { category: 'Small Cap', suggestedWeight: 25, defaultSubstr: 'Small' }
    ]
  },
  aggressive: {
    id: 'aggressive',
    name: 'High-Alpha Rocket',
    icon: 'rocket_launch',
    description: 'High-octane multi-cycle wealth creation prioritizing maximum alpha through proven Mid & Small Cap champions.',
    slots: [
      { category: 'Mid Cap', suggestedWeight: 40, defaultSubstr: 'Mid' },
      { category: 'Small Cap', suggestedWeight: 30, defaultSubstr: 'Small' },
      { category: 'Flexi Cap', suggestedWeight: 30, defaultSubstr: 'Flexi' }
    ]
  },
  defensive: {
    id: 'defensive',
    name: 'Defensive Compounder',
    icon: 'savings',
    description: 'Downside-protected wealth preservation combining large-cap stability with value-oriented contra alpha.',
    slots: [
      { category: 'Large & Mid Cap', suggestedWeight: 40, defaultSubstr: 'Large' },
      { category: 'Large Cap', suggestedWeight: 30, defaultSubstr: 'Bluechip' },
      { category: 'ELSS Tax Saver', suggestedWeight: 30, defaultSubstr: 'Tax' }
    ]
  }
};

interface SimSimModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SimSimModal: React.FC<SimSimModalProps> = ({ isOpen, onClose }) => {
  const { funds } = useScreener();

  const [activeBasketKey, setActiveBasketKey] = useState<'titan' | 'aggressive' | 'defensive'>('titan');
  const [investmentMode, setInvestmentMode] = useState<'lumpsum' | 'sip'>('lumpsum');
  const [capital, setCapital] = useState<number>(100000);
  const [selectedFundCodes, setSelectedFundCodes] = useState<Record<number, string | number>>({});
  const [customWeights, setCustomWeights] = useState<Record<number, number>>({ 0: 40, 1: 35, 2: 25 });
  const [simulationResult, setSimulationResult] = useState<SimulationReport | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const activeBasket = MODEL_BASKETS[activeBasketKey];

  // Pick default funds for each slot based on category and SmartScore
  const slotFunds = useMemo(() => {
    return activeBasket.slots.map((slot, slotIdx) => {
      const matchingFunds = funds.filter(f => f.category.toLowerCase().includes(slot.category.toLowerCase()));
      // Sort by SmartScore desc
      matchingFunds.sort((a, b) => ((b.smart_score?.overall || 0) - (a.smart_score?.overall || 0)));
      return {
        slot,
        matchingFunds
      };
    });
  }, [activeBasket, funds]);

  // Ensure default selections exist for all slots
  const currentSelections = useMemo(() => {
    const selections: Record<number, FundSummary | undefined> = {};
    slotFunds.forEach((sf, idx) => {
      const explicitCode = selectedFundCodes[idx];
      if (explicitCode) {
        selections[idx] = funds.find(f => f.code === explicitCode);
      }
      if (!selections[idx] && sf.matchingFunds.length > 0) {
        selections[idx] = sf.matchingFunds[0];
      }
    });
    return selections;
  }, [slotFunds, selectedFundCodes, funds]);

  const handleBasketChange = (basketKey: 'titan' | 'aggressive' | 'defensive') => {
    setActiveBasketKey(basketKey);
    const b = MODEL_BASKETS[basketKey];
    setSelectedFundCodes({});
    setCustomWeights({
      0: b.slots[0].suggestedWeight,
      1: b.slots[1].suggestedWeight,
      2: b.slots[2].suggestedWeight
    });
    setSimulationResult(null);
  };

  const handleWeightChange = (slotIdx: number, val: number) => {
    setCustomWeights(prev => ({ ...prev, [slotIdx]: val }));
  };

  const handleFundSelect = (slotIdx: number, code: string | number) => {
    setSelectedFundCodes(prev => ({ ...prev, [slotIdx]: code }));
    setSimulationResult(null);
  };

  // Run backtesting simulation
  const handleRunSimulation = async () => {
    setIsSimulating(true);

    const chosenFunds: FundSummary[] = [];
    slotFunds.forEach((_, idx) => {
      if (currentSelections[idx]) chosenFunds.push(currentSelections[idx]!);
    });

    if (chosenFunds.length === 0) {
      setIsSimulating(false);
      return;
    }

    // Load NAV histories in parallel
    const fullFunds = await Promise.all(
      chosenFunds.map(async (f) => {
        const hist = await fetchFundNavHistory(f.code);
        return {
          ...f,
          nav_history: hist
        };
      })
    );

    const earliestCommon = SimSimEngine.calculateEarliestCommonDate(fullFunds);

    // Build weights map
    const weightsMap: Record<string | number, number> = {};
    chosenFunds.forEach((f, idx) => {
      weightsMap[f.code] = (customWeights[idx] || 33.33) / 100;
    });

    let report: SimulationReport | null = null;
    if (investmentMode === 'lumpsum') {
      report = SimSimEngine.simulateLumpsum(fullFunds, weightsMap, capital, earliestCommon);
    } else {
      report = SimSimEngine.simulateSip(fullFunds, weightsMap, capital, earliestCommon, 5);
    }

    setSimulationResult(report);
    setIsSimulating(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface rounded-3xl border border-surface-container max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-surface-container bg-surface-container-low flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xl">
              <span className="material-symbols-outlined text-xl">auto_awesome</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline-md font-bold text-base sm:text-lg text-on-surface">
                  SimSim™ AI Portfolio Backtester
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase font-mono">
                  Institutional Quant
                </span>
              </div>
              <p className="text-xs text-on-surface-variant">
                Backtest model mutual fund baskets on verified multi-year NAV history
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center touch-spring"
            aria-label="Close SimSim modal"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 hide-scrollbar flex-1">
          {/* Step 1: Choose Model Basket */}
          <section>
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-2">
              1. Select Goal-Based Model Basket
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['titan', 'aggressive', 'defensive'] as const).map(k => {
                const b = MODEL_BASKETS[k];
                const active = activeBasketKey === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleBasketChange(k)}
                    className={`p-3.5 rounded-2xl border text-left transition-all touch-spring flex flex-col justify-between ${
                      active
                        ? 'bg-primary/5 border-primary shadow-xs ring-1 ring-primary'
                        : 'bg-surface-container-low/60 border-surface-container hover:bg-surface-container-low text-on-surface-variant'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="material-symbols-outlined text-primary text-xl">{b.icon}</span>
                        {active && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary text-white">
                            Selected
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm text-on-surface">{b.name}</h4>
                      <p className="text-[11px] text-on-surface-variant line-clamp-2 mt-1 leading-snug">
                        {b.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Step 2: Slot Scheme Selection & Weights */}
          <section className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block">
              2. Customise Constituents &amp; Allocation Weights
            </span>

            <div className="space-y-3">
              {slotFunds.map((sf, idx) => {
                const currentFund = currentSelections[idx];
                const currentWeight = customWeights[idx] || 33;
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0 w-full sm:w-auto">
                      <span className="text-[10px] font-bold uppercase text-primary font-mono block mb-1">
                        Slot {idx + 1}: {sf.slot.category}
                      </span>
                      <select
                        value={currentFund?.code || ''}
                        onChange={(e) => handleFundSelect(idx, e.target.value)}
                        className="w-full bg-surface border border-surface-container rounded-xl py-2 px-3 text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer min-h-[40px]"
                      >
                        {sf.matchingFunds.slice(0, 15).map(f => (
                          <option key={String(f.code)} value={f.code}>
                            {f.name} (Score: {f.smart_score?.overall.toFixed(1)})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Weight Slider */}
                    <div className="w-full sm:w-48 flex-shrink-0">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-on-surface-variant text-[11px]">Weight</span>
                        <span className="font-mono font-bold text-primary">{currentWeight}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="70"
                        step="5"
                        value={currentWeight}
                        onChange={(e) => handleWeightChange(idx, Number(e.target.value))}
                        className="apple-slider"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Step 3: Capital & Mode Controls */}
          <section className="p-4 rounded-2xl bg-surface-container-low border border-surface-container flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Mode Toggle: Lumpsum vs SIP */}
              <div className="flex items-center p-1 bg-surface border border-surface-container rounded-xl shadow-2xs">
                <button
                  type="button"
                  onClick={() => setInvestmentMode('lumpsum')}
                  className={`min-h-[36px] px-3.5 rounded-lg text-xs font-bold transition-all touch-spring ${
                    investmentMode === 'lumpsum' ? 'bg-primary text-white shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Lumpsum
                </button>
                <button
                  type="button"
                  onClick={() => setInvestmentMode('sip')}
                  className={`min-h-[36px] px-3.5 rounded-lg text-xs font-bold transition-all touch-spring ${
                    investmentMode === 'sip' ? 'bg-primary text-white shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Monthly SIP
                </button>
              </div>

              {/* Capital Input */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-on-surface-variant font-medium">Amount:</span>
                <input
                  type="number"
                  step="5000"
                  min="1000"
                  value={capital}
                  onChange={(e) => setCapital(Number(e.target.value))}
                  className="w-32 bg-surface border border-surface-container rounded-xl py-1.5 px-2.5 text-xs font-mono font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[36px] shadow-2xs"
                />
              </div>
            </div>

            {/* Run Button */}
            <button
              type="button"
              disabled={isSimulating}
              onClick={handleRunSimulation}
              className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-primary to-primary-container text-white text-xs font-bold shadow-md hover:shadow-lg hover:scale-[1.02] touch-spring flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
            >
              <span className="material-symbols-outlined text-base">rocket_launch</span>
              <span>{isSimulating ? 'Simulating Historical Points...' : 'Simulate & Backtest'}</span>
            </button>
          </section>

          {/* Simulation Output Dashboard */}
          {simulationResult && (
            <section className="space-y-4 pt-4 border-t border-surface-container animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h4 className="font-headline-md font-bold text-sm text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-gain text-base">check_circle</span>
                  <span>Backtest Report ({simulationResult.startDate} to {simulationResult.endDate})</span>
                </h4>
                <span className="text-[11px] font-mono text-on-surface-variant">
                  Duration: {simulationResult.years} Years
                </span>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Present Value</span>
                  <span className="font-mono font-bold text-sm text-on-surface block mt-0.5">
                    ₹{Math.round(simulationResult.presentValue).toLocaleString()}
                  </span>
                  <span className={`text-[10px] font-bold ${simulationResult.totalGain >= 0 ? 'text-gain' : 'text-loss'}`}>
                    {simulationResult.totalGain >= 0 ? '+' : ''}{simulationResult.totalGainPct.toFixed(1)}% Gain
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant block">
                    {simulationResult.type === 'sip' ? 'XIRR (Annualized)' : 'Portfolio CAGR'}
                  </span>
                  <span className="font-mono font-bold text-sm text-gain block mt-0.5">
                    +{simulationResult.cagr.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-on-surface-variant">
                    vs {simulationResult.benchmarkCagr.toFixed(1)}% Benchmark
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Alpha Generated</span>
                  <span className="font-mono font-bold text-sm text-primary block mt-0.5">
                    +{simulationResult.alpha.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-gain font-semibold">Beat Nifty 50 TRI</span>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Max Drawdown</span>
                  <span className="font-mono font-bold text-sm text-loss block mt-0.5">
                    -{simulationResult.maxDrawdown.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-on-surface-variant">Peak-to-Trough drop</span>
                </div>
              </div>

              {/* Chart Comparison */}
              {simulationResult.timeSeries && simulationResult.timeSeries.length > 0 && (
                <div className="h-60 rounded-2xl bg-surface-container-lowest border border-surface-container p-3">
                  <Line
                    data={{
                      labels: simulationResult.timeSeries.map(p => p.date),
                      datasets: [
                        {
                          label: 'SimSim™ Portfolio',
                          data: simulationResult.timeSeries.map(p => p.value),
                          borderColor: '#0052cc',
                          borderWidth: 2,
                          pointRadius: 0,
                          tension: 0.2
                        },
                        {
                          label: 'Nifty 50 TRI Benchmark',
                          data: simulationResult.benchmarkSeries.map(p => p.value),
                          borderColor: '#94a3b8',
                          borderWidth: 1.5,
                          borderDash: [4, 4],
                          pointRadius: 0,
                          tension: 0.2
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                          labels: { boxWidth: 12, font: { size: 10 } }
                        }
                      },
                      scales: {
                        x: { grid: { display: false }, ticks: { maxTicksLimit: 6, font: { size: 10 } } },
                        y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 10 }, callback: v => `₹${Number(v).toLocaleString()}` } }
                      }
                    }}
                  />
                </div>
              )}

              {/* Constituents Table */}
              <div className="rounded-xl border border-surface-container overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-container-low text-on-surface-variant text-[10px] uppercase">
                    <tr>
                      <th className="py-2 px-3">Constituent Fund</th>
                      <th className="py-2 px-3 text-right">Weight</th>
                      <th className="py-2 px-3 text-right">Allocated</th>
                      <th className="py-2 px-3 text-right">Present Value</th>
                      <th className="py-2 px-3 text-right">CAGR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container/60">
                    {simulationResult.constituents.map(c => (
                      <tr key={String(c.code)} className="hover:bg-surface-container-low/40">
                        <td className="py-2 px-3 font-semibold text-on-surface">{c.name}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-primary">{c.weightPct}%</td>
                        <td className="py-2 px-3 text-right font-mono text-on-surface-variant">₹{Math.round(c.allocatedCap).toLocaleString()}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-on-surface">₹{Math.round(c.presentValue).toLocaleString()}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-gain">+{c.cagr.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-surface-container bg-surface-container-low flex items-center justify-between flex-shrink-0">
          <span className="text-[11px] text-on-surface-variant">
            Historical returns do not guarantee future performance. Direct plan data sourced from AMFI.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] px-5 py-2 rounded-xl bg-surface border border-surface-container text-xs font-bold text-on-surface hover:text-primary touch-spring"
          >
            Close Simulator
          </button>
        </div>
      </div>
    </div>
  );
};
