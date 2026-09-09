'use client';

import React, { useState } from 'react';
import { useScreener } from '@/context/ScreenerContext';
import { KPI_CATALOG, DEFAULT_TABLE_COLUMNS } from '@/lib/kpi-catalog';

export const KpiModal: React.FC = () => {
  const {
    isKpiModalOpen,
    setIsKpiModalOpen,
    tableColumns,
    setTableColumns
  } = useScreener();

  const [selectedCols, setSelectedCols] = useState<string[]>(tableColumns);
  const [searchTerm, setSearchTerm] = useState<string>('');

  if (!isKpiModalOpen) return null;

  const allMetrics = Object.values(KPI_CATALOG);

  // Group metrics by category
  const categories = ['Rating', 'Returns', 'Risk', 'Cost', 'Valuation', 'Fiduciary'] as const;

  const filteredMetrics = allMetrics.filter(m => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return m.label.toLowerCase().includes(q) || m.sample.toLowerCase().includes(q);
  });

  const toggleColumn = (colId: string) => {
    setSelectedCols(prev => {
      if (prev.includes(colId)) {
        if (prev.length <= 1) {
          alert('At least 1 column must remain active.');
          return prev;
        }
        return prev.filter(c => c !== colId);
      } else {
        return [...prev, colId];
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedCols(allMetrics.map(m => m.id));
  };

  const handleSelectCategory = (category: string) => {
    const catCols = allMetrics.filter(m => m.category === category).map(m => m.id);
    setSelectedCols(Array.from(new Set([...selectedCols, ...catCols])));
  };

  const handleRestoreDefaults = () => {
    setSelectedCols(DEFAULT_TABLE_COLUMNS);
  };

  const handleApply = () => {
    setTableColumns(selectedCols);
    setIsKpiModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-surface rounded-2xl border border-surface-container max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-surface-container flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">view_column</span>
            <div>
              <h3 className="font-headline-md font-bold text-sm sm:text-base text-on-surface">
                Customize Financial KPIs
              </h3>
              <p className="text-[11px] text-on-surface-variant">
                Select columns to display in your screener table ({selectedCols.length} active)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsKpiModalOpen(false)}
            className="w-10 h-10 rounded-full hover:bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center touch-spring"
            aria-label="Close dialog"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        {/* Search & Quick Select Presets */}
        <div className="p-3 border-b border-surface-container bg-surface-container-low/60 space-y-2">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search metrics (TER, Sharpe, CAGR, Drawdown, P/E)..."
              className="w-full bg-surface border border-surface-container rounded-lg py-1.5 pl-8 pr-3 text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[38px]"
            />
          </div>

          {/* Quick Select Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-[10px] font-bold uppercase text-on-surface-variant mr-1">Quick Select:</span>
            <button
              type="button"
              onClick={handleSelectAll}
              className="px-2 py-0.5 rounded-md bg-surface border border-surface-container text-[11px] font-semibold text-on-surface hover:border-primary touch-spring"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={() => handleSelectCategory('Returns')}
              className="px-2 py-0.5 rounded-md bg-surface border border-surface-container text-[11px] font-semibold text-on-surface hover:border-primary touch-spring"
            >
              All Returns
            </button>
            <button
              type="button"
              onClick={() => handleSelectCategory('Risk')}
              className="px-2 py-0.5 rounded-md bg-surface border border-surface-container text-[11px] font-semibold text-on-surface hover:border-primary touch-spring"
            >
              All Risk
            </button>
            <button
              type="button"
              onClick={handleRestoreDefaults}
              className="px-2 py-0.5 rounded-md bg-surface border border-surface-container text-[11px] font-semibold text-primary hover:bg-primary/5 touch-spring"
            >
              Restore Defaults
            </button>
          </div>
        </div>

        {/* Metrics List */}
        <div className="p-4 overflow-y-auto max-h-[50vh] hide-scrollbar space-y-4">
          {categories.map(cat => {
            const metricsInCat = filteredMetrics.filter(m => m.category === cat);
            if (metricsInCat.length === 0) return null;

            return (
              <div key={cat} className="space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-primary font-mono pb-1 border-b border-surface-container/60">
                  {cat}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {metricsInCat.map(metric => {
                    const isChecked = selectedCols.includes(metric.id);
                    return (
                      <label
                        key={metric.id}
                        className={`flex items-start gap-2.5 p-2 rounded-xl border transition-all cursor-pointer select-none touch-spring ${
                          isChecked
                            ? 'bg-primary/5 border-primary/30 text-on-surface'
                            : 'bg-surface-container-low/40 border-surface-container text-on-surface-variant hover:bg-surface-container-low'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleColumn(metric.id)}
                          className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary/40 cursor-pointer"
                        />
                        <div className="min-w-0">
                          <span className="block text-xs font-bold text-on-surface leading-tight">
                            {metric.label}
                          </span>
                          <span className="block text-[10px] text-on-surface-variant/80 truncate mt-0.5">
                            {metric.sample}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-surface-container bg-surface-container-low flex items-center justify-between">
          <button
            type="button"
            onClick={handleRestoreDefaults}
            className="text-xs text-primary font-bold hover:underline"
          >
            Reset Defaults
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsKpiModalOpen(false)}
              className="min-h-[40px] px-3.5 py-1.5 rounded-xl border border-surface-container bg-surface text-xs font-bold text-on-surface-variant hover:text-on-surface touch-spring"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="min-h-[40px] px-5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold shadow-xs hover:bg-primary-container touch-spring flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">table_chart</span>
              <span>Apply Table KPIs</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
