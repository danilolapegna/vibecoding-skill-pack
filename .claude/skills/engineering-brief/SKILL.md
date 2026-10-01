---
name: engineering-brief
description: >
  Mandatory upstream skill of `vibecoding-engineer`. Produces an operational
  technical brief well before the prompt sequence: a justified stack,
  architecture decisions with rationale, an anti-pattern catalog that applies
  to this project, a Definition of Done (DoD) declared per surface, and the
  blocking inputs still outstanding.
  Use this skill when the user mentions "engineering brief", "tech spec",
  "architecture decision record", "ADR", "before writing prompts", "pre-spec
  tech doc", "scope freeze". Trigger before `vibecoding-engineer` runs:
  without an engineering brief, the prompt sequence has no anchor.
last_updated: 2026-10-01
schema_version: 2
license: MIT
maintainer: github.com/danilolapegna
---

# Engineering Brief

> The upstream skill of vibecoding-engineer. Without a written engineering brief, prompts degenerate into a generic "build me an app for X" and the AI coding assistant produces compromised architecture. The brief is the anchor.

## Scope

Produces a `_plan.md` (or `engineering-brief.md`) document with 7 sections:

1. **Spec frozen**: a snapshot of the product spec as it stood when the brief was written, for traceability
2. **Gap analysis**: what the spec is missing against the 8 canonical technical questions (stack, deployment, data model, auth, scaling, security, observability, compliance)
3. **Architecture decision**: the stack with its rationale, the 3-5 alternatives considered, and why this one won
4. **Pre-declared test list**: the minimum tests the delivery has to pass before it counts as done
5. **Explicit OUT-of-scope**: what is NOT being built in this phase, why, and when it gets revisited
6. **Definition of Done by surface**: for each surface the build will touch, the evidence that will count as done (the same surfaces `delivery-readiness-audit` checks at the end)
7. **Blocking inputs**: open items that need user input before the work can continue

## Trigger phrases

"Engineering brief", "tech spec", "architecture decision", "ADR", "pre-spec tech doc", "scope freeze", "_plan.md", "technical brief", "architecture decision record".

## Process (5 steps)

### 1. Read product-spec.md and technical-architecture.md

Extract the requirements, the proposed stack, and the constraints.

### 2. Apply the 8 canonical technical questions

| # | Question | Output |
|---|---|---|
| 1 | Which stack (language, framework, database)? | Decision + 2-3 alternatives |
| 2 | Deployment target (cloud, container, serverless, on-prem)? | Decision + rationale |
| 3 | Data model: relational, document, hybrid? | Decision + preliminary schema |
| 4 | Auth model: OAuth, session, JWT, magic link, SSO? | Decision + flow diagram |
| 5 | Scaling strategy (vertical, horizontal, serverless auto)? | Decision + breakpoint |
| 6 | Security posture (OWASP Top 10, secret mgmt, audit logs)? | Applicable checklist |
| 7 | Observability (metrics, logs, tracing, alerting)? | Proposed stack |
| 8 | Compliance (GDPR, AI Act, DORA, HIPAA, sector-specific)? | Applicable list |

### 2-bis. Build-versus-reuse checkpoint (new in v0.2)

Before you design an engine, ask yourself whether that engine is a commodity. The question applies at EVERY altitude of the stack, and it should also be framed one level ABOVE the piece you are about to write: very often the entire subsystem already exists and is mature, not just the component you had in mind.

The reuse ladder. You only step down a rung with a stated reason:

1. An asset you already have (an internal library, an established pattern, code from another project)
2. Open-source adoption (a pinned dependency, a vendored module, a pattern extracted with provenance)
3. A third-party managed service or harness (cost and lock-in stated explicitly)
4. Build from scratch: only for what makes the product unique, or when it is genuinely simpler than adopting something

Rule of thumb: **reuse the engine, build the edge**. Products that die on their own reinvented engine did not make one bad decision on day one, they made twenty small ones, each of which looked reasonable at the time.

In the brief, state the outcome on one line: `Build-vs-reuse: <capability> → <reuse X | adopt Y | service Z | build from scratch because <reason>>`. A justified "build from scratch" is a valid outcome; an implicit one is not.

**Reopen the checkpoint during the build (new in v0.3).** The question is not only for day one. When two rounds of fixes fail to converge on the same problem, or when a change that should not alter the meaning of the input (a paraphrase, a reordering) opens a new class of failure, the next step is the reuse question, not another patch. A series of correct local fixes does not prove that the boundary is right. In the post-mortem behind this paragraph, every fix to a natural-language planner was valid, every new paraphrase broke something else, and the question of whether to build that engine at all came up only when a human stopped the loop; a mature open-source engine already covered the job. Record the new outcome on the same `Build-vs-reuse:` line, with the date.

### 3. Formal architecture decision

Write an Architecture Decision Record (ADR) for every non-default decision. ADR format:

```
# ADR-XXX: <decision>

Status: proposed | accepted | superseded
Date: YYYY-MM-DD

## Context
What is driving the decision

## Considered options
1. Option A: pros, cons
2. Option B: pros, cons
3. Option C: pros, cons

## Decision
Option X chosen

## Consequences
Which tradeoffs we are accepting
```

### 4. Definition of Done by surface (changed in v0.3)

Declare, for every surface this build will touch, the evidence that will count as done. Use the surface table of `delivery-readiness-audit` (step 2) as the list of surfaces, so that the audit reconciles against a promise made up front instead of a checklist written afterwards, and write each line in this project's own terms: which tests, which deployed URL, which probe, which migration replay.

```
Done by surface:
- <surface from the audit table> -> <the evidence that will count, in this project's terms>
- <surface> -> out of scope for this build, because <reason>
```

Surfaces the build will not touch are declared out of scope here, so that nobody runs their checks later "for completeness". A fixed checklist applied to every change makes the cost of verification follow activity instead of risk; the brief is where you decide which evidence this project actually needs.

For a greenfield release, this minimal list is still the starting point:

- [ ] All tests pass in CI
- [ ] Coverage >= 80% (or the documented target)
- [ ] Security scan clean (SAST, dep audit)
- [ ] Performance audit clean (no regression above 10%)
- [ ] User documentation updated
- [ ] Migration script + rollback script
- [ ] Monitoring dashboard + alerts configured
- [ ] Smoke test prescribed for post-deploy

### 5. Output

`engineering-brief.md` saved under `deliverables/engineering-brief/` or `_context/`. Mandatory downstream chain: `vibecoding-engineer` can now start.

## Skill chains

| Skill | M/C/R | Trigger |
|---|---|---|
| `codebase-onboarding` | C | if there is an existing repo to extend, read it first |
| `vibecoding-engineer` | M | downstream, starts from the brief this skill produced |

## Validation Checkpoint

- [ ] All 8 technical questions answered (or the gap explicitly flagged)
- [ ] Build-vs-reuse declared for every non-trivial capability
- [ ] An ADR written for every non-default decision
- [ ] Definition of Done declared per surface, with the evidence that will count
- [ ] Surfaces the build will not touch declared out of scope, with a reason
- [ ] Build-vs-reuse reopened if a fix loop stopped converging during the build
- [ ] Blocking inputs listed with an owner and a deadline
- [ ] Explicit OUT-of-scope documented

## Fallback

- Spec missing: ask the user for product-spec.md before going any further
- Stack ambiguous: ask a clarifying question, never decide arbitrarily
- Two or more architecture alternatives with no user preference: present a pros/cons matrix and ask

---

> Skill maintained by [Danilo Lapegna](https://danilolapegna.com). Public release of DL Solutions internal toolkit.
