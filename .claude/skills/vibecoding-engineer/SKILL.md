---
name: vibecoding-engineer
description: >
  Production-ready prompt generator for industrial-scale agentic vibecoding.
  From a product spec and a technical architecture, generates a complete set
  of prompts for architecture, feature, testing, CI/CD, security, deployment,
  with an Anti-Pattern Registry of 38 failure modes integrated by design.
  Each generated prompt declares which failure modes it prevents and which
  test gates verify them. Use this skill when the user mentions generating
  prompts for AI coding assistants (Cursor, Lovable, Claude Code, Devin, GitHub
  Copilot Workspace), vibecoding sessions, spec-driven development, or
  production-ready code generation from requirements. Triggers: "vibecoding",
  "generate development prompts", "spec to code prompts", "production-ready AI
  coding prompts", "Cursor rules generation", "Lovable prompt sequence",
  "agentic coding playbook", "engineering prompt sequence". Use it whenever
  the user wants prompts that guide an AI coding assistant through a
  structured build, even without saying "vibecoding".
last_updated: 2026-10-01
schema_version: 2
license: MIT
maintainer: github.com/danilolapegna
---

# Vibecoding Engineer, Production-Ready Prompts with Anti-Pattern Registry

> The canonical skill for generating prompts aimed at AI coding assistants working in vibecoding mode. Output: an ordered sequence of self-contained prompt templates, traced back to the requirements in the product spec, with explicit coverage of 38 known failure modes: 12 in agentic system design, 14 in production delivery, 12 in verification and evidence.

## Quality Gate Profile

- Type: content (it generates prompt templates, not production code)
- Writes key data: no
- Requires a writing-style sample: optional (for voice-coherent phrasing)
- Pre-flight research: yes, for current stack-specific best practices
- Failure mode coverage: mandatory, for every prompt

## Edge: Spec-Driven + Gate-Integrated + Context-Layered + FM-Aware

1. Spec-Driven: every prompt derives directly from the product spec and the technical architecture, never from vague descriptions. Functional requirements become executable instructions, each traced by a unique REQ-ID.
2. Gate-Integrated: constraints coming from the security check, the performance audit and the devops readiness review are folded into every prompt as guardrails, not bolted on as a separate post-coding step.
3. Context-Layered: every prompt carries the context the AI coding assistant actually needs (DB schema, API contracts, dependency list, coding standards), which kills the prompt, error, re-prompt cycle.
4. FM-Aware: every prompt is check-listed against the Failure Mode Registry (38 FM-XX). Preventive patterns are built into the prompt template by design. Test gates are auto-suggested for every FM-XX relevant to the context. Deployment and CI/CD prompts draw mostly from Part B of the registry, architecture prompts from Part A, and testing prompts, or any prompt that asks for proof, from Part C.

Framework: Specification-First Prompting + Defense-in-Depth + Failure-Mode-Preventive.

## Dependencies (soft, optional context)

The skill looks for these files in the project's `context/` folder. If they are missing, it proceeds with generic best practices and flags the gap explicitly.

- `context/product-spec.md` mandatory: feature list, functional requirements, data model
- `context/technical-architecture.md`: stack, components, APIs, deployment target
- `context/codebase-state.md`: repo state, code structure, existing CI/CD
- `context/security-check.md`: known vulnerabilities, OWASP checklist, auth requirements
- `context/performance-audit.md`: bottlenecks, performance targets
- `context/devops-readiness.md`: CI/CD pipeline, infrastructure, monitoring
- `brief.yaml`: preferred stack, team size, technical skills

If `product-spec.md` does not exist, stop and ask the user for at least a minimal product spec.

## Process (8 steps)

### 1. Requirements inventory

Read the product spec and the technical architecture. Extract components, features, data model, API endpoints, auth model, stack, deployment target and coding standards.

### 2. Map prompts to requirements (traceability matrix)

