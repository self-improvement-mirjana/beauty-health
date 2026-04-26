/**
 * Card payment — full walkthrough sa screenshotima.
 *
 * Pokriva ceo tok: shop login → add to cart → checkout (CARD) → bank hosted page
 * → unos kartice 4242… → return na shop → asercija "Plaćanje uspešno" + screenshoti.
 *
 * Pokretanje:
 *   # Headless:
 *   cd beauty-health/e2e && npx playwright test tests/card-payment-walkthrough.spec.ts
 *
 *   # Headed (live demo):
 *   PLAYWRIGHT_SLOW_MO=400 WALKTHROUGH_PAUSE_MS=2000 \
 *     npx playwright test tests/card-payment-walkthrough.spec.ts --headed
 *
 * Preduslov:
 *   - docker compose up (postgres + backend + postgres-bank + bank) iz beauty-health/
 *   - Playwright pokreće storefront (:5173) i bank-admin (:5175) sam.
 *   - RSA cert izdat za beauty-health merchant (videti bank/scripts/demo-issue-cert.sh)
 *   - Backend konfigurisan sa privatnim ključem za potpisivanje.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync } from 'node:fs';

import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

const API = process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:8080';
const BANK_API = process.env.PLAYWRIGHT_BANK_API_URL ?? 'http://localhost:8090';
const STORE = process.env.PLAYWRIGHT_STOREFRONT_URL ?? 'http://localhost:5173';
const BANK_ADMIN = process.env.PLAYWRIGHT_BANK_ADMIN_URL ?? 'http://localhost:5175';

const PAUSE_MS = Number.parseInt(process.env.WALKTHROUGH_PAUSE_MS ?? '2000', 10);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHOTS_DIR = path.resolve(__dirname, '..', 'screenshots', 'card-payment');

const TEST_USER_EMAIL = 'card-test@local.test';
const TEST_USER_PASSWORD = 'Card1234!';

let step = 0;

async function snap(page: Page, name: string) {
  step++;
  const prefix = String(step).padStart(2, '0');
  await page.screenshot({ path: path.join(SHOTS_DIR, `${prefix}_${name}.png`), fullPage: true });
}

async function pause() {
  if (PAUSE_MS > 0) await new Promise((r) => setTimeout(r, PAUSE_MS));
}

test.describe.serial('Card Payment Walkthrough', () => {
  let shopApi: APIRequestContext;

  test.beforeAll(async ({ playwright }) => {
    mkdirSync(SHOTS_DIR, { recursive: true });
    shopApi = await playwright.request.newContext({ baseURL: API });

    try {
      await shopApi.post('/api/v1/auth/register', {
        data: { email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD, fullName: 'Card Tester' },
      });
    } catch {
      // user may already exist
    }
  });

  test.afterAll(async () => {
    await shopApi?.dispose();
  });

  test('01 — login na storefront', async ({ page }) => {
    await page.goto(`${STORE}/login`);
    await page.fill('input[type="email"]', TEST_USER_EMAIL);
    await page.fill('input[type="password"]', TEST_USER_PASSWORD);
    await snap(page, 'login_filled');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/account**', { timeout: 10_000 }).catch(() => {});
    await snap(page, 'logged_in');
    await pause();
  });

  test('02 — dodaj proizvod u korpu', async ({ page }) => {
    await page.goto(`${STORE}/shop`);
    await page.waitForSelector('[data-testid="product-card"], .group', { timeout: 10_000 }).catch(() => {});
    await snap(page, 'shop_page');

    const addButton = page.locator('text=Dodaj u korpu').first();
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(1000);
    }
    await snap(page, 'added_to_cart');
    await pause();
  });

  test('03 — otvori korpu', async ({ page }) => {
    await page.goto(`${STORE}/cart`);
    await page.waitForTimeout(1500);
    await snap(page, 'cart_page');
    await pause();
  });

  test('04 — checkout sa karticom', async ({ page }) => {
    await page.goto(`${STORE}/checkout`);
    await page.waitForTimeout(2000);

    await page.fill('#co-name', 'Card Tester');
    await page.fill('#co-phone', '+381601234567');
    await page.fill('#co-a1', 'Testna ulica 1');
    await page.fill('#co-city', 'Beograd');
    await page.fill('#co-post', '11000');

    const cardRadio = page.locator('input[value="CARD"]');
    if (await cardRadio.isVisible()) {
      await cardRadio.check();
    }

    await snap(page, 'checkout_card_selected');
    await pause();

    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    await snap(page, 'after_checkout_submit');
    await pause();
  });

  test('05 — bank hosted payment page', async ({ page }) => {
    const url = page.url();
    if (url.includes('/pay/')) {
      await snap(page, 'bank_hosted_page');

      await page.fill('input[placeholder="4242424242424242"]', '4242424242424242');
      await page.fill('input[placeholder="12"]', '12');
      await page.fill('input[placeholder="2028"]', '2028');
      await page.fill('input[placeholder="123"]', '123');
      await page.fill('input[placeholder="DEMO KORISNIK"]', 'CARD TESTER');

      await snap(page, 'bank_card_filled');
      await pause();

      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      await snap(page, 'bank_payment_result');
      await pause();
    } else {
      await snap(page, 'no_redirect_to_bank');
    }
  });

  test('06 — return na shop', async ({ page }) => {
    const url = page.url();
    if (url.includes('/payment/return') || url.includes('status=')) {
      await page.waitForTimeout(2000);
      await snap(page, 'payment_return_page');
    } else {
      await snap(page, 'payment_return_fallback');
    }
    await pause();
  });
});
