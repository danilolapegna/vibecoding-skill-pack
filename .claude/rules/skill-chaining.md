# Rule: Skill Chaining (always-active)

> Governance of the chains between skills. The skills in this pack are not islands: every skill declares its own chains, tagged M (Mandatory) / C (Conditional) / R (Recommended). This rule is the SSOT for chain logic.

## Core principle

Every skill that produces a downstream deliverable, or consumes an upstream one, MUST declare its chain. Without an explicit declaration, the flow between skills becomes implicit and fragile.

## Notation

- **M (Mandatory)**: the chain MUST run, or the deliverable is left incomplete
- **C (Conditional)**: the chain runs only if an explicit condition is true
- **R (Recommended)**: a suggestion, with no enforcement (the skill can proceed without it)

## Canonical chain of the vibecoding-skill-pack

```
codebase-onboarding (C: if the repo already exists)
    ↓ context/codebase-state.md
engineering-brief (M upstream)
    ↓ engineering-brief.md
vibecoding-engineer
    ↓ deliverables/vibecoding-engineer/
delivery-readiness-audit (M downstream)
    ↓ verdict READY, CODE-COMPLETE-RUNTIME-UNVERIFIED (with a tracked handoff) or INCOMPLETE
```

## Enforcement protocol (4 steps + 1 entry point)

### Step 0: Pre-task scan

Before running a skill, scan the context for its dependencies:
- Does `context/product-spec.md` exist? If not, engineering-brief has to collect it first
- Does `context/codebase-state.md` exist? If not, and the repo already exists, codebase-onboarding has to run first
- Has `engineering-brief.md` already been produced in this session? If not, vibecoding-engineer cannot start

### Step 1: When closing any skill

Run these 4 steps before handing over the final deliverable:

1. **Look up the chain**: read the "Skill chains" section of your own SKILL.md. Identify the Mandatory and Conditional skills in your chain.
2. **Apply conditions**: for every Conditional, check whether the condition is true. If it is, it becomes Mandatory.
3. **Execute or declare**: for every Mandatory not yet run in this session, either run it (preferred) or emit an explicit placeholder, "Chain pending: skill X, will run separately by [time]". Never ignore it silently.
4. **Verify in the deliverable**: the closing section of every deliverable includes a "Chain status" block declaring which skills were called, which are pending, and which were excluded with a rationale.

## Format of the "Chain status" block in the deliverable

Every deliverable of a skill that has chains MUST include:

```markdown
## Chain status

### Executed
- `skill-name` - [date] - output: [link to doc]

### Pending
- `skill-name` - reason for the deferral + by when - who owns it

### Excluded (with rationale)
- `skill-name` - excluded because: [condition not true / out of scope / already covered in another doc]
```

## Anti-patterns (things that are NOT enforcement)

- Citing a skill in the deliverable without running it and without declaring it pending
- Running the chain but not documenting it in "Chain status"
- Skipping the chain with the excuse that "it's basically the same thing". If the skill exists, it has its own specific edge
- Running the chain ONLY when the user explicitly asks for it. Enforcement is automatic
- Running the chain AFTER the main deliverable is handed over. The chain informs the main deliverable, it does not follow it

## Conditional cross-cutting triggers

### Trigger "personal / sensitive GDPR data"

If personal data shows up in scope (name, email, phone number, address, identifiers, GDPR Article 9 data), add extra security checks to the generated prompts. This is not a skill in the pack, but it is a trigger that vibecoding-engineer has to honor.

### Trigger "AI/automation in scope"

If chatbots, RAG, LLM automation, agents, or AI classification/extraction/generation show up in scope, apply the OWASP Agentic Top 10 (ASI01-ASI10) as the security baseline in the generated prompts.

### Trigger "production deploy"

If the deliverable includes a production deploy (no PoC, no test environment), the `delivery-readiness-audit` chain becomes Mandatory and blocking. INCOMPLETE means no merge into main.

## Updating this file

Update this rule when:
- A new skill joins the pack → add it to the canonical chain
- An existing skill widens its own triggers → update its chains
- A new cross-cutting trigger emerges → add it
- Experience disproves a chain (too verbose, cost above benefit) → downgrade M to R, or R to removed

Do not update it for: cosmetic renames, descriptive rewording, typo fixes.

---

> Rule maintained by [Danilo Lapegna](https://danilolapegna.com). Public release of DL Solutions internal framework.
