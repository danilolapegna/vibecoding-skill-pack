import test from 'node:test';
import assert from 'node:assert/strict';
import { runScenario } from './run.mjs';

const expected = {
  healthy: [0, 0, 0],
  debug: [1, 0],
  broken: [0, 1],
  'omitted-route': [0, 0],
  stale: [0, 0, 0, 1],
};

for (const [scenario, codes] of Object.entries(expected)) {
  test(`${scenario}: actual CLI results match the declared boundary`, { timeout: 120_000 }, async () => {
    const result = await runScenario(scenario);
    assert.deepEqual(result.steps.map((step) => step.code), codes, JSON.stringify(result.steps, null, 2));
    const gates = JSON.parse(result.steps[0].stdout);
    assert.ok(gates.gates.some((gate) => gate.id === 'DEBUG_RESIDUE' && gate.status === (scenario === 'debug' ? 'fail' : 'pass')));
    const crawl = JSON.parse(result.steps[1].stdout);
    assert.equal(crawl.level, 3);
    assert.equal(crawl.coverage.truncated, false);
    assert.equal(crawl.scoped, false);
    const orders = crawl.results.find((route) => route.requestedPath === '/orders');
    if (scenario === 'omitted-route') {
      assert.equal(orders, undefined, 'The undeclared, unlinked route must actually be absent');
      assert.equal(crawl.result, 'pass', 'A narrow PASS is the observed blind spot, not full coverage');
    } else {
      assert.ok(orders, 'Full inventory must visit the unlinked route');
      assert.equal(orders.ok, scenario !== 'broken');
      if (scenario === 'broken') assert.match(JSON.stringify(orders.failures), /boundary/i);
    }
    if (scenario === 'stale') {
      assert.match(result.steps.at(-1).stdout + result.steps.at(-1).stderr, /behaviour|behavior|stale/i);
    }
    process.stdout.write(`${scenario} raw evidence: ${result.evidence}\n`);
  });
}

test('unknown scenarios are rejected before starting a fixture', async () => {
  await assert.rejects(runScenario('unknown'), /Choose one of/);
});
