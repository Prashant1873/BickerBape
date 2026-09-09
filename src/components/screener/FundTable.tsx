'use client';

import React from 'react';
import { FundSummary } from '@/types/fund';
import { useScreener } from '@/context/ScreenerContext';
import { KPI_CATALOG } from '@/lib/kpi-catalog';
import { getSuperScoreTheme } from '@/lib/smartscore';

interface FundTableProps {
  funds: FundSummary[];
}

export const FundTable: React.FC<FundTableProps> = ({ funds }) => {
  const {
    tableColumns,
    filters,
    updateFilter,
    comparisonList,
    toggleComparison,
    setSelectedFundCode,
    displayLimit,
    loadMoreFunds
  } = useScreener();

  const displayedFunds = funds.slice(0, displayLimit);

  const handleSort = (sortKey: string) => {
    if (filters.sortBy === sortKey) {
      updateFilter('sortDir', filters.sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      updateFilter('sortBy', sortKey);
      updateFilter('sortDir', 'desc');
    }
  };

  const renderCellContent = (fund: FundSummary, colId: string) => {
    switch (colId) {
      case 'smart_score': {
        const score = fund.smart_score?.overall ?? (fund.suggester_score ? fund.suggester_score / 10 : 6.0);
        const theme = getSuperScoreTheme(score);
        return (
          <div className="flex flex-col items-center">
            <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded-lg border ${theme.badgeBg} ${theme.badgeBorder} ${theme.badgeText}`}>
              {score.toFixed(1)}
            </span>
            {fund.smart_score && (fund.smart_score as any).rank_text && (
              <span className="text-[10px] text-on-surface-variant mt-0.5 truncate max-w-[100px]">
                {(fund.smart_score as any).rank_text.split(' of ')[0]}
              </span>
            )}
          </div>
        );
      }
      case 'cagr_3y': {
        const val = fund.cagr_3y;
        if (val === null || val === undefined) return <span className="text-on-surface-variant font-mono">-</span>;
        return (
          <div>
            <span className={`font-mono font-bold text-xs ${val >= 0 ? 'text-gain' : 'text-loss'}`}>
              {val > 0 ? '+' : ''}{val.toFixed(1)}%
            </span>
            {fund.ratio_3y && (
              <span className="block text-[10px] font-bold text-primary font-mono">
                {fund.ratio_3y}x cat
              </span>
            )}
          </div>
        );
      }
      case 'cagr_5y': {
        const val = fund.cagr_5y;
        if (val === null || val === undefined) return <span className="text-on-surface-variant font-mono">-</span>;
        return (
          <div>
            <span className={`font-mono font-bold text-xs ${val >= 0 ? 'text-gain' : 'text-loss'}`}>
              {val > 0 ? '+' : ''}{val.toFixed(1)}%
            </span>
            {fund.ratio_5y && (
              <span className="block text-[10px] text-on-surface-variant font-mono">
                {fund.ratio_5y}x
              </span>
            )}
          </div>
        );
      }
      case 'cagr_10y': {
        const val = fund.cagr_10y;
        if (val === null || val === undefined) return <span className="text-on-surface-variant font-mono">-</span>;
        return (
          <span className={`font-mono font-bold text-xs ${val >= 0 ? 'text-gain' : 'text-loss'}`}>
            {val > 0 ? '+' : ''}{val.toFixed(1)}%
          </span>
        );
      }
      case 'cagr_1y': {
        const val = fund.cagr_1y;
        if (val === null || val === undefined) return <span className="text-on-surface-variant font-mono">-</span>;
        return (
          <span className={`font-mono font-bold text-xs ${val >= 0 ? 'text-gain' : 'text-loss'}`}>
            {val > 0 ? '+' : ''}{val.toFixed(1)}%
          </span>
        );
      }
      case 'growth_3m': {
        const val = fund.growth_3m;
        if (val === null || val === undefined) return <span className="text-on-surface-variant font-mono">-</span>;
        return (
          <span className={`font-mono font-bold text-xs ${val >= 0 ? 'text-gain' : 'text-loss'}`}>
            {val > 0 ? '+' : ''}{val.toFixed(1)}%
          </span>
        );
      }
      case 'rolling_3y_avg': {
        const val = fund.rolling_3y_avg;
        if (val === null || val === undefined) return <span className="text-on-surface-variant font-mono">-</span>;
        return (
          <span className="font-mono font-bold text-xs text-primary">
            {val.toFixed(1)}%
          </span>
        );
      }
      case 'sharpe_ratio': {
        const val = fund.sharpe_ratio;
        if (val === null || val === undefined) return <span className="text-on-surface-variant font-mono">-</span>;
        return (
          <span className={`font-mono font-bold text-xs ${val >= 1.0 ? 'text-gain' : 'text-on-surface'}`}>
            {val.toFixed(2)}
          </span>
        );
      }
      case 'sortino_ratio': {
        const val = fund.sortino_ratio;
        if (val === null || val === undefined) return <span className="text-on-surface-variant font-mono">-</span>;
        return (
          <span className={`font-mono font-bold text-xs ${val >= 1.2 ? 'text-gain' : 'text-on-surface'}`}>
            {val.toFixed(2)}
          </span>
        );
      }
      case 'volatility': {
        const val = fund.volatility;
        if (val === null || val === undefined) return <span className="text-on-surface-variant font-mono">-</span>;
        return (
          <span className="font-mono text-xs text-on-surface">
            {val.toFixed(1)}%
          </span>
        );
      }
      case 'max_drawdown': {
        const val = fund.max_drawdown;
        if (val === null || val === undefined) return <span className="text-on-surface-variant font-mono">-</span>;
        return (
          <span className="font-mono font-semibold text-xs text-loss">
            -{Math.abs(val).toFixed(1)}%
          </span>
        );
      }
      case 'beta': {
        const val = fund.beta;
        if (val === null || val === undefined) return <span className="text-on-surface-variant font-mono">-</span>;
        return (
          <span className="font-mono text-xs text-on-surface">
            {val.toFixed(2)}
          </span>
        );
      }
      case 'expense_ratio': {
        const val = fund.expense_ratio;
        if (val === null || val === undefined) return <span className="text-on-surface-variant font-mono">-</span>;
        return (
          <span className="font-mono text-xs text-on-surface font-semibold">
            {val.toFixed(2)}%
          </span>
        );
      }
      case 'exit_load_pct': {
        const val = fund.exit_load_pct;
        if (val === null || val === undefined) return <span className="text-on-surface-variant font-mono">-</span>;
        return (
          <span className="font-mono text-xs text-on-surface">
            {val.toFixed(1)}%
          </span>
        );
      }
      case 'aum_cr': {
        const val = fund.aum_cr;
        if (val === null || val === undefined) return <span className="text-on-surface-variant font-mono">-</span>;
        return (
          <span className="font-mono text-xs text-on-surface">
            ₹{val.toLocaleString()} Cr
          </span>
        );
      }
      case 'pe_ratio': {
        const val = fund.pe_ratio;
        if (val === null || val === undefined) return <span className="text-on-surface-variant font-mono">-</span>;
        return (
          <span className="font-mono text-xs text-on-surface">
            {val.toFixed(1)}
          </span>
        );
      }
      case 'pb_ratio': {
        const val = fund.pb_ratio;
        if (val === null || val === undefined) return <span className="text-on-surface-variant font-mono">-</span>;
        return (
          <span className="font-mono text-xs text-on-surface">
            {val.toFixed(1)}
          </span>
        );
      }
      case 'manager_tenure_years': {
        const val = fund.manager_tenure_years;
        if (val === null || val === undefined) return <span className="text-on-surface-variant font-mono">-</span>;
        return (
          <span className="font-mono text-xs text-on-surface px-1.5 py-0.5 rounded bg-surface-container">
            {val.toFixed(1)}y
          </span>
        );
      }
      default:
        return <span className="font-mono text-xs text-on-surface">-</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Table Outer Container with Horizontal Scroll */}
      <div className="rounded-2xl border border-surface-container bg-surface-container-lowest overflow-hidden shadow-xs">
        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container-low/80 border-b border-surface-container text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                {/* Sticky Left Header: Compare & Fund Name */}
                <th className="sticky left-0 z-20 bg-surface-container-low py-3 px-4 min-w-[240px] sm:min-w-[320px] shadow-[2px_0_5px_rgba(0,0,0,0.03)] dark:shadow-[2px_0_5px_rgba(0,0,0,0.2)]">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-on-surface-variant/70">#</span>
                    <span>Scheme &amp; Category</span>
                  </div>
                </th>

                {/* Dynamic Columns Headers */}
                {tableColumns.map(colId => {
                  const metric = KPI_CATALOG[colId];
                  if (!metric) return null;
                  const isSorted = filters.sortBy === metric.sortKey;
                  return (
                    <th
                      key={colId}
                      onClick={() => handleSort(metric.sortKey)}
                      className={`py-3 px-3 min-w-[110px] cursor-pointer select-none hover:bg-surface-container transition-colors ${metric.align}`}
                      title={`Sort by ${metric.label}`}
                    >
                      <div className={`inline-flex items-center gap-1 ${metric.align === 'text-right' ? 'justify-end' : metric.align === 'text-center' ? 'justify-center' : 'justify-start'}`}>
                        <span>{metric.label}</span>
                        {isSorted ? (
                          <span className="material-symbols-outlined text-xs text-primary font-black">
                            {filters.sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                          </span>
                        ) : (
                          <span className="material-symbols-outlined text-[10px] text-on-surface-variant/40 opacity-0 group-hover:opacity-100">
                            unfold_more
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-surface-container/60">
              {displayedFunds.map((fund, idx) => {
                const isCompared = comparisonList.includes(fund.code);
                return (
                  <tr
                    key={String(fund.code)}
                    onClick={() => setSelectedFundCode(fund.code)}
                    className="hover:bg-surface-container-low/60 cursor-pointer transition-colors group"
                  >
                    {/* Sticky Left Column: Compare Checkbox & Fund Identity */}
                    <td className="sticky left-0 z-10 bg-surface-container-lowest group-hover:bg-surface-container-low/90 py-3 px-4 shadow-[2px_0_5px_rgba(0,0,0,0.03)] dark:shadow-[2px_0_5px_rgba(0,0,0,0.2)] transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[11px] text-on-surface-variant/60 w-5">
                          {idx + 1}
                        </span>

                        {/* Compare Toggle Checkbox (Min 44x44px Click Target) */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleComparison(fund.code);
                          }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-container text-on-surface-variant touch-spring"
                          title={isCompared ? 'Remove from compare' : 'Add to compare'}
                        >
                          <input
                            type="checkbox"
                            checked={isCompared}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-primary focus:ring-primary/40 cursor-pointer"
                          />
                        </div>

                        {/* Name & Subtitle */}
                        <div className="min-w-0 pr-2">
                          <h4 className="font-bold text-on-surface text-xs truncate max-w-[190px] sm:max-w-[240px] group-hover:text-primary transition-colors">
                            {fund.name}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-on-surface-variant mt-0.5">
                            <span className="font-semibold text-primary/90 font-mono">{fund.category}</span>
                            <span>•</span>
                            <span className="truncate max-w-[120px]">{fund.fund_house}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Dynamic Data Cells */}
                    {tableColumns.map(colId => {
                      const metric = KPI_CATALOG[colId];
                      if (!metric) return null;
                      return (
                        <td key={colId} className={`py-3 px-3 ${metric.align}`}>
                          {renderCellContent(fund, colId)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination / Load More (Fitts's Law 44px Button) */}
      {displayedFunds.length < funds.length && (
        <div className="text-center py-2">
          <button
            type="button"
            onClick={loadMoreFunds}
            className="min-h-[44px] px-6 py-2.5 rounded-xl border border-surface-container bg-surface-container-low text-xs font-bold text-on-surface hover:text-primary hover:border-primary/40 shadow-xs touch-spring"
          >
            Load More Schemes ({funds.length - displayedFunds.length} remaining)
          </button>
        </div>
      )}
    </div>
  );
};
