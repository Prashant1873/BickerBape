/**
 * SimSim™ User Interface & Portfolio Backtesting Controller
 * Handles Day/Night Logo Switch, Interactive Allocation Sliders,
 * Model Portfolios, Chart.js Visualizations, and Bucket Synchronization.
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
    this.selectedHorizon = '3Y'; // '6M', '1Y', '2Y', '3Y', '5Y', 'ALL', 'custom'
    this.customStartDate = '2023-01-01';
    this.chartInstance = null;
    this.lastSimulationResult = null;

    this.initBucketFromStorage();
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
      this.saveBucketToStorage();
      this.updateTray();
      this.updateScreenerButtons();
      if (this.isSimSimMode) {
        this.renderSimSimStage();
        this.runSimulation();
      }
    }
  }

  removeFromBucket(schemeCode) {
    const code = Number(schemeCode);
    this.bucket = this.bucket.filter(c => c !== code);
    delete this.weights[code];
    this.saveBucketToStorage();
    this.updateTray();
    this.updateScreenerButtons();
    if (this.isSimSimMode) {
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

    // Hide screener view elements
    const screenerViews = document.getElementById('screener-views-wrapper');
    const screenerHeader = document.getElementById('screener-header-controls');
    const simsimContainer = document.getElementById('simsim-container');

    if (screenerViews) screenerViews.classList.add('hidden');
    if (screenerHeader) screenerHeader.classList.add('hidden');
    if (simsimContainer) simsimContainer.classList.remove('hidden');

    // Update Header Brand
    const headerTitle = document.getElementById('header-platform-title');
    const headerSub = document.getElementById('funds-count');
    const headerMood = document.getElementById('header-mood-indicator');
    const modeBadge = document.getElementById('platform-mode-badge');

    if (headerTitle) headerTitle.innerHTML = `<span class="simsim-neon-headline font-black">SimSim™</span> <span class="text-xs font-semibold text-on-surface-variant">Time Machine</span>`;
    if (headerSub) headerSub.textContent = `Hypothetical Portfolio Wealth Simulator`;
    if (headerMood) headerMood.classList.add('hidden');
    if (modeBadge) {
      modeBadge.className = 'mode-switch-badge simsim-badge';
      modeBadge.innerHTML = `<span class="material-symbols-outlined text-[12px] simsim-pulse-icon">auto_graph</span> SimSim Mode`;
    }

    // Hide floating tray in SimSim mode
    this.hideTray();

    // If bucket empty, populate with a high-performing diversified starter portfolio
    if (this.bucket.length === 0) {
      this.loadTemplate('titan');
    } else {
      this.renderSimSimStage();
      this.runSimulation();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  disableSimSimMode() {
    this.isSimSimMode = false;
    document.body.classList.remove('simsim-mode');

    const screenerViews = document.getElementById('screener-views-wrapper');
    const screenerHeader = document.getElementById('screener-header-controls');
    const simsimContainer = document.getElementById('simsim-container');

    if (screenerViews) screenerViews.classList.remove('hidden');
    if (screenerHeader) screenerHeader.classList.remove('hidden');
    if (simsimContainer) simsimContainer.classList.add('hidden');

    // Restore Header Brand
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

    this.updateTray();
    this.updateScreenerButtons();
  }

  updateTray() {
    const tray = document.getElementById('simsim-floating-tray');
    const countEl = document.getElementById('simsim-tray-count');
    if (!tray) return;

    if (this.isSimSimMode || this.bucket.length === 0) {
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

    // Helper to find fund by name substring or category
    const findFund = (substr, cat) => {
      return this.app.allFunds.find(f => 
        (f.name.toLowerCase().includes(substr.toLowerCase()) || f.category.toLowerCase().includes(cat.toLowerCase())) &&
        (f.nav_history && f.nav_history.length > 40)
      );
    };

    if (templateKey === 'titan') {
      // The Core Titan: Flexi Cap + Mid Cap + Large Cap
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
      // Defensive Compounder: Large & Mid + Flexi
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
    this.renderSimSimStage();
    this.runSimulation();
  }

  /**
   * Balances all bucket funds equally to 100% / N
   */
  equalizeWeights() {
    if (this.bucket.length === 0) return;
    const eq = 1.0 / this.bucket.length;
    this.bucket.forEach(code => {
      this.weights[code] = parseFloat(eq.toFixed(4));
    });
    this.renderSimSimStage();
    this.runSimulation();
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
      return SimSimEngine.calculateEarliestCommonDate(funds);
    } else if (horizon === 'custom') {
      return this.customStartDate;
    }

    return d.toISOString().split('T')[0];
  }

  /**
   * Main Simulation execution routine
   */
  runSimulation() {
    const funds = this.getBucketFunds();
    if (funds.length === 0) return;

    // Normalize weights if needed
    let totalWeight = 0;
    funds.forEach(f => {
      if (this.weights[f.code] === undefined) {
        this.weights[f.code] = 1.0 / funds.length;
      }
      totalWeight += this.weights[f.code];
    });

    // Rebalance to 1.0 if not zero
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
   * Renders the entire SimSim view into #simsim-container
   */
  renderSimSimStage() {
    const container = document.getElementById('simsim-container');
    if (!container) return;

    const funds = this.getBucketFunds();

    container.innerHTML = `
      <div class="space-y-6">
        
        <!-- SimSim Top Control Bar -->
        <div class="simsim-card p-4 flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
              <span class="material-symbols-outlined text-2xl simsim-pulse-icon">hourglass_top</span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="font-headline-md text-base md:text-lg text-white font-bold">SimSim™ Portfolio Time Machine</h2>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#00F090]/10 text-[#00F090] border border-[#00F090]/30">Real Historical Backtest</span>
              </div>
              <p class="text-xs text-[#94A3B8]">Allocate hypothetical capital back in time to simulate wealth generation with daily NAV data</p>
            </div>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <button id="simsim-equal-weight-btn" type="button" class="simsim-template-chip touch-spring" title="Split weights equally across funds">
              <span class="material-symbols-outlined text-xs">balance</span>
              <span>Equal Weight ⚖️</span>
            </button>
            <button id="simsim-clear-btn" type="button" class="simsim-template-chip text-[#FF4D4D] hover:text-[#FF4D4D] touch-spring" title="Remove all funds from bucket">
              <span class="material-symbols-outlined text-xs">delete_sweep</span>
              <span>Clear</span>
            </button>
            <button id="simsim-exit-btn" type="button" class="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer touch-spring flex items-center gap-1.5" title="Return to Mutual Fund Screener">
              <span class="material-symbols-outlined text-sm">arrow_back</span>
              <span>Exit to Screener ☀️</span>
            </button>
          </div>
        </div>

        <!-- Main Two-Column Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- Left Column: Portfolio Construction & Setup Deck (5 Cols) -->
          <div class="lg:col-span-5 space-y-5">
            
            <!-- Curated Model Portfolio Presets -->
            <div class="simsim-card p-4 space-y-3">
              <span class="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block">Curated Model Portfolios:</span>
              <div class="flex items-center gap-2 flex-wrap">
                <button type="button" class="simsim-template-chip model-preset-btn" data-preset="titan">
                  🛡️ The Titan (Core 3-Fund)
                </button>
                <button type="button" class="simsim-template-chip model-preset-btn" data-preset="aggressive">
                  🚀 High-Alpha Rocket
                </button>
                <button type="button" class="simsim-template-chip model-preset-btn" data-preset="defensive">
                  💰 Defensive Compounder
                </button>
              </div>
            </div>

            <!-- Investment Setup Controls -->
            <div class="simsim-card p-5 space-y-5">
              
              <!-- Mode: Lumpsum vs Monthly SIP -->
              <div>
                <label class="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block mb-2">Investment Style:</label>
                <div class="grid grid-cols-2 gap-2 p-1 bg-[#090D14] rounded-xl border border-white/10">
                  <button id="simsim-mode-lumpsum" type="button" class="py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${this.investmentMode === 'lumpsum' ? 'bg-[#00F090] text-black shadow-sm' : 'text-[#94A3B8] hover:text-white'}">
                    One-Time Lumpsum
                  </button>
                  <button id="simsim-mode-sip" type="button" class="py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${this.investmentMode === 'sip' ? 'bg-[#00F090] text-black shadow-sm' : 'text-[#94A3B8] hover:text-white'}">
                    Monthly SIP (5th)
                  </button>
                </div>
              </div>

              <!-- Capital Input -->
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <label class="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                    ${this.investmentMode === 'lumpsum' ? 'Hypothetical Capital Invested:' : 'Monthly SIP Amount:'}
                  </label>
                  <span id="capital-display-pill" class="text-xs font-bold text-[#00F090] font-mono">₹${this.capital.toLocaleString('en-IN')}</span>
                </div>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#94A3B8]">₹</span>
                  <input id="simsim-capital-input" type="number" min="1000" step="5000" value="${this.capital}" class="w-full bg-[#090D14] border border-white/10 rounded-xl py-2 pl-7 pr-3 text-sm text-white font-mono outline-none focus:border-[#00F090] transition-colors"/>
                </div>
                <!-- Capital Preset Chips -->
                <div class="flex items-center gap-1.5 mt-2 flex-wrap text-xs">
                  ${(this.investmentMode === 'lumpsum' ? [50000, 100000, 500000, 1000000, 2500000] : [2000, 5000, 10000, 25000, 50000]).map(val => `
                    <button type="button" class="capital-chip px-2 py-0.5 rounded-md bg-[#161e2e] border border-white/10 text-[11px] text-[#94A3B8] hover:text-white hover:border-[#00F090] cursor-pointer touch-spring" data-val="${val}">
                      ₹${val >= 100000 ? `${val / 100000}L` : `${val / 1000}k`}
                    </button>
                  `).join('')}
                </div>
              </div>

              <!-- Time Machine Starting Point -->
              <div>
                <label class="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block mb-2">Backtest Starting Point (Time Machine):</label>
                <div class="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  ${['6M', '1Y', '2Y', '3Y', '5Y', 'ALL'].map(h => `
                    <button type="button" class="horizon-pill py-1.5 text-center rounded-lg text-xs font-bold border transition-all cursor-pointer touch-spring ${this.selectedHorizon === h ? 'bg-[#00D2FF]/20 border-[#00D2FF] text-[#00D2FF]' : 'bg-[#090D14] border-white/10 text-[#94A3B8] hover:text-white'}" data-h="${h}">
                      ${h === 'ALL' ? 'Earliest' : h}
                    </button>
                  `).join('')}
                </div>
              </div>

            </div>

            <!-- Portfolio Allocation Sliders Deck -->
            <div class="simsim-card p-5 space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-xs font-bold uppercase tracking-wider text-white">Portfolio Allocation (${funds.length} Schemes)</h3>
                  <p class="text-[11px] text-[#94A3B8]">Adjust weights to distribute your capital</p>
                </div>
                <div id="simsim-weight-sum-badge" class="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#00F090]/10 text-[#00F090] border border-[#00F090]/30">
                  Total: 100%
                </div>
              </div>

              <!-- Fund Cards List -->
              <div class="space-y-3 max-h-[380px] overflow-y-auto pr-1 hide-scrollbar">
                ${funds.length === 0 ? `
                  <div class="py-8 text-center text-xs text-[#94A3B8]">
                    No funds in SimSim bucket yet. Select a model portfolio above or add schemes from BickerBape Screener.
                  </div>
                ` : funds.map(f => {
                  const w = this.weights[f.code] !== undefined ? this.weights[f.code] : (1.0 / funds.length);
                  const pct = Math.round(w * 100);
                  const rupeeShare = Math.round(this.capital * (pct / 100));

                  return `
                    <div class="p-3 rounded-xl bg-[#090D14] border border-white/10 space-y-2" data-fund-card="${f.code}">
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

                      <div class="flex items-center justify-between text-[11px] text-[#94A3B8] pt-0.5">
                        <span>Allocated Share:</span>
                        <span class="font-mono text-white font-bold">₹${rupeeShare.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>

              <!-- Quick Scheme Search inside SimSim -->
              <div class="pt-2 border-t border-white/10">
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] text-sm">add_circle</span>
                  <input id="simsim-add-search-input" type="text" placeholder="Add more schemes by name or AMC..." class="w-full bg-[#090D14] border border-white/10 rounded-xl py-1.5 pl-8 pr-3 text-xs text-white outline-none focus:border-[#00D2FF] transition-colors"/>
                </div>
                <div id="simsim-search-results" class="mt-1 space-y-1 max-h-36 overflow-y-auto hidden"></div>
              </div>

              <!-- Run Simulation Action -->
              <button id="simsim-run-btn" type="button" class="w-full py-3 rounded-xl bg-[#00F090] text-black font-headline-md font-bold text-sm tracking-wide hover:bg-[#00d880] transition-all cursor-pointer touch-spring shadow-lg flex items-center justify-center gap-2">
                <span class="material-symbols-outlined text-base">rocket_launch</span>
                <span>Simulate Portfolio</span>
              </button>

            </div>

          </div>

          <!-- Right Column: Live Simulation Results Dashboard (7 Cols) -->
          <div class="lg:col-span-7 space-y-5">
            <div id="simsim-results-container">
              <!-- Dynamically populated by renderSimulationResults -->
            </div>
          </div>

        </div>

      </div>
    `;

    this.bindStageEvents();
  }

  /**
   * Binds interactive events for sliders, buttons, inputs, and search
   */
  bindStageEvents() {
    // Mode toggles
    const lumpsumBtn = document.getElementById('simsim-mode-lumpsum');
    const sipBtn = document.getElementById('simsim-mode-sip');

    if (lumpsumBtn) {
      lumpsumBtn.addEventListener('click', () => {
        this.investmentMode = 'lumpsum';
        this.renderSimSimStage();
        this.runSimulation();
      });
    }

    if (sipBtn) {
      sipBtn.addEventListener('click', () => {
        this.investmentMode = 'sip';
        if (this.capital >= 100000) this.capital = 10000;
        this.renderSimSimStage();
        this.runSimulation();
      });
    }

    // Capital input
    const capInput = document.getElementById('simsim-capital-input');
    if (capInput) {
      capInput.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value) || 1000;
        this.capital = val;
        const pill = document.getElementById('capital-display-pill');
        if (pill) pill.textContent = `₹${val.toLocaleString('en-IN')}`;
      });
      capInput.addEventListener('change', () => this.runSimulation());
    }

    // Capital chips
    document.querySelectorAll('.capital-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const val = parseFloat(chip.getAttribute('data-val'));
        this.capital = val;
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
          p.classList.add('bg-[#090D14]', 'border-white/10', 'text-[#94A3B8]');
        });
        pill.classList.add('bg-[#00D2FF]/20', 'border-[#00D2FF]', 'text-[#00D2FF]');
        pill.classList.remove('bg-[#090D14]', 'border-white/10', 'text-[#94A3B8]');
        this.runSimulation();
      });
    });

    // Weight sliders & number inputs
    const syncWeights = (code, val) => {
      this.weights[code] = Math.max(0, Math.min(100, val)) / 100;
      let sum = 0;
      Object.values(this.weights).forEach(w => sum += (w * 100));
      const badge = document.getElementById('simsim-weight-sum-badge');
      if (badge) {
        badge.textContent = `Total: ${Math.round(sum)}%`;
        if (Math.round(sum) === 100) {
          badge.className = 'text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#00F090]/10 text-[#00F090] border border-[#00F090]/30';
        } else {
          badge.className = 'text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#FFB800]/10 text-[#FFB800] border border-[#FFB800]/30';
        }
      }
    };

    document.querySelectorAll('.weight-slider').forEach(slider => {
      slider.addEventListener('input', (e) => {
        const code = Number(slider.getAttribute('data-code'));
        const val = parseFloat(e.target.value) || 0;
        const numInput = document.querySelector(`.weight-number[data-code="${code}"]`);
        if (numInput) numInput.value = val;
        syncWeights(code, val);
      });
      slider.addEventListener('change', () => this.runSimulation());
    });

    document.querySelectorAll('.weight-number').forEach(input => {
      input.addEventListener('input', (e) => {
        const code = Number(input.getAttribute('data-code'));
        const val = parseFloat(e.target.value) || 0;
        const slider = document.querySelector(`.weight-slider[data-code="${code}"]`);
        if (slider) slider.value = val;
        syncWeights(code, val);
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

    // Top action buttons
    const exitBtn = document.getElementById('simsim-exit-btn');
    if (exitBtn) exitBtn.addEventListener('click', () => this.disableSimSimMode());

    const clearBtn = document.getElementById('simsim-clear-btn');
    if (clearBtn) clearBtn.addEventListener('click', () => this.clearBucket());

    const eqBtn = document.getElementById('simsim-equal-weight-btn');
    if (eqBtn) eqBtn.addEventListener('click', () => this.equalizeWeights());

    const runBtn = document.getElementById('simsim-run-btn');
    if (runBtn) runBtn.addEventListener('click', () => this.runSimulation());

    // Curated model presets
    document.querySelectorAll('.model-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.getAttribute('data-preset');
        this.loadTemplate(preset);
      });
    });

    // Inline search to add schemes
    const searchInput = document.getElementById('simsim-add-search-input');
    const searchResults = document.getElementById('simsim-search-results');

    if (searchInput && searchResults) {
      searchInput.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();
        if (q.length < 2) {
          searchResults.classList.add('hidden');
          return;
        }

        const matches = (this.app.allFunds || []).filter(f => 
          !this.isInBucket(f.code) &&
          (f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q) || f.fund_house.toLowerCase().includes(q))
        ).slice(0, 5);

        if (matches.length === 0) {
          searchResults.innerHTML = `<p class="p-2 text-[11px] text-[#94A3B8]">No schemes found.</p>`;
          searchResults.classList.remove('hidden');
          return;
        }

        searchResults.innerHTML = matches.map(f => `
          <div class="p-2 bg-[#121824] hover:bg-[#192132] border border-white/10 rounded-lg flex items-center justify-between cursor-pointer touch-spring add-match-item" data-code="${f.code}">
            <div class="min-w-0 pr-2">
              <p class="text-xs font-bold text-white truncate">${f.name.split(' - Direct')[0]}</p>
              <p class="text-[10px] text-[#94A3B8]">${f.category} • ${f.fund_house}</p>
            </div>
            <span class="material-symbols-outlined text-sm text-[#00F090]">add_circle</span>
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
  }

  /**
   * Renders the simulation calculation results & Chart.js graph
   */
  renderSimulationResults(res) {
    const container = document.getElementById('simsim-results-container');
    if (!container) return;

    if (!res) {
      container.innerHTML = `
        <div class="simsim-card p-12 text-center text-[#94A3B8]">
          <span class="material-symbols-outlined text-4xl text-[#64748B] mb-2">query_stats</span>
          <p class="text-sm font-bold text-white">No Simulation Results Available</p>
          <p class="text-xs mt-1">Please add funds to your bucket and click 'Simulate Portfolio'.</p>
        </div>
      `;
      return;
    }

    const isProfit = res.totalGain >= 0;
    const gainPrefix = isProfit ? '+' : '';
    const gainColor = isProfit ? 'text-[#00F090]' : 'text-[#FF4D4D]';

    container.innerHTML = `
      <div class="space-y-5">
        
        <!-- Big Present Value Headline Card -->
        <div class="simsim-card simsim-card-glow p-6 relative overflow-hidden">
          <div class="flex flex-wrap items-center justify-between gap-4 relative z-10">
            <div>
              <span class="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block mb-1">
                ${res.type === 'lumpsum' ? 'Present Portfolio Value' : 'Accumulated Wealth Value'} (as of Today)
              </span>
              <div class="flex items-baseline gap-3">
                <h1 class="font-display-financial text-3xl sm:text-4xl lg:text-5xl font-black ${gainColor} tracking-tight">
                  ₹${Math.round(res.presentValue).toLocaleString('en-IN')}
                </h1>
                <span class="text-sm sm:text-base font-bold font-mono px-2.5 py-1 rounded-full ${isProfit ? 'bg-[#00F090]/15 text-[#00F090] border border-[#00F090]/30' : 'bg-[#FF4D4D]/15 text-[#FF4D4D] border border-[#FF4D4D]/30'}">
                  ${gainPrefix}₹${Math.round(res.totalGain).toLocaleString('en-IN')} (${gainPrefix}${res.totalGainPct.toFixed(1)}%)
                </span>
              </div>
            </div>

            <div class="text-right">
              <span class="text-[11px] font-bold text-[#94A3B8] block">Simulation Period:</span>
              <span class="text-xs font-mono font-bold text-white">${res.startDate} to ${res.endDate}</span>
              <span class="text-[11px] text-[#00D2FF] font-semibold block mt-0.5">(${res.years} Years Elapsed)</span>
            </div>
          </div>
        </div>

        <!-- 4 Institutional KPI Metric Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          <!-- Card 1: Annualized Return -->
          <div class="simsim-card p-4">
            <div class="flex items-center gap-1.5 text-[#94A3B8] mb-1">
              <span class="material-symbols-outlined text-sm text-[#00F090]">trending_up</span>
              <span class="text-[10px] font-bold uppercase tracking-wider">${res.type === 'lumpsum' ? 'Annualized CAGR' : 'Internal Rate (XIRR)'}</span>
            </div>
            <p class="font-display-financial text-lg sm:text-xl font-bold ${gainColor}">
              ${gainPrefix}${res.cagr.toFixed(2)}% <span class="text-xs text-[#94A3B8] font-normal">p.a.</span>
            </p>
            <p class="text-[10px] text-[#64748B] mt-1">Compounded annual growth</p>
          </div>

          <!-- Card 2: Alpha vs Benchmark -->
          <div class="simsim-card p-4">
            <div class="flex items-center gap-1.5 text-[#94A3B8] mb-1">
              <span class="material-symbols-outlined text-sm text-[#00D2FF]">military_tech</span>
              <span class="text-[10px] font-bold uppercase tracking-wider">Alpha vs Nifty</span>
            </div>
            <p class="font-display-financial text-lg sm:text-xl font-bold ${res.alpha >= 0 ? 'text-[#00D2FF]' : 'text-[#FF4D4D]'}">
              ${res.alpha >= 0 ? '+' : ''}${res.alpha.toFixed(2)}%
            </p>
            <p class="text-[10px] text-[#64748B] mt-1">Outperformance vs market</p>
          </div>

          <!-- Card 3: Max Drawdown -->
          <div class="simsim-card p-4">
            <div class="flex items-center gap-1.5 text-[#94A3B8] mb-1">
              <span class="material-symbols-outlined text-sm text-[#FF4D4D]">shield</span>
              <span class="text-[10px] font-bold uppercase tracking-wider">Max Drawdown</span>
            </div>
            <p class="font-display-financial text-lg sm:text-xl font-bold text-[#FF4D4D]">
              ${res.maxDrawdown > 0 ? `-${res.maxDrawdown.toFixed(2)}%` : '0.00%'}
            </p>
            <p class="text-[10px] text-[#64748B] mt-1">Worst peak-to-trough drop</p>
          </div>

          <!-- Card 4: Capital Put In -->
          <div class="simsim-card p-4">
            <div class="flex items-center gap-1.5 text-[#94A3B8] mb-1">
              <span class="material-symbols-outlined text-sm text-[#FFB800]">savings</span>
              <span class="text-[10px] font-bold uppercase tracking-wider">Total Invested</span>
            </div>
            <p class="font-display-financial text-lg sm:text-xl font-bold text-white">
              ₹${Math.round(res.totalCapital).toLocaleString('en-IN')}
            </p>
            <p class="text-[10px] text-[#64748B] mt-1">${res.type === 'lumpsum' ? 'One-time principal' : `${res.installmentsCount || 0} installments`}</p>
          </div>

        </div>

        <!-- Interactive Chart.js Dual Area Chart -->
        <div class="simsim-card p-5 space-y-3">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 class="text-xs font-bold uppercase tracking-wider text-white">Historical Wealth Trajectory</h3>
              <p class="text-[11px] text-[#94A3B8]">Your Portfolio vs Nifty 50 TRI Benchmark</p>
            </div>
            <div class="flex items-center gap-4 text-xs font-bold">
              <div class="flex items-center gap-1.5">
                <span class="w-3 h-3 rounded-full bg-[#00F090]"></span>
                <span class="text-white">SimSim Portfolio</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="w-3 h-0.5 bg-[#00D2FF]"></span>
                <span class="text-[#00D2FF]">Nifty TRI Proxy</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="w-3 h-0.5 bg-[#FFB800]"></span>
                <span class="text-[#FFB800]">Invested Capital</span>
              </div>
            </div>
          </div>

          <div class="simsim-chart-wrap p-2 h-[320px] w-full relative">
            <canvas id="simsim-chart-canvas"></canvas>
          </div>
        </div>

        <!-- Constituent Funds Breakdown Table -->
        <div class="simsim-card overflow-hidden">
          <div class="p-4 border-b border-white/10 bg-[#0C1018]">
            <h3 class="text-xs font-bold uppercase tracking-wider text-white">Constituent Scheme Performance Breakdown</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="simsim-table">
              <thead>
                <tr>
                  <th class="text-left">Scheme</th>
                  <th class="text-center">Weight</th>
                  <th class="text-right">Capital Put In</th>
                  <th class="text-right">Present Value</th>
                  <th class="text-right">Wealth Gain</th>
                  <th class="text-right">${res.type === 'lumpsum' ? 'CAGR' : 'Return'}</th>
                </tr>
              </thead>
              <tbody>
                ${res.constituents.map(c => `
                  <tr>
                    <td class="font-bold text-white">
                      <div>${c.name}</div>
                      <span class="text-[10px] text-[#94A3B8] font-normal">${c.category} • ${c.fund_house}</span>
                    </td>
                    <td class="text-center font-mono text-white">${c.weightPct}%</td>
                    <td class="text-right font-mono text-[#94A3B8]">₹${Math.round(c.allocatedCap).toLocaleString('en-IN')}</td>
                    <td class="text-right font-mono font-bold text-white">₹${Math.round(c.presentValue).toLocaleString('en-IN')}</td>
                    <td class="text-right font-mono font-bold ${c.gain >= 0 ? 'text-[#00F090]' : 'text-[#FF4D4D]'}">
                      ${c.gain >= 0 ? '+' : ''}₹${Math.round(c.gain).toLocaleString('en-IN')} (${c.gain >= 0 ? '+' : ''}${c.gainPct.toFixed(1)}%)
                    </td>
                    <td class="text-right font-mono font-bold ${c.cagr >= 0 ? 'text-[#00F090]' : 'text-[#FF4D4D]'}">
                      ${c.cagr >= 0 ? '+' : ''}${c.cagr.toFixed(2)}%
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;

    this.renderChart(res);
  }

  /**
   * Renders the dynamic neon Chart.js area chart
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
    const emeraldGrad = ctx.createLinearGradient(0, 0, 0, 300);
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
            backgroundColor: 'rgba(12, 16, 24, 0.95)',
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
