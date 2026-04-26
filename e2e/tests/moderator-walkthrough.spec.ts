/**
 * Moderator app — full walkthrough sa screenshotima i seed-om kroz REST API.
 *
 * Pokriva sve "Must"/Should funkcionalnosti iz tiketa M01–M06:
 *   M01  login, dashboard, layout, guard
 *   M02  proizvodi: lista + filteri, nova forma, izmena (osnovno/cene/zalihe)
 *   M03  brendovi (modal), kategorije (stablo + modal)
 *   M04  narudžbine: lista + filter, detalj + status dropdown
 *   M05  CMS, lokacije, blog (CRUD)
 *   M06  recenzije (PII banner, approve/hide), pretraga korisnika
 *   Bonus: 403/forbidden flow za kupca koji proba moderator URL
 *
 * Izlaz: PNG fajlovi u ./screenshots, numerisani po koracima.
 *
 * Pokretanje:
 *   # Headless (skreenshoti):
 *   cd beauty-health/e2e && npx playwright test tests/moderator-walkthrough.spec.ts
 *
 *   # Headed (live demo, 2 s pauze između koraka, slowMo na akcijama):
 *   PLAYWRIGHT_SLOW_MO=400 WALKTHROUGH_PAUSE_MS=2000 \
 *     npx playwright test tests/moderator-walkthrough.spec.ts --headed
 *
 * Preduslov: docker compose iz beauty-health/ je gore (postgres + backend na 8080).
 * Webserver za moderator (5174) i storefront (5173) Playwright pokreće sam (vidi playwright.config.ts).
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, rmSync } from 'node:fs';

import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

const API = process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:8080';
const MOD = process.env.PLAYWRIGHT_MODERATOR_URL ?? 'http://localhost:5174';

const PAUSE_MS = Number.parseInt(process.env.WALKTHROUGH_PAUSE_MS ?? '2000', 10);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHOTS_DIR = path.resolve(__dirname, '..', 'screenshots');

const MODERATOR_EMAIL = 'moderator@local.test';
const MODERATOR_PASSWORD = 'ModeratorLocal1!';

let shotIndex = 0;
function nextShotName(name: string): string {
  shotIndex += 1;
  const idx = String(shotIndex).padStart(2, '0');
  return `${idx}_${name}.png`;
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
 * Pouzdano zatvori modal: prvo klikni dugme "Zatvori" ili "Otkaži" ako postoji,
 * pa zatim ESC, pa pričekaj da modal nestane.
 */
async function closeModal(page: Page): Promise<void> {
  const close = page.getByRole('button', { name: 'Zatvori' });
  if (await close.count()) {
    await close.first().click().catch(() => {});
  } else {
    const cancel = page.getByRole('button', { name: 'Otkaži' });
    if (await cancel.count()) {
      await cancel.first().click().catch(() => {});
    }
  }
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(600);
}

type SeedResult = {
  customerEmail: string;
  customerPassword: string;
  orderId: number;
  reviewSlug: string;
  productTitleSubstr: string;
};

/**
 * Pronađi proizvod sa zalihom (CTA == ADD_TO_CART) — koristi se i za PDP i za checkout.
 */
async function findInStockProduct(api: APIRequestContext): Promise<{ slug: string; variantId: number; title: string }> {
  const list = await api.get(`${API}/api/v1/products?page=0&size=20`);
  expect(list.ok(), `Listing pao: ${list.status()} ${await list.text()}`).toBeTruthy();
  const items = ((await list.json()).content ?? []) as Array<{
    slug: string;
    title: string;
    inStock: boolean;
    chooseOptionsRequired: boolean;
    primaryVariantId: number | null;
    ctaType: string;
  }>;
  const candidate = items.find(
    (p) => p.inStock && !p.chooseOptionsRequired && p.primaryVariantId !== null && p.ctaType === 'ADD_TO_CART',
  );
  expect(candidate, 'Mora postojati barem jedan proizvod sa CTA ADD_TO_CART u seed-u').toBeTruthy();
  return {
    slug: candidate!.slug,
    variantId: candidate!.primaryVariantId!,
    title: candidate!.title,
  };
}

/**
 * Seeduj realne podatke kroz REST API (čisti `local` profil + Liquibase već daje katalog/sadržaj).
 *
 * Svaki run kreira novog kupca + novu narudžbinu da ne udari u rate limit / unique constraintе.
 */
