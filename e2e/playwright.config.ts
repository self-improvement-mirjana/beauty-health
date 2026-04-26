import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from '@playwright/test';

const e2eDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(e2eDir, '..');

const slowMoRaw = Number.parseInt(process.env.PLAYWRIGHT_SLOW_MO ?? '0', 10);
const slowMo = Number.isFinite(slowMoRaw) && slowMoRaw > 0 ? slowMoRaw : undefined;
const slowRun = Boolean(slowMo);

/**
 * Preduslov: backend na 8080 (npr. `docker compose up` iz korena repoa).
 * Playwright pokreće oba Vite dev servera (storefront :5173, moderator :5174).
 *
 * Polako gledanje: `PLAYWRIGHT_SLOW_MO` u ms (`launchOptions.slowMo`) — npr. `npm run test:headed:step5s` (5 s).
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list']],
  timeout: slowRun ? 600_000 : 120_000,
  expect: { timeout: slowRun ? 120_000 : 15_000 },
  use: {
    trace: 'on-first-retry',
    video: 'off',
    ...(slowMo ? { launchOptions: { slowMo } } : {}),
  },
  webServer: [
    {
      command: 'npm run dev',
      cwd: path.join(repoRoot, 'storefront'),
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
    {
      command: 'npm run dev',
      cwd: path.join(repoRoot, 'moderator'),
      url: 'http://localhost:5174',
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
    {
      command: 'npm run dev',
      cwd: path.join(repoRoot, 'bank-admin'),
      url: 'http://localhost:5175',
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
  ],
});
