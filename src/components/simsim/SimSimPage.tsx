'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useScreener } from '@/context/ScreenerContext';
import { FundSummary } from '@/types/fund';
import { fetchFundNavHistory } from '@/lib/data-loader';
import { SimSimEngine, SimulationReport } from '@/lib/simsim-engine';
import { SimSimEmptyState } from './SimSimEmptyState';
import { SimSimControlsBar } from './SimSimControlsBar';
import { SimSimSummaryCards } from './SimSimSummaryCards';
import { SimSimChart } from './SimSimChart';
import { SimSimConstituentsTable } from './SimSimConstituentsTable';

export const SimSimPage: React.FC = () => {
  const {
    funds,
    simsimBucket,
    simsimWeights,
    setFundWeight,
    setBatchWeights,
    removeFromBucket,
    clearBucket,
    equalizeWeights,
    simsimInvestmentMode,
    simsimCapital,
    setSimsimCapital,
    simsimHorizon,
    simsimCustomStartDate,
    simsimCustomEndDate,
    loadModelPreset,
    setAppMode,
    sidebarCollapsed,
    toggleSidebarCollapse,
    setSidebarOpen
  } = useScreener();

  const [loadingSim, setLoadingSim] = useState(false);
  const [report, setReport] = useState<SimulationReport | null>(null);

  // Funds currently in the bucket
  const bucketFunds = useMemo(() => {
    return simsimBucket
      .map((code) => funds.find((f) => f.code === code))
      .filter(Boolean) as FundSummary[];
  }, [simsimBucket, funds]);

  // Determine date range based on horizon
  const calculateDateRange = (horizon: string): { start: string; end: string | null } => {
    if (horizon === 'CUSTOM') {
      return {
        start: simsimCustomStartDate,
        end: simsimCustomEndDate
      };
    }
    const d = new Date();
    if (horizon === '6M') d.setMonth(d.getMonth() - 6);
    else if (horizon === '1Y') d.setFullYear(d.getFullYear() - 1);
    else if (horizon === '2Y') d.setFullYear(d.getFullYear() - 2);
    else if (horizon === '3Y') d.setFullYear(d.getFullYear() - 3);
    else if (horizon === '5Y') d.setFullYear(d.getFullYear() - 5);
    else if (horizon === '7Y') d.setFullYear(d.getFullYear() - 7);
    else if (horizon === '10Y') d.setFullYear(d.getFullYear() - 10);
    else return { start: '2015-01-01', end: null }; // ALL / Max

    return {
      start: d.toISOString().split('T')[0],
      end: null
    };
  };

  // Run simulation whenever bucket, weights, capital, mode, or horizon/dates change
  useEffect(() => {
    if (bucketFunds.length === 0) {
      setReport(null);
      return;
    }

    let isMounted = true;
    async function runSim() {
      setLoadingSim(true);

      // Load NAV histories
      const fundsWithHist = await Promise.all(
        bucketFunds.map(async (f) => {
          const hist = await fetchFundNavHistory(f.code);
          return {
            ...f,
            nav_history: hist
          };
        })
      );

      if (!isMounted) return;

      const { start: horizonStart, end: horizonEnd } = calculateDateRange(simsimHorizon);
      const earliestCommon = SimSimEngine.calculateEarliestCommonDate(fundsWithHist);
      const effectiveStart = horizonStart > earliestCommon ? horizonStart : earliestCommon;
      const effectiveEnd = horizonEnd;

      // Normalise weights to 1.0 sum
      const weightMap: Record<string | number, number> = {};
      const sumWeights = Object.values(simsimWeights).reduce((a, b) => a + b, 0) || 100;
      bucketFunds.forEach((f) => {
        const rawW = simsimWeights[f.code] ?? 100 / bucketFunds.length;
        weightMap[f.code] = rawW / sumWeights;
      });

      const rep =
        simsimInvestmentMode === 'lumpsum'
          ? SimSimEngine.simulateLumpsum(fundsWithHist, weightMap, simsimCapital, effectiveStart, effectiveEnd)
          : SimSimEngine.simulateSip(fundsWithHist, weightMap, simsimCapital, effectiveStart, 5, effectiveEnd);

      if (isMounted) {
        setReport(rep);
        setLoadingSim(false);
      }
    }

    runSim();
    return () => {
      isMounted = false;
    };
  }, [
    bucketFunds,
    simsimWeights,
    simsimCapital,
    simsimInvestmentMode,
    simsimHorizon,
    simsimCustomStartDate,
    simsimCustomEndDate
  ]);

  // VIEW A: Empty bucket welcome builder
  if (bucketFunds.length === 0) {
    return (
      <SimSimEmptyState
        loadModelPreset={loadModelPreset}
        setAppMode={setAppMode}
        sidebarCollapsed={sidebarCollapsed}
        toggleSidebarCollapse={toggleSidebarCollapse}
        setSidebarOpen={setSidebarOpen}
      />
    );
  }

  // VIEW B: Active simulation workspace
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <SimSimControlsBar
        bucketCount={bucketFunds.length}
        report={report}
        bucketFunds={bucketFunds}
        onEqualizeWeights={equalizeWeights}
        onClearBucket={clearBucket}
        onExitToScreener={() => setAppMode('screener')}
      />

      <SimSimSummaryCards
        loading={loadingSim}
        report={report}
        capital={simsimCapital}
        onUpdateCapital={setSimsimCapital}
      />

      <SimSimChart
        report={report}
        simsimInvestmentMode={simsimInvestmentMode}
        simsimCapital={simsimCapital}
      />

      <SimSimConstituentsTable
        bucketFunds={bucketFunds}
        simsimWeights={simsimWeights}
        simsimCapital={simsimCapital}
        report={report}
        setFundWeight={setFundWeight}
        setBatchWeights={setBatchWeights}
        removeFromBucket={removeFromBucket}
      />
    </div>
  );
};
