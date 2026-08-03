export const ROLES = Object.freeze({
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent',
  FINANCE: 'finance',
});

const defaultSuperAdminEmails = ['zakutailo.pavel@gmail.com'];

function superAdminEmails() {
  const configured = String(import.meta.env.VITE_SUPER_ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  return new Set(configured.length ? configured : defaultSuperAdminEmails);
}

export function normalizeRoles(profile = {}, claims = {}, identity = {}) {
  // The Firestore profile is client-readable, so only its canonical `role`
  // field is accepted. Multi-role authorization must come from signed claims.
  const values = [profile.role, claims.role, ...(Array.isArray(claims.roles) ? claims.roles : [])];
  if (superAdminEmails().has(String(identity.email || '').toLowerCase())) values.push(ROLES.ADMIN);
  return [...new Set(values.filter(Boolean).map((role) => String(role).toLowerCase()))];
}

export function hasAnyRole(userRoles, allowedRoles) {
  if (!allowedRoles?.length) return true;
  return allowedRoles.some((role) => userRoles.includes(role));
}
