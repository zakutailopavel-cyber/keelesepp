"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const sharedSource = fs.readFileSync("haldus-shared.js", "utf8");
const crm = fs.readFileSync("haldus.html", "utf8");
const storageRules = fs.readFileSync("storage.rules", "utf8");
const context = { window: {} };
vm.runInNewContext(sharedSource, context);

const {
  uploadContentType,
  uploadContentTypeAllowed,
  validateUploadFile,
  uploadErrorGuidance,
} = context.window.HaldusShared;

test("homework files receive a Storage-compatible MIME type", () => {
  assert.equal(uploadContentType({ name: "Kohad linnas.png", type: "image/png" }), "image/png");
  assert.equal(uploadContentType({ name: "tööleht.docx", type: "" }), "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  assert.equal(uploadContentType({ name: "vastus.webm", type: "application/octet-stream" }), "audio/webm");
  assert.equal(uploadContentTypeAllowed("image/png"), true);
  assert.equal(uploadContentTypeAllowed("audio/webm"), true);
  assert.equal(uploadContentTypeAllowed("application/zip"), false);
});

test("homework file validation rejects empty, oversized, and unsupported files", () => {
  assert.equal(validateUploadFile({ name: "image.png", type: "image/png", size: 1024 }).ok, true);
  assert.match(validateUploadFile({ name: "empty.png", type: "image/png", size: 0 }).error, /tühi/);
  assert.match(validateUploadFile({ name: "large.png", type: "image/png", size: 20 * 1024 * 1024 }).error, /20 MB/);
  assert.match(validateUploadFile({ name: "archive.zip", type: "application/zip", size: 1024 }).error, /ei toetata/);
  assert.match(uploadErrorGuidance({ code: "storage/unauthorized" }, "image.png"), /õiguste tõttu/);
});

test("Storage rules match complete common MIME values instead of only their prefix", () => {
  assert.match(storageRules, /image\/\.\*/);
  assert.match(storageRules, /audio\/\.\*/);
  assert.equal(storageRules.includes("application/vnd\\\\..*"), true);
  assert.doesNotMatch(storageRules, /contentType\.matches\('\^audio\/'\)/);
});

test("homework creation is all-or-nothing when one attachment fails", () => {
  assert.match(crm, /Promise\.allSettled\(checkedFiles\.map/);
  assert.match(crm, /if\(failed\)[\s\S]*throw error/);
  assert.match(crm, /if\(!homeworkSaved&&uploaded\.length&&storage\)/);
  assert.match(crm, /await ref\.set\(\{/);
  assert.match(crm, /Kodutöö saadetud \$\{uploaded\.length\} failiga/);
  assert.match(crm, /disabled=\{hwBusy\}/);
});
