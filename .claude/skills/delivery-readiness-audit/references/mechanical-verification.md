# Check the change, then open the pages

A clean diff can still ship a broken page. Use two separate checks when a delivery includes a web application: inspect the changed code, then visit the application's routes in a browser. This reference explains where the optional tools fit in the pack's final audit.

| Component | Its job | What a pass leaves unproved |
|---|---|---|
| Vibecoding Skill Pack | Define the work and reconcile the evidence against the request | Whether the proposed checks actually ran |
| [Agent Code Gates](https://github.com/danilolapegna/agent-code-gates) | Inspect a Git change for configured problems, such as debug residue or missing evidence | Whether the application boots or a page works |
| [Deep Smoke](https://github.com/danilolapegna/deep-smoke) | Open declared and discoverable routes as configured visitors and detect rendering failures | Correct data, completed transactions, visual quality, security or routes absent from the inventory |

The programs remain independent projects. Copying this pack installs neither one. If your project already covers these tasks with its own checks, keep those and attach their results to the audit.

## Try the complete example first

In the pack checkout, open `examples/03-mechanical-verification/README.md`, or [read it on GitHub](https://github.com/danilolapegna/vibecoding-skill-pack/tree/main/examples/03-mechanical-verification). It installs fixed revisions of the two programs and runs them against a small local site. You can see a debug statement blocked, a broken page missed by a narrow route list, and the same page caught when the list is complete. No credentials, hooks or live service are involved.

## Apply the checks to your project

First identify the proposed Git commit, the production-build command, the local preview URL, the routes the change can affect and the visitor roles allowed to access them. Reconcile the route list with the router or generated build; links alone will miss pages reached through buttons or forms. For authenticated pages, follow Deep Smoke's persona instructions and keep session files out of version control. Arrange a safe test environment before crawling pages that may have effects on load.

With the maintainer's approval, add the tools as development dependencies. The example's `package.json` records the exact revisions tested together; review those revisions and use a lockfile. Installing only the skill requires no Node dependencies. **Do not install hooks automatically:** they can replace an existing hook or change when a commit is allowed.

Before running the crawl, configure `deep-smoke.config.json` for the actual application, including its routes and, where relevant, personas and protected prefixes. The example's anonymous three-page site is a demonstration, not an application inventory to copy.

Run from the project root, using installed local binaries. Replace the URL with your production-build preview:

```bash
# Inspect the commit you intend to ship.
# For uncommitted work, stage only the intended files and use --staged instead.
# Unstaged changes are not inspected.
./node_modules/.bin/agent-code-gates --commit HEAD --json

# Start the project's production-build preview separately, then crawl it.
./node_modules/.bin/deep-smoke --level=3 --url=http://localhost:4173 --json

# Check whether the saved browser evidence is still usable for the current code.
./node_modules/.bin/deep-smoke verify --level=3
```

Run the project's unit, integration and business-journey tests as well; a page displaying incorrect numbers can pass a rendering check.

## Read the result before deciding

Agent Code Gates exits `0` when no configured gate blocks the change, `1` when one does, and `2` when it cannot run correctly. Read the individual gates: an irrelevant check can be skipped without testing anything. Deep Smoke exits `0` for a passing crawl or accepted evidence, `1` for failed checks, `2` for invalid usage/configuration and `3` when the environment cannot run the crawl. A missing browser is an unavailable check, never a passing one.

Retain each command, exit code, raw result, commit, configuration, route/persona coverage and timestamp. A crawl of a local build is local evidence. After deployment, verify the served artifact and the relevant live journey separately; these commands do not deploy anything.

Before reusing browser evidence, run `verify`. Read the stored result's scope too: a passing level-3 crawl cannot establish that your inventory contains every important route. Config changes and deployment identity need explicit review even when the freshness check accepts the file. An incomplete inventory remains incomplete evidence.

Feed these results back into the audit's existing surface table and three verdicts. Any missing requirement stays PARTIAL or NOT-STARTED. Neither a successful command nor a generated JSON file can decide READY by itself.
