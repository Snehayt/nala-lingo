page.js


import { expect } from '@playwright/test';

export default class expressLingo {
  constructor(page) {
    this.page = page;

    // Language Selector
this.languageSelectorDropdown =page.locator('.market-selector-dropdown').nth(0);
this.languageSearch= page.locator('.search-input').nth(0);
this.langNoSearchResults = page.locator('.no-search-result-text').nth(0);


    // Currency Selector
this.currencySelectorDropdown = page.locator('.market-selector-dropdown').nth(1);
this.currencySearch = page.locator('.search-input').nth(1);
this.currencyNoSearchResults = page.locator('.no-search-result-text').nth(1);


    // Base selectors
    this.languageItems = page.locator('.market-selector-item-text');
    this.currencyItems = page.locator('.market-selector-item-text'); // markets/currencies
    this.currencySelectorDropdown =page.locator('.market-selector-dropdown').nth(1);
    //this.currencySelectorDropdown =  page.locator('.market-selector-item.selected').nth(1);
  }

  // Language mapping
  languageMap = {
  en: 'English (US)',
  en_uk: 'English (UK)',
  en_in: 'English (IN)',
  fr: 'Français',
  de: 'Deutsch',
  jp: '日本語',
  es: 'Español',
  ko: '한국어',
  it: 'Italiano',
  pt: 'Portugese',
  nl: 'Nederlands',
  tw: '繁體中文',
  //cn: '简体中文', Redirection to cn/express and cookie set
  dk: 'Dansk',
  fi: 'Suomi',
  no: 'Norsk',
  sv: 'Svenska',
  id_id: 'Bahasa Indonesia',
  };