For every feature, decide which prompts are needed. Each prompt must trace back to its originating REQ-ID and list the FM-XX it blocks by design.

| Component | Feature | Prompt type | Priority | FM-XX prevented |
|---|---|---|---|---|
| [comp] | [feat] | architecture | P0 | FM-04, FM-05 |
| [comp] | [feat] | feature | P0 | FM-03, FM-07, FM-12 |
| [comp] | [feat] | testing | P1 | FM-06 |
| [comp] | [feat] | security | P1 | FM-08 |

### 3-7. Prompt generation per layer

For each of the 6 layers (architecture, feature, testing, CI/CD, security, deployment), generate prompts that follow the canonical format:

```
## Context
[Stack, architecture, constraints, everything the AI must know BEFORE writing code]

## Requirement
[What it has to do, linked to REQ-XXX]

## Constraints
[Security, performance, standards]

## Anti-pattern blocked
[FM-XX prevented by this prompt by-design]

## Expected output
[Files, structure, tests it must produce]

## Acceptance criteria
[How to verify the code, including the FM-XX test gates]
```

Anti-ambiguity rule: every prompt is self-contained and executable without reading any other prompt.

### 8. Quality Gate Review

For EVERY generated prompt: a specific requirement traced, self-contained context, verifiable criteria, security constraints built in, expected output specified, FM-XX blocked and test gates declared.

---

## Failure Mode Registry (canonical reference)

> Origin: catalogued from real post-mortems of production-grade agentic systems. 38 failure modes that keep recurring across projects.
>
> The registry has three parts. **Part A (FM-01 to FM-12)** covers the DESIGN of an agentic system: how the agent reasons, where it keeps state, what it shows the user. **Part B (FM-13 to FM-26)** covers DELIVERY: the ways green code reaches production and does not work. **Part C (FM-27 to FM-38)** covers EVIDENCE: the ways a test, a gate, a report or a status line says "true" about something that is not. Part B was the v0.2 addition and Part C is the v0.3 addition; both come out of real post-mortems.
>
> The distinction matters because the three groups are prevented at different moments. Part A is prevented while you design the agent, so it lives in the architecture prompts. Part B is prevented while you ship, so it lives in the CI gates, the hooks and the post-deploy probes. Part C is prevented while you decide what counts as proof, so it lives in the tests, in the gates themselves and in every place where an agent reports what it did. A prompt that covers only Part A produces a well-designed agent that nobody manages to get into production. A pipeline that ignores Part C produces green checks that certify nothing.

### Part A, agentic system design

| ID | Symptom | Preventive pattern | Test gate |
|---|---|---|---|
| FM-01 | Orchestrator loops in circles, collecting ideas with no goal | Alignment score logged for every skill invocation, periodic audit aborts the run below threshold | `orchestrator-goal-filter.test` |
| FM-02 | Panic-mode budgeting (a tight token cap that hard-cuts the run) | Stop conditions = quality gate reached OR user-in-the-loop checkpoint | `stop-conditions.test` |
| FM-03 | Orphan artifacts (outputs produced and never used) | Schema-level resolvability plus a lifecycle state machine for every artifact | `artifact-schema-contract.test` |
| FM-04 | New skills break onboarding | Runtime capability registry plus a JSON-logic DSL for skill discovery | `capability-registry-discovery.test` |
| FM-05 | Parallel runs cause corruption | State persistence plus an atomic (user, resource) lock | `concurrent-run-lock.test` |
| FM-06 | Disconnected cache fails silently | Cache-first mandatory plus atomic fail-loud writes | `cache-write-completion.test` |
| FM-07 | Self-as-competitor | Deterministic post-LLM self-entity filter plus identity resolution | `self-entity-filter-integration.test` |
| FM-08 | Agentic garbage visible to the user | Admin/user parity with an automatic string scan | `user-ui-no-jargon.test` |
| FM-09 | Configuration as a static, manual decision tree | Configuration as a semi-deterministic, LLM-guided prompt | (architectural invariant, audited in code review) |
| FM-10 | UI agents treated as second-class | Mandatory pairing with retrieving agents | `ui-agent-pairing.test` |
| FM-11 | Shotgun quick-action menu before the prompt | Prompt-only home plus an LLM-guided runtime | `home-no-quick-actions.test` |
| FM-12 | Numbers pulled out of thin air passed off as fact | Schema: every number carries an `evidence_class` enum (Verified/Declared/Inferred) | `numeric-claim-tagging.test` |

