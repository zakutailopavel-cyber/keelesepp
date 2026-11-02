/* global process */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Live Classroom video, screen sharing and worksheet voice answers need camera, microphone and display capture
// on our own origin; a blanket "camera=()" header silently breaks them in production only.
describe('CRM v2 hosting headers', () => {
  it('allows camera, microphone and screen capture for the app itself', () => {
    const config = JSON.parse(readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8'));
    const policy = config.headers.flatMap((h) => h.headers).find((h) => h.key === 'Permissions-Policy').value;
    expect(policy).toContain('camera=(self)');
    expect(policy).toContain('microphone=(self)');
    expect(policy).toContain('display-capture=(self)');
  });

  // Hashed files never change, so they are kept for a year; audio and pictures keep their names when redone, so a day.
  // The pages must always be asked for again, or a browser would keep an old build. A missing file must not be answered
  // with the app's HTML: under a year-long header that HTML would stay at the address.
  it('caches files by their kind and never the HTML', () => {
    const config = JSON.parse(readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8'));
    const cacheRules = config.headers.filter((rule) => rule.headers.some((h) => h.key === 'Cache-Control'));
    const cacheOf = (source) => cacheRules.find((rule) => rule.source === source)?.headers.find((h) => h.key === 'Cache-Control').value;
    expect(cacheOf('/assets/(.*)')).toContain('immutable');
    expect(cacheOf('/(audio|textbook-art)/(.*)')).not.toContain('immutable');
    expect(cacheRules.map((rule) => rule.source)).toEqual(['/assets/(.*)', '/(audio|textbook-art)/(.*)']);
    const app = config.rewrites.find((rule) => rule.destination === '/index.html');
    const appPaths = new RegExp(`^${app.source}$`);
    for (const path of ['/', '/student', '/library/worksheet-generator/health', '/finance/seaded']) expect(appPaths.test(path)).toBe(true);
    for (const path of ['/assets/main-abc.js', '/audio/a2-001/x.mp3', '/textbook-art/a.png']) expect(appPaths.test(path)).toBe(false);
  });

  // Enforced since 2026-11-02: in report-only mode the live site showed no violation on 15 signed-in pages, the sheets'
  // pictures and the materials' files are all on Firebase Storage, and nothing posts a form to another site.
  it('enforces the content security policy', () => {
    const config = JSON.parse(readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8'));
    const headers = config.headers.flatMap((h) => h.headers);
    expect(headers.some((h) => h.key === 'Content-Security-Policy-Report-Only')).toBe(false);
    const policy = headers.find((h) => h.key === 'Content-Security-Policy').value;
    expect(policy).toContain("default-src 'self'");
    expect(policy).toContain('https://us-central1-keelesepp-5136b.cloudfunctions.net');
    expect(policy).toContain('https://firestore.googleapis.com');
    expect(policy).toContain('https://fonts.gstatic.com');
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).not.toContain('unsafe-eval');
  });

  // When crm.epkoolitus.ee points at v2, old v1 bookmarks and registration links must keep working on www.
  it('sends the public pages to the website and old v1 addresses into this CRM (v1 retired 2026-10-19)', () => {
    const config = JSON.parse(readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8'));
    const byPrefix = (prefix) => config.redirects.find((r) => r.source.startsWith(prefix));
    for (const prefix of ['/tasemetest', '/kutse', '/privaatsus', '/tingimused']) {
      expect(byPrefix(prefix)?.destination).toMatch(/^https:\/\/www\.epkoolitus\.ee\//);
      expect(byPrefix(prefix)?.permanent).toBe(false);
    }
    expect(byPrefix('/haldus')?.destination).toBe('/login');
    expect(byPrefix('/live-classroom.html')?.destination).toBe('/live-classroom');
    expect(config.redirects.some((r) => r.source === '/' || r.source.startsWith('/student') || r.source.startsWith('/live-classroom:'))).toBe(false);
  });
});
