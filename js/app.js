/**
 * BickerBape Master Controller
 * Features:
 * - SmartScore (TM) Proprietary 5-Pillar Scorecard (Performance, Risk, Cost, Composition, Red Flags)
 * - SuperScore (TM) with Blue-to-Red Dynamic Cell Hue & Percentage Gradient
 * - 3Y, 5Y, and 10Y Return vs Category Ratios
 * - Ratio-ed Circular Circumference Gauge Mechanics
 * - Collapsible Screener Sidebar & Distraction-Free Comparison Bar Toggle
 * - Apple Fluid Motion Physics
 * - Workable Comparison Tray & Matrix Modal
 * - Interactive Chart.js Visualizations (including 3M NAV Growth)
 */

import { DataService } from './data-service.js';
import { AnalyticsEngine } from './analytics.js';
import { ChartEngine } from './charts.js';
import { FluidMotion } from './motion.js';
import { SimSimUI } from './simsim-ui.js';

class BickerBapeApp {
  constructor() {
    this.allFunds = [];
    this.categoriesSummary = {};
    this.activeEditingSlot = 0;
    this.simsim = new SimSimUI(this);
    
    let initialCols = ['smart_score', 'cagr_3y', 'cagr_5y', 'cagr_10y', 'rolling_3y_avg', 'sharpe_ratio', 'volatility'];
    try {
      const savedCols = localStorage.getItem('bickerbape_table_cols');
      if (savedCols) {
        const parsed = JSON.parse(savedCols);
        if (Array.isArray(parsed) && parsed.length > 0) initialCols = parsed;
      }
    } catch (e) {}

    this.state = {
      mood: 'growth', // 'growth' | 'safety' | 'income'
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
      sidebarCollapsed: false,
      compareTrayMinimized: false,
      tableColumns: initialCols
    };

    this.initKpiCatalog();
    this.init();
  }

  async init() {
    FluidMotion.initTactileFeedback();

    // 1. Load data
    this.allFunds = await DataService.loadFunds();
    this.categoriesSummary = await DataService.loadCategoriesSummary();

    // Initialize with default Growth Mood
    this.recalculateSmartScoresForMood('growth');

    // 2. Setup all listeners
    this.setupEventListeners();

    // Render dynamic table headers
    this.renderTableHeader();

    // 3. Initial Render
    this.updateUI();

    // 4. Initialize SimSim tray and buttons
    if (this.simsim) {
      this.simsim.updateTray();
      this.simsim.updateScreenerButtons();
    }
  }

  initKpiCatalog() {
    this.KPI_CATALOG = {
      smart_score: {
        id: 'smart_score',
        label: 'SmartScore™',
        category: 'Rating',
        align: 'text-center',
        sortKey: 'smart_score',
        infoKey: 'smartscore',
        sample: 'Proprietary institutional fund score (1 to 10)',
        format: (fund) => {
          const smart = fund.smart_score || { overall: ((fund.suggester_score || 70) / 10).toFixed(1) };
          return `
            <div class="flex flex-col items-center">
              ${this.getSmartScorePill(smart.overall)}
              <span class="text-[10px] text-on-surface-variant font-medium mt-1 truncate max-w-[110px]" title="Category: ${fund.category}">vs ${fund.category.split(' ')[0]}: ${smart.rank_text ? smart.rank_text.split(' of ')[0] : ''}</span>
            </div>
          `;
        }
      },
      cagr_3y: {
        id: 'cagr_3y',
        label: '3Y Ret & Ratio',
        category: 'Returns',
        align: 'text-right',
        sortKey: 'cagr_3y',
        infoKey: 'ratio_3y',
        sample: '3Y CAGR + Outperformance ratio vs category',
        format: (fund) => {
          const cagr3 = (fund.cagr_3y !== null && fund.cagr_3y !== undefined) ? `${fund.cagr_3y > 0 ? '+' : ''}${fund.cagr_3y}%` : '-';
          const ratio3 = fund.ratio_3y ? `<div class="text-[11px] mt-0.5 text-primary font-bold">(${fund.ratio_3y}x cat)</div>` : '';
          return `<span class="text-[#36B37E] font-bold">${cagr3}</span>${ratio3}`;
        }
      },
      cagr_5y: {
        id: 'cagr_5y',
        label: '5Y Ret & Ratio',
        category: 'Returns',
        align: 'text-right',
        sortKey: 'cagr_5y',
        infoKey: 'ratio_5y',
        sample: '5Y CAGR + Outperformance ratio vs category',
        format: (fund) => {
          const cagr5 = (fund.cagr_5y !== null && fund.cagr_5y !== undefined) ? `${fund.cagr_5y > 0 ? '+' : ''}${fund.cagr_5y}%` : '-';
          const ratio5 = fund.ratio_5y ? `<div class="text-[11px] mt-0.5 text-on-surface-variant font-medium">(${fund.ratio_5y}x)</div>` : '';
          return `<span class="font-bold text-on-surface">${cagr5}</span>${ratio5}`;
        }
      },
      cagr_10y: {
        id: 'cagr_10y',
        label: '10Y CAGR',
        category: 'Returns',
        align: 'text-right',
        sortKey: 'cagr_10y',
        infoKey: 'cagr_10y',
        sample: '10-Year Compound Annual Growth Rate',
        format: (fund) => {
          const cagr10 = (fund.cagr_10y !== null && fund.cagr_10y !== undefined) ? `${fund.cagr_10y > 0 ? '+' : ''}${fund.cagr_10y}%` : '-';
          const ratio10 = fund.ratio_10y ? `<div class="text-[11px] text-on-surface-variant font-medium">(${fund.ratio_10y}x)</div>` : '';
          return `<span class="font-bold text-on-surface">${cagr10}</span>${ratio10}`;
        }
      },
      cagr_1y: {
        id: 'cagr_1y',
        label: '1Y Return',
        category: 'Returns',
        align: 'text-right',
        sortKey: 'cagr_1y',
        infoKey: 'cagr_1y',
        sample: 'Trailing 1-Year absolute compounded return',
        format: (fund) => {
          const c = (fund.cagr_1y !== null && fund.cagr_1y !== undefined) ? `${fund.cagr_1y > 0 ? '+' : ''}${fund.cagr_1y}%` : '-';
          const clr = (fund.cagr_1y || 0) >= 12.0 ? 'text-[#36B37E]' : 'text-on-surface';
          return `<span class="font-bold ${clr}">${c}</span>`;
        }
      },
      growth_3m: {
        id: 'growth_3m',
        label: 'Past 3M Growth',
        category: 'Returns',
        align: 'text-right',
        sortKey: 'growth_3m',
        infoKey: 'growth_3m',
        sample: 'Recent quarterly growth (+% or -%)',
        format: (fund) => {
          const g = (fund.growth_3m !== null && fund.growth_3m !== undefined) ? `${fund.growth_3m > 0 ? '+' : ''}${fund.growth_3m}%` : '-';
          const clr = (fund.growth_3m || 0) >= 0 ? 'text-[#36B37E]' : 'text-error';
          return `<span class="font-bold ${clr}">${g}</span>`;
        }
      },
      rolling_3y_avg: {
        id: 'rolling_3y_avg',
        label: '3Y Rolling Avg',
        category: 'Returns',
        align: 'text-right',
        sortKey: 'rolling_3y_avg',
        infoKey: 'rolling_3y',
        sample: '3-Year rolling return consistency average',
        format: (fund) => {
          const r = (fund.rolling_3y_avg !== null && fund.rolling_3y_avg !== undefined) ? `${fund.rolling_3y_avg}%` : '-';
          return `<span class="font-bold text-primary">${r}</span>`;
        }
      },
      sharpe_ratio: {
        id: 'sharpe_ratio',
        label: 'Sharpe Ratio',
        category: 'Risk',
        align: 'text-right',
        sortKey: 'sharpe_ratio',
        infoKey: 'sharpe',
        sample: 'Excess return per unit of volatility (Rf=6.8%)',
        format: (fund) => {
          const s = (fund.sharpe_ratio !== null && fund.sharpe_ratio !== undefined) ? fund.sharpe_ratio.toFixed(2) : '-';
          const clr = (fund.sharpe_ratio || 0) >= 1.0 ? 'text-[#36B37E]' : 'text-on-surface';
          return `<span class="font-bold ${clr}">${s}</span>`;
        }
      },
      sortino_ratio: {
        id: 'sortino_ratio',
        label: 'Sortino Ratio',
        category: 'Risk',
        align: 'text-right',
        sortKey: 'sortino_ratio',
        infoKey: 'sortino',
        sample: 'Downside risk-adjusted performance measure',
        format: (fund) => {
          const s = (fund.sortino_ratio !== null && fund.sortino_ratio !== undefined) ? fund.sortino_ratio.toFixed(2) : '-';
          const clr = (fund.sortino_ratio || 0) >= 1.2 ? 'text-[#36B37E]' : 'text-on-surface';
          return `<span class="font-bold ${clr}">${s}</span>`;
        }
      },
      volatility: {
        id: 'volatility',
        label: 'Volatility (σ)',
        category: 'Risk',
        align: 'text-right',
        sortKey: 'volatility',
        infoKey: 'volatility',
        sample: 'Annualized price fluctuation standard deviation',
        format: (fund) => {
          const v = (fund.volatility !== null && fund.volatility !== undefined) ? `${fund.volatility}%` : '-';
          return `<span class="font-medium text-on-surface-variant">${v}</span>`;
        }
      },
      max_drawdown: {
        id: 'max_drawdown',
        label: 'Max Drawdown',
        category: 'Risk',
        align: 'text-right',
        sortKey: 'max_drawdown',
        infoKey: 'max_drawdown',
        sample: 'Largest historic peak-to-trough crash drop',
        format: (fund) => {
          const m = (fund.max_drawdown !== null && fund.max_drawdown !== undefined) ? `-${fund.max_drawdown}%` : '-';
          return `<span class="font-semibold text-error">${m}</span>`;
        }
      },
      beta: {
        id: 'beta',
        label: 'Beta',
        category: 'Risk',
        align: 'text-right',
        sortKey: 'beta',
        infoKey: 'beta',
        sample: 'Sensitivity to broader market fluctuations',
        format: (fund) => {
          const b = (fund.beta !== null && fund.beta !== undefined) ? fund.beta.toFixed(2) : '1.0';
          return `<span class="font-medium text-on-surface">${b}</span>`;
        }
      },
      expense_ratio: {
        id: 'expense_ratio',
        label: 'Direct TER',
        category: 'Cost',
        align: 'text-right',
        sortKey: 'expense_ratio',
        infoKey: 'ter',
        sample: 'Annual direct total expense fee deducted (%)',
        format: (fund) => {
          const e = fund.expense_ratio ? `${fund.expense_ratio}%` : '-';
          const clr = (fund.expense_ratio || 1.0) <= 0.65 ? 'text-[#36B37E]' : 'text-on-surface';
          return `<span class="font-bold ${clr}">${e}</span>`;
        }
      },
      pe_ratio: {
        id: 'pe_ratio',
        label: 'Portfolio P/E',
        category: 'Cost',
        align: 'text-right',
        sortKey: 'pe_ratio',
        infoKey: 'pe_ratio',
        sample: 'Price-to-Earnings valuation of underlying holdings',
        format: (fund) => {
          const p = fund.pe_ratio ? fund.pe_ratio.toFixed(1) : '-';
          return `<span class="font-medium text-on-surface">${p}</span>`;
        }
      },
      turnover_ratio: {
        id: 'turnover_ratio',
        label: 'Turnover Ratio',
        category: 'Cost',
        align: 'text-right',
        sortKey: 'turnover_ratio',
        infoKey: 'turnover',
        sample: 'Annual stock trading and portfolio churn rate (%)',
        format: (fund) => {
          const t = fund.turnover_ratio ? `${fund.turnover_ratio}%` : '-';
          return `<span class="font-medium text-on-surface-variant">${t}</span>`;
        }
      },
      aum_cr: {
        id: 'aum_cr',
        label: 'AUM (₹ Cr)',
        category: 'Quality',
        align: 'text-right',
        sortKey: 'aum_cr',
        infoKey: 'aum',
        sample: 'Total Assets Under Management in ₹ Crores',
        format: (fund) => {
          const a = fund.aum_cr ? `₹${fund.aum_cr.toLocaleString()} Cr` : '-';
          return `<span class="font-bold text-on-surface">${a}</span>`;
        }
      },
      manager_tenure_years: {
        id: 'manager_tenure_years',
        label: 'Manager Tenure',
        category: 'Quality',
        align: 'text-right',
        sortKey: 'manager_tenure_years',
        infoKey: 'manager',
        sample: 'Years the fund manager has steered the fund',
        format: (fund) => {
          const m = fund.manager_tenure_years ? `${fund.manager_tenure_years} yrs` : '-';
          return `<span class="font-medium text-on-surface">${m}</span>`;
        }
      }
    };
  }

