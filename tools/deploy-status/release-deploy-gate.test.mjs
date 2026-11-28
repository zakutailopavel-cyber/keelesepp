// node --test tools/deploy-status/ — pure parts, plus one run against this repository's own ledger and history
import test from 'node:test';
import assert from 'node:assert/strict';
import { FUNCTIONS_PATHS, gateDecision, ledgerCommits } from './release-deploy-gate.mjs';

const LEDGER = `# Deploy ledger

## Rules and hosting

| Target | Live since | Commit | How verified |
| --- | --- | --- | --- |
| Firestore rules (\`firestore.rules\`) | 2026-11-28 06:45 | \`8289b26\` (#1 \`someName\`) | equal |
| Storage rules (\`storage.rules\`) | 2026-11-28 06:08 | \`00e3eae\` (#2) | Deploy complete |
| Hosting — app | 2026-11-28 | \`a263291\` release | ok |

## Cloud Functions

Full deploy of all functions 2026-11-09 from main **(inferred)** \`a80a749\`; single functions after that:

| Function | Last deployed | Commit |
| --- | --- | --- |
| invoiceApi | 2026-11-28 09:32 | \`da31f2a\` (#3 \`sending\` mark) |
| financeApi | 2026-11-27 21:35 | \`5d9d7a3\` (#4) |
| gcalApi, liveTurnApi | 2026-11-09 15:39 | — (full deploy) |

## Log

- 2026-11-28 · something · \`fffffff\`
`;

test('the ledger gives the rules commits and every functions commit, not the log or the hosting row', () => {
  assert.deepEqual(ledgerCommits(LEDGER), { firestoreRules: '8289b26', storageRules: '00e3eae', functions: ['a80a749', 'da31f2a', '5d9d7a3'] });
  assert.deepEqual(ledgerCommits(''), { firestoreRules: '', storageRules: '', functions: [] });
});

const git = (over = {}) => ({ exists: () => true, sameFile: () => true, newest: () => 'aaaaaaa1', contains: (descendant) => descendant === 'da31f2a', ...over });
const ledger = ledgerCommits(LEDGER);

test('everything deployed: the release may go', () => {
  assert.deepEqual(gateDecision(ledger, git()), { ok: true, problems: [] });
  // no functions source at all is not a problem
  assert.equal(gateDecision(ledger, git({ newest: () => '', contains: () => false })).ok, true);
});

test('rules changed after the recorded deploy stop the release, each file by name', () => {
  const result = gateDecision(ledger, git({ sameFile: (sha, path) => path !== 'firestore.rules' }));
  assert.equal(result.ok, false);
  assert.equal(result.problems.length, 1);
  assert.match(result.problems[0], /Firestore rules: firestore\.rules on main differs from the deployed commit 8289b26/);
  assert.match(gateDecision(ledger, git({ sameFile: (sha, path) => path !== 'storage.rules' })).problems[0], /Storage rules/);
});

test('a functions change newer than every ledger row stops the release', () => {
  const result = gateDecision(ledger, git({ contains: () => false }));
  assert.equal(result.ok, false);
  assert.match(result.problems[0], /Cloud Functions: the functions' source changed in aaaaaaa/);
});

test('a ledger without commits, or with commits the repository does not have, stops the release', () => {
  assert.equal(gateDecision({ firestoreRules: '', storageRules: '', functions: [] }, git()).problems.length, 3);
  const missing = gateDecision(ledger, git({ exists: () => false }));
  assert.equal(missing.problems.length, 3);
  assert.match(missing.problems[0], /is not in this repository/);
});

test('tests and fixtures of functions are not deployable source', () => {
  assert.ok(FUNCTIONS_PATHS.includes(':(exclude)functions/*.test.js'));
  assert.ok(FUNCTIONS_PATHS.includes(':(exclude)functions/*.integration.js'));
});
