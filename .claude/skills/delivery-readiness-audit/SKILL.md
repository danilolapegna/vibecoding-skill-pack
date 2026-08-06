---
name: delivery-readiness-audit
description: >
  Skill terminale di ogni vibecoding sprint. Audit binario READY/INCOMPLETE
  che valuta se il deliverable e davvero done o solo "70% claimato done".
  18-voci Definition of Done checklist, mechanical scan TODO/skip/console.log,
  delta plan vs realizzato, smoke test prescribed for re-verify. Use this
  skill when the user mentions "delivery audit", "is this done", "pre-merge
  check", "DoD check", "READY check", "audit prima del merge", "verifica
  consegna". Mandatory downstream di `vibecoding-engineer`: il prompt sequence
  chiude solo se questo audit dice READY.
last_updated: 2026-08-06
schema_version: 2
license: MIT
maintainer: github.com/danilolapegna
---

# Delivery Readiness Audit

> Skill canonica per non claimare "done" al 70%. Audit binario: o il deliverable e READY (consegnabile), o e INCOMPLETE (work-in-progress, no claim done). Nessuna zona grigia.

## Origine

Pattern cross-skill cross-progetto: developer (umano o AI) dichiara done un task che ha test ancora rossi, TODO non rimossi, smoke test non eseguito. Risultato: bug in produzione, rework costoso, fiducia erosa. Questa skill blocca questo pattern.

## Scope

Audit del deliverable contro 18-voci DoD checklist + 8 voci adversarial review + mechanical scan. Output: verdict READY o INCOMPLETE + diff plan vs realizzato + smoke test prescribed.

## Trigger phrases

"Delivery audit", "is this done", "pre-merge check", "DoD check", "READY check", "verifica consegna", "audit prima del merge", "delivery readiness", "ready to ship".

## Processo (4 step)

### 1. DoD 18-voci checklist

Per ogni deliverable, valuta:

1. [ ] Spec coverage: ogni REQ-XXX del product-spec ha corrispondenza nel codice?
2. [ ] Test coverage >= target (80% default o documentato)
3. [ ] Tutti i test passano in CI (no skip, no @ignore)
4. [ ] Lint clean (0 error, 0 warning > info)
5. [ ] Security scan clean (SAST + dep audit)
6. [ ] No hardcoded secrets (grep API_KEY/PASSWORD/SECRET)
7. [ ] No console.log / debug print in production code paths
8. [ ] No TODO/FIXME nel codice (eccetto safe-* dichiarati)
9. [ ] Migration script presente + reversible
10. [ ] Rollback script testato
11. [ ] Smoke test eseguito su staging (output saved)
12. [ ] Performance audit: no regression > 10% vs baseline
13. [ ] Documentazione utente aggiornata (README, CHANGELOG)
14. [ ] Monitoring dashboard configurato (metrics, logs, alert)
15. [ ] Error handling: ogni async path ha try/catch o error type
16. [ ] Input validation: ogni endpoint pubblico ha schema validation
17. [ ] FM-XX coverage: ogni feature shipped dichiara FM-XX bloccati (vedi vibecoding-engineer registry)
18. [ ] Self-Score >= 9/10 + Adversarial Review 3-domande risposte

### 2. Mechanical scan

```bash
# TODO scan
TODOS=$(grep -rE "TODO|FIXME|HACK|XXX" src/ --include="*.{ts,js,py,go}" 2>/dev/null | grep -v "// SAFE-" | wc -l)
[ "$TODOS" -gt 0 ] && echo "FAIL: $TODOS TODO non SAFE-tagged" && exit 1

# Console.log scan
LOGS=$(grep -rE "console\.(log|debug)" src/ --include="*.{ts,js}" 2>/dev/null | grep -v "// SAFE-" | wc -l)
[ "$LOGS" -gt 0 ] && echo "FAIL: $LOGS console.log non SAFE-tagged" && exit 1

# Skipped tests scan
SKIPPED=$(grep -rE "\.(skip|only|xit|xdescribe)\(" tests/ --include="*.{ts,js,py}" 2>/dev/null | wc -l)
[ "$SKIPPED" -gt 0 ] && echo "FAIL: $SKIPPED test skipped/only" && exit 1

echo "OK: mechanical scan passed"
```

Se >=1 fail → INCOMPLETE. Riformula deliverable, NON consegnare.

