"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { parentProfileInput, cardPatch } = require("./parent-profile-core");

test("name and a valid e-mail are required; the e-mail is lower-cased", () => {
  assert.deepEqual(parentProfileInput({ displayName: "  Mari  Maasikas ", email: "Mari@Example.EE", phone: " 5555 " }), { displayName: "Mari Maasikas", email: "mari@example.ee", phone: "5555" });
  assert.throws(() => parentProfileInput({ displayName: "", email: "a@b.ee" }), { status: 400 });
  assert.throws(() => parentProfileInput({ displayName: "Mari", email: "mari" }), { status: 400 });
});

test("a child's card follows the parent where it still shows the old value or nothing", () => {
  const before = { displayName: "Elena Polischuk", email: "old@example.ee" };
  const next = { displayName: "Olena Polishchuk", email: "new@example.ee" };
  assert.deepEqual(cardPatch({ parentName: "Elena Polischuk", parentEmail: "OLD@example.ee", payerEmail: "old@example.ee" }, before, next), { parentName: "Olena Polishchuk", parentEmail: "new@example.ee", payerEmail: "new@example.ee" });
  assert.deepEqual(cardPatch({}, before, next), { parentName: "Olena Polishchuk", parentEmail: "new@example.ee" });
});

test("a card naming someone else (the other parent, a payer) keeps it", () => {
  const before = { displayName: "Mari", email: "mari@example.ee" };
  const next = { displayName: "Mari Tamm", email: "mari.tamm@example.ee" };
  assert.deepEqual(cardPatch({ parentName: "Jüri", parentEmail: "jyri@example.ee", payerEmail: "firma@example.ee" }, before, next), {});
});
