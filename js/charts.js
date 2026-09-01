/**
 * BickerBape Chart.js Visualization Engine
 * Renders high-performance, responsive financial charts:
 * 1. Historical NAV Chart (with 1Y, 3Y, 5Y, Max horizons)
 * 2. 3-Year Rolling Return Curve vs Category Benchmark
 * 3. Returns vs Sub-Category Bar Chart (Fund vs Category Avg vs Nifty)
 * 4. Risk-Reward Scatter Quadrant (Sharpe Ratio vs Volatility)
 * 5. Multi-Fund Comparison Overlay
 */

export class ChartEngine {
  static instances = {};

  /**
   * Destroys existing chart instance on a canvas if present
   */
  static cleanup(canvasId) {
    if (this.instances[canvasId]) {
      this.instances[canvasId].destroy();
      delete this.instances[canvasId];
    }
  }

  /**
   * 1. Historical NAV Chart
   */
  static renderNavChart(canvasId, navHistory, horizon = 'ALL') {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !navHistory || !navHistory.length) return;
    this.cleanup(canvasId);

    // Filter points based on selected horizon
    let points = [...navHistory];
    const latestDate = new Date(points[points.length - 1].date);
    if (horizon === '3M') {
      const cutoff = new Date(latestDate);
      cutoff.setMonth(cutoff.getMonth() - 3);
      points = points.filter(p => new Date(p.date) >= cutoff);
      if (points.length < 3) {
        points = navHistory.slice(-15);
      }
    } else if (horizon === '1Y') {
      const cutoff = new Date(latestDate);
      cutoff.setFullYear(cutoff.getFullYear() - 1);
      points = points.filter(p => new Date(p.date) >= cutoff);
    } else if (horizon === '3Y') {
      const cutoff = new Date(latestDate);
      cutoff.setFullYear(cutoff.getFullYear() - 3);
      points = points.filter(p => new Date(p.date) >= cutoff);
    } else if (horizon === '5Y') {
      const cutoff = new Date(latestDate);
      cutoff.setFullYear(cutoff.getFullYear() - 5);
      points = points.filter(p => new Date(p.date) >= cutoff);
    }

    // Update growth headline text
    const growthHeadline = document.getElementById('drawer-growth-headline');
    if (growthHeadline && points.length >= 2) {
      const startNav = points[0].nav;
      const endNav = points[points.length - 1].nav;
      const changePct = (((endNav - startNav) / startNav) * 100).toFixed(2);
      const isPositive = changePct >= 0;
      growthHeadline.innerHTML = `Growth in ${horizon}: <strong class="${isPositive ? 'text-[#36B37E]' : 'text-[#FF5630]'}">${isPositive ? '+' : ''}${changePct}%</strong> (${points[0].date} to ${points[points.length - 1].date})`;
    }

