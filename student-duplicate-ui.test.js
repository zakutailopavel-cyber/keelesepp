"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync("haldus.html", "utf8");
const shared = fs.readFileSync("haldus-shared.js", "utf8");
const functionsSource = fs.readFileSync("functions/index.js", "utf8");

test("student list detects explained short/full-name duplicates without auto-merging them", () => {
  assert.match(shared, /const duplicateStudentGroups = students =>/);
  assert.match(shared, /Lühike ja täielik nimekuju/);
  assert.match(html, /Tugev vaste/);
  assert.match(html, /Tõenäoline/);
  assert.match(html, /Kontrolli ja ühenda/);
});

test("new student creation warns about probable duplicates and records an explicit override", () => {
  assert.match(html, /Võimalik duplikaat/);
  assert.match(html, /duplicateCreationOverride:possibleStudents\.length>0/);
  assert.match(html, /potentialDuplicateIds:possibleStudents\.map/);
});

test("student registration links by stable UID, card id, or unique email but never by name alone", () => {
  const registration = html.slice(html.indexOf("const register = async()=>"), html.indexOf("const forgot = async()=>"));
  assert.match(registration, /accountLinkSource:'student-card-id'/);
  assert.match(registration, /await ensureStudentRecord\(res\.user, ud\)/);
  assert.doesNotMatch(registration, /where\('name','=='/);
  assert.match(shared, /accountLinkSource:'exact-email'/);
});

test("protected merge preview exposes preserved aliases and profile conflicts", () => {
  assert.match(functionsSource, /preservedProfileCount: profileData\.snapshots\.length/);
  assert.match(functionsSource, /profileConflicts: profileData\.conflicts/);
  assert.match(functionsSource, /\.\.\.plan\.profileData\.patch/);
  assert.match(html, /Säilitatavad nimekujud/);
  assert.match(html, /säilitatakse põhikaardi ühendamisajaloos/);
});
