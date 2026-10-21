// tests/skill-router-modes.test.mjs — every mode AGENTS.md documents has a
// route in the skill router (#4811).
//
// `/career-ops <mode>` goes through `.agents/skills/career-ops/SKILL.md`
// (every other CLI's SKILL.md is a symlink to it). Its fallback reads "If
// `$mode` is not a sub-command AND doesn't look like a JD, show discovery", so
// a mode with no row in the routing table is not just undocumented on that
// path: `/career-ops triage` printed the command menu instead of running
// triage. Plain-language requests still worked, since those go through
// AGENTS.md, which is why the gap went unnoticed for triage, calibrate,
// intake and ats.

import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { fail, pass, ROOT } from './helpers.mjs';

console.log('\nSkill router covers every documented mode (#4811)');

const skill = readFileSync(join(ROOT, '.agents', 'skills', 'career-ops', 'SKILL.md'), 'utf-8').replace(/\r\n/g, '\n');
const agents = readFileSync(join(ROOT, 'AGENTS.md'), 'utf-8').replace(/\r\n/g, '\n');

// The "Skill Modes" table in AGENTS.md: the Mode column starts with the
// backticked mode name (`pdf --hm-audit` is the pdf mode with a flag).
const skillModesTable = agents.match(/### Skill Modes\n\n([\s\S]*?)\n\n/)?.[1] ?? '';
const documentedModes = [...new Set(
  [...skillModesTable.matchAll(/\|\s*`([a-z][a-z/-]*)[^`]*`[^|\n]*\|\s*$/gm)].map((m) => m[1]),
)];

if (documentedModes.length < 20) {
  fail(`could not read the AGENTS.md Skill Modes table (found ${documentedModes.length} modes)`);
} else {
  const unrouted = documentedModes.filter((m) => !new RegExp(`^\\| \`[^\`]+\` \\| \`${m}\` \\|$`, 'm').test(skill));
  if (unrouted.length === 0) {
    pass(`all ${documentedModes.length} modes in AGENTS.md Skill Modes have a row in the router's routing table`);
  } else {
    fail(`modes documented in AGENTS.md but missing from the router's routing table (fall through to discovery): ${unrouted.join(', ')}`);
  }
}

const argumentHint = skill.match(/^argument-hint: "\[(.*)\]"$/m)?.[1].split(' | ') ?? [];
const appliesTo = (heading) => {
  const section = skill.split(`### ${heading}`)[1]?.split('\n### ')[0] ?? '';
  return section.match(/^Applies to: (.*)$/m)?.[1] ?? '';
};
const shared = appliesTo('Modes that require `_shared.md` + their mode file');
const standalone = appliesTo('Standalone modes with profile and custom context');
const ownContext = appliesTo('Modes that load only their mode file');
const delegated = skill.split('### Modes delegated to subagent')[1] ?? '';

// Audit ALL routes, including aliases. Checking only a handful of recently
// added modes let reply-watch/interview-redflag disappear from the menu and
// expand/update/interview-redflag lose their context-loading instructions.
const routes = [...skill.matchAll(/^\| `([^`]+)` \| `([^`]+)` \|$/gm)];
const menu = [...skill.matchAll(/^  \/career-ops ([\w/-]+) +→/gm)].map(m => m[1]);
const policies = [...`${shared} ${standalone} ${ownContext}`.matchAll(/`([^`]+)`/g)].map(m => m[1]);
for (const [, input, target] of routes) {
  const issues = [];
  if (!existsSync(join(ROOT, 'modes', `${target}.md`))) issues.push('mode file');
  if (!argumentHint.includes(input)) issues.push('argument-hint');
  if (!menu.includes(input)) issues.push('discovery menu');
  if (policies.filter(m => m === target).length !== 1) issues.push('exactly one context policy');
  if (issues.length) fail(`${input}: missing/inconsistent ${issues.join(', ')}`);
  else pass(`${input}: file, hint, menu and context policy agree`);
}
const targets = new Set(routes.map(m => m[2]));
for (const file of readdirSync(join(ROOT, 'modes'))) {
  if (!file.endsWith('.md') || file.startsWith('_') || file === 'README.md') continue;
  if (!targets.has(file.slice(0, -3))) fail(`public mode ${file} has no explicit route`);
}

for (const mode of ['triage', 'calibrate', 'intake', 'ats', 'retro']) {
  const missing = [];
  if (!argumentHint.includes(mode)) missing.push('argument-hint');
  if (!skill.includes(`| \`${mode}\` | \`${mode}\` |`)) missing.push('routing table');
  if (!new RegExp(`^  /career-ops ${mode} +→`, 'm').test(skill)) missing.push('discovery menu');
  // triage reads only modes/_brief.md and tells the agent NOT to read
  // _profile.md or _shared.md (modes/triage.md "Context"), so it must not sit
  // in either list that would load them for it.
  const loadList = mode === 'triage' ? ownContext : standalone;
  if (!loadList.includes(`\`${mode}\``)) missing.push('context-loading list');
  if (mode === 'triage' && (standalone.includes('`triage`') || shared.includes('`triage`'))) {
    missing.push('kept out of the _profile/_shared loading lists');
  }
  if (delegated.includes(`\`${mode}\``)) missing.push('kept out of subagent delegation');

  if (missing.length === 0) {
    pass(`router registers ${mode} (argument-hint, routing table, discovery menu, context loading)`);
  } else {
    fail(`router registration for ${mode} is incomplete: ${missing.join(', ')}`);
  }
}
