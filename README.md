# Vibecoding Skill Pack

> Production-ready Claude Code skill pack for industrial-scale agentic vibecoding. Generates structured prompt sequences for AI coding assistants (Cursor, Lovable, Claude Code, Devin, Copilot Workspace), with an Anti-Pattern Registry of 26 failure modes integrated by design.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE) [![Claude Code Skills](https://img.shields.io/badge/Claude%20Code-compatible-blue.svg)](https://docs.claude.com/en/docs/claude-code/skills)

## Why this exists

Anyone who has tried to "vibecoded" a real product with an AI coding assistant knows the failure modes: the orchestrator runs in circles collecting ideas without scope, the cache layer silently fails on writes, parallel runs corrupt state, the agent's own brand appears in its own competitive analysis, the UI exposes JSON to end users. These are not stylistic problems, they are architectural failures that repeat across projects because nobody wrote them down as preventable.

This pack writes them down. The `vibecoding-engineer` skill at the heart of the pack generates production-ready prompt sequences for AI coding assistants, where every prompt declares which failure modes it prevents by design and which test gates verify the prevention. The result is a build flow that converges on production-quality code rather than diverging into rework loops.

The pack is the public release of a toolkit built and used on real work: client engagements on agentic AI and automation, and the products I run myself. The Failure Mode Registry was catalogued from actual post-mortems, not from a list of good intentions, and is published here as a canonical reference for the community.

## What is inside the pack

```
vibecoding-skill-pack/
├── .claude/
│   ├── skills/
│   │   ├── vibecoding-engineer/       # main skill, generates prompt sequences
│   │   ├── engineering-brief/         # Mandatory upstream: tech brief before prompts
│   │   ├── codebase-onboarding/       # Conditional: only if extending existing repo
│   │   └── delivery-readiness-audit/  # Mandatory downstream: READY/INCOMPLETE binary verdict
│   └── rules/
│       ├── skill-chaining.md          # governance of skill chains (M/C/R)
│       ├── skill-design-invariants.md # 10 invariants every skill must respect
│       └── mechanical-gates-over-advisory.md  # why a rule without a gate is not a rule
├── examples/
│   ├── 01-orchestrator-prompt/        # full prompt example for an agentic orchestrator
│   └── 02-feature-prompt-with-fm-coverage/  # feature prompt with FM-XX coverage
├── INSTALL.md                         # drop-in install instructions
├── LICENSE                            # MIT
└── README.md                          # this file
```

## Quick start

### 1. Install into your Claude Code project

```bash
git clone https://github.com/danilolapegna/vibecoding-skill-pack.git
cd your-project
cp -r vibecoding-skill-pack/.claude/ ./.claude/
```

That's it. Claude Code automatically discovers the skills in `.claude/skills/`. The rules in `.claude/rules/` are always-active in your project.

See [INSTALL.md](INSTALL.md) for advanced install patterns (selective install, conflict resolution with existing skills).

### 2. Use the skills

In Claude Code, type something like:

```
genera prompt production-ready per il backend del mio nuovo SaaS
basato su questo product spec (context/product-spec.md) e questa
architettura (context/technical-architecture.md)
```

Or in English:

```
generate development prompts for the orchestrator component based on
my product spec and technical architecture
```

Claude Code automatically invokes `vibecoding-engineer`, which in turn chains `engineering-brief` (Mandatory upstream) and `delivery-readiness-audit` (Mandatory downstream).

## The Failure Mode Registry (the core asset)

The pack ships with a catalogue of 26 failure modes (FM-01 to FM-26) that repeat across agentic systems, in two parts. The full table is in [.claude/skills/vibecoding-engineer/SKILL.md](.claude/skills/vibecoding-engineer/SKILL.md) under "Failure Mode Registry".

**Part A, agentic system design (FM-01 to FM-12).** How the agent reasons, where it keeps state, what it shows the user.

- **FM-01** Orchestrator runs in circles without goal → alignment-score logging + audit job
- **FM-05** Parallel runs corrupt state → atomic locks (user, resource)
- **FM-07** Self-as-competitor in LLM output → deterministic self-entity filter
- **FM-12** Numbers "by feeling" passed as facts → evidence_class enum (Verified/Declared/Inferred)

**Part B, delivery and production (FM-13 to FM-26), new in v0.2.** The ways green code reaches production and does not work. Every entry here is a conflation of two things that look identical and are not: compiles is not boots, boots is not reachable by its real trigger, renders is not works, localhost is not deployed, green CI is not alive for the user.

- **FM-13** Build succeeds and ships a dead bundle (missing client env vars, white screen) → fail-closed build guard, running on the branch commits actually land on
- **FM-16** Compiles but does not boot: a duplicate export in a shared module takes down every importer while type-check stays green → post-deploy boot probe across importers
- **FM-17** Boots but is not triggerable: the endpoint answers your tests and rejects the credential its real scheduler sends → auth verified against the real trigger
- **FM-18** The credential dies with the code unchanged → off-platform probe that extracts the key from the deployed bundle and tests that one
- **FM-20** Fake axes: a wizard offers a choice the frontend inferred and the server never declared → two-sided provenance citation, or an explicit confession
- **FM-25** Publication inferred from the interface: a toast or a successful push read as proof of being live → verify from the served artifact, not from the UI event

The complete table maps each FM to its preventive pattern and its test gate. The discipline is binary: every shipped feature answers "which FM-XX does this prevent, which test gate covers it?". If the PR description does not answer, the merge is blocked.

## Skill chain canonical

```
codebase-onboarding (Conditional: only if extending existing repo)
    ↓ produces context/codebase-state.md
engineering-brief (Mandatory upstream)
    ↓ produces engineering-brief.md
vibecoding-engineer (main)
    ↓ produces deliverables/vibecoding-engineer/
delivery-readiness-audit (Mandatory downstream)
    ↓ binary verdict: READY or INCOMPLETE
```

Skip none. The chain is the spec of the workflow: each link is the dependency of the next.

## Compatibility

- **Claude Code**: native support, the skills are auto-discovered in `.claude/skills/`
- **Cursor / Devin / Copilot Workspace**: the SKILL.md files can be read as documentation, but auto-invocation requires Claude Code
- **Standalone**: you can read the skills as a playbook even without an AI coding assistant, the structure (spec → brief → prompts → audit) is platform-agnostic

## Cross-reference case study

The pack is the public release of a toolkit used at DL Solutions for client deliverables. The case study at [danilolapegna.com/guides/agentic-ai-security](https://danilolapegna.com/guides/agentic-ai-security) walks through a real engagement where the same Failure Mode Registry was applied to harden an agentic AI system before deployment.

## Versioning

See [CHANGELOG.md](CHANGELOG.md). The registry is the part that grows: new entries arrive when a real post-mortem produces one, not on a schedule.

## Maintainer

[Danilo Lapegna](https://danilolapegna.com), Amsterdam. I build and apply systems across AI, software and business, and most of what I know about failure modes comes from running my own products in production, not only from advising on other people's. If you want to talk agentic AI engineering at scale, [the calendar is open](https://danilolapegna.com).

## Contributing

Issues and pull requests welcome. The pack is intentionally small (4 skills + 3 rules + 2 examples). Keep it that way: prefer narrow scope expansions over rewrites.

If you spot a new failure mode that the registry does not cover (a real production post-mortem, not a hypothetical), open an issue with the symptom, root cause, preventive pattern, and proposed test gate. That is how FM-01 through FM-12 got documented in the first place.

## License

MIT. See [LICENSE](LICENSE).
