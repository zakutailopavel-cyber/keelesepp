#!/usr/bin/env node
// What is live in Firebase vs this checkout — READ-ONLY (GET requests only, nothing is deployed or written).
// docs/DEPLOY_LEDGER.md is the ledger; this script is how to check it.
//
//   node tools/deploy-status/deploy-status.mjs            # project keelesepp-5136b
//   node tools/deploy-status/deploy-status.mjs --json
//
// Credentials: Google Application Default Credentials of an account that may read the project
// (`gcloud auth application-default login`), via google-auth-library from functions/node_modules (cd functions && npm ci)
// or, without it, `gcloud auth application-default print-access-token`. ACCESS_TOKEN=… overrides both.
//
// Prints: Firestore rules and Storage rules — the live ruleset's sha256 vs the repo file's sha256 (same / DIFFERENT),
// release update time; each Cloud Function (v1 API, all regions) with updateTime, status, versionId; functions that are
// exported in the repo but not live, and live but not in the repo.
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const PROJECT = process.env.FIREBASE_PROJECT || 'keelesepp-5136b';
const RULES_API = 'https://firebaserules.googleapis.com/v1';
const FUNCTIONS_API = 'https://cloudfunctions.googleapis.com/v1';

export const sha256 = (text) => createHash('sha256').update(text, 'utf8').digest('hex');

// names of the functions the repo deploys: `exports.name =` in functions/*.js reached from main.js + main.js own keys
export function repoFunctionNames(indexSource, mainSource) {
  const names = new Set();
  for (const m of indexSource.matchAll(/^exports\.([A-Za-z0-9_]+)\s*=/gm)) names.add(m[1]);
  const body = (mainSource.match(/module\.exports\s*=\s*\{([\s\S]*?)\};/) || [])[1] || '';
  for (const line of body.split('\n')) {
    const m = line.trim().match(/^([A-Za-z0-9_]+)\s*[,:]/);
    if (m) names.add(m[1]);
  }
  return [...names].sort();
}

// one ruleset's files → the text that `firebase deploy` uploaded (one file per ruleset in this project)
export function rulesetText(ruleset) {
  const files = ruleset?.source?.files || [];
  return files.map((f) => f.content || '').join('\n');
}

export function compareFunctions(live, repoNames) {
  const liveNames = new Set(live.map((f) => f.name.split('/').pop()));
  return {
    missingLive: repoNames.filter((n) => !liveNames.has(n)),
    notInRepo: [...liveNames].filter((n) => !repoNames.includes(n)).sort(),
  };
}

async function accessToken() {
  if (process.env.ACCESS_TOKEN) return process.env.ACCESS_TOKEN;
  try {
    const require = createRequire(join(ROOT, 'functions', 'package.json'));
    const { GoogleAuth } = require('google-auth-library');
    const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform.read-only', 'https://www.googleapis.com/auth/firebase.readonly'] });
    const token = await auth.getAccessToken();
    if (token) return token;
  } catch { /* fall back to gcloud */ }
  try {
    return execFileSync('gcloud', ['auth', 'application-default', 'print-access-token'], { encoding: 'utf8' }).trim();
  } catch {
    throw new Error('No Google credentials: run `gcloud auth application-default login` (read access to the project is enough).');
  }
}

async function get(url, token) {
  const res = await fetch(url, { headers: { authorization: `Bearer ${token}`, 'x-goog-user-project': PROJECT } });
  if (!res.ok) throw new Error(`GET ${url} → ${res.status} ${(await res.text()).slice(0, 300)}`);
  return res.json();
}

async function liveRules(token) {
  const out = [];
  let pageToken = '';
  const releases = [];
  do {
    const page = await get(`${RULES_API}/projects/${PROJECT}/releases${pageToken ? `?pageToken=${pageToken}` : ''}`, token);
    releases.push(...(page.releases || []));
    pageToken = page.nextPageToken || '';
  } while (pageToken);
  const wanted = [
    { kind: 'Firestore rules', file: 'firestore.rules', match: (n) => n.endsWith('/releases/cloud.firestore') },
    { kind: 'Storage rules', file: 'storage.rules', match: (n) => n.includes('/releases/firebase.storage/') },
  ];
  for (const w of wanted) {
    const release = releases.find((r) => w.match(r.name));
    const repoHash = sha256(readFileSync(join(ROOT, w.file), 'utf8'));
    if (!release) { out.push({ kind: w.kind, file: w.file, live: null, repoHash }); continue; }
    const ruleset = await get(`${RULES_API}/${release.rulesetName}`, token);
    const liveHash = sha256(rulesetText(ruleset));
    out.push({ kind: w.kind, file: w.file, release: release.name.split('/releases/')[1], updateTime: release.updateTime, ruleset: release.rulesetName.split('/').pop(), liveHash, repoHash, same: liveHash === repoHash });
  }
  return out;
}

async function liveFunctions(token) {
  const all = [];
  let pageToken = '';
  do {
    const page = await get(`${FUNCTIONS_API}/projects/${PROJECT}/locations/-/functions?pageSize=200${pageToken ? `&pageToken=${pageToken}` : ''}`, token);
    all.push(...(page.functions || []));
    pageToken = page.nextPageToken || '';
  } while (pageToken);
  return all.map((f) => ({ name: f.name, short: f.name.split('/').pop(), region: f.name.split('/')[3], updateTime: f.updateTime, status: f.status, versionId: f.versionId, runtime: f.runtime }))
    .sort((a, b) => a.short.localeCompare(b.short));
}

async function main() {
  const token = await accessToken();
  const [rules, functions] = await Promise.all([liveRules(token), liveFunctions(token)]);
  const repoNames = repoFunctionNames(readFileSync(join(ROOT, 'functions', 'index.js'), 'utf8'), readFileSync(join(ROOT, 'functions', 'main.js'), 'utf8'));
  const diff = compareFunctions(functions, repoNames);
  let head = '';
  try { head = execFileSync('git', ['-C', ROOT, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim(); } catch { /* not a git checkout */ }
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify({ project: PROJECT, repoCommit: head, rules, functions, ...diff }, null, 2));
    return;
  }
  console.log(`Project ${PROJECT} · repo checkout ${head || '?'} (compare with fresh origin/main)\n`);
  for (const r of rules) {
    if (!r.liveHash) { console.log(`${r.kind}: no live release found`); continue; }
    console.log(`${r.kind}: ${r.same ? 'same as repo' : 'DIFFERENT from repo'} · released ${r.updateTime} · live ${r.liveHash.slice(0, 12)} · repo ${r.file} ${r.repoHash.slice(0, 12)}`);
  }
  console.log(`\nCloud Functions (${functions.length} live):`);
  for (const f of functions) console.log(`  ${f.short.padEnd(36)} ${f.updateTime}  ${f.status}  v${f.versionId}  ${f.region}  ${f.runtime}`);
  if (diff.missingLive.length) console.log(`\nIn the repo, not live: ${diff.missingLive.join(', ')}`);
  if (diff.notInRepo.length) console.log(`\nLive, not in the repo: ${diff.notInRepo.join(', ')}`);
  console.log('\nHosting (Vercel) is not read here: the live app = the newest „[deploy]” / „[hotfix]” commit on main with a green Vercel production build.');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((err) => { console.error(err.message || err); process.exit(1); });
}
