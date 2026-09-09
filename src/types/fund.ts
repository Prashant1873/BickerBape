export type InvestorMood = 'growth' | 'safety' | 'income';
export type ViewMode = 'cards' | 'table';

export interface NavPoint {
  date: string;
  nav: number;
}

export interface SmartScorePillars {
  return_ratios: number;
  track_record: number;
  risk_volatility: number;
  expense_ratio: number;
  composition?: number;
  red_flags?: number;
}

export interface SmartScore {
  overall: number;
  percentile?: number;
  pillars: SmartScorePillars;
  explanations?: Record<string, string>;
  grade?: string;
  seasoning_cap?: number | null;
}

export interface Holding {
  company: string;
  weight_pct: number;
}

export interface FundSummary {
  code: string | number;
  name: string;
  category: string;
  fund_house: string;
  manager?: string;
  manager_tenure_years?: number;
  manager_change_recently?: boolean;
  aum_cr?: number | null;
  expense_ratio?: number | null;
  pe_ratio?: number | null;
  pb_ratio?: number | null;
  top_holdings?: Holding[] | string;
  top10_concentration_pct?: number | null;
  latest_nav?: number | null;
  nav_date?: string;
  cagr_1y?: number | null;
  cagr_3y?: number | null;
  cagr_5y?: number | null;
  cagr_10y?: number | null;
  rolling_3y_avg?: number | null;
  rolling_3y_min?: number | null;
  rolling_3y_max?: number | null;
  rolling_3y_positive_pct?: number | null;
  rolling_3y_beat12_pct?: number | null;
  volatility?: number | null;
  sharpe_ratio?: number | null;
  sortino_ratio?: number | null;
  beta?: number | null;
  turnover_ratio?: number | null;
  max_drawdown?: number | null;
  exit_load_pct?: number | null;
  sparkline?: number[];
  returns_vs_category_3y?: number | null;
  returns_vs_category_5y?: number | null;
  returns_vs_category_10y?: number | null;
  volatility_vs_category?: number | null;
  alpha_estimate?: number | null;
  suggester_score?: number | null;
  star_rating?: number | null;
  smart_score?: SmartScore;
  growth_3m?: number | null;
  ratio_3y?: number | null;
  ratio_5y?: number | null;
  ratio_10y?: number | null;
  is_young_fund?: boolean;
  history_years?: number;
  isin_growth?: string;
  total_daily_points?: number;
  rolling_series?: any[];
  checklist?: any;
}

export interface FundNavDetail {
  code: string | number;
  name: string;
  category?: string;
  latest_nav?: number;
  nav_date?: string;
  nav_history: NavPoint[];
}

export interface CategoryData {
  cagr_3y_avg?: number;
  cagr_5y_avg?: number;
  cagr_10y_avg?: number;
  volatility_avg?: number;
  ter_avg?: number;
  rolling_3y_avg?: number;
  sharpe_avg?: number;
  fund_count?: number;
}

export type CategoriesSummary = Record<string, CategoryData>;

export interface ScreenerFilterState {
  mood: InvestorMood;
  category: string;
  preset: string;
  searchQuery: string;
  minSmartScore: number;
  minRollingReturn: number;
  minSharpe: number;
  maxVolatility: number;
  sortBy: string;
  sortDir: 'asc' | 'desc';
  currentView: ViewMode;
  displayLimit: number;
  tableColumns: string[];
}
