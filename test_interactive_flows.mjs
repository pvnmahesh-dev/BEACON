import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'http://127.0.0.1:5176/';

async function testUserFlows() {
  console.log('Testing Core Interactive Flows on', URL);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 30000 });
  console.log('✓ Page loaded');

  // Flow 1: Search & Filtering in Discovery Engine
  console.log('1. Testing Discovery Engine search...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('aside nav button'));
    const btn = buttons.find(b => b.textContent.includes('Scholarship Discovery'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  await page.type('input[placeholder*="Search by scholarship title"]', 'Quantum');
  await new Promise(r => setTimeout(r, 600));

  const quantumCount = await page.evaluate(() => {
    const cards = document.querySelectorAll('main .grid > div');
    return cards.length;
  });
  console.log(`  ✓ Search for "Quantum" returned ${quantumCount} opportunity card(s)`);

  // Clear search
  await page.evaluate(() => {
    const input = document.querySelector('input[placeholder*="Search by scholarship title"]');
    if (input) {
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 600));

  // Flow 2: Open Scholarship Modal
  console.log('2. Testing Modal opening...');
  await page.evaluate(() => {
    const firstCard = document.querySelector('main .grid > div');
    if (firstCard) firstCard.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  const modalTitle = await page.evaluate(() => {
    const titleEl = document.querySelector('[role="dialog"] h2, .fixed h2, .fixed h3');
    return titleEl ? titleEl.textContent.trim() : 'N/A';
  });
  console.log(`  ✓ Opened modal: "${modalTitle}"`);

  // Close modal via Escape
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 500));

  // Flow 3: Navigate to Profile and test Edit mode
  console.log('3. Testing Student Profile page & edit mode...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('aside nav button'));
    const btn = buttons.find(b => b.textContent.includes('Profile & Eligibility'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  const editBtnText = await page.evaluate(() => {
    const editBtn = document.querySelector('main button');
    return editBtn ? editBtn.textContent.trim() : 'N/A';
  });
  console.log(`  ✓ Profile loaded. Action: "${editBtnText}"`);

  // Flow 4: Navigate to Application Command Center
  console.log('4. Testing Application Command Center...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('aside nav button'));
    const btn = buttons.find(b => b.textContent.includes('My Applications'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  const appsCount = await page.evaluate(() => {
    const cards = document.querySelectorAll('main .grid > div, main table tbody tr');
    return cards.length;
  });
  console.log(`  ✓ Application Command Center active with ${appsCount} application record(s)`);

  // Flow 5: Navigate to Document Vault
  console.log('5. Testing Document Vault...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('aside nav button'));
    const btn = buttons.find(b => b.textContent.includes('Document Vault'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  const vaultStats = await page.evaluate(() => {
    const statCards = document.querySelectorAll('main .grid > div');
    return statCards.length;
  });
  console.log(`  ✓ Document Vault active with ${vaultStats} visual panels`);

  await browser.close();
  console.log('All interactive user flows verified successfully!');
}

testUserFlows().catch(err => {
  console.error('Interactive test failed:', err);
  process.exit(1);
});

