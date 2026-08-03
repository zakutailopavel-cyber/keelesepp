export const ROLES = Object.freeze({
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent',
  FINANCE: 'finance',
});

export function normalizeRoles(profile = {}, claims = {}) {
  // The Firestore profile is client-readable, so only its canonical `role`
  // field is accepted. Multi-role authorization must come from signed claims.
  const values = [profile.role, claims.role, ...(Array.isArray(claims.roles) ? claims.roles : [])];
  return [...new Set(values.filter(Boolean).map((role) => String(role).toLowerCase()))];
}

export function hasAnyRole(userRoles, allowedRoles) {
  if (!allowedRoles?.length) return true;
  return allowedRoles.some((role) => userRoles.includes(role));
}
