/**
 * SimSim™ User Interface & Portfolio Backtesting Controller
 * Handles Day/Night Mode Switch, Contextual Portal Sidebar,
 * Full-Width Cinematic Workspace, Interactive Allocation Sliders,
 * Model Portfolios, and Chart.js Visualizations.
 */

import { SimSimEngine } from './simsim-engine.js';

export class SimSimUI {
  constructor(app) {
    this.app = app;
    this.isSimSimMode = false;
    this.bucket = []; // Array of scheme_code integers
    this.weights = {}; // { [code]: 0.333, ... }
    this.investmentMode = 'lumpsum'; // 'lumpsum' or 'sip'
    this.capital = 100000;
    this.selectedHorizon = '3Y'; // '6M', '1Y', '2Y', '3Y', '5Y', 'ALL'
    this.chartInstance = null;
    this.isTrayDismissed = false;
    this.initBucketFromStorage();

    // Global delegated listener for exiting SimSim mode
    document.addEventListener('click', (e) => {
      const exitTrigger = e.target.closest('.simsim-exit-trigger') || e.target.closest('#simsim-exit-btn');
      if (exitTrigger) {
        this.disableSimSimMode();
      }

      // Floating tray clear & dismiss buttons
      const trayClear = e.target.closest('#simsim-tray-clear-btn');
      if (trayClear) {
        this.clearBucket();
      }

      const trayDismiss = e.target.closest('#simsim-tray-dismiss-btn');
      if (trayDismiss) {
        this.isTrayDismissed = true;
        this.hideTray();
      }
    });
  }

  initBucketFromStorage() {
    try {
      const stored = localStorage.getItem('bickerbape_simsim_bucket');
      if (stored) {
        this.bucket = JSON.parse(stored);
      }
    } catch (e) {
      this.bucket = [];
    }
  }

  saveBucketToStorage() {
    try {
      localStorage.setItem('bickerbape_simsim_bucket', JSON.stringify(this.bucket));
    } catch (e) {}
  }

  isInBucket(schemeCode) {
    return this.bucket.includes(Number(schemeCode));
  }

  addToBucket(schemeCode) {
    const code = Number(schemeCode);
    if (!this.bucket.includes(code)) {
      this.bucket.push(code);
      const n = this.bucket.length;
      if (n === 1) {
        this.weights[code] = 1.0;
      } else {
        const newShare = 1.0 / n;
        const scale = 1.0 - newShare;
        this.bucket.forEach(c => {
          if (c === code) {
            this.weights[c] = newShare;
          } else {
            this.weights[c] = (this.weights[c] || (1.0 / (n - 1))) * scale;
          }
        });
      }
      this.isTrayDismissed = false;
      this.saveBucketToStorage();
      this.updateTray();
      this.updateScreenerButtons();
      if (this.isSimSimMode) {
        this.renderSimSimSidebar();
        this.renderSimSimStage();
        this.runSimulation();
      }
    }
  }

  removeFromBucket(schemeCode) {
    const code = Number(schemeCode);
    this.bucket = this.bucket.filter(c => c !== code);
    delete this.weights[code];

    const remainingCodes = this.bucket;
    if (remainingCodes.length > 0) {
      let currentSum = 0;
      remainingCodes.forEach(c => {
        currentSum += (this.weights[c] || 0);
      });
      if (currentSum > 0) {
        remainingCodes.forEach(c => {
          this.weights[c] = (this.weights[c] || 0) / currentSum;
        });
      } else {
        const eq = 1.0 / remainingCodes.length;
        remainingCodes.forEach(c => {
          this.weights[c] = eq;
        });
      }
    }

    this.saveBucketToStorage();
    this.updateTray();
    this.updateScreenerButtons();
    if (this.isSimSimMode) {
      this.renderSimSimSidebar();
      this.renderSimSimStage();
      this.runSimulation();
    }
  }

  clearBucket() {
    this.bucket = [];
    this.weights = {};
    this.saveBucketToStorage();
    this.updateTray();
    this.updateScreenerButtons();
    if (this.isSimSimMode) {
      this.renderSimSimSidebar();
      this.renderSimSimStage();
    }
  }

  /**
   * Toggles between standard BickerBape Screener and SimSim Dark Mode Time Machine
   */
  toggleMode() {
    if (this.isSimSimMode) {
      this.disableSimSimMode();
    } else {
      this.enableSimSimMode();
    }
  }

