import { describe, it, expect, vi, afterEach } from 'vitest';
import { exportSimulationCsv, printSimulationSummary } from '../export-utils';
import { SimulationReport } from '../simsim-engine';
import { FundSummary } from '@/types/fund';

describe('export-utils', () => {
  const mockReport: SimulationReport = {
    type: 'lumpsum',
    startDate: '2022-01-01',
    endDate: '2024-01-01',
    totalCapital: 100000,
    presentValue: 145000,
    totalGain: 45000,
    totalGainPct: 45.0,
    cagr: 20.41,
    benchmarkPresentValue: 130000,
    benchmarkCagr: 14.02,
    alpha: 6.39,
    maxDrawdown: -12.5,
    years: 2.0,
    timeSeries: [
      { date: '2022-01-01', value: 100000 },
      { date: '2024-01-01', value: 145000 }
    ],
    benchmarkSeries: [
      { date: '2022-01-01', value: 100000 },
      { date: '2024-01-01', value: 130000 }
    ],
    investedSeries: [
      { date: '2022-01-01', value: 100000 },
      { date: '2024-01-01', value: 100000 }
    ],
    constituents: [
      {
        code: 101,
        name: 'Alpha Bluechip Fund',
        category: 'Large Cap',
        fund_house: 'Alpha AMC',
        weightPct: 100,
        allocatedCap: 100000,
        presentValue: 145000,
        gain: 45000,
        gainPct: 45.0,
        cagr: 20.41,
        units: 1000
      }
    ]
  };

  const mockBucketFunds: FundSummary[] = [
    {
      code: 101,
      name: 'Alpha Bluechip Fund',
      category: 'Large Cap',
      fund_house: 'Alpha AMC'
    } as FundSummary
  ];

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('safely handles non-browser environment without throwing', () => {
    expect(() => exportSimulationCsv(mockReport, mockBucketFunds)).not.toThrow();
    expect(() => printSimulationSummary()).not.toThrow();
  });

  it('executes download flow and print when window and document are present', () => {
    const clickMock = vi.fn();
    const mockAnchor = { href: '', download: '', click: clickMock };
    const mockDoc = {
      createElement: vi.fn().mockReturnValue(mockAnchor),
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn()
      }
    };
    const mockUrl = {
      createObjectURL: vi.fn().mockReturnValue('blob:test-url'),
      revokeObjectURL: vi.fn()
    };
    const mockWin = {
      print: vi.fn()
    };

    vi.stubGlobal('document', mockDoc);
    vi.stubGlobal('window', mockWin);
    vi.stubGlobal('URL', mockUrl);

    exportSimulationCsv(mockReport, mockBucketFunds);
    expect(mockDoc.createElement).toHaveBeenCalledWith('a');
    expect(clickMock).toHaveBeenCalledTimes(1);
    expect(mockUrl.createObjectURL).toHaveBeenCalledTimes(1);
    expect(mockUrl.revokeObjectURL).toHaveBeenCalledWith('blob:test-url');

    printSimulationSummary();
    expect(mockWin.print).toHaveBeenCalledTimes(1);
  });
});
