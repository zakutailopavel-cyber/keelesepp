#!/usr/bin/env node
// Release gate (audit 2026-11-28, point 4): the app must not go out before the rules and functions it relies on.
// 2026-11-10 a hosting release went out ~5 minutes before the rules it needed; 2026-11-28 had six releases and four
// rules / functions deploys from several sessions. This check needs no cloud credentials: it compares the checkout
// with docs/DEPLOY_LEDGER.md, the file every deploy must be written into (AGENTS.md).
//
//   node tools/deploy-status/release-deploy-gate.mjs        # exit 0 = release may go, 1 = stopped, with the reason
//
// Stops the release when, compared with the commit the ledger names as deployed:
//   - firestore.rules or storage.rules differ;
//   - the newest change of the functions' source is not contained in any commit of the „Cloud Functions” table.
// What it cannot see: whether the deploy really happened (that is tools/deploy-status/deploy-status.mjs, with
// credentials), and WHICH functions a deploy covered — a row for one function also covers a change in another.
// Way out for a real emergency: run the Release workflow by hand with „skip_deploy_check”.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SHA = /`([0-9a-f]{7,40})`/;
// what `firebase deploy --only functions` uploads and runs; tests and fixtures never reach production
export const FUNCTIONS_PATHS = ['functions', ':(exclude)functions/*.test.js', ':(exclude)functions/*.integration.js', ':(exclude)functions/test-fixtures', ':(exclude)functions/**/*.md'];

// → { firestoreRules, storageRules, functions: [sha…] } from the ledger's two tables
export function ledgerCommits(markdown = '') {
  const lines = markdown.split('\n');
  const rowCommit = (start) => {
    const row = lines.find((line) => line.startsWith(start));
    return row ? (row.split('|')[3] || '').match(SHA)?.[1] || '' : '';
  };
  const from = lines.findIndex((line) => line.startsWith('## Cloud Functions'));
  const to = lines.findIndex((line, index) => index > from && line.startsWith('## '));
  const section = from < 0 ? [] : lines.slice(from + 1, to < 0 ? undefined : to);
  const functions = new Set();
  section.forEach((line) => {
    if (line.startsWith('|')) { const sha = (line.split('|')[3] || '').match(SHA)?.[1]; if (sha) functions.add(sha); }
    else if (/^Full deploy/.test(line)) { const sha = line.match(SHA)?.[1]; if (sha) functions.add(sha); }
  });
  return { firestoreRules: rowCommit('| Firestore rules ('), storageRules: rowCommit('| Storage rules ('), functions: [...functions] };
}

/**
 * The decision, with git behind three small functions so it can be tested without a repository:
 *   exists(sha) → boolean; sameFile(sha, path) → boolean (file equal at sha and HEAD);
 *   newest(paths) → sha of the newest commit touching them ('' = none); contains(descendant, ancestor) → boolean.
 * → { ok, problems: [text…] }
 */
export function gateDecision(ledger, git) {
  const problems = [];
  for (const [file, sha, target] of [['firestore.rules', ledger.firestoreRules, 'Firestore rules'], ['storage.rules', ledger.storageRules, 'Storage rules']]) {
    if (!sha) problems.push(`${target}: docs/DEPLOY_LEDGER.md names no deployed commit.`);
    else if (!git.exists(sha)) problems.push(`${target}: the ledger's commit ${sha} is not in this repository.`);
    else if (!git.sameFile(sha, file)) problems.push(`${target}: ${file} on main differs from the deployed commit ${sha}. Deploy the rules and write the deploy into docs/DEPLOY_LEDGER.md first.`);
  }
  const newest = git.newest(FUNCTIONS_PATHS);
  if (newest) {
    const known = ledger.functions.filter((sha) => git.exists(sha));
    if (!known.length) problems.push('Cloud Functions: docs/DEPLOY_LEDGER.md names no deployed commit that is in this repository.');
    else if (!known.some((sha) => git.contains(sha, newest))) {
      problems.push(`Cloud Functions: the functions' source changed in ${newest.slice(0, 7)}, after every deploy in the ledger. Deploy the changed functions and add their row to docs/DEPLOY_LEDGER.md first.`);
    }
  }
  return { ok: problems.length === 0, problems };
}

const run = (args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
const succeeds = (args) => { try { run(args); return true; } catch { return false; } };
export const realGit = {
  exists: (sha) => succeeds(['cat-file', '-e', `${sha}^{commit}`]),
  sameFile: (sha, path) => succeeds(['diff', '--quiet', sha, 'HEAD', '--', path]),
  newest: (paths) => run(['log', '-1', '--format=%H', '--', ...paths]),
  contains: (descendant, ancestor) => succeeds(['merge-base', '--is-ancestor', ancestor, descendant]),
};

function main() {
  const ledger = ledgerCommits(readFileSync(join(ROOT, 'docs/DEPLOY_LEDGER.md'), 'utf8'));
  // a shallow CI clone may not hold an old ledger commit: fetch the whole history once and look again
  const all = [ledger.firestoreRules, ledger.storageRules, ...ledger.functions].filter(Boolean);
  if (all.some((sha) => !realGit.exists(sha)) && succeeds(['rev-parse', '--is-shallow-repository']) && run(['rev-parse', '--is-shallow-repository']) === 'true') {
    succeeds(['fetch', '--quiet', '--unshallow', 'origin']);
  }
  const result = gateDecision(ledger, realGit);
  if (result.ok) { console.log(`Rules and functions on main match the deploy ledger (rules ${ledger.firestoreRules}, storage ${ledger.storageRules}).`); return 0; }
  result.problems.forEach((problem) => console.log(`::error title=Release stopped::${problem}`));
  return 1;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) process.exit(main());