  enableSimSimMode() {
    this.isSimSimMode = true;
    document.body.classList.add('simsim-mode');

    // 1. Hide screener view elements, show SimSim container
    const screenerViews = document.getElementById('screener-views-wrapper');
    const screenerHeader = document.getElementById('screener-header-controls');
    const simsimContainer = document.getElementById('simsim-container');

    if (screenerViews) screenerViews.classList.add('hidden');
    if (screenerHeader) screenerHeader.classList.add('hidden');
    if (simsimContainer) simsimContainer.classList.remove('hidden');

    // 2. Toggle Sidebar Portal Content
    const screenerSidebar = document.getElementById('screener-sidebar-content');
    const simsimSidebar = document.getElementById('simsim-sidebar-content');
    if (screenerSidebar) screenerSidebar.classList.add('hidden');
    if (simsimSidebar) simsimSidebar.classList.remove('hidden');

    // 3. Update Sticky Header Brand
    const headerTitle = document.getElementById('header-platform-title');
    const headerSub = document.getElementById('funds-count');
    const headerMood = document.getElementById('header-mood-indicator');
    const modeBadge = document.getElementById('platform-mode-badge');

    if (headerTitle) headerTitle.textContent = `SimSim™ Time Machine`;
    if (headerSub) headerSub.textContent = `Institutional Portfolio Simulation & Backtesting`;
    if (headerMood) headerMood.classList.add('hidden');
    if (modeBadge) {
      modeBadge.className = 'mode-switch-badge simsim-badge';
      modeBadge.innerHTML = `<span class="material-symbols-outlined text-[12px] simsim-pulse-icon">hourglass_top</span> SimSim™`;
    }

    // 4. Update Sidebar Footer
    const footerLeft = document.getElementById('sidebar-footer-left');
    const footerRight = document.getElementById('sidebar-footer-right');
    if (footerLeft) footerLeft.innerHTML = `<span class="w-2 h-2 rounded-full bg-[#00F090] shadow-[0_0_8px_#00F090]"></span> SimSim™ Active`;
    if (footerRight) {
      footerRight.textContent = `Backtesting Engine`;
      footerRight.className = 'font-label-bold text-[#00F090]';
    }

    // 5. Hide floating tray in SimSim mode
    this.hideTray();

    // 6. If bucket empty, populate with default Titan portfolio
    if (this.bucket.length === 0) {
      this.loadTemplate('titan');
    } else {
      this.renderSimSimSidebar();
      this.renderSimSimStage();
      this.runSimulation();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  disableSimSimMode() {
    this.isSimSimMode = false;
    document.body.classList.remove('simsim-mode');

    // 1. Show screener views, hide SimSim container
    const screenerViews = document.getElementById('screener-views-wrapper');
    const screenerHeader = document.getElementById('screener-header-controls');
    const simsimContainer = document.getElementById('simsim-container');

    if (screenerViews) screenerViews.classList.remove('hidden');
    if (screenerHeader) screenerHeader.classList.remove('hidden');
    if (simsimContainer) simsimContainer.classList.add('hidden');

    // 2. Toggle Sidebar Portal Content
    const screenerSidebar = document.getElementById('screener-sidebar-content');
    const simsimSidebar = document.getElementById('simsim-sidebar-content');
    if (screenerSidebar) screenerSidebar.classList.remove('hidden');
    if (simsimSidebar) simsimSidebar.classList.add('hidden');

    // 3. Restore Sticky Header Brand
    const headerTitle = document.getElementById('header-platform-title');
    const headerSub = document.getElementById('funds-count');
    const headerMood = document.getElementById('header-mood-indicator');
    const modeBadge = document.getElementById('platform-mode-badge');

    if (headerTitle) headerTitle.textContent = `Indian Equity Screener`;
    if (headerSub) headerSub.textContent = `Tracking ${this.app.allFunds ? this.app.allFunds.length : 620} verified direct equity funds`;
    if (headerMood) headerMood.classList.remove('hidden');
    if (modeBadge) {
      modeBadge.className = 'mode-switch-badge screener-badge';
      modeBadge.innerHTML = `<span class="material-symbols-outlined text-[12px]">analytics</span> Screener`;
    }

    // 4. Restore Sidebar Footer
    const footerLeft = document.getElementById('sidebar-footer-left');
    const footerRight = document.getElementById('sidebar-footer-right');
    if (footerLeft) footerLeft.innerHTML = `<span class="w-2 h-2 rounded-full bg-gain"></span> AMFI Live`;
    if (footerRight) {
      footerRight.textContent = `620 Schemes`;
      footerRight.className = 'font-label-bold text-primary';
    }

    this.updateTray();
    this.updateScreenerButtons();
  }

  updateTray() {
    const tray = document.getElementById('simsim-floating-tray');
    const countEl = document.getElementById('simsim-tray-count');
    if (!tray) return;

    if (this.isTrayDismissed || this.isSimSimMode || this.bucket.length === 0) {
      tray.classList.remove('visible');
    } else {
      if (countEl) countEl.textContent = `${this.bucket.length} Fund${this.bucket.length > 1 ? 's' : ''}`;
      tray.classList.add('visible');
    }
  }

  hideTray() {
    const tray = document.getElementById('simsim-floating-tray');
    if (tray) tray.classList.remove('visible');
  }

  updateScreenerButtons() {
    document.querySelectorAll('.simsim-add-btn').forEach(btn => {
      const code = Number(btn.getAttribute('data-code'));
      if (this.isInBucket(code)) {
        btn.classList.add('in-bucket');
        btn.innerHTML = `<span class="material-symbols-outlined text-sm">check</span><span>In SimSim</span>`;
        btn.title = 'Remove from SimSim Portfolio Bucket';
      } else {
        btn.classList.remove('in-bucket');
        btn.innerHTML = `<span class="material-symbols-outlined text-sm">add_circle</span><span>SimSim</span>`;
        btn.title = 'Add to SimSim Portfolio Bucket';
      }
    });
  }

  /**
   * Loads curated starter portfolios
   */
  loadTemplate(templateKey) {
    if (!this.app.allFunds || this.app.allFunds.length === 0) return;

    const findFund = (substr, cat) => {
      return this.app.allFunds.find(f => 
        (f.name.toLowerCase().includes(substr.toLowerCase()) || f.category.toLowerCase().includes(cat.toLowerCase())) &&
        (f.nav_history && f.nav_history.length > 40)
      );
    };

    if (templateKey === 'titan') {
      // The Core Titan: Flexi Cap + Mid Cap + Small Cap
      const f1 = findFund('Parag Parikh Flexi', 'Flexi Cap') || this.app.allFunds[0];
      const f2 = findFund('HDFC Mid-Cap', 'Mid Cap') || this.app.allFunds[1];
      const f3 = findFund('Nippon India Small', 'Small Cap') || this.app.allFunds[2];

      const selected = [f1, f2, f3].filter(Boolean);
      this.bucket = selected.map(f => f.code);
      this.weights = {};
      this.weights[f1.code] = 0.40;
      this.weights[f2.code] = 0.35;
      if (f3) this.weights[f3.code] = 0.25;
    } else if (templateKey === 'aggressive') {
      // High-Alpha Rocket: Mid Cap + Small Cap
      const f1 = findFund('Motilal Oswal Midcap', 'Mid Cap') || this.app.allFunds[0];
      const f2 = findFund('Quant Small Cap', 'Small Cap') || this.app.allFunds[1];
      const f3 = findFund('Bandhan Small Cap', 'Small Cap') || this.app.allFunds[2];

      const selected = [f1, f2, f3].filter(Boolean);
      this.bucket = selected.map(f => f.code);
      this.weights = {};
      this.weights[f1.code] = 0.40;
      this.weights[f2.code] = 0.30;
      if (f3) this.weights[f3.code] = 0.30;
    } else if (templateKey === 'defensive') {
      // Defensive Compounder: Large & Mid + Bluechip + Contra
      const f1 = findFund('Mirae Asset Large & Midcap', 'Large & Mid Cap') || this.app.allFunds[0];
      const f2 = findFund('ICICI Prudential Bluechip', 'Large Cap') || this.app.allFunds[1];
      const f3 = findFund('SBI Contra', 'Contra') || this.app.allFunds[2];

      const selected = [f1, f2, f3].filter(Boolean);
      this.bucket = selected.map(f => f.code);
      this.weights = {};
      this.weights[f1.code] = 0.40;
      this.weights[f2.code] = 0.30;
      if (f3) this.weights[f3.code] = 0.30;
    }

    this.saveBucketToStorage();
    this.renderSimSimSidebar();
    this.renderSimSimStage();
    this.runSimulation();
  }

  /**
   * Balances all bucket funds equally to 100% with integer remainder distribution
   */
  equalizeWeights() {
    const funds = this.getBucketFunds();
    if (funds.length === 0) return;
    const n = funds.length;
    const basePct = Math.floor(100 / n);
    const remainder = 100 % n;

    funds.forEach((f, idx) => {
      const pct = basePct + (idx < remainder ? 1 : 0);
      this.weights[f.code] = pct / 100.0;
    });

    this.saveBucketToStorage();
    this.renderSimSimStage();
    this.runSimulation();
  }

  /**
   * Renders the interactive multi-segment split bar representing 100% portfolio allocation
   */
  renderSplitBar(funds) {
    if (!funds || funds.length === 0) return '';
    
    let accumPct = 0;
    const segmentsHtml = funds.map((f, idx) => {
      const w = this.weights[f.code] !== undefined ? this.weights[f.code] : (1.0 / funds.length);
      const pct = Math.round(w * 100);
      const rupeeShare = Math.round(this.capital * (pct / 100));
      const colorClass = idx < 6 ? `simsim-seg-${idx}` : 'simsim-seg-default';
      const shortName = f.name.split(' - Direct')[0];

      return `
        <div class="simsim-bar-segment ${colorClass}" data-seg-code="${f.code}" style="width: ${pct}%;">
          <div class="flex items-center gap-1.5 w-full justify-center px-1 pointer-events-none overflow-hidden">
            <span class="text-[11px] font-bold truncate leading-tight" title="${f.name}">${shortName}</span>
            <span class="text-xs font-black font-mono leading-tight segment-pct-text">${pct}%</span>
          </div>
          <span class="text-[10px] opacity-80 font-mono leading-none mt-0.5 segment-rupee-text pointer-events-none">₹${rupeeShare.toLocaleString('en-IN')}</span>
        </div>
      `;
    }).join('');

    let dividerHtml = '';
    accumPct = 0;
    for (let i = 0; i < funds.length - 1; i++) {
      const w = this.weights[funds[i].code] !== undefined ? this.weights[funds[i].code] : (1.0 / funds.length);
      accumPct += Math.round(w * 100);
      dividerHtml += `
        <div class="simsim-bar-divider" data-divider-idx="${i}" style="left: calc(${accumPct}% - 7px);" title="Drag divider to reallocate between ${funds[i].name.split(' - Direct')[0]} and ${funds[i+1].name.split(' - Direct')[0]}"></div>
      `;
    }

    return `
      <div class="space-y-2 pt-1 pb-1">
        <div class="flex items-center justify-between text-xs">
          <span class="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
            <span class="material-symbols-outlined text-sm text-[#00F090]">tune</span>
            Interactive 100% Split Bar (Drag Dividers to Reallocate)
          </span>
          <span class="text-[11px] font-mono text-[#00F090] font-bold" id="split-bar-sum-badge">100% Allocated</span>
        </div>

        <div id="simsim-split-bar" class="simsim-split-bar">
          <div class="simsim-split-segments-wrap" id="simsim-split-segments">
            ${segmentsHtml}
          </div>
          <div id="simsim-split-dividers">
            ${dividerHtml}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Updates split bar segments and divider positions in real-time without DOM re-render
   */
  updateSplitBarVisuals() {
    const funds = this.getBucketFunds();
    if (funds.length === 0) return;

    let accumPct = 0;
    funds.forEach((f, idx) => {
      const w = this.weights[f.code] !== undefined ? this.weights[f.code] : (1.0 / funds.length);
      const pct = Math.round(w * 100);
      const rupeeShare = Math.round(this.capital * (pct / 100));

      const seg = document.querySelector(`.simsim-bar-segment[data-seg-code="${f.code}"]`);
      if (seg) {
        seg.style.width = `${pct}%`;
        const pctText = seg.querySelector('.segment-pct-text');
        if (pctText) pctText.textContent = `${pct}%`;
        const rupeeText = seg.querySelector('.segment-rupee-text');
        if (rupeeText) rupeeText.textContent = `₹${rupeeShare.toLocaleString('en-IN')}`;
      }

      if (idx < funds.length - 1) {
        accumPct += pct;
        const divider = document.querySelector(`.simsim-bar-divider[data-divider-idx="${idx}"]`);
        if (divider) {
          divider.style.left = `calc(${accumPct}% - 7px)`;
        }
      }
    });
  }

  /**
   * Binds pointer events on split bar dividers for smooth horizontal dragging
   */
  bindSplitBarEvents() {
    const splitBar = document.getElementById('simsim-split-bar');
    if (!splitBar) return;

    const dividers = splitBar.querySelectorAll('.simsim-bar-divider');
    const segments = splitBar.querySelectorAll('.simsim-bar-segment');
    const funds = this.getBucketFunds();
    const n = funds.length;
    if (n <= 1) return;

    dividers.forEach(divider => {
      divider.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        const k = parseInt(divider.getAttribute('data-divider-idx'));
        divider.setPointerCapture(e.pointerId);
        divider.classList.add('is-dragging');
        segments.forEach(s => s.classList.add('is-dragging'));

        const onPointerMove = (ev) => {
          const rect = splitBar.getBoundingClientRect();
          if (rect.width <= 0) return;
          const rawPct = ((ev.clientX - rect.left) / rect.width) * 100;

          // Left bound: sum of segments 0..k-1 + 1 (or 1 if k=0)
          let leftBound = 1;
          for (let j = 0; j < k; j++) {
            leftBound += Math.round((this.weights[funds[j].code] || 0) * 100);
          }

          // Right bound: sum of segments 0..k+1 - 1 (or 99 if k=n-2)
          let rightBound = 99;
          if (k < n - 2) {
            let sumUntilK1 = 0;
            for (let j = 0; j <= k + 1; j++) {
              sumUntilK1 += Math.round((this.weights[funds[j].code] || 0) * 100);
            }
            rightBound = sumUntilK1 - 1;
          }

          const clamped = Math.max(leftBound, Math.min(rightBound, Math.round(rawPct)));

          const prevSumLeft = (k > 0) ? (leftBound - 1) : 0;
          let sumBoth = 0;
          if (k < n - 2) {
            sumBoth = (rightBound + 1) - prevSumLeft;
          } else {
            sumBoth = 100 - prevSumLeft;
          }

          const newPctK = clamped - prevSumLeft;
          const newPctK1 = sumBoth - newPctK;

          this.weights[funds[k].code] = newPctK / 100.0;
          this.weights[funds[k + 1].code] = newPctK1 / 100.0;

          // Live update split bar visual segments & divider
          this.updateSplitBarVisuals();

          // Sync card sliders & number inputs below
          [funds[k], funds[k + 1]].forEach(f => {
            const p = Math.round((this.weights[f.code] || 0) * 100);
            const s = document.querySelector(`.weight-slider[data-code="${f.code}"]`);
            if (s) s.value = p;
            const num = document.querySelector(`.weight-number[data-code="${f.code}"]`);
            if (num) num.value = p;
            const sh = document.querySelector(`[data-share-for="${f.code}"]`);
            if (sh) {
              const share = Math.round(this.capital * (p / 100.0));
              sh.textContent = `₹${share.toLocaleString('en-IN')}`;
            }
          });
        };

        const onPointerUp = (ev) => {
          divider.releasePointerCapture(ev.pointerId);
          divider.classList.remove('is-dragging');
          segments.forEach(s => s.classList.remove('is-dragging'));
          divider.removeEventListener('pointermove', onPointerMove);
          divider.removeEventListener('pointerup', onPointerUp);
          divider.removeEventListener('pointercancel', onPointerUp);
          this.saveBucketToStorage();
          this.runSimulation();
        };

        divider.addEventListener('pointermove', onPointerMove);
        divider.addEventListener('pointerup', onPointerUp);
        divider.addEventListener('pointercancel', onPointerUp);
      });
    });
  }

  getBucketFunds() {
    if (!this.app.allFunds) return [];
    return this.bucket.map(code => this.app.allFunds.find(f => f.code === code)).filter(Boolean);
  }

  calculateStartDateFromHorizon(horizon, funds) {
    const today = new Date();
    let d = new Date(today);

    if (horizon === '6M') {
      d.setMonth(d.getMonth() - 6);
    } else if (horizon === '1Y') {
      d.setFullYear(d.getFullYear() - 1);
    } else if (horizon === '2Y') {
      d.setFullYear(d.getFullYear() - 2);
    } else if (horizon === '3Y') {
      d.setFullYear(d.getFullYear() - 3);
    } else if (horizon === '5Y') {
      d.setFullYear(d.getFullYear() - 5);
    } else if (horizon === 'ALL') {
      const earliestCommon = SimSimEngine.calculateEarliestCommonDate(funds);
      return earliestCommon;
    }

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const targetDate = `${y}-${m}-${day}`;

    const earliestCommon = SimSimEngine.calculateEarliestCommonDate(funds);
    return targetDate > earliestCommon ? targetDate : earliestCommon;
  }

  runSimulation() {
    const funds = this.getBucketFunds();
    if (funds.length === 0) return;

    // Normalize weights
    let totalWeight = 0;
    funds.forEach(f => {
      if (this.weights[f.code] === undefined) {
        this.weights[f.code] = 1.0 / funds.length;
      }
      totalWeight += this.weights[f.code];
    });

    const normalizedWeights = {};
    if (totalWeight > 0) {
      funds.forEach(f => {
        normalizedWeights[f.code] = this.weights[f.code] / totalWeight;
      });
    } else {
      funds.forEach(f => {
        normalizedWeights[f.code] = 1.0 / funds.length;
      });
    }

    const startDate = this.calculateStartDateFromHorizon(this.selectedHorizon, funds);

    let result = null;
    if (this.investmentMode === 'lumpsum') {
      result = SimSimEngine.simulateLumpsum(funds, normalizedWeights, this.capital, startDate);
    } else {
      result = SimSimEngine.simulateSip(funds, normalizedWeights, this.capital, startDate);
    }

    this.lastSimulationResult = result;
    this.renderSimulationResults(result);
  }

  /**
   * Renders the SimSim dedicated controls inside the Sidebar
   */
  renderSimSimSidebar() {
    const sidebar = document.getElementById('simsim-sidebar-content');
    if (!sidebar) return;

    sidebar.innerHTML = `
      <div class="space-y-4">
        
        <!-- Portal Context Header -->
        <div class="p-3.5 rounded-2xl bg-[#0D1322] border border-white/10 space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5 text-xs font-bold text-[#00F090] uppercase tracking-wider">
              <span class="material-symbols-outlined text-base simsim-pulse-icon">hourglass_top</span>
              <span>SimSim Portal</span>
            </div>
            <button id="simsim-sidebar-exit-btn" type="button" class="simsim-exit-trigger text-[11px] font-bold text-[#94A3B8] hover:text-white transition-colors cursor-pointer flex items-center gap-1" title="Return to Screener">
              <span class="material-symbols-outlined text-xs">arrow_back</span>
              <span>Exit ☀️</span>
            </button>
          </div>
          <p class="text-[11px] text-[#94A3B8] leading-tight">
            Institutional backtester simulating portfolio growth on daily audited NAV data.
          </p>
        </div>

        <!-- 1. Curated Model Portfolios -->
        <div class="p-3.5 rounded-2xl bg-[#0D1322] border border-white/10 space-y-2.5">
          <span class="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block">Curated Model Baskets:</span>
          <div class="space-y-1.5">
            <button type="button" class="model-preset-btn w-full text-left p-3 rounded-xl transition-all cursor-pointer touch-spring flex items-center justify-between" data-preset="titan">
              <div>
                <span class="text-xs font-bold text-white block">🛡️ The Titan</span>
                <span class="text-[10px] text-[#94A3B8]">Flexi + Mid + Small (3-Fund Core)</span>
              </div>
              <span class="text-[10px] font-mono text-[#00F090] font-bold px-2 py-0.5 rounded-full bg-[#00F090]/10 border border-[#00F090]/30">40/35/25</span>
            </button>
            <button type="button" class="model-preset-btn w-full text-left p-3 rounded-xl transition-all cursor-pointer touch-spring flex items-center justify-between" data-preset="aggressive">
              <div>
                <span class="text-xs font-bold text-white block">🚀 High-Alpha Rocket</span>
                <span class="text-[10px] text-[#94A3B8]">Aggressive Mid & Small Cap Alpha</span>
              </div>
              <span class="text-[10px] font-mono text-[#FF5630] font-bold px-2 py-0.5 rounded-full bg-[#FF5630]/10 border border-[#FF5630]/30">40/30/30</span>
            </button>
            <button type="button" class="model-preset-btn w-full text-left p-3 rounded-xl transition-all cursor-pointer touch-spring flex items-center justify-between" data-preset="defensive">
              <div>
                <span class="text-xs font-bold text-white block">💰 Defensive Compounder</span>
                <span class="text-[10px] text-[#94A3B8]">Bluechip + Large & Mid + Contra</span>
              </div>
              <span class="text-[10px] font-mono text-[#FFB800] font-bold px-2 py-0.5 rounded-full bg-[#FFB800]/10 border border-[#FFB800]/30">40/30/30</span>
            </button>
          </div>
        </div>

        <!-- 2. Investment Style Selector -->
        <div class="p-3.5 rounded-2xl bg-[#0D1322] border border-white/10 space-y-2">
          <span class="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block">Investment Style:</span>
          <div class="grid grid-cols-2 gap-1.5 p-1 bg-[#07090E] rounded-full border border-white/10">
            <button id="simsim-mode-lumpsum" type="button" class="py-2 rounded-full text-xs font-bold transition-all cursor-pointer text-center touch-spring ${this.investmentMode === 'lumpsum' ? 'bg-[#00F090] text-black shadow-md' : 'text-[#94A3B8] hover:text-white'}">
              💎 Lumpsum
            </button>
            <button id="simsim-mode-sip" type="button" class="py-2 rounded-full text-xs font-bold transition-all cursor-pointer text-center touch-spring ${this.investmentMode === 'sip' ? 'bg-[#00F090] text-black shadow-md' : 'text-[#94A3B8] hover:text-white'}">
              🗓️ Monthly SIP
            </button>
          </div>
        </div>

        <!-- 3. Capital & Time Horizon Setup -->
        <div class="p-3.5 rounded-2xl bg-[#0D1322] border border-white/10 space-y-3">
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">${this.investmentMode === 'lumpsum' ? 'Lumpsum Principal:' : 'Monthly Installment:'}</label>
              <span id="capital-display-pill" class="text-xs font-mono font-bold text-[#00F090]">₹${this.capital.toLocaleString('en-IN')}</span>
            </div>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-white font-mono text-sm font-bold">₹</span>
              <input id="simsim-capital-input" type="number" min="1000" step="5000" value="${this.capital}" class="w-full bg-[#07090E] border border-white/10 rounded-xl py-2 pl-7 pr-3 text-sm text-white font-mono outline-none focus:border-[#00F090] transition-colors"/>
            </div>
            <!-- Quick Chips with Pill Curvature -->
            <div class="flex items-center gap-1.5 flex-wrap mt-2">
              ${(this.investmentMode === 'lumpsum' ? [25000, 50000, 100000, 250000, 500000] : [2000, 5000, 10000, 20000, 25000]).map(val => `
                <button type="button" class="capital-chip px-2.5 py-1 rounded-full bg-[#161e2e] border border-white/10 text-[10px] text-[#94A3B8] hover:text-white hover:border-[#00F090] cursor-pointer touch-spring" data-val="${val}">
                  ₹${val >= 100000 ? `${val/100000}L` : `${val/1000}k`}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Time Horizon with Pill Curvature -->
          <div>
            <label class="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block mb-1.5">Backtest Horizon:</label>
            <div class="grid grid-cols-3 gap-1.5">
              ${['6M', '1Y', '2Y', '3Y', '5Y', 'ALL'].map(h => `
                <button type="button" class="horizon-pill py-1.5 text-center rounded-full text-xs font-bold border transition-all cursor-pointer touch-spring ${this.selectedHorizon === h ? 'bg-[#00F090] border-[#00F090] text-black shadow-md' : 'bg-[#07090E] border-white/10 text-[#94A3B8] hover:text-white'}" data-h="${h}">
                  ${h === 'ALL' ? 'Max' : h}
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- 4. Quick Scheme Search in Sidebar -->
        <div class="p-3.5 rounded-2xl bg-[#0D1322] border border-white/10 space-y-2">
          <span class="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block">Add Funds to Basket:</span>
          <div class="relative">
            <span class="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] text-sm">search</span>
            <input id="simsim-add-search-input" type="text" placeholder="Search by name, AMC..." class="w-full bg-[#07090E] border border-white/10 rounded-xl py-1.5 pl-8 pr-3 text-xs text-white outline-none focus:border-[#00D2FF] transition-colors"/>
          </div>
          <div id="simsim-search-results" class="mt-1 space-y-1 max-h-40 overflow-y-auto hidden"></div>
        </div>

        <!-- 5. Primary Run Action -->
        <button id="simsim-run-btn" type="button" class="w-full py-3 rounded-xl bg-[#00F090] hover:bg-[#00d880] text-black font-headline-md font-bold text-sm tracking-wide transition-all cursor-pointer touch-spring shadow-lg flex items-center justify-center gap-2">
          <span class="material-symbols-outlined text-base">rocket_launch</span>
          <span>Simulate Portfolio</span>
        </button>
      </div>
    `;

    this.bindSidebarEvents();
  }

  /**
   * Renders the expansive full-width main workspace into #simsim-container
   */
  renderSimSimStage() {
    const container = document.getElementById('simsim-container');
    if (!container) return;

    const funds = this.getBucketFunds();
    let weightSum = 0;
    funds.forEach(f => {
      const w = this.weights[f.code] !== undefined ? this.weights[f.code] : (1.0 / funds.length);
      weightSum += Math.round(w * 100);
    });

    container.innerHTML = `
      <div class="space-y-6">
        
        <!-- Top Portfolio Status & Action Bar -->
        <div class="simsim-card p-4 flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-[#00F090]/10 border border-[#00F090]/30 flex items-center justify-center text-[#00F090]">
              <span class="material-symbols-outlined text-2xl simsim-pulse-icon">hourglass_top</span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="font-headline-md text-base md:text-lg text-white font-bold">SimSim™ Simulation Workspace</h2>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#00F090]/10 text-[#00F090] border border-[#00F090]/30">Real Historical Backtest</span>
              </div>
              <div class="flex items-center gap-2 text-xs text-[#94A3B8] mt-0.5">
                <span>Active Basket: <strong class="text-white">${funds.length} Scheme${funds.length === 1 ? '' : 's'}</strong></span>
                <span>•</span>
                <div id="simsim-weight-sum-badge" class="text-xs font-mono font-bold px-2 py-0.5 rounded-md ${weightSum === 100 ? 'bg-[#00F090]/10 text-[#00F090] border border-[#00F090]/30' : 'bg-[#FFB800]/10 text-[#FFB800] border border-[#FFB800]/30'}">
                  Total: ${weightSum}%
                </div>
              </div>
            </div>
          </div>

          <!-- Top Action Controls -->
          <div class="flex items-center gap-2 flex-wrap">
            <button id="simsim-equal-weight-btn" type="button" class="simsim-template-chip touch-spring" title="Split weights equally across funds">
              <span class="material-symbols-outlined text-xs">balance</span>
              <span>Equal Weight ⚖️</span>
            </button>
            <button id="simsim-clear-btn" type="button" class="simsim-template-chip text-[#FF4D4D] hover:text-[#FF4D4D] touch-spring" title="Remove all funds from bucket">
              <span class="material-symbols-outlined text-xs">delete_sweep</span>
              <span>Clear</span>
            </button>
            <button id="simsim-exit-btn" type="button" class="simsim-exit-trigger px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer touch-spring flex items-center gap-1.5" title="Return to Mutual Fund Screener">
              <span class="material-symbols-outlined text-sm">arrow_back</span>
              <span>Exit to Screener ☀️</span>
            </button>
          </div>
        </div>

        <!-- Simulation Results Area (Key Metric Cards + Area Chart) -->
        <div id="simsim-results-container">
          <div class="simsim-card p-12 text-center text-xs text-[#94A3B8]">
            <span class="material-symbols-outlined text-3xl text-[#00F090] mb-2 block simsim-pulse-icon">hourglass_empty</span>
            Calculating historical trajectory...
          </div>
        </div>

        <!-- Portfolio Holdings & Asset Weight Allocation Grid (Full Width) -->
        <div class="simsim-card p-5 space-y-4">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 class="text-xs font-bold uppercase tracking-wider text-white">Portfolio Allocation (${funds.length} Schemes)</h3>
              <p class="text-[11px] text-[#94A3B8]">Adjust weights to distribute your capital (Drag bar dividers or card sliders)</p>
            </div>
            <button id="simsim-recalc-btn" type="button" class="px-3 py-1.5 rounded-lg bg-[#00F090] text-black font-bold text-xs hover:bg-[#00d880] transition-colors flex items-center gap-1 cursor-pointer touch-spring shadow-sm">
              <span class="material-symbols-outlined text-sm">rocket_launch</span>
              <span>Re-Simulate ⚡</span>
            </button>
          </div>

          <!-- Interactive 100% Split Bar with Movable Dividers -->
          ${this.renderSplitBar(funds)}

          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" id="simsim-holdings-grid">
            ${funds.length === 0 ? `
              <div class="col-span-full py-10 text-center text-xs text-[#94A3B8]">
                No funds in SimSim bucket yet. Select a model portfolio from the sidebar or add schemes from BickerBape Screener.
              </div>
            ` : funds.map(f => {
              const w = this.weights[f.code] !== undefined ? this.weights[f.code] : (1.0 / funds.length);
              const pct = Math.round(w * 100);
              const rupeeShare = Math.round(this.capital * (pct / 100));

              return `
                <div class="p-4 rounded-xl bg-[#090D14] border border-white/10 space-y-3" data-fund-card="${f.code}">
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <h4 class="text-xs font-bold text-white truncate" title="${f.name}">${f.name.split(' - Direct')[0]}</h4>
                      <div class="flex items-center gap-1.5 mt-0.5">
                        <span class="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-[#94A3B8] font-bold uppercase">${f.category}</span>
                        <span class="text-[10px] text-[#64748B]">NAV: ₹${(f.latest_nav || 0).toFixed(2)}</span>
                      </div>
                    </div>
                    <button type="button" class="remove-fund-btn text-[#94A3B8] hover:text-[#FF4D4D] transition-colors cursor-pointer" data-code="${f.code}" title="Remove fund">
                      <span class="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>

                  <div class="flex items-center gap-3">
                    <input type="range" min="0" max="100" value="${pct}" class="simsim-slider weight-slider" data-code="${f.code}"/>
                    <div class="flex items-center gap-1 flex-shrink-0">
                      <input type="number" min="0" max="100" value="${pct}" class="w-12 bg-[#161e2e] border border-white/10 rounded px-1.5 py-0.5 text-xs text-right font-mono text-white weight-number" data-code="${f.code}"/>
                      <span class="text-xs text-[#94A3B8] font-bold">%</span>
                    </div>
                  </div>

                  <div class="flex items-center justify-between text-[11px] text-[#94A3B8] pt-1 border-t border-white/5">
                    <span>Allocated Share:</span>
                    <span class="font-mono text-white font-bold" data-share-for="${f.code}">₹${rupeeShare.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Detailed Constituent Performance Table -->
        <div id="simsim-table-container"></div>

      </div>
    `;

    this.bindStageEvents();
  }

  /**
   * Binds sidebar controls
   */
  bindSidebarEvents() {
    // Exit buttons
    document.querySelectorAll('.simsim-exit-trigger').forEach(btn => {
      btn.addEventListener('click', () => this.disableSimSimMode());
    });

    // Model presets in sidebar
    document.querySelectorAll('.model-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.getAttribute('data-preset');
        this.loadTemplate(preset);
      });
    });

    // Mode toggles (Lumpsum vs SIP)
    const lumpsumBtn = document.getElementById('simsim-mode-lumpsum');
    const sipBtn = document.getElementById('simsim-mode-sip');

    if (lumpsumBtn) {
      lumpsumBtn.addEventListener('click', () => {
        this.investmentMode = 'lumpsum';
        this.renderSimSimSidebar();
        this.renderSimSimStage();
        this.runSimulation();
      });
    }

    if (sipBtn) {
      sipBtn.addEventListener('click', () => {
        this.investmentMode = 'sip';
        if (this.capital >= 100000) this.capital = 10000;
        this.renderSimSimSidebar();
        this.renderSimSimStage();
        this.runSimulation();
      });
    }

    // Capital input & chips
    const capInput = document.getElementById('simsim-capital-input');
    if (capInput) {
      capInput.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value) || 1000;
        this.capital = val;
        const pill = document.getElementById('capital-display-pill');
        if (pill) pill.textContent = `₹${val.toLocaleString('en-IN')}`;
        document.querySelectorAll('[data-share-for]').forEach(el => {
          const code = Number(el.getAttribute('data-share-for'));
          const w = this.weights[code] !== undefined ? this.weights[code] : 0;
          el.textContent = `₹${Math.round(val * w).toLocaleString('en-IN')}`;
        });
      });
      capInput.addEventListener('change', () => this.runSimulation());
    }

    document.querySelectorAll('.capital-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const val = parseFloat(chip.getAttribute('data-val'));
        this.capital = val;
        this.renderSimSimSidebar();
        this.renderSimSimStage();
        this.runSimulation();
      });
    });

    // Horizon pills
    document.querySelectorAll('.horizon-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        this.selectedHorizon = pill.getAttribute('data-h');
        document.querySelectorAll('.horizon-pill').forEach(p => {
          p.classList.remove('bg-[#00D2FF]/20', 'border-[#00D2FF]', 'text-[#00D2FF]');
          p.classList.add('bg-[#07090E]', 'border-white/10', 'text-[#94A3B8]');
        });
        pill.classList.add('bg-[#00D2FF]/20', 'border-[#00D2FF]', 'text-[#00D2FF]');
        pill.classList.remove('bg-[#07090E]', 'border-white/10', 'text-[#94A3B8]');
        this.runSimulation();
      });
    });

    // Scheme search inside sidebar
    const searchInput = document.getElementById('simsim-add-search-input');
    const searchResults = document.getElementById('simsim-search-results');

    if (searchInput && searchResults) {
      searchInput.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();
        if (q.length < 2) {
          searchResults.classList.add('hidden');
          searchResults.innerHTML = '';
          return;
        }

        const matches = (this.app.allFunds || []).filter(f => 
          !this.isInBucket(f.code) &&
          (f.name.toLowerCase().includes(q) || f.fund_house.toLowerCase().includes(q) || f.category.toLowerCase().includes(q))
        ).slice(0, 8);

        if (matches.length === 0) {
          searchResults.innerHTML = `<div class="p-2 text-xs text-[#94A3B8]">No matching funds</div>`;
          searchResults.classList.remove('hidden');
          return;
        }

        searchResults.innerHTML = matches.map(f => `
          <div class="p-2 bg-[#121824] hover:bg-[#192132] border border-white/10 rounded-lg flex items-center justify-between cursor-pointer touch-spring add-match-item" data-code="${f.code}">
            <div class="min-w-0 pr-2">
              <p class="text-xs font-bold text-white truncate">${f.name.split(' - Direct')[0]}</p>
              <p class="text-[10px] text-[#94A3B8]">${f.category} • NAV ₹${(f.latest_nav || 0).toFixed(1)}</p>
            </div>
            <span class="material-symbols-outlined text-[#00F090] text-sm flex-shrink-0">add_circle</span>
          </div>
        `).join('');

        searchResults.classList.remove('hidden');

        searchResults.querySelectorAll('.add-match-item').forEach(item => {
          item.addEventListener('click', () => {
            const code = Number(item.getAttribute('data-code'));
            this.addToBucket(code);
            searchInput.value = '';
            searchResults.classList.add('hidden');
          });
        });
      });
    }

    // Sidebar Simulate Launch Button
    const sideRunBtn = document.getElementById('simsim-run-btn') || document.getElementById('simsim-sidebar-run-btn');
    if (sideRunBtn) sideRunBtn.addEventListener('click', () => this.runSimulation());
  }

  /**
   * Binds main stage interactive controls (sliders, equal weight, recalculate)
   */
  bindStageEvents() {
    // Action bar buttons
    const eqBtn = document.getElementById('simsim-equal-weight-btn');
    if (eqBtn) eqBtn.addEventListener('click', () => this.equalizeWeights());

    const clearBtn = document.getElementById('simsim-clear-btn');
    if (clearBtn) clearBtn.addEventListener('click', () => this.clearBucket());

    const recalcBtn = document.getElementById('simsim-recalc-btn');
    if (recalcBtn) recalcBtn.addEventListener('click', () => this.runSimulation());

    // Weight sliders & number inputs with auto-adjust mechanism to ensure max 100%
    const adjustWeights = (activeCode, newPct) => {
      const funds = this.getBucketFunds();
      const n = funds.length;
      if (n === 0) return;
      if (n === 1) {
        this.weights[activeCode] = 1.0;
        const s = document.querySelector(`.weight-slider[data-code="${activeCode}"]`);
        if (s) s.value = 100;
        const num = document.querySelector(`.weight-number[data-code="${activeCode}"]`);
        if (num) num.value = 100;
        const sh = document.querySelector(`[data-share-for="${activeCode}"]`);
        if (sh) sh.textContent = `₹${this.capital.toLocaleString('en-IN')}`;
        return;
      }

      // Clamp target to 0..100
      const target = Math.max(0, Math.min(100, Math.round(newPct)));
      const remainingBudget = 100 - target;

      const otherFunds = funds.filter(f => f.code !== activeCode);
      let otherSum = 0;
      otherFunds.forEach(f => {
        otherSum += Math.round((this.weights[f.code] || 0) * 100);
      });

      const newPcts = {};
      newPcts[activeCode] = target;

      if (otherSum > 0 && remainingBudget > 0) {
        let allocatedOther = 0;
        const items = otherFunds.map(f => {
          const cur = Math.round((this.weights[f.code] || 0) * 100);
          const exact = (cur / otherSum) * remainingBudget;
          const floorVal = Math.floor(exact);
          allocatedOther += floorVal;
          return { code: f.code, floorVal, frac: exact - floorVal };
        });

        let rem = remainingBudget - allocatedOther;
        items.sort((a, b) => b.frac - a.frac);
        items.forEach((item, idx) => {
          newPcts[item.code] = item.floorVal + (idx < rem ? 1 : 0);
        });
      } else if (remainingBudget > 0) {
        const base = Math.floor(remainingBudget / otherFunds.length);
        const rem = remainingBudget % otherFunds.length;
        otherFunds.forEach((f, idx) => {
          newPcts[f.code] = base + (idx < rem ? 1 : 0);
        });
      } else {
        otherFunds.forEach(f => {
          newPcts[f.code] = 0;
        });
      }

      // Update this.weights and sync DOM inputs & rupee shares
      funds.forEach(f => {
        const p = newPcts[f.code] !== undefined ? newPcts[f.code] : 0;
        this.weights[f.code] = p / 100.0;

        const s = document.querySelector(`.weight-slider[data-code="${f.code}"]`);
        if (s && document.activeElement !== s) s.value = p;
        const num = document.querySelector(`.weight-number[data-code="${f.code}"]`);
        if (num && document.activeElement !== num) num.value = p;

        const sh = document.querySelector(`[data-share-for="${f.code}"]`);
        if (sh) {
          const share = Math.round(this.capital * (p / 100.0));
          sh.textContent = `₹${share.toLocaleString('en-IN')}`;
        }
      });

      const badge = document.getElementById('simsim-weight-sum-badge');
      if (badge) {
        badge.textContent = `Total: 100%`;
        badge.className = 'text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#00F090]/10 text-[#00F090] border border-[#00F090]/30';
      }

      // Live update the split bar segments and dividers
      this.updateSplitBarVisuals();
    };

    // Bind split bar interactive draggable dividers
    this.bindSplitBarEvents();

    document.querySelectorAll('.weight-slider').forEach(slider => {
      slider.addEventListener('input', (e) => {
        const code = Number(slider.getAttribute('data-code'));
        const val = parseFloat(e.target.value) || 0;
        adjustWeights(code, val);
      });
      slider.addEventListener('change', () => this.runSimulation());
    });

    document.querySelectorAll('.weight-number').forEach(input => {
      input.addEventListener('input', (e) => {
        const code = Number(input.getAttribute('data-code'));
        const val = parseFloat(e.target.value) || 0;
        adjustWeights(code, val);
      });
      input.addEventListener('change', () => this.runSimulation());
    });

    // Remove fund buttons
    document.querySelectorAll('.remove-fund-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = Number(btn.getAttribute('data-code'));
        this.removeFromBucket(code);
      });
    });
  }

  /**
   * Renders the simulation results: 4 Key KPI cards and full-width Chart.js Canvas
   */
  renderSimulationResults(res) {
    const resultsContainer = document.getElementById('simsim-results-container') || document.getElementById('simsim-results-view');
    const tableContainer = document.getElementById('simsim-table-container');
    if (!resultsContainer || !res) return;

    resultsContainer.innerHTML = `
      <div class="space-y-6">
        
        <!-- 4 Key KPI Metrics Cards (Full Width Grid with Depth & Soft Glow) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <!-- Card 1: Present Value -->
          <div class="simsim-card simsim-kpi-card simsim-kpi-emerald p-4">
            <div class="flex items-center justify-between text-[#94A3B8] mb-1">
              <span class="text-[10px] font-bold uppercase tracking-wider">Simulated Present Value</span>
              <span class="material-symbols-outlined text-base text-[#00F090]">account_balance_wallet</span>
            </div>
            <p class="font-display-financial text-2xl font-black simsim-neon-headline">
              ₹${Math.round(res.presentValue).toLocaleString('en-IN')}
            </p>
            <p class="text-[11px] font-medium ${res.totalGain >= 0 ? 'text-[#00F090]' : 'text-[#FF4D4D]'} mt-1 flex items-center gap-1">
              <span>${res.totalGain >= 0 ? '▲' : '▼'} ₹${Math.abs(Math.round(res.totalGain)).toLocaleString('en-IN')}</span>
              <span class="text-[10px] text-[#64748B]">(${res.totalGainPct >= 0 ? '+' : ''}${res.totalGainPct.toFixed(2)}%)</span>
            </p>
          </div>

          <!-- Card 2: Annualized CAGR / XIRR -->
          <div class="simsim-card simsim-kpi-card simsim-kpi-cyan p-4">
            <div class="flex items-center justify-between text-[#94A3B8] mb-1">
              <span class="text-[10px] font-bold uppercase tracking-wider">${res.type === 'lumpsum' ? 'Annualized CAGR' : 'Annualized XIRR'}</span>
              <span class="material-symbols-outlined text-base text-[#00D2FF]">trending_up</span>
            </div>
            <p class="font-display-financial text-2xl font-black text-white">
              ${res.cagr.toFixed(2)}%
            </p>
            <p class="text-[11px] font-medium ${res.alpha >= 0 ? 'text-[#00D2FF]' : 'text-[#FF4D4D]'} mt-1">
              ${res.alpha >= 0 ? '+' : ''}${res.alpha.toFixed(2)}% Alpha vs Nifty 50 TRI
            </p>
          </div>

          <!-- Card 3: Max Drawdown -->
          <div class="simsim-card simsim-kpi-card simsim-kpi-crimson p-4">
            <div class="flex items-center justify-between text-[#94A3B8] mb-1">
              <span class="text-[10px] font-bold uppercase tracking-wider">Max Drawdown</span>
              <span class="material-symbols-outlined text-base text-[#FF4D4D]">shield</span>
            </div>
            <p class="font-display-financial text-2xl font-black text-[#FF4D4D]">
              ${res.maxDrawdown > 0 ? `-${res.maxDrawdown.toFixed(2)}%` : '0.00%'}
            </p>
            <p class="text-[11px] text-[#64748B] mt-1">Worst peak-to-trough drop</p>
          </div>

          <!-- Card 4: Total Invested Capital -->
          <div class="simsim-card simsim-kpi-card simsim-kpi-amber p-4">
            <div class="flex items-center justify-between text-[#94A3B8] mb-1">
              <span class="text-[10px] font-bold uppercase tracking-wider">Total Invested</span>
              <span class="material-symbols-outlined text-base text-[#FFB800]">savings</span>
            </div>
            <p class="font-display-financial text-2xl font-black text-white">
              ₹${Math.round(res.totalCapital).toLocaleString('en-IN')}
            </p>
            <p class="text-[11px] text-[#64748B] mt-1">${res.type === 'lumpsum' ? 'One-time principal' : `${res.installmentsCount || 0} installments`}</p>
          </div>

        </div>

        <!-- Interactive Chart.js Dual Area Chart (Full Width) -->
        <div class="simsim-card p-5 space-y-3">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 class="text-xs font-bold uppercase tracking-wider text-white">Historical Wealth Trajectory</h3>
              <p class="text-[11px] text-[#94A3B8]">Simulated Portfolio vs Nifty 50 TRI Benchmark (${res.startDate} to ${res.endDate})</p>
            </div>
            <div class="flex items-center gap-4 text-xs font-bold">
              <div class="flex items-center gap-1.5">
                <span class="w-3 h-3 rounded-full bg-[#00F090]"></span>
                <span class="text-white">Portfolio</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="w-3 h-3 rounded-full bg-[#00D2FF]"></span>
                <span class="text-[#00D2FF]">Nifty 50 TRI</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="w-3 h-3 rounded-full bg-[#FFB800]"></span>
                <span class="text-[#FFB800]">Invested</span>
              </div>
            </div>
          </div>

          <div class="simsim-chart-wrap p-2" style="height: 380px;">
            <canvas id="simsim-chart-canvas"></canvas>
          </div>
        </div>

      </div>
    `;

    // Render detailed constituent performance table
    if (tableContainer) {
      tableContainer.innerHTML = `
        <div class="simsim-card overflow-hidden">
          <div class="p-4 border-b border-white/10 bg-[#0C1018] flex items-center justify-between">
            <h3 class="text-xs font-bold uppercase tracking-wider text-white">Constituent Schemes Performance Breakdown</h3>
            <span class="text-[11px] font-mono text-[#94A3B8]">Period: ${res.startDate} to ${res.endDate} (${res.years} Years)</span>
          </div>

          <div class="overflow-x-auto">
            <table class="simsim-table">
              <thead>
                <tr>
                  <th class="text-left">Scheme & Category</th>
                  <th class="text-right">Weight</th>
                  <th class="text-right">Invested</th>
                  <th class="text-right">Present Value</th>
                  <th class="text-right">Gain / Loss</th>
                  <th class="text-right">${res.type === 'lumpsum' ? 'CAGR' : 'Return'}</th>
                  <th class="text-right">Units Held</th>
                </tr>
              </thead>
              <tbody>
                ${res.constituents.map(c => `
                  <tr>
                    <td>
                      <p class="font-bold text-white text-xs truncate max-w-xs" title="${c.name}">${c.name}</p>
                      <p class="text-[10px] text-[#94A3B8]">${c.category} • ${c.fund_house}</p>
                    </td>
                    <td class="text-right font-mono text-[#00F090] font-bold">${c.weightPct}%</td>
                    <td class="text-right font-mono text-[#94A3B8]">₹${Math.round(c.allocatedCap).toLocaleString('en-IN')}</td>
                    <td class="text-right font-mono font-bold text-white">₹${Math.round(c.presentValue).toLocaleString('en-IN')}</td>
                    <td class="text-right font-mono font-bold ${c.gain >= 0 ? 'text-[#00F090]' : 'text-[#FF4D4D]'}">
                      ${c.gain >= 0 ? '+' : ''}₹${Math.round(c.gain).toLocaleString('en-IN')} (${c.gainPct >= 0 ? '+' : ''}${c.gainPct.toFixed(1)}%)
                    </td>
                    <td class="text-right font-mono font-bold ${c.cagr >= 0 ? 'text-[#00D2FF]' : 'text-[#FF4D4D]'}">
                      ${c.cagr >= 0 ? '+' : ''}${c.cagr.toFixed(2)}%
                    </td>
                    <td class="text-right font-mono text-xs text-[#64748B]">${c.units.toLocaleString('en-IN')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // Render interactive chart
    setTimeout(() => this.renderChart(res), 50);
  }

  /**
   * Renders Chart.js visualization
   */
  renderChart(res) {
    const canvas = document.getElementById('simsim-chart-canvas');
    if (!canvas || typeof Chart === 'undefined') return;

    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }

    const ctx = canvas.getContext('2d');

    // Emerald gradient fill for portfolio curve
    const emeraldGrad = ctx.createLinearGradient(0, 0, 0, 320);
    emeraldGrad.addColorStop(0, 'rgba(0, 240, 144, 0.35)');
    emeraldGrad.addColorStop(1, 'rgba(0, 240, 144, 0.00)');

    const labels = res.timeSeries.map(pt => pt.date);
    const portData = res.timeSeries.map(pt => pt.value);
    const benchData = res.benchmarkSeries.map(pt => pt.value);
    const investedData = res.investedSeries.map(pt => pt.value);

    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'SimSim Portfolio',
            data: portData,
            borderColor: '#00F090',
            borderWidth: 2.5,
            backgroundColor: emeraldGrad,
            fill: true,
            tension: 0.25,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#00F090',
            pointHoverBorderColor: '#ffffff',
            pointHoverBorderWidth: 2
          },
          {
            label: 'Nifty 50 TRI Benchmark',
            data: benchData,
            borderColor: '#00D2FF',
            borderWidth: 1.8,
            borderDash: [4, 4],
            backgroundColor: 'transparent',
            fill: false,
            tension: 0.25,
            pointRadius: 0,
            pointHoverRadius: 5
          },
          {
            label: 'Invested Capital',
            data: investedData,
            borderColor: '#FFB800',
            borderWidth: 1.5,
            borderDash: [2, 2],
            backgroundColor: 'transparent',
            fill: false,
            tension: 0,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(10, 14, 23, 0.95)',
            titleColor: '#ffffff',
            bodyColor: '#e2e8f0',
            borderColor: 'rgba(0, 240, 144, 0.4)',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: function(context) {
                return ` ${context.dataset.label}: ₹${Math.round(context.raw).toLocaleString('en-IN')}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            ticks: {
              color: '#64748B',
              font: { size: 10 },
              maxTicksLimit: 8
            }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            ticks: {
              color: '#64748B',
              font: { size: 10 },
              callback: function(value) {
                if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
                if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
                if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
                return `₹${value}`;
              }
            }
          }
        }
      }
    });
  }
}
