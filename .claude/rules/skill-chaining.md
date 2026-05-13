# Rule: Skill Chaining (always-active)

> Governance dei chain fra skill. Le skill del pack non sono isole: ogni skill dichiara le proprie chain con tag M (Mandatory) / C (Conditional) / R (Recommended). Questa rule e SSOT della logica chain.

## Principio cardine

Ogni skill che produce un deliverable downstream o consuma uno upstream DEVE dichiarare il chain. Senza dichiarazione esplicita, il flusso fra skill diventa implicito e fragile.

## Notazione

- **M (Mandatory)**: la chain DEVE essere eseguita per non lasciare il deliverable incompleto
- **C (Conditional)**: la chain si esegue solo se una condizione esplicita e vera
- **R (Recommended)**: suggerimento, no enforcement (la skill puo procedere senza)

## Chain canonical del vibecoding-skill-pack

```
codebase-onboarding (C: se repo esistente)
    ↓ context/codebase-state.md
engineering-brief (M upstream)
    ↓ engineering-brief.md
vibecoding-engineer
    ↓ deliverables/vibecoding-engineer/
delivery-readiness-audit (M downstream)
    ↓ verdict READY o INCOMPLETE
```

## Protocollo di enforcement (4 step + 1 entry-point)

### Step 0: Pre-task scan

Prima di eseguire una skill, scan il context per dipendenze:
- Esiste `context/product-spec.md`? Se no, engineering-brief deve raccoglierlo prima
- Esiste `context/codebase-state.md`? Se no e c'e un repo esistente, codebase-onboarding deve girare prima
- E gia stato eseguito `engineering-brief.md` in questa sessione? Se no, vibecoding-engineer non puo partire

### Step 1: In chiusura di ogni skill

Esegui questi 4 step prima di consegnare il deliverable finale:

1. **Lookup chain**: consulta la sezione "Skill chains" del proprio SKILL.md. Identifica skill Mandatory e Conditional del proprio chain.
2. **Apply conditions**: per ogni Conditional, verifica se la condizione e vera. Se vera, diventa Mandatory.
3. **Execute or declare**: per ogni Mandatory non ancora eseguita in sessione, o eseguila (preferibile), o produci un placeholder esplicito "Chain pending: skill X, sara eseguita separatamente entro [tempo]". Mai ignorare silenziosamente.
4. **Verify in deliverable**: la sezione finale di ogni deliverable include un blocco "Chain status" che dichiara: skill chiamate, pending, escluse con razionale.

## Format del blocco "Chain status" nel deliverable

Ogni deliverable di una skill che ha chain DEVE includere:

```markdown
## Chain status

### Eseguite
- `skill-name` - [data] - output: [link al doc]

### Pending
- `skill-name` - motivo del rinvio + entro quando - chi e owner

### Escluse (con razionale)
- `skill-name` - escluso perche: [condizione non vera / fuori scope / gia coperto in altro doc]
```

## Anti-pattern (cose che NON sono enforcement)

- Citare una skill nel deliverable senza eseguirla ne dichiararla come pending
- Eseguire la chain ma non documentarla nel "Chain status"
- Saltare la chain con la scusa "tanto e simile". Se la skill esiste, ha un suo edge specifico
- Eseguire la chain SOLO se l'utente lo chiede esplicitamente. L'enforcement e automatico
- Eseguire la chain DOPO aver consegnato il deliverable principale. La chain informa il deliverable principale, non lo segue

## Cross-cutting trigger condizionali

### Trigger "dati personali GDPR / sensibili"

Se nello scope emergono dati personali (nome, email, telefono, indirizzo, identificatori, dati art. 9 GDPR), aggiungere check security extra nei prompt generati. Non e una skill del pack ma e un trigger che vibecoding-engineer deve onorare.

### Trigger "AI/automation in scope"

Se nello scope emergono chatbot, RAG, automation con LLM, agenti, classificazione/estrazione/generazione AI: applicare OWASP Agentic Top 10 (ASI01-ASI10) come baseline security nei prompt generati.

### Trigger "deploy in produzione"

Se il deliverable include deploy in produzione (no PoC, no test environment), la chain `delivery-readiness-audit` diventa Mandatory + bloccante. INCOMPLETE = no merge in main.

## Aggiornamento del file

Aggiornare questa rule quando:
- Nasce una skill nuova nel pack → aggiungerla alla chain canonical
- Una skill esistente arricchisce i propri trigger → aggiornare le sue chain
- Emerge un nuovo cross-cutting trigger → aggiungerlo
- Una chain viene smentita dall'esperienza (troppo verbosa, costo > beneficio) → degradare M → R o R → eliminata

Non aggiornare per: cambio nome cosmetic, riformulazione descrittiva, fix typo.

---

> Rule maintained by [Danilo Lapegna](https://danilolapegna.com). Public release of DL Solutions internal framework.
