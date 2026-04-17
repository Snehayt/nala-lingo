# nala-lingo

This repository contains NALA automation and **Express** Playwright tests, including **lingo-geo** coverage.

## Playwright configs

| Config | Tests | Purpose |
|--------|--------|---------|
| **`playwright.config.js`** | `./nala` (`**/*.test.cjs`) | Default NALA suite. |
| **`playwright.express.config.js`** | `./tests/express` | Express + lingo-geo; uses `LINGO_GEO_ENV` and `envs/env.js` for URLs. |

Always pass **`--config=playwright.express.config.js`** when running Express tests so Playwright does not pick the default NALA config.

**CI** (e.g. `nala/utils/pr.run.sh`) runs the **default** **`playwright.config.js`** NALA suite, not Express. Run Express lingo-geo **locally** (or extend CI) with **`--config=playwright.express.config.js`**.

## Express lingo-geo layout

| Path | Role |
|------|------|
| **`playwright.express.config.js`** | Express Playwright config, browser projects, `resolveLingoGeoPath` export. |
| **`envs/env.js`** | URL map, including **`@express_lingo_stage`** and **`@express_lingo_prod`**. |
| **`features/express/lingo-geo.spec.js`** | Feature rows (paths, tags, expectations). |
| **`tests/express/lingo-geo.test.js`** | Playwright tests. |
| **`selectors/express/lingo-geo.page.js`** | Page object and assertions. |

## Environment

- **`LINGO_GEO_ENV`** — `stage` or `prod` / `production` to match Adobe/BACOM hosts used when resolving spec paths. If unset, path logic defaults to **stage**; Playwright **`baseURL`** falls back to **`@express_lingo_stage`**.
- **`BASE_URL`** — Optional override for **`baseURL`** (see `resolveExpressBaseUrl()` in `playwright.express.config.js`).

Set variables in the shell for the command (see below), in CI, or via tooling such as `cross-env` if you add npm scripts.

## Install

```bash
npm ci
npx playwright install
```

## Run Express tests

From the repository root, use **`--config=playwright.express.config.js`**. Browser projects include **`da-express-live-chrome`**, **`da-express-live-firefox`**, **`da-express-live-webkit`**, and mobile projects (see the config file).

### Headless and headed

- **Headless** — Default. No browser window; best for CI and large runs.
- **Headed** — Pass **`--headed`** to open a real browser window (debugging, visual checks).

### Workers

In **`playwright.express.config.js`**, **`workers`** is **`2`** when **`CI`** is set; locally it defaults to Playwright’s default (parallelism based on your machine).

For **local** Express runs, **prefer `--workers=6`** for a good balance of speed and load (lower if your machine struggles; never exceed what your environment can handle).

Example:

```bash
npx playwright test --config=playwright.express.config.js --project=da-express-live-chrome --workers=6
```

### PowerShell (Windows)

```powershell
# Stage
$env:LINGO_GEO_ENV = "stage"
npx playwright test --config=playwright.express.config.js --project=da-express-live-chrome --workers=6

# Prod
$env:LINGO_GEO_ENV = "prod"
npx playwright test --config=playwright.express.config.js --project=da-express-live-chrome --workers=6
```

Example with tag filter and headed browser:

```powershell
$env:LINGO_GEO_ENV = "prod"
npx playwright test --config=playwright.express.config.js --project=da-express-live-chrome --workers=6 --grep "@your-tag" --headed
```

### Bash / Git Bash / WSL

```bash
LINGO_GEO_ENV=prod npx playwright test --config=playwright.express.config.js --project=da-express-live-chrome --workers=6
```

Quote grep patterns when needed, for example `--grep "@express-lingo-geo-suite"`.

## Reporting

Express config uses the same reporter stack as **`playwright.config.js`**: **`github`**, **`list`**, and **`./nala/utils/base-reporter.js`** in CI; **HTML** (under **`test-html-results/`**), **`list`**, and **base-reporter** locally. Optional Slack notifications apply when **`SLACK_WH`** is set, consistent with NALA.

## Output directories

Playwright writes **`./test-results`** (artifacts, traces) and **`./test-html-results`** (HTML report). Both are listed in **`.gitignore`** and are created when tests run; they do not need to exist in the repo beforehand.

## npm scripts

Root **`package.json`** may not define Express shortcuts yet. You can add scripts (optionally with **`cross-env`**) that set **`LINGO_GEO_ENV`** and invoke **`playwright test --config=playwright.express.config.js`** so the team shares one command per environment.
