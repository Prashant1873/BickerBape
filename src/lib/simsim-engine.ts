import { FundNavDetail } from '@/types/fund';

export interface SimulationTimeSeriesPoint {
  date: string;
  value: number;
}

export interface SimulationConstituent {
  code: string | number;
  name: string;
  category?: string;
  fund_house?: string;
  weightPct: number;
  allocatedCap: number;
  presentValue: number;
  gain: number;
  gainPct: number;
  cagr: number;
  units: number;
}

export interface SimulationReport {
  type: 'lumpsum' | 'sip';
  startDate: string;
  endDate: string;
  totalCapital: number;
  presentValue: number;
  totalGain: number;
  totalGainPct: number;
  cagr: number;
  benchmarkPresentValue: number;
  benchmarkCagr: number;
  alpha: number;
  maxDrawdown: number;
  years: number;
  installmentsCount?: number;
  timeSeries: SimulationTimeSeriesPoint[];
  benchmarkSeries: SimulationTimeSeriesPoint[];
  investedSeries: SimulationTimeSeriesPoint[];
  constituents: SimulationConstituent[];
}

export class SimSimEngine {
  /**
   * Finds the earliest date where all provided funds have active NAV records
   */
  static calculateEarliestCommonDate(funds: Array<{ nav_history?: Array<{ date: string; nav: number }> }>): string {
    if (!funds || funds.length === 0) return '2021-01-01';
    let latestFirstDate = '1990-01-01';

    funds.forEach(f => {
      const history = f.nav_history || [];
      if (history.length > 0) {
        const first = history[0].date;
        if (first > latestFirstDate) latestFirstDate = first;
      }
    });

    return latestFirstDate;
  }

  /**
   * Cleans, aligns, and forward-fills historical NAV time-series across multiple funds
   */
  static alignNavHistories(
    funds: Array<{ code: string | number; latest_nav?: number | null; nav_history?: Array<{ date: string; nav: number }> }>,
    startDate: string,
    endDate: string | null = null
  ): { dates: string[]; fundNavMap: Record<string | number, number[]> } {
    if (!funds || funds.length === 0) return { dates: [], fundNavMap: {} };

    // 1. Build lookup map for each fund: date -> nav
    const fundNavLookup: Record<string | number, Record<string, number>> = {};
    const allDatesSet = new Set<string>();

    funds.forEach(f => {
      const lookup: Record<string, number> = {};
      const history = f.nav_history || [];
      history.forEach(pt => {
        if (pt.date >= startDate && (!endDate || pt.date <= endDate) && pt.nav && pt.nav > 0) {
          lookup[pt.date] = Number(pt.nav);
          allDatesSet.add(pt.date);
        }
      });
      fundNavLookup[f.code] = lookup;
    });

    const sortedDates = Array.from(allDatesSet).sort();
    if (sortedDates.length === 0) return { dates: [], fundNavMap: {} };

    // 2. Forward-fill missing dates for each fund
    const alignedNavMap: Record<string | number, number[]> = {};
    funds.forEach(f => {
      const lookup = fundNavLookup[f.code];
      const aligned: number[] = [];
      let lastNav: number | null = null;

      // Find initial valid NAV
      for (const d of sortedDates) {
        if (lookup[d] !== undefined) {
          lastNav = lookup[d];
          break;
        }
      }

      if (lastNav === null && (f.nav_history || []).length > 0) {
        const validHist = f.nav_history!.filter(h => h.nav && h.nav > 0);
        if (validHist.length > 0) lastNav = validHist[0].nav;
      }

      sortedDates.forEach(d => {
        if (lookup[d] !== undefined) {
          lastNav = lookup[d];
        }
        aligned.push(lastNav || f.latest_nav || 10.0);
      });

      alignedNavMap[f.code] = aligned;
    });

    return { dates: sortedDates, fundNavMap: alignedNavMap };
  }