  // Markets mapping: array of objects for each language
  regionMap = {
    en: [
      { code: 'ae', label: 'United Arab Emirates - AED د.إ' },
      { code: 'am', label: 'Armenia - USD $' },
      { code: 'ar', label: 'Argentina - ARS $' },
      { code: 'at', label: 'Austria - EUR €' },
      { code: 'au', label: 'Australia - AUD $' },
      { code: 'az', label: 'Azerbaijan - USD $' },
      { code: 'be', label: 'Belgium - EUR €' },
      { code: 'bg', label: 'Bulgaria - EUR €' },
      { code: 'bh', label: 'Bahrain - BHD .د.ب' },
      { code: 'bo', label: 'Bolivia - USD $' },
      { code: 'br', label: 'Brazil - BRL R$' },
      { code: 'ca', label: 'Canada - CAD $' },
      { code: 'ch', label: 'Switzerland - CHF' },
      { code: 'cl', label: 'Chile - CLP $' },
      { code: 'co', label: 'Colombia - COP $' },
      { code: 'cr', label: 'Costa Rica - USD $' },
      { code: 'cy', label: 'Cyprus - EUR €' },
      { code: 'cz', label: 'Czech Republic - EUR €' },
      { code: 'de', label: 'Germany - EUR €' },
      { code: 'dk', label: 'Denmark - DKK kr' },
      { code: 'do', label: 'Dominican Republic - USD $' },
      { code: 'dz', label: 'Algeria - USD $' },
      { code: 'ec', label: 'Ecuador - USD $' },
      { code: 'ee', label: 'Estonia - EUR €' },
      { code: 'eg', label: 'Egypt - EGP £' },
      { code: 'es', label: 'Spain - EUR €' },
      { code: 'fi', label: 'Finland - EUR €' },
      { code: 'fr', label: 'France - EUR €' },
      { code: 'gb', label: 'United Kingdom - GBP £' },
      { code: 'ge', label: 'Georgia - USD $' },
      { code: 'gr', label: 'Greece - EUR €' },
      { code: 'gt', label: 'Guatemala - USD $' },
      { code: 'hk', label: 'Hong Kong - HKD $' },
      { code: 'hr', label: 'Croatia - EUR €' },
      { code: 'hu', label: 'Hungary - EUR €' },
      { code: 'id', label: 'Indonesia - IDR Rp' },
      { code: 'ie', label: 'Ireland - EUR €' },
      { code: 'il', label: 'Israel - ILS ₪' },
      { code: 'in', label: 'India - INR ₹' },
      { code: 'it', label: 'Italy - EUR €' },
      { code: 'jo', label: 'Jordan - JOD د.ا' },
      { code: 'jp', label: 'Japan - JPY ¥' },
      { code: 'ke', label: 'Kenya - USD $' },
      { code: 'kg', label: 'Kyrgyzstan - USD $' },
      { code: 'kr', label: 'South Korea - KRW ₩' },
      { code: 'kw', label: 'Kuwait - KWD د.ك' },
      { code: 'kz', label: 'Kazakhstan - USD $' },
      { code: 'lb', label: 'Lebanon - LBP ل.ل' },
      { code: 'lk', label: 'Sri Lanka - USD $' },
      { code: 'lt', label: 'Lithuania - EUR €' },
      { code: 'lu', label: 'Luxembourg - EUR €' },
      { code: 'lv', label: 'Latvia - EUR €' },
      { code: 'ma', label: 'Morocco - MAD د.م.' },
      { code: 'md', label: 'Moldova - USD $' },
      { code: 'mo', label: 'Macau - HKD $' },
      { code: 'mt', label: 'Malta - EUR €' },
      { code: 'mu', label: 'Mauritius - USD $' },
      { code: 'mx', label: 'Mexico - MXN $' },
      { code: 'my', label: 'Malaysia - MYR RM' },
      { code: 'ng', label: 'Nigeria - NGN ₦' },
      { code: 'nl', label: 'Netherlands - EUR €' },
      { code: 'no', label: 'Norway - NOK kr' },
      { code: 'nz', label: 'New Zealand - NZD $' },
      { code: 'om', label: 'Oman - OMR ر.ع.' },
      { code: 'pa', label: 'Panama - USD $' },
      { code: 'pe', label: 'Peru - PEN S/' },
      { code: 'ph', label: 'Philippines - PHP ₱' },
      { code: 'pl', label: 'Poland - EUR €' },
      { code: 'pt', label: 'Portugal - EUR €' },
      { code: 'py', label: 'Paraguay - USD $' },
      { code: 'qa', label: 'Qatar - QAR ر.ق' },
      { code: 'ro', label: 'Romania - EUR €' },
      { code: 'sa', label: 'Saudi Arabia - SAR ﷼' },
      { code: 'se', label: 'Sweden - SEK kr' },
      { code: 'sg', label: 'Singapore - SGD $' },
      { code: 'si', label: 'Slovenia - EUR €' },
      { code: 'sk', label: 'Slovakia - EUR €' },
      { code: 'sv', label: 'El Salvador - USD $' },
      { code: 'th', label: 'Thailand - THB ฿' },
      { code: 'tj', label: 'Tajikistan - USD $' },
      { code: 'tm', label: 'Turkmenistan - USD $' },
      { code: 'tn', label: 'Tunisia - USD $' },
      { code: 'tr', label: 'Türkiye - TRY ₺' },
      { code: 'tt', label: 'Trinidad and Tobago - USD $' },
      { code: 'tw', label: 'Taiwan - TWD NT$' },
      { code: 'ua', label: 'Ukraine - USD $' },
      { code: 'us', label: 'United States - USD $' },
      { code: 'uy', label: 'Uruguay - USD $' },
      { code: 'uz', label: 'Uzbekistan - USD $' },
      { code: 've', label: 'Venezuela - USD $' },
      { code: 'vn', label: 'Vietnam - USD $' },
     // { code: 'ye', label: 'TEST - ye' },
      { code: 'za', label: 'South Africa - ZAR R' },
    ],
    en_uk: [
      { code: 'gb', label: 'United Kingdom - GBP £' },      
    ],

    in: [
      { code: 'in', label: 'India - INR ₹' },      
    ],
    fr: [
      { code: 'be', label: 'Belgique - EUR €' },
      { code: 'ca', label: 'Canada - CAD $' },
      { code: 'ch', label: 'Suisse - CHF' },
      { code: 'fr', label: 'France - EUR €' },
      { code: 'lu', label: 'Luxembourg - EUR €' },
    ],

    de: [
      { code: 'at', label: 'Österreich – EUR €' },
      { code: 'ch', label: 'Schweiz - CHF' },
      { code: 'de', label: 'Deutschland – EUR €' },
      { code: 'lu', label: 'Luxemburg - EUR €' },

    ],
    
    jp:[
      {code:'jp', label: '日本 - JPY ¥'}
    ],

    es:[
      {code:'ar', label: 'Argentina - ARS $'},
      {code:'cr', label: 'Costa Rica - USD $'},
      {code:'cl', label: 'Chile - CLP $'},
      {code:'co', label: 'Colombia - COP $'},
      {code:'ec', label: 'Ecuador - USD $' },
      {code:'es', label: 'España - EUR €'},
      {code:'gt', label: 'Guatemala - USD $'},
      {code:'mx', label: 'México - MXN $'},
      {code:'pe', label: 'Perú - PEN S/'},
      {code:'us', label: 'Estados Unidos - USD $'},
    ],

    ko:[
     { code: 'kr', label: '대한민국 - KRW ₩' },
    ],

    it: [
      { code: 'it', label: 'Italy - EUR €' },
      { code: 'ch', label: 'Switzerland - CHF' },
    ],

    pt:[
      { code: 'br', label: 'Brasil - BRL R$' },
      { code: 'pt', label: 'Portugal - EUR €' },
    ],

    nl:[
      { code: 'be', label: 'België - EUR €' },
      { code: 'nl', label: 'Nederland - EUR €' },
    ],

    tw:[
       { code: 'hk', label: '香港 - HKD $' },
       { code: 'nl', label: '台灣 - TWD NT$' },
    ],

    cn:[
      //{code:'cn', label:'中国 - CNY ¥'},
    ],

    dk:[
      {code:'dk', label:'Danmark - DKK kr'},
    ],

    fi:[
     {code:'fi', label:'Suomi - EUR €'},
    ],

    no:[
     {code:'no', label:'Norge - NOK kr'},
    ],

    se:[
     {code:'se', label:'Sverige - SEK kr'},
    ],

    id_id:[
     {code:'id', label:'Indonesia - IDR Rp'},
    ], 

  };


