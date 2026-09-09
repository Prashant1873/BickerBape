'use client';

import React, { useEffect, useState } from 'react';
import { useScreener } from '@/context/ScreenerContext';
import { NavPoint } from '@/types/fund';
import { fetchFundNavHistory } from '@/lib/data-loader';
import { getSuperScoreTheme } from '@/lib/smartscore';
import { NavChart } from '@/components/charts/NavChart';

export const FundDetailDrawer: React.FC = () => {
  const {
    selectedFundCode,
    setSelectedFundCode,
    funds,
    comparisonList,
    toggleComparison,
    mood
  } = useScreener();

  const [navHistory, setNavHistory] = useState<NavPoint[]>([]);
  const [loadingNav, setLoadingNav] = useState<boolean>(false);

  const fund = funds.find(f => f.code === selectedFundCode);

  // Load NAV history on-demand when fund is selected
  useEffect(() => {
    if (!selectedFundCode) {
      setNavHistory([]);
      return;
    }

    let isMounted = true;
    async function loadNav() {
      setLoadingNav(true);
      const hist = await fetchFundNavHistory(selectedFundCode!);
      if (isMounted) {
        setNavHistory(hist);
        setLoadingNav(false);
      }
    }
    loadNav();

    return () => {
      isMounted = false;
    };
  }, [selectedFundCode]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedFundCode) {
        setSelectedFundCode(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFundCode, setSelectedFundCode]);

  if (!fund) return null;

  const score = fund.smart_score?.overall ?? (fund.suggester_score ? fund.suggester_score / 10 : 6.0);
  const theme = getSuperScoreTheme(score);
  const isCompared = comparisonList.includes(fund.code);
  const pillars = (fund.smart_score as any)?.pillars || {};

  // Extract holdings array
  let holdingsList: Array<{ company: string; weight_pct: number }> = [];
  if (Array.isArray(fund.top_holdings)) {
    holdingsList = fund.top_holdings;
  } else if (typeof fund.top_holdings === 'string') {
    try {
      holdingsList = JSON.parse(fund.top_holdings);
    } catch (e) {}
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop blur with touch click dismiss */}
      <div
        onClick={() => setSelectedFundCode(null)}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        aria-hidden="true"
      />

      {/* Drawer Container (Desktop 620px right sheet, Mobile full-width bottom sheet) */}
      <div className="relative bg-surface w-full max-w-2xl h-full shadow-2xl flex flex-col z-10 border-l border-surface-container overflow-hidden animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-surface-container bg-surface-container-low flex items-start justify-between gap-3 flex-shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant">
                {fund.category}
              </span>
              {fund.is_young_fund && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-warning/15 text-warning-text border border-warning/30">
                  Young Scheme (&lt;3Y Seasoning Cap)
                </span>
              )}
            </div>

            <h2 className="font-headline-md font-bold text-base sm:text-lg text-on-surface leading-tight">
              {fund.name}
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {fund.fund_house} • Code: <span className="font-mono">{fund.code}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => setSelectedFundCode(null)}
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center touch-spring"
              aria-label="Close fund drawer"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        {/* Action & Quick Stats Bar */}
        <div className="p-4 border-b border-surface-container bg-surface-container-low/40 flex items-center justify-between gap-3 flex-wrap flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`px-3 py-1 rounded-xl border flex items-center gap-1.5 ${theme.badgeBg} ${theme.badgeBorder}`}>
              <span className="material-symbols-outlined text-sm text-primary">stars</span>
              <span className={`font-mono font-black text-sm ${theme.badgeText}`}>
                {score.toFixed(1)}
              </span>
              <span className="text-[10px] font-bold uppercase text-on-surface-variant">/ 10</span>
            </div>
            {fund.smart_score && (fund.smart_score as any).rank_text && (
              <span className="text-xs font-semibold text-on-surface">
                {(fund.smart_score as any).rank_text}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => toggleComparison(fund.code)}
            className={`min-h-[40px] px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 touch-spring border ${
              isCompared
                ? 'bg-primary text-white border-primary shadow-xs'
                : 'bg-surface border-surface-container text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {isCompared ? 'check' : 'add'}
            </span>
            <span>{isCompared ? 'In Comparison Tray' : 'Add to Compare'}</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 hide-scrollbar flex-1">
          {/* Section 1: Historical NAV Chart */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-primary">show_chart</span>
              <span>Historical NAV Timeline</span>
            </h3>
            {loadingNav ? (
              <div className="h-56 rounded-2xl bg-surface-container-low animate-pulse flex items-center justify-center text-xs text-on-surface-variant">
                Loading NAV historical points...
              </div>
            ) : (
              <NavChart navHistory={navHistory} fundName={fund.name} />
            )}
          </section>

          {/* Section 2: 5-Pillar SmartScore™ Scorecard */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-primary">analytics</span>
                <span>SmartScore™ 5-Pillar Scorecard</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 capitalize font-bold">
                {mood} Mood Weights
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Pillar 1: Return Ratios */}
              <div className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-on-surface">1. Return Ratios</span>
                  <span className="font-mono font-bold text-xs text-primary">
                    {pillars.performance?.score !== undefined ? `${pillars.performance.score.toFixed(1)}/10` : '6.0/10'}
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  Outperformance ratios vs benchmark: 3Y ({fund.ratio_3y || '1.0'}x), 5Y ({fund.ratio_5y || '1.0'}x).
                </p>
              </div>

              {/* Pillar 2: Track Record */}
              <div className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-on-surface">2. Track Record</span>
                  <span className="font-mono font-bold text-xs text-primary">
                    {pillars.track_record?.score !== undefined ? `${pillars.track_record.score.toFixed(1)}/10` : '6.0/10'}
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  3Y rolling return average: <strong className="text-on-surface font-mono">{fund.rolling_3y_avg ? `${fund.rolling_3y_avg.toFixed(1)}%` : 'N/A'}</strong>. Manager tenure: {fund.manager_tenure_years || 3}y.
                </p>
              </div>

              {/* Pillar 3: Risk & Volatility */}
              <div className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-on-surface">3. Risk &amp; Volatility</span>
                  <span className="font-mono font-bold text-xs text-primary">
                    {pillars.risk?.score !== undefined ? `${pillars.risk.score.toFixed(1)}/10` : '6.0/10'}
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  Sharpe: <strong className="text-on-surface font-mono">{fund.sharpe_ratio?.toFixed(2) || 'N/A'}</strong>. Volatility: {fund.volatility ? `${fund.volatility.toFixed(1)}%` : 'N/A'}. Max Drawdown: {fund.max_drawdown ? `${Math.abs(fund.max_drawdown).toFixed(1)}%` : 'N/A'}.
                </p>
              </div>

              {/* Pillar 4: Direct TER Cost */}
              <div className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-on-surface">4. Direct TER Cost</span>
                  <span className="font-mono font-bold text-xs text-primary">
                    {pillars.cost?.score !== undefined ? `${pillars.cost.score.toFixed(1)}/10` : '6.0/10'}
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  Direct Plan TER: <strong className="text-on-surface font-mono">{fund.expense_ratio ? `${fund.expense_ratio.toFixed(2)}%` : 'N/A'}</strong>. Zero distributor commission load.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Institutional & Fiduciary Profile */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-primary">account_balance</span>
              <span>Scheme Profile &amp; Fundamentals</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-surface-container-low border border-surface-container text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-on-surface-variant block">AUM</span>
                <span className="font-mono font-bold text-on-surface text-sm">
                  {fund.aum_cr ? `₹${fund.aum_cr.toLocaleString()} Cr` : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Portfolio P/E</span>
                <span className="font-mono font-bold text-on-surface text-sm">
                  {fund.pe_ratio ? fund.pe_ratio.toFixed(1) : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Portfolio P/B</span>
                <span className="font-mono font-bold text-on-surface text-sm">
                  {fund.pb_ratio ? fund.pb_ratio.toFixed(1) : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Exit Load</span>
                <span className="font-mono font-bold text-on-surface text-sm">
                  {fund.exit_load_pct !== null && fund.exit_load_pct !== undefined ? `${fund.exit_load_pct}%` : 'N/A'}
                </span>
              </div>
            </div>
          </section>

          {/* Section 4: Top 10 Holdings Table */}
          {holdingsList.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-primary">pie_chart</span>
                <span>Top 10 Holdings ({fund.top10_concentration_pct ? `${fund.top10_concentration_pct.toFixed(1)}% weight` : ''})</span>
              </h3>

              <div className="rounded-xl border border-surface-container overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-container-low text-on-surface-variant text-[10px] uppercase">
                    <tr>
                      <th className="py-2 px-3">Company</th>
                      <th className="py-2 px-3 text-right">Weight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container/60">
                    {holdingsList.map((h, i) => (
                      <tr key={i} className="hover:bg-surface-container-low/40">
                        <td className="py-2 px-3 font-medium text-on-surface">{h.company}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-primary">
                          {h.weight_pct ? `${h.weight_pct.toFixed(1)}%` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Section 5: Quantitative Investment Checklist */}
          <section className="space-y-2 pb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-gain">verified</span>
              <span>Quantitative Investment Checklist</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container flex items-center gap-2">
                <span className="material-symbols-outlined text-gain text-base">check_circle</span>
                <span>3Y Rolling Return &gt;= 16% Consistency</span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container flex items-center gap-2">
                <span className="material-symbols-outlined text-gain text-base">check_circle</span>
                <span>Sharpe Ratio &gt;= 0.70 Hurdle Met</span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container flex items-center gap-2">
                <span className="material-symbols-outlined text-gain text-base">check_circle</span>
                <span>Direct Plan TER Below Category Median</span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container flex items-center gap-2">
                <span className="material-symbols-outlined text-gain text-base">check_circle</span>
                <span>Manager Continuous Tenure &gt;= 3 Years</span>
              </div>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
};
