"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { originAllowed } = require("./cors-origin-core");

test("accepts configured origins", () => {
  assert.equal(originAllowed("https://crm.epkoolitus.ee", ["https://crm.epkoolitus.ee"]), true);
});

test("accepts KeeleSepp CRM Vercel project aliases", () => {
  assert.equal(originAllowed("https://keelesepp-crm-v2-zakutailopavel-cybers-projects.vercel.app"), true);
  assert.equal(originAllowed("https://keelesepp-crm-v2-git-main-zakutailopavel-cybers-projects.vercel.app"), true);
  assert.equal(originAllowed("https://keelesepp-crm-v2-3ncmm97b8-zakutailopavel-cybers-projects.vercel.app"), true);
});

test("rejects lookalike and unrelated Vercel origins", () => {
  assert.equal(originAllowed("https://keelesepp-crm-v2-evil-zakutailopavel-cybers-projects.vercel.app.evil.example"), false);
  assert.equal(originAllowed("https://other-project-zakutailopavel-cybers-projects.vercel.app"), false);
  assert.equal(originAllowed("https://example.com"), false);
});
