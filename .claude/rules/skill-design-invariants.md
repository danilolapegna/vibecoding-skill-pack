# Rule: Skill Design Invariants (always-active)

> 10 invariants that every custom skill in the pack MUST respect. When an invariant is violated, the skill is incomplete, even if it runs and produces output.

## Core principle

For every output, there's a memory of how we got here. Every client-facing deliverable a skill produces MUST:

1. Leave a trace in the project's central log (where one exists)
2. Cite the authoritative source it consulted
3. Declare what project state the system is in once it has run

A skill that writes files into `deliverables/` but never updates the project's central log is broken by design, however perfect the file itself is.

## The 10 invariants

### Invariant 1: Memory persistence

Every skill that produces a significant deliverable MUST also produce a log entry in the project log (for example `CHANGELOG.md`, `docs/audit-log.md`, or an external system such as ClickUp or Linear). Skip when the output is an abort, a dry run, or an error, or when the project has no upstream logging mechanism.

### Invariant 2: Schema versioning

Every skill that mutates a canonical file (for example `_state.json`, config files) MUST: (a) bump `last_updated`, (b) regenerate the dashboard artifact where one applies, (c) bump `schema_version` explicitly on schema changes.

### Invariant 3: Source of truth

Every skill that depends on the current state of a domain MUST consult the declared authoritative source, not inferences drawn from file names, folders, or sequences. Forbidden patterns: counter or sequence ("the file with the highest N is the latest one"), stale cache, presence or absence of a task treated as state.

### Invariant 4: Trigger phrase coverage

Every skill MUST declare, within the first 10 lines of its SKILL.md (frontmatter description or subtitle), at least 4 natural trigger phrases in its primary language plus 1 in English (when they differ), mapped to specific operations if the skill is multi-modal.

### Invariant 5: Degraded mode

Every SKILL.md MUST have a `## Fallback / what to do when the skill breaks` section covering at least 5 canonical cases: missing inputs, live search fails, skill chain not executable, output path not writable, deliverable exceeding 50% of the available tokens.

### Invariant 6: Procedural anti-pattern enforcement

Every anti-pattern a skill declares MUST have a procedural step that BLOCKS it, not just narrative prose describing it. The rule is fail-safe. Canonical format: a bash check, a grep, or a boolean assertion before delivery, where failure means abort.

### Invariant 7: Skill chain declaration

Every skill MUST have a `## Skill chains` section with an M (Mandatory) / C (Conditional) / R (Recommended) table, even when that table is empty. See `skill-chaining.md` for the SSOT.

### Invariant 8: Canonical output path

Every skill MUST declare the canonical path where it saves its output. Preferred pattern: `<project>/deliverables/<skill-name>-<YYYY-MM-DD>.<ext>` or `<project>/_context/<event>-<YYYY-MM-DD>.md`.

### Invariant 9: Date / timestamp handling with bash check

Every skill that cites human-readable dates in a deliverable MUST run a bash date check before publishing. Pattern: `for d in <YYYY-MM-DD list>; do echo "$d → $(TZ=<tz> date -d "$d" '+%A %d %b %Y')"; done`. The bash output is the ONLY source for any weekday cited. Never do the arithmetic in your head.

### Invariant 10: Validation Checkpoint pre-deliverable

Every SKILL.md MUST have a `## Validation Checkpoint` section with 8-12 checkboxes the LLM completes BEFORE printing the deliverable. The self-check is mandatory, not optional.

## Periodic audit (every 90 days)

Every 90 days, audit the pack:

1. **Sample**: every custom skill in the pack
2. **Check**: for each skill, verify the 10 invariants
3. **Report**: a table scoring 0-10 (one point per invariant respected)
4. **Fix**: any skill scoring below 8 gets refactored. Below 5 is critical
5. **Update**: when a new kind of gap shows up that nothing covers, add Invariant 11 or beyond, with its origin documented

## When this rule applies

**Always** during:

- Creating a new skill in the pack
- Refactoring an existing skill
- The periodic audit (90 days)
- When a live bug surfaces in a skill: work out which invariant it violated

**It does NOT apply to**:

- Built-in Claude Code skills (init, review, and so on)
- Anthropic core skills (docx, pptx, and so on)
- Archived skills (`_archive/`)

## Anti-patterns (things that are NOT enforcement)

- Citing an invariant in the SKILL.md without implementing the step that goes with it: cargo cult
- Updating this rule without retroactively fixing the skills that were violating it: framework drift
- Running the periodic audit only "if I have time", when the audit is mandatory and scheduled
- Adding Invariant 11 or beyond without a documented origin: invariants-by-vibes

## Versioning

- **v1 (2026-05-13)**: first public release version. 10 invariants distilled from an internal audit plus lessons learned across skills.

---

> Rule maintained by [Danilo Lapegna](https://danilolapegna.com). Public release of DL Solutions internal framework.