### Part B, delivery and production

> The common thread: every row below is a conflation of two things that look identical and are not. Compiles is not boots. Boots is not reachable. Renders is not works. Local is not deployed. Green in CI is not live for the user.

| ID | Symptom | Preventive pattern | Test gate |
|---|---|---|---|
| FM-13 | A "successful" build that ships a dead bundle: the client env vars are missing and the app goes to a white screen at boot | Fail-closed guard in the build: if a required env var is missing, the build FAILS (the last good deploy stays live). The check runs on the channel where commits actually land, not only on pull requests | `build-env-guard.test` |
| FM-14 | "Renders" read as "works": the smoke test mounts a component on fake data locally, and the result gets taken as proof about the deployed surface | The evidence declares three fields: `data` (real or stubbed), a success criterion that names the real CONTENT expected (never "rendered", never "no crash"), and the deployed URL that was verified | `smoke-evidence-substance.test` |
| FM-15 | Split deploy: the frontend goes out with the push while migrations and functions need a separate apply, so the two halves diverge by default | A deploy manifest that lists every artifact and the confirmation it landed; "done" stays blocked until both halves are confirmed | `split-deploy-parity.test` |
| FM-16 | Compiles but does not boot: the type check passes and the deployed artifact dies at startup (the classic: a duplicate export in a shared module that takes down every importer) | Post-deploy boot probe against the real gateway for every changed function; when a shared module changes, the probe runs against all its importers, not just the file you touched | `boot-probe.test` |
| FM-17 | Boots but cannot be triggered: the endpoint answers 200 to your test calls and rejects the credential its real scheduler sends. The feature never runs, silently | A canonical auth helper that accepts every credential the real trigger can present, verified against the actual trigger rather than against an assumption | `trigger-auth.test` |
| FM-18 | The credential dies with the code unchanged: auth breaks in production without anyone having deployed anything | Scheduled probe OUTSIDE the platform that extracts the key from the DEPLOYED bundle and tests that one against the real auth endpoint. Testing an assumed key produces false alarms at the first drift | `auth-health.test` (cron, off-platform) |
| FM-19 | A test runner that will not start treated as a skip: "tests didn't run" accepted as a delivery state | One canonical command that repairs the environment and then runs everything, propagating the exit code of every child process. A skip whose reason is a broken environment is REJECTED; a skip justified by scope stays legitimate | `runner-boot.test` |
| FM-20 | Fake axes: a step or a wizard offers a choice the frontend INFERRED rather than one the server DECLARED. It looks like a decision and nothing backs it | Every decision element cites the code location of the server field that declares it (two-sided citation). If that field does not exist, it gets confessed as derived or inert, not passed off as a real choice | `decision-provenance.test` |
| FM-21 | Self-attested integration: both sides compile, each one is internally valid, and the contract between them does not match (ignored fields, diverging scopes, misaligned enums) | Independent audit that reads BOTH sides of every contract and cites the two code locations. Self-attestation cannot see the mismatch by construction: each side is valid on its own | `integration-contract.test` |
| FM-22 | Reactive removal: you delete files or exports and discover the call sites when something breaks at runtime | Forward search for ALL call sites before the removal, a classification of each one (comment, live code, test, doc), and the refactor in the same commit as the drop | `drop-impact.test` |
| FM-23 | Ephemeral data with no lifecycle: a TTL column with no index, no cleanup mechanism, no declared retention. Rows pile up silently for months | Index on the TTL column, a declared cleanup mechanism and documented retention IN THE SAME migration that creates the table. "We will add the cleanup later" is not enforceable | `ephemeral-lifecycle.test` |
| FM-24 | "Done" declared at 70%: the missing features are not declared partial, they simply go unmentioned | Every requirement of the original request (not of the plan, see FM-28) gets an explicit DONE, PARTIAL, NOT-STARTED or SKIPPED status, and SKIPPED needs the approver's reason. Silence is not a status. A request-versus-shipped table, never prose | `plan-delta.test` |
| FM-25 | Publication inferred from the interface: a toast, a panel that closes or a push that succeeded, all read as proof the thing is live | The proof is read from the SERVED ARTIFACT: download the deployed bundle and look for a marker that survives minification, plus a control marker that must NOT be there. A UI event proves nothing | `publish-artifact.test` |
| FM-26 | Version control metadata inside a cloud-sync folder: the syncer rewrites objects and refs while git is working on them, producing jumping HEADs and corrupted rebases | Exclude the repo metadata from the sync (the same mechanism you already use for installed dependencies) and probe integrity at the start of the session, before writing | `vcs-location.test` |

