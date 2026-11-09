"use strict";

// Pangapõhine raamatupidamine — Firestore side (docs/ACCOUNTING.md „Pangapõhine raamatupidamine”). The pure rules are in
// bank-statement-core.js (parsing, matching, rules) and accounting-core.js (what the books take). Only financeApi
// (administrator) calls this. Nothing here writes accountingEntries: the sync (Raamatupidamine) makes the entries from
// the linked payments and the categorised lines.
//
// Collections (admin read, no client writes — firestore.rules):
// - bankStatementLines/{lineId}: every line of the company account's statement (incoming and outgoing), once;
// - bankStatementImports/{requestId}: one imported file (name, period, counts, who);
// - bankRules/{ruleId}: the accountant's categorisation rules;
// - bankStatementBalances/{yyyy-mm}: the closing balance of the month from the bank (typed by the accountant).

const core = require("./bank-statement-core");

const MAX_CSV_LENGTH = 3_000_000;
const OPEN_STATES = new Set(["new", "review", "unmatched"]);

function createBankStatementService({ db, httpError, actorSnapshot, cleanRequestId, allocateBankTransaction, assertAccountingDatesOpen, readAccountingLock, accountingAccounts }) {
  const lines = () => db.collection("bankStatementLines");
  const withIds = (snap) => snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const all = async (name) => withIds(await db.collection(name).get());
  const centsToAmount = (cents) => Math.round(Number(cents || 0)) / 100;

  // everything the matcher needs (the collections are small: a school's invoices, payments and bank lines)
  async function matchContext() {
    const [allInvoices, payments, bankTransactions, purchaseInvoices, refunds, statementLines, rules] = await Promise.all(
      ["invoices", "payments", "bankTransactions", "purchaseInvoices", "refunds", "bankStatementLines", "bankRules"].map(all),
    );
    // the company account's lines are matched only to company invoices (FIE invoices: the owner's own account)
    const invoices = allInvoices.filter((invoice) => invoice.issuer !== "fie");
    const taken = new Set();
    statementLines.forEach((line) => {
      (line.paymentIds || []).forEach((id) => taken.add(id));
      if (line.purchase) taken.add(`${line.purchase.invoiceId}:${line.purchase.paymentId}`);
      if (line.refundId) taken.add(`refund:${line.refundId}`);
    });
    payments.forEach((p) => { if (p.bankStatementLineId) taken.add(p.id); });
    return {
      invoices, payments, bankTransactions, purchaseInvoices, refunds, statementLines,
      rules: rules.filter((rule) => rule.active !== false),
      memory: core.payerMemory({ bankTransactions, payments, lines: statementLines }),
      takenPaymentIds: taken,
    };
  }

  const linkFields = (actorData, nowIso) => ({ linkedAt: nowIso, linkedBy: actorData });

  // a sure or confirmed match → the CRM payment(s) and the line's link. Returns the line patch.
  async function execute(line, match, actor) {
    const actorData = actorSnapshot(actor);
    const nowIso = new Date().toISOString();
    const lineRef = lines().doc(line.id);
    if (match.kind === "allocate") {
      const allocations = (match.allocations || []).filter((a) => a.amountCents > 0).map((a) => ({ invoiceId: a.invoiceId, amount: centsToAmount(a.amountCents) }));
      const result = await allocateBankTransaction({
        actor,
        requestId: `stmt_${core.safeId(line.id)}`.slice(0, 120),
        externalId: line.archiveId || line.transactionRef,
        paidAt: line.date,
        payerName: line.counterpartyName,
        payerAccount: line.counterpartyAccount,
        creditStudentId: match.creditStudentId || "",
        reference: line.explanation,
        amount: centsToAmount(line.amountCents),
        allocations,
        lessonAllocations: [],
        note: `LHV väljavõte ${line.date}`,
      });
      const txId = result.bankTransaction.id;
      const paymentIds = result.paymentIds || (await db.collection("payments").where("bankTransactionId", "==", txId).get()).docs.map((d) => d.id);
      const creditSnap = await db.collection("payerCredits").doc(txId).get();
      const creditIds = creditSnap.exists ? [txId] : [];
      const patch = { state: "matched", match: { ...match, executedAt: nowIso }, bankTransactionId: txId, paymentIds, creditIds, entryKeys: core.entryKeysOf({ paymentIds, creditIds }), ...linkFields(actorData, nowIso) };
      await lineRef.set(patch, { merge: true });
      await db.collection("bankTransactions").doc(txId).set({ statementLineId: line.id }, { merge: true });
      return patch;
    }
    return db.runTransaction(async (transaction) => {
      const current = await transaction.get(lineRef);
      if (!current.exists) throw httpError(404, "Pangarida ei leitud.");
      const state = current.data().state;
      if (state === "matched" || state === "categorized") throw httpError(409, "Pangarida on juba seotud või kirjendatud.");
      let patch;
      if (match.kind === "bankTransaction") {
        const txRef = db.collection("bankTransactions").doc(String(match.bankTransactionId));
        const [tx, payments, credit] = await Promise.all([transaction.get(txRef), transaction.get(db.collection("payments").where("bankTransactionId", "==", txRef.id)), transaction.get(db.collection("payerCredits").doc(txRef.id))]);
        if (!tx.exists) throw httpError(404, "Pangatehingut ei leitud.");
        const paymentIds = payments.docs.map((d) => d.id);
        const creditIds = credit.exists ? [credit.id] : [];
        patch = { state: "matched", match, bankTransactionId: tx.id, paymentIds, creditIds, entryKeys: core.entryKeysOf({ paymentIds, creditIds }), ...linkFields(actorData, nowIso) };
        transaction.set(txRef, { statementLineId: line.id }, { merge: true });
      } else if (match.kind === "payments") {
        const refs = (match.paymentIds || []).map((id) => db.collection("payments").doc(String(id)));
        if (!refs.length) throw httpError(400, "Vali makse.");
        const snaps = await Promise.all(refs.map((ref) => transaction.get(ref)));
        snaps.forEach((snap) => {
          if (!snap.exists) throw httpError(404, `Makset ${snap.id} ei leitud.`);
          const p = snap.data();
          if (p.status === "voided" || p.status === "void") throw httpError(409, `Makse ${snap.id} on tühistatud.`);
          if (p.bankStatementLineId && p.bankStatementLineId !== line.id) throw httpError(409, `Makse ${snap.id} on juba seotud teise pangareaga.`);
        });
        snaps.forEach((snap) => transaction.set(snap.ref, { bankStatementLineId: line.id, bankDate: line.date, bankLinkedAt: nowIso, bankLinkedBy: actorData }, { merge: true }));
        const paymentIds = snaps.map((s) => s.id);
        patch = { state: "matched", match, paymentIds, creditIds: [], entryKeys: core.entryKeysOf({ paymentIds }), ...linkFields(actorData, nowIso) };
      } else if (match.kind === "purchasePayment") {
        const ref = db.collection("purchaseInvoices").doc(String(match.purchaseInvoiceId));
        const snap = await transaction.get(ref);
        if (!snap.exists) throw httpError(404, "Ostuarvet ei leitud.");
        const list = Array.isArray(snap.data().payments) ? snap.data().payments : [];
        const index = list.findIndex((p) => p.id === match.purchasePaymentId);
        if (index < 0) throw httpError(404, "Ostuarve makset ei leitud.");
        if (list[index].bankStatementLineId && list[index].bankStatementLineId !== line.id) throw httpError(409, "Ostuarve makse on juba seotud teise pangareaga.");
        transaction.update(ref, { payments: list.map((p, i) => (i === index ? { ...p, bankStatementLineId: line.id, bankDate: line.date } : p)) });
        const purchase = { invoiceId: ref.id, paymentId: match.purchasePaymentId };
        patch = { state: "matched", match, purchase, paymentIds: [], creditIds: [], entryKeys: core.entryKeysOf({ purchase }), ...linkFields(actorData, nowIso) };
      } else if (match.kind === "refund") {
        const ref = db.collection("refunds").doc(String(match.refundId));
        const snap = await transaction.get(ref);
        if (!snap.exists) throw httpError(404, "Tagastust ei leitud.");
        if (snap.data().bankStatementLineId && snap.data().bankStatementLineId !== line.id) throw httpError(409, "Tagastus on juba seotud teise pangareaga.");
        transaction.set(ref, { bankStatementLineId: line.id, bankDate: line.date }, { merge: true });
        patch = { state: "matched", match, refundId: ref.id, paymentIds: [], creditIds: [], entryKeys: core.entryKeysOf({ refundId: ref.id }), ...linkFields(actorData, nowIso) };
      } else {
        throw httpError(400, "Sellele reale ei ole vastet.");
      }
      transaction.set(lineRef, patch, { merge: true });
      return patch;
    });
  }

  // a categorised line (by the accountant or a rule): the sync books it D 1010 / K account (in) or D account / K 1010 (out)
  async function categorizeInTransaction(transaction, lineRef, { account, label, note, ruleId, actorData, nowIso, lockedThrough }) {
    const snap = await transaction.get(lineRef);
    if (!snap.exists) throw httpError(404, "Pangarida ei leitud.");
    const line = { id: snap.id, ...snap.data() };
    if (!OPEN_STATES.has(line.state)) throw httpError(409, "Pangarida on juba seotud või kirjendatud.");
    await assertAccountingDatesOpen(transaction, [line.date], lockedThrough);
    const version = (Number(line.categoryVersion) || 0) + 1;
    const category = { account, label, note: note || "", ruleId: ruleId || "", by: actorData, at: nowIso, sourceKey: version > 1 ? `bank-line:${line.id}~${version}` : `bank-line:${line.id}` };
    transaction.set(lineRef, { state: "categorized", category, categoryVersion: version, entryKeys: [category.sourceKey], updatedAt: nowIso }, { merge: true });
    return { id: line.id, category };
  }

  async function categoryAccount(code) {
    const account = String(code || "").trim();
    if (!/^\d{4}$/.test(account)) throw httpError(400, "Vali konto.");
    if (account === core.BANK_ACCOUNT) throw httpError(400, "Pangarida ei kirjendata kontole 1010 iseendale.");
    const found = (await accountingAccounts()).find((a) => String(a.code) === account);
    if (!found) throw httpError(400, `Kontot ${account} pole kontoplaanis.`);
    if (found.active === false) throw httpError(400, `Konto ${account} on suletud.`);
    return found;
  }

  // the lines still open (new, review, unmatched): match again, execute the sure ones, categorise by the rules
  async function processLines(lineIds, actor) {
    const ctx = await matchContext();
    const byId = new Map(ctx.statementLines.map((line) => [line.id, line]));
    const summary = { matched: 0, review: 0, categorized: 0, unmatched: 0, errors: [] };
    const lockedThrough = await readAccountingLock();
    const actorData = actorSnapshot(actor);
    for (const id of lineIds) {
      const line = byId.get(id);
      if (!line || !OPEN_STATES.has(line.state)) continue;
      const match = core.matchLine(line, ctx);
      if (match.confidence === "sure") {
        try {
          const patch = await execute(line, match, actor);
          (patch.paymentIds || []).forEach((pid) => ctx.takenPaymentIds.add(pid));
          if (patch.purchase) ctx.takenPaymentIds.add(`${patch.purchase.invoiceId}:${patch.purchase.paymentId}`);
          if (patch.refundId) ctx.takenPaymentIds.add(`refund:${patch.refundId}`);
          // the invoices' balances changed: later lines of the file see the new balance
          if (match.kind === "allocate") match.allocations.forEach((a) => { const inv = ctx.invoices.find((i) => i.id === a.invoiceId); if (inv) inv.balanceDueCents = Math.max(0, core.invoiceBalanceCents(inv) - a.amountCents); });
          summary.matched += 1;
          continue;
        } catch (error) {
          summary.errors.push(`${line.date} ${line.counterpartyName}: ${error.message}`);
          await lines().doc(id).set({ state: "review", match: { ...match, confidence: "likely", error: String(error.message || "").slice(0, 200) }, updatedAt: new Date().toISOString() }, { merge: true });
          summary.review += 1;
          continue;
        }
      }
      if (match.confidence === "likely") {
        if (match.paymentIds) match.paymentIds.forEach((pid) => ctx.takenPaymentIds.add(pid));
        await lines().doc(id).set({ state: "review", match, updatedAt: new Date().toISOString() }, { merge: true });
        summary.review += 1;
        continue;
      }
      const rule = core.ruleFor(line, ctx.rules);
      if (rule) {
        try {
          const nowIso = new Date().toISOString();
          await db.runTransaction((transaction) => categorizeInTransaction(transaction, lines().doc(id), { account: rule.account, label: rule.label, note: "", ruleId: rule.id, actorData, nowIso, lockedThrough }));
          summary.categorized += 1;
          continue;
        } catch (error) {
          summary.errors.push(`${line.date} ${line.counterpartyName}: ${error.message}`);
        }
      }
      await lines().doc(id).set({ state: "unmatched", match, updatedAt: new Date().toISOString() }, { merge: true });
      summary.unmatched += 1;
    }
    return summary;
  }

  async function importStatement({ actor, csv, fileName, requestId }) {
    const mutationId = cleanRequestId(requestId);
    const text = String(csv || "");
    if (!text.trim()) throw httpError(400, "Fail on tühi.");
    if (text.length > MAX_CSV_LENGTH) throw httpError(400, "Fail on liiga suur (kuni 3 MB).");
    const importRef = db.collection("bankStatementImports").doc(mutationId);
    const done = await importRef.get();
    if (done.exists) return { ...done.data(), id: done.id, idempotent: true };
    const parsed = core.parseStatement(text);
    if (!parsed.lines.length) throw httpError(400, parsed.errors[0] || "Failis ei ole pangaridu.");
    const foreign = parsed.accountIbans.filter((iban) => !core.COMPANY_ACCOUNTS.includes(iban));
    if (foreign.length) throw httpError(400, `Väljavõte on konto ${foreign.join(", ")} oma. Raamatupidamisse käib ainult ettevõtte konto ${core.COMPANY_ACCOUNTS.join(", ")}.`);
    if (!parsed.accountIbans.length) throw httpError(400, "Väljavõttel ei ole kliendi konto veergu (LHV „Kliendi konto”).");

    // idempotent: a line is stored once (its id, or the same bank reference / archive code under another id)
    const existing = await all("bankStatementLines");
    const known = new Set(existing.map((line) => line.id));
    existing.forEach((line) => { if (line.transactionRef) known.add(`ref:${line.transactionRef}`); if (line.archiveId) known.add(`arch:${line.archiveId}`); });
    const isKnown = (line) => known.has(line.id) || (line.transactionRef && known.has(`ref:${line.transactionRef}`)) || (!line.transactionRef && line.archiveId && known.has(`arch:${line.archiveId}`));
    const fresh = parsed.lines.filter((line) => !isKnown(line));
    const nowIso = new Date().toISOString();
    const actorData = actorSnapshot(actor);
    for (let i = 0; i < fresh.length; i += 400) {
      const batch = db.batch();
      fresh.slice(i, i + 400).forEach((line) => {
        const { sourceLine, ...record } = line;
        batch.create(lines().doc(line.id), { ...record, sourceLine, state: "new", importId: mutationId, importedAt: nowIso, importedBy: actorData, paymentIds: [], creditIds: [], entryKeys: [] });
      });
      await batch.commit();
    }
    // the lines of this file that are still open: the new ones and the earlier ones without a decision
    const fileIds = new Set(parsed.lines.map((line) => line.id));
    const toProcess = [...fresh.map((l) => l.id), ...existing.filter((l) => fileIds.has(l.id) && (l.state === "unmatched" || l.state === "new")).map((l) => l.id)];
    const summary = await processLines(toProcess, actor);
    const dates = parsed.lines.map((l) => l.date).sort();
    const record = {
      fileName: String(fileName || "").slice(0, 200),
      accountIban: parsed.accountIbans[0],
      from: dates[0], to: dates.at(-1),
      lines: parsed.lines.length, imported: fresh.length, duplicates: parsed.lines.length - fresh.length,
      incoming: parsed.lines.filter((l) => l.direction === "C").length, outgoing: parsed.lines.filter((l) => l.direction === "D").length,
      ...summary, errors: [...parsed.errors, ...summary.errors].slice(0, 50),
      createdAt: nowIso, createdBy: actorData,
    };
    await importRef.set(record);
    await db.collection("financialAudit").doc(`bank-import_${mutationId}`).set({ entityType: "bankStatement", entityId: mutationId, action: "bank_statement.imported", ...record });
    return { id: mutationId, ...record, idempotent: false };
  }

  async function readLine(lineId) {
    const id = String(lineId || "").trim();
    if (!/^[A-Za-z0-9_-]{3,160}$/.test(id)) throw httpError(400, "lineId required");
    const snap = await lines().doc(id).get();
    if (!snap.exists) throw httpError(404, "Pangarida ei leitud.");
    return { id: snap.id, ...snap.data() };
  }

  // „Kinnita”: the suggestion as it is, or a choice of the person (invoices to pay, payments to link, an advance)
  async function confirmLine({ actor, lineId, choice, requestId }) {
    cleanRequestId(requestId);
    const line = await readLine(lineId);
    if (!OPEN_STATES.has(line.state)) throw httpError(409, "Pangarida on juba seotud või kirjendatud.");
    let match = line.match;
    if (choice && typeof choice === "object") {
      if (line.direction !== "C") throw httpError(400, "Väljamakse seotakse ostuarvega Ostuarvetes või kirjendatakse kategooriaga.");
      if (Array.isArray(choice.paymentIds) && choice.paymentIds.length) {
        match = { kind: "payments", confidence: "manual", reason: "valitud käsitsi", paymentIds: choice.paymentIds.map(String).slice(0, 20) };
      } else {
        const allocations = (Array.isArray(choice.allocations) ? choice.allocations : []).map((a) => ({ invoiceId: String(a?.invoiceId || ""), amountCents: Math.round(Number(a?.amountCents) || 0) })).filter((a) => a.invoiceId && a.amountCents > 0).slice(0, 20);
        const total = allocations.reduce((n, a) => n + a.amountCents, 0);
        if (total > line.amountCents) throw httpError(400, "Arvetele jaotatud summa on suurem kui pangarida.");
        const creditStudentId = String(choice.creditStudentId || "").trim();
        if (total < line.amountCents && !creditStudentId) throw httpError(400, "Ülejäänud summa jaoks vali õpilane (ettemaks).");
        match = { kind: "allocate", confidence: "manual", reason: "valitud käsitsi", allocations, creditStudentId };
      }
    }
    if (!match || match.kind === "none") throw httpError(400, "Sellele reale ei ole soovitust. Vali arve või kirjenda kategooriaga.");
    const patch = await execute(line, { ...match, confirmedBy: actorSnapshot(actor), confirmedAt: new Date().toISOString() }, actor);
    return { line: { ...line, ...patch } };
  }

  // „Pole see”: the suggestion is wrong; the line waits for a category or a choice
  async function dismissLine({ lineId }) {
    const line = await readLine(lineId);
    if (line.state !== "review") throw httpError(409, "Real ei ole soovitust.");
    await lines().doc(line.id).set({ state: "unmatched", match: { kind: "none", confidence: "none", reason: "soovitus tagasi lükatud", dismissed: line.match || null }, updatedAt: new Date().toISOString() }, { merge: true });
    return { lineId: line.id };
  }

  async function categorizeLine({ actor, lineId, account, label, note, rule, requestId }) {
    const mutationId = cleanRequestId(requestId);
    const line = await readLine(lineId);
    const found = await categoryAccount(account);
    const cleanLabel = String(label || found.name || "").replace(/\s+/g, " ").trim().slice(0, 80);
    const actorData = actorSnapshot(actor);
    const nowIso = new Date().toISOString();
    const lockedThrough = await readAccountingLock();
    const result = await db.runTransaction((transaction) => categorizeInTransaction(transaction, lines().doc(line.id), { account: found.code, label: cleanLabel, note: String(note || "").slice(0, 200), ruleId: "", actorData, nowIso, lockedThrough }));
    let savedRule = null;
    let applied = 0;
    if (rule && typeof rule === "object") {
      let cleanRule;
      try {
        cleanRule = core.cleanRule({ ...rule, direction: line.direction, account: found.code, label: cleanLabel });
      } catch (error) {
        throw httpError(error.status || 400, error.message);
      }
      const ruleRef = db.collection("bankRules").doc(`rule_${mutationId}`);
      savedRule = { id: ruleRef.id, ...cleanRule, createdAt: nowIso, createdBy: actorData, fromLineId: line.id };
      await ruleRef.set(savedRule);
      // the same rule on the other open lines now
      const open = (await all("bankStatementLines")).filter((l) => l.state === "unmatched" && l.id !== line.id && core.ruleFor(l, [savedRule]));
      for (const other of open) {
        try {
          await db.runTransaction((transaction) => categorizeInTransaction(transaction, lines().doc(other.id), { account: found.code, label: cleanLabel, note: "", ruleId: ruleRef.id, actorData, nowIso, lockedThrough }));
          applied += 1;
        } catch { /* a locked date: stays open */ }
      }
    }
    await db.collection("financialAudit").doc(`bank-category_${mutationId}`).set({ entityType: "bankStatementLine", entityId: line.id, action: "bank_line.categorized", account: found.code, label: cleanLabel, ruleId: savedRule?.id || "", appliedToOthers: applied, createdAt: nowIso, createdBy: actorData });
    return { line: { ...line, state: "categorized", category: result.category }, rule: savedRule, appliedToOthers: applied };
  }

  // back to open; refused while the line's entry is live in the päevaraamat (delete it there first — RPS § 10 history)
  async function uncategorizeLine({ actor, lineId, reason }) {
    const cleanReason = String(reason || "").replace(/\s+/g, " ").trim();
    if (!cleanReason) throw httpError(400, "Põhjus on kohustuslik.");
    const line = await readLine(lineId);
    if (line.state !== "categorized") throw httpError(409, "Rida ei ole kirjendatud.");
    const key = line.category?.sourceKey || `bank-line:${line.id}`;
    const entry = await db.collection("accountingEntries").doc(`auto_${key.replace(/[^A-Za-z0-9_-]/g, "_")}`).get();
    if (entry.exists && !entry.get("deleted")) throw httpError(409, `Kanne ${entry.get("number") || ""} on päevaraamatus. Kustuta see enne päevaraamatus (Kustuta), siis tühista kategooria.`);
    const nowIso = new Date().toISOString();
    const history = [...(Array.isArray(line.categoryHistory) ? line.categoryHistory : []), { ...line.category, removedAt: nowIso, removedBy: actorSnapshot(actor), reason: cleanReason }];
    await lines().doc(line.id).set({ state: "unmatched", category: null, categoryHistory: history, entryKeys: [], updatedAt: nowIso }, { merge: true });
    return { lineId: line.id };
  }

  async function saveRule({ actor, ruleId, rule }) {
    let clean;
    try {
      clean = core.cleanRule(rule || {});
    } catch (error) {
      throw httpError(error.status || 400, error.message);
    }
    await categoryAccount(clean.account);
    const nowIso = new Date().toISOString();
    const id = String(ruleId || "").trim();
    const ref = id ? db.collection("bankRules").doc(id) : db.collection("bankRules").doc();
    if (id && !(await ref.get()).exists) throw httpError(404, "Reeglit ei leitud.");
    await ref.set({ ...clean, updatedAt: nowIso, updatedBy: actorSnapshot(actor), ...(id ? {} : { createdAt: nowIso, createdBy: actorSnapshot(actor) }) }, { merge: true });
    return { rule: { id: ref.id, ...clean } };
  }

  // the bank's closing balance of a month (from the LHV statement page): the month check compares it with 1010
  async function setClosingBalance({ actor, month, closingCents }) {
    const key = String(month || "");
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(key)) throw httpError(400, "Kuu peab olema kujul AAAA-KK.");
    const cents = Math.round(Number(closingCents));
    if (!Number.isFinite(cents) || Math.abs(cents) > 1e11) throw httpError(400, "Lõppsaldo on vigane.");
    const record = { month: key, accountIban: core.COMPANY_ACCOUNTS[0], closingCents: cents, updatedAt: new Date().toISOString(), updatedBy: actorSnapshot(actor) };
    await db.collection("bankStatementBalances").doc(key).set(record);
    return { balance: record };
  }

  // re-run the matcher on every open line (after new invoices or payments were added in the CRM)
  async function rematch({ actor }) {
    const open = (await all("bankStatementLines")).filter((l) => OPEN_STATES.has(l.state)).map((l) => l.id);
    return processLines(open, actor);
  }

  return { importStatement, confirmLine, dismissLine, categorizeLine, uncategorizeLine, saveRule, setClosingBalance, rematch, processLines };
}

module.exports = { createBankStatementService, MAX_CSV_LENGTH };
