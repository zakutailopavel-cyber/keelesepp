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

  // When crm.epkoolitus.ee points at v2, old v1 bookmarks and registration links must keep working on www.
  it('sends old v1 addresses to the legacy site', () => {
    const config = JSON.parse(readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8'));
    const byPrefix = (prefix) => config.redirects.find((r) => r.source.startsWith(prefix));
    for (const prefix of ['/haldus', '/tasemetest', '/kutse', '/privaatsus', '/tingimused']) {
      expect(byPrefix(prefix)?.destination).toMatch(/^https:\/\/www\.epkoolitus\.ee\//);
      expect(byPrefix(prefix)?.permanent).toBe(false);
    }
    expect(config.redirects.some((r) => r.source === '/' || r.source.startsWith('/student') || r.source.startsWith('/live-classroom:'))).toBe(false);
  });
});
