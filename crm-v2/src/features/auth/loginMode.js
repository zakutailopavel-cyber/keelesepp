const REGISTER_ALIASES = ['register', 'registreeru', 'signup', 'loo-konto'];

// Old links used `/haldus#registreeru` or `?mode=register`; both still open the registration form.
export function modeFromLocation(location, initialMode) {
  if (initialMode) return initialMode;
  const params = new globalThis.URLSearchParams(location.search || '');
  const route = String(params.get('mode') || (location.hash || '').replace('#', '')).toLowerCase();
  return REGISTER_ALIASES.includes(route) ? 'register' : 'login';
}