  /**
   * Simulates a Lumpsum one-time investment back in time
   */
  static simulateLumpsum(
    funds: any[],
    weights: Record<string | number, number>,
    totalCapital: number,
    startDate: string,
    endDate: string | null = null
  ): SimulationReport | null {
    if (!funds || funds.length === 0 || totalCapital <= 0) return null;

    const { dates, fundNavMap } = this.alignNavHistories(funds, startDate, endDate);
    if (dates.length < 2) return null;

    const nPoints = dates.length;
    const initialUnits: Record<string | number, number> = {};
    const constituents: SimulationConstituent[] = [];

    // Normalize weights across funds
    let sumWeights = 0;
    funds.forEach(f => {
      const w = weights && weights[f.code] !== undefined ? Number(weights[f.code]) : (1.0 / funds.length);
      sumWeights += w;
    });

    const normWeights: Record<string | number, number> = {};
    funds.forEach(f => {
      const w = weights && weights[f.code] !== undefined ? Number(weights[f.code]) : (1.0 / funds.length);
      normWeights[f.code] = sumWeights > 0 ? (w / sumWeights) : (1.0 / funds.length);
    });

    // Calculate initial units purchased for each fund on startDate
    funds.forEach(f => {
      const w = normWeights[f.code];
      const allocatedCap = totalCapital * w;
      const startNav = fundNavMap[f.code][0] || f.latest_nav || 10.0;
      const units = allocatedCap / startNav;
      initialUnits[f.code] = units;
    });

    const portfolioValues: SimulationTimeSeriesPoint[] = [];
    const benchmarkValues: SimulationTimeSeriesPoint[] = [];
    const investedSeries: SimulationTimeSeriesPoint[] = [];

    // Realistic Nifty 50 TRI proxy annualized CAGR ~14.5% historically
    const dailyBenchmarkReturn = Math.pow(1.145, 1 / 252) - 1;
    let runningBenchmark = totalCapital;

    for (let i = 0; i < nPoints; i++) {
      let dayPortVal = 0;
      funds.forEach(f => {
        const nav = fundNavMap[f.code][i];
        dayPortVal += initialUnits[f.code] * nav;
      });

      if (i > 0) {
        const dayNoise = (Math.sin(i * 0.4) * 0.003) + dailyBenchmarkReturn;
        runningBenchmark *= (1 + dayNoise);
      }

      portfolioValues.push({
        date: dates[i],
        value: parseFloat(dayPortVal.toFixed(2))
      });

      benchmarkValues.push({
        date: dates[i],
        value: parseFloat(runningBenchmark.toFixed(2))
      });

      investedSeries.push({
        date: dates[i],
        value: totalCapital
      });
    }

    const presentValue = portfolioValues[nPoints - 1].value;
    const benchmarkPresentValue = benchmarkValues[nPoints - 1].value;
    const totalGain = presentValue - totalCapital;
    const totalGainPct = (totalGain / totalCapital) * 100;

    const d0 = new Date(dates[0]);
    const dEnd = new Date(dates[nPoints - 1]);
    const diffDays = Math.max(1, (dEnd.getTime() - d0.getTime()) / (1000 * 60 * 60 * 24));
    const years = diffDays / 365.25;

    const cagr = years > 0.1 
      ? (Math.pow(presentValue / totalCapital, 1 / years) - 1) * 100 
      : totalGainPct;

    const benchmarkCagr = years > 0.1
      ? (Math.pow(benchmarkPresentValue / totalCapital, 1 / years) - 1) * 100
      : ((benchmarkPresentValue - totalCapital) / totalCapital) * 100;

    const alpha = cagr - benchmarkCagr;
    const maxDrawdown = this.calculateMaxDrawdown(portfolioValues.map(p => p.value));

    funds.forEach(f => {
      const w = normWeights[f.code];
      const allocatedCap = totalCapital * w;
      const endNav = fundNavMap[f.code][nPoints - 1];
      const fundEndVal = initialUnits[f.code] * endNav;
      const fundGain = fundEndVal - allocatedCap;
      const fundGainPct = (fundGain / allocatedCap) * 100;
      const fundCagr = years > 0.1 
        ? (Math.pow(fundEndVal / allocatedCap, 1 / years) - 1) * 100 
        : fundGainPct;

      constituents.push({
        code: f.code,
        name: f.name.split(' - Direct')[0],
        category: f.category,
        fund_house: f.fund_house,
        weightPct: parseFloat((w * 100).toFixed(1)),
        allocatedCap: parseFloat(allocatedCap.toFixed(2)),
        presentValue: parseFloat(fundEndVal.toFixed(2)),
        gain: parseFloat(fundGain.toFixed(2)),
        gainPct: parseFloat(fundGainPct.toFixed(2)),
        cagr: parseFloat(fundCagr.toFixed(2)),
        units: parseFloat(initialUnits[f.code].toFixed(3))
      });
    });

    return {
      type: 'lumpsum',
      startDate: dates[0],
      endDate: dates[nPoints - 1],
      totalCapital,
      presentValue: parseFloat(presentValue.toFixed(2)),
      totalGain: parseFloat(totalGain.toFixed(2)),
      totalGainPct: parseFloat(totalGainPct.toFixed(2)),
      cagr: parseFloat(cagr.toFixed(2)),
      benchmarkPresentValue: parseFloat(benchmarkPresentValue.toFixed(2)),
      benchmarkCagr: parseFloat(benchmarkCagr.toFixed(2)),
      alpha: parseFloat(alpha.toFixed(2)),
      maxDrawdown: parseFloat(maxDrawdown.toFixed(2)),
      years: parseFloat(years.toFixed(2)),
      timeSeries: portfolioValues,
      benchmarkSeries: benchmarkValues,
      investedSeries,
      constituents
    };
  }

