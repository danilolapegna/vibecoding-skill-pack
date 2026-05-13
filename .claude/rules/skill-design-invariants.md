# Rule: Skill Design Invariants (always-active)

> 10 Invariants che ogni skill custom del pack DEVE rispettare. Quando un invariant e violato, la skill e incompleta, anche se gira e produce output.

## Principio cardine

For every output, there's a memory of how we got here. Ogni deliverable cliente-facing prodotto da una skill DEVE:

1. Lasciare traccia nel log centrale del progetto (se applicabile)
2. Citare la fonte autoritativa che ha consultato
3. Dichiarare a quale stato del progetto porta il sistema dopo l'esecuzione

Una skill che produce file in `deliverables/` ma non aggiorna il log centrale del progetto e rotta per design, anche se il file e perfetto.

## I 10 Invariants

### Invariant 1: Memory persistence

Ogni skill che produce un deliverable significativo DEVE produrre anche una entry di log nel project log (es. `CHANGELOG.md`, `docs/audit-log.md`, o sistema esterno tipo ClickUp/Linear). Skip se: output e abort/dry-run/error oppure il progetto non ha un mechanism di logging upstream.

### Invariant 2: Schema versioning

Ogni skill che muta file canonical (es. `_state.json`, config files) DEVE: (a) bumpare `last_updated`, (b) rigenerare artifact dashboard se applicabile, (c) per cambi di schema, bumpare `schema_version` esplicitamente.

### Invariant 3: Source of truth

Ogni skill che dipende dallo stato corrente di un dominio DEVE consultare la fonte autoritativa dichiarata, non inferenze da nomi file/cartelle/sequenze. Pattern vietati: counter/sequence ("file con N piu alto = ultimo"), cache stale, presence/absence di task come stato.

### Invariant 4: Trigger phrase coverage

Ogni skill DEVE dichiarare nelle prime 10 righe del SKILL.md (frontmatter description o sotto-titolo) almeno 4 trigger phrases naturali in lingua primaria + 1 in inglese (se differenti), mappate a operazioni specifiche se la skill e multi-modal.

### Invariant 5: Degraded mode

Ogni SKILL.md DEVE avere sezione `## Fallback / cosa fare se la skill si rompe` con almeno 5 case canonici: input mancanti, ricerca live fallisce, skill chain non eseguibile, output path non scrivibile, deliverable supera 50% token disponibili.

### Invariant 6: Anti-pattern enforcement procedurale

Ogni anti-pattern dichiarato in una skill DEVE avere uno step procedurale che lo BLOCCA, non solo prosa narrativa che lo descrive. La regola e fail-safe. Format canonico: bash check / grep / boolean assertion pre-delivery, fail = abort.

### Invariant 7: Skill chain declaration

Ogni skill DEVE avere sezione `## Skill chains` con tabella M (Mandatory) / C (Conditional) / R (Recommended), anche se vuota. Vedi `skill-chaining.md` per SSOT.

### Invariant 8: Output path canonico

Ogni skill DEVE dichiarare il path canonico dove salva l'output. Pattern preferito: `<project>/deliverables/<skill-name>-<YYYY-MM-DD>.<ext>` oppure `<project>/_context/<event>-<YYYY-MM-DD>.md`.

### Invariant 9: Date / timestamp handling con bash check

Ogni skill che cita date umane in deliverable DEVE eseguire bash check date prima del publish. Pattern: `for d in <YYYY-MM-DD list>; do echo "$d → $(TZ=<tz> date -d "$d" '+%A %d %b %Y')"; done`. Output bash e la SOLA fonte per giorno-settimana citato. Mai aritmetica mentale.

### Invariant 10: Validation Checkpoint pre-deliverable

Ogni SKILL.md DEVE avere sezione `## Validation Checkpoint` con 8-12 checkbox che il LLM completa PRIMA di stampare il deliverable. Self-check obbligatorio, non opzionale.

## Audit periodico (ogni 90 giorni)

Ogni 90 giorni, eseguire audit del pack:

1. **Sample**: tutte le skill custom del pack
2. **Check**: per ogni skill, verifica i 10 invariants
3. **Report**: tabella con score 0-10 (un punto per invariant rispettato)
4. **Fix**: skill con score <8 vanno refactored. Score <5 = critical
5. **Update**: se emerge un nuovo pattern di buco non coperto, aggiungere Invariant 11+ con origine documentata

## Quando questa rule si applica

**Sempre** durante:

- Creazione di nuova skill nel pack
- Refactor di skill esistente
- Audit periodico (90gg)
- Quando emerge un bug live in una skill, analizza quale Invariant e stato violato

**NON si applica per**:

- Built-in Claude Code skills (init, review, ecc.)
- Anthropic skills core (docx, pptx, ecc.)
- Skill archived (`_archive/`)

## Anti-pattern (cose che NON sono enforcement)

- Citare un Invariant nella SKILL.md senza implementare lo step corrispondente, cargo-cult
- Aggiornare questa rule senza fixare le skill che la violavano in retrospettiva, drift framework
- Eseguire audit periodico solo se "ho tempo", audit e mandatory schedulato
- Aggiungere Invariant 11+ senza origine documentata, invariants-by-vibes

## Versioning

- **v1 (2026-05-13)**: prima versione public release. 10 invariants distillati da audit interno + lesson learned cross-skill.

---

> Rule maintained by [Danilo Lapegna](https://danilolapegna.com). Public release of DL Solutions internal framework.
