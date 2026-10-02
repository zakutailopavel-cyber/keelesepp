import { BLOCKS } from '../../worksheet-studio/engine/registry.js';

export const PLACEHOLDERS = ['Ma ärkan [hommikul] kell 7.', 'Päeval on pime.', 'Koht, kus õpitakse', 'Kirjuta siia selgitus või juhis.'];

export function inspectGeneratedSheet(sheet, { selectedFocusIds = [] } = {}) {
  const diagnostics = [];
  const blocks = sheet?.worksheetDoc?.blocks || [];
  const unknown = blocks.find((item) => !BLOCKS[item.type]);
  if (unknown) diagnostics.push({ severity: 'error', code: 'BLOCK_UNSUPPORTED', message: `Tundmatu plokk: ${unknown.type}`, blockId: unknown.id });
  const serialized = JSON.stringify(sheet?.worksheetDoc || {});
  if (PLACEHOLDERS.some((value) => serialized.includes(value))) diagnostics.push({ severity: 'error', code: 'PLACEHOLDER_CONTENT', message: 'Töölehele jäi näidissisu.' });
  const tasks = blocks.filter((item) => BLOCKS[item.type]?.task);
  const focused = tasks.filter((item) => selectedFocusIds.some((focusId) => item.goal === `focus:${focusId}`));
  const coverage = tasks.length ? focused.length / tasks.length : 0;
  if (selectedFocusIds.length && coverage < 0.7) diagnostics.push({ severity: 'error', code: 'FOCUS_COVERAGE_LOW', message: `Fookuse katvus on ${Math.round(coverage * 100)}%.` });
  const emptyScorable = tasks.find((item) => BLOCKS[item.type]?.score && !BLOCKS[item.type].score(item.data || {}, () => '').length);
  if (emptyScorable) diagnostics.push({ severity: 'error', code: 'ANSWER_KEY_MISSING', message: 'Kontrollitaval ülesandel puudub vastusevõti.', blockId: emptyScorable.id });
  if (tasks.length < 5 || tasks.length > 7) diagnostics.push({ severity: 'warning', code: 'BANK_INSUFFICIENT', message: `Tavalises töölehes on ${tasks.length} ülesannet; eesmärk on 5–7.` });
  return { diagnostics, taskCount: tasks.length, focusCoverage: coverage };
}

export function blockingDiagnostics(diagnostics = []) {
  return diagnostics.filter((item) => item.severity === 'error');
}
