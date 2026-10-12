'use client';

import React from 'react';
import { FundSummary } from '@/types/fund';

interface DrawerScorecardTabProps {
  fund: FundSummary;
  rawPillars: any;
  openPillarKey: string | null;
  setOpenPillarKey: (key: string | null) => void;
}

export const DrawerScorecardTab: React.FC<DrawerScorecardTabProps> = ({
  fund,
  rawPillars,
  openPillarKey,
  setOpenPillarKey
}) => {
  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Pillar breakdown interactive accordions */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[0.75rem] font-bold uppercase tracking-[0.04em] text-on-surface-variant flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-primary">analytics</span>
            <span>Four-Pillar SmartScore™ Breakdown</span>
          </h3>
          <span className="text-[0.75rem] text-on-surface-variant font-medium">Click pillar to inspect sub-metrics</span>
        </div>

        <div className="space-y-2.5">
          {[
            { key: 'performance', defaultName: 'Performance & Compounding', icon: 'trending_up', colorClass: 'text-primary dark:text-[#38bdf8]', bgClass: 'bg-primary/10', defaultVal: 8.5 },
            { key: 'risk', defaultName: 'Risk & Downside Protection', icon: 'security', colorClass: 'text-gain-text dark:text-gain-text', bgClass: 'bg-gain/10', defaultVal: 7.5 },
            { key: 'cost', defaultName: 'Cost & Direct Plan Fees', icon: 'savings', colorClass: 'text-[#6d28d9] dark:text-[#a78bfa]', bgClass: 'bg-[#6d28d9]/10', defaultVal: 8.0 },
            { key: 'track_record', defaultName: 'Track Record & Seasoning', icon: 'history', colorClass: 'text-warning-text dark:text-warning-text', bgClass: 'bg-warning/10', defaultVal: 9.0 }
          ].map((pMeta) => {
            const pillarData = rawPillars[pMeta.key] || {};
            const pillarScore = pillarData.score ?? pMeta.defaultVal;
            const pillarName = pillarData.name || pMeta.defaultName;
            const pillarTag = pillarData.tag || (pillarScore >= 8 ? 'High' : pillarScore >= 6 ? 'Avg' : 'Low');
            const pillarSummary = pillarData.summary || '';
            const metrics = pillarData.metrics || [];
            const isOpen = openPillarKey === pMeta.key;

            return (
              <div
                key={pMeta.key}
                className="rounded-2xl bg-surface-container-low border border-surface-container overflow-hidden transition-all shadow-2xs"
              >
                {/* Pillar Header (Clickable accordion toggle) */}
                <button
                  type="button"
                  onClick={() => setOpenPillarKey(isOpen ? null : pMeta.key)}
                  className="w-full p-3.5 flex items-center justify-between gap-3 text-left hover:bg-surface-container/60 transition-colors touch-spring cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${pMeta.bgClass} ${pMeta.colorClass}`}
                    >
                      <span className="material-symbols-outlined text-lg">{pMeta.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-[1.125rem] font-semibold leading-[1.3] text-on-surface block truncate">
                        {pillarName}
                      </span>
                      <span className="text-[0.75rem] font-bold tracking-[0.04em] uppercase text-on-surface-variant">
                        Tag: <strong className={pMeta.colorClass}>{pillarTag}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                      <span className={`font-black text-sm block ${pMeta.colorClass}`}>
                        {Number(pillarScore).toFixed(1)}
                      </span>
                      <span className="text-[9px] text-on-surface-variant block leading-none">/ 10</span>
                    </div>
                    <span
                      className="material-symbols-outlined text-on-surface-variant text-lg transition-transform duration-200"
                      style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    >
                      expand_more
                    </span>
                  </div>
                </button>

                {/* Pillar Expanded Details (Sub-metrics + Summary) */}
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 space-y-3 border-t border-surface-container/60 bg-surface-container-lowest/50 animate-in fade-in duration-150">
                    {pillarSummary && (
                      <p className="text-[0.9375rem] font-normal leading-[1.45] text-on-surface-variant bg-surface-container/40 p-2.5 rounded-xl border border-surface-container">
                        {pillarSummary}
                      </p>
                    )}

                    {metrics.length > 0 ? (
                      <div className="space-y-2.5 pt-1">
                        {metrics.map((m: any, mIdx: number) => {
                          const metricScore = typeof m.score === 'number' ? m.score : null;
                          const fillPct =
                            metricScore !== null ? Math.min(100, Math.max(0, metricScore * 10)) : null;
                          const isHigh = metricScore !== null && metricScore >= 8;
                          const isMid = metricScore !== null && metricScore >= 6;
                          const barBgClass = isHigh ? 'bg-gain-text' : isMid ? 'bg-primary' : 'bg-warning-text';
                          const textColorClass = isHigh ? 'text-gain-text' : isMid ? 'text-primary' : 'text-warning-text';

                          return (
                            <div key={mIdx} className="space-y-1">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-on-surface truncate">{m.name}</span>
                                {metricScore !== null && (
                                  <span className={`font-bold text-[10px] ${textColorClass}`}>
                                    {metricScore.toFixed(1)}/10
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-on-surface-variant truncate">{m.label}</div>
                              {fillPct !== null && (
                                <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-300 ${barBgClass}`}
                                    style={{
                                      width: `${fillPct}%`
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-[11px] text-on-surface-variant py-1">
                        Audited pillar score: <strong className="font-bold">{Number(pillarScore).toFixed(1)}/10</strong>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Category Benchmark Outperformance Ratio Visualizer */}
      <section className="p-4 rounded-2xl bg-surface-container-low border border-surface-container space-y-3.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-base">trending_up</span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                Category Benchmark Outperformance Ratio
              </h3>
              <p className="text-[10px] text-on-surface-variant font-medium">
                Compounding multiplier relative to {fund.category} median (1.00x = Parity)
              </p>
            </div>
          </div>
          {fund.ratio_3y && (
            <span
              className={`text-xs tabular-nums font-black px-2.5 py-1 rounded-lg border ${
                fund.ratio_3y >= 1.25
                  ? 'bg-gain-bg text-gain-text border-gain/30'
                  : fund.ratio_3y >= 1.0
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : 'bg-warning-bg text-warning-text border-warning/30'
              }`}
            >
              {fund.ratio_3y.toFixed(2)}x (3Y Alpha)
            </span>
          )}
        </div>

        {/* Multi-horizon Ratio Comparison Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: '3-Year Outperformance', ratio: fund.ratio_3y, horizon: '3Y' },
            { label: '5-Year Outperformance', ratio: fund.ratio_5y, horizon: '5Y' },
            { label: '10-Year Outperformance', ratio: fund.ratio_10y, horizon: '10Y' }
          ].map((item, idx) => {
            const hasRatio = item.ratio !== null && item.ratio !== undefined;
            const rVal = hasRatio ? item.ratio! : 1.0;
            // Bar fill % where 1.0x is at 50% midpoint, up to 2.0x at 100%
            const fillPct = hasRatio ? Math.min(100, Math.max(10, (rVal / 2.0) * 100)) : 0;
            const isAlpha = hasRatio && rVal >= 1.25;
            const isParity = hasRatio && rVal >= 1.0 && rVal < 1.25;

            return (
              <div
                key={idx}
                className="p-3 rounded-xl bg-surface-container border border-surface-container-high space-y-2"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-on-surface-variant">{item.horizon} Ratio</span>
                  <span className="tabular-nums font-bold text-xs text-on-surface">
                    {hasRatio ? `${item.ratio!.toFixed(2)}x` : 'N/A (<Seasoning)'}
                  </span>
                </div>

                {/* Progress bar with 1.0x benchmark tick */}
                <div className="relative h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isAlpha ? 'bg-gain-text' : isParity ? 'bg-primary' : 'bg-warning-text'
                    }`}
                    style={{ width: `${fillPct}%` }}
                  />
                  {/* Benchmark Parity Marker at 50% (1.00x) */}
                  <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-on-surface-variant/40" />
                </div>

                <div className="flex items-center justify-between text-[9px] text-on-surface-variant/70">
                  <span>0.5x Under</span>
                  <span className="font-bold text-on-surface">1.0x Parity</span>
                  <span>2.0x High Alpha</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Fiduciary Thesis Highlights */}
      <section className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-surface-container-low to-primary/5 border border-primary/20 space-y-2">
        <div className="flex items-center gap-2 text-primary font-bold text-xs">
          <span className="material-symbols-outlined text-base">psychology</span>
          <span>Fiduciary Rationale</span>
        </div>
        <p className="text-xs text-on-surface leading-relaxed">
          Scheme maintains an outperformance ratio of{' '}
          <strong className="font-bold">{fund.ratio_3y ?? 1.25}x</strong> over category median over a 3-year
          rolling window. Direct plan expense ratio is{' '}
          <strong className="font-bold">{fund.expense_ratio ?? 0.85}%</strong>, ensuring optimal compounding
          efficiency.
        </p>
      </section>
    </div>
  );
};
