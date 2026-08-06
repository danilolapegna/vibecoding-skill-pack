---
name: vibecoding-engineer
description: >
  Production-ready prompt generator for industrial-scale agentic vibecoding.
  From a product spec and a technical architecture, generates a complete set
  of prompts for architecture, feature, testing, CI/CD, security, deployment,
  with an Anti-Pattern Registry of 26 failure modes integrated by design.
  Each generated prompt declares which failure modes it prevents and which
  test gates verify them. Use this skill when the user mentions generating
  prompts for AI coding assistants (Cursor, Lovable, Claude Code, Devin, GitHub
  Copilot Workspace), vibecoding sessions, spec-driven development, or
  production-ready code generation from requirements. Triggers: "vibecoding",
  "generate development prompts", "spec to code prompts", "production-ready AI
  coding prompts", "Cursor rules generation", "Lovable prompt sequence",
  "Claude Code skill prompts", "agentic coding playbook", "prompt engineering
  for codebase", "engineering prompt sequence". Make sure to use this skill
  whenever the user wants prompts that guide an AI coding assistant through a
  structured build, even if they do not say "vibecoding" explicitly.
last_updated: 2026-08-06
schema_version: 2
license: MIT
maintainer: github.com/danilolapegna
---

# Vibecoding Engineer, Production-Ready Prompts with Anti-Pattern Registry

> Skill canonica per generare prompt destinati ad AI coding assistant in modalita vibecoding. Output: una sequenza ordinata di prompt template self-contained, tracciati ai requisiti del product spec, con coverage esplicito di 26 failure mode noti: 12 di design del sistema agentico, 14 di consegna in produzione.

## Quality Gate Profile

- Tipo: content (genera prompt template, non codice di produzione)
- Scrive dati chiave: no
- Richiede writing-style sample: optional (per fraseggio voice-coherent)
- Pre-flight research: si, per stack-specific best practices aggiornate
- Coverage failure mode: mandatory, per ogni prompt

## Edge: Spec-Driven + Gate-Integrated + Context-Layered + FM-Aware

1. Spec-Driven: ogni prompt e derivato direttamente da product-spec e technical-architecture, non da descrizioni vaghe. I requisiti funzionali diventano istruzioni eseguibili tracciate con REQ-ID univoco.
2. Gate-Integrated: integra automaticamente vincoli da security check, performance audit, devops readiness come guardrail dentro ogni prompt, non come step separato post-coding.
3. Context-Layered: ogni prompt include il contesto necessario per l'AI coding assistant (schema DB, API contracts, dependency list, coding standards), eliminando il ciclo prompt → errore → ri-prompt.
4. FM-Aware: ogni prompt e check-listed contro il Failure Mode Registry (26 FM-XX). Pattern preventivi integrati by-design nel prompt template. Test gate auto-suggested per ogni FM-XX rilevante al contesto. I prompt di deployment e CI/CD pescano soprattutto dalla Parte B del registry, quelli di architettura dalla Parte A.

Framework: Specification-First Prompting + Defense-in-Depth + Failure-Mode-Preventive.

## Dipendenze (soft, optional context)

La skill cerca questi file in una `context/` folder del progetto. Se mancano, procede con best practice generiche e segnala il gap esplicitamente.

- `context/product-spec.md` mandatory: feature list, requisiti funzionali, data model
- `context/technical-architecture.md`: stack, componenti, API, deployment target
- `context/codebase-state.md`: stato repo, struttura codice, CI/CD esistente
- `context/security-check.md`: vulnerabilita note, OWASP checklist, auth requirements
- `context/performance-audit.md`: bottleneck, target performance
- `context/devops-readiness.md`: pipeline CI/CD, infrastruttura, monitoring
- `brief.yaml`: stack preferito, team size, competenze tecniche

Se `product-spec.md` non esiste, fermati e chiedi all'utente di fornire almeno una product spec minima.

## Processo (8 step)

### 1. Inventario requisiti

Leggi product-spec e technical-architecture. Estrai componenti, feature, data model, API endpoints, auth model, stack, target deployment, coding standards.

### 2. Mappa prompt → requisiti (traceability matrix)

Per ogni feature, definisci quali prompt servono. Ogni prompt deve tracciare il REQ-ID di origine e i FM-XX che blocca by-design.

