'use strict';

const fs = require('fs');
const path = require('path');

const baseUrl = String(process.env.FRAPPE_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');
const adminUser = process.env.FRAPPE_ADMIN_USER || 'Administrator';
const adminPassword = process.env.FRAPPE_ADMIN_PASSWORD || 'admin';
const companyName = process.env.ERPNEXT_COMPANY || 'E&P Koolitus OÜ';
const integrationEmail = process.env.ERPNEXT_INTEGRATION_USER || 'keelesepp-integration@example.invalid';
const customerGroupName = process.env.ERPNEXT_CUSTOMER_GROUP || 'KeeleSepp Customers';
const territoryName = process.env.ERPNEXT_TERRITORY || 'Estonia';
const currency = process.env.ERPNEXT_CURRENCY || 'EUR';
const sellingPriceListName = process.env.ERPNEXT_SELLING_PRICE_LIST || 'KeeleSepp Selling EUR';
const envFile = process.argv[2] || path.resolve(process.cwd(), '.erpnext-staging.env');

function encode(value) {
  return encodeURIComponent(String(value));
}

function parseCookies(headers) {
  const values = typeof headers.getSetCookie === 'function'
    ? headers.getSetCookie()
    : [headers.get('set-cookie')].filter(Boolean);
  return values.map((value) => String(value).split(';', 1)[0]).filter(Boolean).join('; ');
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function currentFiscalYear() {
  const now = new Date();
  const year = now.getUTCFullYear();
  return {
    yearName: String(year),
    startDate: `${year}-01-01`,
    endDate: `${year}-12-31`,
  };
}

async function request(pathname, { method = 'GET', body, form, cookie = '' } = {}) {
  const headers = { Accept: 'application/json' };
  let requestBody;
  if (cookie) headers.Cookie = cookie;
  if (form) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    requestBody = new URLSearchParams(form).toString();
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    requestBody = JSON.stringify(body);
  }

  const response = await fetch(`${baseUrl}${pathname}`, { method, headers, body: requestBody });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload.exception || payload.message || payload._server_messages || `${method} ${pathname} failed (${response.status})`;
    throw new Error(String(message));
  }
  return { payload, response };
}

async function login() {
  const { payload, response } = await request('/api/method/login', {
    method: 'POST',
    form: { usr: adminUser, pwd: adminPassword },
  });
  const cookie = parseCookies(response.headers);
  if (!cookie) throw new Error('Frappe login succeeded but no session cookie was returned');
  return { cookie, payload };
}

async function list(cookie, doctype, filters = [], fields = ['name']) {
  const query = new URLSearchParams({
    filters: JSON.stringify(filters),
    fields: JSON.stringify(fields),
    limit_page_length: '10',
  });
  const { payload } = await request(`/api/resource/${encode(doctype)}?${query}`, { cookie });
  return payload.data || [];
}

async function create(cookie, doctype, doc) {
  const { payload } = await request(`/api/resource/${encode(doctype)}`, { method: 'POST', body: doc, cookie });
  return payload.data;
}

async function get(cookie, doctype, name) {
  const { payload } = await request(`/api/resource/${encode(doctype)}/${encode(name)}`, { cookie });
  return payload.data;
}

async function update(cookie, doctype, name, patch) {
  const { payload } = await request(`/api/resource/${encode(doctype)}/${encode(name)}`, { method: 'PUT', body: patch, cookie });
  return payload.data;
}

async function call(cookie, method, args = {}) {
  const { payload } = await request(`/api/method/${method}`, { method: 'POST', body: args, cookie });
  return payload.message;
}

async function ensureOne(cookie, doctype, filters, payload) {
  const existing = await list(cookie, doctype, filters, ['name']);
  if (existing[0]) return { name: existing[0].name, created: false };
  const created = await create(cookie, doctype, payload);
  return { name: created.name, created: true };
}