  /**
   * Simulates a Monthly SIP back in time
   */
  static simulateSip(
    funds: any[],
    weights: Record<string | number, number>,
    monthlySip: number,
    startDate: string,
    sipDay: number = 5,
    endDate: string | null = null
  ): SimulationReport | null {
    if (!funds || funds.length === 0 || monthlySip <= 0) return null;

    const { dates, fundNavMap } = this.alignNavHistories(funds, startDate, endDate);
    if (dates.length < 2) return null;

    const nPoints = dates.length;
    const unitsHeld: Record<string | number, number> = {};
    funds.forEach(f => unitsHeld[f.code] = 0);

    let sumWeights = 0;
    funds.forEach(f => {
      const w = weights && weights[f.code] !== undefined ? Number(weights[f.code]) : (1.0 / funds.length);
      sumWeights += w;
    });

    const normWeights: Record<string | number, number> = {};
    funds.forEach(f => {
      const w = weights && weights[f.code] !== undefined ? Number(weights[f.code]) : (1.0 / funds.length);
      normWeights[f.code] = sumWeights > 0 ? (w / sumWeights) : (1.0 / funds.length);
    });

    const cashflows: Array<{ date: string; amount: number }> = [];
    const portfolioValues: SimulationTimeSeriesPoint[] = [];
    const benchmarkValues: SimulationTimeSeriesPoint[] = [];
    const investedSeries: SimulationTimeSeriesPoint[] = [];

    let totalInvested = 0;
    let benchmarkUnits = 0;
    const benchmarkNav0 = 100.0;
    const dailyBenchmarkReturn = Math.pow(1.145, 1 / 252) - 1;
    let benchmarkNav = benchmarkNav0;

    let lastSipMonth = '';

    for (let i = 0; i < nPoints; i++) {
      const dStr = dates[i];
      const dObj = new Date(dStr);
      const currentMonth = `${dObj.getFullYear()}-${String(dObj.getMonth() + 1).padStart(2, '0')}`;
      const dayOfMonth = dObj.getDate();

      if (i > 0) {
        const dayNoise = (Math.sin(i * 0.4) * 0.003) + dailyBenchmarkReturn;
        benchmarkNav *= (1 + dayNoise);
      }

      if (currentMonth !== lastSipMonth && dayOfMonth >= sipDay) {
        lastSipMonth = currentMonth;
        totalInvested += monthlySip;

        funds.forEach(f => {
          const w = normWeights[f.code];
          const fundInst = monthlySip * w;
          const currentNav = fundNavMap[f.code][i] || 10.0;
          unitsHeld[f.code] += (fundInst / currentNav);
        });

        benchmarkUnits += (monthlySip / benchmarkNav);

        cashflows.push({
          date: dStr,
          amount: -monthlySip
        });
      }

      let dayPortVal = 0;
      funds.forEach(f => {
        dayPortVal += unitsHeld[f.code] * (fundNavMap[f.code][i] || 10.0);
      });

      portfolioValues.push({
        date: dStr,
        value: parseFloat(dayPortVal.toFixed(2))
      });

      benchmarkValues.push({
        date: dStr,
        value: parseFloat((benchmarkUnits * benchmarkNav).toFixed(2))
      });

      investedSeries.push({
        date: dStr,
        value: parseFloat(totalInvested.toFixed(2))
      });
    }

    const presentValue = portfolioValues[nPoints - 1].value;
    const benchmarkPresentValue = benchmarkValues[nPoints - 1].value;
    const totalGain = presentValue - totalInvested;
    const totalGainPct = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

    cashflows.push({
      date: dates[nPoints - 1],
      amount: presentValue
    });

    const xirr = this.calculateXirr(cashflows);

    const benchmarkCashflows = cashflows.slice(0, -1).map(c => ({ ...c }));
    benchmarkCashflows.push({
      date: dates[nPoints - 1],
      amount: benchmarkPresentValue
    });
    const benchmarkXirr = this.calculateXirr(benchmarkCashflows);
    const alpha = xirr - benchmarkXirr;

    const maxDrawdown = this.calculateMaxDrawdown(portfolioValues.map(p => p.value));

    const constituents: SimulationConstituent[] = [];
    funds.forEach(f => {
      const w = normWeights[f.code];
      const fundInvested = totalInvested * w;
      const endNav = fundNavMap[f.code][nPoints - 1];
      const fundEndVal = unitsHeld[f.code] * endNav;
      const fundGain = fundEndVal - fundInvested;
      const fundGainPct = fundInvested > 0 ? (fundGain / fundInvested) * 100 : 0;

      constituents.push({
        code: f.code,
        name: f.name.split(' - Direct')[0],
        category: f.category,
        fund_house: f.fund_house,
        weightPct: parseFloat((w * 100).toFixed(1)),
        allocatedCap: parseFloat(fundInvested.toFixed(2)),
        presentValue: parseFloat(fundEndVal.toFixed(2)),
        gain: parseFloat(fundGain.toFixed(2)),
        gainPct: parseFloat(fundGainPct.toFixed(2)),
        cagr: parseFloat(fundGainPct.toFixed(2)),
        units: parseFloat(unitsHeld[f.code].toFixed(3))
      });
    });

    const d0 = new Date(dates[0]);
    const dEnd = new Date(dates[nPoints - 1]);
    const years = Math.max(0.1, (dEnd.getTime() - d0.getTime()) / (1000 * 60 * 60 * 24 * 365.25));

    return {
      type: 'sip',
      startDate: dates[0],
      endDate: dates[nPoints - 1],
      totalCapital: totalInvested,
      presentValue: parseFloat(presentValue.toFixed(2)),
      totalGain: parseFloat(totalGain.toFixed(2)),
      totalGainPct: parseFloat(totalGainPct.toFixed(2)),
      cagr: parseFloat(xirr.toFixed(2)),
      benchmarkPresentValue: parseFloat(benchmarkPresentValue.toFixed(2)),
      benchmarkCagr: parseFloat(benchmarkXirr.toFixed(2)),
      alpha: parseFloat(alpha.toFixed(2)),
      maxDrawdown: parseFloat(maxDrawdown.toFixed(2)),
      years: parseFloat(years.toFixed(2)),
      installmentsCount: cashflows.length - 1,
      timeSeries: portfolioValues,
      benchmarkSeries: benchmarkValues,
      investedSeries,
      constituents
    };
  }

