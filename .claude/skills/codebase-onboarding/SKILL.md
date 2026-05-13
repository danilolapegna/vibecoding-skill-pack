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
last_updated: 2026-05-13
schema_version: 1
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

## Processo (5 step)

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
- [ ] Score onboarding 1-10 assegnato + razionale

## Fallback

- Repo vuoto / single-file → flag "greenfield, skip codebase-onboarding"
- Repo enorme (>10k files) → focus su top-level + 1 feature representative
- No package manager identificato → flag "manual stack identification needed"

---

> Skill maintained by [Danilo Lapegna](https://danilolapegna.com). Public release of DL Solutions internal toolkit.