| Componente | Feature | Prompt type | Priority | FM-XX che previene |
|---|---|---|---|---|
| [comp] | [feat] | architecture | P0 | FM-04, FM-05 |
| [comp] | [feat] | feature | P0 | FM-03, FM-07, FM-12 |
| [comp] | [feat] | testing | P1 | FM-06 |
| [comp] | [feat] | security | P1 | FM-08 |

### 3-7. Generazione prompt per layer

Per ognuno dei 6 layer (architecture, feature, testing, CI/CD, security, deployment), genera prompt che seguono il formato canonical:

```
## Contesto
[Stack, architettura, vincoli, tutto cio che l'AI deve sapere PRIMA di scrivere codice]

## Requisito
[Cosa deve fare, collegato a REQ-XXX]

## Vincoli
[Sicurezza, performance, standard]

## Anti-pattern blocked
[FM-XX prevented by this prompt by-design]

## Output atteso
[File, struttura, test che deve produrre]

## Criteri di accettazione
[Come verificare il codice, includendo test gate FM-XX]
```

Regola anti-ambiguita: ogni prompt e self-contained, eseguibile senza leggere altri prompt.

### 8. Quality Gate Review

Per OGNI prompt generato: traccia requisito specifico, contesto self-contained, criteri verificabili, vincoli sicurezza integrati, output atteso specificato, FM-XX blocked + test gate dichiarati.

---

## Failure Mode Registry (canonical reference)

> Origine: catalogati da post-mortem reali di sistemi agentici production-grade. 26 failure mode che si ripetono cross-progetti.
>
> Il registry ha due parti. **Parte A (FM-01 a FM-12)** riguarda il DESIGN di un sistema agentico: come l'agente ragiona, dove tiene lo stato, cosa mostra all'utente. **Parte B (FM-13 a FM-26)** riguarda la CONSEGNA: i modi in cui codice verde arriva in produzione e non funziona. Parte B nasce da post-mortem di deploy reali ed e' l'aggiunta della v0.2.
>
> La distinzione conta perche' i due gruppi si prevengono in momenti diversi. Parte A si previene mentre progetti l'agente, quindi vive nei prompt di architettura. Parte B si previene mentre consegni, quindi vive nei gate di CI, negli hook e nelle sonde post-deploy. Un prompt che copre solo la Parte A produce un agente ben disegnato che nessuno riesce a mandare in produzione.

### Parte A, design del sistema agentico

| ID | Sintomo | Preventive pattern | Test gate |
|---|---|---|---|
| FM-01 | Orchestrator gira in tondo, raccoglie idee senza scopo | Alignment-score loggato per ogni skill invocation, audit periodico abort run se < soglia | `orchestrator-goal-filter.test` |
| FM-02 | Panic-mode budget (token cap stringato hard-cut) | Stop conditions = quality gate raggiunto OR user-in-loop checkpoint | `stop-conditions.test` |
| FM-03 | Artefatti orfani (output prodotti mai usati) | Resolvability schema-level + lifecycle state machine per ogni artifact | `artifact-schema-contract.test` |
| FM-04 | Skill aggiunte rompono onboarding | Capability registry runtime + DSL JSON-logic per skill discovery | `capability-registry-discovery.test` |
| FM-05 | Run paralleli causano corruption | State persistence + lock atomico (user, resource) | `concurrent-run-lock.test` |
| FM-06 | Cache scollegata silent-fail | Cache-first mandatory + write atomico fail-loud | `cache-write-completion.test` |
| FM-07 | Self-as-competitor | Self-entity filter deterministico post-LLM + identity resolution | `self-entity-filter-integration.test` |
| FM-08 | Garbage agentica visibile a user | Admin/User parity con automatic strings scan | `user-ui-no-jargon.test` |
| FM-09 | Configurazione = decision tree manual statico | Configurazione = prompt semi-deterministico LLM-guided | (architettura invariant, audit code review) |
| FM-10 | Agenti UI come second-class | Pairing mandatory con retrieving agents | `ui-agent-pairing.test` |
| FM-11 | Quick action menu shotgun pre-prompt | Home prompt-only + LLM-guided runtime | `home-no-quick-actions.test` |
| FM-12 | Numeri "a sentimento" passati come fact | Schema: ogni numero con `evidence_class` enum (Verified/Declared/Inferred) | `numeric-claim-tagging.test` |

### Parte B, consegna e produzione

> Il filo conduttore: ogni riga qui sotto e' una conflazione fra due cose che sembrano la stessa e non lo sono. Compila non e' boota. Boota non e' raggiungibile. Renderizza non e' funziona. Locale non e' deployato. Verde in CI non e' vivo per l'utente.