  // Get a dynamic locator for language
  getLanguageLocator(langCode) {
    const lang = this.languageMap[langCode];
    if (!lang) throw new Error(`Language not found: ${langCode}`);
    return this.page.locator('.market-selector-item-text', { hasText: lang });
  }

  // Get a dynamic locator for market/currency by label
    getRegionLocator(marketLabel) {
    return this.page.locator('.market-selector-item-text', { hasText: marketLabel });
  }

/*async validateAllLanguagesAndMarkets() {
  // Loop through every language in the map
  for (const langCode of Object.keys(this.languageMap)) {
    const languageName = this.languageMap[langCode];

    //  Log current language
    console.info(` Validating Language: ${langCode} → ${languageName}`);

    // Open language dropdown
    await this.languageSelectorDropdown.click();

    // Click/select the language
    const langLocator = this.page.locator('.market-selector-item-text', { hasText: languageName });

    // Click language
    await langLocator.click();
    await this.page.waitForTimeout(2000);
    await this.page.waitForLoadState('domcontentloaded');


    // Open currency/market dropdown
    await this.currencySelectorDropdown.click();

    // Get all markets for this language
    const markets = this.regionMap[langCode];
    if (!markets || markets.length === 0) {
      console.warn(` No markets defined for language: ${langCode}`);
      continue;
    }

    // Check each market/region is visible
    for (const market of markets) {
      console.info(` Checking market: ${market.code} → ${market.label}`);

      const marketLocator = this.page.locator('.market-selector-item-text', { hasText: market.label });
      await expect(marketLocator).toBeVisible();
    }
  }

}
}*/

// Validate Supported Markets for US
async validateAllMarketsForLanguage(langCode) {
  const languageName = this.languageMap[langCode];
  const markets = this.regionMap[langCode];

  if (!languageName) {
    throw new Error(`Language not found: ${langCode}`);
  }

  console.info(` Validating ALL markets for: ${languageName}`);

  // Open language dropdown
  await this.languageSelectorDropdown.click();

  // Select language
  await this.getLanguageLocator(langCode).click();
  await this.page.waitForLoadState('domcontentloaded');
  await this.page.waitForTimeout(1000);

  // Open market dropdown
  await this.currencySelectorDropdown.waitFor({ state: 'visible' });
  await this.currencySelectorDropdown.click(); 

  if (!markets || markets.length === 0) {
    throw new Error(`No markets for language: ${langCode}`);
  }

  for (const market of markets) {
    console.info(` Checking market: ${market.label}`);

    const marketLocator = this.getRegionLocator(market.label);
    await expect(marketLocator).toBeVisible();
  }
}

// Validate Supported Markets for non-US Languages
async validateAllLanguagesExcept(excludedLang) {
  for (const langCode of Object.keys(this.languageMap)) {
    if (langCode === excludedLang) continue;

    const languageName = this.languageMap[langCode];
    const markets = this.regionMap[langCode];

    if (!languageName) {
      throw new Error(`Language not found: ${langCode}`);
    }

    console.info(` Validating ALL markets for: ${languageName}`);

    // Open language dropdown
    await this.languageSelectorDropdown.click();

    // Select language
    await this.getLanguageLocator(langCode).click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(500);

    // Open market dropdown
    await this.currencySelectorDropdown.waitFor({ state: 'visible' });
    await this.currencySelectorDropdown.click();

    if (!markets || markets.length === 0) {
      console.warn(` No markets for language: ${langCode}`);
      continue;
    }

    for (const market of markets) {
      console.info(` Checking market: ${market.label}`);

      const marketLocator = this.getRegionLocator(market.label);

      // Ensure the element is in view before asserting
      await marketLocator.scrollIntoViewIfNeeded();
      await expect(marketLocator).toBeVisible();
    }
    console.log();
  }
}

// Combined function: validate Intl/Country cookies and Default Currency
async validateIntlCountryAndCurrency(langCode, regionCode, defaultCurrency, url) {
  //  Go to the URL first (no cookies set)
  await this.page.goto(url);
  await this.page.waitForLoadState('domcontentloaded');
  console.info(`Step 0: Visiting URL without cookies: ${url}`);

  // Check that intl and country cookies are NOT set
  const initialCookies = await this.page.context().cookies();
  const intlCookie = initialCookies.find(c => c.name === 'intl');
  const countryCookie = initialCookies.find(c => c.name === 'country');

  if (intlCookie) throw new Error(`Initial intl cookie should NOT exist`);
  if (countryCookie) throw new Error(`Initial country cookie should NOT exist`);
  console.info(' No intl or country cookies found initially');

  // Validate initial default currency
   await this.currencySelectorDropdown.click();
  const selectedCurrencyLocator = this.page.locator('.market-selector-item.selected').first();
   await selectedCurrencyLocator.waitFor({ state: 'visible', timeout: 6000 });

  // Now read text content
const currencyText = (await selectedCurrencyLocator.textContent())?.trim() ?? '';
if (!currencyText.includes(defaultCurrency)) {
  throw new Error(`Initial currency mismatch: expected="${defaultCurrency}", actual="${currencyText}"`);
}
console.info(` Initial default currency: ${currencyText}`);

  // 1️ Open language dropdown and select language
  await this.languageSelectorDropdown.click();
  await this.selectLanguage(langCode);
  await this.page.waitForLoadState('domcontentloaded');
  await this.page.waitForTimeout(500);

  // 2️ Open market dropdown and select region
  await this.currencySelectorDropdown.click();
  await this.selectRegion(regionCode);
  await this.page.waitForTimeout(500);

  // 3 Validate cookies
  const updatedCookies = await this.page.context().cookies();
  const updatedIntl = updatedCookies.find(c => c.name === 'intl');
  const updatedCountry = updatedCookies.find(c => c.name === 'country');

  if (!updatedIntl || updatedIntl.value !== langCode) {
    throw new Error(`Intl cookie mismatch: expected=${langCode}, actual=${updatedIntl?.value}`);
  }
  if (!updatedCountry || updatedCountry.value !== regionCode) {
    throw new Error(`Country cookie mismatch: expected=${regionCode}, actual=${updatedCountry?.value}`);
  }
  console.info(`Cookies validated: intl=${langCode}, country=${regionCode}`);

  // 4. Validate default currency after selection
  const updatedCurrencyLocator = this.page.locator('.market-selector-item.selected');
  const updatedCurrencyText = (await updatedCurrencyLocator.textContent())?.trim() ?? '';

  if (!updatedCurrencyText.includes(defaultCurrency)) {
    throw new Error(`Currency mismatch after selection: expected="${defaultCurrency}", actual="${updatedCurrencyText}"`);
  }

  // Check that the checkmark SVG is visible
  const checkmarkLocator = updatedCurrencyLocator.locator('svg');
  if (!(await checkmarkLocator.isVisible())) {
    throw new Error(`Checkmark SVG not visible for selected currency: "${defaultCurrency}"`);
  }

  console.info(` Default currency validated after selection: ${updatedCurrencyText}`);
  // 5. Clear cookies manually for next feature
  await this.page.context().clearCookies();
  console.info(' Cleared cookies for next test feature');
}
}

