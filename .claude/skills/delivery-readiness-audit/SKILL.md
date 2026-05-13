---
name: delivery-readiness-audit
description: >
  The terminal skill of every vibecoding sprint. A binary READY/INCOMPLETE
  audit that decides whether the deliverable is really done or only "70%
  claimed done". 18-item Definition of Done checklist, mechanical scan for
  TODO/skip/console.log, delta between plan and delivered, smoke test
  prescribed for re-verify. Use this skill when the user mentions "delivery
  audit", "is this done", "pre-merge check", "DoD check", "READY check",
  "audit before merging", "delivery check". Mandatory downstream of
  `vibecoding-engineer`: the prompt sequence closes only if this audit says
  READY.
last_updated: 2026-05-13
schema_version: 1
license: MIT
maintainer: github.com/danilolapegna
---

# Delivery Readiness Audit

> The canonical skill for not claiming "done" at 70%. A binary audit: either the deliverable is READY (shippable) or it is INCOMPLETE (work in progress, no done claim). No grey area.

## Origin

A pattern that recurs across skills and across projects: a developer (human or AI) declares a task done while tests are still red, TODOs are still in the code, and the smoke test was never run. The result is bugs in production, expensive rework, eroded trust. This skill blocks that pattern.

## Scope

Audit of the deliverable against the 18-item DoD checklist, the 8-item adversarial review, and a mechanical scan. Output: a READY or INCOMPLETE verdict, the diff between plan and delivered, and the smoke test prescribed for re-verification.

## Trigger phrases

"Delivery audit", "is this done", "pre-merge check", "DoD check", "READY check", "delivery check", "audit before merging", "delivery readiness", "ready to ship".

## Process (4 steps)

### 1. The 18-item DoD checklist

For every deliverable, judge:

1. [ ] Spec coverage: does every REQ-XXX in the product spec have a counterpart in the code?
2. [ ] Test coverage >= target (80% by default, or the documented figure)
3. [ ] All tests pass in CI (no skip, no @ignore)
4. [ ] Lint clean (0 errors, 0 warnings above info level)
5. [ ] Security scan clean (SAST + dep audit)
6. [ ] No hardcoded secrets (grep API_KEY/PASSWORD/SECRET)
7. [ ] No console.log / debug print in production code paths
8. [ ] No TODO/FIXME in the code (except the declared safe-* ones)
9. [ ] Migration script present and reversible
10. [ ] Rollback script tested
11. [ ] Smoke test run against staging (output saved)
12. [ ] Performance audit: no regression above 10% against the baseline
13. [ ] User documentation updated (README, CHANGELOG)
14. [ ] Monitoring dashboard configured (metrics, logs, alerts)
15. [ ] Error handling: every async path has a try/catch or an error type
16. [ ] Input validation: every public endpoint has schema validation
17. [ ] FM-XX coverage: every shipped feature declares which FM-XX it blocks (see the vibecoding-engineer registry)
18. [ ] Self-Score >= 9/10 and the 3 Adversarial Review questions answered

### 2. Mechanical scan

```bash
# TODO scan
TODOS=$(grep -rE "TODO|FIXME|HACK|XXX" src/ --include="*.{ts,js,py,go}" 2>/dev/null | grep -v "// SAFE-" | wc -l)
[ "$TODOS" -gt 0 ] && echo "FAIL: $TODOS TODO not SAFE-tagged" && exit 1

# Console.log scan
LOGS=$(grep -rE "console\.(log|debug)" src/ --include="*.{ts,js}" 2>/dev/null | grep -v "// SAFE-" | wc -l)
[ "$LOGS" -gt 0 ] && echo "FAIL: $LOGS console.log not SAFE-tagged" && exit 1

# Skipped tests scan
SKIPPED=$(grep -rE "\.(skip|only|xit|xdescribe)\(" tests/ --include="*.{ts,js,py}" 2>/dev/null | wc -l)
[ "$SKIPPED" -gt 0 ] && echo "FAIL: $SKIPPED test skipped/only" && exit 1

echo "OK: mechanical scan passed"
```

One failure is enough to make the verdict INCOMPLETE. Reframe the deliverable, do NOT ship it.

### 3. Delta between plan and delivered

A four-column table:

| Plan (from engineering-brief) | Delivered | Gap | Reason for the gap |
|---|---|---|---|
| [item] | DONE / PARTIAL / SKIPPED | [description] | [why] |

Every gap needs an explicit reason (a conscious decision, a deliberate scope cut, or a blocker). "Forgot about it" is not one of them.

### 4. Verdict

- **READY**: DoD 18/18 green, mechanical scan with zero failures, the delta table has zero gaps OR every gap carries a stated and acceptable reason, Self-Score >= 9/10, Adversarial Review answered.
- **INCOMPLETE**: anything else. Reformulate as work in progress. NO done claim.

## Skill chains

| Skill | M/C/R | Trigger |
|---|---|---|
| `vibecoding-engineer` | M upstream | the audit judges the deliverable of the prompt sequence |
| `engineering-brief` | C | use the brief as the baseline for the delta table |

## Validation Checkpoint

- [ ] All 18 DoD items answered explicitly YES/NO
- [ ] Mechanical scan run, zero failures
- [ ] Delta between plan and delivered filled in as a four-column table
- [ ] Binary verdict declared (READY or INCOMPLETE, no grey areas)
- [ ] If READY, smoke test output attached
- [ ] If INCOMPLETE, an actionable list of what to fix

## Fallback

- No DoD checklist available: use the 18-item default above
- Mechanical scan fails: automatic INCOMPLETE, no override
- No engineering brief exists: flag "audit-without-baseline" and add the caveat to the output

## Bypass policy

A full bypass on explicit user request is possible, but it gets logged as a framework failure. A skip directive in the commit body (for example `delivery-audit-skip: <gate> - <reason>`) is allowed one at a time, with a stated reason. More than one skip means a structurally INCOMPLETE deliverable.

---

> Skill maintained by [Danilo Lapegna](https://danilolapegna.com). Public release of DL Solutions internal toolkit.
