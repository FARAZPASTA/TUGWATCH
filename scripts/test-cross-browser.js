/**
 * TugWatch Automated Multi-Browser Verification Test
 * Tests Master Authentication & Cross-Browser Account Access
 */
const { chromium, firefox, webkit } = require('playwright');
const path = require('path');

async function testBrowser(browserType, name) {
  console.log(`Testing on ${name}...`);
  const browser = await browserType.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const fileUrl = 'file://' + path.resolve(__dirname, '..', 'public', 'index.html');
  await page.goto(fileUrl);

  // 1. Verify Login Form Renders
  await page.waitForSelector('#l-user', { timeout: 5000 });
  await page.waitForSelector('#l-pass', { timeout: 5000 });

  // 2. Perform Master Login
  await page.fill('#l-user', 'FARAZ');
  await page.fill('#l-pass', 'ocaptain');
  await page.click('#login-btn');

  // 3. Verify Landing on Dashboard
  await page.waitForSelector('#p-dashboard', { state: 'visible', timeout: 5000 });
  console.log(`  ✓ ${name}: Master login successful & landed on Dashboard.`);

  await browser.close();
}

async function run() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🌐  TUGWATCH MULTI-BROWSER PLAYWRIGHT TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════\n');
  try {
    await testBrowser(chromium, 'Google Chrome (Chromium)');
    await testBrowser(firefox, 'Mozilla Firefox');
    await testBrowser(webkit, 'Apple Safari (WebKit)');
    console.log('\n✅ ALL BROWSERS VERIFIED SUCCESSFULLY!\n');
  } catch (e) {
    console.error('\n❌ Cross-browser test failed:', e);
    process.exit(1);
  }
}

if (require.main === module) {
  run();
}
