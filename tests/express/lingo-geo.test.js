import { test, expect } from '@playwright/test';
import { LingoGeoBannerPage } from '../../selectors/express/lingo-geo.page.js';
import spec from '../../features/express/lingo-geo.spec.js';
import expressConfig from '../../playwright.express.config.js';

const { resolveLingoGeoPath } = expressConfig;

const {
  features,
  prefCookieBannerFeatures,
  modalFeatures,
  scenario5RegionalPrioritiesFeatures,
  scenario6UnsupportedGeoFeatures,
  currencyNegativeFeatures,
  bacomFeatures,
  customFeature,
} = spec;

// ─── Shared Test Runner ───────────────────────────────────────────────────────

/**
 * Core test logic for every lingo-geo feature row:
 *
 * 1. Clear cookies; set `international` cookie if the feature has a prefLang.
 * 2. Navigate to feature URL while capturing both geo JSON responses.
 * 3. Compute the expected UI from the flowchart (`computeExpectedUi`: pref vs page by JSON lang column).
 * 4. Cross-check computed outcome against spec's `uiExpectation` (sanity guard).
 * 5. Assert the UI (none / banner / modal) and validate copy from the JSON.
 *
 * No-action + `@defaultCurrency`: `assertNone` then `assertCurrency` + `assertSelectorInteractions`
 * in the same test (see `Lingo-Geo | Default Currency` — only non–no-action rows, so each tcid once).
 *
 * Modal: `#tab-1-*` tabs (`assertRegionalPriorityModal`) only when the spec sets a non-empty
 * `prefLangCookie` and JSON yields multiple options (regional-priority UI). General modal has a
 * single CTA — `assertModal` with the primary row only when JSON lists many options.
 */
async function runLingoGeoTest(page, context, feature) {
  const geo = new LingoGeoBannerPage(page);
  const pageUrl = resolveLingoGeoPath(feature.path);

  // Default PREF matches US English row in supported-markets (empty prefix) when unset
  const prefLang = feature.prefLangCookie ?? '';

  // 1. Cookie setup
  await context.clearCookies();
  if (Object.prototype.hasOwnProperty.call(feature, 'prefLangCookie')) {
    await geo.setInternationalCookieValue(context, feature.prefLangCookie, pageUrl);
  }

  // 2. Navigate and capture both JSONs in parallel (promises registered before goto)
  const { supportedMarketsData, marketsData } = await geo.navigateAndCaptureJsons(pageUrl);

  if (feature.verifyGeoIpNotInSupportedMarketsJson && supportedMarketsData) {
    expect(
      LingoGeoBannerPage.isGeoIpSupported(feature.region, supportedMarketsData),
      `GeoIP '${feature.region}' must not appear in any supported-markets row (ACOM scenario 6)`,
    ).toBe(false);
  }
  if (feature.verifyGeoIpNotInSupportedMarketsJson && marketsData?.data) {
    const marketRow = marketsData.data.find(
      (r) => r.marketCode?.toLowerCase() === feature.region?.toLowerCase(),
    );
    expect(
      marketRow,
      `markets.json must have no market row for geo '${feature.region}'`,
    ).toBeUndefined();
  }

  // 3. Compute expected UI from flowchart using live JSON data.
  // prefix and region are derived from the feature URL — no spec fields needed.
  // If supportedMarketsData is null (JSON capture missed and fallback also failed),
  // skip the cross-check and trust the spec — a capture failure should not mask real UI bugs.
  const { prefix: pagePrefix, region: geoIp } = LingoGeoBannerPage.parseUrlLocale(pageUrl);
  let computed;
  if (supportedMarketsData) {
    computed = LingoGeoBannerPage.computeExpectedUi({
      pagePrefix,
      geoIp,
      prefLang,
      supportedMarketsData,
      isBacom: !!feature.isBacom,
    });

    // 4. Cross-check: flowchart result must agree with what the spec says.
    // Skipped for playground features where uiExpectation is intentionally left empty.
    if (feature.uiExpectation) {
      expect(
        computed,
        `Flowchart → '${computed}' but spec → '${feature.uiExpectation}' for [${feature.name}]`,
      ).toBe(feature.uiExpectation);
    } else {
      console.info(`[LingoGeo] Playground — flowchart computed: '${computed}' for [${feature.name}]`);
    }
  } else {
    console.warn(
      `[LingoGeo] supportedMarketsData unavailable for [${feature.name}] — skipping flowchart cross-check, asserting UI from spec: '${feature.uiExpectation}'`,
    );
    computed = feature.uiExpectation;
  }

  // 5. Assert UI and copy content from JSON
  if (computed === 'none') {
    await geo.assertNone();
    if (marketsData && supportedMarketsData && feature.tags?.includes('@defaultCurrency')) {
      await geo.assertCurrency(context, marketsData, supportedMarketsData);
      await geo.assertSelectorInteractions(context, marketsData);
    }
  } else if (computed === 'banner') {
    const bannerRowPrefix = LingoGeoBannerPage.normalizePrefLangForFlowchart(feature.prefLangCookie ?? '');
    const copy = LingoGeoBannerPage.getBannerCopy(
      bannerRowPrefix,
      supportedMarketsData,
    );
    await geo.assertBanner(copy);
    if (marketsData && feature.tags?.includes('@defaultCurrency')) {
      await geo.assertPageDefaultCurrency(context, marketsData, supportedMarketsData);
    }
  } else if (computed === 'modal') {
    const copy = LingoGeoBannerPage.getModalCopy(
      geoIp, supportedMarketsData, pagePrefix, marketsData, prefLang,
    );
    const hasInternationalPref =
      Object.prototype.hasOwnProperty.call(feature, 'prefLangCookie')
      && String(feature.prefLangCookie ?? '').trim() !== '';
    const isRegionalPriorityTabUi =
      (copy.buttons?.length ?? 0) > 1 && hasInternationalPref;

    if (isRegionalPriorityTabUi) {
      await geo.assertRegionalPriorityModal({ ...copy, geoIp: feature.region });
    } else {
      const modalCopy =
        copy.buttons?.length > 1
          ? { ...copy, buttons: [copy.buttons[0]] }
          : copy;
      await geo.assertModal(modalCopy);
    }
  }

  return { marketsData, supportedMarketsData, computed };
}

