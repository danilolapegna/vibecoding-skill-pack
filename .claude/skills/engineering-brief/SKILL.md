---
name: engineering-brief
description: >
  Skill upstream Mandatory di `vibecoding-engineer`. Produce un brief tecnico
  operativo ben prima del prompt sequence: stack motivato, decisioni di
  architettura with rationale, anti-pattern catalog applicabile al progetto,
  Definition of Done (DoD) compilabile, e blocking inputs ancora pendenti.
  Use this skill when the user mentions "engineering brief", "tech spec",
  "architecture decision record", "ADR", "before writing prompts", "pre-spec
  tech doc", "scope freeze". Trigger before `vibecoding-engineer` runs:
  without an engineering brief, the prompt sequence has no anchor.
last_updated: 2026-05-13
schema_version: 1
license: MIT
maintainer: github.com/danilolapegna
---

# Engineering Brief

> Skill upstream del vibecoding-engineer. Senza un engineering brief written, i prompt diventano genericamente "fai un'app per X" e l'AI coding assistant produce architettura compromise. Il brief e l'anchor.

## Scope

Produce un documento `_plan.md` (o `engineering-brief.md`) con 7 sezioni:

1. **Spec frozen**: snapshot del product-spec al momento del brief (per tracciabilita)
2. **Gap analysis**: cosa manca nello spec rispetto alle 8 domande tecniche canonical (stack, deployment, data model, auth, scaling, security, observability, compliance)
3. **Decisione architetturale**: stack motivato, 3-5 alternative considerate, perche questa
4. **Lista test pre-dichiarata**: test minimi che il delivery dovra superare per essere considered done
5. **OUT-of-scope esplicito**: cosa NON si fa in questa fase, perche, quando si rivisita
6. **DoD 18-voci**: Definition of Done checklist (vedi rule `delivery-completeness.md` se disponibile)
7. **Blocking input**: cose pendenti che richiedono input utente prima di proseguire

## Trigger phrases

"Engineering brief", "tech spec", "architecture decision", "ADR", "pre-spec tech doc", "scope freeze", "_plan.md", "brief tecnico", "spec tecnica", "decisione architetturale".

## Processo (5 step)

### 1. Leggi product-spec.md + technical-architecture.md

Estrai requirements + stack proposed + vincoli.

### 2. Applica 8 domande tecniche canonical

| # | Domanda | Output |
|---|---|---|
| 1 | Quale stack (linguaggio, framework, DB)? | Decisione + 2-3 alternative |
| 2 | Deployment target (cloud, container, serverless, on-prem)? | Decisione + razionale |
| 3 | Data model: relational, document, hybrid? | Decisione + schema preliminare |
| 4 | Auth model: OAuth, session, JWT, magic link, SSO? | Decisione + flow diagram |
| 5 | Scaling strategy (vertical, horizontal, serverless auto)? | Decisione + breakpoint |
| 6 | Security posture (OWASP Top 10, secret mgmt, audit logs)? | Checklist applicabile |
| 7 | Observability (metrics, logs, tracing, alerting)? | Stack proposto |
| 8 | Compliance (GDPR, AI Act, DORA, HIPAA, settore-specific)? | Lista applicabile |

### 3. Decisione architetturale formale

Scrivere Architecture Decision Record (ADR) per ogni decisione non-default. Format ADR:

```
# ADR-XXX: <decisione>

Status: proposed | accepted | superseded
Date: YYYY-MM-DD

## Context
Cosa motiva la decisione

## Considered options
1. Option A: pro, con
2. Option B: pro, con
3. Option C: pro, con

## Decision
Option X scelta

## Consequences
Quali tradeoff accettiamo
```

### 4. Definition of Done (DoD) 18-voci

Vedi rule `delivery-completeness.md` se presente nel pack, altrimenti DoD minimal:

- [ ] Tutti i test passano in CI
- [ ] Coverage >= 80% (o target documentato)
- [ ] Security scan clean (SAST, dep audit)
- [ ] Performance audit clean (no regression > 10%)
- [ ] Documentazione utente aggiornata
- [ ] Migration script + rollback script
- [ ] Monitoring dashboard + alert configured
- [ ] Smoke test prescribed for post-deploy

### 5. Output

`engineering-brief.md` salvato in `deliverables/engineering-brief/` o `_context/`. Chain Mandatory downstream: `vibecoding-engineer` puo partire.

## Skill chains

| Skill | M/C/R | Trigger |
|---|---|---|
| `codebase-onboarding` | C | se esistente repo da estendere, leggilo prima |
| `vibecoding-engineer` | M | downstream, parte dal brief prodotto |

## Validation Checkpoint

- [ ] 8 domande tecniche risposte (o gap esplicito flagged)
- [ ] ADR scritto per ogni decisione non-default
- [ ] DoD 18-voci compilato o adattato
- [ ] Blocking input listed con owner + entro quando
- [ ] OUT-of-scope esplicito documentato

## Fallback

- Spec mancante → richiedere all'utente product-spec.md prima di procedere
- Stack ambiguo → chiedere via clarification (no decisione arbitraria)
- 2+ alternative architettura senza preferenza utente → presentare matrix pro/con e chiedere

---

> Skill maintained by [Danilo Lapegna](https://danilolapegna.com). Public release of DL Solutions internal toolkit.
