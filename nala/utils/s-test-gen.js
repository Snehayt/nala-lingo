#!/usr/bin/env node
/* eslint-disable prefer-const */
/* eslint-disable one-var */
/* eslint-disable one-var-declaration-per-line */
/* eslint-disable no-continue */
/* eslint-disable no-template-curly-in-string */
/* eslint-disable no-console */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const chalk = require('chalk');

// === CONFIG FLAGS ===
const ENABLE_NESTED_ELEMENTS = true; // set to false to skip nested elements

// === Detect module type ===
let isESM = false;
try {
  const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'));
  isESM = pkg.type === 'module';
} catch {
  console.warn('⚠️ Could not determine module type — defaulting to CommonJS.');
}

// === CLI args ===
const args = process.argv.slice(2);
const input = args[0];
const action = (args[1] || 'add').toLowerCase(); // add | update | refresh | delete
const blockArg = args[2] || null;
const variantArg = args[3] || null;

if (!input) {
  console.error(`
❌ Usage:
  npm run nala-test-gen <htmlFileOrUrl> [action] [blockName] [variantName]

Examples:
  npm run nala-test-gen https://page.html
  npm run nala-test-gen https://page.html add ax-columns
  npm run nala-test-gen https://page.html update ax-columns width-2-columns
  npm run nala-test-gen refresh
`);
  process.exit(1);
}

/**
 * Load HTML from either a URL or a local file.
 */
async function loadHtml(src) {
  if (src.startsWith('http')) {
    console.log(`🌐 Fetching HTML from URL: ${src}`);
    const res = await fetch(src);
    if (!res.ok) {
      console.error(`❌ Failed to fetch URL: ${res.status} ${res.statusText}`);
      process.exit(1);
    }
    let html = await res.text();

    const looksDynamic = html.includes('<script')
      || html.includes('data-block-status="loading"')
      || !html.includes('</main>');

    if (looksDynamic) {
      console.log('⚡ Detected dynamic content — rendering with Playwright...');
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(src, { waitUntil: 'networkidle' });
      html = await page.content();
      await browser.close();
      console.log('✅ Rendered DOM successfully via Playwright.');
    } else {
      console.log('✅ Loaded static HTML via fetch.');
    }
    return html;
  }

  if (!fs.existsSync(src)) {
    console.error(`❌ Error: HTML file not found -> ${src}`);
    process.exit(1);
  }

  console.log(`📂 Reading HTML from local file: ${src}`);
  return fs.readFileSync(src, 'utf-8');
}

// === Helpers ===
function toPascalCase(name) {
  return name
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}
function normalizePath(src, blockName, variantName) {
  if (src.startsWith('http')) {
    try {
      const url = new URL(src);
      return url.pathname;
    } catch { /* ignore */ }
  }
  return `/drafts/nala/blocks/${blockName}/${variantName}`;
}

// === SMART PARSER ===
function parseBlock(block, blockName, variants, variantName, idx, input) {
  const blockPrefix = blockName;
  const nestedEls = ENABLE_NESTED_ELEMENTS
    ? [...block.querySelectorAll(`[class^="${blockPrefix}-"]`)]
    : [];
  const typeCounters = {};

  const structuredData = nestedEls
    .map((el) => {
      const cls = [...el.classList].find((c) => c.startsWith(`${blockPrefix}-`)) || '';
      const type = cls.replace(`${blockPrefix}-`, '');
      const text = el.textContent?.trim() || '';
      if (!typeCounters[type]) typeCounters[type] = 0;
      const nth = typeCounters[type]++;
      const selector = `[class*="${blockPrefix}-${type}"]`;
      return text ? { type, nth, selector, text } : null;
    })
    .filter(Boolean);

  const headings = [...block.querySelectorAll('h1,h2,h3,h4,h5,h6')]
    .map((h) => h.textContent.trim())
    .filter(Boolean);
  const paragraphs = [...block.querySelectorAll('p')]
    .map((p) => p.textContent.trim())
    .filter(Boolean);
  const links = [...block.querySelectorAll('a')].map((a) => ({
    text: a.textContent.trim(),
    href: a.getAttribute('href'),
    rel: a.getAttribute('rel') || '',
  }));
  const buttons = [...block.querySelectorAll('button')].map((b) => ({
    text: b.textContent.trim(),
    aria: b.getAttribute('aria-expanded') || '',
    disabled: b.hasAttribute('disabled'),
  }));
  const images = [...block.querySelectorAll('img')].map((img) => ({
    src: img.getAttribute('src'),
    alt: img.getAttribute('alt') || null,
  }));
  const roles = [...block.querySelectorAll('[role]')].map((el) => el.getAttribute('role'));
  const analytics = block.getAttribute('daa-lh') || '';

  return {
    tcid: idx.toString(),
    name: `@${blockName}-${variantName}`,
    selector: `.${[blockName, ...variants].join('.')}`, // ✅ FIXED SELECTOR
    path: normalizePath(input, blockName, variantName),
    data: {
      headings,
      paragraphs,
      links,
      buttons,
      images,
      roles,
      analytics,
      ...(structuredData.length ? { subElements: structuredData } : {}),
    },
    tags: [`@${blockName}`, `@${variantName}`, '@milo'],
  };
}

