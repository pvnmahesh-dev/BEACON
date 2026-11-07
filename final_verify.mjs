import puppeteer from 'puppeteer-core';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'http://localhost:5175/';
const ARTIFACT_DIR = 'C:\\Users\\testp\\.gemini\\antigravity\\brain\\95cb5a85-c8e1-4ccb-89ef-f45d428fb337';

async function runFinalVerification() {
  console.log('Launching Chrome from', CHROME_PATH);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  await page.setViewport({ width: 1440, height: 900 });

  console.log('1. Loading Dashboard at', URL);
  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  console.log('  Capturing final_screenshot_dashboard.png');
  await page.screenshot({ path: 'final_screenshot_dashboard.png' });
  fs.copyFileSync('final_screenshot_dashboard.png', `${ARTIFACT_DIR}\\final_screenshot_dashboard.png`);

  // Inspect computed styles
  const styles = await page.evaluate(() => {
    function inspect(selector, name) {
      const el = document.querySelector(selector);
      if (!el) return { name, found: false };
      const comp = window.getComputedStyle(el);
      return {
        name,
        selector,
        found: true,
        className: el.className,
        backgroundColor: comp.backgroundColor,
        color: comp.color,
        border: comp.border,
        boxShadow: comp.boxShadow
      };
    }

    return {
      body: inspect('body', 'body'),
      root: inspect('#root', '#root'),
      wrapper: inspect('#root > div', 'application wrapper'),
      sidebar: inspect('aside', 'sidebar'),
      topHeader: inspect('header', 'top header'),
      heroPanel: inspect('aside + div main > div:first-child', 'hero panel'),
      statisticCards: inspect('aside + div main .grid > div', 'statistic cards'),
      searchInput: inspect('header input[type="text"]', 'search input')
    };
  });
  console.log('Computed styles verified:', JSON.stringify(styles, null, 2));

  // 2. Navigate to Scholarship Discovery
  console.log('2. Navigating to Scholarship Discovery Engine...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('aside nav button'));
    const btn = buttons.find(b => b.textContent.includes('Scholarship Discovery'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'final_screenshot_discovery.png' });
  fs.copyFileSync('final_screenshot_discovery.png', `${ARTIFACT_DIR}\\final_screenshot_discovery.png`);
  console.log('  ✓ Saved final_screenshot_discovery.png');

  // 3. Open Scholarship Detail Modal
  console.log('3. Opening Scholarship Detail Modal...');
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('main .grid > div'));
    if (cards.length > 0) cards[0].click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: 'final_screenshot_modal.png' });
  fs.copyFileSync('final_screenshot_modal.png', `${ARTIFACT_DIR}\\final_screenshot_modal.png`);
  console.log('  ✓ Saved final_screenshot_modal.png');

  // Close modal
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 500));

  // 4. Open Notification Dropdown
  console.log('4. Opening Notification Dropdown...');
  await page.evaluate(() => {
    const bellBtn = document.querySelector('header button[aria-label="View notifications"]');
    if (bellBtn) bellBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: 'final_screenshot_dropdown.png' });
  fs.copyFileSync('final_screenshot_dropdown.png', `${ARTIFACT_DIR}\\final_screenshot_dropdown.png`);
  console.log('  ✓ Saved final_screenshot_dropdown.png');

  // 5. Mobile view
  console.log('5. Capturing Mobile View...');
  await page.setViewport({ width: 375, height: 812 });
  await page.goto(URL, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'final_screenshot_mobile.png' });
  fs.copyFileSync('final_screenshot_mobile.png', `${ARTIFACT_DIR}\\final_screenshot_mobile.png`);
  console.log('  ✓ Saved final_screenshot_mobile.png');

  await browser.close();
  console.log('All screenshots captured and copied successfully!');
}

runFinalVerification().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});