// ─── Test Groups ──────────────────────────────────────────────────────────────

test.describe('Lingo-Geo | No Action', () => {
  for (const f of features.filter((f) => f.uiExpectation === 'none')) {
    test(f.name, { tag: f.tags.split(' ').filter(Boolean) }, async ({ page, context }) => {
      await runLingoGeoTest(page, context, f);
    });
  }
});

test.describe('Lingo-Geo | Language Banner', () => {
  for (const f of features.filter((f) => f.uiExpectation === 'banner')) {
    test(f.name, { tag: f.tags.split(' ').filter((t) => t && t !== '@defaultCurrency') }, async ({ page, context }) => {
      await runLingoGeoTest(page, context, f);
    });
  }
});

test.describe('Lingo-Geo | Pref Cookie Banner', () => {
  for (const f of prefCookieBannerFeatures.filter((f) => f.uiExpectation === 'banner')) {
    test(f.name, { tag: f.tags.split(' ').filter(Boolean) }, async ({ page, context }) => {
      await runLingoGeoTest(page, context, f);
    });
  }
});

test.describe('Lingo-Geo | Pref Cookie — No Action', () => {
  for (const f of prefCookieBannerFeatures.filter((f) => f.uiExpectation === 'none')) {
    test(f.name, { tag: f.tags.split(' ').filter(Boolean) }, async ({ page, context }) => {
      await runLingoGeoTest(page, context, f);
    });
  }
});

test.describe('Lingo-Geo | Geo Routing Modal', () => {
  for (const f of modalFeatures) {
    test(f.name, { tag: f.tags.split(' ').filter(Boolean) }, async ({ page, context }) => {
      test.skip(!!f.skipIntegration, 'Geo modal unreliable on stage for this URL');
      await runLingoGeoTest(page, context, f);
    });
  }
});

