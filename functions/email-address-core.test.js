const test = require("node:test");
const assert = require("node:assert/strict");
const { isPlaceholderEmail, realRecipients } = require("./email-address-core");

test("made-up addresses are caught, real ones pass", () => {
  for (const email of ["123@123.com", "test@test.ee", "a@a.com", "mari@example.com", "noemail@gmail.com", "ema@1.ee"]) assert.equal(isPlaceholderEmail(email), true, email);
  for (const email of ["mari.tamm@gmail.com", "info@epkoolitus.ee", "ema@mail.ee", "test.kasutaja@gmail.com", ""]) assert.equal(isPlaceholderEmail(email), false, email);
});

test("the made-up recipients are dropped, the shape is kept", () => {
  assert.deepEqual(realRecipients(["123@123.com", "ema@mail.ee"]), ["ema@mail.ee"]);
  assert.equal(realRecipients("123@123.com, ema@mail.ee"), "ema@mail.ee");
  assert.equal(realRecipients("123@123.com"), "");
});

test("deliverEmail sends nothing when every recipient is made up", async () => {
  const rewire = require("rewire");
  const api = rewire("./index.js");
  const result = await api.__get__("deliverEmail")({ to: ["123@123.com"], subject: "Uus kodutöö", html: "x", text: "x" }, { kind: "homework-parent" });
  assert.deepEqual(result, { status: "skipped", reason: "placeholder-recipient" });
});
