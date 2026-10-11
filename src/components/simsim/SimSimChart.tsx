'use client';

import React, { useMemo } from 'react';
import { SimulationReport } from '@/lib/simsim-engine';
import { SimSimChartSkeleton } from './SimSimChartSkeleton';
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

interface SimSimChartProps {
  report: SimulationReport | null;
  simsimInvestmentMode: 'lumpsum' | 'sip';
  simsimCapital: number;
}

export const SimSimChart: React.FC<SimSimChartProps> = ({
  report,
  simsimInvestmentMode,
  simsimCapital
}) => {
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

  if (!chartData) return <SimSimChartSkeleton />;

  return (
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
  );
};