| ID | Sintomo | Preventive pattern | Test gate |
|---|---|---|---|
| FM-13 | Build "riuscita" che spedisce un bundle morto: mancano le env var del client, l'app va in schermo bianco al boot | Guard fail-closed nel build: se una env var richiesta manca, il build FALLISCE (l'ultimo deploy buono resta vivo). Il check gira sul canale su cui i commit atterrano davvero, non solo sulle pull request | `build-env-guard.test` |
| FM-14 | "Renders" letto come "works": lo smoke monta un componente su dati finti in locale e l'esito passa per prova della superficie deployata | L'evidenza dichiara tre campi: `data` (real o stubbed), un criterio di successo che nomina CONTENUTO reale atteso (mai "rendered", mai "no crash"), e l'URL deployato verificato | `smoke-evidence-substance.test` |
| FM-15 | Deploy diviso: il frontend parte col push mentre migration e funzioni richiedono un apply separato, e le due meta' divergono per default | Manifest di deploy che elenca ogni artefatto e la conferma del suo atterraggio; "done" resta bloccato finche' entrambe le meta' non sono confermate | `split-deploy-parity.test` |
| FM-16 | Compila ma non boota: il type-check passa e l'artefatto deployato muore all'avvio (classico: export duplicato in un modulo condiviso che stende ogni importer) | Sonda di boot post-deploy contro il gateway reale per ogni funzione cambiata; quando cambia un modulo condiviso la sonda gira su tutti gli importer, non solo sul file toccato | `boot-probe.test` |
| FM-17 | Boota ma non e' innescabile: l'endpoint risponde 200 alle tue chiamate di test e rifiuta la credenziale che il suo scheduler reale gli manda. La feature non gira mai, in silenzio | Helper di auth canonico che accetta ogni credenziale che il trigger reale puo' presentare, verificato contro il trigger vero e non contro un'assunzione | `trigger-auth.test` |
| FM-18 | La credenziale muore a codice invariato: l'auth si rompe in produzione senza che nessuno abbia deployato niente | Sonda schedulata FUORI dalla piattaforma che estrae la chiave dal bundle DEPLOYATO e prova quella contro l'endpoint auth reale. Testare una chiave assunta produce falsi allarmi al primo drift | `auth-health.test` (cron, off-platform) |
| FM-19 | Un test runner che non parte trattato come skip: "tests didn't run" accettato come stato di consegna | Un comando canonico che ripara l'ambiente e poi esegue tutto, propagando l'exit code di ogni processo figlio. Una skip il cui motivo e' un guasto d'ambiente viene RIGETTATA; una skip motivata dallo scope resta legittima | `runner-boot.test` |
| FM-20 | Assi finti: uno step o un wizard offre una scelta che il frontend ha INFERITO, non che il server ha DICHIARATO. Sembra una decisione, non e' sostenuta da niente | Ogni elemento di decisione cita la posizione di codice del campo server che lo dichiara (citazione a due lati). Se quel campo non esiste, va confessato come derivato o inerte, non spacciato per scelta reale | `decision-provenance.test` |
| FM-21 | Integrazione auto-attestata: entrambi i lati compilano, ognuno e' internamente valido, e il contratto fra loro non combacia (campi ignorati, scope divergenti, enum disallineate) | Audit indipendente che legge ENTRAMBI i lati di ogni contratto e cita le due posizioni di codice. L'auto-attestazione non vede il mismatch per costruzione: ogni lato e' valido da solo | `integration-contract.test` |
| FM-22 | Rimozione reattiva: cancelli file o export e scopri i call site quando qualcosa si rompe a runtime | Ricerca forward di TUTTI i call site prima della rimozione, classificazione di ognuno (commento, codice attivo, test, doc), refactor nello stesso commit del drop | `drop-impact.test` |
| FM-23 | Dati effimeri senza ciclo di vita: colonna TTL senza indice, senza meccanismo di pulizia, senza retention dichiarata. Le righe si accumulano in silenzio per mesi | Indice sulla colonna TTL, meccanismo di cleanup dichiarato e retention documentata NELLA STESSA migration che crea la tabella. "Il cleanup lo aggiungiamo dopo" non e' enforce-abile | `ephemeral-lifecycle.test` |
| FM-24 | "Done" dichiarato al 70%: le feature mancanti non sono dichiarate parziali, semplicemente non vengono menzionate | Ogni requisito del piano riceve uno stato esplicito DONE, PARTIAL o NOT-STARTED. Il silenzio non e' uno stato. Tabella piano contro realizzato, mai prosa | `plan-delta.test` |
| FM-25 | Pubblicazione dedotta dall'interfaccia: un toast, un pannello che si chiude o un push andato a buon fine letti come prova che la cosa e' live | La prova si legge dall'ARTEFATTO servito: scarica il bundle deployato e cerca un marcatore che sopravvive alla minificazione, piu' un marcatore di controllo che NON deve esserci. Un evento di UI non prova niente | `publish-artifact.test` |
| FM-26 | Metadati di version control dentro una cartella cloud-sync: il syncer riscrive oggetti e ref mentre git ci lavora, e produce HEAD che saltano e rebase corrotti | Escludere i metadati del repo dalla sincronizzazione (stesso meccanismo usato per le dipendenze installate) e sondare l'integrita' a inizio sessione, prima di scrivere | `vcs-location.test` |