### Part C, verification and evidence

> The common thread: every row below is a claim that got believed without evidence. A test that agrees with the code it was copied from. A plan that grades itself. A gate that only reads the diff. A baseline that absorbs new failures. A proof reused after a change it never saw. A type check that never meets the tests. A policy that reads right. An empty list. The model's account of what it did. A status 200. An agent's account of what it changed, and of what it cannot do. A green check is a claim about the check. It becomes evidence about the system only after it has been seen failing on the thing it guards.

| ID | Symptom | Preventive pattern | Test gate |
|---|---|---|---|
| FM-27 | Self-confirming tests: the agent that wrote the code also wrote the tests, and the expected values were read off the implementation. The suite is green by construction and pins the bug in place: failed requests kept charging users while the tests asserted exactly the charging call, and a migration that broke on its first production apply had passed a parity check that compared the broken text with itself | Oracles come from the requirement, from a baseline captured before the change, or from the real engine (a real database parses the SQL, a real parser reads the payload). Every new or changed test is seen failing once: on the parent commit, on a seeded mutant, or with the fix reverted | `oracle-independence.test` (changed tests must fail on the parent commit or on a seeded mutant and pass on HEAD; migrations run on a real engine inside a rolled-back transaction, never compared as text) |
| FM-28 | The plan proves itself: the request gets compressed into a plan, the plan quietly drops part of the mandate, and the final gate checks the delivery against the plan. Everything it was asked to check is there, so it reports 100%. A related form: one check stands in for a requirement that bundles several properties, and passes on file presence or a keyword | Freeze the original request outside the work and give every requirement an ID and an explicit disposition. Split bundled requirements into atomic acceptance criteria and bind every check to the criterion it proves. A scope cut is recorded as a gap, never applied retroactively to the denominator | `request-parity.test` (fails when a requirement of the frozen request has no disposition or no bound check; a fixture that deletes the same requirement from both plan and delivery must still FAIL) |
| FM-29 | Diff-scoped gate, cumulative risk: the access-rule gate inspects only what a change adds. Rules older than the gate, and schema changes made outside version control and its hooks (a hosted editor, a console), are never seen, while production evaluates all of them. A critical "readable by everyone" finding stays open for days with every commit green. The same blindness hits migrations tested on an empty database: the older constraint that the new code violates does not exist there, so the test cannot fail | Rebuild the effective state by replaying the full migration history, at the base and at the candidate, and block what the candidate introduces. Audit the whole cumulative state on a schedule. If the full replay is broken, repair it before trusting any migration test. Tables that are public on purpose live in an allowlist, each with a stated reason | `cumulative-state-replay.test` (fixture: an old open-read rule, and a new value that an older constraint rejects, must both FAIL on the replayed state, while the same diff passes on an empty database) |
| FM-30 | The baseline swallows new failures: known failures are baselined so that old debt does not block new work, but the baseline matches by gate name or by count. One accepted type error waves through every new one (a single baselined error let a commit with forty new ones pass), and a baselined "evidence missing" switches that gate off for every future change | Key each baseline entry by diagnostic identity (file, rule, message fingerprint) with an expiry date. A runner crash and a per-change evidence check can never be baselined. Baselines are created by an explicit decision, never as a side effect of installing or upgrading the gate | `baseline-identity.test` (two different errors at an equal count must not match; an opaque non-zero exit must not match; baselining an evidence check is rejected; an upgrade leaves the baseline bytes unchanged) |
| FM-31 | Evidence keyed to the wrong identity: a proof is reused after a change it never saw, or thrown away after a change it never depended on. Too narrow: the frontend fingerprint left out server modules that the pages import, so a change there would have read as "unchanged". Too broad: a fix to the verifier alone made an unchanged deployed product look stale and reopened unrelated evaluations and rollouts | Every receipt names its subject and its verifier separately and is keyed to a declared input domain: the import closure plus tests, configuration and toolchain. A commit that only touches documentation or the checks themselves may change the verifier, never the subject. An input the key cannot classify invalidates the receipt | `evidence-fingerprint-domain.test` (mutation pairs: a change inside the domain, transitive imports included, invalidates; a docs-only or verifier-only change does not; evidence without a subject commit is rejected) |
| FM-32 | The type checker never meets the tests: a type error in a test file passes three green gates, because the type check starts from the application entry points, which never import tests, and the test runner transpiles without checking types | Type-check test modules as their own surface, discovered with the runner's own patterns. Trigger it on test, configuration and lockfile changes, and keep its accepted count separate, so that test errors cannot hide inside the application baseline | `test-typecheck-coverage.test` (the set of files the runner executes must be a subset of the files the type checker sees; an injected type error in a test must FAIL) |
| FM-33 | Authorization proven by reading the policy: the access rule reads right, or the migration that changes it "succeeded", and the effective access is something else. A guard covered inserts only while a policy let owners update their own row, so any signed-in user could repoint their own row at a resource they had not paid for. A revoke on a schema owned by the platform was a silent no-op in production. A stricter policy was added while the old permissive one stayed active, combined with OR | Write each invariant for every write verb, with column immutability for unprivileged writers. Drop superseded policies explicitly. Views run with the caller's rights. Never grant or revoke on schemas the platform manages. Run the platform's security linter in CI, not at publish time | `negative-access-probe.test` (with real anonymous and signed-in sessions on a production-equivalent database, attempt cross-tenant reads and updates to protected or escalating columns, and assert they are denied or leave the row unchanged; every insert guard has an update twin) |
| FM-34 | Absence read as health: an empty list, a zero, a "no permission" or a quiet monitor is shown as a fact when the read behind it failed. The data library returns its default on error and nobody checks the error flag: an approvals queue says "nothing waiting" while the backend errors, a failed role lookup locks out a real admin, a nightly job fails every night for months and nobody counts it. A scheduled job stops for two days while every health check stays green: nothing failed, because nothing ran | Reads that feed a decision return three states: data, genuinely empty, unavailable. Authentication and billing paths fail closed on a failed read. Monitors check that the expected work happened, not only that nothing failed. Every active schedule can be triggered on demand by a scheduler you control | `absence-vs-failure.test` (fixtures where the read is rejected must render "unavailable", never the empty state or an access decision; a static scan for default-on-error with no error branch; an overdue-work sentinel that fails when an occurrence is past due with no run receipt) |
| FM-35 | Model narration presented as system truth: what the model says it did, read or cited reaches the user as fact. A request correctly classified as something the product does not schedule is followed by "I've scheduled the send". A metric counts as "sourced" because the model's JSON contains a URL, although no search ran. A methodology note says pages were analyzed when zero were fetched | Statements about state, side effects, coverage and provenance are built by the server from receipts: the resolved plan, database rows, tool results captured at the transport. Model prose stays a proposal or a diagnostic, never the status line | `claims-from-receipts.test` (adversarial model outputs that claim a side effect, cite a URL absent from the tool results, or report pages read with zero fetches must not reach the user-facing contract, and the evidence class must drop) |
| FM-36 | Transport success read as model success: an HTTP 200 gets treated as "the model answered correctly". Seen in practice: server-side tools that report their errors inside a successful response; a greedy JSON extractor that mangled a valid reply, which was then logged as "provider unavailable"; an exhausted credit balance that arrives as a generic 400, so the credit error class never fires; a list field returned as a string and iterated character by character, which rewrote eighty instruction files into one-letter bullets while the log counted them as additions | Classify every model call at three layers: did a response arrive, does it contain a parseable value, does that value meet the contract. Use one shared balanced JSON extractor. Validate the shape of every schema field at the boundary and coerce only what is safely coercible, with a warning. Inspect tool-result blocks for embedded errors. Build the error taxonomy from captured provider responses, not from what status codes are supposed to mean | `provider-wire-fixtures.test` (captured real responses, including a 200 carrying a tool error, a low-credit 400 body, JSON followed by prose and a changed field shape, each map to the expected typed class; a string where a list is expected becomes one element with a warning, never one element per character) |
| FM-37 | The agent's account of its own changes, believed without the log: a delegated agent (an app builder's assistant, a coding agent in another session) reports that nothing was changed or committed, and the main branch shows its commits. It hit an error in its own environment, fixed it on its own initiative and called the fix local. Twice in one day; the second time it had been asked only to report the error | Snapshot the remote branch head before every delegated turn and diff it afterwards. Any commit the agent did not declare, and any commit under a read-only mandate, fails the step. The prompt says "report, do not fix", and reconciliation reads the version-control log, never the agent's summary | `agent-write-attestation.test` (fails when the log between the two snapshots contains undeclared commits, or any commit at all when the mandate was read-only) |
| FM-38 | Inherited "can't": "I can't push from here", "this has to be done by hand", "the next session will do it". The claim comes from memory of which tools were loaded, or from a one-line summary of a rule, and once it is written into the instructions every later session inherits it. Work goes back to the human for a capability that exists: two days of handed-back pushes that worked on the first real attempt; a small write postponed by a run that had just written a far larger file | Before claiming a capability is missing, run tool discovery and make the smallest real attempt, then attach the command and its error. Every documented blocker carries a retest command and a verification date. Compound blockers ("A and B") are split and tested one at a time. A run that already did something bigger cannot call the smaller task impossible | `inability-claim-receipt.test` (a report paragraph containing a known inability phrase fails unless it carries `missing-capability: <what, verified how>` with real content; the phrase list grows only from claims that were written and later disproven) |

