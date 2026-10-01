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

## A green gate is a claim too (new in v0.3)

The four components make a rule executable. They do not make it right. Running gates on real builds since v0.2 produced a second list, about the gates themselves.

**Presence is not truth.** A grep gate on an output block proves that the block exists. A receipt written by the agent that did the work can carry the exact header, a date and a list of "verified sources", and still cite a source that does not exist: one did, and the gate passed it. Evidence gates resolve what they cite, check that each source is the right kind of source for the claim it supports, and report how many sources they examined, resolved and rejected. Zero examined is a failure, not a pass.

**Calibrate against false negatives too.** The section above guards against false positives. The opposite failure is quieter. A detector built on one axis (vocabulary) says CLEAN on material that fails on another (structure), and an author judging their own output shares the detector's blind spot. A prose checker built on word lists passed a set of help pages that a reader rejected at first sight, because every sentence had the same shape and almost none of them said anything checkable. Ship every gate with a negative control taken from real rejected material, and trust it only after it has been seen failing on it (FM-27). Keep a false-positive control taken from ordinary material next to it.

**Fault-inject the gate itself.** Test what the gate does when its helper is missing, when it crashes, when its output cannot be parsed, when it matches zero files, and when it runs on another operating system. Real cases: hooks that exited 0 when their helper could not be found; a pattern written for GNU tools that failed open on macOS; a sweep that piped a crashing detector into grep and read the crash as green; an installer that printed success after its baseline step had crashed; and, in this very pack up to v0.2, file filters written with shell braces that grep never expands, so the scans matched nothing and passed everywhere. A gate that cannot fail closed is advisory with extra steps.

**Route checks by the changed surface.** When every change pays for every check, the cost of verification follows activity rather than risk, the real proofs arrive late, and the slow path teaches people and agents to bypass the gate. Let the changed surface select the evidence, reuse a proof while its inputs are unchanged (FM-31), and run the full suite once at the stage or release boundary. `delivery-readiness-audit` does this routing.

## Periodic audit

Every 60 days: for each rule, verify the four components are still there and that the gate has produced real traffic. A rule with no traffic, or with missing components, gets converted into a gate or archived. There is no third outcome: keeping it "for the record" is exactly the state this rule exists to prevent.

## Anti-patterns

- Marking a rule `mandatory` with nothing that fails when it is skipped
- An output block described in words instead of with the exact header to grep for
- A gate with no named executor
- A silent skip when the source is unreachable, instead of a flag in the deliverable
- Adding gates for completeness, manufacturing ceremony and training the bypass
- Writing the prose first and the components later, if there is time left
- A gate that greps for the evidence block and never resolves the evidence
- A detector that has never been seen failing on real rejected material
- A gate that exits 0 when its helper, its input or its file list is missing

## Versioning

- **v1 (2026-08-06)**: first version. Distilled from an internal audit that measured how ineffective advisory rules are, and from the subsequent conversion of the framework's rules into mechanical gates.
- **v2 (2026-10-01)**: new section "A green gate is a claim too": presence is not truth, calibration against false negatives, fault injection of the gate itself, routing by changed surface. From post-mortems of gates that passed while the thing they guarded was false, including fail-open checks found in this pack itself.

---

> Rule maintained by [Danilo Lapegna](https://danilolapegna.com). Public release of DL Solutions internal framework.
