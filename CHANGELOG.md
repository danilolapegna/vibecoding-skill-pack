# Changelog

All notable changes to the vibecoding-skill-pack.

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
