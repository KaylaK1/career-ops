import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readdirSync, rmSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT } from './helpers.mjs';

test('help exits before data loading, rendering, model calls, updates or browser launches', t => {
  const root = mkdtempSync(join(tmpdir(), 'career-help-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const commands = [
    ['generate-pdf.mjs'], ['keyword-match.mjs'], ['match-star.mjs'],
    ['prepare-application.mjs'], ['generate-cover-letter.mjs', '--payload'],
    ['build-dashboard.mjs'], ['manifesto.mjs'],
    ...['scan', 'evaluate', 'pipeline', 'apply', 'models'].map(cmd => ['openrouter-runner.mjs', cmd]),
    ...['check', 'apply', 'rollback'].map(cmd => ['update-system.mjs', cmd]),
  ];
  for (const command of commands) {
    const r = spawnSync(process.execPath, [join(ROOT, command[0]), ...command.slice(1), '--help'], {
      cwd: root, encoding: 'utf8', timeout: 10_000,
      env: { ...process.env, CAREER_OPS_ROOT: root, CAREER_OPS_DATA_DIR: root,
        OPENROUTER_API_KEY: '', CAREER_OPS_MODEL: '' },
    });
    assert.equal(r.status, 0, `${command.join(' ')}: ${r.stderr}`);
    assert.match(r.stdout, /usage|commands/i, command.join(' '));
    assert.deepEqual(readdirSync(root), [], `${command.join(' ')} wrote files during help`);
  }
});

test('all npm commands reference existing local scripts or declared toolchains', () => {
  const scripts = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).scripts;
  assert.ok(Object.keys(scripts).length >= 60);
  for (const [name, command] of Object.entries(scripts)) {
    const target = command.match(/^node ([\w./-]+\.mjs)(?:\s|$)/)?.[1];
    if (target) assert.ok(existsSync(join(ROOT, target)), `${name}: missing ${target}`);
    else assert.match(command, /^(playwright |cd dashboard && go |node -e )/, `${name}: unreviewed toolchain`);
  }
});

test('direct node:test autorunner supports top-level await and preserves failing exit status', t => {
  const root = mkdtempSync(join(tmpdir(), 'career-test-runner-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const file = join(root, 'control.test.mjs');
  for (const shouldFail of [false, true]) {
    writeFileSync(file, `import { test } from 'node:test';\nawait test('control', () => { ${shouldFail ? "throw new Error('intentional control failure');" : ''} });\n`);
    const r = spawnSync(process.execPath, [file], { encoding: 'utf8', timeout: 10_000 });
    assert.equal(r.error, undefined);
    assert.equal(r.status, shouldFail ? 1 : 0, r.stdout + r.stderr);
  }
});
