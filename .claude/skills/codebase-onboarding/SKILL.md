---
name: codebase-onboarding
description: >
  Onboards an existing repo before you extend it. Maps directory structure,
  coding conventions, build/test/deploy pipeline, dependency graph, visible
  tech debt, anti-patterns already in the code. Use this skill when the user
  asks to "extend existing repo", "onboard a codebase", "audit before
  modifying", "what's in this repo", "map the project", "read the code". Conditional dependency of `vibecoding-engineer`: trigger when
  target is an existing repo, skip for greenfield.
last_updated: 2026-08-06
schema_version: 2
license: MIT
maintainer: github.com/danilolapegna
---

# Codebase Onboarding

> Conditional upstream skill of `vibecoding-engineer`. When the target codebase already exists (greenfield means skip), it produces a map that lets the downstream prompts extend the code coherently, without breaking the conventions already in place.

## Scope

Produces a `codebase-state.md` document in `context/`, which `vibecoding-engineer` reads as context. Sections:

1. **Tree structure**: top-level directories and what each one is for
2. **Stack identified**: language, framework, database, infrastructure (from package files and config)
3. **Build/test/deploy pipeline**: canonical commands (npm scripts, Makefile, GitHub Actions)
4. **Coding conventions**: naming, file organization, import order, lint config
5. **Dependency graph**: top-level dependencies with versions, plus alerts on vulnerable dependencies
6. **Visible tech debt**: TODO/FIXME/HACK/XXX scan and a severity score
7. **Anti-patterns present**: violations of the repo's own conventions, code smells, security hotspots

## Trigger phrases

"Codebase onboarding", "audit before extending", "what's in this repo", "map the project", "onboard repo", "read the code", "coding conventions".

## Process (6 steps)

### 1. Tree structure scan

```bash
tree -L 3 -d --noreport
find . -name "package.json" -o -name "Cargo.toml" -o -name "go.mod" -o -name "pyproject.toml" -o -name "Gemfile" | head -10
```

### 2. Stack identification

Read the package files to identify language, framework, database driver and infrastructure dependencies.

### 3. Pipeline reconnaissance

```bash
cat package.json | jq .scripts 2>/dev/null
ls -la .github/workflows/ 2>/dev/null
find . -name "Dockerfile" -o -name "docker-compose.yml" | head -5
```

### 4. Coding convention extraction

Read 3 to 5 representative files, one per layer (one component, one controller, one model, one test), and extract the patterns:

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

### 6. State verification (new in v0.2)

Two checks that belong BEFORE you write anything into the repo, not after.

**State is verified at the source.** File names, directory names, version numbers in filenames, modification dates and open tasks are not a state machine. A file called `v3-final` does not prove that v3 is the version in use; a migration sitting in the repo does not prove it was ever applied; a README describing an architecture does not prove that architecture is the current one. For every fact you write into `codebase-state.md`, query the authoritative source for that domain (the database for the schema, the gateway for deployed functions, the command output for the pipeline) and date it. When two sources contradict each other, the more recent one wins and the contradiction gets written down, not resolved by intuition.

**Where the version control metadata lives.** A `.git` directory inside a cloud-synced folder (Dropbox, iCloud, OneDrive, Drive) is unstable by construction: the syncer rewrites objects and refs while git is working on them.

```bash
GITDIR="$(git rev-parse --git-dir 2>/dev/null)" && GITDIR_REAL="$(cd "$GITDIR" && pwd -P)"
echo "$GITDIR_REAL" | grep -qiE "CloudStorage|Dropbox|iCloud|OneDrive|Google ?Drive|Box Sync" \
  && echo "WARNING: version control metadata inside a cloud-sync root. Exclude it from sync before writing." \
  && git fsck --connectivity-only --no-progress >/dev/null 2>&1 || echo "integrity probe failed: resolve before editing"
```

If the probe fails, or you find an interrupted rebase or merge, the first deliverable is putting the repository back in order, not extending it (FM-26).

## Output

`context/codebase-state.md` with the 7 sections above filled in. Plus a final onboarding score (1-10) based on how clean the codebase is.

## Skill chains

| Skill | M/C/R | Trigger |
|---|---|---|
| `engineering-brief` | M downstream | the brief takes codebase-state.md as input |
| `vibecoding-engineer` | M downstream, eventual | the downstream prompts know the existing conventions |

## Validation Checkpoint

- [ ] Tree structure documented
- [ ] Stack identified, with versions
- [ ] Canonical pipeline (build/test/deploy) verified as runnable
- [ ] Conventions extracted from 3 to 5 representative files
- [ ] TODO/FIXME/HACK/XXX scan executed
- [ ] Anti-patterns catalogued (security, performance, naming inconsistencies)
- [ ] Every state fact verified against its authoritative source and dated, never inferred from file names or file dates
- [ ] Location of the git metadata checked, and integrity probe run, before writing
- [ ] Onboarding score 1-10 assigned, with rationale

## Fallback

- Empty repo or single file → flag "greenfield, skip codebase-onboarding"
- Huge repo (>10k files) → focus on the top level plus one representative feature
- No package manager identified → flag "manual stack identification needed"

---

> Skill maintained by [Danilo Lapegna](https://danilolapegna.com). Public release of DL Solutions internal toolkit.