    const labels = points.map(p => p.date);
    const dataVals = points.map(p => p.nav);

    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 240);
    gradient.addColorStop(0, 'rgba(0, 82, 204, 0.22)');
    gradient.addColorStop(1, 'rgba(0, 82, 204, 0.00)');

    this.instances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'NAV (₹)',
          data: dataVals,
          borderColor: '#0052cc',
          borderWidth: 2.2,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#003d9b',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 2,
          backgroundColor: gradient,
          fill: true,
          tension: 0.2
        }]
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
            backgroundColor: '#172B4D',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            titleFont: { family: 'Hanken Grotesk', weight: '700' },
            bodyFont: { family: 'Hanken Grotesk' },
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (ctx) => `NAV: ₹${ctx.parsed.y.toFixed(2)}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              maxTicksLimit: 6,
              font: { family: 'Hanken Grotesk', size: 11 },
              color: '#737685'
            }
          },
          y: {
            grid: { color: 'rgba(237, 238, 240, 0.75)' },
            ticks: {
              font: { family: 'Hanken Grotesk', size: 11 },
              color: '#737685',
              callback: (val) => `₹${val}`
            }
          }
        }
      }
    });
  }

  /**
   * 2. 3-Year Rolling Returns Curve vs Category Benchmark
   */
  static renderRollingChart(canvasId, rollingSeries, categoryAvgRolling = 16.0) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    this.cleanup(canvasId);

    const series = rollingSeries || [];
    const labels = series.map(s => s.date);
    const fundValues = series.map(s => s.rolling_return);
    const benchmarkValues = series.map(() => categoryAvgRolling);
    const inflationLine = series.map(() => 12.0); // 12% wealth compounding threshold

    const ctx = canvas.getContext('2d');
    this.instances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: '3Y Rolling Return (%)',
            data: fundValues,
            borderColor: '#36B37E',
            borderWidth: 2.4,
            pointRadius: 0,
            pointHoverRadius: 5,
            tension: 0.25,
            fill: false
          },
          {
            label: `Category Avg (${categoryAvgRolling}%)`,
            data: benchmarkValues,
            borderColor: '#FF9F0A',
            borderWidth: 1.8,
            borderDash: [5, 4],
            pointRadius: 0,
            fill: false
          },
          {
            label: '12% Compounding Target',
            data: inflationLine,
            borderColor: '#c3c6d6',
            borderWidth: 1.5,
            borderDash: [3, 3],
            pointRadius: 0,
            fill: false
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
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12,
              font: { family: 'Hanken Grotesk', size: 11, weight: '600' },
              color: '#434654'
            }
          },
          tooltip: {
            backgroundColor: '#172B4D',
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)}%`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              maxTicksLimit: 6,
              font: { family: 'Hanken Grotesk', size: 11 },
              color: '#737685'
            }
          },
          y: {
            grid: { color: 'rgba(237, 238, 240, 0.75)' },
            ticks: {
              font: { family: 'Hanken Grotesk', size: 11 },
              color: '#737685',
              callback: (val) => `${val}%`
            }
          }
        }
      }
    });
  }

  /**
   * 3. Performance vs Sub-Category Bar Chart (Fund vs Category Avg vs Nifty 50)
   */
  static renderCategoryBarChart(canvasId, fund, catStats) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    this.cleanup(canvasId);

    const labels = ['3-Year CAGR', '5-Year CAGR', '10-Year CAGR'];
    const fundData = [
      fund.cagr_3y || 0,
      fund.cagr_5y || 0,
      fund.cagr_10y || 0
    ];
    const catData = [
      catStats.avg_3y_cagr || 15.0,
      catStats.avg_5y_cagr || 14.0,
      catStats.avg_10y_cagr || 13.5
    ];
    const niftyBenchmark = [14.8, 15.2, 13.9]; // Nifty 50 TRI benchmark reference

    const ctx = canvas.getContext('2d');
    this.instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: fund.name.split(' - ')[0],
            data: fundData,
            backgroundColor: '#0052cc',
            borderRadius: 6
          },
          {
            label: `${fund.category} Average`,
            data: catData,
            backgroundColor: '#709bfe',
            borderRadius: 6
          },
          {
            label: 'Nifty 50 TRI',
            data: niftyBenchmark,
            backgroundColor: '#c3c6d6',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12,
              font: { family: 'Hanken Grotesk', size: 11, weight: '600' },
              color: '#434654'
            }
          },
          tooltip: {
            backgroundColor: '#172B4D',
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)}%`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { family: 'Hanken Grotesk', size: 12, weight: '600' },
              color: '#191c1e'
            }
          },
          y: {
            grid: { color: 'rgba(237, 238, 240, 0.75)' },
            ticks: {
              font: { family: 'Hanken Grotesk', size: 11 },
              color: '#737685',
              callback: (val) => `${val}%`
            }
          }
        }
      }
    });
  }

  /**
   * 4. Risk-Reward Scatter Quadrant (Sharpe Ratio vs Annualized Volatility)
   */
  static renderScatterQuadrant(canvasId, allFunds, selectedFund) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    this.cleanup(canvasId);

    // Group other funds in the category
    const peers = allFunds.filter(f => f.category === selectedFund.category && f.code !== selectedFund.code);
    const peerPoints = peers.map(f => ({
      x: f.volatility || 14,
      y: f.sharpe_ratio || 0.8,
      name: f.name.split(' - ')[0]
    }));

    const selectedPoint = [{
      x: selectedFund.volatility || 14,
      y: selectedFund.sharpe_ratio || 0.8,
      name: selectedFund.name.split(' - ')[0]
    }];

    const ctx = canvas.getContext('2d');
    this.instances[canvasId] = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: selectedFund.name.split(' - ')[0],
            data: selectedPoint,
            backgroundColor: '#36B37E',
            borderColor: '#003d9b',
            borderWidth: 2.5,
            pointRadius: 9,
            pointHoverRadius: 11
          },
          {
            label: `${selectedFund.category} Peers`,
            data: peerPoints,
            backgroundColor: 'rgba(112, 155, 254, 0.65)',
            borderColor: '#0052cc',
            borderWidth: 1,
            pointRadius: 5.5,
            pointHoverRadius: 7
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 10,
              font: { family: 'Hanken Grotesk', size: 11, weight: '600' },
              color: '#434654'
            }
          },
          tooltip: {
            backgroundColor: '#172B4D',
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (ctx) => {
                const item = ctx.raw;
                return `${item.name}: Volatility ${item.x.toFixed(1)}%, Sharpe ${item.y.toFixed(2)}`;
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Volatility / Standard Deviation (%) → (Lower is safer)',
              font: { family: 'Hanken Grotesk', size: 11, weight: '600' },
              color: '#737685'
            },
            grid: { color: 'rgba(237, 238, 240, 0.75)' },
            ticks: {
              font: { family: 'Hanken Grotesk', size: 11 },
              color: '#737685',
              callback: (val) => `${val}%`
            }
          },
          y: {
            title: {
              display: true,
              text: 'Sharpe Ratio (Risk-Adjusted Return) ↑ (Higher is better)',
              font: { family: 'Hanken Grotesk', size: 11, weight: '600' },
              color: '#737685'
            },
            grid: { color: 'rgba(237, 238, 240, 0.75)' },
            ticks: {
              font: { family: 'Hanken Grotesk', size: 11 },
              color: '#737685'
            }
          }
        }
      }
    });
  }

  /**
   * 5. Multi-Fund Comparison Chart
   */
  static renderComparisonChart(canvasId, fundsList) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !fundsList || !fundsList.length) return;
    this.cleanup(canvasId);

    const labels = ['3Y CAGR', '5Y CAGR', '3Y Rolling Avg', 'Sharpe (x10)', 'Volatility'];
    const palette = ['#0052cc', '#36B37E', '#FF9F0A'];

    const datasets = fundsList.map((f, idx) => ({
      label: f.name.split(' - ')[0],
      data: [
        f.cagr_3y || 0,
        f.cagr_5y || 0,
        f.rolling_3y_avg || 0,
        (f.sharpe_ratio || 0) * 10,
        f.volatility || 0
      ],
      backgroundColor: palette[idx % palette.length],
      borderRadius: 6
    }));

    const ctx = canvas.getContext('2d');
    this.instances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12,
              font: { family: 'Hanken Grotesk', size: 11, weight: '600' },
              color: '#434654'
            }
          },
          tooltip: {
            backgroundColor: '#172B4D',
            padding: 10,
            cornerRadius: 8
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Hanken Grotesk', size: 11, weight: '600' }, color: '#191c1e' }
          },
          y: {
            grid: { color: 'rgba(237, 238, 240, 0.75)' },
            ticks: { font: { family: 'Hanken Grotesk', size: 11 }, color: '#737685' }
          }
        }
      }
    });
  }
}