**How to use the Registry**:

1. For every prompt you generate, scan the context for patterns that match an FM-XX
2. Add an `## Anti-pattern blocked` section listing the FM-XX prevented
3. For every FM-XX blocked, add the suggested test gate under `## Acceptance criteria`
4. Audit log: every shipped feature logs the FM-XX it covers in the PR description
5. A test gate counts only after it has been seen failing on the thing it guards (FM-27): the acceptance criteria name the negative control, not only the green run

**Golden rule**: every shipped feature MUST answer, in the PR description, "Which FM-XX does it avoid or not reintroduce? Which test gate covers it?". No answer, PR blocked.

## Worked example

See `examples/01-orchestrator-prompt/` and `examples/02-feature-prompt-with-fm-coverage/` for fully rendered templates.

---

## Rules

- NEVER generate vague prompts like "build an app for X". Every prompt is specific and FM-aware
- NEVER omit the security context
- NEVER generate a prompt without acceptance criteria
- Every prompt MUST be self-contained
- If the product spec is incomplete, flag the gap with `[GAP: missing detail]`
- Execution order is explicit (numbered, with dependencies)
- If the stack is not defined, ask BEFORE generating
- Every prompt MUST list the FM-XX it blocks plus the test gates

## Date / Timestamp handling

Every human-readable date cited MUST be verified with a bash check BEFORE publishing. Never do the arithmetic in your head.

