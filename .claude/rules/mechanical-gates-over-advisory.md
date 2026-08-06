# Rule: Mechanical Gates over Advisory Prose (always-active)

> The rule that governs all the other rules in this pack. Added in v0.2, after measuring that well-written rules with nothing to enforce them do not get followed, not even by the agents that just read them.

## Core principle

**A rule that asks an agent to "do X", with no executable gate, is symbolic infrastructure, not operational infrastructure.**

This is not a stylistic opinion. It is a measured result: an internal rule marked `mandatory`, written clearly, and loaded into every session produced zero invocations from its consumers over eight days of real work. Nobody was ignoring it on purpose. Nothing executed it, and nothing failed when it was not executed. A rule in that state is not weak, it is absent, with the added cost of looking present.

Hence the three-state classification, the only one that matters when you write rules for an agentic system:

| State | What it is | Fate |
|---|---|---|
| **Advisory** | prose describing the desired behavior | dies, within days |
| **Mechanical gate** | a command that fails when the behavior is missing | survives |
| **Test** | the behavior is exercised, and its absence breaks the suite | survives |

Only the last two change what actually happens.

## The 4 mandatory components

Every lookup or consultation rule in this pack needs all four. Missing one drops it back to advisory.

**1. An executable bash invocation.** A concrete, copy-pasteable command that produces an outcome. Not "consult the registry", but the line that queries it. The difference between the two is the difference between a rule that runs and a rule you hope for.

**2. A mandatory output block in the deliverable.** Exact header, case-sensitive, declared format. This is what makes compliance verifiable from the outside instead of declarable from the inside. An approximate header is not greppable, so it is not a gate.

**3. A mechanical grep gate, with a named executor.** The check that fails when the block is missing, plus an explicit answer to "who runs this". A hook, a CI step, a skill in the chain. "Whoever comes next will notice" is not an executor.

**4. A documented graceful fallback.** What happens when the target is unreachable, stale, or corrupt: an explicit flag in the deliverable, never a silent skip. A silent skip turns a failure into an apparent success, which is the worst of the four outcomes.

## The pre-commit test for a new rule

> If you deleted all the prose and kept only the four components, would the rule still work?

If the answer is no, what you wrote is a proposal, not a rule. You can keep it, but call it by its name and do not count on it.

A corollary about writing order: write the bash FIRST, then the output block, then the gate (tested both against compliant input and against non-compliant input), then the fallback, and the prose last. Writing the prose first almost always produces a rule that explains itself well and never executes.

## Calibration, because too many gates are worse than too few

A gate with false positives trains the reflex to bypass it, and that reflex then gets applied to the good gates too. So the inverse discipline matters just as much:

- Add a new gate only when it prevents a REAL failure you have already observed, that no existing gate covers, with false positives close to zero.
- Prefer hanging the check on a structural signal (a file of a certain type being added, a strong claim written in the commit body) rather than on a subjective judgment.
- Prefer making the honest path CHEAP over making the dishonest path impossible. An explicit, tracked, low-friction way to confess gets used. A pure prohibition gets routed around.
- If a gate has to be bypassed in an emergency, the bypass must leave a trace and carry an expiry, not be invisible.

## Periodic audit

Every 60 days: for each rule, verify the four components are still there and that the gate has produced real traffic. A rule with no traffic, or with missing components, gets converted into a gate or archived. There is no third outcome: keeping it "for the record" is exactly the state this rule exists to prevent.

## Anti-patterns

- Marking a rule `mandatory` with nothing that fails when it is skipped
- An output block described in words instead of with the exact header to grep for
- A gate with no named executor
- A silent skip when the source is unreachable, instead of a flag in the deliverable
- Adding gates for completeness, manufacturing ceremony and training the bypass
- Writing the prose first and the components later, if there is time left

## Versioning

- **v1 (2026-08-06)**: first version. Distilled from an internal audit that measured how ineffective advisory rules are, and from the subsequent conversion of the framework's rules into mechanical gates.

---

> Rule maintained by [Danilo Lapegna](https://danilolapegna.com). Public release of DL Solutions internal framework.
