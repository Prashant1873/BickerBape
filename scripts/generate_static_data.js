const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_FUNDS_FILE = path.join(ROOT_DIR, 'data', 'equity_funds.json');
const SRC_CAT_FILE = path.join(ROOT_DIR, 'data', 'categories_summary.json');

const PUBLIC_DATA_DIR = path.join(ROOT_DIR, 'public', 'data');
const NAV_DIR = path.join(PUBLIC_DATA_DIR, 'nav');

async function main() {
  console.log('--- Generating Static Data for Next.js Static Export ---');

  if (!fs.existsSync(NAV_DIR)) {
    fs.mkdirSync(NAV_DIR, { recursive: true });
  }

  console.log('Reading data/equity_funds.json...');
  const fundsRaw = fs.readFileSync(SRC_FUNDS_FILE, 'utf8');
  const funds = JSON.parse(fundsRaw);
  console.log(`Loaded ${funds.length} funds. Raw size: ${(fundsRaw.length / 1024 / 1024).toFixed(2)} MB`);

  const fundsSummary = [];
  let totalNavPoints = 0;

  for (const fund of funds) {
    const { nav_history, ...summary } = fund;

    // Save individual fund NAV history
    const navFilePath = path.join(NAV_DIR, `${fund.code}.json`);
    const navData = {
      code: fund.code,
      name: fund.name,
      category: fund.category,
      latest_nav: fund.latest_nav,
      nav_date: fund.nav_date,
      nav_history: nav_history || []
    };
    fs.writeFileSync(navFilePath, JSON.stringify(navData));
    totalNavPoints += (nav_history ? nav_history.length : 0);

    fundsSummary.push(summary);
  }

  // Write funds summary
  const summaryFilePath = path.join(PUBLIC_DATA_DIR, 'funds_summary.json');
  const summaryJson = JSON.stringify(fundsSummary);
  fs.writeFileSync(summaryFilePath, summaryJson);
  console.log(`Saved funds_summary.json. New size: ${(summaryJson.length / 1024).toFixed(2)} KB (vs ${(fundsRaw.length / 1024 / 1024).toFixed(2)} MB!)`);
  console.log(`Generated ${funds.length} individual NAV files in public/data/nav/ with ${totalNavPoints.toLocaleString()} total data points.`);

  // Copy categories_summary.json
  if (fs.existsSync(SRC_CAT_FILE)) {
    const catData = fs.readFileSync(SRC_CAT_FILE, 'utf8');
    fs.writeFileSync(path.join(PUBLIC_DATA_DIR, 'categories_summary.json'), catData);
    console.log('Copied categories_summary.json to public/data/');
  }

  console.log('--- Static data generation complete! ---');
}

main().catch(err => {
  console.error('Error generating static data:', err);
  process.exit(1);
});
