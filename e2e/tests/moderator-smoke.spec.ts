/**
 * Smoke moderator UI (M02+): prijava seed moderatora, ključne stranice i admin API ping.
 * Preduslov: backend na PLAYWRIGHT_API_URL (npr. docker compose), seed `local`.
 */
import { expect, test } from '@playwright/test';

const API = process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:8080';
const MOD = process.env.PLAYWRIGHT_MODERATOR_URL ?? 'http://localhost:5174';

test('moderator: login → kontrolna tabla → proizvodi, narudžbine, brendovi', async ({ browser }) => {
  const page = await browser.newPage();

  await test.step('API admin ping (JWT kasnije)', async () => {
    const res = await page.request.get(`${API}/api/v1/admin/ping`);
    expect(res.status(), 'Bez tokena admin ping mora biti 401').toBe(401);
  });

  await test.step('Prijava', async () => {
    await page.goto(`${MOD}/login`);
    await expect(page.getByRole('heading', { name: 'Moderacija' })).toBeVisible();
    await page.locator('#email').fill('moderator@local.test');
    await page.locator('#password').fill('ModeratorLocal1!');
    await Promise.all([
      page.waitForURL((u) => !u.pathname.endsWith('/login'), { timeout: 30_000 }),
      page.getByRole('button', { name: 'Prijavi se' }).click(),
    ]);
  });

  await test.step('Kontrolna tabla', async () => {
    await expect(page.getByRole('heading', { name: 'Kontrolna tabla' })).toBeVisible();
    await expect(page.getByText('moderator@local.test')).toBeVisible();
  });

  await test.step('Proizvodi (admin lista)', async () => {
    await page.getByRole('navigation').getByRole('link', { name: 'Proizvodi' }).click();
    await expect(page).toHaveURL(/\/products$/);
    await expect(page.getByRole('heading', { name: 'Proizvodi' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Novi proizvod' })).toBeVisible();
  });

  await test.step('Narudžbine', async () => {
    await page.getByRole('navigation').getByRole('link', { name: 'Narudžbine' }).click();
    await expect(page).toHaveURL(/\/orders$/);
    await expect(page.getByRole('heading', { name: 'Narudžbine' })).toBeVisible();
  });

  await test.step('Brendovi (admin CRUD lista)', async () => {
    await page.getByRole('navigation').getByRole('link', { name: 'Brendovi' }).click();
    await expect(page).toHaveURL(/\/brands$/);
    await expect(page.getByRole('heading', { name: 'Brendovi' })).toBeVisible();
  });

  await test.step('JWT + admin ping', async () => {
    const loginRes = await page.request.post(`${API}/api/v1/auth/login`, {
      data: { email: 'moderator@local.test', password: 'ModeratorLocal1!' },
    });
    expect(loginRes.ok()).toBeTruthy();
    const token = (await loginRes.json()).accessToken as string;
    const ping = await page.request.get(`${API}/api/v1/admin/ping`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(ping.ok()).toBeTruthy();
    expect((await ping.json()).ok).toBe(true);
  });

  await page.close();
});