**Come usare il Registry**:

1. Per ogni prompt che generi, scan il context per pattern compatibili con FM-XX
2. Aggiungi sezione `## Anti-pattern blocked` elencando i FM-XX prevenuti
3. Per ogni FM-XX bloccato, aggiungi test gate suggerito in `## Criteri di accettazione`
4. Audit log: ogni feature shipped logga nel PR description i FM-XX coperti

**Regola d'oro**: ogni feature shipped DEVE rispondere in PR description «Quale FM-XX evita o non re-introduce? Quale test gate la copre?». Se non risponde, PR blocked.

## Esempio concreto

Vedi `examples/01-orchestrator-prompt/` e `examples/02-feature-prompt-with-fm-coverage/` per template completi rendered.

---

## Regole

- MAI generare prompt vaghi tipo «crea un'app per X». Ogni prompt e specifico, FM-aware
- MAI omettere il contesto di sicurezza
- MAI generare prompt senza criteri di accettazione
- Ogni prompt DEVE essere self-contained
- Se product-spec e incompleto, segnalare il gap con `[GAP: dettaglio mancante]`
- Ordine di esecuzione esplicito (numerato, con dipendenze)
- Se stack non e definito, chiedere PRIMA di generare
- Ogni prompt DEVE elencare FM-XX bloccati + test gate

## Date / Timestamp handling

Ogni data umana citata DEVE essere verificata via bash check PRIMA del publish. Mai aritmetica mentale.

## Anti-pattern enforcement step

Prima di consegnare, esegui questi check automatici:

```bash
OUTPUT_DIR=${OUTPUT_DIR:-deliverables/vibecoding-engineer}

# Check 1: nessun prompt vago
grep -iE "^- (crea (un|una|il|la) (app|tool|sistema|funzione))|^- (create (an|a) (app|tool|system))" "$OUTPUT_DIR"/*-prompts.md \
  && echo "FAIL: vague prompt detected" && exit 1

# Check 2: ogni prompt ha sezione FM-XX
for f in "$OUTPUT_DIR"/*-prompts.md; do
  count_prompts=$(grep -c "^## Requisito" "$f")
  count_fm=$(grep -c "^## Anti-pattern blocked" "$f")
  [ "$count_prompts" -ne "$count_fm" ] && echo "FAIL: $f FM count mismatch" && exit 1
done

# Check 3: nessun secret hardcoded
grep -iE "password.*=.*['\"]|api_key.*=.*['\"]|secret.*=.*['\"]" "$OUTPUT_DIR"/*-prompts.md \
  && echo "FAIL: hardcoded secret" && exit 1

# Check 4: ogni prompt ha Criteri di accettazione
for f in "$OUTPUT_DIR"/*-prompts.md; do
  count_prompts=$(grep -c "^## Requisito" "$f")
  count_criteria=$(grep -c "^## Criteri di accettazione" "$f")
  [ "$count_prompts" -ne "$count_criteria" ] && echo "FAIL: $f criteria mismatch" && exit 1
done

echo "OK: anti-pattern enforcement passed"
```

Se >=1 check fallisce, riformula il deliverable, NON consegnare.

## Output → `deliverables/vibecoding-engineer/`