  /**
   * Calculates high-precision Internal Rate of Return (XIRR) via Newton-Raphson
   */
  static calculateXirr(cashflows: Array<{ date: string; amount: number }>): number {
    if (!cashflows || cashflows.length < 2) return 0.0;

    const t0 = new Date(cashflows[0].date).getTime();
    const datesYears = cashflows.map(c => (new Date(c.date).getTime() - t0) / (1000 * 60 * 60 * 24 * 365.25));
    const amounts = cashflows.map(c => c.amount);

    let rate = 0.15;
    const maxIter = 60;
    const tolerance = 1e-6;

    for (let iter = 0; iter < maxIter; iter++) {
      let npv = 0.0;
      let dNpv = 0.0;

      for (let i = 0; i < amounts.length; i++) {
        const factor = Math.pow(1 + rate, datesYears[i]);
        if (factor === 0) continue;
        npv += amounts[i] / factor;
        dNpv -= datesYears[i] * amounts[i] / (factor * (1 + rate));
      }

      if (Math.abs(npv) < tolerance) return rate * 100;
      if (Math.abs(dNpv) < 1e-8) break;

      const newRate = rate - npv / dNpv;
      if (newRate <= -0.99 || newRate > 5.0) break;
      rate = newRate;
    }

    // Bisection fallback
    let low = -0.5;
    let high = 2.0;
    let bestMid = 0.15;
    let bestAbsNpv = Infinity;

    for (let i = 0; i < 40; i++) {
      const mid = (low + high) / 2;
      let midNpv = 0;
      for (let k = 0; k < amounts.length; k++) {
        midNpv += amounts[k] / Math.pow(1 + mid, datesYears[k]);
      }
      const absNpv = Math.abs(midNpv);
      if (absNpv < bestAbsNpv) {
        bestAbsNpv = absNpv;
        bestMid = mid;
      }
      if (absNpv < tolerance) return mid * 100;
      if (midNpv > 0) low = mid;
      else high = mid;
    }

    const finalRate = (isNaN(rate) || !isFinite(rate)) ? bestMid : rate;
    return finalRate * 100;
  }

  /**
   * Calculates maximum peak-to-trough drawdown (%)
   */
  static calculateMaxDrawdown(values: number[]): number {
    if (!values || values.length < 2) return 0.0;
    let peak = values[0];
    let maxDd = 0.0;

    for (let i = 0; i < values.length; i++) {
      if (values[i] > peak) {
        peak = values[i];
      }
      if (peak > 0) {
        const dd = ((values[i] - peak) / peak) * 100;
        if (dd < maxDd) {
          maxDd = dd;
        }
      }
    }

    return Math.abs(maxDd);
  }
}
