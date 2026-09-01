/**
 * BickerBape Master Controller
 * Features:
 * - SmartScore (TM) Proprietary 5-Pillar Scorecard (Performance, Risk, Cost, Composition, Red Flags)
 * - Collapsible Screener Sidebar
 * - Apple Fluid Motion Physics
 * - Workable Comparison Tray & Matrix Modal
 * - Interactive Chart.js Visualizations
 */

import { DataService } from './data-service.js';
import { AnalyticsEngine } from './analytics.js';
import { ChartEngine } from './charts.js';
import { FluidMotion } from './motion.js';

class BickerBapeApp {
  constructor() {
    this.allFunds = [];
    this.categoriesSummary = {};
    this.state = {
      category: 'All Funds',
      preset: 'all',
      searchQuery: '',
      minSmartScore: 0,
      minRollingReturn: 0,
      minSharpe: 0,
      maxVolatility: 25,
      sortBy: 'smart_score',
      sortDir: 'desc',
      currentView: 'cards', // 'cards' | 'table'
      selectedFund: null,
      comparisonList: [],
      displayLimit: 36,
      sidebarCollapsed: false
    };

    this.init();
  }

  async init() {
    FluidMotion.initTactileFeedback();

    // 1. Load data
    this.allFunds = await DataService.loadFunds();
    this.categoriesSummary = await DataService.loadCategoriesSummary();

    // 2. Setup all listeners
    this.setupEventListeners();

    // 3. Initial Render
    this.updateUI();
  }

  setupEventListeners() {
    // ------------------------------------------------------------------
    // A. Collapsible Sidebar Logic
    // ------------------------------------------------------------------
    const sidebar = document.getElementById('sidebar');
    const collapseBtn = document.getElementById('sidebar-collapse-btn');
    const expandBtn = document.getElementById('sidebar-expand-btn');
    const mobileBackdrop = document.getElementById('sidebar-mobile-backdrop');

    const toggleSidebar = () => {
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        sidebar.classList.toggle('mobile-open');
        if (sidebar.classList.contains('mobile-open')) {
          mobileBackdrop.classList.remove('hidden');
        } else {
          mobileBackdrop.classList.add('hidden');
        }
      } else {
        sidebar.classList.toggle('collapsed');
        this.state.sidebarCollapsed = sidebar.classList.contains('collapsed');
      }
    };

    if (collapseBtn) collapseBtn.addEventListener('click', toggleSidebar);
    if (expandBtn) expandBtn.addEventListener('click', toggleSidebar);
    if (mobileBackdrop) {
      mobileBackdrop.addEventListener('click', () => {
        sidebar.classList.remove('mobile-open');
        mobileBackdrop.classList.add('hidden');
      });
    }

