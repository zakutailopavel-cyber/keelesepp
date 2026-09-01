"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync("haldus.html", "utf8");
const backend = fs.readFileSync("functions/index.js", "utf8");

test("administrator has one top-level CRM reliability center", () => {
  assert.match(html, /id:'reliability',icon:'fa-heart-pulse',label:'Töökindlus'/);
  assert.match(html, /tab==='reliability'&&isAdmin&&<DataQualityView notify=\{notify\} standalone\/>/);
  assert.match(html, /standalone\?'CRM töökindlus':'Andmete parandamine'/);
  assert.match(html, /Süsteemi seisund/);
  assert.match(html, /Kriitilised \{criticalIssueCount\}/);
  assert.match(html, /Otsi probleemi nime, õpilase, e-posti või ID järgi/);
});

test("reliability center includes orphan learning work and account conflicts", () => {
  assert.match(html, /Sidumata kodutööd/);
  assert.match(html, /Sidumata töölehtede määramised/);
  assert.match(html, /Üks õpilase konto on seotud mitme kaardiga/);
  assert.match(html, /Kontoviited vajavad käsitsi kontrolli/);
  assert.match(backend, /db\.collection\("homework"\)\.get\(\)/);
  assert.match(backend, /db\.collection\("worksheetAssignments"\)\.get\(\)/);
  assert.match(backend, /classifyAccountIntegrity/);
  assert.match(backend, /homework: "homework"/);
  assert.match(backend, /worksheetAssignment: "worksheetAssignments"/);
});

test("new reliability repairs still use exact protected ids and audit", () => {
  assert.match(html, /staffOperationsApiPost\('\/data-quality\/relink'/);
  assert.match(html, /requestId:financeRequestId\('datarelink'\)/);
  assert.match(backend, /if \(!cleanEntityId \|\| !cleanStudentId\) throw httpError\(400, "Exact entity and student IDs required"\)/);
  assert.match(backend, /transaction\.create\(auditRef/);
  assert.match(html, /Neid viiteid ei eemaldata automaatselt/);
});