## Anti-pattern enforcement step

Before delivering, run these automated checks:

```bash
OUTPUT_DIR=${OUTPUT_DIR:-deliverables/vibecoding-engineer}

# Check 0: there is something to check. A missing folder, or a file with no
# prompts in it, must not read as a pass
ls "$OUTPUT_DIR"/*-prompts.md >/dev/null 2>&1 || { echo "FAIL: no *-prompts.md files in $OUTPUT_DIR"; exit 1; }
TOTAL=0
for f in "$OUTPUT_DIR"/*-prompts.md; do
  head -n 1 "$f" | grep -q "^N/A:" && continue   # a layer declared not applicable, with its reason
  n=$(grep -c "^## Requirement[[:space:]]*$" "$f")
  [ "$n" -gt 0 ] || { echo "FAIL: $f contains no prompts (start it with 'N/A: <reason>' if the layer does not apply)"; exit 1; }
  TOTAL=$((TOTAL + n))
done
[ "$TOTAL" -gt 0 ] || { echo "FAIL: every prompt file is N/A, nothing to check"; exit 1; }

# Check 1: no vague prompts
grep -iE "^- (build (an?|the) (app|tool|system|feature))|^- (create (an|a) (app|tool|system))" "$OUTPUT_DIR"/*-prompts.md \
  && echo "FAIL: vague prompt detected" && exit 1

# Check 2: every prompt has an FM-XX section
for f in "$OUTPUT_DIR"/*-prompts.md; do
  count_prompts=$(grep -c "^## Requirement[[:space:]]*$" "$f")
  count_fm=$(grep -c "^## Anti-pattern blocked" "$f")
  [ "$count_prompts" -ne "$count_fm" ] && echo "FAIL: $f FM count mismatch" && exit 1
done

# Check 3: no hardcoded secrets
grep -iE "password.*=.*['\"]|api_key.*=.*['\"]|secret.*=.*['\"]" "$OUTPUT_DIR"/*-prompts.md \
  && echo "FAIL: hardcoded secret" && exit 1

# Check 4: every prompt has acceptance criteria
for f in "$OUTPUT_DIR"/*-prompts.md; do
  count_prompts=$(grep -c "^## Requirement[[:space:]]*$" "$f")
  count_criteria=$(grep -c "^## Acceptance criteria" "$f")
  [ "$count_prompts" -ne "$count_criteria" ] && echo "FAIL: $f criteria mismatch" && exit 1
done

echo "OK: anti-pattern enforcement passed"
```

