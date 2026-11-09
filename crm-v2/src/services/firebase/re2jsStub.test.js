import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { RE2JS } from 're2js';
import * as stub from './re2jsStub.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

function sourceFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) sourceFiles(full, out);
    else if (/\.(jsx?|tsx?|mjs)$/.test(entry.name)) out.push(full);
  }
  return out;
}

describe('re2js stand-in (vite.config.js alias)', () => {
  it('the alias is active: `re2js` resolves to the stub', () => {
    expect(RE2JS).toBe(stub.RE2JS);
  });

  it('compile throws (Firestore turns that into an error value, as for an invalid pattern)', () => {
    expect(() => RE2JS.compile('a.*')).toThrow(/not bundled/);
  });

  it('the CRM never uses Firestore Pipelines, the only user of re2js', () => {
    sourceFiles(path.join(ROOT, 'src')).forEach((file) => {
      expect(fs.readFileSync(file, 'utf8'), path.relative(ROOT, file)).not.toMatch(/['"]firebase\/firestore\/pipelines['"]|['"]@firebase\/firestore\/pipelines['"]/);
    });
  });
});
