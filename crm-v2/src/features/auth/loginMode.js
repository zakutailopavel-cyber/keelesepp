import { ROUTE_ACCESS } from '../../app/accessPolicy.js';
import { hasAnyRole } from '../../utils/roles.js';

// After sign-in the page the visitor wanted, but only if this account may open it: a parent signing in on the
// family's computer after the child logged out from /student landed on „Ligipääs puudub” (site check 2026-10-27).
// A path outside the access map (e.g. /ai/connect) is kept as before.
export function landingPath(from, roles) {
  const path = from?.pathname || '';
  if (!path || path === '/login') return '/';
  const pattern = Object.keys(ROUTE_ACCESS).find((key) => new RegExp(`^${key.replace(/:[^/]+/g, '[^/]+')}/?$`).test(path));
  if (pattern && roles && !hasAnyRole(roles, ROUTE_ACCESS[pattern])) return '/';
  return `${path}${from.search || ''}`;
}

const REGISTER_ALIASES = ['register', 'registreeru', 'signup', 'loo-konto'];

// Old links used `/haldus#registreeru` or `?mode=register`; both still open the registration form.
export function modeFromLocation(location, initialMode) {
  if (initialMode) return initialMode;
  const params = new globalThis.URLSearchParams(location.search || '');
  const route = String(params.get('mode') || (location.hash || '').replace('#', '')).toLowerCase();
  return REGISTER_ALIASES.includes(route) ? 'register' : 'login';
}
