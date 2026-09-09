'use client';

import { useEffect, useState } from 'react';
import { FundSummary, InvestorMood } from '@/types/fund';
import { fetchFundsSummary } from '@/lib/data-loader';
import { recalculateSmartScoresForMood, MOOD_CONFIG } from '@/lib/smartscore';
import { AnalyticsEngine } from '@/lib/analytics';

export default function Home() {
  const [funds, setFunds] = useState<FundSummary[]>([]);
  const [mood, setMood] = useState<InvestorMood>('growth');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      setLoading(true);
      const data = await fetchFundsSummary();
      const scored = recalculateSmartScoresForMood(data, mood);
      setFunds(scored);
      setLoading(false);
    }
    init();
  }, []);

  const handleMoodChange = (newMood: InvestorMood) => {
    setMood(newMood);
    setFunds(prev => recalculateSmartScoresForMood(prev, newMood));
  };

  const eliteFunds = AnalyticsEngine.filterAndSortFunds(funds, {
    preset: 'smartscore_elite'
  });

  return (
    <main className="p-6 max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-surface-container pb-4">
        <div>
          <h1 className="text-2xl font-bold font-headline-lg text-primary flex items-center gap-2">
            <span>BickerBape</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-mono uppercase">Next.js</span>
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Indian Equity Direct-Growth Mutual Fund Screener &amp; Suggester (Chunk 1 Architecture Test)
          </p>
        </div>

        {/* Mood Selector Test */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-container-low rounded-xl border border-surface-container">
          {(['growth', 'safety', 'income'] as InvestorMood[]).map((m) => {
            const cfg = MOOD_CONFIG[m];
            const active = mood === m;
            return (
              <button
                key={m}
                onClick={() => handleMoodChange(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 touch-spring ${
                  active
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{cfg.icon}</span>
                <span>{cfg.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Status Card */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs">
          <span className="text-[11px] uppercase font-bold text-on-surface-variant">Universe Count</span>
          <p className="text-2xl font-bold text-on-surface mt-1">
            {loading ? '...' : `${funds.length} Schemes`}
          </p>
          <span className="text-[11px] text-gain font-semibold">100% Direct-Growth Indexed</span>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs">
          <span className="text-[11px] uppercase font-bold text-on-surface-variant">Active Mood Recalibration</span>
          <p className="text-2xl font-bold text-primary mt-1 capitalize flex items-center gap-1.5">
            <span>{mood}</span>
            <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20">
              {MOOD_CONFIG[mood].focus}
            </span>
          </p>
          <span className="text-[11px] text-on-surface-variant">SmartScore™ dynamically re-ranked</span>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs">
          <span className="text-[11px] uppercase font-bold text-on-surface-variant">SmartScore™ Elite (&gt;= 7.5)</span>
          <p className="text-2xl font-bold text-gain mt-1">
            {loading ? '...' : `${eliteFunds.length} Funds`}
          </p>
          <span className="text-[11px] text-on-surface-variant">Meeting institutional criteria</span>
        </div>
      </section>

      {/* Top Scored Funds Table Preview */}
      <section className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs">
        <h2 className="text-sm font-bold text-on-surface mb-3 flex items-center justify-between">
          <span>Top 5 Schemes in Current Mood ({mood})</span>
          <span className="text-xs font-normal text-on-surface-variant">Verifying TypeScript math &amp; ranking</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-surface-container text-on-surface-variant uppercase text-[10px]">
                <th className="py-2 px-3">Rank</th>
                <th className="py-2 px-3">Fund Name</th>
                <th className="py-2 px-3">Category</th>
                <th className="py-2 px-3 text-right">3Y CAGR</th>
                <th className="py-2 px-3 text-right">Sharpe</th>
                <th className="py-2 px-3 text-right">SmartScore™</th>
              </tr>
            </thead>
            <tbody>
              {funds.slice(0, 5).map((f, i) => (
                <tr key={String(f.code)} className="border-b border-surface-container/50 hover:bg-surface-container-low/50">
                  <td className="py-2.5 px-3 font-mono font-bold text-on-surface">{i + 1}</td>
                  <td className="py-2.5 px-3 font-medium text-on-surface max-w-[280px] truncate">{f.name}</td>
                  <td className="py-2.5 px-3 text-on-surface-variant">{f.category}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-gain">{f.cagr_3y ? `${f.cagr_3y.toFixed(1)}%` : 'N/A'}</td>
                  <td className="py-2.5 px-3 text-right font-mono">{f.sharpe_ratio ? f.sharpe_ratio.toFixed(2) : 'N/A'}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-primary">{f.smart_score?.overall.toFixed(1)} / 10</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