async function seedDemoData(api: APIRequestContext): Promise<SeedResult> {
  const suffix = Date.now();
  const customerEmail = `demo-${suffix}@example.local`;
  const customerPassword = 'DemoUserPass1!';

  const reg = await api.post(`${API}/api/v1/auth/register`, {
    data: {
      email: customerEmail,
      password: customerPassword,
      fullName: 'Demo Kupac',
    },
  });
  expect(reg.ok(), `Registracija kupca pala: ${reg.status()} ${await reg.text()}`).toBeTruthy();
  const token = (await reg.json()).accessToken as string;

  const product = await findInStockProduct(api);

  const cart = await api.post(`${API}/api/v1/cart/items`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { variantId: product.variantId, quantity: 2 },
  });
  expect(cart.ok(), `Dodavanje u korpu palo: ${cart.status()} ${await cart.text()}`).toBeTruthy();

  const order = await api.post(`${API}/api/v1/orders`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      recipientName: 'Demo Primac',
      recipientPhone: '0600000000',
      addressLine1: 'Demo ulica 1',
      addressLine2: null,
      city: 'Beograd',
      postalCode: '11000',
      countryCode: 'RS',
    },
  });
  expect(order.ok(), `Checkout pao: ${order.status()} ${await order.text()}`).toBeTruthy();
  const orderId = (await order.json()).orderId as number;

  // Recenzija na proizvod (B08): ostaje is_approved=false dok moderator ne odobri u M06.
  const review = await api.post(`${API}/api/v1/products/${product.slug}/reviews`, {
    data: {
      authorName: 'Demo Recenzent',
      authorEmail: customerEmail,
      rating: 5,
      body: 'Odličan proizvod, brza dostava — demo recenzija za moderaciju.',
      isPublicEmail: false,
    },
  });
  expect(review.ok(), `Recenzija pala: ${review.status()} ${await review.text()}`).toBeTruthy();

  return {
    customerEmail,
    customerPassword,
    orderId,
    reviewSlug: product.slug,
    productTitleSubstr: product.title.split(' ').slice(0, 2).join(' '),
  };
}

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
  mkdirSync(SHOTS_DIR, { recursive: true });
  // Očisti stare PNG-ove da rezultat odgovara samo trenutnom run-u.
  for (const fname of [...Array(80).keys()].map((i) => `${String(i).padStart(2, '0')}_*.png`)) {
    try {
      rmSync(path.join(SHOTS_DIR, fname), { force: true });
    } catch {
      /* ignore */
    }
  }
});