- `architecture-prompts.md`, `feature-prompts.md`, `testing-prompts.md`, `cicd-prompts.md`, `security-prompts.md`, `deployment-prompts.md`
- `fm-coverage-matrix.md`: tabella FM-XX × prompt-id
- `_summary.md`: executive summary con traceability matrix REQ-XXX × prompt × FM-XX

### Regole d'oro deliverable (3-7 bullet actionable)

- Non dare i prompt al collaboratore senza il brief di contesto
- Ogni prompt ha un gate di qualita, itera il prompt non l'output
- Test su un progetto piccolo prima di usare su un progetto cliente
- Ogni feature shipped: PR description risponde «quale FM-XX evita, quale test gate la copre»
- Audit FM-coverage-matrix ogni 30 giorni

## Validation Checkpoint (mapped to 10 Invariants)

Le 10 Invariants sono definite in `.claude/rules/skill-design-invariants.md`.

- [ ] Invariant 1 (Memory persistence): project log entry creata se applicabile
- [ ] Invariant 2 (Schema versioning): `last_updated` bumped, `schema_version` consistente
- [ ] Invariant 3 (Source of truth): stato verificato via product-spec.md + tech-arch.md
- [ ] Invariant 4 (Trigger phrase coverage): >=5 totali (vedi description)
- [ ] Invariant 5 (Degraded mode): Fallback dichiarata
- [ ] Invariant 6 (Anti-pattern enforcement): bash check pre-delivery passed
- [ ] Invariant 7 (Skill chain declaration): M invocate o pending
- [ ] Invariant 8 (Output path canonico): deliverables in cartella canonical
- [ ] Invariant 9 (Date handling): ogni data umana bash-checked
- [ ] Invariant 10 (Validation Checkpoint): this checklist completata
- [ ] Quality Gate Review: ogni prompt traccia requisito, e self-contained, FM-aware
- [ ] Adversarial Review 3-domande risposta esplicita
- [ ] `fm-coverage-matrix.md` generato

## Adversarial Review

1. Quali sono 3 motivi per cui un esperto criticherebbe questo output?
2. Cosa manca rispetto al gold standard (Cursor Rules, Copilot Workspace, Devin specs)?
3. Se un senior engineer lo vedesse, cosa direbbe?
4. Quali FM-XX del registry NON sono coperti? E intenzionale o gap?

## Self-Score

Dopo la generazione, valuta 0/1: traceability matrix completa, prompt self-contained, criteri verificabili, vincoli sicurezza integrati, ordine esplicito, testing coverage completo, gap segnalati, formato consistente, FM-coverage completa.

Score >= 8/9 = consegna. < 8 = itera.

## Fallback

- Input mancanti critici → fermarsi, chiedere all'utente
- Ricerca live fallisce → procedere con knowledge cutoff + flag low-confidence
- Skill chain Mandatory non eseguibile → dichiararla pending in "Chain status"
- Output path non scrivibile → ripiegare su `/tmp/` + segnalare manualmente
- Deliverable > 50% token → spezzare in deliverable multipli linkati
- FM-coverage incompleta → dichiarare gap esplicito, non inventare prevenzione fittizia

## Skill chains (auto-enforcement)

Vedi `.claude/rules/skill-chaining.md` per SSOT. Per questa skill:

| Skill | M/C/R | Trigger |
|---|---|---|
| `engineering-brief` | M | PRIMA del prompt sequence, serve il brief tecnico operativo |
| `codebase-onboarding` | C | se repo esistente da estendere |
| `delivery-readiness-audit` | M | chiusura sequenza prompt, gate finale READY/INCOMPLETE |

Enforcement: prima di consegnare, esegui Mandatory non gia fatte, valuta Conditional, includi blocco "Chain status" nel deliverable. `delivery-readiness-audit` e bloccante: INCOMPLETE → riformula come work-in-progress, mai consegnare come done.

---

## Maintainer

Skill maintained by [Danilo Lapegna](https://danilolapegna.com), founder of DL Solutions (Amsterdam). Built originally for client deliverables on agentic AI security and automation engagements. The Failure Mode Registry was catalogued from real production agent post-mortems and is released as canonical reference for the community.

If you find this useful, the [calendar booking link](https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0-J9nTQhY6guG-CdCGsJ6iBH71UNk47I4t5iO5s8WZe_dd-yuU6gKAkwCam-8sE3qLfEG0Cvls) is open for agentic AI engineering conversations.

Cross-reference case study: [danilolapegna.com/guides/agentic-ai-security](https://danilolapegna.com/guides/agentic-ai-security).
