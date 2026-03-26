/* eslint-disable import/prefer-default-export */
/* eslint-disable no-console */
import { expect } from '@playwright/test';

export async function runSeoChecks({ page, feature }) {
  const issues = [];
  const title = await page.title();
  if (!title) issues.push('Missing title');
  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
  if (!canonical) issues.push('Missing canonical');
  if (issues.length === 0) console.info(`[SEO OK] ${feature.name}`);
  else {
    console.warn(`[SEO WARN] ${feature.name}`);
    issues.forEach((m) => console.warn(' -', m));
  }
}
