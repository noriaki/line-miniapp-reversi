import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for E2E Tests
 * Mobile-only configuration with dynamic reporter switching
 *
 * Requirements:
 * - 6.1: Mobile device profiles only (Pixel 5, iPhone 12)
 * - 6.3: Local environment uses 'line' reporter
 * - 6.4: CI environment uses 'github' reporter
 * - 6.5: Screenshot on failure
 * - 7.2, 7.3: Desktop projects removed
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Dynamic reporter switching based on CI environment
  // Both environments include HTML reporter for full result archiving
  reporter: process.env.CI
    ? [['github'], ['html', { outputFolder: 'playwright-report' }]]
    : [['line'], ['html', { outputFolder: 'playwright-report' }]],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  // Mobile-only projects (Req 6.1, 7.2, 7.3)
  projects: [
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: process.env.CI
      ? 'pnpm run build && npx serve@latest out -l 3000'
      : 'pnpm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
