#!/usr/bin/env node
// build-dashboard.mjs — cross-platform build for the Go TUI dashboard.
//
// `go build -o career-dashboard .` writes an extension-less binary on Windows
// (Go only auto-appends .exe when -o is omitted), which breaks bare-name/PATH
// lookup there. This wrapper picks the platform-correct output name instead:
// dashboard/career-dashboard on Unix, dashboard/career-dashboard.exe on Windows.

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const requiredGo = readFileSync(join(root, 'dashboard', 'go.mod'), 'utf8').match(/^go\s+(\d+\.\d+(?:\.\d+)?)/m)?.[1];
if (!requiredGo) {
  console.error('Cannot determine the dashboard Go requirement from dashboard/go.mod.');
  process.exit(1);
}
if (process.argv.slice(2).some(arg => arg === '--help' || arg === '-h')) {
  console.log('Usage: node build-dashboard.mjs');
  console.log(`Builds dashboard/career-dashboard (career-dashboard.exe on Windows). Requires Go ${requiredGo}+.`);
  process.exit(0);
}
const out = process.platform === 'win32' ? 'career-dashboard.exe' : 'career-dashboard';

// A program named `go` is not necessarily the Go compiler (some hosts ship a
// Go game under that name). Diagnose the actual prerequisite before building.
const version = spawnSync('go', ['version'], { cwd: join(root, 'dashboard'), encoding: 'utf8' });
const installedGo = version.stdout?.match(/^go version go(\d+\.\d+(?:\.\d+)?)/)?.[1];
const olderThan = (actual, required) => {
  const a = actual.split('.').map(Number), b = required.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) < (b[i] || 0);
  }
  return false;
};
if (version.error || version.status !== 0 || !installedGo || olderThan(installedGo, requiredGo)) {
  console.error(`Go ${requiredGo}+ compiler required. Install it from https://go.dev/dl/ and put its bin directory before other programs named go on PATH.`);
  process.exit(1);
}

const result = spawnSync('go', ['build', '-o', out, '.'], {
  cwd: join(root, 'dashboard'),
  stdio: 'inherit',
});

if (result.error) {
  if (result.error.code === 'ENOENT') {
    console.error(`Go toolchain not found. Install Go ${requiredGo}+ from https://go.dev/dl/ and retry.`);
  } else {
    console.error(`Build failed to start: ${result.error.message}`);
  }
  process.exit(1);
}

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log(`Built dashboard/${out} — run it with: npm run serve:dashboard (or dashboard/${out} --path .)`);