  renderTableHeader() {
    const thead = document.getElementById('screener-table-header');
    if (!thead) return;

    const colsHtml = this.state.tableColumns.map((colKey, idx) => {
      const kpi = this.KPI_CATALOG[colKey] || this.KPI_CATALOG.cagr_3y;
      const isSorted = this.state.sortBy === kpi.sortKey;
      const sortIcon = isSorted ? (this.state.sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more';

      return `
        <th class="py-2.5 px-2.5 ${kpi.align} cursor-pointer select-none group relative" data-sort="${kpi.sortKey}" data-slot="${idx}">
          <div class="flex items-center ${kpi.align === 'text-center' ? 'justify-center' : 'justify-end'} gap-1">
            <button type="button" class="col-edit-btn" data-slot="${idx}" title="Click to swap this column with another metric (e.g. TER, Sortino, Drawdown)">
              <span class="material-symbols-outlined text-[13px]">edit</span>
            </button>
            <span class="font-label-bold text-xs text-on-surface-variant">${kpi.label}</span>
            ${this.getInfoBtnHtml(kpi.infoKey)}
            <span class="material-symbols-outlined text-sm sort-icon ${isSorted ? 'text-primary' : ''}">${sortIcon}</span>
          </div>
        </th>
      `;
    }).join('');

    const countBadge = document.getElementById('active-columns-count-badge');
    if (countBadge) {
      countBadge.textContent = `${this.state.tableColumns.length} Columns Active`;
    }

    thead.innerHTML = `
      <tr class="font-label-bold text-xs text-on-surface-variant uppercase tracking-wider">
        <th class="py-2.5 px-3 cursor-pointer select-none" data-sort="name">
          <div class="flex items-center gap-1">
            <span>Scheme & Category</span>
            <span class="material-symbols-outlined text-sm sort-icon ${this.state.sortBy === 'name' ? 'text-primary' : ''}">${this.state.sortBy === 'name' ? (this.state.sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}</span>
          </div>
        </th>
        ${colsHtml}
        <th class="py-2.5 px-3 text-center">Actions</th>
      </tr>
    `;
  }

  openKpiPicker(slotIndex = null) {
    this.activeEditingSlot = slotIndex;
    const modal = document.getElementById('kpi-picker-modal');
    const subtitle = document.getElementById('kpi-picker-subtitle');
    if (!modal) return;

    this.tempSelectedColumns = [...this.state.tableColumns];

    if (slotIndex !== null && this.state.tableColumns[slotIndex]) {
      const currentKey = this.state.tableColumns[slotIndex];
      const currentKpi = this.KPI_CATALOG[currentKey] || {};
      if (subtitle) {
        subtitle.textContent = `Select metrics to build your table (Currently focused on Column ${slotIndex + 1}: ${currentKpi.label || 'Metric'}). Check or uncheck to build your view.`;
      }
    } else {
      if (subtitle) {
        subtitle.textContent = "Select multiple metrics to include in your screener table. Check or uncheck to build your custom view.";
      }
    }

    this.updateKpiModalSelectedCounter();

    const searchInput = document.getElementById('kpi-search-input');
    if (searchInput) searchInput.value = '';

    this.renderKpiOptionsList('');
    modal.classList.add('open');
  }

  updateKpiModalSelectedCounter() {
    const counter = document.getElementById('kpi-selected-counter');
    if (counter) {
      counter.textContent = `${this.tempSelectedColumns.length} Selected`;
    }
  }

  closeKpiPicker() {
    const modal = document.getElementById('kpi-picker-modal');
    if (modal) modal.classList.remove('open');
  }

  renderKpiOptionsList(query = '') {
    const container = document.getElementById('kpi-options-container');
    if (!container) return;

    const q = query.toLowerCase().trim();

    const categories = ['Returns', 'Risk', 'Cost', 'Quality', 'Rating'];
    const badgeClasses = {
      Returns: 'kpi-badge-returns',
      Risk: 'kpi-badge-risk',
      Cost: 'kpi-badge-cost',
      Quality: 'kpi-badge-quality',
      Rating: 'kpi-badge-rating'
    };

    let html = '';
    categories.forEach(cat => {
      const items = Object.values(this.KPI_CATALOG).filter(k => {
        if (k.category !== cat) return false;
        if (!q) return true;
        return k.label.toLowerCase().includes(q) || k.id.toLowerCase().includes(q) || (k.sample && k.sample.toLowerCase().includes(q));
      });

      if (items.length === 0) return;

      html += `
        <div>
          <span class="text-[11px] font-label-bold uppercase tracking-wider text-on-surface-variant mb-1.5 block">${cat} Metrics</span>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            ${items.map(kpi => {
              const isSelected = this.tempSelectedColumns.includes(kpi.id);
              return `
                <button type="button" class="kpi-option-btn ${isSelected ? 'active' : ''} touch-spring cursor-pointer" data-kpi-id="${kpi.id}">
                  <div class="min-w-0 pr-2">
                    <div class="flex items-center gap-1.5">
                      <span class="font-label-bold text-xs text-on-surface">${kpi.label}</span>
                      <span class="kpi-category-badge ${badgeClasses[kpi.category] || 'bg-surface-container'}">${kpi.category}</span>
                    </div>
                    <p class="text-[11px] text-on-surface-variant truncate mt-0.5">${kpi.sample || ''}</p>
                  </div>
                  <span class="material-symbols-outlined text-xl ${isSelected ? 'text-primary' : 'text-surface-container-high'} flex-shrink-0">
                    ${isSelected ? 'check_box' : 'check_box_outline_blank'}
                  </span>
                </button>
              `;
            }).join('')}
          </div>
        </div>
      `;
    });

    if (!html) {
      html = `<p class="py-8 text-center text-xs text-on-surface-variant">No metrics match "${query}".</p>`;
    }

    container.innerHTML = html;

    container.querySelectorAll('.kpi-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const kpiId = btn.getAttribute('data-kpi-id');
        this.toggleKpiSelection(kpiId);
      });
    });
  }

  toggleKpiSelection(kpiId) {
    if (this.tempSelectedColumns.includes(kpiId)) {
      if (this.tempSelectedColumns.length <= 1) {
        return; // Require at least one column
      }
      this.tempSelectedColumns = this.tempSelectedColumns.filter(id => id !== kpiId);
    } else {
      this.tempSelectedColumns.push(kpiId);
    }
    this.updateKpiModalSelectedCounter();
    const searchInput = document.getElementById('kpi-search-input');
    this.renderKpiOptionsList(searchInput ? searchInput.value : '');
  }

  buildTableFromSelection() {
    if (this.tempSelectedColumns && this.tempSelectedColumns.length > 0) {
      this.state.tableColumns = [...this.tempSelectedColumns];
      try {
        localStorage.setItem('bickerbape_table_cols', JSON.stringify(this.state.tableColumns));
      } catch (e) {}
    }
    this.closeKpiPicker();
    this.renderTableHeader();
    this.updateUI(false);
  }

  resetTableColumnsToDefault() {
    this.state.tableColumns = ['smart_score', 'cagr_3y', 'cagr_5y', 'cagr_10y', 'rolling_3y_avg', 'sharpe_ratio', 'volatility'];
    this.tempSelectedColumns = [...this.state.tableColumns];
    try {
      localStorage.removeItem('bickerbape_table_cols');
    } catch (e) {}
    this.closeKpiPicker();
    this.renderTableHeader();
    this.updateUI(false);
  }

  setMood(mood) {
    if (this.state.mood === mood) return;
    this.state.mood = mood;

    // Update button active states
    document.querySelectorAll('#mood-toggle-group .mood-btn').forEach(b => {
      if (b.getAttribute('data-mood') === mood) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    const badgeEl = document.getElementById('active-mood-badge');
    const headerIndicator = document.getElementById('header-mood-indicator');
    const descEl = document.getElementById('mood-target-desc');

    const moodConfig = {
      growth: {
        label: 'Growth',
        tagClass: 'mood-tag-growth',
        headerText: 'Mood: Growth <span class="material-symbols-outlined" style="font-size:12px;vertical-align:-1px">rocket_launch</span> (Focus: Alpha & Outperformance)',
        desc: 'Wealth Long Term: Prioritizes high alpha & category outperformance'
      },
      safety: {
        label: 'Safety',
        tagClass: 'mood-tag-safety',
        headerText: 'Mood: Safety <span class="material-symbols-outlined" style="font-size:12px;vertical-align:-1px">shield</span> (Focus: Capital Protection)',
        desc: 'Low Risk: Prioritizes downside resilience & low volatility'
      },
      income: {
        label: 'Income',
        tagClass: 'mood-tag-income',
        headerText: 'Mood: Income <span class="material-symbols-outlined" style="font-size:12px;vertical-align:-1px">savings</span> (Focus: Cost Efficiency)',
        desc: 'Cost Efficiency: Prioritizes low direct fees (TER) & capital stability'
      }
    };

    const cfg = moodConfig[mood] || moodConfig.growth;

    if (badgeEl) {
      badgeEl.textContent = cfg.label;
      badgeEl.className = `text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${cfg.tagClass}`;
    }

    if (headerIndicator) {
      headerIndicator.innerHTML = cfg.headerText;
      headerIndicator.className = `hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${cfg.tagClass}`;
    }

    if (descEl) {
      descEl.textContent = cfg.desc;
    }

    // Dynamic Recalculation across all funds
    this.recalculateSmartScoresForMood(mood);

    // If fund drawer is currently open, refresh scorecard with new mood weights
    if (this.state.selectedFund) {
      this.renderScorecard(this.state.selectedFund);
      const drawerBadge = document.getElementById('drawer-smartscore-badge');
      if (drawerBadge && this.state.selectedFund.smart_score) {
        drawerBadge.outerHTML = `<div id="drawer-smartscore-badge">${this.getSmartScorePill(this.state.selectedFund.smart_score.overall)}</div>`;
      }
    }

    // Refresh UI
    this.updateUI(false);
  }

  recalculateSmartScoresForMood(mood) {
    const weights = {
      growth: { perf: 0.45, track: 0.25, risk: 0.20, cost: 0.10 },
      safety: { risk: 0.45, track: 0.25, perf: 0.20, cost: 0.10 },
      income: { cost: 0.35, risk: 0.30, track: 0.20, perf: 0.15 }
    };

    const w = weights[mood] || weights.growth;

    // 1. Calculate weighted score for every fund
    this.allFunds.forEach(fund => {
      const p = fund.smart_score?.pillars || {};
      const sp = p.performance?.score !== undefined ? p.performance.score : 6.0;
      const sr = p.risk?.score !== undefined ? p.risk.score : 6.0;
      const sc = p.cost?.score !== undefined ? p.cost.score : 6.0;
      const st = p.track_record?.score !== undefined ? p.track_record.score : 6.0;

      let raw = (w.perf * sp) + (w.risk * sr) + (w.cost * sc) + (w.track * st);

      // Fiduciary seasoning penalties remain strictly enforced across all moods
      const age = fund.history_years !== undefined ? fund.history_years : 3.0;
      if (age < 1.0) {
        raw = Math.min(5.8, raw);
      } else if (age < 3.0) {
        raw = Math.min(7.0, raw);
      }

      if (!fund.smart_score) fund.smart_score = {};
      fund.smart_score.overall = parseFloat(raw.toFixed(1));
    });

    // 2. Re-rank each fund within its category
    const catGroups = {};
    this.allFunds.forEach(fund => {
      if (!catGroups[fund.category]) catGroups[fund.category] = [];
      catGroups[fund.category].push(fund);
    });

    Object.entries(catGroups).forEach(([catName, cfunds]) => {
      const total = cfunds.length;
      cfunds.sort((a, b) => b.smart_score.overall - a.smart_score.overall);
      cfunds.forEach((f, idx) => {
        const rk = idx + 1;
        f.smart_score.rank_in_category = rk;
        f.smart_score.total_in_category = total;
        let suffix = 'th';
        if (!(rk % 100 >= 11 && rk % 100 <= 13)) {
          if (rk % 10 === 1) suffix = 'st';
          else if (rk % 10 === 2) suffix = 'nd';
          else if (rk % 10 === 3) suffix = 'rd';
        }
        f.smart_score.rank_text = `${rk}${suffix} of ${total} ${catName} funds`;
      });
    });
  }

  setupEventListeners() {
    // ------------------------------------------------------------------
    // Prashant's Strategy Insight Cycling Card (Interactive Micro-Delight)
    // ------------------------------------------------------------------
    const insightCard = document.getElementById('prashants-insight-card');
    const insightText = document.getElementById('prashants-insight-text');
    if (insightCard && insightText) {
      const insights = [
        `"Chasing rank-1 funds every year triggers taxes and exit loads. Focus on 3-year rolling consistency and stable tenure."`,
        `"An outperformance ratio >= 1.35x proves the fund manager generates real alpha over their category benchmark, not just sector luck."`,
        `"Young schemes (<3Y) lack full market cycle validation. BickerBape caps unproven schemes at 7.0/10 to protect fiduciary discipline."`,
        `"Single-sector thematic funds carry 100% idiosyncratic risk. Keep them capped at max 10-15% as satellite plays in your portfolio."`
      ];
      let insightIdx = 0;
      insightCard.addEventListener('click', () => {
        insightIdx = (insightIdx + 1) % insights.length;
        insightText.style.opacity = '0';
        setTimeout(() => {
          insightText.innerText = insights[insightIdx];
          insightText.style.opacity = '1';
        }, 150);
      });
      insightCard.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          insightCard.click();
        }
      });
    }

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
    // Investor Mood 3-Way Controller
    // ------------------------------------------------------------------
    document.querySelectorAll('#mood-toggle-group .mood-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mood = btn.getAttribute('data-mood');
        this.setMood(mood);
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
    // H. Table Column Header Delegation (Sorting & Custom KPI Editing)
    // ------------------------------------------------------------------
    const tableHeader = document.getElementById('screener-table-header');
    if (tableHeader) {
      tableHeader.addEventListener('click', (e) => {
        // 1. Column Edit Button clicked
        const editBtn = e.target.closest('.col-edit-btn');
        if (editBtn) {
          e.preventDefault();
          e.stopPropagation();
          const slot = parseInt(editBtn.getAttribute('data-slot'));
          this.openKpiPicker(slot);
          return;
        }

        // 2. Info Button clicked (let info listener handle tooltip)
        if (e.target.closest('.info-wrapper')) {
          return;
        }

        // 3. Header Sort clicked
        const th = e.target.closest('th[data-sort]');
        if (th) {
          const field = th.getAttribute('data-sort');
          if (this.state.sortBy === field) {
            this.state.sortDir = this.state.sortDir === 'asc' ? 'desc' : 'asc';
          } else {
            this.state.sortBy = field;
            this.state.sortDir = 'desc';
          }
          this.updateSortIcons();
          this.updateUI(false);
        }
      });
    }

    // Column Customizer Toolbar Buttons
    const openCustomizerBtn = document.getElementById('open-column-customizer-btn');
    if (openCustomizerBtn) {
      openCustomizerBtn.addEventListener('click', () => {
        this.openKpiPicker(null);
      });
    }

    const resetColsBtn = document.getElementById('reset-columns-btn');
    if (resetColsBtn) {
      resetColsBtn.addEventListener('click', () => {
        this.resetTableColumnsToDefault();
      });
    }

    const kpiModalResetBtn = document.getElementById('kpi-modal-reset-btn');
    if (kpiModalResetBtn) {
      kpiModalResetBtn.addEventListener('click', () => {
        this.resetTableColumnsToDefault();
      });
    }

    const kpiCloseBtn = document.getElementById('kpi-picker-close-btn');
    if (kpiCloseBtn) {
      kpiCloseBtn.addEventListener('click', () => this.closeKpiPicker());
    }

    const kpiCancelBtn = document.getElementById('kpi-modal-cancel-btn');
    if (kpiCancelBtn) {
      kpiCancelBtn.addEventListener('click', () => this.closeKpiPicker());
    }

    const kpiBuildBtn = document.getElementById('kpi-modal-build-btn');
    if (kpiBuildBtn) {
      kpiBuildBtn.addEventListener('click', () => this.buildTableFromSelection());
    }

    const kpiModal = document.getElementById('kpi-picker-modal');
    if (kpiModal) {
      kpiModal.addEventListener('click', (e) => {
        if (e.target === kpiModal) this.closeKpiPicker();
      });
    }

    const kpiSearchInput = document.getElementById('kpi-search-input');
    if (kpiSearchInput) {
      kpiSearchInput.addEventListener('input', (e) => {
        this.renderKpiOptionsList(e.target.value);
      });
    }

    // Quick selection filter buttons inside modal
    const selectAllBtn = document.getElementById('kpi-select-all-btn');
    if (selectAllBtn) {
      selectAllBtn.addEventListener('click', () => {
        this.tempSelectedColumns = Object.keys(this.KPI_CATALOG);
        this.updateKpiModalSelectedCounter();
        this.renderKpiOptionsList(kpiSearchInput ? kpiSearchInput.value : '');
      });
    }

    const selectReturnsBtn = document.getElementById('kpi-select-returns-btn');
    if (selectReturnsBtn) {
      selectReturnsBtn.addEventListener('click', () => {
        this.tempSelectedColumns = Object.values(this.KPI_CATALOG).filter(k => k.category === 'Returns').map(k => k.id);
        this.updateKpiModalSelectedCounter();
        this.renderKpiOptionsList(kpiSearchInput ? kpiSearchInput.value : '');
      });
    }

    const selectRiskBtn = document.getElementById('kpi-select-risk-btn');
    if (selectRiskBtn) {
      selectRiskBtn.addEventListener('click', () => {
        this.tempSelectedColumns = Object.values(this.KPI_CATALOG).filter(k => k.category === 'Risk').map(k => k.id);
        this.updateKpiModalSelectedCounter();
        this.renderKpiOptionsList(kpiSearchInput ? kpiSearchInput.value : '');
      });
    }

    const selectCostBtn = document.getElementById('kpi-select-cost-btn');
    if (selectCostBtn) {
      selectCostBtn.addEventListener('click', () => {
        this.tempSelectedColumns = Object.values(this.KPI_CATALOG).filter(k => k.category === 'Cost').map(k => k.id);
        this.updateKpiModalSelectedCounter();
        this.renderKpiOptionsList(kpiSearchInput ? kpiSearchInput.value : '');
      });
    }

    const selectDefaultsBtn = document.getElementById('kpi-select-defaults-btn');
    if (selectDefaultsBtn) {
      selectDefaultsBtn.addEventListener('click', () => {
        this.tempSelectedColumns = ['smart_score', 'cagr_3y', 'cagr_5y', 'cagr_10y', 'rolling_3y_avg', 'sharpe_ratio', 'volatility'];
        this.updateKpiModalSelectedCounter();
        this.renderKpiOptionsList(kpiSearchInput ? kpiSearchInput.value : '');
      });
    }

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
    // J. SimSim™ Mode Switch & Bucket Actions
    // ------------------------------------------------------------------
    const sidebarLogoSwitch = document.getElementById('sidebar-logo-switch');
    if (sidebarLogoSwitch) {
      sidebarLogoSwitch.addEventListener('click', () => {
        if (this.simsim) this.simsim.toggleMode();
      });
    }

    const headerLogoSwitch = document.getElementById('header-logo-switch');
    if (headerLogoSwitch) {
      headerLogoSwitch.addEventListener('click', () => {
        if (this.simsim) this.simsim.toggleMode();
      });
    }

    const simsimTrayLaunch = document.getElementById('simsim-tray-launch-btn');
    if (simsimTrayLaunch) {
      simsimTrayLaunch.addEventListener('click', () => {
        if (this.simsim) this.simsim.enableSimSimMode();
      });
    }

    // Global delegation for .simsim-add-btn
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.simsim-add-btn');
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        const code = Number(btn.getAttribute('data-code'));
        if (this.simsim) {
          if (this.simsim.isInBucket(code)) {
            this.simsim.removeFromBucket(code);
          } else {
            this.simsim.addToBucket(code);
          }
        }
      }
    });

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

    // Comparison Tray Toggle & Minimize
    const compareTrayToggleBtn = document.getElementById('compare-tray-toggle-btn');
    if (compareTrayToggleBtn) {
      compareTrayToggleBtn.addEventListener('click', () => {
        const tray = document.getElementById('compare-tray');
        if (tray) {
          if (tray.classList.contains('minimized')) {
            tray.classList.remove('minimized');
            this.state.compareTrayMinimized = false;
          } else if (tray.classList.contains('visible')) {
            tray.classList.add('minimized');
            this.state.compareTrayMinimized = true;
          } else {
            tray.classList.add('visible');
            tray.classList.remove('minimized');
            this.state.compareTrayMinimized = false;
          }
        }
      });
    }

    const minimizeCompareBtn = document.getElementById('minimize-compare-btn');
    if (minimizeCompareBtn) {
      minimizeCompareBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const tray = document.getElementById('compare-tray');
        if (tray) {
          tray.classList.toggle('minimized');
          this.state.compareTrayMinimized = tray.classList.contains('minimized');
        }
      });
    }

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

    // Dynamic boundary alignment for interactive info (i) buttons
    const handleInfoPosition = (e) => {
      const wrapper = e.target.closest('.info-wrapper');
      if (wrapper) {
        this.adjustInfoPopupPosition(wrapper);
      }
    };
    document.addEventListener('mouseover', handleInfoPosition);
    document.addEventListener('focusin', handleInfoPosition);

    // Global listener for interactive info (i) buttons (mobile tap toggle & outside click)
    document.addEventListener('click', (e) => {
      const infoBtn = e.target.closest('.info-btn');
      if (infoBtn) {
        e.preventDefault();
        e.stopPropagation();
        const wrapper = infoBtn.closest('.info-wrapper');
        const isActive = wrapper.classList.contains('active');
        document.querySelectorAll('.info-wrapper.active').forEach(w => w.classList.remove('active'));
        if (!isActive) {
          this.adjustInfoPopupPosition(wrapper);
          wrapper.classList.add('active');
        }
        return;
      }
      document.querySelectorAll('.info-wrapper.active').forEach(w => w.classList.remove('active'));
    });
  }

  adjustInfoPopupPosition(wrapper) {
    const popup = wrapper.querySelector('.info-popup');
    if (!popup) return;
    const rect = wrapper.getBoundingClientRect();

    // 1. Vertical positioning: If inside drawer or within 190px of top of viewport, pop downwards
    const insideDrawer = !!wrapper.closest('#fund-drawer');
    if (rect.top < 190 || insideDrawer) {
      popup.classList.add('pop-down');
    } else {
      popup.classList.remove('pop-down');
    }

    // 2. Horizontal positioning: If within 170px of right viewport edge, align right
    if (window.innerWidth - rect.right < 170) {
      popup.classList.add('align-right');
      popup.classList.remove('align-left');
    } else if (rect.left < 140) {
      popup.classList.add('align-left');
      popup.classList.remove('align-right');
    } else {
      popup.classList.remove('align-right', 'align-left');
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
      if (cardsContainer) {
        cardsContainer.classList.remove('hidden');
        cardsContainer.style.setProperty('display', 'grid', 'important');
      }
      if (tableContainer) {
        tableContainer.classList.add('hidden');
        tableContainer.style.setProperty('display', 'none', 'important');
      }
    } else {
      if (cardsContainer) {
        cardsContainer.classList.add('hidden');
        cardsContainer.style.setProperty('display', 'none', 'important');
      }
      if (tableContainer) {
        tableContainer.classList.remove('hidden');
        tableContainer.style.setProperty('display', 'block', 'important');
      }
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
    if (this.simsim) {
      this.simsim.updateScreenerButtons();
    }
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

  /**
   * SmartScore (TM) Dynamic Gradient Pill:
   * Royal Blue for best (>= 8.0), Red for worst (< 5.0),
   * with smooth blue-purple-amber gradient interpolation and subtle percentage hue fill.
   */
  getSmartScorePill(score) {
    const s = Math.max(1.0, Math.min(9.9, parseFloat(score) || 7.0));
    const pct = Math.round((s / 10.0) * 100);

    let fromColor = '#0052CC';
    let toColor = '#2684FF';
    let textColor = '#FFFFFF';

    if (s >= 8.0) {
      fromColor = '#0052CC';
      toColor = '#1D7AFC';
    } else if (s >= 6.5) {
      fromColor = '#2563EB';
      toColor = '#4F46E5';
    } else if (s >= 5.0) {
      fromColor = '#7C3AED';
      toColor = '#D97706';
    } else {
      fromColor = '#D97706';
      toColor = '#DC2626';
    }

    return `
      <span class="smartscore-pill smartscore-pill-gradient" style="background: linear-gradient(135deg, ${fromColor} 0%, ${toColor} 100%); color: ${textColor};" title="SmartScore™: ${s.toFixed(1)} (${pct}% Quality Rating)">
        <span class="smartscore-pill-val">${s.toFixed(1)}</span>
      </span>
    `;
  }

  /**
   * Generates a ratio-ed circular score gauge with dynamic conic-gradient
   * where e.g. 9.9 covers 99% of the circumference.
   */
  getRatioedGaugeHtml(score, isLarge = false) {
    const s = Math.max(1.0, Math.min(10.0, parseFloat(score) || 7.0));
    const pct = Math.round((s / 10.0) * 100);

    let ringColor = '#36B37E';
    if (s < 5.0) ringColor = '#FF5630';
    else if (s < 7.0) ringColor = '#FFAB00';

    const sizeClass = isLarge ? 'gauge-large' : 'gauge-standard';

    return `
      <div class="ratio-gauge smartscore-gauge ${sizeClass}" style="--score-pct: ${pct}; --ring-color: ${ringColor};" title="SmartScore™: ${s.toFixed(1)}">
        <span class="gauge-value font-display-financial font-extrabold text-on-surface">${s.toFixed(1)}</span>
      </div>
    `;
  }

  getInfoBtnHtml(termKey) {
    const dict = {
      smart_score: {
        title: "SmartScore™ (1 to 10)",
        desc: "Unified institutional rating evaluating category outperformance ratios, downside resilience, low volatility, multi-cycle history, and direct fee efficiency."
      },
      ratio_3y: {
        title: "3Y Return Ratio vs Category",
        desc: "Shows how much better or worse this fund performed compared to other funds in the same category. For example, 1.45x means it delivered 45% more return than the category average."
      },
      ratio_5y: {
        title: "5Y Return Ratio vs Category",
        desc: "Measures 5-year outperformance against peers. A ratio above 1.15x indicates durable fund manager alpha across market cycles."
      },
      rolling_3y: {
        title: "3-Year Rolling Average",
        desc: "Average return earned if you invested on ANY random day in the past and held for 3 years. It completely removes market timing luck."
      },
      sharpe: {
        title: "Sharpe Ratio (Risk-Adjusted Return)",
        desc: "Measures excess return earned per unit of total volatility above safe government bonds (6.8%). Higher (>1.0) means high returns without reckless gambles."
      },
      sortino: {
        title: "Sortino Ratio (Downside Protection)",
        desc: "Similar to Sharpe, but only penalizes bad drops (downside risk), ignoring good upward jumps. Scores above 1.2 indicate superior capital protection."
      },
      volatility: {
        title: "Annualized Volatility (Fluctuation)",
        desc: "Measures how sharply the fund's price swings up and down. Lower volatility (under 14%) means a smoother, less stressful journey."
      },
      max_drawdown: {
        title: "Max Historical Drawdown",
        desc: "The largest peak-to-trough drop this fund experienced in market crashes. Smaller drops mean faster recovery."
      },
      sector_risk: {
        title: "Sector Concentration Risk",
        desc: "When a fund puts all its eggs in one industry basket (like Pharma). It can surge during a boom, but has zero cross-sector diversification if that sector cools down."
      },
      ter: {
        title: "Direct Expense Ratio (TER)",
        desc: "The annual fee the fund house deducts to manage your money. Direct plans save you lakhs over 15+ years compared to regular plans."
      },
      cagr_10y: {
        title: "10-Year CAGR (Compounded Return)",
        desc: "Decade-long wealth creation rate. Confirms whether a fund creates long-term generational wealth across both bull and bear market cycles."
      },
      cagr_1y: {
        title: "Trailing 1-Year Absolute Return",
        desc: "Performance over the immediate past 12 months. Useful for monitoring short-term momentum, though multi-year rolling returns matter more."
      },
      growth_3m: {
        title: "Past 3-Month Growth",
        desc: "Absolute percentage gain or loss over the preceding quarter. Indicates very recent portfolio trajectory."
      },
      beta: {
        title: "Beta (Market Sensitivity)",
        desc: "Measures sensitivity to benchmark swings. Beta 1.0 moves with the market; under 1.0 is defensive, over 1.0 is aggressive."
      },
      pe_ratio: {
        title: "Portfolio P/E Ratio",
        desc: "Price-to-Earnings valuation of underlying holdings. Lower P/E indicates value bargains; higher P/E reflects premium growth stocks."
      },
      turnover: {
        title: "Portfolio Turnover Ratio",
        desc: "How frequently the fund manager trades stocks. Low (<30%) means patient buy-and-hold; high (>100%) means active trading."
      },
      aum: {
        title: "Fund AUM (Assets Under Management)",
        desc: "Total size of the fund in ₹ Crores. Large AUM signals institutional trust, while smaller AUM can offer agility in mid/small caps."
      },
      manager: {
        title: "Fund Manager Tenure",
        desc: "Number of years the current manager has navigated this scheme. Longer tenure (>4 yrs) confirms stability and consistency of strategy."
      }
    };

    const item = dict[termKey];
    if (!item) return '';

    return `
      <span class="info-wrapper" onclick="event.stopPropagation()">
        <button type="button" class="info-btn" title="About ${item.title}">i</button>
        <span class="info-popup">
          <strong class="block font-bold text-white mb-0.5">${item.title}</strong>
          <span>${item.desc}</span>
        </span>
      </span>
    `;
  }

  mapMetricToInfoKey(name) {
    const n = (name || '').toLowerCase();
    if (n.includes('3y return') || n.includes('3y ratio')) return 'ratio_3y';
    if (n.includes('5y return') || n.includes('5y ratio')) return 'ratio_5y';
    if (n.includes('rolling')) return 'rolling_3y';
    if (n.includes('sharpe')) return 'sharpe';
    if (n.includes('sortino')) return 'sortino';
    if (n.includes('volatility')) return 'volatility';
    if (n.includes('drawdown')) return 'max_drawdown';
    if (n.includes('expense')) return 'ter';
    if (n.includes('concentration') || n.includes('sector')) return 'sector_risk';
    return null;
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
      const isInSimSim = this.simsim && this.simsim.isInBucket(fund.code);
      const ret3y = (fund.cagr_3y !== null && fund.cagr_3y !== undefined) ? `${fund.cagr_3y > 0 ? '+' : ''}${fund.cagr_3y}%` : 'N/A';
      const rolling3y = (fund.rolling_3y_avg !== null && fund.rolling_3y_avg !== undefined) ? `${fund.rolling_3y_avg}%` : 'N/A';
      
      const ratioBadge = (fund.ratio_3y !== null && fund.ratio_3y !== undefined) ? `
        <span class="badge-ratio ${fund.ratio_3y >= 1.0 ? 'outperforming' : 'underperforming'}" title="Fund 3Y return vs ${fund.category} average">
          ${fund.ratio_3y}x 3Y Ratio
        </span>
      ` : (fund.cagr_1y ? `
        <span class="badge-ratio outperforming" title="1Y Return (Recent Track)">
          +${fund.cagr_1y}% 1Y
        </span>
      ` : '');

      const seasoningBadge = fund.history_years < 1.0 
        ? `<span class="meta-tag meta-tag-warn" title="New Scheme (< 1Y): Lacks market cycle operating history">New Scheme (<1Y)</span>`
        : (fund.history_years < 3.0 
            ? `<span class="meta-tag meta-tag-track" title="Emerging (${fund.history_years}Y): Lacks 3-year full cycle testing">Emerging (${fund.history_years}Y)</span>` 
            : '');

      const concentrationBadge = fund.category === 'Sectoral / Thematic'
        ? `<span class="meta-tag meta-tag-warn" title="High single-sector concentration risk. Recommended only as a satellite play (max 10-15%).">Sector Risk</span>`
        : '';

      let catBadgeClass = 'cat-badge-indigo';
      if (fund.category.includes('Small')) catBadgeClass = 'cat-badge-amber';
      else if (fund.category.includes('Mid')) catBadgeClass = 'cat-badge-cyan';
      else if (fund.category.includes('Sectoral') || fund.category.includes('Thematic')) catBadgeClass = 'cat-badge-ruby';
      else if (fund.category.includes('ELSS')) catBadgeClass = 'cat-badge-emerald';

      const smart = fund.smart_score || { overall: ((fund.suggester_score || 70) / 10).toFixed(1), rank_text: '' };
      const scoreNum = parseFloat(smart.overall);

      return `
        <div class="bg-surface-container-lowest rounded-2xl card-shadow p-md md:p-lg flex flex-col hover:shadow-md transition-all cursor-pointer relative overflow-hidden group card-interactive animate-card-enter" data-code="${fund.code}">
          <div class="flex justify-between items-start mb-sm">
            <div class="min-w-0 pr-2">
              <div class="flex items-center gap-1.5 mb-1.5 flex-wrap">
                <span class="cat-badge ${catBadgeClass}">${fund.category}</span>
                ${concentrationBadge}
                ${seasoningBadge}
                ${ratioBadge}
              </div>
              <h4 class="font-headline-md text-sm md:text-base text-on-surface leading-tight hover:text-primary-container transition-colors">${fund.name.split(' - Direct')[0]}</h4>
              <p class="font-label-sm text-[11px] text-on-surface-variant mt-1">
                ${fund.fund_house} • <span class="text-primary font-bold">Rank vs ${fund.category} peers: ${smart.rank_text || 'Top Tier'}</span>
              </p>
            </div>
            <div class="flex-shrink-0">
              ${this.getRatioedGaugeHtml(scoreNum, false)}
            </div>
          </div>

          <div class="flex items-end justify-between mt-auto mb-md">
            <div>
              <div class="flex items-center gap-1 mb-xs">
                <p class="font-label-sm text-xs text-on-surface-variant">3Y Ret & Ratio</p>
                ${this.getInfoBtnHtml('ratio_3y')}
              </div>
              <div class="flex items-baseline gap-1.5">
                <span class="font-display-financial text-xl md:text-2xl text-[#36B37E]">${ret3y}</span>
                ${fund.ratio_3y ? `<span class="text-xs text-on-surface-variant font-medium">(${fund.ratio_3y}x Cat Avg)</span>` : (fund.history_years ? `<span class="text-xs text-on-surface-variant font-medium">(Age: ${fund.history_years}Y)</span>` : '')}
              </div>
              <div class="flex items-center gap-1 mt-0.5">
                <p class="text-[11px] text-on-surface-variant">3Y Rolling Avg: <strong class="text-on-surface font-bold">${rolling3y}</strong></p>
                ${this.getInfoBtnHtml('rolling_3y')}
              </div>
            </div>
            <div class="w-24 h-11 bg-surface-container-low rounded-lg flex items-center justify-center overflow-hidden p-1">
              ${this.generateSparklineSvg(fund.sparkline)}
            </div>
          </div>

          <div class="card-action-bar">
            <button class="card-action-btn analyze-card-btn touch-spring cursor-pointer" data-code="${fund.code}">
              <span class="material-symbols-outlined">visibility</span>
              <span>Details</span>
            </button>
            <button class="card-action-btn compare-toggle-btn ${isComparing ? 'is-comparing' : ''} touch-spring cursor-pointer" data-code="${fund.code}" title="${isComparing ? 'Remove from comparison' : 'Add to comparison'}">
              <span class="material-symbols-outlined">${isComparing ? 'check' : 'add'}</span>
              <span>${isComparing ? 'Added' : 'Compare'}</span>
            </button>
            <button class="card-action-btn simsim-add-btn ${isInSimSim ? 'in-bucket' : ''} touch-spring cursor-pointer" data-code="${fund.code}" title="${isInSimSim ? 'Remove from SimSim' : 'Add to SimSim Portfolio Bucket'}">
              <span class="material-symbols-outlined">${isInSimSim ? 'check' : 'hourglass_top'}</span>
              <span>${isInSimSim ? 'In SimSim' : '+ SimSim'}</span>
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

        if (e.target.closest('.simsim-add-btn')) {
          e.stopPropagation();
          if (this.simsim) {
            if (this.simsim.isInBucket(code)) {
              this.simsim.removeFromBucket(code);
            } else {
              this.simsim.addToBucket(code);
            }
          }
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
          <td colspan="${this.state.tableColumns.length + 2}" class="py-12 text-center text-on-surface-variant font-body-md">
            No mutual funds matched your active filters.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = funds.map(fund => {
      const isComparing = this.state.comparisonList.some(f => f.code === fund.code);
      const isInSimSim = this.simsim && this.simsim.isInBucket(fund.code);

      const dynamicColsHtml = this.state.tableColumns.map(colKey => {
        const kpi = this.KPI_CATALOG[colKey] || this.KPI_CATALOG.cagr_3y;
        return `
          <td class="py-3 px-2.5 ${kpi.align} font-label-bold numeric">
            ${kpi.format(fund)}
          </td>
        `;
      }).join('');

      return `
        <tr class="hover:bg-surface-container-low transition-colors cursor-pointer" data-code="${fund.code}">
          <td class="py-3 px-4">
            <div class="flex items-center gap-2">
              <span class="w-7 h-7 rounded-lg bg-primary-fixed text-primary flex items-center justify-center font-label-bold text-xs flex-shrink-0 amc-avatar">
                ${fund.fund_house.slice(0, 2).toUpperCase()}
              </span>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="font-label-bold text-on-surface hover:text-primary-container fund-title">${fund.name.split(' - Direct')[0]}</span>
                  ${fund.category === 'Sectoral / Thematic' ? '<span class="bg-red-50 text-red-700 border border-red-200 text-[9px] px-1 py-0.2 rounded font-semibold flex-shrink-0">Sector Risk</span>' : ''}
                  ${fund.history_years < 1.0 ? '<span class="bg-amber-100 text-amber-900 border border-amber-300 text-[9px] px-1 py-0.2 rounded font-bold flex-shrink-0">New (<1Y)</span>' : (fund.history_years < 3.0 ? `<span class="bg-slate-100 text-slate-700 border border-slate-200 text-[9px] px-1 py-0.2 rounded font-medium flex-shrink-0">${fund.history_years}Y</span>` : '')}
                </div>
                <p class="font-label-sm text-on-surface-variant text-[11px] fund-subtitle">${fund.category} • AUM: ₹${fund.aum_cr ? fund.aum_cr.toLocaleString() : 'N/A'} Cr</p>
              </div>
            </div>
          </td>

          ${dynamicColsHtml}

          <td class="py-3 px-3 text-center">
            <div class="flex items-center justify-center gap-1.5">
              <button class="p-1 rounded-lg hover:bg-surface-container text-primary analyze-row-btn touch-spring cursor-pointer" data-code="${fund.code}" title="SmartScore deep dive">
                <span class="material-symbols-outlined text-base">visibility</span>
              </button>
              <button class="px-2 py-1 rounded-lg text-xs font-label-bold flex items-center gap-0.5 transition-colors touch-spring cursor-pointer compare-toggle-btn ${isComparing ? 'bg-primary-container text-on-primary' : 'hover:bg-surface-container text-on-surface-variant'}" data-code="${fund.code}" title="Compare">
                <span class="material-symbols-outlined text-xs">${isComparing ? 'check' : 'add'}</span>
                <span>${isComparing ? 'Added' : 'Compare'}</span>
              </button>
              <button class="simsim-add-btn ${isInSimSim ? 'in-bucket' : ''} touch-spring cursor-pointer" data-code="${fund.code}" title="${isInSimSim ? 'Remove from SimSim' : 'Add to SimSim Portfolio Bucket'}">
                <span class="material-symbols-outlined text-xs">${isInSimSim ? 'check' : 'hourglass_top'}</span>
                <span>${isInSimSim ? 'SimSim' : '+ SimSim'}</span>
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

        if (e.target.closest('.simsim-add-btn')) {
          e.stopPropagation();
          if (this.simsim) {
            if (this.simsim.isInBucket(code)) {
              this.simsim.removeFromBucket(code);
            } else {
              this.simsim.addToBucket(code);
            }
          }
          return;
        }

        if (fund) this.openDrawer(fund);
      });
    });
  }

  // ------------------------------------------------------------------
  // Compare Funds Logic with Toggle & Orientation Fix
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
        btn.classList.add('is-comparing');
        btn.innerHTML = `<span class="material-symbols-outlined text-xs">check</span><span>Added</span>`;
      } else {
        btn.classList.remove('is-comparing');
        btn.innerHTML = `<span class="material-symbols-outlined text-xs">add</span><span>Compare</span>`;
      }
    });
  }

  updateComparisonTray() {
    const tray = document.getElementById('compare-tray');
    const countEl = document.getElementById('compare-count');
    const chipsContainer = document.getElementById('compare-chips');
    const navToggleBtn = document.getElementById('compare-tray-toggle-btn');
    const trayToggleCount = document.getElementById('tray-toggle-count');

    if (!tray) return;

    const len = this.state.comparisonList.length;

    // 1. Update Top Navbar Toggle Button
    if (navToggleBtn && trayToggleCount) {
      trayToggleCount.textContent = len;
      if (len > 0) {
        navToggleBtn.classList.remove('hidden');
        navToggleBtn.classList.add('flex');
      } else {
        navToggleBtn.classList.add('hidden');
        navToggleBtn.classList.remove('flex');
      }
    }

    // 2. Control Floating Tray Visibility
    if (len > 0) {
      tray.classList.add('visible');
      if (this.state.compareTrayMinimized) {
        tray.classList.add('minimized');
      } else {
        tray.classList.remove('minimized');
      }

      if (countEl) countEl.textContent = `${len}/3 Selected`;
      
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
      // Completely hide if 0 funds selected so it never distracts the user!
      tray.classList.remove('visible', 'minimized');
      this.state.compareTrayMinimized = false;
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
              ${funds.map(f => `<td class="py-2.5 px-3">${this.getSmartScorePill(f.smart_score ? f.smart_score.overall : (f.suggester_score/10))}</td>`).join('')}
            </tr>
            <tr>
              <td class="py-2.5 px-3 font-label-bold text-on-surface-variant">Performance Score</td>
              ${funds.map(f => `<td class="py-2.5 px-3 font-bold text-[#36B37E]">${f.smart_score ? f.smart_score.pillars.performance.score : '-'}</td>`).join('')}
            </tr>
            <tr>
              <td class="py-2.5 px-3 font-label-bold text-on-surface-variant">Risk Score (Safety)</td>
              ${funds.map(f => `<td class="py-2.5 px-3 font-bold text-on-surface">${f.smart_score ? f.smart_score.pillars.risk.score : '-'}</td>`).join('')}
            </tr>
            <tr>
              <td class="py-2.5 px-3 font-label-bold text-on-surface-variant">Cost Score (Low Fee)</td>
              ${funds.map(f => `<td class="py-2.5 px-3 font-bold text-primary">${f.smart_score ? f.smart_score.pillars.cost.score : '-'}</td>`).join('')}
            </tr>
            <tr>
              <td class="py-2.5 px-3 font-label-bold text-on-surface-variant">Category</td>
              ${funds.map(f => `<td class="py-2.5 px-3 font-semibold">${f.category}</td>`).join('')}
            </tr>
            <tr>
              <td class="py-2.5 px-3 font-label-bold text-on-surface-variant">3Y Return & Ratio</td>
              ${funds.map(f => `<td class="py-2.5 px-3 font-display-financial text-base text-[#36B37E]">${f.cagr_3y ? '+' + f.cagr_3y + '%' : '-'} <span class="text-xs text-primary font-bold">(${f.ratio_3y || 1.0}x cat)</span></td>`).join('')}
            </tr>
            <tr>
              <td class="py-2.5 px-3 font-label-bold text-on-surface-variant">5Y Return & Ratio</td>
              ${funds.map(f => `<td class="py-2.5 px-3 font-semibold">${f.cagr_5y ? '+' + f.cagr_5y + '%' : '-'} <span class="text-xs text-on-surface-variant font-medium">(${f.ratio_5y ? f.ratio_5y + 'x' : '-'})</span></td>`).join('')}
            </tr>
            <tr>
              <td class="py-2.5 px-3 font-label-bold text-on-surface-variant">3Y Avg Rolling Return</td>
              ${funds.map(f => `<td class="py-2.5 px-3 font-label-bold text-primary">${f.rolling_3y_avg ? f.rolling_3y_avg + '%' : '-'}</td>`).join('')}
            </tr>
            <tr>
              <td class="py-2.5 px-3 font-label-bold text-on-surface-variant">Past 3-Month Growth</td>
              ${funds.map(f => `<td class="py-2.5 px-3 font-bold text-[#36B37E]">+${f.growth_3m || 4.2}%</td>`).join('')}
            </tr>
            <tr>
              <td class="py-2.5 px-3 font-label-bold text-on-surface-variant">Sharpe Ratio (Rf=6.8%)</td>
              ${funds.map(f => `<td class="py-2.5 px-3 font-label-bold text-on-surface">${f.sharpe_ratio}</td>`).join('')}
            </tr>
            <tr>
              <td class="py-2.5 px-3 font-label-bold text-on-surface-variant">Sortino Ratio</td>
              ${funds.map(f => `<td class="py-2.5 px-3 font-bold text-on-surface">${f.sortino_ratio || 1.4}</td>`).join('')}
            </tr>
            <tr>
              <td class="py-2.5 px-3 font-label-bold text-on-surface-variant">Max Drawdown</td>
              ${funds.map(f => `<td class="py-2.5 px-3 font-semibold text-error">${f.max_drawdown ? f.max_drawdown + '%' : '-'}</td>`).join('')}
            </tr>
            <tr>
              <td class="py-2.5 px-3 font-label-bold text-on-surface-variant">Beta (vs Benchmark)</td>
              ${funds.map(f => `<td class="py-2.5 px-3">${f.beta || 0.95}</td>`).join('')}
            </tr>
            <tr>
              <td class="py-2.5 px-3 font-label-bold text-on-surface-variant">Expense Ratio</td>
              ${funds.map(f => `<td class="py-2.5 px-3">${f.expense_ratio}%</td>`).join('')}
            </tr>
            <tr>
              <td class="py-2.5 px-3 font-label-bold text-on-surface-variant">Portfolio Turnover</td>
              ${funds.map(f => `<td class="py-2.5 px-3">${f.turnover_ratio || 25}%</td>`).join('')}
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
  // Deep-Dive Drawer with SmartScore(TM) Scorecard & SuperScore
  // ------------------------------------------------------------------
  renderScorecard(fund) {
    const container = document.getElementById('drawer-scorecard-pillars');
    const overallEl = document.getElementById('drawer-scorecard-overall');
    if (!container) return;

    const smart = fund.smart_score || {};
    const overall = smart.overall || ((fund.suggester_score || 70) / 10).toFixed(1);
    const catName = fund.category || 'Category';
    const rankText = smart.rank_text || `Rank vs ${catName} peers`;

    const mood = this.state.mood || 'growth';
    const moodWeights = {
      growth: { perf: '45%', track: '25%', risk: '20%', cost: '10%' },
      safety: { risk: '45%', track: '25%', perf: '20%', cost: '10%' },
      income: { cost: '35%', risk: '30%', track: '20%', perf: '15%' }
    };
    const mw = moodWeights[mood] || moodWeights.growth;
    const moodLabel = mood.charAt(0).toUpperCase() + mood.slice(1);

    if (overallEl) {
      overallEl.innerHTML = `
        <span class="text-on-surface font-bold text-xs">SmartScore™ (${moodLabel} Mood)</span>
        <span class="text-primary font-extrabold text-sm ml-1">${overall}</span>
        <span class="text-[10px] text-on-surface-variant font-medium block">Rank vs <strong class="text-on-surface">${catName}</strong> peers: <strong class="text-on-surface">${rankText}</strong></span>
      `;
    }

    const p = smart.pillars || {};
    const perf = p.performance || { score: 7.5, tag: 'High', summary: 'Wealth compounding track record', metrics: [] };
    const risk = p.risk || { score: 7.5, tag: 'Low', summary: 'Contained volatility and downside resilience', metrics: [] };
    const cost = p.cost || { score: 7.0, tag: 'Avg', summary: 'Direct low expense ratio', metrics: [] };
    const track = p.track_record || { score: 7.5, tag: 'High', summary: 'Audited operating history and manager stability', metrics: [] };

    const getTagClass = (tag, isRisk = false) => {
      if (isRisk) {
        return tag === 'High' ? 'tag-red' : (tag === 'Avg' ? 'tag-amber' : 'tag-green');
      }
      return tag === 'High' ? 'tag-green' : (tag === 'Avg' ? 'tag-amber' : 'tag-red');
    };

    // On first open, keep ALL scorecard expands closed!
    const pillarsConfig = [
      { key: 'performance', name: 'Performance & Returns', icon: 'trending_up', data: perf, isRisk: false, defaultOpen: false },
      { key: 'risk', name: 'Risk & Capital Protection', icon: 'shield', data: risk, isRisk: true, defaultOpen: false },
      { key: 'cost', name: 'Cost & Direct Plan Fees', icon: 'payments', data: cost, isRisk: false, defaultOpen: false },
      { key: 'track_record', name: 'Track Record & Stability', icon: 'history_edu', data: track, isRisk: false, defaultOpen: false }
    ];

    container.innerHTML = pillarsConfig.map(cfg => {
      const d = cfg.data;
      const tagClass = getTagClass(d.tag, cfg.isRisk);
      const hasIcon = cfg.icon;

      return `
        <div class="scorecard-item ${cfg.defaultOpen ? 'open' : ''}" data-pillar="${cfg.key}">
          <button class="scorecard-trigger" type="button">
            <!-- Circular Score Gauge with mathematically ratio-ed circumference -->
            ${this.getRatioedGaugeHtml(d.score, cfg.isRisk)}

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
              Objective Absolute Metric Evaluation:
            </p>

            <div class="scorecard-details-card">
              ${(d.metrics || []).map(m => {
                const infoKey = this.mapMetricToInfoKey(m.name);
                const infoBtn = infoKey ? this.getInfoBtnHtml(infoKey) : '';
                return `
                <div class="scorecard-submetric-row">
                  <div>
                    <div class="flex items-center">
                      <p class="font-label-bold text-xs text-on-surface leading-tight">${m.name}</p>
                      ${infoBtn}
                    </div>
                    <p class="text-[11px] text-on-surface-variant mt-0.5">${m.label || m.value}</p>
                  </div>
                  ${m.score !== undefined ? `
                    <div class="text-right flex-shrink-0 ml-2">
                      <span class="font-label-bold text-xs text-on-surface">Score : </span>
                      <strong class="font-display-financial text-xs ${m.score >= 6.5 ? 'text-[#36B37E]' : (m.score >= 4.0 ? 'text-[#FFAB00]' : 'text-[#FF5630]')}">${m.score}</strong>
                    </div>
                  ` : `
                    <div class="flex-shrink-0 ml-2">
                      <span class="smartscore-tag tag-green text-[10px]">Pass</span>
                    </div>
                  `}
                </div>
              `;}).join('')}
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

    let catSub = `${fund.category} • ${fund.fund_house}`;
    if (fund.history_years < 1.0) {
      catSub += ` • <span class="text-amber-800 font-bold bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded text-[11px] inline-flex items-center gap-0.5"><span class="material-symbols-outlined" style="font-size:12px">warning</span> New Scheme (< 1Y)</span>`;
    } else if (fund.category === 'Sectoral / Thematic') {
      catSub += ` • <span class="text-red-700 font-semibold bg-red-50 border border-red-200 px-1.5 py-0.5 rounded text-[11px] inline-flex items-center gap-0.5"><span class="material-symbols-outlined" style="font-size:12px">warning</span> High Sector Concentration</span>`;
    }
    document.getElementById('drawer-fund-cat').innerHTML = catSub;
    
    // Header Badge: SmartScore with Dynamic Gradient Hue
    const smartBadgeEl = document.getElementById('drawer-smartscore-badge');
    if (smartBadgeEl) {
      smartBadgeEl.outerHTML = `<div id="drawer-smartscore-badge">${this.getSmartScorePill(smart.overall)}</div>`;
    }

    // Top Metric Cards (6 Cards)
    document.getElementById('drawer-nav-price').textContent = fund.latest_nav ? `₹${fund.latest_nav}` : 'N/A';
    
    const growth3mEl = document.getElementById('drawer-3m-growth');
    if (growth3mEl) {
      growth3mEl.textContent = (fund.growth_3m !== null && fund.growth_3m !== undefined) ? `${fund.growth_3m > 0 ? '+' : ''}${fund.growth_3m}% past 3M` : 'N/A';
    }

    const ret3El = document.getElementById('drawer-3y-return');
    if (ret3El) ret3El.textContent = (fund.cagr_3y !== null && fund.cagr_3y !== undefined) ? `${fund.cagr_3y > 0 ? '+' : ''}${fund.cagr_3y}%` : 'N/A';

    const ratio3El = document.getElementById('drawer-3y-ratio');
    if (ratio3El) ratio3El.textContent = fund.ratio_3y ? `${fund.ratio_3y}x vs Cat Avg` : (fund.history_years ? `Fund Age: ${fund.history_years} yrs` : 'N/A (< 3Y)');

    const ratio5El = document.getElementById('drawer-5y-ratio');
    if (ratio5El) ratio5El.textContent = fund.ratio_5y ? `${fund.ratio_5y}x (5Y)` : (fund.cagr_5y ? `${fund.cagr_5y}% 5Y` : '5Y: N/A');

    const ratio10El = document.getElementById('drawer-10y-ratio');
    if (ratio10El) ratio10El.textContent = fund.ratio_10y ? `${fund.ratio_10y}x (10Y)` : (fund.cagr_10y ? `${fund.cagr_10y}% 10Y` : '10Y: N/A');

    const rolling3El = document.getElementById('drawer-3y-rolling');
    if (rolling3El) rolling3El.textContent = (fund.rolling_3y_avg !== null && fund.rolling_3y_avg !== undefined) ? `${fund.rolling_3y_avg}%` : 'N/A (< 3Y)';

    const sharpeEl = document.getElementById('drawer-sharpe');
    if (sharpeEl) sharpeEl.textContent = (fund.sharpe_ratio !== null && fund.sharpe_ratio !== undefined) ? `${fund.sharpe_ratio}` : 'N/A';

    const volEl = document.getElementById('drawer-volatility');
    if (volEl) volEl.textContent = (fund.volatility !== null && fund.volatility !== undefined) ? `${fund.volatility}%` : 'N/A';

    const sortinoEl = document.getElementById('drawer-sortino');
    if (sortinoEl) sortinoEl.textContent = (fund.sortino_ratio !== null && fund.sortino_ratio !== undefined) ? `${fund.sortino_ratio}` : 'N/A';

    const betaEl = document.getElementById('drawer-beta');
    if (betaEl) betaEl.textContent = (fund.beta !== null && fund.beta !== undefined) ? `${fund.beta}` : '1.0';

    const mddEl = document.getElementById('drawer-mdd-stat');
    if (mddEl) mddEl.textContent = (fund.max_drawdown !== null && fund.max_drawdown !== undefined) ? `Max DD: -${fund.max_drawdown}%` : 'Max DD: N/A';

    // Qualitative Info
    document.getElementById('drawer-aum').textContent = fund.aum_cr ? `₹${fund.aum_cr.toLocaleString()} Cr` : 'N/A';
    document.getElementById('drawer-expense-ratio').textContent = fund.expense_ratio ? `${fund.expense_ratio}%` : 'N/A';
    document.getElementById('drawer-pe').textContent = fund.pe_ratio ? `${fund.pe_ratio}` : 'N/A';
    document.getElementById('drawer-turnover').textContent = `${fund.turnover_ratio || 28}%`;
    document.getElementById('drawer-manager').textContent = `${fund.manager || 'Senior Manager'} (${fund.manager_tenure_years || 0} yrs)`;

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