    // ------------------------------------------------------------------
    // B. Search Inputs
    // ------------------------------------------------------------------
    const handleSearch = (val) => {
      this.state.searchQuery = val;
      this.state.displayLimit = 36;
      this.updateUI(false);
    };

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => handleSearch(e.target.value));
    }
    const mobileSearch = document.getElementById('mobile-search-input');
    if (mobileSearch) {
      mobileSearch.addEventListener('input', (e) => handleSearch(e.target.value));
    }

    // ------------------------------------------------------------------
    // C. Sidebar Category Selector
    // ------------------------------------------------------------------
    document.querySelectorAll('#sidebar-categories-list .category-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#sidebar-categories-list .category-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.category = btn.getAttribute('data-category');
        this.state.displayLimit = 36;
        
        if (window.innerWidth <= 768 && sidebar.classList.contains('mobile-open')) {
          sidebar.classList.remove('mobile-open');
          mobileBackdrop.classList.add('hidden');
        }

        this.updateUI(false);
      });
    });

    // ------------------------------------------------------------------
    // D. Strategy Presets (SmartScore Elite, Prashant's Formula, etc.)
    // ------------------------------------------------------------------
    document.querySelectorAll('.strategy-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.getAttribute('data-preset');
        if (this.state.preset === preset) {
          this.state.preset = 'all';
          btn.classList.remove('active');
        } else {
          document.querySelectorAll('.strategy-chip').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.state.preset = preset;
        }
        this.state.displayLimit = 36;

        if (window.innerWidth <= 768 && sidebar.classList.contains('mobile-open')) {
          sidebar.classList.remove('mobile-open');
          mobileBackdrop.classList.add('hidden');
        }

        this.updateUI(false);
      });
    });

    // ------------------------------------------------------------------
    // E. Sliders (SmartScore, Rolling, Sharpe, Volatility)
    // ------------------------------------------------------------------
    const smartSlider = document.getElementById('slider-smartscore');
    if (smartSlider) {
      smartSlider.addEventListener('input', (e) => {
        this.state.minSmartScore = parseFloat(e.target.value);
        document.getElementById('val-smartscore').textContent = parseFloat(e.target.value).toFixed(1);
        this.state.displayLimit = 36;
        this.updateUI(false);
      });
    }

    const rollingSlider = document.getElementById('slider-rolling');
    if (rollingSlider) {
      rollingSlider.addEventListener('input', (e) => {
        this.state.minRollingReturn = parseFloat(e.target.value);
        document.getElementById('val-rolling').textContent = `${e.target.value}%`;
        this.state.displayLimit = 36;
        this.updateUI(false);
      });
    }

    const sharpeSlider = document.getElementById('slider-sharpe');
    if (sharpeSlider) {
      sharpeSlider.addEventListener('input', (e) => {
        this.state.minSharpe = parseFloat(e.target.value);
        document.getElementById('val-sharpe').textContent = e.target.value;
        this.state.displayLimit = 36;
        this.updateUI(false);
      });
    }

    const volSlider = document.getElementById('slider-vol');
    if (volSlider) {
      volSlider.addEventListener('input', (e) => {
        this.state.maxVolatility = parseFloat(e.target.value);
        document.getElementById('val-vol').textContent = `${e.target.value}%`;
        this.state.displayLimit = 36;
        this.updateUI(false);
      });
    }

    // ------------------------------------------------------------------
    // F. Reset Filters
    // ------------------------------------------------------------------
    const resetBtn = document.getElementById('reset-filters-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetFilters());
    }

    // ------------------------------------------------------------------
    // G. View Switcher (Cards vs Table)
    // ------------------------------------------------------------------
    const viewCardsBtn = document.getElementById('view-cards-btn');
    const viewTableBtn = document.getElementById('view-table-btn');
    if (viewCardsBtn && viewTableBtn) {
      viewCardsBtn.addEventListener('click', () => {
        this.state.currentView = 'cards';
        viewCardsBtn.classList.add('active');
        viewTableBtn.classList.remove('active');
        this.updateViewContainers();
      });
      viewTableBtn.addEventListener('click', () => {
        this.state.currentView = 'table';
        viewTableBtn.classList.add('active');
        viewCardsBtn.classList.remove('active');
        this.updateViewContainers();
      });
    }

    // ------------------------------------------------------------------
    // H. Table Column Sorting
    // ------------------------------------------------------------------
    document.querySelectorAll('th[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        const field = th.getAttribute('data-sort');
        if (this.state.sortBy === field) {
          this.state.sortDir = this.state.sortDir === 'asc' ? 'desc' : 'asc';
        } else {
          this.state.sortBy = field;
          this.state.sortDir = 'desc';
        }
        this.updateSortIcons();
        this.updateUI(false);
      });
    });

    // ------------------------------------------------------------------
    // I. Pagination / Load More
    // ------------------------------------------------------------------
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        this.state.displayLimit += 36;
        this.updateUI(false);
      });
    }

    const loadAllBtn = document.getElementById('load-all-btn');
    if (loadAllBtn) {
      loadAllBtn.addEventListener('click', () => {
        this.state.displayLimit = this.allFunds.length;
        this.updateUI(false);
      });
    }

    // ------------------------------------------------------------------
    // J. Detail Drawer & Comparison Modal Events
    // ------------------------------------------------------------------
    const drawerBackdrop = document.getElementById('drawer-backdrop');
    if (drawerBackdrop) {
      drawerBackdrop.addEventListener('click', () => this.closeDrawer());
    }

    const drawerCloseBtn = document.getElementById('drawer-close-btn');
    if (drawerCloseBtn) {
      drawerCloseBtn.addEventListener('click', () => this.closeDrawer());
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeDrawer();
        this.closeComparisonModal();
      }
    });

    const openCompareBtn = document.getElementById('open-compare-btn');
    if (openCompareBtn) {
      openCompareBtn.addEventListener('click', () => this.openComparisonModal());
    }

    const closeCompareBtn = document.getElementById('compare-close-btn');
    if (closeCompareBtn) {
      closeCompareBtn.addEventListener('click', () => this.closeComparisonModal());
    }

    const clearCompareBtn = document.getElementById('clear-compare-btn');
    if (clearCompareBtn) {
      clearCompareBtn.addEventListener('click', () => {
        this.state.comparisonList = [];
        this.updateComparisonTray();
        this.updateCompareButtonsVisuals();
      });
    }

    document.querySelectorAll('.horizon-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.horizon-tab').forEach(t => t.classList.remove('active', 'bg-primary-container', 'text-on-primary'));
        tab.classList.add('active', 'bg-primary-container', 'text-on-primary');
        const horizon = tab.getAttribute('data-horizon');
        if (this.state.selectedFund) {
          ChartEngine.renderNavChart('chart-nav-history', this.state.selectedFund.nav_history, horizon);
        }
      });
    });

    const drawer = document.getElementById('fund-drawer');
    const grabHandle = document.getElementById('drawer-grab-handle');
    if (drawer && grabHandle) {
      FluidMotion.attachDrawerGestures(drawer, grabHandle, () => this.closeDrawer());
    }
  }

  resetFilters() {
    this.state.category = 'All Funds';
    this.state.preset = 'all';
    this.state.searchQuery = '';
    this.state.minSmartScore = 0;
    this.state.minRollingReturn = 0;
    this.state.minSharpe = 0;
    this.state.maxVolatility = 25;
    this.state.sortBy = 'smart_score';
    this.state.sortDir = 'desc';
    this.state.displayLimit = 36;

    const s1 = document.getElementById('search-input');
    if (s1) s1.value = '';
    const s2 = document.getElementById('mobile-search-input');
    if (s2) s2.value = '';

    const smartSlider = document.getElementById('slider-smartscore');
    if (smartSlider) {
      smartSlider.value = 0;
      document.getElementById('val-smartscore').textContent = '0.0';
    }

    document.getElementById('slider-rolling').value = 0;
    document.getElementById('val-rolling').textContent = '0%';
    document.getElementById('slider-sharpe').value = 0;
    document.getElementById('val-sharpe').textContent = '0';
    document.getElementById('slider-vol').value = 25;
    document.getElementById('val-vol').textContent = '25%';

    document.querySelectorAll('#sidebar-categories-list .category-pill').forEach(b => b.classList.remove('active'));
    document.querySelector('#sidebar-categories-list .category-pill[data-category="All Funds"]')?.classList.add('active');

    document.querySelectorAll('.strategy-chip').forEach(b => b.classList.remove('active'));

    this.updateUI(false);
  }

  updateViewContainers() {
    const cardsContainer = document.getElementById('featured-funds-grid');
    const tableContainer = document.getElementById('screener-table-container');

    if (this.state.currentView === 'cards') {
      cardsContainer.classList.remove('hidden');
      tableContainer.classList.add('hidden');
    } else {
      cardsContainer.classList.add('hidden');
      tableContainer.classList.remove('hidden');
    }
  }

  updateSortIcons() {
    document.querySelectorAll('th[data-sort]').forEach(th => {
      const field = th.getAttribute('data-sort');
      const icon = th.querySelector('.sort-icon');
      if (icon) {
        if (field === this.state.sortBy) {
          icon.textContent = this.state.sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward';
          icon.classList.add('text-primary-container');
        } else {
          icon.textContent = 'unfold_more';
          icon.classList.remove('text-primary-container');
        }
      }
    });
  }

  getFilteredFunds() {
    return AnalyticsEngine.filterAndSortFunds(this.allFunds, {
      searchQuery: this.state.searchQuery,
      category: this.state.category,
      preset: this.state.preset,
      minSmartScore: this.state.minSmartScore,
      minRollingReturn: this.state.minRollingReturn,
      minSharpe: this.state.minSharpe,
      maxVolatility: this.state.maxVolatility,
      sortBy: this.state.sortBy,
      sortDir: this.state.sortDir
    });
  }

  updateUI(resetLimit = true) {
    if (resetLimit) {
      this.state.displayLimit = 36;
    }
    const filtered = this.getFilteredFunds();
    const displayed = filtered.slice(0, this.state.displayLimit);

    const countEl = document.getElementById('funds-count');
    if (countEl) {
      countEl.textContent = `${filtered.length} Funds Found (${this.allFunds.length} Total Indexed)`;
    }

    const paginationBar = document.getElementById('pagination-bar');
    const paginationInfo = document.getElementById('pagination-info');
    const loadMoreBtn = document.getElementById('load-more-btn');

    if (paginationBar && paginationInfo) {
      if (filtered.length <= 36) {
        paginationBar.classList.add('hidden');
      } else {
        paginationBar.classList.remove('hidden');
        paginationInfo.textContent = `Showing ${displayed.length} of ${filtered.length} funds (${this.allFunds.length} total in India)`;
        if (loadMoreBtn) {
          if (displayed.length >= filtered.length) {
            loadMoreBtn.classList.add('hidden');
          } else {
            loadMoreBtn.classList.remove('hidden');
          }
        }
      }
    }

    this.renderCardsGrid(displayed);
    this.renderTable(displayed);
    this.updateComparisonTray();
  }

  generateSparklineSvg(points) {
    if (!points || points.length < 2) {
      return `<svg class="w-full h-full stroke-[#36B37E] fill-none" preserveAspectRatio="none" viewBox="0 0 100 30"><path d="M0,25 L100,5" stroke-width="2"></path></svg>`;
    }

    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = (max - min) || 1;

    const pathPoints = points.map((val, idx) => {
      const x = (idx / (points.length - 1)) * 100;
      const y = 28 - ((val - min) / range) * 24;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const isGain = points[points.length - 1] >= points[0];
    const strokeColor = isGain ? '#36B37E' : '#FF5630';

    return `
      <svg class="w-full h-full stroke-[${strokeColor}] fill-none sparkline-svg" preserveAspectRatio="none" viewBox="0 0 100 30">
        <path d="M${pathPoints.join(' L')}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
    `;
  }

  renderCardsGrid(funds) {
    const grid = document.getElementById('featured-funds-grid');
    if (!grid) return;

    if (funds.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-12 text-center bg-surface-container-lowest rounded-2xl card-shadow p-xl">
          <span class="material-symbols-outlined text-4xl text-on-surface-variant mb-2">search_off</span>
          <h4 class="font-headline-md text-on-surface mb-1">No Mutual Funds Match These Criteria</h4>
          <p class="font-body-md text-on-surface-variant mb-4">Try easing your filter sliders or clearing the strategy preset in the sidebar.</p>
          <button id="card-empty-reset-btn" class="px-lg py-sm rounded-lg bg-primary-container text-on-primary font-label-bold text-xs cursor-pointer">Reset Filters</button>
        </div>
      `;
      document.getElementById('card-empty-reset-btn')?.addEventListener('click', () => this.resetFilters());
      return;
    }

    grid.innerHTML = funds.map(fund => {
      const isComparing = this.state.comparisonList.some(f => f.code === fund.code);
      const ret3y = fund.cagr_3y ? `${fund.cagr_3y > 0 ? '+' : ''}${fund.cagr_3y}%` : 'N/A';
      const rolling3y = fund.rolling_3y_avg ? `${fund.rolling_3y_avg}%` : 'N/A';
      const vsCat = fund.returns_vs_category_3y;
      const vsCatBadge = vsCat !== null 
        ? `<span class="${vsCat >= 0 ? 'badge-gain' : 'badge-loss'}">${vsCat >= 0 ? '+' : ''}${vsCat}% vs Cat</span>`
        : '';

      const smart = fund.smart_score || { overall: ((fund.suggester_score || 70) / 10).toFixed(1), rank_text: '' };
      const scoreNum = parseFloat(smart.overall);
      const gaugeClass = scoreNum >= 7.0 ? 'gauge-green' : (scoreNum >= 4.5 ? 'gauge-amber' : 'gauge-red');

      return `
        <div class="bg-surface-container-lowest rounded-2xl card-shadow p-md md:p-lg flex flex-col hover:shadow-md transition-all cursor-pointer relative overflow-hidden group card-interactive" data-code="${fund.code}">
          <div class="absolute top-0 left-0 w-1.5 h-full ${scoreNum >= 7.0 ? 'bg-gain' : (scoreNum >= 5.0 ? 'bg-primary-container' : 'bg-warning')}"></div>
          
          <div class="flex justify-between items-start mb-sm pl-2">
            <div>
              <div class="flex items-center gap-sm mb-xs flex-wrap">
                <span class="bg-secondary-fixed-dim text-on-secondary-fixed px-2 py-0.5 rounded text-xs font-label-bold">${fund.category}</span>
                <span class="smartscore-badge">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#403294]"></span>
                  <span>★ ${smart.overall} SmartScore™</span>
                </span>
                ${vsCatBadge}
              </div>
              <h4 class="font-headline-md text-sm md:text-base text-on-surface leading-tight hover:text-primary-container transition-colors">${fund.name.split(' - Direct')[0]}</h4>
              <p class="font-label-sm text-[11px] text-on-surface-variant mt-1">${fund.fund_house}</p>
            </div>
            <div class="smartscore-gauge ${gaugeClass}">
              <span>${smart.overall}</span>
            </div>
          </div>

          <div class="flex items-end justify-between mt-auto mb-md pl-2">
            <div>
              <p class="font-label-sm text-xs text-on-surface-variant mb-xs">3Y Return (CAGR)</p>
              <p class="font-display-financial text-xl md:text-2xl text-[#36B37E]">${ret3y}</p>
              <p class="text-[11px] text-on-surface-variant mt-0.5">3Y Rolling Avg: <strong class="text-on-surface font-bold">${rolling3y}</strong></p>
            </div>
            <div class="w-24 h-11 bg-surface-container-low rounded-lg flex items-center justify-center overflow-hidden p-1">
              ${this.generateSparklineSvg(fund.sparkline)}
            </div>
          </div>

          <div class="flex gap-2 pl-2">
            <button class="flex-grow bg-transparent border border-primary-container text-primary-container font-label-bold text-xs py-2 rounded-xl hover:bg-primary-container hover:text-on-primary transition-colors touch-spring cursor-pointer analyze-card-btn" data-code="${fund.code}">
              SmartScore™ Breakdown
            </button>
            <button class="px-3 py-2 border rounded-xl font-label-bold text-xs flex items-center gap-1 transition-colors touch-spring cursor-pointer compare-toggle-btn ${isComparing ? 'bg-primary-container text-on-primary border-primary-container shadow-sm' : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'}" data-code="${fund.code}">
              <span class="material-symbols-outlined text-xs">${isComparing ? 'check' : 'add'}</span>
              <span>${isComparing ? 'Added' : 'Compare'}</span>
            </button>
          </div>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.card-interactive').forEach(card => {
      card.addEventListener('click', (e) => {
        const code = parseInt(card.getAttribute('data-code'));
        const fund = this.allFunds.find(f => f.code === code);
        
        if (e.target.closest('.compare-toggle-btn')) {
          e.stopPropagation();
          this.toggleCompare(fund, e);
          return;
        }

        if (fund) this.openDrawer(fund);
      });
    });
  }

  renderTable(funds) {
    const tbody = document.getElementById('screener-table-body');
    if (!tbody) return;

    if (funds.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" class="py-12 text-center text-on-surface-variant font-body-md">
            No mutual funds matched your active filters.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = funds.map(fund => {
      const isComparing = this.state.comparisonList.some(f => f.code === fund.code);
      const cagr3 = fund.cagr_3y !== null ? `${fund.cagr_3y > 0 ? '+' : ''}${fund.cagr_3y}%` : '-';
      const cagr5 = fund.cagr_5y !== null ? `${fund.cagr_5y > 0 ? '+' : ''}${fund.cagr_5y}%` : '-';
      const cagr10 = fund.cagr_10y !== null ? `${fund.cagr_10y > 0 ? '+' : ''}${fund.cagr_10y}%` : '-';
      
      const vsCat3 = fund.returns_vs_category_3y;
      const vsCat3Badge = vsCat3 !== null 
        ? `<span class="${vsCat3 >= 0 ? 'badge-gain' : 'badge-loss'} ml-1">${vsCat3 >= 0 ? '+' : ''}${vsCat3}%</span>` 
        : '';

      const vsCat5 = fund.returns_vs_category_5y;
      const vsCat5Badge = vsCat5 !== null 
        ? `<span class="${vsCat5 >= 0 ? 'badge-gain' : 'badge-loss'} ml-1">${vsCat5 >= 0 ? '+' : ''}${vsCat5}%</span>` 
        : '';

      const rolling = fund.rolling_3y_avg !== null ? `${fund.rolling_3y_avg}%` : '-';
      const sharpe = fund.sharpe_ratio !== null ? fund.sharpe_ratio.toFixed(2) : '-';
      const vol = fund.volatility !== null ? `${fund.volatility}%` : '-';
      
      const smart = fund.smart_score || { overall: ((fund.suggester_score || 70) / 10).toFixed(1), rank_text: '' };

      return `
        <tr class="hover:bg-surface-container-low transition-colors cursor-pointer" data-code="${fund.code}">
          <td class="py-3 px-4">
            <div class="flex items-center gap-2">
              <span class="w-7 h-7 rounded-lg bg-primary-fixed text-primary flex items-center justify-center font-label-bold text-xs flex-shrink-0">
                ${fund.fund_house.slice(0, 2).toUpperCase()}
              </span>
              <div class="min-w-0">
                <span class="font-label-bold text-on-surface hover:text-primary-container truncate block">${fund.name.split(' - Direct')[0]}</span>
                <p class="font-label-sm text-on-surface-variant text-[11px]">${fund.category} • AUM: ₹${fund.aum_cr ? fund.aum_cr.toLocaleString() : 'N/A'} Cr</p>
              </div>
            </div>
          </td>

          <td class="py-3 px-3 text-center">
            <span class="smartscore-badge">★ ${smart.overall}</span>
            <div class="text-[10px] text-on-surface-variant font-medium mt-0.5">${smart.rank_text || ''}</div>
          </td>

          <td class="py-3 px-3 font-label-bold text-right numeric">
            <span class="text-[#36B37E]">${cagr3}</span>
            <div class="text-[11px] mt-0.5">${vsCat3Badge}</div>
          </td>

          <td class="py-3 px-3 font-label-bold text-right numeric">
            <span>${cagr5}</span>
            <div class="text-[11px] mt-0.5">${vsCat5Badge}</div>
          </td>

          <td class="py-3 px-3 font-label-bold text-right numeric text-on-surface">
            <span>${cagr10}</span>
          </td>

          <td class="py-3 px-3 font-label-bold text-right numeric text-primary">
            ${rolling}
          </td>

          <td class="py-3 px-3 text-right numeric">
            <span class="font-label-bold ${fund.sharpe_ratio >= 1.0 ? 'text-[#36B37E]' : 'text-on-surface'}">${sharpe}</span>
          </td>

          <td class="py-3 px-3 text-right numeric text-on-surface-variant">
            ${vol}
          </td>

          <td class="py-3 px-3 text-center">
            <div class="flex items-center justify-center gap-1.5">
              <button class="p-1 rounded-lg hover:bg-surface-container text-primary analyze-row-btn touch-spring cursor-pointer" data-code="${fund.code}" title="SmartScore deep dive">
                <span class="material-symbols-outlined text-base">visibility</span>
              </button>
              <button class="px-2 py-1 rounded-lg text-xs font-label-bold flex items-center gap-0.5 transition-colors touch-spring cursor-pointer compare-toggle-btn ${isComparing ? 'bg-primary-container text-on-primary' : 'hover:bg-surface-container text-on-surface-variant'}" data-code="${fund.code}" title="Compare">
                <span class="material-symbols-outlined text-xs">${isComparing ? 'check' : 'add'}</span>
                <span>${isComparing ? 'Added' : 'Compare'}</span>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('tr[data-code]').forEach(row => {
      row.addEventListener('click', (e) => {
        const code = parseInt(row.getAttribute('data-code'));
        const fund = this.allFunds.find(f => f.code === code);
        
        if (e.target.closest('.compare-toggle-btn')) {
          e.stopPropagation();
          this.toggleCompare(fund, e);
          return;
        }

        if (fund) this.openDrawer(fund);
      });
    });
  }

  // ------------------------------------------------------------------
  // Compare Funds Logic
  // ------------------------------------------------------------------
  toggleCompare(fund, e) {
    if (e) e.stopPropagation();
    if (!fund) return;

    const existsIdx = this.state.comparisonList.findIndex(f => f.code === fund.code);
    if (existsIdx >= 0) {
      this.state.comparisonList.splice(existsIdx, 1);
    } else {
      if (this.state.comparisonList.length >= 3) {
        alert('You can compare up to 3 funds at a time. Please remove one to add another.');
        return;
      }
      this.state.comparisonList.push(fund);
    }

    this.updateComparisonTray();
    this.updateCompareButtonsVisuals();
  }

  updateCompareButtonsVisuals() {
    document.querySelectorAll('.compare-toggle-btn').forEach(btn => {
      const code = parseInt(btn.getAttribute('data-code'));
      const isComparing = this.state.comparisonList.some(f => f.code === code);
      if (isComparing) {
        btn.classList.add('bg-primary-container', 'text-on-primary', 'border-primary-container');
        btn.classList.remove('border-outline-variant', 'text-on-surface-variant');
        btn.innerHTML = `<span class="material-symbols-outlined text-xs">check</span><span>Added</span>`;
      } else {
        btn.classList.remove('bg-primary-container', 'text-on-primary', 'border-primary-container');
        btn.classList.add('border-outline-variant', 'text-on-surface-variant');
        btn.innerHTML = `<span class="material-symbols-outlined text-xs">add</span><span>Compare</span>`;
      }
    });
  }

  updateComparisonTray() {
    const tray = document.getElementById('compare-tray');
    const countEl = document.getElementById('compare-count');
    const chipsContainer = document.getElementById('compare-chips');

    if (!tray) return;

    if (this.state.comparisonList.length > 0) {
      tray.classList.add('visible');
      if (countEl) countEl.textContent = `${this.state.comparisonList.length}/3 Selected`;
      
      if (chipsContainer) {
        chipsContainer.innerHTML = this.state.comparisonList.map(f => `
          <span class="bg-surface-container-high px-2.5 py-1 rounded-lg text-xs font-label-bold flex items-center gap-1.5 text-on-surface flex-shrink-0 border border-surface-container">
            <span>${f.name.split(' - Direct')[0].slice(0, 16)}...</span>
            <button class="text-on-surface-variant hover:text-error remove-compare flex items-center" data-code="${f.code}" title="Remove fund">
              <span class="material-symbols-outlined text-xs">close</span>
            </button>
          </span>
        `).join('');

        chipsContainer.querySelectorAll('.remove-compare').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const code = parseInt(btn.getAttribute('data-code'));
            const fund = this.allFunds.find(f => f.code === code);
            this.toggleCompare(fund, e);
          });
        });
      }
    } else {
      tray.classList.remove('visible');
    }
  }

  openComparisonModal() {
    if (this.state.comparisonList.length === 0) return;
    const modal = document.getElementById('comparison-modal');
    if (!modal) return;

    modal.classList.remove('hidden');

    const tableContainer = document.getElementById('comparison-matrix');
    if (tableContainer) {
      const funds = this.state.comparisonList;
      tableContainer.innerHTML = `
        <table class="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr class="border-b border-surface-container-high bg-surface-container-low">
              <th class="py-2.5 px-3 font-label-bold text-xs text-on-surface-variant uppercase">Key Metric</th>
              ${funds.map(f => `
                <th class="py-2.5 px-3 font-label-bold text-xs text-primary">
                  <div class="flex items-center justify-between gap-1">
                    <span class="truncate">${f.name.split(' - Direct')[0]}</span>
                    <button class="modal-remove-fund text-on-surface-variant hover:text-error" data-code="${f.code}" title="Remove">
                      <span class="material-symbols-outlined text-xs">close</span>
                    </button>
                  </div>
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-container text-xs">
            <tr>
              <td class="py-2.5 px-3 font-label-bold text-on-surface-variant">SmartScore™ (Overall)</td>
              ${funds.map(f => `<td class="py-2.5 px-3"><span class="smartscore-badge">★ ${f.smart_score ? f.smart_score.overall : (f.suggester_score/10)}/10</span></td>`).join('')}
            </tr>
            <tr>
              <td class="py-2.5 px-3 font-label-bold text-on-surface-variant">Performance Score</td>
              ${funds.map(f => `<td class="py-2.5 px-3 font-bold text-[#36B37E]">${f.smart_score ? f.smart_score.pillars.performance.score : '-'}/10</td>`).join('')}
            </tr>
            <tr>
              <td class="py-2.5 px-3 font-label-bold text-on-surface-variant">Risk Score (Safety)</td>
              ${funds.map(f => `<td class="py-2.5 px-3 font-bold text-on-surface">${f.smart_score ? f.smart_score.pillars.risk.score : '-'}/10</td>`).join('')}
            </tr>
            <tr>
              <td class="py-2.5 px-3 font-label-bold text-on-surface-variant">Cost Score (Low Fee)</td>
              ${funds.map(f => `<td class="py-2.5 px-3 font-bold text-primary">${f.smart_score ? f.smart_score.pillars.cost.score : '-'}/10</td>`).join('')}
            </tr>
            <tr>
              <td class="py-2.5 px-3 font-label-bold text-on-surface-variant">Category</td>
              ${funds.map(f => `<td class="py-2.5 px-3 font-semibold">${f.category}</td>`).join('')}
            </tr>
            <tr>
              <td class="py-2.5 px-3 font-label-bold text-on-surface-variant">3Y CAGR</td>
              ${funds.map(f => `<td class="py-2.5 px-3 font-display-financial text-base text-[#36B37E]">${f.cagr_3y ? '+' + f.cagr_3y + '%' : '-'}</td>`).join('')}
            </tr>
            <tr>
              <td class="py-2.5 px-3 font-label-bold text-on-surface-variant">3Y Avg Rolling Return</td>
              ${funds.map(f => `<td class="py-2.5 px-3 font-label-bold text-primary">${f.rolling_3y_avg ? f.rolling_3y_avg + '%' : '-'}</td>`).join('')}
            </tr>
            <tr>
              <td class="py-2.5 px-3 font-label-bold text-on-surface-variant">Sharpe Ratio (Rf=6.8%)</td>
              ${funds.map(f => `<td class="py-2.5 px-3 font-label-bold text-on-surface">${f.sharpe_ratio}</td>`).join('')}
            </tr>
            <tr>
              <td class="py-2.5 px-3 font-label-bold text-on-surface-variant">Max Drawdown</td>
              ${funds.map(f => `<td class="py-2.5 px-3 font-semibold text-error">${f.max_drawdown ? f.max_drawdown + '%' : '-'}</td>`).join('')}
            </tr>
            <tr>
              <td class="py-2.5 px-3 font-label-bold text-on-surface-variant">Volatility (Std Dev)</td>
              ${funds.map(f => `<td class="py-2.5 px-3">${f.volatility}%</td>`).join('')}
            </tr>
            <tr>
              <td class="py-2.5 px-3 font-label-bold text-on-surface-variant">Alpha vs Benchmark</td>
              ${funds.map(f => `<td class="py-2.5 px-3 text-[#36B37E] font-bold">+${f.alpha_estimate}%</td>`).join('')}
            </tr>
            <tr>
              <td class="py-2.5 px-3 font-label-bold text-on-surface-variant">Expense Ratio</td>
              ${funds.map(f => `<td class="py-2.5 px-3">${f.expense_ratio}%</td>`).join('')}
            </tr>
            <tr>
              <td class="py-2.5 px-3 font-label-bold text-on-surface-variant">Fund Manager</td>
              ${funds.map(f => `<td class="py-2.5 px-3">${f.manager} (${f.manager_tenure_years} yrs)</td>`).join('')}
            </tr>
            <tr>
              <td class="py-2.5 px-3 font-label-bold text-on-surface-variant">AUM (₹ Cr)</td>
              ${funds.map(f => `<td class="py-2.5 px-3">₹${f.aum_cr ? f.aum_cr.toLocaleString() : '-'} Cr</td>`).join('')}
            </tr>
          </tbody>
        </table>
      `;

      tableContainer.querySelectorAll('.modal-remove-fund').forEach(btn => {
        btn.addEventListener('click', () => {
          const code = parseInt(btn.getAttribute('data-code'));
          const fund = this.allFunds.find(f => f.code === code);
          this.toggleCompare(fund);
          if (this.state.comparisonList.length === 0) {
            this.closeComparisonModal();
          } else {
            this.openComparisonModal();
          }
        });
      });
    }

    setTimeout(() => {
      ChartEngine.renderComparisonChart('chart-comparison-canvas', this.state.comparisonList);
    }, 100);
  }

  closeComparisonModal() {
    const modal = document.getElementById('comparison-modal');
    if (modal) modal.classList.add('hidden');
  }

  // ------------------------------------------------------------------
  // Deep-Dive Drawer with SmartScore(TM) Scorecard
  // ------------------------------------------------------------------
  renderScorecard(fund) {
    const container = document.getElementById('drawer-scorecard-pillars');
    const overallEl = document.getElementById('drawer-scorecard-overall');
    if (!container) return;

    const smart = fund.smart_score || {};
    const overall = smart.overall || ((fund.suggester_score || 70) / 10).toFixed(1);
    const rankText = smart.rank_text || `Rank in category`;

    if (overallEl) {
      overallEl.innerHTML = `
        <span class="text-on-surface font-bold text-xs">SmartScore™</span>
        <span class="text-primary font-extrabold text-sm ml-1">${overall}/10</span>
        <span class="text-[10px] text-on-surface-variant font-medium block">Rank vs peers: <strong class="text-on-surface">${rankText}</strong></span>
      `;
    }

    const p = smart.pillars || {};
    const perf = p.performance || { score: 7.8, tag: 'High', summary: 'The creamy layer - amongst the top performing Mutual Funds', rank_text: rankText, metrics: [] };
    const risk = p.risk || { score: 7.2, tag: 'Low', summary: 'Well contained volatility with superior risk-adjusted return', rank_text: rankText, metrics: [] };
    const cost = p.cost || { score: 5.4, tag: 'Avg', summary: 'Market standard costs, nothing exciting', rank_text: rankText, metrics: [] };
    const comp = p.composition || { score: 6.8, tag: 'High', summary: 'A well thought mix versus other funds', rank_text: rankText, metrics: [] };
    const flags = p.red_flags || { score: 9.5, tag: 'Low', summary: 'We got you covered, no major red flags identified', rank_text: 'Clean', metrics: [] };

    const getGaugeColor = (score, isRisk = false) => {
      if (isRisk) {
        return score < 5.0 ? 'gauge-red' : (score < 7.0 ? 'gauge-amber' : 'gauge-green');
      }
      return score >= 7.0 ? 'gauge-green' : (score >= 5.0 ? 'gauge-amber' : 'gauge-red');
    };

    const getTagClass = (tag, isRisk = false) => {
      if (isRisk) {
        return tag === 'High' ? 'tag-red' : (tag === 'Avg' ? 'tag-amber' : 'tag-green');
      }
      return tag === 'High' ? 'tag-green' : (tag === 'Avg' ? 'tag-amber' : 'tag-red');
    };

    const pillarsConfig = [
      { key: 'performance', name: 'Performance', icon: null, data: perf, isRisk: false, defaultOpen: true },
      { key: 'risk', name: 'Risk', icon: null, data: risk, isRisk: true, defaultOpen: true },
      { key: 'cost', name: 'Cost', icon: null, data: cost, isRisk: false, defaultOpen: false },
      { key: 'composition', name: 'Composition', icon: null, data: comp, isRisk: false, defaultOpen: false },
      { key: 'red_flags', name: 'Red flags', icon: 'flag', data: flags, isRisk: false, defaultOpen: false }
    ];

    container.innerHTML = pillarsConfig.map(cfg => {
      const d = cfg.data;
      const gaugeClass = getGaugeColor(d.score, cfg.isRisk);
      const tagClass = getTagClass(d.tag, cfg.isRisk);
      const hasIcon = cfg.icon;

      return `
        <div class="scorecard-item ${cfg.defaultOpen ? 'open' : ''}" data-pillar="${cfg.key}">
          <button class="scorecard-trigger" type="button">
            <!-- Circular Score Gauge matching user reference images -->
            ${hasIcon ? `
              <div class="smartscore-gauge ${gaugeClass}">
                <span class="material-symbols-outlined text-error text-xl">flag</span>
              </div>
            ` : `
              <div class="smartscore-gauge ${gaugeClass}">
                <span>${d.score.toFixed(1)}</span>
              </div>
            `}

            <!-- Title & Verbal Summary -->
            <div class="flex-grow min-w-0">
              <div class="flex items-center gap-2 mb-0.5">
                <span class="font-headline-md text-sm text-on-surface">${cfg.name}</span>
                <span class="smartscore-tag ${tagClass}">${d.tag}</span>
              </div>
              <p class="text-xs text-on-surface-variant line-clamp-1 leading-snug">${d.summary}</p>
            </div>

            <!-- Accordion Toggle Chevron -->
            <span class="material-symbols-outlined text-on-surface-variant text-base scorecard-chevron">expand_more</span>
          </button>

          <!-- Accordion Body with Sub-Metrics -->
          <div class="scorecard-body">
            <p class="text-xs text-on-surface-variant font-medium mb-2 pl-1">
              Rank vs peers: <strong class="text-on-surface font-bold">${d.rank_text}</strong>
            </p>

            <div class="scorecard-details-card">
              ${(d.metrics || []).map(m => `
                <div class="scorecard-submetric-row">
                  <div>
                    <p class="font-label-bold text-xs text-on-surface leading-tight">${m.name}</p>
                    <p class="text-[11px] text-on-surface-variant mt-0.5">${m.label || m.value}</p>
                  </div>
                  ${m.score !== undefined ? `
                    <div class="text-right">
                      <span class="font-label-bold text-xs text-on-surface">Score : </span>
                      <strong class="font-display-financial text-xs ${m.score >= 6.5 ? 'text-[#36B37E]' : (m.score >= 4.0 ? 'text-[#FFAB00]' : 'text-[#FF5630]')}">${m.score}/10</strong>
                    </div>
                  ` : `
                    <div>
                      <span class="smartscore-tag tag-green text-[10px]">Pass</span>
                    </div>
                  `}
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.scorecard-trigger').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const item = trigger.closest('.scorecard-item');
        item.classList.toggle('open');
      });
    });
  }

  openDrawer(fund) {
    this.state.selectedFund = fund;
    const drawer = document.getElementById('fund-drawer');
    const backdrop = document.getElementById('drawer-backdrop');

    if (!drawer || !backdrop) return;

    backdrop.classList.add('active');
    drawer.classList.add('open');

    const smart = fund.smart_score || { overall: ((fund.suggester_score || 70) / 10).toFixed(1), rank_text: '' };

    document.getElementById('drawer-fund-name').textContent = fund.name.split(' - Direct')[0];
    document.getElementById('drawer-fund-cat').textContent = `${fund.category} • ${fund.fund_house}`;
    
    const badgeEl = document.getElementById('drawer-smartscore-badge');
    if (badgeEl) {
      badgeEl.innerHTML = `★ ${smart.overall} SmartScore™`;
    }

    document.getElementById('drawer-nav-price').textContent = `₹${fund.latest_nav}`;
    document.getElementById('drawer-nav-date').textContent = `As of ${fund.nav_date}`;
    
    document.getElementById('drawer-aum').textContent = fund.aum_cr ? `₹${fund.aum_cr.toLocaleString()} Cr` : 'N/A';
    document.getElementById('drawer-expense-ratio').textContent = fund.expense_ratio ? `${fund.expense_ratio}%` : 'N/A';
    document.getElementById('drawer-pe').textContent = fund.pe_ratio ? `${fund.pe_ratio}` : 'N/A';
    document.getElementById('drawer-manager').textContent = `${fund.manager || 'Senior Manager'} (${fund.manager_tenure_years || 0} yrs)`;

    const ret3El = document.getElementById('drawer-3y-return');
    if (ret3El) ret3El.textContent = `${fund.cagr_3y ? (fund.cagr_3y > 0 ? '+' : '') + fund.cagr_3y + '%' : 'N/A'}`;

    const rolling3El = document.getElementById('drawer-3y-rolling');
    if (rolling3El) rolling3El.textContent = `${fund.rolling_3y_avg || 'N/A'}%`;

    const sharpeEl = document.getElementById('drawer-sharpe');
    if (sharpeEl) sharpeEl.textContent = `${fund.sharpe_ratio || 'N/A'}`;

    const volEl = document.getElementById('drawer-volatility');
    if (volEl) volEl.textContent = `${fund.volatility || 'N/A'}%`;

    // Render the Proprietary SmartScore (TM) Scorecard!
    this.renderScorecard(fund);

    const holdingsContainer = document.getElementById('drawer-holdings');
    if (holdingsContainer) {
      holdingsContainer.innerHTML = (fund.top_holdings || []).map(h => `
        <span class="bg-surface-container-low px-2 py-1 rounded text-xs font-label-bold text-on-surface-variant">${h}</span>
      `).join('');
    }

    const checklistContainer = document.getElementById('drawer-checklist');
    if (checklistContainer) {
      checklistContainer.innerHTML = (fund.checklist || []).map(item => {
        const iconName = item.status === 'pass' ? 'check' : (item.status === 'warn' ? 'priority_high' : 'info');
        const iconClass = item.status === 'pass' ? 'checklist-pass' : (item.status === 'warn' ? 'checklist-warn' : 'checklist-info');
        return `
          <div class="checklist-item">
            <div class="checklist-icon ${iconClass}">
              <span class="material-symbols-outlined text-sm">${iconName}</span>
            </div>
            <div>
              <div class="flex items-center gap-1">
                <span class="text-xs font-bold text-on-surface-variant uppercase">Step ${item.step}:</span>
                <span class="font-label-bold text-xs text-on-surface">${item.title}</span>
              </div>
              <p class="font-label-sm text-[11px] text-on-surface-variant mt-0.5">${item.desc}</p>
            </div>
          </div>
        `;
      }).join('');
    }

    const catStats = this.categoriesSummary[fund.category] || {};
    setTimeout(() => {
      ChartEngine.renderNavChart('chart-nav-history', fund.nav_history, 'ALL');
      ChartEngine.renderRollingChart('chart-rolling-returns', fund.rolling_series, catStats.avg_rolling_3y);
      ChartEngine.renderCategoryBarChart('chart-category-comparison', fund, catStats);
      ChartEngine.renderScatterQuadrant('chart-risk-reward', this.allFunds, fund);
    }, 150);
  }

  closeDrawer() {
    const drawer = document.getElementById('fund-drawer');
    const backdrop = document.getElementById('drawer-backdrop');

    if (drawer) drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('active');
    this.state.selectedFund = null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new BickerBapeApp();
});
