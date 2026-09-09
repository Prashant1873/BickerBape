import { FundSummary, CategoriesSummary, NavPoint, FundNavDetail } from '@/types/fund';

let cachedFundsSummary: FundSummary[] | null = null;
let cachedCategories: CategoriesSummary | null = null;
const navCache = new Map<string | number, NavPoint[]>();

// Adjust basePath for GitHub Pages subpaths if deployed under a subpath
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.pathname.startsWith('/BickerBape') ? '/BickerBape' : '';
  }
  return '';
};

export async function fetchFundsSummary(): Promise<FundSummary[]> {
  if (cachedFundsSummary) return cachedFundsSummary;

  try {
    const base = getBaseUrl();
    const res = await fetch(`${base}/data/funds_summary.json`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data: FundSummary[] = await res.json();
    cachedFundsSummary = data;
    return data;
  } catch (err) {
    console.error('Failed to load funds summary:', err);
    return [];
  }
}

export async function fetchCategoriesSummary(): Promise<CategoriesSummary> {
  if (cachedCategories) return cachedCategories;

  try {
    const base = getBaseUrl();
    const res = await fetch(`${base}/data/categories_summary.json`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data: CategoriesSummary = await res.json();
    cachedCategories = data;
    return data;
  } catch (err) {
    console.error('Failed to load categories summary:', err);
    return {};
  }
}

export async function fetchFundNavHistory(code: string | number): Promise<NavPoint[]> {
  if (navCache.has(code)) {
    return navCache.get(code)!;
  }

  try {
    const base = getBaseUrl();
    const res = await fetch(`${base}/data/nav/${code}.json`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data: FundNavDetail = await res.json();
    const history = data.nav_history || [];
    navCache.set(code, history);
    return history;
  } catch (err) {
    console.warn(`Could not load NAV history for fund ${code}:`, err);
    return [];
  }
}
