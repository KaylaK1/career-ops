import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { ROOT } from './helpers.mjs';

test('dashboard build rejects wrong/old go programs and accepts the declared compiler', t => {
  const root = mkdtempSync(join(tmpdir(), 'dashboard-go-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const marker = join(root, 'build.json'), hook = join(root, 'go-hook.mjs');
  writeFileSync(hook, `
import cp from 'node:child_process';
import { syncBuiltinESMExports } from 'node:module';
import { writeFileSync } from 'node:fs';
cp.spawnSync = (command, args) => {
  if (command !== 'go') throw new Error('Unexpected child command');
  if (args[0] === 'version') return { status: 0, stdout: process.env.CAREER_OPS_TEST_GO_VERSION };
  writeFileSync(process.env.CAREER_OPS_TEST_GO_MARKER, JSON.stringify(args));
  return { status: 0 };
};
syncBuiltinESMExports();
`);
  for (const [version, accepted] of [
    ['Go: Unknown option: version', false], ['go version go1.25.0 linux/amd64', false],
    ['go version go1.26.0 linux/amd64', true], ['go version go2.0.0 linux/amd64', true],
  ]) {
    rmSync(marker, { force: true });
    const r = spawnSync(process.execPath, ['--import', hook, join(ROOT, 'build-dashboard.mjs')], {
      encoding: 'utf8', timeout: 10_000,
      env: { ...process.env, CAREER_OPS_TEST_GO_VERSION: version, CAREER_OPS_TEST_GO_MARKER: marker },
    });
    assert.equal(r.status, accepted ? 0 : 1, r.stdout + r.stderr);
    assert.equal(existsSync(marker), accepted);
    if (accepted) assert.equal(JSON.parse(readFileSync(marker, 'utf8'))[0], 'build');
    else assert.match(r.stderr, /Go 1\.26\.0\+ compiler required/);
  }
});
