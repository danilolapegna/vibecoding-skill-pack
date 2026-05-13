# Example 02: Feature Prompt with FM-XX Coverage (LLM-powered content generator)

> Example of a feature-level prompt for an LLM-powered content generation feature. Shows how FM-07 (self-as-competitor) and FM-12 (numbers by feeling) get applied to a domain that initially seems unrelated to those failure modes.

## Contesto

Stack: Node.js + Fastify backend, PostgreSQL with `pgvector` extension, Anthropic Claude API for generation.
Feature: content generator che prende keyword + audience target e produce 3 variant article draft. Output salvato in `content_drafts` table.
Architettura: REST endpoint POST `/api/v1/drafts/generate`, sincrono per draft 1 (warmup), async via queue per draft 2-3.

## Requisito

REQ-CONT-014: dato un keyword + audience target, generare 3 variant article draft (~800-1200 parole each) con citation of sources. Ogni draft include metadata structured (heading hierarchy, key entities mentioned, evidence_class per ogni claim numerico).

## Vincoli

- OWASP Agentic ASI03 (Identity & Privilege Abuse): l'LLM non puo invocare tool external senza explicit allowlist
- OWASP Agentic ASI06 (Memory & Context Poisoning): retrieval results validated before injecting in prompt
- Rate limit: max 10 generation per user per ora (anti-abuse)
- Cost cap: $0.50 per generation media (Claude 3.5 Sonnet input + output)
- Latency target: 1st draft entro 8s (sync), 2nd-3rd entro 30s (async)

## Anti-pattern blocked

- **FM-07** (self-as-competitor): l'LLM puo includere brand utente fra i competitor citati. Mitigation: post-generation filter deterministico che rimuove righe dove `author.brand == user.brand`. Test gate verifica che synthetic LLM output con brand utente non venga persisted.
- **FM-12** (numeri "a sentimento"): l'LLM produrra numeri stimati (es. "75% degli utenti", "5x faster", "1M+ developers"). Mitigation: schema enforce `evidence_class` enum per ogni claim numerico (`verified | declared | inferred`). I claim `inferred` vengono flaggati visivamente in UI.
- **FM-03** (artefatti orfani): ogni draft generated emette un artifact con `lifecycle_state` (draft → reviewed → published → archived). No orphan content. Test gate verifica che `SELECT COUNT(*) FROM content_drafts WHERE lifecycle_state IS NULL` = 0.

## Output atteso

- `src/features/content-generator/generator.ts` (orchestration logic)
- `src/features/content-generator/self-entity-filter.ts` (FM-07 filter post-LLM)
- `src/features/content-generator/evidence-class-validator.ts` (FM-12 enforcement)
- `src/features/content-generator/types.ts` (schema with `evidence_class` enum)
- `db/migrations/<YYYYMMDD>_content_drafts_lifecycle.sql` (add `lifecycle_state` column with NOT NULL constraint + default 'draft')
- `tests/content-generator/self-entity-filter.test.ts` (test gate FM-07)
- `tests/content-generator/evidence-class-tagging.test.ts` (test gate FM-12)
- `tests/content-generator/artifact-lifecycle.test.ts` (test gate FM-03)

## Criteri di accettazione

- [ ] Endpoint POST `/api/v1/drafts/generate` accetta `{keyword: string, audience_target: string}` e restituisce `{drafts: Draft[]}` con 3 elementi
- [ ] Ogni Draft ha shape `{id, content, evidence_claims: EvidenceClaim[], lifecycle_state: 'draft', author_brand, target_audience}`
- [ ] FM-07: synthetic test injects LLM output con `author.brand == user.brand`, filter scarta la riga, 0 drafts persisted con self-reference
- [ ] FM-12: synthetic test verifies che ogni numeric claim in `evidence_claims` has `evidence_class ∈ {verified, declared, inferred}`
- [ ] FM-03: synthetic test verifica che `lifecycle_state` ha `NOT NULL` constraint, INSERT senza valore default fallisce, INSERT con default value `'draft'` succeeds
- [ ] Latency 1st draft < 8s on p50, < 15s on p95
- [ ] Cost media < $0.50 per generation (measured via Anthropic API usage logs)
- [ ] Test gate FM-07, FM-12, FM-03 verdi in CI

## Test gate suggested

```bash
npm test -- self-entity-filter.test.ts
npm test -- evidence-class-tagging.test.ts
npm test -- artifact-lifecycle.test.ts

# Plus integration test on synthetic LLM output
npm test -- content-generator.integration.test.ts
```

Tutti devono passare. Se uno fallisce, il PR e blocked.

## PR description template

> FM-07: prevented via self-entity filter post-LLM (compares author.brand with user.brand, drops self-references), test gate self-entity-filter.test.ts
> FM-12: prevented via evidence_class enum enforcement on EvidenceClaim schema, test gate evidence-class-tagging.test.ts
> FM-03: prevented via lifecycle_state NOT NULL column on content_drafts table with default 'draft', test gate artifact-lifecycle.test.ts
