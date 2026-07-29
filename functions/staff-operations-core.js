"use strict";

const MINUTE_MS = 60 * 1000;
const MAX_SHIFT_MINUTES = 24 * 60;

function asDate(value, label = "date") {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(String(value || ""));
  if (Number.isNaN(date.getTime())) throw new Error(`Valid ${label} required`);
  return date;
}

function nonNegativeInteger(value, label, max = MAX_SHIFT_MINUTES) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > max) {
    throw new Error(`${label} must be an integer between 0 and ${max}`);
  }
  return parsed;
}

function hourlyRateCents(value, { allowZero = false } = {}) {
  const normalized = String(value ?? "").trim().replace(",", ".");
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
    throw new Error("Valid hourly rate required");
  }
  const cents = Math.round(Number(normalized) * 100);
  if ((!allowZero && cents <= 0) || cents < 0 || cents > 100000) {
    throw new Error("Hourly rate must be between 0 and 1000 euros");
  }
  return cents;
}

function workDurationMinutes(session, now = new Date()) {
  const started = asDate(session?.startedAt, "start time");
  const ended = session?.endedAt ? asDate(session.endedAt, "end time") : asDate(now, "current time");
  const elapsed = Math.floor((ended.getTime() - started.getTime()) / MINUTE_MS);
  if (elapsed < 0) throw new Error("End time must be after start time");
  if (elapsed > MAX_SHIFT_MINUTES) throw new Error("Shift cannot exceed 24 hours");
  const breakMinutes = nonNegativeInteger(session?.breakMinutes || 0, "Break minutes");
  if (breakMinutes > elapsed) throw new Error("Break cannot exceed shift duration");
  return elapsed - breakMinutes;
}

function payAmountCents(durationMinutes, rateCents) {
  const minutes = nonNegativeInteger(durationMinutes, "Duration minutes");
  const rate = nonNegativeInteger(rateCents, "Hourly rate cents", 100000);
  return Math.round((minutes * rate) / 60);
}

function activityEstimateMinutes(logs, { idleCapMinutes = 15, singleEventMinutes = 5 } = {}) {
  const cap = nonNegativeInteger(idleCapMinutes, "Idle cap minutes", 120);
  const terminal = nonNegativeInteger(singleEventMinutes, "Single event minutes", 60);
  const grouped = new Map();
  (Array.isArray(logs) ? logs : []).forEach(item => {
    if (!item?.byUid || !item?.createdAt) return;
    const date = new Date(item.createdAt);
    if (Number.isNaN(date.getTime())) return;
    const day = String(item.date || item.createdAt).slice(0, 10);
    const key = `${item.byUid}:${day}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(date.getTime());
  });

  let total = 0;
  grouped.forEach(times => {
    times.sort((a, b) => a - b);
    if (!times.length) return;
    total += terminal;
    for (let index = 1; index < times.length; index += 1) {
      const gap = Math.max(0, Math.floor((times[index] - times[index - 1]) / MINUTE_MS));
      total += Math.min(gap, cap);
    }
  });
  return total;
}

function invoiceBalance(invoice) {
  if (invoice?.balanceDueCents !== undefined) {
    return Math.max(0, Math.round(Number(invoice.balanceDueCents) || 0));
  }
  const amount = Math.max(0, Math.round((Number(invoice?.effectiveAmount ?? invoice?.amount) || 0) * 100));
  const paid = Math.max(0, Math.round((Number(invoice?.paidAmount) || 0) * 100));
  return Math.max(0, amount - paid);
}

function safeAlertId(prefix, rawId) {
  const safe = String(rawId || "").replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 120);
  return safe ? `${prefix}_${safe}` : "";
}

function daysBetween(dateIso, todayIso) {
  const start = new Date(`${String(dateIso).slice(0, 10)}T12:00:00.000Z`);
  const end = new Date(`${String(todayIso).slice(0, 10)}T12:00:00.000Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / (24 * 60 * MINUTE_MS)));
}

function buildOperationalAlerts({
  invoices = [],
  tasks = [],
  workSessions = [],
  users = [],
  nowIso = new Date().toISOString(),
  todayIso = String(nowIso).slice(0, 10),
} = {}) {
  const nowMs = asDate(nowIso, "current time").getTime();
  const alerts = [];

  invoices.forEach(invoice => {
    const balanceCents = invoiceBalance(invoice);
    const due = String(invoice?.due || "").slice(0, 10);
    if (!invoice?.id || !due || due >= todayIso || balanceCents <= 0 || invoice.status === "Makstud") return;
    const overdueDays = daysBetween(due, todayIso);
    alerts.push({
      id: safeAlertId("invoice", invoice.id),
      category: "invoice",
      severity: overdueDays >= 14 ? "critical" : "warning",
      title: `Arve ${invoice.num || invoice.id} on tasumata`,
      detail: `${overdueDays} päeva üle tähtaja · ${(balanceCents / 100).toFixed(2)} €`,
      actionLabel: "Ava arved",
      targetTab: "invoices",
      sourceId: invoice.id,
    });
  });

  tasks.forEach(task => {
    const due = String(task?.due || "").slice(0, 10);
    if (!task?.id || task.status === "done" || !due || due >= todayIso) return;
    const overdueDays = daysBetween(due, todayIso);
    alerts.push({
      id: safeAlertId("task", task.id),
      category: "task",
      severity: overdueDays >= 7 ? "critical" : "warning",
      title: task.title || "Tähtaja ületanud ülesanne",
      detail: `${overdueDays} päeva üle tähtaja${task.assignedTo ? ` · ${task.assignedTo}` : ""}`,
      actionLabel: "Ava ülesanded",
      targetTab: "tasks",
      sourceId: task.id,
    });
  });

  workSessions.forEach(session => {
    if (!session?.id || session.status !== "open" || !session.startedAt) return;
    const ageHours = Math.max(0, (nowMs - asDate(session.startedAt, "shift start").getTime()) / (60 * MINUTE_MS));
    if (ageHours < 12) return;
    alerts.push({
      id: safeAlertId("shift", session.id),
      category: "work_time",
      severity: ageHours >= 18 ? "critical" : "warning",
      title: `${session.staffName || "Töötaja"} tööpäev on endiselt avatud`,
      detail: `Avatud ${Math.floor(ageHours)} tundi · kontrolli enne palgaarvestust`,
      actionLabel: "Ava tööaeg",
      targetTab: "work_time",
      sourceId: session.id,
    });
  });

  users.forEach(user => {
    const error = String(user?.gcal?.lastPushError || user?.gcal?.lastSyncError || "").trim();
    if (!user?.id || !error) return;
    alerts.push({
      id: safeAlertId("calendar", user.id),
      category: "calendar",
      severity: "warning",
      title: `${user.displayName || user.email || "Töötaja"} kalendri sünkroonimine vajab kontrolli`,
      detail: error.slice(0, 240),
      actionLabel: "Ava tunniplaan",
      targetTab: "calendar",
      sourceId: user.id,
    });
  });

  return alerts
    .filter(alert => alert.id)
    .sort((a, b) => {
      const priority = { critical: 0, warning: 1, info: 2 };
      return (priority[a.severity] ?? 9) - (priority[b.severity] ?? 9)
        || a.category.localeCompare(b.category)
        || a.id.localeCompare(b.id);
    });
}

module.exports = {
  MAX_SHIFT_MINUTES,
  activityEstimateMinutes,
  buildOperationalAlerts,
  hourlyRateCents,
  invoiceBalance,
  payAmountCents,
  workDurationMinutes,
};
