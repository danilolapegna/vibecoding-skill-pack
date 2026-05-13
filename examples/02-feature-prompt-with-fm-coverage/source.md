# Example 02: Feature Prompt with FM-XX Coverage (LLM-powered content generator)

> Example of a feature-level prompt for an LLM-powered content generation feature. Shows how FM-07 (self-as-competitor) and FM-12 (numbers by feeling) get applied to a domain that initially seems unrelated to those failure modes.

## Context

Stack: Node.js + Fastify backend, PostgreSQL with `pgvector` extension, Anthropic Claude API for generation.
Feature: a content generator that takes a keyword plus a target audience and produces 3 article draft variants. Output saved in the `content_drafts` table.
Architecture: REST endpoint POST `/api/v1/drafts/generate`, synchronous for draft 1 (warmup), async through a queue for drafts 2 and 3.

## Requirement

REQ-CONT-014: given a keyword plus a target audience, generate 3 article draft variants (~800-1200 words each) with citation of sources. Every draft includes structured metadata (heading hierarchy, key entities mentioned, evidence_class for every numeric claim).

## Constraints

- OWASP Agentic ASI03 (Identity & Privilege Abuse): the LLM cannot invoke external tools without an explicit allowlist
- OWASP Agentic ASI06 (Memory & Context Poisoning): retrieval results validated before being injected into the prompt
- Rate limit: max 10 generations per user per hour (anti-abuse)
- Cost cap: $0.50 per generation on average (Claude 3.5 Sonnet input + output)
- Latency target: 1st draft within 8s (sync), 2nd and 3rd within 30s (async)

## Anti-pattern blocked

- **FM-07** (self-as-competitor): the LLM can include the user's own brand among the competitors it cites. Mitigation: a deterministic post-generation filter that drops rows where `author.brand == user.brand`. The test gate verifies that synthetic LLM output carrying the user's brand never gets persisted.
- **FM-12** (numbers "by feeling"): the LLM will produce estimated numbers (for example "75% of users", "5x faster", "1M+ developers"). Mitigation: the schema enforces an `evidence_class` enum for every numeric claim (`verified | declared | inferred`). Claims marked `inferred` are flagged visually in the UI.
- **FM-03** (orphan artifacts): every generated draft emits an artifact with a `lifecycle_state` (draft → reviewed → published → archived). No orphan content. The test gate verifies that `SELECT COUNT(*) FROM content_drafts WHERE lifecycle_state IS NULL` = 0.

## Expected output

- `src/features/content-generator/generator.ts` (orchestration logic)
- `src/features/content-generator/self-entity-filter.ts` (FM-07 post-LLM filter)
- `src/features/content-generator/evidence-class-validator.ts` (FM-12 enforcement)
- `src/features/content-generator/types.ts` (schema with `evidence_class` enum)
- `db/migrations/<YYYYMMDD>_content_drafts_lifecycle.sql` (add `lifecycle_state` column with NOT NULL constraint + default 'draft')
- `tests/content-generator/self-entity-filter.test.ts` (test gate FM-07)
- `tests/content-generator/evidence-class-tagging.test.ts` (test gate FM-12)
- `tests/content-generator/artifact-lifecycle.test.ts` (test gate FM-03)

## Acceptance criteria

- [ ] Endpoint POST `/api/v1/drafts/generate` accepts `{keyword: string, audience_target: string}` and returns `{drafts: Draft[]}` with 3 elements
- [ ] Every Draft has shape `{id, content, evidence_claims: EvidenceClaim[], lifecycle_state: 'draft', author_brand, target_audience}`
- [ ] FM-07: a synthetic test injects LLM output with `author.brand == user.brand`, the filter drops the row, 0 drafts persisted with a self-reference
- [ ] FM-12: a synthetic test verifies that every numeric claim in `evidence_claims` has `evidence_class ∈ {verified, declared, inferred}`
- [ ] FM-03: a synthetic test verifies that `lifecycle_state` has a `NOT NULL` constraint, an INSERT without a value fails, and an INSERT with the default value `'draft'` succeeds
- [ ] Latency 1st draft < 8s on p50, < 15s on p95
- [ ] Average cost < $0.50 per generation (measured via Anthropic API usage logs)
- [ ] Test gates FM-07, FM-12, FM-03 green in CI

## Test gate suggested

```bash
npm test -- self-entity-filter.test.ts
npm test -- evidence-class-tagging.test.ts
npm test -- artifact-lifecycle.test.ts

# Plus integration test on synthetic LLM output
npm test -- content-generator.integration.test.ts
```

All of them must pass. If one fails, the PR is blocked.

## PR description template

> FM-07: prevented via self-entity filter post-LLM (compares author.brand with user.brand, drops self-references), test gate self-entity-filter.test.ts
> FM-12: prevented via evidence_class enum enforcement on EvidenceClaim schema, test gate evidence-class-tagging.test.ts
> FM-03: prevented via lifecycle_state NOT NULL column on content_drafts table with default 'draft', test gate artifact-lifecycle.test.ts
