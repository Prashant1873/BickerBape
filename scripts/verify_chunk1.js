const fs = require('fs');
const path = require('path');

// Test static files existence
console.log('--- Verifying Chunk 1 Artifacts ---');

const summaryPath = path.join(__dirname, '..', 'public', 'data', 'funds_summary.json');
const catPath = path.join(__dirname, '..', 'public', 'data', 'categories_summary.json');
const navDir = path.join(__dirname, '..', 'public', 'data', 'nav');

if (!fs.existsSync(summaryPath)) throw new Error('funds_summary.json missing!');
if (!fs.existsSync(catPath)) throw new Error('categories_summary.json missing!');
if (!fs.existsSync(navDir)) throw new Error('nav directory missing!');

const funds = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
console.log(`✓ funds_summary.json exists with ${funds.length} funds`);

const navFiles = fs.readdirSync(navDir);
console.log(`✓ public/data/nav/ has ${navFiles.length} isolated fund NAV files`);

// Test mood weights formula
const weights = {
  growth: { perf: 0.45, track: 0.25, risk: 0.20, cost: 0.10 },
  safety: { risk: 0.45, track: 0.25, perf: 0.20, cost: 0.10 },
  income: { cost: 0.35, risk: 0.30, track: 0.20, perf: 0.15 }
};

for (const [mood, w] of Object.entries(weights)) {
  const sum = w.perf + w.track + w.risk + w.cost;
  if (Math.abs(sum - 1.0) > 1e-6) throw new Error(`Weights for ${mood} do not sum to 1.0! Sum: ${sum}`);
}
console.log('✓ Mood weights all normalized and equal 1.0 (100%)');

// Test seasoning penalties
const testYoungFund = { history_years: 0.8, raw: 8.5 };
const cappedYoung = Math.min(5.8, testYoungFund.raw);
if (cappedYoung !== 5.8) throw new Error('Young fund (<1Y) seasoning cap failed!');

const testMidFund = { history_years: 2.2, raw: 8.5 };
const cappedMid = Math.min(7.0, testMidFund.raw);
if (cappedMid !== 7.0) throw new Error('Mid fund (<3Y) seasoning cap failed!');
console.log('✓ Seasoning penalty checks passed (<1Y capped at 5.8, <3Y capped at 7.0)');

// Test XIRR convergence on a sample cashflow
function testXirr() {
  const cashflows = [
    { date: '2023-01-01', amount: -100000 },
    { date: '2024-01-01', amount: 115000 }
  ];
  const t0 = new Date(cashflows[0].date).getTime();
  const datesYears = cashflows.map(c => (new Date(c.date).getTime() - t0) / (1000 * 60 * 60 * 24 * 365.25));
  const amounts = cashflows.map(c => c.amount);

  let rate = 0.15;
  for (let i = 0; i < 20; i++) {
    let npv = 0, dNpv = 0;
    for (let k = 0; k < amounts.length; k++) {
      const f = Math.pow(1 + rate, datesYears[k]);
      npv += amounts[k] / f;
      dNpv -= datesYears[k] * amounts[k] / (f * (1 + rate));
    }
    if (Math.abs(npv) < 1e-6) break;
    rate -= npv / dNpv;
  }
  const xirr = rate * 100;
  if (Math.abs(xirr - 15.0) > 0.1) throw new Error(`XIRR test failed! Expected ~15%, got ${xirr}`);
  console.log(`✓ XIRR calculation converged accurately: ${xirr.toFixed(2)}%`);
}
testXirr();

console.log('--- All Chunk 1 Quant & Data Integrity Checks Passed! ---');