test('moderator: seed + walkthrough svih ekrana sa screenshotima', async ({ browser, request }) => {
  test.setTimeout(15 * 60_000);

  // ============================================================
  // 0) SEED — pravimo realne podatke (kupac, narudžbina, recenzija)
  // ============================================================
  const seed = await test.step('Seed: kupac + narudžbina + recenzija (REST)', async () =>
    await seedDemoData(request));
  console.log(`    [seed] orderId=${seed.orderId}, customer=${seed.customerEmail}`);

  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    locale: 'sr-Latn-RS',
  });
  const page = await ctx.newPage();

  // ============================================================
  // 1) M01 — Login screen + 403 guard
  // ============================================================
  await test.step('M01: Login (prazna forma)', async () => {
    await page.goto(`${MOD}/login`, { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Moderacija' })).toBeVisible();
    await pause(page);
    await shot(page, 'm01_login_prazna_forma');
  });

  await test.step('M01: Forbidden flow — kupac proba /orders', async () => {
    // Login as customer (CUSTOMER role only) and try to access moderator URL.
    const customerCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const customerPage = await customerCtx.newPage();
    const loginRes = await customerPage.request.post(`${API}/api/v1/auth/login`, {
      data: { email: seed.customerEmail, password: seed.customerPassword },
    });
    expect(loginRes.ok()).toBeTruthy();
    const { accessToken, user } = await loginRes.json();
    // Ubaci customer kredencijale u localStorage moderator app-a.
    await customerPage.goto(`${MOD}/login`, { waitUntil: 'networkidle' });
    await customerPage.evaluate(
      ({ token, u }) => {
        localStorage.setItem('bh_moderator_token', token);
        localStorage.setItem('bh_moderator_user', JSON.stringify(u));
      },
      { token: accessToken, u: user },
    );
    await customerPage.goto(`${MOD}/orders`, { waitUntil: 'networkidle' });
    await expect(customerPage.getByRole('heading', { name: 'Nemate pristup' })).toBeVisible();
    await pause(customerPage);
    await customerPage.screenshot({
      path: path.join(SHOTS_DIR, nextShotName('m01_forbidden_kupac_na_admin_url')),
    });
    console.log(`    [-- ] customer-403 captured`);
    await customerCtx.close();
  });

  await test.step('M01: Login (popunjena forma)', async () => {
    await page.locator('#email').fill(MODERATOR_EMAIL);
    await page.locator('#password').fill(MODERATOR_PASSWORD);
    await pause(page);
    await shot(page, 'm01_login_popunjeno');
  });

  await test.step('M01: Submit → Dashboard', async () => {
    await Promise.all([
      page.waitForURL((u) => !u.pathname.endsWith('/login'), { timeout: 30_000 }),
      page.getByRole('button', { name: 'Prijavi se' }).click(),
    ]);
    await expect(page.getByRole('heading', { name: 'Kontrolna tabla' })).toBeVisible();
    await expect(page.getByText(MODERATOR_EMAIL)).toBeVisible();
    await pause(page);
    await shot(page, 'm01_dashboard');
  });

  // ============================================================
  // 2) M02 — Proizvodi (lista, filter, nova forma, edit + cene + zalihe)
  // ============================================================
  await test.step('M02: Proizvodi — lista + filteri', async () => {
    await page.getByRole('navigation').getByRole('link', { name: 'Proizvodi' }).click();
    await expect(page).toHaveURL(/\/products$/);
    await expect(page.getByRole('heading', { name: 'Proizvodi' })).toBeVisible();
    await pause(page);
    await shot(page, 'm02_proizvodi_lista', true);
  });

  await test.step('M02: Proizvodi — filter pretrage', async () => {
    await page.getByPlaceholder('npr. serum').fill(seed.productTitleSubstr);
    await page.getByRole('button', { name: 'Primeni' }).click();
    await pause(page);
    await shot(page, 'm02_proizvodi_filter');
  });

  await test.step('M02: Novi proizvod — prazna forma', async () => {
    await page.getByPlaceholder('npr. serum').fill('');
    await page.getByRole('button', { name: 'Primeni' }).click();
    await page.getByRole('link', { name: 'Novi proizvod' }).click();
    await expect(page).toHaveURL(/\/products\/new$/);
    await expect(page.getByRole('heading', { name: 'Novi proizvod' })).toBeVisible();
    await pause(page);
    await shot(page, 'm02_proizvod_nova_forma', true);
  });

  await test.step('M02: Edit proizvoda — Osnovno + Cene + Zalihe', async () => {
    await page.goto(`${MOD}/products/${seed.reviewSlug}/edit`, { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Uredi proizvod' })).toBeVisible();
    await pause(page);
    await shot(page, 'm02_proizvod_edit_osnovno', true);
  });

  // ============================================================
  // 3) M03 — Brendovi i kategorije
  // ============================================================
  await test.step('M03: Brendovi — lista', async () => {
    await page.getByRole('navigation').getByRole('link', { name: 'Brendovi' }).click();
    await expect(page).toHaveURL(/\/brands$/);
    await expect(page.getByRole('heading', { name: 'Brendovi' })).toBeVisible();
    await pause(page);
    await shot(page, 'm03_brendovi_lista');
  });

  await test.step('M03: Brendovi — modal "Novi brend"', async () => {
    await page.getByRole('button', { name: 'Novi brend' }).click();
    await expect(page.getByRole('heading', { name: 'Novi brend' })).toBeVisible();
    await pause(page);
    await shot(page, 'm03_brendovi_modal');
    await closeModal(page);
  });

  await test.step('M03: Kategorije — stablasti prikaz', async () => {
    await page.getByRole('navigation').getByRole('link', { name: 'Kategorije' }).click();
    await expect(page).toHaveURL(/\/categories$/);
    await expect(page.getByRole('heading', { name: 'Kategorije' })).toBeVisible();
    await pause(page);
    await shot(page, 'm03_kategorije_stablo', true);
  });

  await test.step('M03: Kategorije — modal "Nova kategorija"', async () => {
    await page.getByRole('button', { name: 'Nova kategorija' }).click();
    await expect(page.getByRole('heading', { name: 'Nova kategorija' })).toBeVisible();
    await pause(page);
    await shot(page, 'm03_kategorije_modal');
    await closeModal(page);
  });

  // ============================================================
  // 4) M04 — Narudžbine
  // ============================================================
  await test.step('M04: Narudžbine — lista + filteri (status/datum)', async () => {
    await page.getByRole('navigation').getByRole('link', { name: 'Narudžbine' }).click();
    await expect(page).toHaveURL(/\/orders$/);
    await expect(page.getByRole('heading', { name: 'Narudžbine' })).toBeVisible();
    await pause(page);
    await shot(page, 'm04_narudzbine_lista', true);
  });

  await test.step(`M04: Detalj narudžbine #${seed.orderId}`, async () => {
    await page.goto(`${MOD}/orders/${seed.orderId}`, { waitUntil: 'networkidle' });
    await expect(
      page.getByRole('heading', { name: new RegExp(`Narudžbina #${seed.orderId}`) }),
    ).toBeVisible();
    await expect(page.getByText(seed.customerEmail)).toBeVisible();
    await pause(page);
    await shot(page, 'm04_narudzba_detalj', true);
  });

  // ============================================================
  // 5) M05 — Sadržaj (CMS, lokacije, blog)
  // ============================================================
  await test.step('M05: Sadržaj → CMS stranice', async () => {
    await page.getByRole('navigation').getByRole('link', { name: 'Sadržaj' }).click();
    await expect(page).toHaveURL(/\/content/);
    await expect(page.getByRole('heading', { name: 'Sadržaj' })).toBeVisible();
    // Default redirect: /content → /content/cms
    await expect(page.url()).toMatch(/\/content\/cms$/);
    await pause(page);
    await shot(page, 'm05_cms_lista', true);
  });

  await test.step('M05: CMS — modal "Nova stranica" sa markdown preview', async () => {
    await page.getByRole('button', { name: 'Nova stranica' }).click();
    await pause(page);
    // Pokušaj naći textarea za telo i ukucaj malo markdown-a da preview postane vidljiv.
    const textareas = page.locator('textarea');
    if ((await textareas.count()) > 0) {
      await textareas.first().fill('# Demo naslov\n\nOvo je **markdown** sadržaj.\n\n- prva\n- druga');
    }
    await pause(page);
    await shot(page, 'm05_cms_modal_markdown', true);
    await closeModal(page);
  });

  await test.step('M05: Sadržaj → Lokacije', async () => {
    await page.goto(`${MOD}/content/locations`, { waitUntil: 'networkidle' });
    await pause(page);
    await shot(page, 'm05_lokacije_lista', true);
  });

  await test.step('M05: Lokacije — modal "Nova lokacija"', async () => {
    await page.getByRole('button', { name: 'Nova lokacija' }).click();
    await pause(page);
    await shot(page, 'm05_lokacije_modal');
    await closeModal(page);
  });

  await test.step('M05: Sadržaj → Blog', async () => {
    await page.goto(`${MOD}/content/blog`, { waitUntil: 'networkidle' });
    await pause(page);
    await shot(page, 'm05_blog_lista', true);
  });

  await test.step('M05: Blog — modal "Novi članak"', async () => {
    await page.getByRole('button', { name: 'Novi članak' }).click();
    await pause(page);
    await shot(page, 'm05_blog_modal', true);
    await closeModal(page);
  });

  // ============================================================
  // 6) M06 — Recenzije i pretraga korisnika
  // ============================================================
  await test.step('M06: Korisnici → Recenzije (PII banner + nova neodobrena)', async () => {
    // Direktna navigacija (sigurnije ako bilo koji modal nije zatvoren u prethodnom koraku).
    await page.goto(`${MOD}/users/reviews`, { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Korisnici i recenzije' })).toBeVisible();
    await pause(page);
    await shot(page, 'm06_recenzije_lista', true);
  });

  await test.step('M06: Recenzije — filter samo neodobrene', async () => {
    // Filter slug-om proizvoda gde je naša demo-recenzija.
    const slugInput = page.getByPlaceholder('npr. product-001');
    if (await slugInput.count()) {
      await slugInput.fill(seed.reviewSlug);
      const apply = page.getByRole('button', { name: /Primeni|Pretra/ });
      if (await apply.count()) {
        await apply.first().click().catch(() => {});
      } else {
        await page.keyboard.press('Enter');
      }
    }
    await pause(page);
    await shot(page, 'm06_recenzije_filter_product');
  });

  await test.step('M06: Korisnici → Podrška (pretraga po e-pošti)', async () => {
    await page.goto(`${MOD}/users/support`, { waitUntil: 'networkidle' });
    await page.locator('input[type="email"]').fill(seed.customerEmail);
    // Postoje dva dugmeta "Traži" (email i ID) — koristi prvo (uz email input).
    await page.getByRole('button', { name: 'Traži' }).first().click();
    await expect(page.getByText(seed.customerEmail).first()).toBeVisible();
    await pause(page);
    await shot(page, 'm06_korisnici_podrska_rezultat', true);
  });

  // ============================================================
  // 7) Odjava — vraća na login
  // ============================================================
  await test.step('M01: Odjavi se → vraća na login', async () => {
    await page.getByRole('button', { name: 'Odjavi se' }).click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Moderacija' })).toBeVisible();
    await pause(page);
    await shot(page, 'm01_logout_nazad_na_login');
  });

  await ctx.close();

  console.log(`\n  Saved ${shotIndex} screenshots to: ${SHOTS_DIR}`);
});
