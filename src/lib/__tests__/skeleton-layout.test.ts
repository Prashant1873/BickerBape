import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FundCardSkeleton } from '@/components/screener/FundCardSkeleton';
import { FundTableSkeleton } from '@/components/screener/FundTableSkeleton';
import { SimSimSummarySkeleton } from '@/components/simsim/SimSimSummarySkeleton';
import { SimSimChartSkeleton } from '@/components/simsim/SimSimChartSkeleton';

describe('Pixel-Matched Skeleton Layout Parity (LOAD-01)', () => {
  it('renders FundCardSkeleton with exact 224px min-height geometry and shimmer classes', () => {
    const html = renderToStaticMarkup(React.createElement(FundCardSkeleton));
    
    expect(html).toContain('data-testid="fund-card-skeleton"');
    expect(html).toContain('min-h-[224px]');
    expect(html).toContain('shimmer-sweep');
    expect(html).toContain('grid grid-cols-3');
  });

  it('renders FundTableSkeleton matching 10-column header and 12 rows with min-h-[52px]', () => {
    const html = renderToStaticMarkup(React.createElement(FundTableSkeleton, { rowCount: 12 }));

    expect(html).toContain('data-testid="fund-table-skeleton"');
    expect(html).toContain('sticky top-0 z-30');
    expect(html).toContain('shimmer-sweep');

    // Count occurrences of table row tags in tbody
    const tbodyMatches = html.match(/<tr class="min-h-\[52px\]"/g);
    expect(tbodyMatches).not.toBeNull();
    expect(tbodyMatches?.length).toBe(12);
  });

  it('renders SimSimSummarySkeleton with 4 responsive KPI cards of 116px min-height', () => {
    const html = renderToStaticMarkup(React.createElement(SimSimSummarySkeleton));

    expect(html).toContain('data-testid="simsim-summary-skeleton"');
    expect(html).toContain('grid-cols-1 sm:grid-cols-2 lg:grid-cols-4');
    
    const cardMatches = html.match(/min-h-\[116px\]/g);
    expect(cardMatches).not.toBeNull();
    expect(cardMatches?.length).toBe(4);
  });

  it('renders SimSimChartSkeleton with fixed 380px container and 320px (h-80) inner canvas', () => {
    const html = renderToStaticMarkup(React.createElement(SimSimChartSkeleton));

    expect(html).toContain('data-testid="simsim-chart-skeleton"');
    expect(html).toContain('min-h-[380px]');
    expect(html).toContain('h-80 w-full');
    expect(html).toContain('border-dashed');
  });
});
