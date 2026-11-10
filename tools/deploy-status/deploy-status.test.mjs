// node --test tools/deploy-status/ (from the repo root) — pure parts only, no network
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compareFunctions, repoFunctionNames, rulesetText, sha256 } from './deploy-status.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

test('repo function names come from index.js exports and main.js keys', () => {
  const names = repoFunctionNames(
    'exports.financeApi = functions.https.onRequest();\nconst x = 1;\nexports.languageApi = 1;\n',
    "module.exports = {\n  ...existingFunctions,\n  lessonDraftsApi: require('./x').lessonDraftsApi,\n  manualInvoiceApi,\n  // comment\n  autoMarkLiveLesson,\n};",
  );
  assert.deepEqual(names, ['autoMarkLiveLesson', 'financeApi', 'languageApi', 'lessonDraftsApi', 'manualInvoiceApi']);
});

test('the real repo exports the functions named in the ledger', () => {
  const names = repoFunctionNames(readFileSync(join(ROOT, 'functions/index.js'), 'utf8'), readFileSync(join(ROOT, 'functions/main.js'), 'utf8'));
  for (const n of ['financeApi', 'languageApi', 'staffOperationsApi', 'websiteLeadApi', 'weeklyUnmarkedLessonsDigest', 'autoMarkLiveLesson']) assert.ok(names.includes(n), n);
});

test('a live ruleset hashes like the repo file it was deployed from', () => {
  const text = 'rules_version = "2";\nservice cloud.firestore {}\n';
  assert.equal(sha256(rulesetText({ source: { files: [{ name: 'firestore.rules', content: text }] } })), sha256(text));
  assert.notEqual(sha256(rulesetText({ source: { files: [{ content: `${text} ` }] } })), sha256(text));
});

test('functions missing live / live but not in the repo', () => {
  const live = [{ name: 'projects/p/locations/us-central1/functions/financeApi' }, { name: 'projects/p/locations/us-central1/functions/oldApi' }];
  assert.deepEqual(compareFunctions(live, ['financeApi', 'newApi']), { missingLive: ['newApi'], notInRepo: ['oldApi'] });
});
