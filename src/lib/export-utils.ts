import { SimulationReport } from './simsim-engine';
import { FundSummary } from '@/types/fund';

function escapeCsvCell(val: string | number | undefined | null): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates an institutional-grade UTF-8 CSV containing portfolio metadata,
 * constituent fund breakdown, and simulation trajectory data, triggering download.
 */
export function exportSimulationCsv(
  report: SimulationReport,
  bucketFunds: FundSummary[] = []
): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const lines: string[] = [];

  // UTF-8 BOM
  const BOM = '\uFEFF';

  // Section 1: Portfolio Overview
  lines.push('BICKERBAPE SIMSIM™ PORTFOLIO BACKTEST REPORT');
  lines.push(`Generated At,${new Date().toISOString()}`);
  lines.push('');
  lines.push('--- PORTFOLIO OVERVIEW ---');
  lines.push('Metric,Value');
  lines.push(`Strategy Mode,${escapeCsvCell(report.type.toUpperCase())}`);
  lines.push(`Start Date,${escapeCsvCell(report.startDate)}`);
  lines.push(`End Date,${escapeCsvCell(report.endDate)}`);
  lines.push(`Horizon (Years),${escapeCsvCell(report.years.toFixed(2))}`);
  lines.push(`Total Capital Invested (INR),${escapeCsvCell(report.totalCapital.toFixed(2))}`);
  lines.push(`Present Portfolio Value (INR),${escapeCsvCell(report.presentValue.toFixed(2))}`);
  lines.push(`Net Absolute Wealth Gain (INR),${escapeCsvCell(report.totalGain.toFixed(2))}`);
  lines.push(`Total Gain (%),${escapeCsvCell(report.totalGainPct.toFixed(2))}%`);
  lines.push(`Portfolio CAGR (%),${escapeCsvCell(report.cagr.toFixed(2))}%`);
  lines.push(`Benchmark Present Value (INR),${escapeCsvCell(report.benchmarkPresentValue.toFixed(2))}`);
  lines.push(`Benchmark CAGR (%),${escapeCsvCell(report.benchmarkCagr.toFixed(2))}%`);
  lines.push(`Excess Alpha Generated (%),${escapeCsvCell(report.alpha.toFixed(2))}%`);
  lines.push(`Maximum Drawdown (%),${escapeCsvCell(report.maxDrawdown.toFixed(2))}%`);
  if (report.installmentsCount) {
    lines.push(`SIP Installments Count,${escapeCsvCell(report.installmentsCount)}`);
  }
  lines.push('');

  // Section 2: Constituent Allocations
  lines.push('--- CONSTITUENT SCHEME HOLDINGS ---');
  lines.push(
    [
      'Scheme Code',
      'Scheme Name',
      'Category',
      'AMC / Fund House',
      'Allocation Weight (%)',
      'Capital Allocated (INR)',
      'Present Value (INR)',
      'Gain (INR)',
      'Gain (%)',
      'CAGR (%)'
    ].map(escapeCsvCell).join(',')
  );

  const fundMap = new Map<string | number, FundSummary>();
  bucketFunds.forEach((f) => fundMap.set(f.code, f));

  report.constituents.forEach((c) => {
    const meta = fundMap.get(c.code);
    lines.push(
      [
        c.code,
        c.name,
        c.category || meta?.category || 'N/A',
        c.fund_house || meta?.fund_house || 'N/A',
        c.weightPct.toFixed(2),
        c.allocatedCap.toFixed(2),
        c.presentValue.toFixed(2),
        c.gain.toFixed(2),
        `${c.gainPct.toFixed(2)}%`,
        `${c.cagr.toFixed(2)}%`
      ].map(escapeCsvCell).join(',')
    );
  });
  lines.push('');

  // Section 3: Time Series Trajectory
  lines.push('--- SIMULATION TRAJECTORY TIME-SERIES ---');
  lines.push(
    ['Date', 'Invested Capital (INR)', 'Portfolio Value (INR)', 'Benchmark Value (INR)'].map(escapeCsvCell).join(',')
  );

  const bmMap = new Map<string, number>();
  report.benchmarkSeries.forEach((pt) => bmMap.set(pt.date, pt.value));

  const invMap = new Map<string, number>();
  report.investedSeries.forEach((pt) => invMap.set(pt.date, pt.value));

  report.timeSeries.forEach((pt) => {
    const invVal = invMap.get(pt.date) ?? report.totalCapital;
    const bmVal = bmMap.get(pt.date) ?? pt.value;
    lines.push(
      [
        pt.date,
        invVal.toFixed(2),
        pt.value.toFixed(2),
        bmVal.toFixed(2)
      ].map(escapeCsvCell).join(',')
    );
  });

  const csvContent = BOM + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `simsim-portfolio-backtest-${report.startDate}-to-${report.endDate}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Triggers native formatted browser print dialog for institutional report sharing
 */
export function printSimulationSummary(): void {
  if (typeof window !== 'undefined') {
    window.print();
  }
}
