const defaultLegacyOrigin = 'https://www.epkoolitus.ee';

export function legacyUrl(path, origin = import.meta.env.VITE_LEGACY_CRM_URL || defaultLegacyOrigin) {
  return `${String(origin).replace(/\/$/, '')}/${String(path).replace(/^\//, '')}`;
}
