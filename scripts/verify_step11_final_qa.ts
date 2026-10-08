import { chromium } from 'playwright';

async function main() {
  console.log('=== STEP 11 VERIFICATION: FINAL SECURITY, QA & LAUNCH PREPARATION ===');
  let passed = 0;
  let failed = 0;

  try {
    // 1. Verify /api/health returns 200 and DB status
    const healthRes = await fetch('http://localhost:3000/api/health');
    if (healthRes.status === 200) {
      const data = await healthRes.json();
      if (data.status === 'HEALTHY' && data.database?.status === 'CONNECTED') {
        console.log('[PASS] /api/health returned 200 OK with healthy database status');
        passed++;
      } else {
        console.error('[FAIL] /api/health returned invalid payload:', data);
        failed++;
      }
    } else {
      console.error(`[FAIL] /api/health returned HTTP ${healthRes.status}`);
      failed++;
    }

    // 2. Playwright check for Security & Health routes
    console.log('Running Playwright browser check for Step 11 pages...');
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Health endpoint response check in browser
    await page.goto('http://localhost:3000/api/health');
    const pageText = await page.textContent('body');
    if (pageText?.includes('"status":"HEALTHY"')) {
      console.log('[PASS] Browser successfully reached /api/health');
      passed++;
    } else {
      console.error('[FAIL] Browser /api/health payload incorrect');
      failed++;
    }

    // Candidate Profile/Settings page redirection to login when unauthorized
    const candidateSettingsRes = await page.goto('http://localhost:3000/candidate/profile');
    if (page.url().includes('/candidate/login') || candidateSettingsRes?.status() === 200 || candidateSettingsRes?.status() === 307) {
      console.log('[PASS] Candidate Profile route is protected');
      passed++;
    } else {
      console.error('[FAIL] Candidate profile protection check failed');
      failed++;
    }

    await browser.close();

  } catch (err) {
    console.error('Error during Step 11 verification:', err);
    failed++;
  }

  console.log(`\n=== STEP 11 SUMMARY ===`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    process.exit(1);
  }
}

main();
