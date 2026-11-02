import { Children } from 'react';
import { describe, expect, it } from 'vitest';
import { ROLES } from '../utils/roles.js';
import { ACCESS, ROUTE_ACCESS, rolesForRoute } from './accessPolicy.js';
import ProtectedRoute from './ProtectedRoute.jsx';
import AppRoutes from './routes.jsx';

// every path inside the signed-in shell with the roles its nearest ProtectedRoute allows
function protectedPaths(element, roles = null, found = {}) {
  Children.forEach(element.props.children, (child) => {
    if (!child) return;
    const guard = child.props.element?.type === ProtectedRoute ? child.props.element.props.roles : roles;
    if (child.props.path && guard) found[`/${child.props.path}`] = guard;
    protectedPaths(child, guard, found);
  });
  return found;
}

const routes = protectedPaths(AppRoutes());

describe('routes.jsx and accessPolicy.js', () => {
  it('every signed-in route is in the policy with the same roles', () => {
    expect(Object.keys(routes).length).toBeGreaterThan(40);
    Object.entries(routes).forEach(([path, roles]) => expect(ROUTE_ACCESS[path], path).toEqual(roles));
  });

  it('every path in the policy is a route; „/” sends each role on from HomePage', () => {
    Object.keys(ROUTE_ACCESS).filter((path) => path !== '/').forEach((path) => expect(routes[path], path).toBeDefined());
  });

  it('the finance role does not reach homework or messages', () => {
    expect(routes['/homework']).toBe(ACCESS.HOMEWORK);
    expect(routes['/messages']).toBe(ACCESS.MESSAGES);
    expect(routes['/homework']).not.toContain(ROLES.FINANCE);
    expect(routes['/messages']).not.toContain(ROLES.FINANCE);
  });

  it('course production pages are for the administrator, the library for staff', () => {
    ['avasta-module-1', 'module-1-three-phase', 'course', 'health'].forEach((page) => expect(rolesForRoute(`/library/worksheet-generator/${page}`)).toEqual([ROLES.ADMIN]));
    expect(rolesForRoute('/library/raamatukogu')).toEqual(ACCESS.STAFF);
    expect(rolesForRoute('/finance/ostuarved')).toEqual([ROLES.ADMIN]);
  });
});
