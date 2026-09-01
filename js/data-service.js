/**
 * BickerBape Data Service
 * Loads precalculated mutual fund data and handles client-side MFAPI queries
 */

export class DataService {
  static fundsCache = null;
  static categoriesCache = null;

  /**
   * Loads the precalculated equity mutual funds universe
   * @returns {Promise<Array>}
   */
  static async loadFunds() {
    if (this.fundsCache) return this.fundsCache;
    try {
      const resp = await fetch('data/equity_funds.json');
      if (!resp.ok) throw new Error('Failed to load equity_funds.json');
      this.fundsCache = await resp.json();
      return this.fundsCache;
    } catch (err) {
      console.warn('Could not load local data/equity_funds.json, attempting fallback', err);
      return [];
    }
  }

  /**
   * Loads category summary averages
   * @returns {Promise<Object>}
   */
  static async loadCategoriesSummary() {
    if (this.categoriesCache) return this.categoriesCache;
    try {
      const resp = await fetch('data/categories_summary.json');
      if (!resp.ok) throw new Error('Failed to load categories_summary.json');
      this.categoriesCache = await resp.json();
      return this.categoriesCache;
    } catch (err) {
      console.warn('Could not load local categories summary', err);
      return {};
    }
  }

  /**
   * Live client-side fetch from MFAPI for any scheme code
   * @param {number|string} schemeCode 
   * @returns {Promise<Object|null>}
   */
  static async fetchLiveScheme(schemeCode) {
    try {
      const url = `https://api.mfapi.in/mf/${schemeCode}`;
      const res = await fetch(url);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.error('Error fetching live scheme:', e);
      return null;
    }
  }
}