### 3. Delta plan vs realizzato

Tabella 4 colonne:

| Piano (da engineering-brief) | Realizzato | Gap | Razionale gap |
|---|---|---|---|
| [item] | DONE / PARTIAL / SKIPPED | [descrizione] | [perche] |

Ogni gap deve avere razionale esplicito (decisione conscious vs scoping out vs blocked). No "dimenticato".

### 4. Verdict (3 esiti, non 2)

Il verdetto binario READY/INCOMPLETE della v0.1 aveva un buco: non distingueva fra "il codice e' incompleto" e "il codice e' completo ma nessuno ha ancora visto il sistema girare davvero". Quel secondo caso finiva schiacciato su READY, ed e' il modo piu' comune in cui un deliverable verde diventa un incidente. Da v0.2 gli esiti sono tre.

- **READY**: DoD verde, mechanical scan 0 fail, ogni gap del delta plan ha razionale accettabile, **piu' una osservazione a runtime del sistema reale con dati reali**. Il vocabolario di rilascio (`production-ready`, `works end-to-end`, `live`, `shipped to users`) e' legale solo qui.
- **CODE-COMPLETE, RUNTIME-UNVERIFIED**: tutto il resto e' verde ma l'audit non ha potuto eseguire il sistema reale (piattaforma gestita da terzi, ambiente browser-gated, credenziali non disponibili). E' un esito ONESTO e legittimo, non una bocciatura, ma richiede un handoff tracciato e vieta il vocabolario di rilascio.
- **INCOMPLETE**: qualunque altra cosa. Riformula come work-in-progress. Nessun claim done.

#### Blocco richiesto per READY

```markdown
## Runtime observation
surface: <route o componente>
data: real
observed: <il valore o la decisione REALE vista a schermo, mai "rendered", mai "no crash">
verified_at: <URL deployato non locale>
```

#### Blocco richiesto per CODE-COMPLETE, RUNTIME-UNVERIFIED

```markdown
## Runtime handoff
cannot-run: <perche', in concreto>
owner: <chi puo' eseguirlo>
to-verify: <i click esatti da fare + il dato reale atteso>
tracker: <link o id>
```

Regola che chiude il buco: **un "pending, lo verifichiamo dopo" non puo' convivere con un verdetto READY**. Se resta una verifica runtime sospesa, il verdetto scende a CODE-COMPLETE, RUNTIME-UNVERIFIED, che a sua volta obbliga all'handoff. Un pending in nota a pie' di pagina e' esattamente il meccanismo con cui la verifica viene rimandata per sempre.

## Skill chains

| Skill | M/C/R | Trigger |
|---|---|---|
| `vibecoding-engineer` | M upstream | l'audit valuta il deliverable della sequenza prompt |
| `engineering-brief` | C | usa il brief come baseline per delta plan |

## Validation Checkpoint

- [ ] DoD 18-voci risposta esplicita YES/NO per ogni voce
- [ ] Mechanical scan eseguito, 0 fail
- [ ] Delta plan vs realizzato compilato come tabella 4 colonne
- [ ] Verdict dichiarato fra i tre esiti, senza zone grigie
- [ ] Se READY, blocco `## Runtime observation` compilato con un valore reale osservato
- [ ] Se CODE-COMPLETE RUNTIME-UNVERIFIED, blocco `## Runtime handoff` completo di owner e checklist
- [ ] Nessun claim di rilascio in un deliverable che non sia READY
- [ ] Se INCOMPLETE, lista actionable per riformulare

## Fallback

- DoD checklist non disponibile → usa default 18-voci sopra
- Mechanical scan fail → INCOMPLETE automatico, no override
- Engineering brief non esiste → flag "audit-without-baseline" + caveat in output
- Sistema non eseguibile dall'audit → CODE-COMPLETE RUNTIME-UNVERIFIED con handoff, mai READY con un pending in nota

## Bypass policy

Bypass totale su richiesta utente esplicita possibile ma loggato come framework-failure. Skip directive in commit body (es. `delivery-audit-skip: <gate> - <reason>`) ammessa max 1 alla volta, motivata. >1 skip = INCOMPLETE strutturale.

---

> Skill maintained by [Danilo Lapegna](https://danilolapegna.com). Public release of DL Solutions internal toolkit.