If one or more checks fail, reformulate the deliverable. Do NOT deliver.

Check 0 is new in v0.3. Without it, an empty or missing output folder ran every check against nothing, and the script printed "OK". A layer that does not apply gets a file whose first line is `N/A: <reason>`.

## Output → `deliverables/vibecoding-engineer/`

- `architecture-prompts.md`, `feature-prompts.md`, `testing-prompts.md`, `cicd-prompts.md`, `security-prompts.md`, `deployment-prompts.md`
- `fm-coverage-matrix.md`: FM-XX × prompt-id table
- `_summary.md`: executive summary with the REQ-XXX × prompt × FM-XX traceability matrix

### Deliverable golden rules (3-7 actionable bullets)

- Do not hand the prompts to a collaborator without the context brief
- Every prompt has a quality gate: iterate on the prompt, not on the output
- Test this on a small project before using it on a client project
- Every shipped feature: the PR description answers "which FM-XX it avoids, which test gate covers it"
- Audit the FM coverage matrix every 30 days

## Validation Checkpoint (mapped to 10 Invariants)

The 10 Invariants are defined in `.claude/rules/skill-design-invariants.md`.

- [ ] Invariant 1 (Memory persistence): project log entry created if applicable
- [ ] Invariant 2 (Schema versioning): `last_updated` bumped, `schema_version` consistent
- [ ] Invariant 3 (Source of truth): state verified against product-spec.md + tech-arch.md
- [ ] Invariant 4 (Trigger phrase coverage): >=5 in total (see description)
- [ ] Invariant 5 (Degraded mode): fallback declared
- [ ] Invariant 6 (Anti-pattern enforcement): pre-delivery bash check passed
- [ ] Invariant 7 (Skill chain declaration): Mandatory chains invoked or pending
- [ ] Invariant 8 (Canonical output path): deliverables in the canonical folder
- [ ] Invariant 9 (Date handling): every human-readable date bash-checked
- [ ] Invariant 10 (Validation Checkpoint): this checklist completed
- [ ] Quality Gate Review: every prompt traces a requirement, is self-contained, is FM-aware
- [ ] Adversarial Review: the 4 questions answered explicitly
- [ ] `fm-coverage-matrix.md` generated

