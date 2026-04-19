/**
 * E2E odgovara scenariju iz `backend/scripts/demo-api-flow.sh`:
 * registracija → PDP → korpa (2 kom) → checkout → moderator vidi narudžbinu.
 *
 * Preduslov: API na PLAYWRIGHT_API_URL (podrazumevano http://localhost:8080), npr. docker compose.
 */
import { expect, test, type Page } from '@playwright/test';

const API = process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:8080';
const STORE = process.env.PLAYWRIGHT_STORE_URL ?? 'http://localhost:5173';
const MOD = process.env.PLAYWRIGHT_MODERATOR_URL ?? 'http://localhost:5174';

async function readCartTotalQuantity(page: Page): Promise<number> {
  const text = (await page.locator('p').filter({ hasText: 'Ukupno stavki' }).textContent()) ?? '';
  const m = text.match(/Ukupno stavki:\s*(\d+)/);
  return m ? Number.parseInt(m[1], 10) : 0;
}

/** Podesi ukupnu količinu stavki (sabirano po linijama) — otporno na višestruke PDP klikove uz veliki slowMo. */
async function adjustCartTotalQuantityTo(page: Page, target: number) {
  for (let i = 0; i < 40; i++) {
    const n = await readCartTotalQuantity(page);
    if (n === target) {
      return;
    }
    if (n < target) {
      await page.getByRole('button', { name: 'Povećaj količinu' }).click();
    } else {
      await page.getByRole('button', { name: 'Smanji količinu' }).click();
    }
  }
  throw new Error(`Korpa: nije uspelo podešavanje ukupne količine na ${target} (poslednje: ${await readCartTotalQuantity(page)})`);
}

test('storefront: register → cart → checkout; moderator: vidi narudžbinu', async ({ browser }) => {
  const suffix = Date.now();
  const email = `pw-e2e-${suffix}@example.local`;
  const password = 'PlayE2ePass1';
  const fullName = 'Playwright Kupac';

  const store = await browser.newPage();
  const mod = await browser.newPage();

  await test.step('API ping', async () => {
    const res = await store.request.get(`${API}/api/v1/catalog/ping`);
    expect(res.ok(), 'Backend mora biti dostupan na PLAYWRIGHT_API_URL').toBeTruthy();
  });

  await test.step('Registracija (storefront)', async () => {
    await store.goto(`${STORE}/register`);
    await expect(store.getByRole('heading', { name: 'Registracija' })).toBeVisible();
    await store.locator('#reg-name').fill(fullName);
    await store.locator('#reg-email').fill(email);
    await store.locator('#reg-password').fill(password);
    await store.locator('#reg-confirm').fill(password);
    await store.getByRole('button', { name: 'Registruj se' }).click();
    await expect(store.getByRole('heading', { name: 'Pregled naloga' })).toBeVisible();
    await expect(store.getByText(email)).toBeVisible();
  });

  await test.step('PDP product-001: opcija Veličina + dodaj u korpu', async () => {
    await store.goto(`${STORE}/p/product-001`);
    await expect(store.getByRole('heading', { level: 1, name: 'Proizvod 1' })).toBeVisible();
    const sizeGroup = store.getByRole('group', { name: 'Veličina' });
    await expect(sizeGroup).toBeVisible();
    await sizeGroup.locator('label').first().click();
    await store.getByRole('button', { name: 'Dodaj u korpu' }).click();
    await expect(store.getByText('Dodato u korpu.')).toBeVisible();
  });

  let orderId: number;

  await test.step('Korpa → checkout → potvrda', async () => {
    await store.goto(`${STORE}/cart`);
    await expect(store.getByRole('heading', { name: 'Korpa' })).toBeVisible();
    await adjustCartTotalQuantityTo(store, 2);
    await expect(store.locator('p').filter({ hasText: 'Ukupno stavki' })).toContainText('2');
    await store.getByRole('link', { name: 'Nastavi na poručivanje' }).click();
    await expect(store.getByRole('heading', { name: 'Poručivanje' })).toBeVisible();

    await store.locator('#co-name').fill('Demo Primac');
    await store.locator('#co-phone').fill('0600000000');
    await store.locator('#co-a1').fill('Ulica 1');
    await store.locator('#co-city').fill('Beograd');
    await store.locator('#co-post').fill('11000');
    await store.getByRole('button', { name: 'Potvrdi porudžbinu' }).click();

    await expect(store.getByRole('heading', { name: 'Hvala na porudžbini' })).toBeVisible();
    const broj = store.locator('dt', { hasText: 'Broj narudžbine' }).locator('..').locator('dd');
    const raw = (await broj.textContent())?.trim() ?? '';
    const m = raw.match(/#(\d+)/);
    expect(m, `Očekivan dd sa brojem narudžbine, dobijeno: "${raw}"`).toBeTruthy();
    orderId = Number.parseInt(m![1], 10);
    expect(orderId).toBeGreaterThan(0);
  });

  await test.step('Moderator: prijava i detalj narudžbine', async () => {
    await mod.goto(`${MOD}/login`);
    await mod.locator('#email').fill('moderator@local.test');
    await mod.locator('#password').fill('ModeratorLocal1!');
    await Promise.all([
      mod.waitForURL((u) => !u.pathname.endsWith('/login'), { timeout: 30_000 }),
      mod.getByRole('button', { name: 'Prijavi se' }).click(),
    ]);
    await mod.goto(`${MOD}/orders/${orderId}`);
    await expect(mod.getByRole('heading', { name: new RegExp(`Narudžbina #${orderId}`) })).toBeVisible();
    await expect(mod.getByText(email)).toBeVisible();
  });

  await store.close();
  await mod.close();
});
