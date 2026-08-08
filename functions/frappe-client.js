'use strict';

function required(name, value) {
  const clean = String(value || '').trim();
  if (!clean) throw new Error(`${name} is required`);
  return clean;
}

function normalizeBaseUrl(value) {
  return required('FRAPPE_BASE_URL', value).replace(/\/+$/, '');
}

function frappeConfig(env = process.env) {
  return {
    baseUrl: normalizeBaseUrl(env.FRAPPE_BASE_URL),
    apiKey: required('FRAPPE_API_KEY', env.FRAPPE_API_KEY),
    apiSecret: required('FRAPPE_API_SECRET', env.FRAPPE_API_SECRET),
  };
}

function encodeDoctype(value) {
  return encodeURIComponent(required('doctype', value));
}

function encodeName(value) {
  return encodeURIComponent(required('document name', value));
}

function createFrappeClient({ baseUrl, apiKey, apiSecret, fetchImpl = globalThis.fetch } = {}) {
  if (typeof fetchImpl !== 'function') throw new Error('fetch implementation is required');
  const config = {
    baseUrl: normalizeBaseUrl(baseUrl),
    apiKey: required('FRAPPE_API_KEY', apiKey),
    apiSecret: required('FRAPPE_API_SECRET', apiSecret),
  };

  async function request(path, { method = 'GET', body, query } = {}) {
    const url = new URL(`${config.baseUrl}${path}`);
    Object.entries(query || {}).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      url.searchParams.set(key, typeof value === 'string' ? value : JSON.stringify(value));
    });

    const response = await fetchImpl(url, {
      method,
      headers: {
        Authorization: `token ${config.apiKey}:${config.apiSecret}`,
        Accept: 'application/json',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = payload?.exception || payload?.message || payload?._server_messages || `Frappe request failed (${response.status})`;
      const error = new Error(String(message));
      error.status = response.status;
      error.payload = payload;
      throw error;
    }
    return payload;
  }

  return {
    async whoAmI() {
      const payload = await request('/api/method/frappe.auth.get_logged_user');
      return payload.message || null;
    },

    async list(doctype, { fields = ['name'], filters = [], limit = 20, orderBy } = {}) {
      const payload = await request(`/api/resource/${encodeDoctype(doctype)}`, {
        query: {
          fields,
          filters,
          limit_page_length: limit,
          order_by: orderBy,
        },
      });
      return payload.data || [];
    },

    async get(doctype, name) {
      const payload = await request(`/api/resource/${encodeDoctype(doctype)}/${encodeName(name)}`);
      return payload.data || null;
    },

    async create(doctype, document) {
      const payload = await request(`/api/resource/${encodeDoctype(doctype)}`, {
        method: 'POST',
        body: document,
      });
      return payload.data || null;
    },

    async update(doctype, name, patch) {
      const payload = await request(`/api/resource/${encodeDoctype(doctype)}/${encodeName(name)}`, {
        method: 'PUT',
        body: patch,
      });
      return payload.data || null;
    },

    async call(method, args = {}) {
      return request(`/api/method/${required('method', method)}`, {
        method: 'POST',
        body: args,
      });
    },
  };
}

function createFrappeClientFromEnv(env = process.env, options = {}) {
  return createFrappeClient({ ...frappeConfig(env), ...options });
}

module.exports = {
  createFrappeClient,
  createFrappeClientFromEnv,
  frappeConfig,
  normalizeBaseUrl,
};