// === Ensure seo-check file ===
function ensureSeoCheckLib(ext) {
  const seoFile = path.join(process.cwd(), 'nala', 'libs', `seo-check.${ext}`);
  if (!fs.existsSync(seoFile)) {
    const seoJs = `${isESM
      ? 'import { expect } from \'@playwright/test\';'
      : 'const { expect } = require(\'@playwright/test\');'
    }

export async function runSeoChecks({ page, feature }) {
  const issues = [];
  const title = await page.title();
  if (!title) issues.push('Missing title');
  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
  if (!canonical) issues.push('Missing canonical');
  if (issues.length === 0) console.info(\`[SEO OK] \${feature.name}\`);
  else {
    console.warn(\`[SEO WARN] \${feature.name}\`);
    issues.forEach((m) => console.warn(' -', m));
  }
}
`;
    fs.writeFileSync(seoFile, seoJs, 'utf-8');
    console.log(`🆕 Created SEO check lib: ${seoFile}`);
  }
}

// === MAIN RUNNER ===
(async () => {
  const html = await loadHtml(input);
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const blocks = [...doc.querySelectorAll('main div.section div[data-block-status="loaded"]')];

  console.log(`🔍 Found ${blocks.length} block(s) in HTML.`);
  console.log(`\n🔍 Blocks found:\n${blocks.map((b) => ` - .${[...b.classList].join('.')}`).join('\n')}\n`);
  if (blocks.length === 0) {
    console.error('❌ No blocks found in HTML');
    process.exit(1);
  }

  const ext = isESM ? 'cjs' : 'js';
  ensureSeoCheckLib(ext);

  let newCount = 0, updatedCount = 0, skippedCount = 0, deletedCount = 0;
  let matchedVariant = false;
  const touchedBlocks = new Set();

  for (const [idx, block] of blocks.entries()) {
    const classList = [...block.classList];
    if (!classList.length) continue;

    const blockName = classList[0];
    const variants = classList.slice(1);
    const variantName = variants.length ? variants.join('-') : 'default';
    const safeClassName = toPascalCase(blockName);

    if (blockArg && blockArg !== blockName) continue;
    if (variantArg && variantArg !== variantName) continue;
    if (variantArg) matchedVariant = true;

    const blockDir = path.join(process.cwd(), 'nala', 'blocks', blockName);
    fs.mkdirSync(blockDir, { recursive: true });

    const blockJsonFile = path.join(blockDir, `${blockName}.block.json`);
    const schema = fs.existsSync(blockJsonFile)
      ? JSON.parse(fs.readFileSync(blockJsonFile, 'utf-8'))
      : { block: blockName, variants: [] };

    const existingIndex = schema.variants.findIndex((v) => v.name === `@${blockName}-${variantName}`);
    const variantIndex = existingIndex >= 0 ? existingIndex : schema.variants.length;
    const newVariant = parseBlock(block, blockName, variants, variantName, variantIndex, input);

    if (existingIndex >= 0) {
      schema.variants[existingIndex] = newVariant;
      updatedCount++;
    } else {
      schema.variants.push(newVariant);
      newCount++;
    }

    fs.writeFileSync(blockJsonFile, JSON.stringify(schema, null, 2), 'utf-8');
    touchedBlocks.add(blockName);
  }

  // === Generate files ===
  for (const blockName of touchedBlocks) {
    const safeClassName = toPascalCase(blockName);
    const blockDir = path.join(process.cwd(), 'nala', 'blocks', blockName);
    const blockJsonFile = path.join(blockDir, `${blockName}.block.json`);
    const blockSpecFile = path.join(blockDir, `${blockName}.spec.${ext}`);
    const blockPageFile = path.join(blockDir, `${blockName}.page.${ext}`);
    const blockTestFile = path.join(blockDir, `${blockName}.test.${ext}`);
    const schema = JSON.parse(fs.readFileSync(blockJsonFile, 'utf-8'));

    if (!fs.existsSync(blockSpecFile)) {
      const specJs = isESM
        ? `/* eslint-disable import/extensions */
import schema from './${blockName}.block.json';
export const features = schema.variants;
`
        : `const schema = require('./${blockName}.block.json');
module.exports = { features: schema.variants };`;
      fs.writeFileSync(blockSpecFile, specJs, 'utf-8');
    }

    // Page Object
    if (!fs.existsSync(blockPageFile)) {
      const pageJs = isESM
        ? `export default class ${safeClassName}Block {
  constructor(page, selector = '.${blockName}', nth = 0) {
    this.page = page;
    this.block = page.locator(selector).nth(nth);
    this.headings = this.block.locator('h1,h2,h3,h4,h5,h6');
    this.paragraphs = this.block.locator('p');
    this.links = this.block.locator('a');
    this.buttons = this.block.locator('button');
    this.images = this.block.locator('img');
  }
}`
        : `class ${safeClassName}Block {
  constructor(page, selector = '.${blockName}', nth = 0) {
    this.page = page;
    this.block = page.locator(selector).nth(nth);
    this.headings = this.block.locator('h1,h2,h3,h4,h5,h6');
    this.paragraphs = this.block.locator('p');
    this.links = this.block.locator('a');
    this.buttons = this.block.locator('button');
    this.images = this.block.locator('img');
  }
}
module.exports = ${safeClassName}Block;`;
      fs.writeFileSync(blockPageFile, pageJs, 'utf-8');
    }

    // Test File (multiple variants)
    const variantsCode = schema.variants.map((f, i) => `
  // Test ${i}: ${safeClassName} ${f.name.replace('@', '')}
  test(\`[Test Id - \${features[${i}].tcid}] \${features[${i}].name}, \${features[${i}].tags}\`, async ({ page, baseURL }) => {
    const { data } = features[${i}];
    const testUrl = \`\${baseURL}\${features[${i}].path}\`;
    console.info(\`[Test Page]: \${testUrl}\`);
    const block = new ${safeClassName}Block(page, features[${i}].selector);

    await test.step('Navigate to page', async () => {
      await page.goto(testUrl);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(testUrl);
    });

    await test.step('Verify content', async () => {
      await expect(block.block).toBeVisible();
      if (data.headings?.length)
        for (let j = 0; j < data.headings.length; j++)
          await expect(block.headings.nth(j)).toContainText(data.headings[j]);
      if (data.paragraphs?.length)
        for (let j = 0; j < data.paragraphs.length; j++)
          await expect(block.paragraphs.nth(j)).toContainText(data.paragraphs[j]);
      if (data.subElements?.length)
        for (const el of data.subElements) {
          const locator = block.block.locator(el.selector).nth(el.nth ?? 0);
          await expect(locator).toContainText(el.text);
        }
    });

    await test.step('Accessibility validation', async () => {
      await runAccessibilityTest({ page, testScope: block.block });
    });

    await test.step('SEO validation', async () => {
      await runSeoChecks({ page, feature: features[${i}] });
    });
  });`).join('\n\n');

    const testJs = isESM
      ? `import { expect, test } from '@playwright/test';
import { features } from './${blockName}.spec.${ext}';
import ${safeClassName}Block from './${blockName}.page.${ext}';
import { runAccessibilityTest } from '../../libs/accessibility.${ext}';
import { runSeoChecks } from '../../libs/seo-check.${ext}';

test.describe('${safeClassName} Block test suite', () => {
${variantsCode}
});`
      : `const { expect, test } = require('@playwright/test');
const { features } = require('./${blockName}.spec.${ext}');
const ${safeClassName}Block = require('./${blockName}.page.${ext}');
const { runAccessibilityTest } = require('../../libs/accessibility.${ext}');
const { runSeoChecks } = require('../../libs/seo-check.${ext}');

test.describe('${safeClassName} Block test suite', () => {
${variantsCode}
});`;

    fs.writeFileSync(blockTestFile, testJs, 'utf-8');
    console.log(chalk.green(`📄 Created test: ${blockTestFile}`));
  }

  // === Missing variant message ===
  if (variantArg && !matchedVariant) {
    console.warn(
      chalk.yellow(
        `⚠️ Variant '${variantArg}' for block '${blockArg || 'unknown'}' was not found on the page — no changes made.`,
      ),
    );
  }

  // === Summary ===
  console.log(`\n${chalk.green.bold('✅ Nala Test Generation Complete!')}\n`);
  console.log(`${chalk.cyan('📦 Summary:')}`);
  console.log(`  • ${chalk.green('New Added')} : ${newCount}`);
  console.log(`  • ${chalk.yellow('Updated')}   : ${updatedCount}`);
  console.log(`  • ${chalk.red('Deleted')}   : ${deletedCount}`);
  console.log(`  • ${chalk.gray('Skipped')}   : ${skippedCount}\n`);
  console.log(`${chalk.cyan('📁 Output Directory:')} nala/blocks`);
  console.log(chalk.magenta('✨ All files created/updated successfully.\n'));
})();
