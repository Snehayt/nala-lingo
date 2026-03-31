test.js


import { test } from '@playwright/test';
import { features } from '../../features/express/lingo.spec.js';
import expressLingo from '../../selectors/express/lingo.page.js';

let lingo;

test.describe('Validate lingo functionality', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    lingo = new expressLingo(page);
  });

  //--------------us markets and respective markets------------------------------------------

  test(`${features[0].name},${features[0].tags} [TC-${features[0].tcid}]`, async ({ page }) => {
  console.info(`[Test Page]: ${features[0].path}`);

  await test.step('Navigate to page', async () => {
    await page.goto(`${features[0].path}`);
    await page.waitForLoadState('domcontentloaded');
  });

  await test.step('Validate all English markets', async () => {
    await lingo.validateAllMarketsForLanguage('en');
  });
});
   //--------------non-us markets and respective markets------------------------------------------

  test(`${features[1].name},${features[1].tags} [TC-${features[1].tcid}]`, async ({ page }) => {
  console.info(`[Test Page]: ${features[1].path}`);

  await test.step('Navigate to page', async () => {
    await page.goto(`${features[1].path}`);
    await page.waitForLoadState('domcontentloaded');
  });

  await test.step('Validate all non-English markets', async () => {
    await lingo.validateAllLanguagesExcept('en');
  });
});

   //--------------cookies validation------------------------------------------
  
 /* for (const feature of features.filter(f => f.tcid >= 2 && f.tcid <= 130)) {
  const tags = feature.tags ?? '@express-market';

  test(`${feature.name},${tags} [TC-${feature.tcid}]`, async ({ page }) => {
    const expectedCurrency = feature.defaultCurrency;

    console.info(`[Test Page]: ${feature.path}`);

    await test.step('Navigate', async () => {
      await page.goto(`${feature.path}`);
      await page.waitForLoadState('domcontentloaded');
      //await expect(page).toHaveURL(`${feature.path}`);
    });

    await test.step('Validate language, region, URL & cookies', async () => {
      await lingo.validateIntlAndCountryCookies(feature.lang, feature.region);
    });

    await test.step('Validate selected market currency label', async () => {
      if (expectedCurrency != null) {
        await lingo.validateDefaultCurrency(expectedCurrency);
      }
    });
  });
}
});*/

for (const feature of features.filter(f => f.tcid >= 2 && f.tcid <= 130)) {
  const tags = feature.tags ?? '@express-market';

  test(`${feature.name}, ${tags} [TC-${feature.tcid}]`, async ({ page }) => {
    console.info(`[Test Page]: ${feature.path}`);

    await test.step('Validate language, region, URL, cookies & default currency', async () => {
      await lingo.validateIntlCountryAndCurrency(
        feature.lang,
        feature.region,
        feature.defaultCurrency, // from spec object
        feature.path // initial URL
      );
    });
  });
}
});


