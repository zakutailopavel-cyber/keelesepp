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
  addRole(profile.role);
  addRole(decoded.role);
  addRole(decoded.roles);
  return roles;
}

function isDisabledProfile(profile = {}) {
  return profile.disabled === true;
}

module.exports = { collectTrustedRoles, isDisabledProfile };
