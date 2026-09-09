'use client';

import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { NavPoint } from '@/types/fund';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

interface NavChartProps {
  navHistory: NavPoint[];
  fundName?: string;
}

type Horizon = '3M' | '1Y' | '3Y' | '5Y' | 'Max';

export const NavChart: React.FC<NavChartProps> = ({ navHistory }) => {
  const [horizon, setHorizon] = useState<Horizon>('3Y');

  // Filter history based on selected horizon
  const filteredData = useMemo(() => {
    if (!navHistory || navHistory.length === 0) {
      return { points: [], changePct: 0, startDate: '', endDate: '' };
    }

    let pts = [...navHistory];
    const latestDate = new Date(pts[pts.length - 1].date);

    if (horizon === '3M') {
      const cutoff = new Date(latestDate);
      cutoff.setMonth(cutoff.getMonth() - 3);
      const filtered = pts.filter(p => new Date(p.date) >= cutoff);
      pts = filtered.length >= 3 ? filtered : pts.slice(-30);
    } else if (horizon === '1Y') {
      const cutoff = new Date(latestDate);
      cutoff.setFullYear(cutoff.getFullYear() - 1);
      const filtered = pts.filter(p => new Date(p.date) >= cutoff);
      pts = filtered.length >= 3 ? filtered : pts.slice(-250);
    } else if (horizon === '3Y') {
      const cutoff = new Date(latestDate);
      cutoff.setFullYear(cutoff.getFullYear() - 3);
      const filtered = pts.filter(p => new Date(p.date) >= cutoff);
      pts = filtered.length >= 3 ? filtered : pts.slice(-750);
    } else if (horizon === '5Y') {
      const cutoff = new Date(latestDate);
      cutoff.setFullYear(cutoff.getFullYear() - 5);
      const filtered = pts.filter(p => new Date(p.date) >= cutoff);
      pts = filtered.length >= 3 ? filtered : pts;
    }

    if (pts.length < 2) {
      return { points: pts, changePct: 0, startDate: '', endDate: '' };
    }

    const startNav = pts[0].nav;
    const endNav = pts[pts.length - 1].nav;
    const changePct = parseFloat((((endNav - startNav) / startNav) * 100).toFixed(2));

    return {
      points: pts,
      changePct,
      startDate: pts[0].date,
      endDate: pts[pts.length - 1].date
    };
  }, [navHistory, horizon]);

  const { points, changePct, startDate, endDate } = filteredData;

  const chartData = useMemo(() => {
    // Downsample for performance if more than 300 points
    const step = Math.max(1, Math.floor(points.length / 250));
    const sampledPoints = points.filter((_, i) => i % step === 0 || i === points.length - 1);

    return {
      labels: sampledPoints.map(p => p.date),
      datasets: [
        {
          label: 'NAV (₹)',
          data: sampledPoints.map(p => p.nav),
          borderColor: '#0052cc',
          backgroundColor: (context: any) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 200);
            gradient.addColorStop(0, 'rgba(0, 82, 204, 0.22)');
            gradient.addColorStop(1, 'rgba(0, 82, 204, 0.00)');
            return gradient;
          },
          fill: true,
          tension: 0.25,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: '#0052cc',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 2
        }
      ]
    };
  }, [points]);

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { size: 11, weight: 'bold' },
        bodyFont: { size: 12, family: 'monospace' },
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => `NAV: ₹${(context.parsed.y ?? 0).toFixed(2)}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          maxTicksLimit: 6,
          font: { size: 10 }
        }
      },
      y: {
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          font: { size: 10 },
          callback: (val) => `₹${val}`
        }
      }
    }
  };

  const isPositive = changePct >= 0;

  return (
    <div className="space-y-3">
      {/* Horizon Controls & Headline */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          {points.length >= 2 ? (
            <div className="text-xs text-on-surface">
              <span>Growth in {horizon}: </span>
              <strong className={`font-mono font-bold ${isPositive ? 'text-gain' : 'text-loss'}`}>
                {isPositive ? '+' : ''}{changePct}%
              </strong>
              <span className="text-[11px] text-on-surface-variant ml-1 font-mono">
                ({startDate} to {endDate})
              </span>
            </div>
          ) : (
            <span className="text-xs text-on-surface-variant">Historical NAV Curve</span>
          )}
        </div>

        {/* Horizon Tabs */}
        <div className="flex items-center p-0.5 bg-surface-container-low border border-surface-container rounded-lg">
          {(['3M', '1Y', '3Y', '5Y', 'Max'] as Horizon[]).map(h => (
            <button
              key={h}
              type="button"
              onClick={() => setHorizon(h)}
              className={`min-h-[30px] px-2.5 rounded-md text-[11px] font-bold transition-all touch-spring ${
                horizon === h
                  ? 'bg-primary text-white shadow-2xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {h}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="h-56 sm:h-64 w-full bg-surface-container-lowest/70 rounded-2xl border border-surface-container/80 p-2 sm:p-3 shadow-2xs">
        {points.length > 0 ? (
          <Line data={chartData} options={options} />
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-on-surface-variant">
            Loading historical NAV time-series...
          </div>
        )}
      </div>
    </div>
  );
};