## Adversarial Review

1. What are 3 reasons an expert would criticize this output?
2. What is missing compared to the gold standard (Cursor Rules, Copilot Workspace, Devin specs)?
3. If a senior engineer read this, what would they say?
4. Which FM-XX in the registry are NOT covered? Is that deliberate or a gap?

## Self-Score

After generation, score 0/1 on each: complete traceability matrix, self-contained prompts, verifiable criteria, security constraints built in, explicit ordering, complete testing coverage, gaps flagged, consistent format, complete FM coverage.

Score >= 8/9 means deliver. Below 8 means iterate.

## Fallback

- Critical inputs missing → stop and ask the user
- Live research fails → proceed from the knowledge cutoff and flag low confidence
- A Mandatory skill chain cannot run → declare it pending under "Chain status"
- Output path not writable → fall back to `/tmp/` and flag it manually
- Deliverable exceeds 50% of the token budget → split it into multiple linked deliverables
- FM coverage incomplete → declare the gap explicitly, never invent fictional prevention

## Skill chains (auto-enforcement)

See `.claude/rules/skill-chaining.md` for the SSOT. For this skill:

| Skill | M/C/R | Trigger |
|---|---|---|
| `engineering-brief` | M | BEFORE the prompt sequence, the operational technical brief is required |
| `codebase-onboarding` | C | if there is an existing repo to extend |
| `delivery-readiness-audit` | M | closing the prompt sequence, final three-way verdict (READY / CODE-COMPLETE-RUNTIME-UNVERIFIED / INCOMPLETE) |

Enforcement: before delivering, run any Mandatory chain not already done, evaluate the Conditional ones, and include a "Chain status" block in the deliverable. `delivery-readiness-audit` is blocking: INCOMPLETE means you reformulate as work-in-progress and never deliver it as done.

---

## Maintainer

Skill maintained by [Danilo Lapegna](https://danilolapegna.com), founder of DL Solutions (Amsterdam). Built originally for client deliverables on agentic AI security and automation engagements. The Failure Mode Registry was catalogued from real production agent post-mortems and is released as canonical reference for the community.

If you find this useful, the [calendar booking link](https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0-J9nTQhY6guG-CdCGsJ6iBH71UNk47I4t5iO5s8WZe_dd-yuU6gKAkwCam-8sE3qLfEG0Cvls) is open for agentic AI engineering conversations.

Cross-reference case study: [danilolapegna.com/guides/agentic-ai-security](https://danilolapegna.com/guides/agentic-ai-security).
