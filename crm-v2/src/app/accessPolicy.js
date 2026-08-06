import { ROLES } from '../utils/roles.js';

export const ACCESS = Object.freeze({
  ALL_AUTHENTICATED: Object.freeze(Object.values(ROLES)),
  STAFF: Object.freeze([ROLES.ADMIN, ROLES.TEACHER]),
  ADMIN: Object.freeze([ROLES.ADMIN]),
  FINANCE: Object.freeze([ROLES.ADMIN, ROLES.FINANCE]),
  PARENT: Object.freeze([ROLES.PARENT]),
  STUDENT: Object.freeze([ROLES.STUDENT]),
  DASHBOARD: Object.freeze([ROLES.ADMIN, ROLES.TEACHER, ROLES.FINANCE]),
  HOMEWORK: Object.freeze([ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT]),
  MESSAGES: Object.freeze([ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT]),
});

export const ROUTE_ACCESS = Object.freeze({
  '/': ACCESS.DASHBOARD,
  '/students': ACCESS.STAFF,
  '/students/:studentId': ACCESS.STAFF,
  '/calendar': ACCESS.STAFF,
  '/groups': ACCESS.STAFF,
  '/library': ACCESS.STAFF,
  '/parents': ACCESS.STAFF,
  '/live-classroom': ACCESS.STAFF,
  '/teachers': ACCESS.ADMIN,
  '/teachers/:teacherId': ACCESS.ADMIN,
  '/settings': ACCESS.ALL_AUTHENTICATED,
  '/homework': ACCESS.HOMEWORK,
  '/messages': ACCESS.MESSAGES,
  '/parent': ACCESS.PARENT,
  '/student': ACCESS.STUDENT,
  '/finance': ACCESS.FINANCE,
  '/finance/payroll': ACCESS.ADMIN,
  '/finance/expenses': ACCESS.ADMIN,
});

export function rolesForRoute(path) {
  return ROUTE_ACCESS[path] || Object.freeze([]);
}
