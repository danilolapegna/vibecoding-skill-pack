# Changelog

All notable changes to the vibecoding-skill-pack.

## v0.3.0 (2026-10-01)

The theme of this release: a green check is a claim about the check. v0.2 was about the ways green code reaches production and does not work. Running the pack on real builds since then kept surfacing the layer underneath: tests, gates, receipts and status lines that said "true" about something that was not.

### Added

- **Failure Mode Registry expanded from 26 to 38 entries.** New Part C (FM-27 to FM-38), verification and evidence: self-confirming tests, plans that grade themselves, diff-scoped gates blind to cumulative state, baselines that swallow new failures, evidence keyed to the wrong identity, test files the type checker never sees, authorization proven by reading instead of probing, absence read as health, model narration presented as system truth, transport success read as model success, an agent's account of its own changes believed without the log, and inability claims that nobody retests. Every entry comes from a real post-mortem.
- **`mechanical-gates-over-advisory` v2, "A green gate is a claim too".** Presence is not truth, calibration against false negatives, fault injection of the gate itself, routing checks by the changed surface.
- **`engineering-brief`: the build-versus-reuse checkpoint reopens during the build**, when a fix loop stops converging or a meaning-preserving change of input opens a new class of failure.

### Changed

- **`delivery-readiness-audit` routes evidence by the surface the change touched.** The fixed 18-item checklist is gone. Requirements now come from the original request rather than from the plan, every touched surface brings its own evidence, a change the surface table cannot classify runs the full applicable suite, unchanged proof is reused instead of rerun, and untouched surfaces are declared N/A with a reason. Lint, type checks, a secret scan of the added lines and the FM-XX answer in the PR stay mandatory for every code change.
- **The three verdicts stay, with sharper edges.** READY still requires a runtime observation with real data, and the release vocabulary is legal only for READY on the whole release: a stage that is READY is never called production-ready. The middle verdict is spelled `CODE-COMPLETE-RUNTIME-UNVERIFIED` everywhere, and its handoff must point to an open tracked item with an owner and a due date; an overdue handoff blocks the next READY. A bypass, including a skip directive in the commit body, is reported as `INCOMPLETE (BYPASSED)`.
- **The mechanical scan reads only the lines a change adds**, so old debt no longer blocks new work and new debt cannot hide in it. It also covers colocated test files and more skip and focus markers (`fit`, `fdescribe`, `.skip.each`, `pytest.mark.skip`, Go's `t.Skip`).
- **FM-24 counts the requirements of the original request**, not those of the plan (see FM-28), and admits SKIPPED only with the approver's reason.
- **`engineering-brief` declares the Definition of Done per surface**, using the surface table of the audit, instead of a fixed checklist.
- README, skill descriptions and chain diagrams updated to the new registry size and to the three-way verdict.

### Fixed

- The mechanical scans in `delivery-readiness-audit` and `codebase-onboarding` filtered files with `grep --include="*.{ts,js}"`. Grep does not expand braces there, so the scans matched no files and passed on every repository. The audit's scan now reads files through git and fails when its patterns match no file, when the base is unknown or when git itself reports an error. The onboarding scans print how many files they can see before any count.
- The integrity probe in `codebase-onboarding` printed "integrity probe failed" on every repository outside a cloud-sync folder, without running the probe. It now runs everywhere.
- The anti-pattern enforcement step in `vibecoding-engineer` printed "OK" on an empty or missing output folder. It now fails when there is nothing to check, and accepts a layer declared `N/A: <reason>`.
- The install command copied the pack into `.claude/.claude/` with GNU `cp` (Linux, WSL, Git Bash) whenever the project already had a `.claude/` folder, and its relative path pointed inside the project. README and `INSTALL.md` now use `cp -R ../vibecoding-skill-pack/.claude/. ./.claude/`.
- `INSTALL.md`: the uninstall steps now also remove `mechanical-gates-over-advisory.md`.
- The `vibecoding-engineer` description was longer than the 1024 characters allowed for a skill description; it now fits.

### Notes

The 4-skill, drop-in shape of the pack is unchanged. The install command above is also the whole upgrade. If you relied on the old 18-item checklist, the minimal greenfield list in `engineering-brief` is still there; the rest now comes from the surface table and the always-on checks of the audit.

## v0.2.0 (2026-08-06)

Three months of running these skills on real builds, distilled back into the pack. The theme of this release: the first version was good at designing agentic systems and naive about shipping them.

### Added

- **Failure Mode Registry expanded from 12 to 26 entries.** New Part B (FM-13 to FM-26) covers delivery and production failures: builds that succeed and ship dead bundles, code that compiles but does not boot, endpoints that boot but reject their own scheduler, credentials that die with the code unchanged, decision surfaces with no server-side producer, publication inferred from a UI toast. Every entry comes from a real post-mortem.
- **New rule `mechanical-gates-over-advisory.md`.** The meta-lesson of the period: a rule that asks an agent to do something, without an executable gate, does not survive contact with real work. Includes the 4 mandatory components of a working rule and the calibration discipline that keeps gates from becoming noise.
- **`CHANGELOG.md`**, this file.

### Changed

- **`delivery-readiness-audit` now has three verdicts instead of two.** READY requires an observed runtime with real data. When the auditor cannot run the real system, the honest verdict is `CODE-COMPLETE, RUNTIME-UNVERIFIED` plus a tracked handoff. A pending runtime verification can no longer coexist with a READY verdict, which was the mechanism by which verification got deferred forever.
- **`engineering-brief` gained a build-versus-reuse checkpoint.** Before designing an engine, check whether the engine is a commodity. Reinvented engines are born one component at a time.
- **`codebase-onboarding` now verifies state at the source.** Filenames, folder names and dates are not a state machine, and a repo whose version control metadata sits inside a cloud-sync folder gets flagged before anyone writes to it.
- README and skill descriptions updated to the new registry size.

### Notes

The 4-skill, drop-in shape of the pack is unchanged. If you installed v0.1, copying `.claude/` over your existing install is the whole upgrade.

## v0.1.0 (2026-05-13)

Initial open-source release: 4 skills (`vibecoding-engineer`, `engineering-brief`, `codebase-onboarding`, `delivery-readiness-audit`), 2 rules, 2 worked examples, and the original 12-entry Failure Mode Registry.
