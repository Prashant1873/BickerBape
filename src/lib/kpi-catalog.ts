import { FundSummary } from '@/types/fund';

export interface KpiMetric {
  id: string;
  label: string;
  category: 'Rating' | 'Returns' | 'Risk' | 'Cost' | 'Valuation' | 'Fiduciary';
  align: 'text-left' | 'text-center' | 'text-right';
  sortKey: string;
  infoKey?: string;
  sample: string;
}

export const KPI_CATALOG: Record<string, KpiMetric> = {
  smart_score: {
    id: 'smart_score',
    label: 'SmartScore™',
    category: 'Rating',
    align: 'text-center',
    sortKey: 'smart_score',
    sample: 'Proprietary institutional score (1 to 10)'
  },
  cagr_3y: {
    id: 'cagr_3y',
    label: '3Y Ret & Ratio',
    category: 'Returns',
    align: 'text-right',
    sortKey: 'cagr_3y',
    sample: '3Y CAGR + Outperformance vs Category'
  },
  cagr_5y: {
    id: 'cagr_5y',
    label: '5Y Ret & Ratio',
    category: 'Returns',
    align: 'text-right',
    sortKey: 'cagr_5y',
    sample: '5Y CAGR + Outperformance vs Category'
  },
  cagr_10y: {
    id: 'cagr_10y',
    label: '10Y CAGR',
    category: 'Returns',
    align: 'text-right',
    sortKey: 'cagr_10y',
    sample: '10-Year Compound Annual Growth Rate'
  },
  cagr_1y: {
    id: 'cagr_1y',
    label: '1Y Return',
    category: 'Returns',
    align: 'text-right',
    sortKey: 'cagr_1y',
    sample: 'Trailing 1-Year absolute return'
  },
  growth_3m: {
    id: 'growth_3m',
    label: '3M Growth',
    category: 'Returns',
    align: 'text-right',
    sortKey: 'growth_3m',
    sample: 'Recent quarterly growth (+% or -%)'
  },
  rolling_3y_avg: {
    id: 'rolling_3y_avg',
    label: '3Y Rolling Avg',
    category: 'Returns',
    align: 'text-right',
    sortKey: 'rolling_3y_avg',
    sample: '3-Year rolling return consistency average'
  },
  sharpe_ratio: {
    id: 'sharpe_ratio',
    label: 'Sharpe Ratio',
    category: 'Risk',
    align: 'text-right',
    sortKey: 'sharpe_ratio',
    sample: 'Excess return per unit of volatility'
  },
  sortino_ratio: {
    id: 'sortino_ratio',
    label: 'Sortino Ratio',
    category: 'Risk',
    align: 'text-right',
    sortKey: 'sortino_ratio',
    sample: 'Downside risk-adjusted performance measure'
  },
  volatility: {
    id: 'volatility',
    label: 'Volatility (σ)',
    category: 'Risk',
    align: 'text-right',
    sortKey: 'volatility',
    sample: 'Annualized price fluctuation standard deviation'
  },
  max_drawdown: {
    id: 'max_drawdown',
    label: 'Max Drawdown',
    category: 'Risk',
    align: 'text-right',
    sortKey: 'max_drawdown',
    sample: 'Maximum peak-to-trough historical drop'
  },
  beta: {
    id: 'beta',
    label: 'Beta',
    category: 'Risk',
    align: 'text-right',
    sortKey: 'beta',
    sample: 'Sensitivity relative to market benchmark'
  },
  expense_ratio: {
    id: 'expense_ratio',
    label: 'Direct TER',
    category: 'Cost',
    align: 'text-right',
    sortKey: 'expense_ratio',
    sample: 'Total Direct Plan Annual Expense Ratio (%)'
  },
  exit_load_pct: {
    id: 'exit_load_pct',
    label: 'Exit Load',
    category: 'Cost',
    align: 'text-right',
    sortKey: 'exit_load_pct',
    sample: 'Redemption penalty within lock-in period'
  },
  aum_cr: {
    id: 'aum_cr',
    label: 'AUM (₹ Cr)',
    category: 'Cost',
    align: 'text-right',
    sortKey: 'aum_cr',
    sample: 'Asset Under Management in ₹ Crores'
  },
  pe_ratio: {
    id: 'pe_ratio',
    label: 'P/E Ratio',
    category: 'Valuation',
    align: 'text-right',
    sortKey: 'pe_ratio',
    sample: 'Portfolio Weighted Price to Earnings'
  },
  pb_ratio: {
    id: 'pb_ratio',
    label: 'P/B Ratio',
    category: 'Valuation',
    align: 'text-right',
    sortKey: 'pb_ratio',
    sample: 'Portfolio Weighted Price to Book'
  },
  manager_tenure_years: {
    id: 'manager_tenure_years',
    label: 'Manager Tenure',
    category: 'Fiduciary',
    align: 'text-center',
    sortKey: 'manager_tenure_years',
    sample: 'Fund manager continuous track record in years'
  }
};

export const DEFAULT_TABLE_COLUMNS = [
  'smart_score',
  'cagr_3y',
  'cagr_5y',
  'cagr_10y',
  'rolling_3y_avg',
  'sharpe_ratio',
  'volatility'
];
