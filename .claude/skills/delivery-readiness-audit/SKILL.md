---
name: delivery-readiness-audit
description: >
  The terminal skill of every vibecoding sprint. Reconciles the evidence
  behind a "done" claim and returns one of three verdicts: READY /
  CODE-COMPLETE-RUNTIME-UNVERIFIED / INCOMPLETE. It decides whether the
  deliverable is really done or only "70% claimed done": requirements taken
  from the original request, evidence routed by the surfaces the change
  actually touched, current proof reused instead of rerun, and a tracked
  handoff for anything the audit could not observe. Use this skill when the
  user mentions "delivery audit", "is this done", "pre-merge check", "DoD
  check", "READY check", "audit before merging", "delivery check". Mandatory
  downstream of `vibecoding-engineer`: the prompt sequence closes only if this
  audit says READY, or CODE-COMPLETE-RUNTIME-UNVERIFIED with a tracked handoff.
last_updated: 2026-10-01
schema_version: 2
license: MIT
maintainer: github.com/danilolapegna
---

# Delivery Readiness Audit

> The canonical skill for not claiming "done" at 70%. The deliverable is READY (shippable, with an observed runtime), CODE-COMPLETE-RUNTIME-UNVERIFIED (honest, and it names who verifies it and by when), or INCOMPLETE (work in progress, no done claim). No grey area, and no ceremony: the audit runs the checks the change actually needs, once.

## Origin

A pattern that recurs across skills and across projects: a developer (human or AI) declares a task done while tests are still red, TODOs are still in the code, and the smoke test was never run. The result is bugs in production, expensive rework, eroded trust. This skill blocks that pattern.

v0.3 adds the second half of the lesson. The v0.2 audit asked every deliverable the same 18 questions, which in practice made the cost of verification follow activity instead of risk. A database migration triggered a full browser crawl. A commit that touched only evidence files ran the whole test suite. A crawl ran against a server that had never started and reported a batch of false defects. Slow, undifferentiated gates taught people and agents to route around them. The strictness stays; it moves to where the change actually is.

## Scope

Reconciles the evidence for one claim against the requirements and against the surfaces the change touched. Output: one of three verdicts, the status of every requirement with the evidence cited for it, and, when the runtime could not be observed, a tracked handoff.

Not for Q&A, research, documentation-only work, reviews that changed no behavior, or every intermediate iteration of a build. Run it once at a stage boundary or at release. When it closes a `vibecoding-engineer` sequence, it judges the build made from the prompts, and it stays pending until that build exists.

## Trigger phrases

"Delivery audit", "is this done", "pre-merge check", "DoD check", "READY check", "delivery check", "audit before merging", "delivery readiness", "ready to ship".

## Process (5 steps)

### 1. Freeze the claim

Declare the profile first: one stage of the plan, or the whole release. A verdict is always a verdict for the declared profile.

List the requirements from the original request, not from the plan. A plan can quietly drop part of the mandate and then grade itself at 100% (FM-28). Every requirement ends in exactly one state:

- DONE: implemented, with the evidence it needs
- PARTIAL: a useful subset exists, the requirement is not complete
- NOT-STARTED: nothing implemented
- SKIPPED: excluded by whoever approved the scope, with the reason written down

Silence is not a status (FM-24). A PARTIAL, a NOT-STARTED or an unapproved SKIPPED makes the profile INCOMPLETE.

### 2. Classify the change by surface

Map the changed files, and any external state the change touches, to the surfaces they actually affect. Each surface brings its own evidence:

| Surface touched | Evidence it needs | Registry rows it guards |
|---|---|---|
| Logic or API | Focused tests with independent oracles; the repository's own type and test gates, test files included | FM-27, FM-32 |
| UI or user journey | Smoke test on real data, plus a runtime observation on the deployed URL | FM-14 |
| Shared runtime module | Boot probe across every importer, not only the file you touched | FM-16 |
| Database schema or access rules | Full migration replay at base and candidate; negative access probes with real sessions | FM-29, FM-33 |
| Async work, schedules, external effects | Success, retry, idempotency and terminal effect; a run receipt for scheduled work | FM-17, FM-34 |
| Model calls | Captured wire fixtures; user-facing claims built from receipts | FM-35, FM-36 |
| Deployment | The served artifact, read directly, for every half of the deploy | FM-13, FM-15, FM-25 |
| Anything the rows above do not classify: dependencies and lockfiles, configuration, environment variables, CI workflows, auth settings | The full applicable suite, once: no narrower proof covers a change the table cannot place | FM-31 |

Always, for any code change: the repository's lint and type gates, a secret scan of the added lines, and a PR description that answers which FM-XX the change prevents and which test gate covers it.

Mark every surface the change did not touch as N/A, with one factual reason. Do not run it for completeness: a check that runs on every change, whatever the change touched, is the first one people learn to skip.

### 3. Reconcile the receipts

A receipt is the stored result of a check: what ran, on which inputs (the commit and the files), when, and with what outcome. For each requirement, cite the implementation and the strongest relevant receipt.

