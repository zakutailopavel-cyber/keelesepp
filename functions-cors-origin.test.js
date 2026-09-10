const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

test("shared Functions CORS permits the production CRM origin", () => {
  const source = fs.readFileSync("functions/index.js", "utf8");
  const origins = source.match(/const DEFAULT_ALLOWED_ORIGINS = \[([\s\S]*?)\];/)?.[1] || "";

  assert.match(origins, /"https:\/\/crm\.epkoolitus\.ee"/);
});
