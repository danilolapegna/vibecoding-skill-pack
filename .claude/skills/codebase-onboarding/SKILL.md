---
name: codebase-onboarding
description: >
  Skill che onboard una repo esistente prima di estenderla. Maps struttura,
  convenzioni di coding, build/test/deploy pipeline, dependency graph, tech
  debt visible, anti-pattern present. Use this skill when the user asks to
  "extend existing repo", "onboard a codebase", "audit before modifying",
  "what's in this repo", "leggi il codice", "fammi un mappa del progetto".
  Conditional dependency of `vibecoding-engineer`: trigger when target is
  an existing repo, skip for greenfield.
last_updated: 2026-08-06
schema_version: 2
license: MIT
maintainer: github.com/danilolapegna
---

# Codebase Onboarding

> Skill upstream Conditional del vibecoding-engineer. Se la target codebase esiste gia (greenfield = skip), produce una mappa che permette ai prompt downstream di estendere coerentemente senza romper convenzioni esistenti.

## Scope

Output documento `codebase-state.md` in `context/` che il vibecoding-engineer legge come contesto. Sezioni:

1. **Tree structure**: top-level dirs + scopo di ognuna
2. **Stack identificato**: linguaggio, framework, DB, infra (via package files + config)
3. **Build/test/deploy pipeline**: comandi canonical (npm scripts, Makefile, GitHub Actions)
4. **Coding conventions**: naming, file organization, import order, lint config
5. **Dependency graph**: top-level deps con versioni + alert dep vulnerabilities
6. **Tech debt visible**: TODO/FIXME/HACK/XXX scan + score severita
7. **Anti-pattern present**: violation di convenzioni proprie, code smells, security hotspots

## Trigger phrases

"Codebase onboarding", "audit before extending", "what's in this repo", "map the project", "leggi il codice", "onboard repo", "mappa del progetto", "convenzioni del codice".

## Processo (6 step)

### 1. Tree structure scan

```bash
tree -L 3 -d --noreport
find . -name "package.json" -o -name "Cargo.toml" -o -name "go.mod" -o -name "pyproject.toml" -o -name "Gemfile" | head -10
```

### 2. Stack identification

Leggi i package files per identificare linguaggio + framework + DB driver + infra dependencies.

### 3. Pipeline reconnaissance

```bash
cat package.json | jq .scripts 2>/dev/null
ls -la .github/workflows/ 2>/dev/null
find . -name "Dockerfile" -o -name "docker-compose.yml" | head -5
```

### 4. Coding convention extraction

Leggi 3-5 file representative per layer (1 component, 1 controller, 1 model, 1 test) e estrai pattern:

- Naming: camelCase, snake_case, PascalCase mix
- Import order: standard library, third-party, local
- File organization: feature-based vs layer-based
- Lint config: ESLint, Prettier, Black, ruff, golangci-lint

### 5. Anti-pattern scan

```bash
# TODO density
grep -rE "TODO|FIXME|HACK|XXX" --include="*.{ts,js,py,go,rb,java}" | wc -l

# Console logs left in prod
grep -rE "console\.(log|debug)" --include="*.{ts,js}" src/ 2>/dev/null | head -10

# Hardcoded secrets pattern
grep -irE "(api[_-]?key|secret|password)\s*=\s*['\"]" --include="*.{ts,js,py,go,env}" | head -10
```

### 6. State verification (nuovo in v0.2)

Due controlli che vanno fatti PRIMA di scrivere nel repo, non dopo.

**Lo stato si verifica alla fonte.** Nomi di file, nomi di cartelle, numeri di versione nei filename, date di modifica e task aperti non sono una state machine. Un file `v3-final` non prova che la v3 sia quella attiva; una migration presente non prova che sia stata applicata; un README che descrive un'architettura non prova che sia quella corrente. Per ogni fatto che scrivi in `codebase-state.md`, interroga la fonte autoritativa di quel dominio (il DB per lo schema, il gateway per le funzioni deployate, l'output del comando per la pipeline) e datalo. Se due fonti si contraddicono, vince quella piu' recente e la contraddizione va scritta, non risolta a intuito.

**Dove vivono i metadati di version control.** Un `.git` dentro una cartella sincronizzata sul cloud (Dropbox, iCloud, OneDrive, Drive) e' instabile per costruzione: il syncer riscrive oggetti e ref mentre git ci lavora.

```bash
GITDIR="$(git rev-parse --git-dir 2>/dev/null)" && GITDIR_REAL="$(cd "$GITDIR" && pwd -P)"
echo "$GITDIR_REAL" | grep -qiE "CloudStorage|Dropbox|iCloud|OneDrive|Google ?Drive|Box Sync" \
  && echo "WARNING: version control metadata inside a cloud-sync root. Exclude it from sync before writing." \
  && git fsck --connectivity-only --no-progress >/dev/null 2>&1 || echo "integrity probe failed: resolve before editing"
```

Se il probe fallisce o trovi un rebase/merge interrotto, la prima consegna e' rimettere in sesto il repo, non estenderlo (FM-26).

## Output

`context/codebase-state.md` con le 7 sezioni sopra compilate. Score finale onboarding (1-10) basato su quanto e clean il codebase.

## Skill chains

| Skill | M/C/R | Trigger |
|---|---|---|
| `engineering-brief` | M downstream | il brief usa codebase-state.md come input |
| `vibecoding-engineer` | M downstream eventuale | i prompt downstream sanno le convenzioni esistenti |

## Validation Checkpoint

- [ ] Tree structure documented
- [ ] Stack identificato + versioni
- [ ] Pipeline canonical (build/test/deploy) verificata runnable
- [ ] Convenzioni estratte da 3-5 file representative
- [ ] TODO/FIXME/HACK/XXX scan eseguito
- [ ] Anti-pattern catalogati (security, performance, naming inconsistencies)
- [ ] Ogni fatto di stato verificato alla fonte autoritativa e datato, non dedotto da nomi o date file
- [ ] Posizione dei metadati git verificata + probe di integrita' eseguito prima di scrivere
- [ ] Score onboarding 1-10 assegnato + razionale

## Fallback

- Repo vuoto / single-file → flag "greenfield, skip codebase-onboarding"
- Repo enorme (>10k files) → focus su top-level + 1 feature representative
- No package manager identificato → flag "manual stack identification needed"

---

> Skill maintained by [Danilo Lapegna](https://danilolapegna.com). Public release of DL Solutions internal toolkit.
