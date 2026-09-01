/**
 * BickerBape Financial Analytics & KPI Engine
 * Pure math & strategy evaluators matching the 10-step video framework.
 */

const RISK_FREE_RATE = 6.8; // RBI 10Y G-Sec / T-bill rate (%)

export class AnalyticsEngine {
  /**
   * Calculates Compound Annual Growth Rate (CAGR)
   * @param {number} startNav 
   * @param {number} endNav 
   * @param {number} years 
   * @returns {number|null}
   */
  static calculateCAGR(startNav, endNav, years) {
    if (!startNav || !endNav || startNav <= 0 || endNav <= 0 || years <= 0) return null;
    return Number((((endNav / startNav) ** (1 / years) - 1) * 100).toFixed(2));
  }

  /**
   * Calculates Sharpe Ratio
   * @param {number} returnPct Annualized return (%)
   * @param {number} volatilityPct Annualized standard deviation (%)
   * @returns {number}
   */
  static calculateSharpe(returnPct, volatilityPct) {
    if (!volatilityPct || volatilityPct <= 0) return 0;
    return Number(((returnPct - RISK_FREE_RATE) / volatilityPct).toFixed(2));
  }

  /**
   * Filters and sorts funds based on user criteria & active preset
   * @param {Array} funds 
   * @param {Object} options 
   * @returns {Array}
   */
  static filterAndSortFunds(funds, options = {}) {
    const {
      searchQuery = '',
      category = 'All Funds',
      preset = 'all',
      minRollingReturn = -100,
      minSharpe = -10,
      maxVolatility = 100,
      sortBy = 'suggester_score',
      sortDir = 'desc'
    } = options;

    let result = funds.filter(fund => {
      // 1. Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = fund.name.toLowerCase().includes(q);
        const matchHouse = fund.fund_house.toLowerCase().includes(q);
        const matchCat = fund.category.toLowerCase().includes(q);
        const matchManager = fund.manager && fund.manager.toLowerCase().includes(q);
        if (!matchName && !matchHouse && !matchCat && !matchManager) {
          return false;
        }
      }

      // 2. Category Filter
      if (category !== 'All Funds' && fund.category !== category) {
        return false;
      }

      // 3. Slider Thresholds
      if (fund.rolling_3y_avg !== null && fund.rolling_3y_avg < minRollingReturn) {
        return false;
      }
      if (fund.sharpe_ratio !== null && fund.sharpe_ratio < minSharpe) {
        return false;
      }
      if (fund.volatility !== null && fund.volatility > maxVolatility) {
        return false;
      }

      // 4. Strategy Presets (10-Step Video Framework)
      if (preset === 'prashant' || preset === 'mandeep') {
        // Prashant's 10-Step Formula:
        // Rolling 3Y >= Category Avg, Sharpe >= 0.7, Volatility <= Category Avg + 1, Tenure >= 3
        const rollingPass = fund.rolling_3y_avg !== null && (fund.rolling_3y_avg >= 16.0);
        const sharpePass = fund.sharpe_ratio >= 0.7;
        const volPass = (fund.volatility_vs_category || 0) <= 1.0;
        const tenurePass = (fund.manager_tenure_years || 0) >= 3.0 && !fund.manager_change_recently;
        return rollingPass && sharpePass && volPass && tenurePass;
      }

      if (preset === 'compounders') {
        // Top Consistent Compounders: 3Y Rolling Return >= 18% and positive % >= 98%
        return (fund.rolling_3y_avg || 0) >= 18.0 && (fund.rolling_3y_positive_pct || 0) >= 95.0;
      }

      if (preset === 'low_vol') {
        // Low Volatility Titans: Volatility lower than category average by >= 0.5%
        return (fund.volatility_vs_category || 0) <= -0.5;
      }

      if (preset === 'alpha') {
        // High Alpha Champions: Sharpe >= 0.9 and 3Y vs Category >= 1.5%
        return fund.sharpe_ratio >= 0.9 && (fund.returns_vs_category_3y || 0) >= 1.5;
      }

      if (preset === 'elss') {
        return fund.category === 'ELSS Tax Saver';
      }

      return true;
    });

    // Sort Results
    result.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (valA === null || valA === undefined) valA = -999999;
      if (valB === null || valB === undefined) valB = -999999;

      if (typeof valA === 'string') {
        return sortDir === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      }

      return sortDir === 'asc' ? valA - valB : valB - valA;
    });

    return result;
  }
}