- Reuse a green receipt while the inputs it proved, and the check that produced it, are unchanged. Key it to what it actually observed (FM-31).
- Documentation, receipt and planning changes do not invalidate product tests. A shared module invalidates its importers, not unrelated surfaces. A change to a test, a harness or the toolchain invalidates the receipts it produced, even when the product did not change.
- Run only what is missing or invalidated. While the build is still moving, run the focused tests for the changed class. Before a stage or release claim, run the full applicable suite once.
- For code changes, run the mechanical scan below. It reads only the lines the change adds, so old debt does not block new work (FM-30) and new debt cannot hide in it:

```bash
BASE="${BASE:-main}"   # what the change is measured against: a branch or a commit
CODE=('*.ts' '*.tsx' '*.js' '*.jsx' '*.py' '*.go'
      ':(exclude)*.test.*' ':(exclude)*.spec.*' ':(exclude)*_test.go' ':(exclude)*_test.py' ':(exclude)test_*.py' ':(exclude)*/test_*.py'
      ':(exclude)tests/*' ':(exclude)*/tests/*' ':(exclude)__tests__/*' ':(exclude)*/__tests__/*')   # adapt to your stack
TEST=('*.test.*' '*.spec.*' '*_test.go' '*_test.py' 'test_*.py' '*/test_*.py'
      'tests/*' '*/tests/*' '__tests__/*' '*/__tests__/*')

git rev-parse --verify --quiet "$BASE^{commit}" >/dev/null || { echo "FAIL: base '$BASE' not found"; exit 1; }
# Patterns that match no file in the repository prove nothing: that is a failure, not a pass
[ "$(git ls-files -- "${CODE[@]}" | wc -l)" -gt 0 ] || { echo "FAIL: no source files match the patterns"; exit 1; }

# Lines this change adds (committed or not, plus new untracked files). A git error fails the scan
added() {
  local out
  out=$(git diff --no-color -U0 "$BASE" -- "$@") || { echo "FAIL: git diff failed" >&2; return 1; }
  printf '%s\n' "$out" | grep -E '^\+' | grep -vE '^\+\+\+ '
  git ls-files --others --exclude-standard -z -- "$@" | while IFS= read -r -d '' f; do
    sed 's/^/+/' -- "$f" || { echo "FAIL: cannot read $f" >&2; exit 1; }
  done
}
count() { grep -E "$1" | grep -vE '(//|#)[[:space:]]*SAFE-' | wc -l | tr -d ' '; }

CODE_ADDED=$(added "${CODE[@]}") || exit 1
TEST_ADDED=$(added "${TEST[@]}") || exit 1
[ -n "$CODE_ADDED$TEST_ADDED" ] || { echo "N/A: no source or test lines added since $BASE"; exit 0; }

TODOS=$(printf '%s\n' "$CODE_ADDED" | count "TODO|FIXME|HACK|XXX")
[ "$TODOS" -gt 0 ] && echo "FAIL: $TODOS new TODO not SAFE-tagged" && exit 1
LOGS=$(printf '%s\n' "$CODE_ADDED" | count "console\.(log|debug)")
[ "$LOGS" -gt 0 ] && echo "FAIL: $LOGS new console.log not SAFE-tagged" && exit 1
SKIPS=$(printf '%s\n' "$TEST_ADDED" | count "\.(skip|only)[.(]|(^|[^A-Za-z0-9_])[xf](it|describe|test)\(|pytest\.mark\.skip|t\.Skip\(")
[ "$SKIPS" -gt 0 ] && echo "FAIL: $SKIPS new skipped or focused tests" && exit 1

echo "OK: mechanical scan passed on the lines added since $BASE"
```

Up to v0.2 this scan used `grep --include="*.{ts,js}"`, which grep does not brace-expand: the pattern matched no files, so the scan passed on every repository. A gate is trusted only after it has been seen failing (FM-27): before relying on the scan in a new repository, add a `// TODO` line once and confirm that it fails. A SAFE tag is a comment that starts with `SAFE-` (for example `// SAFE-123: kept until the migration lands`).

A dry run, an unavailable runner, a missing credential or a static reading cannot prove runtime behavior. They are not evidence of it, and they are not a skip either (FM-19).

### 4. Challenge the result

Ask one question: **can a user, a provider or an adjacent consumer still fail the promised outcome in a way that none of the cited evidence exercises?**

If the answer is yes or unknown, add the smallest direct check that closes it. Do not restart every gate. If two rounds of fixes reopen the same boundary, stop patching and go back to the design (see the build-versus-reuse checkpoint in `engineering-brief`).

### 5. Verdict (three outcomes, not two)