async function ensureBaseFixtures(cookie) {
  const fixtures = [];

  fixtures.push({
    doctype: 'Warehouse Type',
    ...(await ensureOne(cookie, 'Warehouse Type', [['Warehouse Type', 'name', '=', 'Transit']], {
      name: 'Transit',
    })),
  });

  fixtures.push({
    doctype: 'UOM',
    ...(await ensureOne(cookie, 'UOM', [['UOM', 'name', '=', 'Nos']], {
      uom_name: 'Nos',
      must_be_whole_number: 1,
    })),
  });

  fixtures.push({
    doctype: 'Item Group',
    ...(await ensureOne(cookie, 'Item Group', [['Item Group', 'name', '=', 'All Item Groups']], {
      item_group_name: 'All Item Groups',
      is_group: 1,
    })),
  });

  fixtures.push({
    doctype: 'Customer Group',
    ...(await ensureOne(cookie, 'Customer Group', [['Customer Group', 'name', '=', 'All Customer Groups']], {
      customer_group_name: 'All Customer Groups',
      is_group: 1,
    })),
  });

  fixtures.push({
    doctype: 'Territory',
    ...(await ensureOne(cookie, 'Territory', [['Territory', 'name', '=', 'All Territories']], {
      territory_name: 'All Territories',
      is_group: 1,
    })),
  });

  fixtures.push({
    doctype: 'Customer Group',
    ...(await ensureOne(cookie, 'Customer Group', [['Customer Group', 'name', '=', customerGroupName]], {
      customer_group_name: customerGroupName,
      parent_customer_group: 'All Customer Groups',
      is_group: 0,
    })),
  });

  fixtures.push({
    doctype: 'Territory',
    ...(await ensureOne(cookie, 'Territory', [['Territory', 'name', '=', territoryName]], {
      territory_name: territoryName,
      parent_territory: 'All Territories',
      is_group: 0,
    })),
  });

  return fixtures;
}

async function ensureCompany(cookie) {
  const result = await ensureOne(cookie, 'Company', [['Company', 'name', '=', companyName]], {
    company_name: companyName,
    abbr: 'EPK',
    default_currency: currency,
    country: 'Estonia',
  });
  await update(cookie, 'Company', result.name, { default_currency: currency });
  return result;
}

async function ensureFiscalYear(cookie) {
  const fiscal = currentFiscalYear();
  let existing = await list(cookie, 'Fiscal Year', [
    ['Fiscal Year', 'year_start_date', '<=', new Date().toISOString().slice(0, 10)],
    ['Fiscal Year', 'year_end_date', '>=', new Date().toISOString().slice(0, 10)],
  ], ['name', 'year_start_date', 'year_end_date', 'disabled']);

  let fiscalYear;
  if (existing[0]) {
    fiscalYear = existing[0];
    if (Number(fiscalYear.disabled || 0) === 1) {
      fiscalYear = await update(cookie, 'Fiscal Year', fiscalYear.name, { disabled: 0 });
    }
  } else {
    fiscalYear = await create(cookie, 'Fiscal Year', {
      year: fiscal.yearName,
      year_start_date: fiscal.startDate,
      year_end_date: fiscal.endDate,
      disabled: 0,
      companies: [{ company: companyName }],
    });
  }

  const full = await get(cookie, 'Fiscal Year', fiscalYear.name);
  const companies = new Set((full.companies || []).map((row) => row.company).filter(Boolean));
  if (!companies.has(companyName)) {
    full.companies = [...companies, companyName].map((company) => ({ company }));
    fiscalYear = await update(cookie, 'Fiscal Year', full.name, {
      disabled: 0,
      companies: full.companies,
    });
  }

  await update(cookie, 'Global Defaults', 'Global Defaults', {
    current_fiscal_year: fiscalYear.name,
    default_company: companyName,
    default_currency: currency,
  });

  return {
    name: fiscalYear.name,
    startDate: full.year_start_date || fiscal.startDate,
    endDate: full.year_end_date || fiscal.endDate,
  };
}

async function ensureSellingPriceList(cookie) {
  const existing = await list(cookie, 'Price List', [['Price List', 'name', '=', sellingPriceListName]], ['name']);
  let created = false;
  if (!existing[0]) {
    await create(cookie, 'Price List', {
      price_list_name: sellingPriceListName,
      currency,
      selling: 1,
      buying: 0,
      enabled: 1,
    });
    created = true;
  } else {
    await update(cookie, 'Price List', sellingPriceListName, {
      currency,
      selling: 1,
      buying: 0,
      enabled: 1,
    });
  }
  const verified = await get(cookie, 'Price List', sellingPriceListName);
  if (verified.currency !== currency || Number(verified.selling || 0) !== 1 || Number(verified.enabled || 0) !== 1) {
    throw new Error(`Selling Price List ${sellingPriceListName} is not active in ${currency}`);
  }
  return { name: sellingPriceListName, currency, created };
}

async function ensureItem(cookie) {
  return ensureOne(cookie, 'Item', [['Item', 'item_code', '=', 'KEELESEPP-LESSON']], {
    item_code: 'KEELESEPP-LESSON',
    item_name: 'KeeleSepp lesson',
    item_group: 'All Item Groups',
    stock_uom: 'Nos',
    is_stock_item: 0,
    disabled: 0,
  });
}

