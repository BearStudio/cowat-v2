import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  /* Seed the database before running any test */
  globalSetup: './e2e/global-setup.ts',
  /* Max time for the full CI tests */
  globalTimeout: 15 * 60 * 1000,
  /* Max test failure */
  maxFailures: process.env.CI ? 1 : 0,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? 'github' : 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL: process.env.VITE_BASE_URL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Increase the timeout to operate on Github Actions */
  expect: { timeout: process.env.CI ? 10000 : undefined },

  /* Configure projects for major browsers */
  projects: [
    // eslint-disable-next-line sonarjs/slow-regex
    { name: 'setup', testMatch: /.*\.setup\.ts/, timeout: 90_000 },
    {
      // We keep only chromium for now for faster feedback loop
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    // CI runs `dev:app` (not `dev`) because the workflow already starts
    // its own MailDev — `dev:smtp` would collide on port 1080.
    //
    // We can't run the production build in CI yet: the pinned nitro
    // nightly (see `nitro` in package.json) returns 500 for every
    // request when serving a vite 8 build. Switch to `pnpm build &&
    // pnpm start` once nitro ships a release that supports vite 8 prod
    // output AND keeps JSON locale loading working in dev.
    //
    // `--unhandled-rejections=warn` keeps the dev server alive when a
    // background fetch (push notifications, etc.) rejects after the
    // response has been sent. Drop this flag together with the test-env
    // guard in src/server/notifications/index.ts.
    command: process.env.CI
      ? 'NODE_OPTIONS=--unhandled-rejections=warn pnpm dev:app'
      : 'pnpm dev',
    url: process.env.VITE_BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 5 * 60 * 1000,
  },
});
