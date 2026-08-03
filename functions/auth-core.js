"use strict";

function collectTrustedRoles(profile = {}, decoded = {}) {
  const roles = new Set();
  const addRole = value => {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach(addRole);
      return;
    }
    roles.add(String(value).toLowerCase());
  };

  // Firestore security rules protect the canonical profile.role field.
  // Additional profile flags are deliberately ignored because a client-owned
  // profile must never become an authorization source.
  addRole(profile.role);
  // Custom token claims are signed by Firebase Admin and may carry multi-role access.
  addRole(decoded.role);
  addRole(decoded.roles);
  return roles;
}

function isDisabledProfile(profile = {}) {
  return profile.disabled === true;
}

module.exports = { collectTrustedRoles, isDisabledProfile };