- **READY**: every requirement of the declared profile is DONE or explicitly SKIPPED; every triggered surface has a current green receipt; a runtime observation of the real system with real data is recorded (block below); no known blocking defect remains; the rollback path is named for any material change. The release vocabulary (`production-ready`, `works end-to-end`, `live`, `shipped to users`) is legal only for READY on the whole-release profile. A stage that is READY is "stage N ready", never "production-ready".
- **CODE-COMPLETE-RUNTIME-UNVERIFIED**: everything else is green, but the audit could not run the real system (a third-party managed platform, a browser-gated environment, credentials you do not have). This is an HONEST and legitimate outcome, not a failing grade, but it requires a tracked handoff and it forbids the release vocabulary.
- **INCOMPLETE**: anything else. Reframe it as work in progress. No done claim.

No score, no percentage, no "ready with reservations". If the user authorizes shipping anyway, report `INCOMPLETE (BYPASSED)` and name the bypass: an authorization does not turn missing proof green.

#### Block required for READY

```markdown
## Runtime observation
surface: <route or component>
data: real
observed: <the REAL value or decision seen on screen, never "rendered", never "no crash">
verified_at: <deployed, non-local URL>
```

#### Block required for CODE-COMPLETE-RUNTIME-UNVERIFIED

```markdown
## Runtime handoff
cannot-run: <why, concretely>
owner: <who runs it>
due: <date>
to-verify: <the exact clicks to perform and the real value expected>
tracker: <link or id of an OPEN item that names the same owner and due date>
```

The rule that closes the hole: **a "pending, we will verify it later" cannot coexist with a READY verdict**. If a runtime check is left hanging, the verdict drops to CODE-COMPLETE-RUNTIME-UNVERIFIED, which in turn forces the handoff.

v0.3 tightens the handoff itself. A check requested "for after the release" that nobody turns into a tracked item does not exist. In the post-mortem behind this change, a canary the audit had asked for was never run and never tracked; a user-facing button then returned a server error for three days, and it was the hosting platform's monitor, not the team, that noticed. So the tracker must resolve to an open item with the same owner and due date, an inline "verify after publish" is not a handoff, and an overdue handoff blocks the next READY claim on the same product.

## Output

```text
Delivery verdict: READY | CODE-COMPLETE-RUNTIME-UNVERIFIED | INCOMPLETE | INCOMPLETE (BYPASSED)
Profile: <stage name | release>; request: <reference to the frozen request>
Requirements: <requirement -> DONE | PARTIAL | NOT-STARTED | SKIPPED -> evidence>
Changed surfaces: <surface -> evidence it triggered>
Reused evidence: <receipt -> unchanged input>
Executed now: <command or observation -> result>
N/A surfaces: <surface -> reason>
Runtime: <observation block | handoff block>
Residual defects: <ids or none>
Rollback: <exact path>
```

Do not paste successful logs, and do not generate self-scores, fixed-count checklists or duplicate scan reports to satisfy this skill. They are valid only when the task, or an actual risk, asks for them.

## Skill chains

| Skill | M/C/R | Trigger |
|---|---|---|
| `vibecoding-engineer` | M upstream | the audit judges the build made from the prompt sequence |
| `engineering-brief` | C | the brief's Definition of Done by surface is the baseline for step 2 |

## Validation Checkpoint

- [ ] Profile declared; requirements listed from the original request, each with an explicit state
- [ ] Change classified by surface; every N/A surface carries a factual reason; anything unclassified ran the full applicable suite
- [ ] Every triggered surface has current evidence; no invalidated proof reused, and no unchanged proof rerun except the single full-suite run before the stage or release claim
- [ ] Mechanical scan run for code changes: OK, or N/A with the base it used
- [ ] Challenge question answered, and the extra check added if one was needed
- [ ] Verdict declared as one of the three outcomes, no grey areas
- [ ] If READY, the `## Runtime observation` block filled in with a real observed value
- [ ] If CODE-COMPLETE-RUNTIME-UNVERIFIED, the `## Runtime handoff` block points to an open tracked item with owner and due date
- [ ] No release vocabulary unless the verdict is READY on the whole-release profile

## Fallback

- No frozen request available: reconstruct a compact requirement list from the approved request, mark it as reconstructed, and ask only when a material choice is genuinely open. A reconstructed list is not evidence of implementation
- Mechanical scan fails, or cannot run (no matching files, unknown base, git error): automatic INCOMPLETE, no override
- No engineering brief exists: flag "audit-without-baseline" and add the caveat to the output
- The audit cannot run the system: CODE-COMPLETE-RUNTIME-UNVERIFIED with a tracked handoff, never READY with a pending in a footnote
- A targeted check fails: keep the failure in the output, fix the class, rerun that evidence path only
- The working tree holds unrelated changes: scope the audit to the declared change and leave the rest untouched

## Bypass policy

A bypass is possible on explicit user request, and a skip directive in the commit body (for example `delivery-audit-skip: <gate>: <reason>`) is a bypass like any other. Either way it is reported with its reason, it gets logged as a framework failure, and the verdict for that profile is `INCOMPLETE (BYPASSED)`. A bypass never upgrades a verdict.

---

> Skill maintained by [Danilo Lapegna](https://danilolapegna.com). Public release of DL Solutions internal toolkit.
