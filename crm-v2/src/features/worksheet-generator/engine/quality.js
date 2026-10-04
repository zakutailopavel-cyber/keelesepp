import { BLOCKS } from '../../worksheet-studio/engine/registry.js';
import { activityById } from './activityCatalog.js';

export const PLACEHOLDERS = ['Ma ärkan [hommikul] kell 7.', 'Päeval on pime.', 'Koht, kus õpitakse', 'Kirjuta siia selgitus või juhis.'];

const PHASE_TAGS = {
  discover: ['input', 'noticing', 'reflection'],
  practice: ['accuracy', 'controlled'],
  transfer: ['oral', 'written', 'reflection'],
};

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

  const activityIds = sheet?.activityIds || [];
  const activities = activityIds.map(activityById);
  if (activityIds.length && activityIds.length !== tasks.length) {
    diagnostics.push({ severity: 'error', code: 'DIDACTIC_PLAN_MATERIALIZATION_MISMATCH', message: 'Didaktilise plaani ja loodud ülesannete arv ei ühti.' });
  }
  const missingActivity = activityIds.find((id, index) => !activities[index]);
  if (missingActivity) diagnostics.push({ severity: 'error', code: 'DIDACTIC_ACTIVITY_UNKNOWN', message: `Tundmatu didaktiline tegevus: ${missingActivity}` });

  activities.forEach((activity, index) => {
    if (!activity || !tasks[index]) return;
    if (activity.blockType !== tasks[index].type) {
      diagnostics.push({
        severity: 'error',
        code: 'DIDACTIC_BLOCK_MISMATCH',
        message: `${activity.id}: oodati plokki ${activity.blockType}, loodi ${tasks[index].type}.`,
        blockId: tasks[index].id,
      });
    }
  });

  const requiredTags = PHASE_TAGS[sheet?.phase] || [];
  const tags = new Set(activities.flatMap((activity) => activity?.tags || []));
  requiredTags.forEach((tag) => {
    if (!tags.has(tag)) diagnostics.push({ severity: 'error', code: 'DIDACTIC_REQUIREMENT_MISSING', message: `${sheet.phase}: didaktiline omadus "${tag}" puudub.` });
  });

  if (sheet?.phase === 'full') {
    const phases = new Set(activities.filter(Boolean).map((activity) => activity.phase));
    ['discover', 'practice', 'transfer'].forEach((phase) => {
      if (!phases.has(phase)) diagnostics.push({ severity: 'error', code: 'DIDACTIC_PROGRESSION_MISSING', message: `Täistöölehel puudub faas ${phase}.` });
    });
  }

  return { diagnostics, taskCount: tasks.length, focusCoverage: coverage };
}

export function blockingDiagnostics(diagnostics = []) {
  return diagnostics.filter((item) => item.severity === 'error');
}