test.describe('Lingo-Geo | Geo Routing Modal — Scenario 5 (Region Priorities)', () => {
  for (const f of scenario5RegionalPrioritiesFeatures) {
    test(f.name, { tag: f.tags.split(' ').filter(Boolean) }, async ({ page, context }) => {
      await runLingoGeoTest(page, context, f);
    });
  }
});

test.describe('Lingo-Geo | Scenario 6 — GeoIP not in supported-markets JSON', () => {
  for (const f of scenario6UnsupportedGeoFeatures) {
    test(f.name, { tag: f.tags.split(' ').filter(Boolean) }, async ({ page, context }) => {
      await runLingoGeoTest(page, context, f);
    });
  }
});

test.describe('Lingo-Geo | BACOM', () => {
  for (const f of bacomFeatures) {
    test(f.name, { tag: f.tags.split(' ').filter(Boolean) }, async ({ page, context }) => {
      await runLingoGeoTest(page, context, f);
    });
  }
});

// Banner (and other non–no-action) rows with @defaultCurrency — no-action currency runs inside
// `runLingoGeoTest` so each tcid is not duplicated under "No Action".
test.describe('Lingo-Geo | Default Currency', () => {
  for (const f of features.filter(
    (f) => f.tags.includes('@defaultCurrency') && f.uiExpectation !== 'none',
  )) {
    test(f.name, { tag: f.tags.split(' ').filter((t) => t && t !== '@smoke') }, async ({ page, context }) => {
      const geo = new LingoGeoBannerPage(page);
      await context.clearCookies();
      const { supportedMarketsData, marketsData } = await geo.navigateAndCaptureJsons(resolveLingoGeoPath(f.path));
      await geo.assertCurrency(context, marketsData, supportedMarketsData);
      await geo.assertSelectorInteractions(context, marketsData);
    });
  }
});

test.describe('Lingo-Geo | Default Currency — Negative Scenarios', () => {
  for (const f of currencyNegativeFeatures) {
    test(f.name, { tag: f.tags.split(' ').filter(Boolean) }, async ({ page, context }) => {
      const geo = new LingoGeoBannerPage(page);
      await context.clearCookies();

      const url = resolveLingoGeoPath(f.path);

      // N11: pre-set country cookie before navigation so priority chain can be tested
      if (f.countryCookie) {
        let host;
        try {
          host = new URL(url).hostname;
        } catch {
          host = 'www.stage.adobe.com';
        }
        await context.addCookies([{
          name: 'country',
          value: f.countryCookie,
          domain: host,
          path: '/',
        }]);
      }

      // N2: 404 page — assert no market selector exists instead of checking currency
      if (f.skipCurrencyCheck) {
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        const hasSelector = await geo.currencySelectorButton.isVisible({ timeout: 5000 }).catch(() => false);
        expect(hasSelector, 'Page should NOT have a currency/market selector').toBe(false);
        return;
      }

      const { supportedMarketsData, marketsData, httpStatus } = await geo.navigateAndCaptureJsons(url);

      if (httpStatus === 404) {
        console.info(`[LingoGeo] 404 page — no currency check: ${url}`);
        return;
      }

      // N8/N12: click a specific language in the selector before asserting currency
      if (f.clickLangPrefix) {
        const targetNativeName = LingoGeoBannerPage.getMarketRow(
          f.clickLangPrefix,
          supportedMarketsData,
        )?.nativeName;
        const langButtonReady = await geo.languageSelectorButton
          .waitFor({ state: 'visible', timeout: 10000 })
          .then(() => true)
          .catch(() => false);
        if (targetNativeName && langButtonReady) {
          await geo.dismissGeoRoutingModal().catch(() => {});
          await geo.dismissLanguageBanner().catch(() => {});
          await geo.languageSelectorButton.click();
          await geo.languageSelectorPopover.waitFor({ state: 'visible', timeout: 6000 });
          const targetItem = geo.languageSelectorPopover
            .locator('.market-selector-item')
            .filter({ hasText: targetNativeName })
            .first();
          await targetItem.click();
          await page.waitForLoadState('domcontentloaded');
        }
      }

      // N13: click a specific market/region in the currency selector to set country cookie
      if (f.clickMarketCode) {
        const { prefix: currentPrefix } = LingoGeoBannerPage.parseUrlLocale(page.url());
        // markets.json may contain double spaces (e.g. "Morocco - DH  د.م.") — normalize
        // so the locator filter matches what the browser actually renders as single space
        const rawCurrencyText = LingoGeoBannerPage.getCurrency(currentPrefix, f.clickMarketCode, marketsData);
        const marketButtonReady = await geo.currencySelectorButton
          .waitFor({ state: 'visible', timeout: 10000 })
          .then(() => true)
          .catch(() => false);
        if (rawCurrencyText && marketButtonReady) {
          const currencyItemText = rawCurrencyText.replace(/\s+/g, ' ').trim();
          await geo.dismissGeoRoutingModal().catch(() => {});
          await geo.dismissLanguageBanner().catch(() => {});
          await geo.currencySelectorButton.click();
          await geo.currencySelectorPopover.waitFor({ state: 'visible', timeout: 6000 });
          const targetItem = geo.currencySelectorPopover
            .locator('.market-selector-item')
            .filter({ hasText: currencyItemText })
            .first();
          await targetItem.click();
          await page.waitForLoadState('domcontentloaded');
        }
      }

      // N12/N13: navigate to a different path after cookies are set via selector interaction
      if (f.thenNavigateTo) {
        await page.goto(resolveLingoGeoPath(f.thenNavigateTo), { waitUntil: 'domcontentloaded' });
      }

      await geo.assertPageDefaultCurrency(context, marketsData, supportedMarketsData, {
        closeModal: f.closeModal ?? false,
        geoIpDriven: f.geoIpDriven ?? false,
      });
    });
  }
});

