# A code check passes. Does the page open?

This example connects the pack's final audit to two independent command-line programs. Agent Code Gates inspects a Git change; Deep Smoke opens web pages in a browser. Run them against the same small site to see where each check helps and what a passing result can miss.

The site has an overview, a help page and an orders page. Orders has no incoming link, so it must appear in the route inventory. One scenario gives that page an error boundary: the HTTP request succeeds, but the page tells the visitor that orders could not load.

## Run from a clean checkout

You need Git, Node.js 20 or later, npm and a Chromium browser installed by Playwright. The initial installation downloads development tools and a browser; the scenarios themselves use only localhost, with no accounts or external services.

```bash
git clone https://github.com/danilolapegna/vibecoding-skill-pack.git
cd vibecoding-skill-pack/examples/03-mechanical-verification
npm ci --ignore-scripts
./node_modules/.bin/playwright install chromium
npm test
```

The lockfile fixes the dependencies, including full Git revisions of Agent Code Gates and Deep Smoke. The test command runs the real installed CLIs; it does not replace them with mocks. No hook is installed and your application repository is never staged. Each scenario creates its own temporary Git repository and closes its local server when finished.

## What you should see

| Scenario | Changed-code check | Browser crawl | Meaning |
|---|---|---|---|
| `healthy` | Exit 0 | Exit 0; fresh evidence accepted | The declared checks passed for this fixture |
| `debug` | Exit 1, `DEBUG_RESIDUE` | Exit 0 | The page renders despite a debug statement added to source |
| `broken` | Exit 0 | Exit 1, orders error boundary | A clean static check did not reveal the broken page |
| `omitted-route` | Exit 0 | Exit 0, orders never visited | An incomplete inventory produced a narrow PASS |
| `stale` | Exit 0 | Exit 0 initially; evidence verification later exits 1 | A code change after the crawl invalidated its evidence |

`npm test` succeeds only when all of these outcomes match, including the expected failures and the missing route. This is a test of the integration's boundaries, not a claim that every scenario is a healthy application.

To inspect one scenario yourself:

```bash
npm run demo
node run.mjs broken
node run.mjs omitted-route
node run.mjs stale
```

The `broken` and `stale` commands exit 1 deliberately. The demo preserves each tool's raw output and exit code under `evidence/`, alongside the configuration, local URL and fixture path in `receipt.json`. Temporary repositories remain in the system temporary directory for inspection. Remove only the fixture paths printed by your runs when you no longer need them; the example never cleans up another project.

## Use it in a real delivery

Return to [Mechanical verification](../../.claude/skills/delivery-readiness-audit/references/mechanical-verification.md) for the project workflow. Use your router or build output to establish the real route inventory, configure visitor roles, run the production build, then keep both static and browser results with the commit under review. Retain existing tests for business behavior and data correctness.

This example enables only `DEBUG_RESIDUE` in Agent Code Gates so the comparison has one clear static check. A real project must select its own applicable gates. It tests anonymous rendering, not login, transactions, visual design, accessibility, performance or security. No coding assistant is invoked by this test: installing and reading a skill does not prove a model will follow it. The audit still owns the delivery verdict.

## If it cannot run

An installation failure is not a test result. Check network access to GitHub and the npm registry. If Deep Smoke exits 3, inspect its saved error: a missing browser can usually be resolved with the Playwright installation command above. Exit 2 indicates invalid usage or configuration. Do not edit the expected results to turn an unavailable check green.
