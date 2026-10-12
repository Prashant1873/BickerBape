'use client';

import React, { useState, useMemo, useRef } from 'react';
import { FundSummary } from '@/types/fund';
import { SimulationReport } from '@/lib/simsim-engine';
import { AmcBadge } from '@/components/common/AmcBadge';

interface SimSimConstituentsTableProps {
  bucketFunds: FundSummary[];
  simsimWeights: Record<string | number, number>;
  simsimCapital: number;
  report: SimulationReport | null;
  setFundWeight: (code: string | number, weight: number) => void;
  setBatchWeights: (weights: Record<string | number, number>) => void;
  removeFromBucket: (code: string | number) => void;
}

export const SimSimConstituentsTable: React.FC<SimSimConstituentsTableProps> = ({
  bucketFunds,
  simsimWeights,
  simsimCapital,
  report,
  setFundWeight,
  setBatchWeights,
  removeFromBucket
}) => {
  const [draggingDividerIdx, setDraggingDividerIdx] = useState<number | null>(null);
  const splitBarRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="space-y-6">
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
              title={`Drag to reallocate between ${bucketFunds[idx].name.split(' - Direct')[0]} and ${
                bucketFunds[idx + 1].name.split(' - Direct')[0]
              }`}
            />
          ))}
        </div>

        {/* Constituent Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {bucketFunds.map((f) => {
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
                      <AmcBadge fundHouse={f.fund_house} size="sm" showLogoOnly />
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
                {report.constituents.map((c) => (
                  <tr
                    key={String(c.code)}
                    className="hover:bg-surface-container/50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="py-2.5 px-3">
                      <p className="font-bold text-on-surface dark:text-white text-xs truncate max-w-xs">
                        {c.name.split(' - Direct')[0]}
                      </p>
                      <p className="text-[10px] text-on-surface-variant dark:text-[#94A3B8]">
                        {c.category} • {c.fund_house}
                      </p>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#00A86B] dark:text-[#00F090]">
                      {c.weightPct}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-on-surface-variant dark:text-[#94A3B8]">
                      ₹{Math.round(c.allocatedCap).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-on-surface dark:text-white">
                      ₹{Math.round(c.presentValue).toLocaleString('en-IN')}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-mono font-bold ${
                        c.gain >= 0 ? 'text-gain-text dark:text-[#00F090]' : 'text-loss-text dark:text-[#FF4D4D]'
                      }`}
                    >
                      {c.gain >= 0 ? '+' : ''}₹{Math.round(c.gain).toLocaleString('en-IN')} (
                      {c.gainPct >= 0 ? '+' : ''}
                      {c.gainPct.toFixed(1)}%)
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-mono font-bold ${
                        c.cagr >= 0 ? 'text-primary dark:text-[#00D2FF]' : 'text-loss-text dark:text-[#FF4D4D]'
                      }`}
                    >
                      {c.cagr >= 0 ? '+' : ''}
                      {c.cagr.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-on-surface-variant dark:text-[#94A3B8]">
                      {c.units.toFixed(2)}
                    </td>
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
