import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const pack = path.resolve(here, '../..');

test('default copy retains the reference and unrelated project files', async () => {
  const project = await mkdtemp(path.join(tmpdir(), 'vibecoding-install-'));
  await mkdir(path.join(project, '.claude/skills/local-skill'), { recursive: true });
  await mkdir(path.join(project, '.git/hooks'), { recursive: true });
  await writeFile(path.join(project, '.claude/skills/local-skill/SKILL.md'), 'Local skill, keep me.\n');
  await writeFile(path.join(project, '.git/hooks/pre-commit'), '#!/bin/sh\nexit 0\n');
  const copy = spawnSync('cp', ['-R', path.join(pack, '.claude') + '/.', path.join(project, '.claude') + '/'], { encoding: 'utf8' });
  assert.equal(copy.status, 0, copy.stderr);
  const audit = path.join(project, '.claude/skills/delivery-readiness-audit');
  assert.match(await readFile(path.join(audit, 'SKILL.md'), 'utf8'), /references\/mechanical-verification\.md/);
  assert.match(await readFile(path.join(audit, 'references/mechanical-verification.md'), 'utf8'), /Check the change/);
  assert.equal(await readFile(path.join(project, '.claude/skills/local-skill/SKILL.md'), 'utf8'), 'Local skill, keep me.\n');
  assert.equal(await readFile(path.join(project, '.git/hooks/pre-commit'), 'utf8'), '#!/bin/sh\nexit 0\n');
  for (const skill of ['vibecoding-engineer', 'engineering-brief', 'codebase-onboarding', 'delivery-readiness-audit']) {
    assert.match(await readFile(path.join(project, '.claude/skills', skill, 'SKILL.md'), 'utf8'), new RegExp(`name: ${skill}`));
  }
});

test('invalid CLI usage is an error, not an empty passing report', () => {
  const result = spawnSync(process.execPath, [path.join(here, 'node_modules/deep-smoke/bin/deep-smoke.js'), '--unknown-flag'], { encoding: 'utf8' });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /Unknown option/);
});

test('all local links in the new entry route resolve', async () => {
  const files = ['README.md', 'INSTALL.md', '.claude/skills/delivery-readiness-audit/SKILL.md', '.claude/skills/delivery-readiness-audit/references/mechanical-verification.md', 'examples/03-mechanical-verification/README.md'];
  for (const file of files) {
    const full = path.join(pack, file);
    // Fenced shell code contains regex syntax that is not a Markdown link.
    const content = (await readFile(full, 'utf8')).replace(/^```[\s\S]*?^```/gm, '');
    for (const match of content.matchAll(/\]\(([^)]+)\)/g)) {
      if (/^(https?:|#)/.test(match[1])) continue;
      const target = path.resolve(path.dirname(full), match[1].split('#')[0]);
      await assert.doesNotReject(readFile(target), `${file}: ${match[1]}`);
    }
  }
});
