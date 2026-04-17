// @ts-check
const { devices } = require('@playwright/test');

const envs = require('./envs/env.js');

/** Align default baseURL with `LINGO_GEO_ENV` when `BASE_URL` is unset. */
function resolveExpressBaseUrl() {
  if (process.env.BASE_URL) return process.env.BASE_URL;
  const mode = (process.env.LINGO_GEO_ENV || '').toLowerCase();
  if (mode === 'prod' || mode === 'production') {
    return envs['@express_lingo_prod'];
  }
  if (mode === 'stage') {
    return envs['@express_lingo_stage'];
  }
  return undefined;
}

/**
 * Resolve a spec path to a full URL.
 *   - Absolute URLs are returned as-is.
 *   - Relative paths use the correct origin from `LINGO_GEO_ENV`:
 *       prod  → www.adobe.com / business.adobe.com
 *       stage (default) → www.stage.adobe.com / business.stage.adobe.com
 *   - Paths containing /products/ route to the BACOM origin.
 *
 * @param {string} path
 * @returns {string}
 */
function resolveLingoGeoPath(path) {
  if (!path || /^https?:\/\//i.test(String(path))) return String(path ?? '');
  const p = String(path).startsWith('/') ? String(path) : `/${String(path)}`;
  const isProd = (process.env.LINGO_GEO_ENV || 'stage').toLowerCase().startsWith('prod');
  const acom = isProd ? envs['@adobe_prod'] : envs['@adobe_stage'];
  const bacom = isProd ? envs['@bacom_prod'] : envs['@bacom_stage'];
  return `${p.includes('/products/') ? bacom : acom}${p}`;
}

/**
 * @see https://playwright.dev/docs/test-configuration
 * @type {import('@playwright/test').PlaywrightTestConfig}
 */
const config = {
  testDir: './tests/express',
  outputDir: './test-results',
  /* Maximum time one test can run for. */
  timeout: 90 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 5000,
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 2 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI
    ? [['github'], ['list'], ['./nala/utils/base-reporter.js']]
    : [['html', { outputFolder: 'test-html-results' }], ['list'], ['./nala/utils/base-reporter.js']],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 60000,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    baseURL: resolveExpressBaseUrl() || envs['@express_lingo_stage'],
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'da-express-live-chrome',
      use: { ...devices['Desktop Chrome'] },
      retries: 0,
    },

    {
      name: 'da-express-live-firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'da-express-live-webkit',
      use: { ...devices['Desktop Safari'] },
    },

    {
      name: 'da-express-live-IOS-mobile',
      use: {
        ...devices['iPhone 15'],
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_7_2 like Mac OS X) '
          + 'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 '
          + 'Mobile/15E148 Safari/604.1',
        viewport: {
          width: 393,
          height: 659,
        },
      },
    },

    {
      name: 'da-express-live-Android-mobile',
      use: {
        ...devices['Galaxy S24'],
        userAgent:
          'Mozilla/5.0 (Linux; Android 14; SM-S921U) AppleWebKit/537.36 '
          + '(KHTML, like Gecko) Chrome/139.0.7258.31 Mobile Safari/537.36',
        viewport: {
          width: 480,
          height: 1040,
        },
      },
    },
  ],
};

module.exports = config;
module.exports.resolveLingoGeoPath = resolveLingoGeoPath;
