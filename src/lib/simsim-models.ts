export interface ModelBasketSlot {
  category: string;
  suggestedWeight: number;
  defaultSubstr: string;
}

export interface ModelBasketPreset {
  id: 'titan' | 'aggressive' | 'defensive';
  name: string;
  icon: string;
  description: string;
  ratioBadge: string;
  accentColor: string;
  slots: ModelBasketSlot[];
}

export const MODEL_BASKETS: Record<'titan' | 'aggressive' | 'defensive', ModelBasketPreset> = {
  titan: {
    id: 'titan',
    name: 'The Titan',
    icon: 'shield',
    description: 'All-weather balanced compounder combining resilient Flexi Cap core with high-growth Mid & Small Cap alpha.',
    ratioBadge: '40/35/25',
    accentColor: '#00F090',
    slots: [
      { category: 'Flexi Cap', suggestedWeight: 40, defaultSubstr: 'Flexi' },
      { category: 'Mid Cap', suggestedWeight: 35, defaultSubstr: 'Mid' },
      { category: 'Small Cap', suggestedWeight: 25, defaultSubstr: 'Small' }
    ]
  },
  aggressive: {
    id: 'aggressive',
    name: 'High-Alpha Rocket',
    icon: 'rocket_launch',
    description: 'High-octane multi-cycle wealth creation prioritizing maximum alpha through proven Mid & Small Cap champions.',
    ratioBadge: '40/30/30',
    accentColor: '#FF5630',
    slots: [
      { category: 'Mid Cap', suggestedWeight: 40, defaultSubstr: 'Mid' },
      { category: 'Small Cap', suggestedWeight: 30, defaultSubstr: 'Small' },
      { category: 'Flexi Cap', suggestedWeight: 30, defaultSubstr: 'Flexi' }
    ]
  },
  defensive: {
    id: 'defensive',
    name: 'Defensive Anchor',
    icon: 'savings',
    description: 'Downside-protected wealth preservation combining large-cap stability with value-oriented contra alpha.',
    ratioBadge: '40/30/30',
    accentColor: '#FFB800',
    slots: [
      { category: 'Large & Mid Cap', suggestedWeight: 40, defaultSubstr: 'Large' },
      { category: 'Large Cap', suggestedWeight: 30, defaultSubstr: 'Bluechip' },
      { category: 'ELSS Tax Saver', suggestedWeight: 30, defaultSubstr: 'Tax' }
    ]
  }
};

export interface MarketRegimePreset {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  badge: string;
}

export const MARKET_REGIMES: MarketRegimePreset[] = [
  {
    id: 'covid-crash-recovery',
    name: 'Covid Crash & V-Recovery',
    description: 'Full cycle stress test through the March 2020 pandemic crash and steep liquidity rebound.',
    startDate: '2020-02-01',
    endDate: '2021-03-31',
    badge: 'Pandemic Cycle'
  },
  {
    id: 'bull-run-21-24',
    name: 'Mid & Small Cap Bull Rally',
    description: 'Historic high-momentum economic recovery and broad equity expansion.',
    startDate: '2021-04-01',
    endDate: '2024-03-31',
    badge: '3Y Expansion'
  },
  {
    id: 'rate-hike-cycle',
    name: 'Global Inflation & Rate Hike Shock',
    description: 'Ukraine conflict outbreak, commodity spikes, and aggressive global rate tightening.',
    startDate: '2022-01-01',
    endDate: '2023-05-31',
    badge: 'Rate Hike Shock'
  }
];
