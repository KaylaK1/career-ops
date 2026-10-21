import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { runTracker } from '../tracker.mjs';
import { ROOT } from './helpers.mjs';

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'tracker-display-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, 'data'));
  const mdPath = join(root, 'data/applications.md');
  const header = '| # | Date | Company | Via | Role | Location | Score | Status | PDF | Report | Notes | URL | Custom |';
  writeFileSync(mdPath, [header, '|---|---|---|---|---|---|---|---|---|---|---|---|---|',
    '| 42 | 2026-10-20 | Acme | Agency | Engineer | NYC | 4.1/5 | Evaluated | ✅ | [042](../reports/042.md) | Verify base | [Job](https://example.com/jobs/42) | Keep me |',
    '| 43 | 2026-10-19 | Globex | — | Analyst | Remote | 3.1/5 | SKIP | ❌ | — | Not targeted | https://example.com/jobs/43 | Other |',
  ].join('\n') + '\n');
  return { root, mdPath, header };
}

async function query(mdPath, args) {
  let stdout = '', stderr = '';
  const code = await runTracker('query', args, { mdPath,
    stdout: { write: s => { stdout += s; } }, stderr: { write: s => { stderr += s; } } });
  return { code, stdout, stderr };
}

test('filtered Markdown queries retain every source column and link', async t => {
  const f = fixture(t);
  const before = readFileSync(f.mdPath, 'utf8');
  const r = await query(f.mdPath, ['--id', '42']);
  assert.equal(r.code, 0, r.stderr);
  assert.equal(r.stdout.split('\n')[0], f.header);
  assert.match(r.stdout, /Agency \| Engineer \| NYC/);
  assert.match(r.stdout, /\[Job\]\(https:\/\/example.com\/jobs\/42\) \| Keep me/);
  assert.doesNotMatch(r.stdout, /Globex/);
  assert.equal(readFileSync(f.mdPath, 'utf8'), before);
});

test('full JSON exposes source columns without breaking legacy JSON consumers', async t => {
  const f = fixture(t);
  const legacy = JSON.parse((await query(f.mdPath, ['--id', '42', '--json'])).stdout)[0];
  assert.deepEqual(Object.keys(legacy), ['id', 'date', 'company', 'role', 'score', 'status', 'pdf', 'report', 'notes']);
  const row = JSON.parse((await query(f.mdPath, ['--id', '42', '--json', '--all-columns'])).stdout)[0];
  assert.equal(Object.keys(row.columns).length, 13);
  assert.equal(row.columns.Via, 'Agency');
  assert.equal(row.columns.URL, '[Job](https://example.com/jobs/42)');
  assert.equal(row.columns.Custom, 'Keep me');
});

test('invalid limits and impossible dates fail instead of showing an unintended listing', async t => {
  const f = fixture(t);
  for (const args of [['--limit', '-1'], ['--limit', '1oops'], ['--limit', '1.5'], ['--since', '2026-02-30']]) {
    const r = await query(f.mdPath, args);
    assert.equal(r.code, 1, args.join(' '));
    assert.equal(r.stdout, '');
  }
  assert.equal((await query(f.mdPath, ['--limit', '0'])).code, 0);
});

test('bare tracker CLI displays the tracker rather than only usage', t => {
  const f = fixture(t);
  const r = spawnSync(process.execPath, [join(ROOT, 'tracker.mjs')], {
    cwd: f.root, encoding: 'utf8', timeout: 20_000,
    env: { ...process.env, CAREER_OPS_ROOT: f.root, CAREER_OPS_DATA_DIR: f.root },
  });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stdout.split('\n')[0], f.header);
  assert.match(r.stdout, /https:\/\/example.com\/jobs\/42/);
});
