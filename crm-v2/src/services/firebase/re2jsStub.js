// Stand-in for the `re2js` package (vite.config.js `resolve.alias`). Firebase 13's Firestore imports re2js (~45 KB gzip)
// only to evaluate the regex / LIKE expressions of Firestore *Pipelines* (`firebase/firestore/pipelines`) on the device.
// The CRM uses plain queries and never pipelines (re2jsStub.test.js keeps it that way), so this code never runs — and
// without the stub every first load (login, every home page) downloaded it. If it ever runs, Firestore catches the error
// and treats the expression as an error value, exactly as it does for an invalid pattern.
function notBundled() {
  throw new Error('re2js is not bundled in KeeleSepp: Firestore Pipelines regex/LIKE expressions are not supported');
}

export const RE2JS = Object.freeze({ compile: notBundled, matches: notBundled, quote: notBundled });
export default RE2JS;
