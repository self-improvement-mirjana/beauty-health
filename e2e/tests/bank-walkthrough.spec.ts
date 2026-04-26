/**
 * Bank admin app — full walkthrough sa screenshotima.
 *
 * Pokriva sve funkcionalnosti bank-admin UI:
 *   B01  login, dashboard, layout
 *   B02  klijenti: lista, novi klijent modal, detalji klijenta, kartice
 *   B03  merchant-i: lista, novi merchant modal, detalji, RSA/HMAC kredencijali
 *   B04  transakcije (lista + filter)
 *   B05  audit log
 *   B06  hosted payment page (error prikaz)
 *   B07  odjava
 *
 * Pokretanje:
 *   # Headless:
 *   cd beauty-health/e2e && npx playwright test tests/bank-walkthrough.spec.ts
 *
 *   # Headed (live demo):
 *   PLAYWRIGHT_SLOW_MO=400 WALKTHROUGH_PAUSE_MS=2000 \
 *     npx playwright test tests/bank-walkthrough.spec.ts --headed
 *
 * Preduslov:
 *   docker compose up (postgres + backend + postgres-bank + bank) iz beauty-health/
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync } from 'node:fs';

import { expect, test, type Page } from '@playwright/test';

const BANK_API = process.env.PLAYWRIGHT_BANK_API_URL ?? 'http://localhost:8090';
const BANK_ADMIN = process.env.PLAYWRIGHT_BANK_ADMIN_URL ?? 'http://localhost:5175';

const PAUSE_MS = Number.parseInt(process.env.WALKTHROUGH_PAUSE_MS ?? '1000', 10);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHOTS_DIR = path.resolve(__dirname, '..', 'screenshots', 'bank');

const ADMIN_EMAIL = 'admin@banka.local';
const ADMIN_PASSWORD = 'admin123';

let shotIndex = 0;
function nextShotName(name: string): string {
  shotIndex += 1;
  return `${String(shotIndex).padStart(2, '0')}_${name}.png`;
}

async function pause(page: Page, ms: number = PAUSE_MS) {
  await page.waitForTimeout(ms);
}

async function shot(page: Page, name: string, fullPage = false): Promise<string> {
  const fname = nextShotName(name);
  const out = path.join(SHOTS_DIR, fname);
  await page.screenshot({ path: out, fullPage });
  console.log(`    [${String(shotIndex).padStart(2, '0')}] ${fname}`);
  return out;
}

/**
 * Close all modals by navigating to same page (clean slate).
 * React overlay modals use state, so reloading guarantees no stale modals.
 */
async function clearModals(page: Page): Promise<void> {
  const url = page.url();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
}

/**
 * Click the topmost "Zatvori" or "Otkaži" button visible on the page.
 */
async function clickCloseButton(page: Page): Promise<boolean> {
  const zatvori = page.locator('button:has-text("Zatvori")');
  if (await zatvori.count() > 0) {
    await zatvori.last().click();
    await page.waitForTimeout(400);
    return true;
  }
  const otkazi = page.locator('button:has-text("Otkaži")');
  if (await otkazi.count() > 0) {
    await otkazi.last().click();
    await page.waitForTimeout(400);
    return true;
  }
  return false;
}

async function loginToBank(page: Page): Promise<void> {
  await page.goto(`${BANK_ADMIN}/login`, { waitUntil: 'networkidle' });
  await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
  await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: /Prijavi/i }).click();
  await page.waitForURL((u) => !u.pathname.endsWith('/login'), { timeout: 15_000 });
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
}

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
  mkdirSync(SHOTS_DIR, { recursive: true });
});

