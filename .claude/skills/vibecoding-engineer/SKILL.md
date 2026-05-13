---
name: vibecoding-engineer
description: >
  Production-ready prompt generator for industrial-scale agentic vibecoding.
  From a product spec and a technical architecture, generates a complete set
  of prompts for architecture, feature, testing, CI/CD, security, deployment,
  with an Anti-Pattern Registry of 12 failure modes integrated by design.
  Each generated prompt declares which failure modes it prevents and which
  test gates verify them. Use this skill when the user mentions generating
  prompts for AI coding assistants (Cursor, Lovable, Claude Code, Devin, GitHub
  Copilot Workspace), vibecoding sessions, spec-driven development, or
  production-ready code generation from requirements. Triggers: "vibecoding",
  "generate development prompts", "spec to code prompts", "production-ready AI
  coding prompts", "Cursor rules generation", "Lovable prompt sequence",
  "Claude Code skill prompts", "agentic coding playbook", "prompt engineering
  for codebase", "engineering prompt sequence". Make sure to use this skill
  whenever the user wants prompts that guide an AI coding assistant through a
  structured build, even if they do not say "vibecoding" explicitly.
last_updated: 2026-05-13
schema_version: 1
license: MIT
maintainer: github.com/danilolapegna
---

# Vibecoding Engineer, Production-Ready Prompts with Anti-Pattern Registry

> The canonical skill for generating prompts aimed at AI coding assistants working in vibecoding mode. Output: an ordered sequence of self-contained prompt templates, traced back to the requirements in the product spec, with explicit coverage of 12 known failure modes in agentic systems.

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
4. FM-Aware: every prompt is check-listed against the Failure Mode Registry (12 FM-XX). Preventive patterns are built into the prompt template by design. Test gates are auto-suggested for every FM-XX relevant to the context.

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

> Origin: catalogued from real post-mortems of production-grade agentic systems. 12 failure modes that keep recurring across agentic AI projects.
>
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

**How to use the Registry**:

1. For every prompt you generate, scan the context for patterns that match an FM-XX
2. Add an `## Anti-pattern blocked` section listing the FM-XX prevented
3. For every FM-XX blocked, add the suggested test gate under `## Acceptance criteria`
4. Audit log: every shipped feature logs the FM-XX it covers in the PR description

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

# Check 1: no vague prompts
grep -iE "^- (build (an?|the) (app|tool|system|feature))|^- (create (an|a) (app|tool|system))" "$OUTPUT_DIR"/*-prompts.md \
  && echo "FAIL: vague prompt detected" && exit 1

# Check 2: every prompt has an FM-XX section
for f in "$OUTPUT_DIR"/*-prompts.md; do
  count_prompts=$(grep -c "^## Requirement" "$f")
  count_fm=$(grep -c "^## Anti-pattern blocked" "$f")
  [ "$count_prompts" -ne "$count_fm" ] && echo "FAIL: $f FM count mismatch" && exit 1
done

# Check 3: no hardcoded secrets
grep -iE "password.*=.*['\"]|api_key.*=.*['\"]|secret.*=.*['\"]" "$OUTPUT_DIR"/*-prompts.md \
  && echo "FAIL: hardcoded secret" && exit 1

# Check 4: every prompt has acceptance criteria
for f in "$OUTPUT_DIR"/*-prompts.md; do
  count_prompts=$(grep -c "^## Requirement" "$f")
  count_criteria=$(grep -c "^## Acceptance criteria" "$f")
  [ "$count_prompts" -ne "$count_criteria" ] && echo "FAIL: $f criteria mismatch" && exit 1
done

echo "OK: anti-pattern enforcement passed"
```

If one or more checks fail, reformulate the deliverable. Do NOT deliver.

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
| `delivery-readiness-audit` | M | closing the prompt sequence, final READY/INCOMPLETE gate |

Enforcement: before delivering, run any Mandatory chain not already done, evaluate the Conditional ones, and include a "Chain status" block in the deliverable. `delivery-readiness-audit` is blocking: INCOMPLETE means you reformulate as work-in-progress and never deliver it as done.

---

## Maintainer

Skill maintained by [Danilo Lapegna](https://danilolapegna.com), founder of DL Solutions (Amsterdam). Built originally for client deliverables on agentic AI security and automation engagements. The Failure Mode Registry was catalogued from real production agent post-mortems and is released as canonical reference for the community.

If you find this useful, the [calendar booking link](https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0-J9nTQhY6guG-CdCGsJ6iBH71UNk47I4t5iO5s8WZe_dd-yuU6gKAkwCam-8sE3qLfEG0Cvls) is open for agentic AI engineering conversations.

Cross-reference case study: [danilolapegna.com/guides/agentic-ai-security](https://danilolapegna.com/guides/agentic-ai-security).
