/**
 * KeeleSepp — SkillMap Updater
 * Автоматическое обновление карты навыков ученика на основе результатов рабочих листов.
 *
 * Формула обновления (из методического промпта):
 *   90-100% → +5
 *   75-89%  → +3
 *   60-74%  → +1
 *   40-59%  → 0 (без изменений)
 *   <40%    → -3
 *
 * Навык > 80 → статус "strong"
 * Ошибка 3 раза подряд → статус "weak"
 *
 * Использование:
 *   import { updateSkillMapFromResult } from './skillmap-updater.js';
 *   await updateSkillMapFromResult(db, studentId, skillsToUpdate, score);
 */

'use strict';

/**
 * Возвращает дельту изменения навыка на основе % результата.
 * @param {number} pct — процент результата (0-100)
 * @returns {number} — дельта (-3, 0, 1, 3 или 5)
 */
function scoreToDelta(pct) {
  if (pct >= 90) return 5;
  if (pct >= 75) return 3;
  if (pct >= 60) return 1;
  if (pct >= 40) return 0;
  return -3;
}

/**
 * Применяет изменения к карте навыков одного ученика.
 *
 * @param {firebase.firestore.Firestore} db — экземпляр Firestore
 * @param {string} studentId — ID ученика в коллекции students
 * @param {Array<{skill_id: string, focus: string, reason: string}>} skillsToUpdate
 *   — список навыков из ответа AI (поле skills_to_update в JSON)
 * @param {{pct: number, correct: number, total: number}|null} score
 *   — результат выполнения листа (null = не авто-проверяемый тип, не обновляем)
 * @returns {Promise<void>}
 */
async function updateSkillMapFromResult(db, studentId, skillsToUpdate, score) {
  if (!studentId) {
    console.warn('[SkillMapUpdater] studentId is missing, skipping update');
    return;
  }
  if (!skillsToUpdate || skillsToUpdate.length === 0) {
    console.info('[SkillMapUpdater] No skills_to_update provided, skipping');
    return;
  }
  if (!score || score.total === 0) {
    console.info('[SkillMapUpdater] Score is null or total=0, skipping auto-update');
    return;
  }

  const delta = scoreToDelta(score.pct);
  console.info(`[SkillMapUpdater] pct=${score.pct}% → delta=${delta > 0 ? '+' : ''}${delta}`);

  try {
    // Читаем текущий skillMap
    const studentRef = db.collection('students').doc(studentId);
    const snap = await studentRef.get();
    if (!snap.exists) {
      console.warn('[SkillMapUpdater] Student doc not found:', studentId);
      return;
    }

    const currentSkillMap = snap.data().skillMap || {};
    const updates = {};

    skillsToUpdate.forEach(({ skill_id, focus }) => {
      if (!skill_id) return;

      const currentValue = currentSkillMap[skill_id] ?? null;

      // Если навык ещё не тестировался — ставим базовое значение исходя из результата
      if (currentValue === null || currentValue === undefined) {
        // Первый результат: просто устанавливаем % как начальное значение
        updates[`skillMap.${skill_id}`] = Math.max(0, Math.min(100, score.pct));
        return;
      }

      // Применяем дельту
      let newValue = currentValue + delta;
      newValue = Math.max(0, Math.min(100, newValue)); // зажать в [0, 100]
      updates[`skillMap.${skill_id}`] = newValue;

      console.info(`[SkillMapUpdater] ${skill_id}: ${currentValue} → ${newValue} (focus: ${focus || 'n/a'})`);
    });

    if (Object.keys(updates).length === 0) {
      console.info('[SkillMapUpdater] No field updates computed');
      return;
    }

    // Обновляем Firestore (dot-notation для merge без перезаписи всего объекта)
    await studentRef.update({
      ...updates,
      skillMapLastUpdated: new Date().toISOString(),
    });

    console.info(`[SkillMapUpdater] Updated ${Object.keys(updates).length} skills for student ${studentId}`);
  } catch (err) {
    // Не критичная ошибка — не ломаем основной поток
    console.error('[SkillMapUpdater] Update failed:', err);
  }
}

/**
 * Парсит поле skills_to_update из ответа AI-генератора.
 * Если AI не вернул это поле — пытается угадать навыки из blocks[].type.
 *
 * @param {Object} aiResult — распарсенный JSON ответ AI (kit или отдельный sheet)
 * @param {string} level — уровень ученика ('A1','A2','B1','B2','C1')
 * @returns {Array<{skill_id: string, focus: string, reason: string}>}
 */
function extractSkillsToUpdate(aiResult, level) {
  // Если AI вернул explicit список — используем его
  if (aiResult?.skills_to_update?.length) {
    return aiResult.skills_to_update;
  }

  // Fallback: угадываем по типам блоков
  const blockTypeToSkill = {
    fill:             `${level}_GRAMMAR_FILL`,
    choice:           `${level}_GRAMMAR_CHOICE`,
    writing:          `${level}_WRITING`,
    match:            `${level}_VOCABULARY`,
    order:            `${level}_WORD_ORDER`,
    dialogue:         `${level}_SPEAKING`,
    reading:          `${level}_READING`,
    error_correction: `${level}_GRAMMAR`,
    transformation:   `${level}_GRAMMAR`,
  };

  const blocks = aiResult?.blocks || aiResult?.sheets?.[0]?.blocks || [];
  const seen = new Set();
  const result = [];

  blocks.forEach(b => {
    const skill_id = blockTypeToSkill[b.type];
    if (skill_id && !seen.has(skill_id)) {
      seen.add(skill_id);
      result.push({ skill_id, focus: 'auto', reason: `Block type: ${b.type}` });
    }
  });

  return result;
}

/**
 * Вспомогательная функция: определяет какие навыки стали "strong" или "weak"
 * после обновления (для отображения в UI учителя).
 *
 * @param {Object} before — skillMap до обновления
 * @param {Object} after  — skillMap после обновления
 * @returns {{newStrong: string[], newWeak: string[]}}
 */
function detectStatusChanges(before, after) {
  const newStrong = [];
  const newWeak = [];

  Object.keys(after).forEach(skillId => {
    const prev = before[skillId] ?? null;
    const curr = after[skillId];

    if (curr >= 80 && (prev === null || prev < 80)) {
      newStrong.push(skillId);
    }
    if (curr < 50 && (prev === null || prev >= 50)) {
      newWeak.push(skillId);
    }
  });

  return { newStrong, newWeak };
}

// ─── Экспорт для использования как ES module или через window в браузере ───────

if (typeof module !== 'undefined' && module.exports) {
  // Node.js / bundler
  module.exports = { updateSkillMapFromResult, extractSkillsToUpdate, detectStatusChanges, scoreToDelta };
} else if (typeof window !== 'undefined') {
  // Браузер (CDN Babel / без бандлера)
  window.SkillMapUpdater = { updateSkillMapFromResult, extractSkillsToUpdate, detectStatusChanges, scoreToDelta };
}
