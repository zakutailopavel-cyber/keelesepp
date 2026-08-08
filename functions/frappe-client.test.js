'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createFrappeClient, frappeConfig } = require('./frappe-client');

test('frappeConfig requires all server-side credentials', () => {
  assert.throws(() => frappeConfig({}), /FRAPPE_BASE_URL is required/);
  assert.throws(() => frappeConfig({ FRAPPE_BASE_URL: 'https://erp.example.test' }), /FRAPPE_API_KEY is required/);
});

test('client sends token auth and parses whoAmI', async () => {
  let request;
  const fetchImpl = async (url, options) => {
    request = { url: String(url), options };
    return {
      ok: true,
      status: 200,
      async json() { return { message: 'integration@example.test' }; },
    };
  };

  const client = createFrappeClient({
    baseUrl: 'https://erp.example.test/',
    apiKey: 'key',
    apiSecret: 'secret',
    fetchImpl,
  });

  assert.equal(await client.whoAmI(), 'integration@example.test');
  assert.equal(request.url, 'https://erp.example.test/api/method/frappe.auth.get_logged_user');
  assert.equal(request.options.headers.Authorization, 'token key:secret');
});

test('client creates DocType documents through resource API', async () => {
  let request;
  const fetchImpl = async (url, options) => {
    request = { url: String(url), options };
    return {
      ok: true,
      status: 200,
      async json() { return { data: { name: 'CUST-0001' } }; },
    };
  };

  const client = createFrappeClient({
    baseUrl: 'https://erp.example.test',
    apiKey: 'key',
    apiSecret: 'secret',
    fetchImpl,
  });

  const result = await client.create('Customer', { customer_name: 'Test Student' });
  assert.deepEqual(result, { name: 'CUST-0001' });
  assert.equal(request.url, 'https://erp.example.test/api/resource/Customer');
  assert.equal(request.options.method, 'POST');
  assert.deepEqual(JSON.parse(request.options.body), { customer_name: 'Test Student' });
});