test('banka: full walkthrough svih ekrana sa screenshotima', async ({ browser }) => {
  test.setTimeout(10 * 60_000);

  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    locale: 'sr-Latn-RS',
  });
  const page = await ctx.newPage();

  // ============================================================
  // B01 — Login + Dashboard
  // ============================================================
  await test.step('B01: Login — prazna forma', async () => {
    await page.goto(`${BANK_ADMIN}/login`, { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: /Banka/i })).toBeVisible();
    await pause(page);
    await shot(page, 'b01_login_prazna');
  });

  await test.step('B01: Login — popunjena forma', async () => {
    await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
    await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
    await pause(page);
    await shot(page, 'b01_login_popunjeno');
  });

  await test.step('B01: Submit → Dashboard', async () => {
    await page.getByRole('button', { name: /Prijavi/i }).click();
    await page.waitForURL((u) => !u.pathname.endsWith('/login'), { timeout: 15_000 });
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await pause(page);
    await shot(page, 'b01_dashboard');
  });

  // ============================================================
  // B02 — Klijenti
  // ============================================================
  await test.step('B02: Klijenti — lista', async () => {
    await page.goto(`${BANK_ADMIN}/clients`, { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Klijenti' })).toBeVisible();
    await page.waitForTimeout(500);
    await pause(page);
    await shot(page, 'b02_klijenti_lista', true);
  });

  await test.step('B02: "Novi klijent" modal', async () => {
    await page.getByRole('button', { name: /Novi klijent/i }).click();
    await page.waitForTimeout(300);
    await page.locator('input[placeholder="Ime i prezime"]').fill('Playwright Kupac');
    await page.locator('input[placeholder="Email"]').fill('playwright@kupac.rs');
    await pause(page);
    await shot(page, 'b02_novi_klijent_modal');
  });

  await test.step('B02: Zatvori modal i otvori detalje klijenta', async () => {
    // Navigate away to clear modal state cleanly
    await page.goto(`${BANK_ADMIN}/clients`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // Click "Detalji" on first client
    const detailBtn = page.locator('button:has-text("Detalji")').first();
    await detailBtn.click();
    await page.waitForTimeout(500);
    await pause(page);
    await shot(page, 'b02_klijent_detalji');
  });

  await test.step('B02: Zatvori klijent detalje', async () => {
    await page.goto(`${BANK_ADMIN}/clients`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
  });

  // ============================================================
  // B03 — Merchant-i
  // ============================================================
  await test.step('B03: Merchant-i — lista', async () => {
    await page.goto(`${BANK_ADMIN}/merchants`, { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Merchant-i' })).toBeVisible();
    await page.waitForTimeout(500);
    await pause(page);
    await shot(page, 'b03_merchanti_lista', true);
  });

  await test.step('B03: "Novi merchant" modal', async () => {
    await page.getByRole('button', { name: /Novi merchant/i }).click();
    await page.waitForTimeout(300);
    await page.locator('input[placeholder="Naziv"]').fill('Demo Shop');
    await page.locator('input[placeholder="Slug"]').fill('demo-shop-pw');
    await page.locator('input[placeholder="Webhook URL"]').fill('http://localhost:9999/hook');
    await pause(page);
    await shot(page, 'b03_novi_merchant_modal');
  });

  await test.step('B03: Merchant detalji (beauty-health)', async () => {
    await page.goto(`${BANK_ADMIN}/merchants`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const detailBtn = page.locator('button:has-text("Detalji")').first();
    await detailBtn.click();
    await page.waitForTimeout(800);
    await pause(page);
    await shot(page, 'b03_merchant_detalji', true);
  });

  await test.step('B03: Izdaj RSA kredencijal', async () => {
    const issueRsa = page.locator('button:has-text("Izdaj RSA")');
    if (await issueRsa.isVisible()) {
      await issueRsa.click();
      await page.waitForTimeout(2500);
      await pause(page);
      await shot(page, 'b03_rsa_izdat', true);
    }
  });

  await test.step('B03: Kopiraj RSA i izdaj HMAC', async () => {
    const copyBtn = page.locator('button:has-text("Kopiraj")');
    if (await copyBtn.isVisible()) {
      await copyBtn.click();
      await page.waitForTimeout(500);
    }
    const issueHmac = page.locator('button:has-text("Izdaj HMAC")');
    if (await issueHmac.isVisible()) {
      await issueHmac.click();
      await page.waitForTimeout(2500);
      await pause(page);
      await shot(page, 'b03_hmac_izdat', true);
    }
  });

  // ============================================================
  // B04 — Transakcije
  // ============================================================
  await test.step('B04: Transakcije — lista', async () => {
    await page.goto(`${BANK_ADMIN}/transactions`, { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Transakcije' })).toBeVisible();
    await page.waitForTimeout(500);
    await pause(page);
    await shot(page, 'b04_transakcije_lista', true);
  });

  await test.step('B04: Transakcije — filter', async () => {
    const select = page.locator('select');
    if (await select.isVisible()) {
      await select.selectOption('AUTHORIZED');
      await page.waitForTimeout(800);
      await pause(page);
      await shot(page, 'b04_transakcije_filter');
      await select.selectOption('');
      await page.waitForTimeout(400);
    }
  });

  // ============================================================
  // B05 — Audit Log
  // ============================================================
  await test.step('B05: Audit Log', async () => {
    await page.goto(`${BANK_ADMIN}/audit`, { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Audit Log' })).toBeVisible();
    await page.waitForTimeout(500);
    await pause(page);
    await shot(page, 'b05_audit_log', true);
  });

  // ============================================================
  // B06 — Hosted Payment Page
  // ============================================================
  await test.step('B06: Hosted Payment Page — error za nepostojeci ref', async () => {
    await page.goto(`${BANK_ADMIN}/pay/nonexistent-12345`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await pause(page);
    await shot(page, 'b06_hosted_page_error');
  });

  // ============================================================
  // B07 — Odjava
  // ============================================================
  await test.step('B07: Login ponovo + odjava', async () => {
    await loginToBank(page);
    await page.waitForTimeout(300);
    await shot(page, 'b07_dashboard_pre_odjave');
    const logoutBtn = page.locator('button:has-text("Odjavi")');
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      await page.waitForURL(/\/login/, { timeout: 5000 });
      await expect(page.getByRole('heading', { name: /Banka/i })).toBeVisible();
      await pause(page);
      await shot(page, 'b07_odjava');
    }
  });

  await ctx.close();

  console.log(`\n  Saved ${shotIndex} screenshots to: ${SHOTS_DIR}`);
});
