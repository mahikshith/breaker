#!/usr/bin/env node
// Checks a Copilot design drop against copilot/04-return-format.md before Claude builds from it.
// Usage: node check-drop.mjs <drop.md> [more.md ...]   Prints the header, the JSON summary and any problems.
// Exit code 1 when any drop has a problem. No dependencies.
import { readFileSync } from 'node:fs';

const SECTIONS = ['Summary', 'Decisions for the owner', 'Spec', 'Data', 'Art requests', 'Rules check', 'Open questions for Claude'];
const KEYS = {
  powerups: ['capsules', 'hero_powers', 'charge', 'ram', 'drop_rules', 'synergies'],
  difficulty: ['shared', 'chapters', 'curve', 'continue', 'test_plan'],
  level: ['name', 'hero', 'floors', 'hazards', 'difficulty', 'reuse', 'new_art'],
  character: ['name', 'role', 'materials', 'expressions', 'poses', 'collision'],
  'ui-screen': ['screen', 'phones', 'elements'],
  'asset-sheet': ['family', 'cells', 'grid', 'prompt'],
  critique: ['issues', 'keep'],
  research: ['question', 'findings', 'recommendations'],
};
// Keys a partial drop may leave out (a new-powers drop has no ram or charge section, and so on).
const OPTIONAL = { powerups: ['hero_powers', 'charge', 'ram', 'drop_rules', 'synergies', 'capsules'] };

function check(path) {
  const text = readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
  const problems = [];
  const head = /^\s*---\n([\s\S]*?)\n---/.exec(text);
  const meta = {};
  if (!head) problems.push('no --- header block at the top');
  else for (const line of head[1].split('\n')) {
    const m = /^(\w+):\s*(.*?)\s*(#.*)?$/.exec(line);
    if (m) meta[m[1]] = m[2];
  }
  for (const k of ['breach_drop', 'kind', 'slug', 'version', 'status']) if (!meta[k]) problems.push(`header has no ${k}`);
  if (meta.kind && !KEYS[meta.kind]) problems.push(`unknown kind "${meta.kind}"`);
  if (meta.status && !['proposal', 'locked'].includes(meta.status)) problems.push(`status "${meta.status}" is not proposal or locked`);
  if (meta.kind !== 'research') for (const s of SECTIONS) if (!new RegExp(`^##\\s+${s}\\s*$`, 'mi').test(text)) problems.push(`missing section "## ${s}"`);

  const blocks = [...text.matchAll(/```json\s*\n([\s\S]*?)```/g)].map(m => m[1]);
  let data = null;
  if (blocks.length !== 1) problems.push(`expected exactly one json block, found ${blocks.length}`);
  if (blocks.length) {
    try { data = JSON.parse(blocks[blocks.length - 1]); } catch (e) { problems.push(`json does not parse: ${e.message}`); }
  }
  if (data) {
    if (data.kind && meta.kind && data.kind !== meta.kind) problems.push(`json kind "${data.kind}" differs from header kind "${meta.kind}"`);
    const kind = meta.kind || data.kind, optional = OPTIONAL[kind] || [];
    for (const k of KEYS[kind] || []) if (!(k in data) && !optional.includes(k)) problems.push(`json has no "${k}"`);
    if (kind === 'difficulty') for (const c of data.chapters || []) for (const [k, v] of Object.entries(c.values || {}))
      if (!Array.isArray(v) || v.length !== 3) problems.push(`chapter ${c.chapter} value "${k}" is not [easy, medium, hard]`);
    if (kind === 'powerups') if (!(data.capsules || data.hero_powers)) problems.push('json has neither capsules nor hero_powers');
  }
  const violated = (text.match(/\bVIOLATED\b/g) || []).length;
  if (violated) problems.push(`rules check still says VIOLATED ${violated} time(s)`);

  const sizes = data ? Object.entries(data).map(([k, v]) => `${k}${Array.isArray(v) ? `[${v.length}]` : ''}`).join(', ') : '-';
  console.log(`${path}\n  ${meta.kind || '?'} / ${meta.slug || '?'} v${meta.version || '?'} (${meta.status || '?'})\n  data: ${sizes}`);
  console.log(problems.length ? problems.map(p => '  PROBLEM ' + p).join('\n') : '  OK');
  return problems.length === 0;
}

const files = process.argv.slice(2);
if (!files.length) { console.error('usage: node check-drop.mjs <drop.md> [...]'); process.exit(2); }
process.exit(files.map(check).every(Boolean) ? 0 : 1);
