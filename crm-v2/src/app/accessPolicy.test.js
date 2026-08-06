import { describe, expect, it } from 'vitest';
import { navigation, settingsNavigation } from './navigation.js';
import { ACCESS, ROUTE_ACCESS, rolesForRoute } from './accessPolicy.js';
import { ROLES } from '../utils/roles.js';

const roleCases = [
  {
    role: ROLES.ADMIN,
    allowed: ['/', '/students', '/calendar', '/groups', '/parents', '/library', '/live-classroom', '/teachers', '/settings', '/homework', '/messages', '/finance', '/finance/payroll', '/finance/expenses'],
    denied: ['/parent', '/student'],
  },
  {
    role: ROLES.TEACHER,
    allowed: ['/', '/students', '/calendar', '/groups', '/parents', '/library', '/live-classroom', '/settings', '/homework', '/messages'],
    denied: ['/teachers', '/finance', '/finance/payroll', '/finance/expenses', '/parent', '/student'],
  },
  {
    role: ROLES.FINANCE,
    allowed: ['/', '/settings', '/finance'],
    denied: ['/students', '/calendar', '/groups', '/parents', '/library', '/live-classroom', '/teachers', '/homework', '/messages', '/finance/payroll', '/finance/expenses', '/parent', '/student'],
  },
  {
    role: ROLES.PARENT,
    allowed: ['/parent', '/settings', '/homework', '/messages'],
    denied: ['/', '/students', '/calendar', '/groups', '/parents', '/library', '/live-classroom', '/teachers', '/finance', '/finance/payroll', '/finance/expenses', '/student'],
  },
  {
    role: ROLES.STUDENT,
    allowed: ['/student', '/settings', '/homework', '/messages'],
    denied: ['/', '/students', '/calendar', '/groups', '/parents', '/library', '/live-classroom', '/teachers', '/finance', '/finance/payroll', '/finance/expenses', '/parent'],
  },
];

function canAccess(role, path) {
  return rolesForRoute(path).includes(role);
}

describe('role acceptance policy', () => {
  it.each(roleCases)('$role has the expected route access', ({ role, allowed, denied }) => {
    allowed.forEach((path) => expect(canAccess(role, path), `${role} should access ${path}`).toBe(true));
    denied.forEach((path) => expect(canAccess(role, path), `${role} should not access ${path}`).toBe(false));
  });

  it('keeps navigation roles aligned with route access', () => {
    [...navigation, settingsNavigation].forEach((item) => {
      expect(item.roles, item.to).toEqual(ROUTE_ACCESS[item.to]);
    });
  });

  it('protects the dashboard from parent and student roles', () => {
    expect(ROUTE_ACCESS['/']).toBe(ACCESS.DASHBOARD);
    expect(ACCESS.DASHBOARD).toEqual([ROLES.ADMIN, ROLES.TEACHER, ROLES.FINANCE]);
    expect(canAccess(ROLES.PARENT, '/')).toBe(false);
    expect(canAccess(ROLES.STUDENT, '/')).toBe(false);
  });

  it('keeps sensitive finance and staff routes out of teacher access', () => {
    expect(ACCESS.FINANCE).not.toContain(ROLES.TEACHER);
    expect(ACCESS.ADMIN).not.toContain(ROLES.TEACHER);
    expect(rolesForRoute('/finance')).not.toContain(ROLES.TEACHER);
    expect(rolesForRoute('/teachers')).not.toContain(ROLES.TEACHER);
  });

  it('does not grant finance users access to student records or payroll administration', () => {
    expect(rolesForRoute('/students')).not.toContain(ROLES.FINANCE);
    expect(rolesForRoute('/finance/payroll')).not.toContain(ROLES.FINANCE);
    expect(rolesForRoute('/finance')).toContain(ROLES.FINANCE);
  });
});
