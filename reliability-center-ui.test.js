"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync("haldus.html", "utf8");
const backend = fs.readFileSync("functions/index.js", "utf8");
const rules = fs.readFileSync("firestore.rules", "utf8");

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

test("ambiguous registrations enter the reliability queue instead of creating a duplicate", () => {
  assert.match(backend, /req\.path === "\/accounts\/bootstrap"/);
  assert.match(backend, /accountLinkReviews/);
  assert.match(backend, /pendingAccountReviews/);
  assert.match(html, /Uue registreerimise vaste vajab kinnitamist/);
  assert.match(html, /Süsteem ei loonud kahtlast uut õpilasekaarti/);
  assert.match(rules, /allow create: if isAdmin\(\) \|\| teacherCanCreate\(request\.resource\.data\)/);
  assert.doesNotMatch(rules, /createsOwnStudent/);
  assert.match(backend, /req\.path === "\/accounts\/bootstrap-admin"/);
});

const component = html.slice(
  html.indexOf("function DataQualityView("),
  html.indexOf("const ADMIN_FINANCE_SECTIONS="),
);

test("reliability preview success still stores data and keeps the loading state for first paint", () => {
  assert.match(component, /try\{setData\(await staffOperationsApiPost\('\/data-quality\/preview',\{\}\)\);\}/);
  assert.match(component, /Kontrollin andmeid…/);
});

test("reliability preview failure renders an error card with retry instead of an infinite spinner", () => {
  assert.match(component, /const \[error,setError\]=React\.useState\(''\);/);
  assert.match(component, /catch\(error\)\{setError\(error\.message\|\|String\(error\)\);notify\(/);
  const errorGuard = component.indexOf("if(!data&&error) return");
  const spinnerGuard = component.indexOf("if(!data) return");
  assert.ok(errorGuard >= 0, "error state render must exist");
  assert.ok(spinnerGuard > errorGuard, "error card must render before the spinner guard");
  assert.match(component, /Proovi uuesti/);
});

test("retry re-runs the preview request and a success replaces the error state", () => {
  const errorCard = component.slice(component.indexOf("if(!data&&error) return"), component.indexOf("if(!data) return"));
  assert.match(errorCard, /onClick=\{refresh\}/);
  assert.match(component, /setBusy\('refresh'\);setError\(''\);/);
});