// ─── Playground ───────────────────────────────────────────────────────────────

test.describe('Lingo-Geo | Playground', () => {
  test(
    customFeature.name || '@custom-playground',
    { tag: customFeature.tags.split(' ').filter(Boolean) },
    async ({ page, context }) => {
      test.skip(!customFeature.path, 'Playground not configured — set path in customFeature (lingo-geo.spec.js)');

      const geo = new LingoGeoBannerPage(page);
      await context.clearCookies();

      const pageUrl = resolveLingoGeoPath(customFeature.path);

      // Pre-set `international` cookie (geo / banner flow)
      if (customFeature.prefLangCookie !== undefined && customFeature.prefLangCookie !== '') {
        await geo.setInternationalCookieValue(context, customFeature.prefLangCookie, pageUrl);
      }

      // Pre-set `country` cookie (negative scenario priority)
      if (customFeature.countryCookie) {
        const domain = new URL(pageUrl).hostname;
        await context.addCookies([{ name: 'country', value: customFeature.countryCookie, domain, path: '/' }]);
      }

      // Auto-detect BACOM from URL — no need to set isBacom: true in the spec.
      const isBacom = /business(?:\.stage)?\.adobe\.com/.test(pageUrl);
      const isGeoIpDriven = !new URL(pageUrl).searchParams.get('akamaiLocale');

      // Merge auto-detected isBacom so runLingoGeoTest uses the correct flowchart branch.
      const playgroundFeature = { ...customFeature, isBacom };

      let marketsData;
      let supportedMarketsData;

      let computed;
      if (isGeoIpDriven) {
        // No akamaiLocale → server uses real client IP. Skip flowchart-driven UI assertion;
        // detect what actually renders (modal / banner / none) and log it.
        ({ supportedMarketsData, marketsData } = await geo.navigateAndCaptureJsons(pageUrl));
        computed = await geo.detectActualUi();
      } else {
        // akamaiLocale present → full flowchart-driven flow (none / banner / modal)
        ({ marketsData, supportedMarketsData, computed } = await runLingoGeoTest(page, context, playgroundFeature));
      }

      if (isBacom) {
        console.info(`[LingoGeo] BACOM playground — UI: '${computed}'`);
        console.info('[LingoGeo] Currency for BACOM not present');
      } else if (marketsData) {
        await geo.assertPageDefaultCurrency(context, marketsData, supportedMarketsData, {
          geoIpDriven: isGeoIpDriven,
        });
      }
    },
  );
});
