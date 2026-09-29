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
});
