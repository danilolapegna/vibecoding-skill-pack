import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const scenarios = ['healthy', 'debug', 'broken', 'omitted-route', 'stale'];
const binaries = {
  gates: path.join(here, 'node_modules/agent-code-gates/bin/agent-code-gates.js'),
  smoke: path.join(here, 'node_modules/deep-smoke/bin/deep-smoke.js'),
};

// Argument arrays and a fixed command set: no shell interpolation or caller-supplied executable.
async function command(executable, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, {
      cwd, env: { ...process.env, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => child.kill('SIGKILL'), 90_000);
    child.stdout.on('data', (data) => { stdout += data; });
    child.stderr.on('data', (data) => { stderr += data; });
    child.on('error', (error) => { clearTimeout(timer); reject(error); });
    child.on('close', (code, signal) => {
      clearTimeout(timer);
      resolve({ command: [executable, ...args], code, signal, stdout, stderr });
    });
  });
}

async function git(args, cwd) {
  const result = await command('git', args, cwd);
  if (result.code !== 0) throw new Error(`Fixture git failed: ${result.stderr}`);
  return result;
}

function page(title, body) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${title}</title><link rel="icon" href="data:,"></head><body><main><h1>${title}</h1>${body}</main></body></html>`;
}

export async function runScenario(scenario) {
  if (!scenarios.includes(scenario)) throw new Error(`Choose one of: ${scenarios.join(', ')}`);
  // Only new, self-owned temporary projects are written; the caller's repository is never staged.
  const fixture = await mkdtemp(path.join(tmpdir(), 'vibecoding-verification-'));
  await mkdir(path.join(fixture, 'src'));
  await mkdir(path.join(here, 'evidence'), { recursive: true });
  const evidence = await mkdtemp(path.join(here, 'evidence', `${scenario}-`));
  const broken = ['broken', 'omitted-route'].includes(scenario);
  const files = {
    '/': page('Overview', '<p>A local delivery example.</p><a href="/help">Help</a>'),
    '/help': page('Help', '<p>Three routes are declared, including an unlinked orders page.</p>'),
    '/orders': page('Orders', broken
      ? '<div data-error-boundary>Orders could not be loaded.</div>'
      : '<p>Order 1042 is ready for dispatch.</p>'),
  };
  for (const [route, html] of Object.entries(files)) {
    await writeFile(path.join(fixture, 'src', route === '/' ? 'index.html' : `${route.slice(1)}.html`), html);
  }
  await writeFile(path.join(fixture, 'src/app.js'), 'export const ready = true;\n');
  await git(['init', '--quiet'], fixture);
  await git(['config', 'user.name', 'Verification example'], fixture);
  await git(['config', 'user.email', 'example@example.invalid'], fixture);
  await git(['config', 'core.hooksPath', path.join(fixture, 'no-hooks')], fixture);
  await git(['add', 'src'], fixture);
  await git(['-c', 'commit.gpgsign=false', 'commit', '--quiet', '-m', 'Initial fixture'], fixture);
  // SAFE-LOG: deliberate fault injection into a disposable fixture, asserted to fail by the test.
  const app = scenario === 'debug' ? 'console.log("temporary debug");\nexport const ready = true;\n' : 'export const ready = false;\n';
  await writeFile(path.join(fixture, 'src/app.js'), app);
  await git(['add', 'src/app.js'], fixture);
  await git(['-c', 'commit.gpgsign=false', 'commit', '--quiet', '-m', 'Candidate change'], fixture);

  const server = createServer(async (req, res) => {
    const route = new URL(req.url, 'http://localhost').pathname;
    const file = route === '/' ? 'index.html' : `${route.slice(1)}.html`;
    if (!Object.hasOwn(files, route)) {
      res.writeHead(404, { 'content-type': 'text/html' });
      res.end(page('Not found', '<p>This route does not exist.</p>'));
      return;
    }
    try {
      const html = await readFile(path.join(fixture, 'src', file));
      res.writeHead(200, { 'content-type': 'text/html' });
      res.end(html);
    } catch {
      res.writeHead(500);
      res.end('Fixture unavailable');
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const config = {
    baseUrl, routes: scenario === 'omitted-route' ? ['/', '/help'] : ['/', '/help', '/orders'],
    settleMs: 0, retryFailedRoutes: false,
    evidence: { dir: evidence, write: true },
  };
  const steps = [];
  async function record(name, tool, args) {
    const result = await command(process.execPath, [binaries[tool], ...args], fixture);
    const step = { name, ...result };
    steps.push(step);
    await writeFile(path.join(evidence, `${name}.json`), JSON.stringify(step, null, 2) + '\n');
    return step;
  }
  try {
    await writeFile(path.join(fixture, 'deep-smoke.config.json'), JSON.stringify(config, null, 2));
    await record('gates', 'gates', ['--commit', 'HEAD', '--gate', 'DEBUG_RESIDUE', '--json']);
    // The two checks also run independently here to demonstrate their distinct scope.
    await record('crawl', 'smoke', ['--level=3', '--json']);
    if (scenario === 'healthy' || scenario === 'stale') {
      await record('verify-fresh', 'smoke', ['verify', '--level=3', '--json']);
    }
    if (scenario === 'stale') {
      await writeFile(path.join(fixture, 'src/app.js'), 'export const ready = "changed after crawl";\n');
      await git(['add', 'src/app.js'], fixture);
      await git(['-c', 'commit.gpgsign=false', 'commit', '--quiet', '-m', 'Change after crawl'], fixture);
      await record('verify-stale', 'smoke', ['verify', '--level=3', '--json']);
    }
    const receipt = { scenario, createdAt: new Date().toISOString(), fixture, evidence, baseUrl, config, steps };
    await writeFile(path.join(evidence, 'receipt.json'), JSON.stringify(receipt, null, 2) + '\n');
    return receipt;
  } finally {
    await new Promise((resolve) => { server.close(resolve); server.closeAllConnections(); });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await mkdir(path.join(here, 'evidence'), { recursive: true });
    const receipt = await runScenario(process.argv[2] ?? 'healthy');
    for (const step of receipt.steps) process.stdout.write(`${step.name}: exit ${step.code}\n`);
    process.stdout.write(`Evidence: ${receipt.evidence}\nFixture: ${receipt.fixture}\n`);
    // Never convert a tool failure into success, including an intentional demonstration.
    process.exitCode = receipt.steps.some((step) => step.code !== 0) ? 1 : 0;
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 2;
  }
}
