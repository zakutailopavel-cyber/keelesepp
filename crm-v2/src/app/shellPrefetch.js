// The signed-in shell (menu, bell, gates, lesson invitation, announcements …) is its own file, not part of the first
// download: /login and the public links (pay link, „Sobivad ajad”, device check …) open without it.
// main.jsx starts the download at once on any other address, in parallel with the session check, so a signed-in page
// does not wait for it; on the sign-in page it starts once the page has loaded and the browser is idle.
export const loadAppShell = () => import('../components/layout/AppShell.jsx');

const SIGN_IN = /^\/(login|registreeru)\/?$/;
// the routes.jsx paths outside the shell
const NO_SHELL = [/^\/(login|registreeru|register|forbidden|ajad|kontroll)\/?$/, /^\/(tund|maksa|maksuandmed|e-kirjad)\//];

export function shellPrefetchMode(pathname = '/') {
  if (SIGN_IN.test(pathname)) return 'idle';
  return NO_SHELL.some((pattern) => pattern.test(pathname)) ? 'none' : 'now';
}

export function prefetchAppShell(win = globalThis, load = loadAppShell) {
  // a failed download is not an error here: the route asks again and shows its own error / reload
  const run = () => { Promise.resolve().then(load).catch(() => {}); };
  const mode = shellPrefetchMode(win.location?.pathname);
  if (mode === 'now') { run(); return mode; }
  if (mode === 'idle') {
    const later = () => (win.requestIdleCallback ? win.requestIdleCallback(run, { timeout: 4000 }) : win.setTimeout(run, 2000));
    if (win.document?.readyState === 'complete') later();
    else win.addEventListener?.('load', later, { once: true });
  }
  return mode;
}
