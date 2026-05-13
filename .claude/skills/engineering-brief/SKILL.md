---
name: engineering-brief
description: >
  Mandatory upstream skill of `vibecoding-engineer`. Produces an operational
  technical brief well before the prompt sequence: a justified stack,
  architecture decisions with rationale, an anti-pattern catalog that applies
  to this project, a fillable Definition of Done (DoD), and the blocking
  inputs still outstanding.
  Use this skill when the user mentions "engineering brief", "tech spec",
  "architecture decision record", "ADR", "before writing prompts", "pre-spec
  tech doc", "scope freeze". Trigger before `vibecoding-engineer` runs:
  without an engineering brief, the prompt sequence has no anchor.
last_updated: 2026-05-13
schema_version: 1
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
6. **18-item DoD**: the Definition of Done checklist (see the `delivery-completeness.md` rule if you have it)
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

### 4. The 18-item Definition of Done (DoD)

See the `delivery-completeness.md` rule if it ships with your pack, otherwise use this minimal DoD:

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
- [ ] An ADR written for every non-default decision
- [ ] The 18-item DoD filled in or adapted
- [ ] Blocking inputs listed with an owner and a deadline
- [ ] Explicit OUT-of-scope documented

## Fallback

- Spec missing: ask the user for product-spec.md before going any further
- Stack ambiguous: ask a clarifying question, never decide arbitrarily
- Two or more architecture alternatives with no user preference: present a pros/cons matrix and ask

---

> Skill maintained by [Danilo Lapegna](https://danilolapegna.com). Public release of DL Solutions internal toolkit.