const customFields = [
  ['Customer', 'custom_keelesepp_payer_id', 'KeeleSepp payer ID', 'Data', 1],
  ['Customer', 'custom_keelesepp_payer_email', 'KeeleSepp payer email', 'Data', 0],
  ['Sales Invoice', 'custom_keelesepp_billing_key', 'KeeleSepp billing key', 'Data', 1],
  ['Sales Invoice', 'custom_keelesepp_student_id', 'KeeleSepp student ID', 'Data', 0],
  ['Sales Invoice Item', 'custom_keelesepp_lesson_id', 'KeeleSepp lesson ID', 'Data', 0],
];

async function ensureCustomFields(cookie) {
  const results = [];
  for (const [dt, fieldname, label, fieldtype, unique] of customFields) {
    const result = await ensureOne(cookie, 'Custom Field', [
      ['Custom Field', 'dt', '=', dt],
      ['Custom Field', 'fieldname', '=', fieldname],
    ], {
      dt,
      fieldname,
      label,
      fieldtype,
      unique,
      no_copy: 1,
    });
    results.push({ dt, fieldname, ...result });
  }
  return results;
}

async function ensureIntegrationUser(cookie) {
  const requiredRoles = ['Accounts Manager', 'Accounts User', 'Sales Manager', 'Sales User'];
  const existing = await list(cookie, 'User', [['User', 'name', '=', integrationEmail]], ['name', 'api_key']);
  if (!existing[0]) {
    await create(cookie, 'User', {
      email: integrationEmail,
      first_name: 'KeeleSepp',
      last_name: 'Integration',
      enabled: 1,
      send_welcome_email: 0,
      user_type: 'System User',
      roles: requiredRoles.map((role) => ({ role })),
    });
  } else {
    const current = await get(cookie, 'User', integrationEmail);
    const currentRoles = new Set((current.roles || []).map((row) => row.role).filter(Boolean));
    const mergedRoles = [...new Set([...currentRoles, ...requiredRoles])];
    await update(cookie, 'User', integrationEmail, {
      enabled: 1,
      user_type: 'System User',
      roles: mergedRoles.map((role) => ({ role })),
    });
  }

  const verified = await get(cookie, 'User', integrationEmail);
  const verifiedRoles = new Set((verified.roles || []).map((row) => row.role).filter(Boolean));
  const missingRoles = requiredRoles.filter((role) => !verifiedRoles.has(role));
  if (missingRoles.length) throw new Error(`Integration user missing roles after update: ${missingRoles.join(', ')}`);

  const generated = await call(cookie, 'frappe.core.doctype.user.user.generate_keys', { user: integrationEmail });
  const user = await get(cookie, 'User', integrationEmail);
  const apiKey = generated?.api_key || user.api_key;
  const apiSecret = generated?.api_secret;
  if (!apiKey || !apiSecret) throw new Error('Frappe did not return integration API credentials');
  return { apiKey, apiSecret, roles: requiredRoles };
}

function writeEnv(credentials) {
  const entries = [
    ['FINANCE_PROVIDER', 'erpnext'],
    ['FRAPPE_BASE_URL', baseUrl],
    ['FRAPPE_API_KEY', credentials.apiKey],
    ['FRAPPE_API_SECRET', credentials.apiSecret],
    ['ERPNEXT_COMPANY', companyName],
    ['ERPNEXT_CUSTOMER_GROUP', customerGroupName],
    ['ERPNEXT_TERRITORY', territoryName],
    ['ERPNEXT_CURRENCY', currency],
    ['ERPNEXT_SELLING_PRICE_LIST', sellingPriceListName],
    ['ERPNEXT_LESSON_ITEM_CODE', 'KEELESEPP-LESSON'],
  ];
  const lines = entries.map(([key, value]) => `${key}=${shellQuote(value)}`);
  lines.push('');
  fs.writeFileSync(envFile, lines.join('\n'), { mode: 0o600 });
  fs.chmodSync(envFile, 0o600);
}

async function main() {
  const { cookie } = await login();
  const baseFixtures = await ensureBaseFixtures(cookie);
  const company = await ensureCompany(cookie);
  const fiscalYear = await ensureFiscalYear(cookie);
  const priceList = await ensureSellingPriceList(cookie);
  const item = await ensureItem(cookie);
  const fields = await ensureCustomFields(cookie);
  const credentials = await ensureIntegrationUser(cookie);
  writeEnv(credentials);

  console.log(JSON.stringify({
    ok: true,
    baseUrl,
    baseFixtures,
    company,
    fiscalYear,
    priceList,
    item,
    customFields: fields,
    integrationUser: integrationEmail,
    integrationRoles: credentials.roles,
    customerGroup: customerGroupName,
    territory: territoryName,
    currency,
    envFile,
  }, null, 2));
}

main().catch((error) => {
  console.error(`ERPNext staging provision failed: ${error.message}`);
  process.exitCode = 1;
});
