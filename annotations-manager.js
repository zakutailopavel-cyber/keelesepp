/**
 * KeeleSepp — Annotations Manager
 * Система аннотаций учителя для writing-блоков рабочих листов.
 *
 * СТРУКТУРА ДАННЫХ (Firestore: worksheetAssignments/{id}.annotations):
 *
 * interface Annotation {
 *   id:           string;    // уникальный ID: timestamp + random
 *   blockId:      string;    // ID блока внутри worksheetData.blocks[]
 *   start:        number;    // позиция начала в тексте ответа (char index)
 *   end:          number;    // позиция конца
 *   selectedText: string;    // выделенный текст
 *   parandus:     string;    // исправление от учителя
 *   selgitus:     string;    // объяснение от учителя
 *   createdAt:    string;    // ISO timestamp
 *   dismissed:    boolean;   // ученик пометил как "понято"
 * }
 *
 * КАК ИСПОЛЬЗУЕТСЯ:
 * Логика заинлайнена в haldus.html внутри WorksheetPlayer.
 * Этот файл — документация и основа для рефакторинга.
 *
 * FLOW УЧИТЕЛЯ:
 * 1. Открывает "Vaata" на сданной работе
 * 2. Выделяет текст в writing-блоке мышью
 * 3. Появляется попап с полями Parandus + Selgitus
 * 4. "Salvesta" → сохраняется в Firestore
 *
 * FLOW УЧЕНИКА:
 * 1. Видит текст с красными подчёркиваниями
 * 2. Кликает → видит паранду и объяснение
 * 3. "Selge, eemaldab" → dismissed:true
 *
 * БУДУЩИЕ УЛУЧШЕНИЯ:
 * - Поддержка dialogue-блоков
 * - AI-проверка writing с автоматическими аннотациями
 * - Шаблоны типичных ошибок (Vale kääne, Sõnajärg vale, ...)
 * - Счётчик непрочитанных аннотаций в "Minu töölehed"
 */

'use strict';

const ANNOTATION_TEMPLATES = [
  { label: 'Vale kääne',         selgitus: 'Kasuta oiget kaandevormi.' },
  { label: 'Vale tegusona vorm', selgitus: 'Pane tahele tegusona poordumine.' },
  { label: 'Sonajarg vale',      selgitus: 'Eesti keeles on sonajarg erinev.' },
  { label: 'Kirjaviga',          selgitus: 'Kontrolli kirjaviisi.' },
  { label: 'Vale sona',          selgitus: 'See sona ei sobi siia konteksti.' },
];

function createAnnotation(blockId, start, end, selectedText, parandus, selgitus) {
  return {
    id: Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    blockId, start, end, selectedText,
    parandus: parandus || '',
    selgitus: selgitus || '',
    createdAt: new Date().toISOString(),
    dismissed: false,
  };
}

function splitTextByAnnotations(text, annotations) {
  const active = annotations.filter(a => !a.dismissed).sort((a, b) => a.start - b.start);
  const parts = []; let last = 0;
  for (const annot of active) {
    if (annot.start >= text.length) continue;
    if (annot.start > last) parts.push({ type: 'text', text: text.slice(last, annot.start) });
    parts.push({ type: 'annot', text: text.slice(annot.start, Math.min(annot.end, text.length)), annot });
    last = Math.min(annot.end, text.length);
  }
  if (last < text.length) parts.push({ type: 'text', text: text.slice(last) });
  return parts;
}

function getSelectionRange(container, selection) {
  if (!selection || selection.isCollapsed) return null;
  const range = selection.getRangeAt(0);
  const preRange = document.createRange();
  preRange.selectNodeContents(container);
  preRange.setEnd(range.startContainer, range.startOffset);
  const start = preRange.toString().length;
  return { start, end: start + selection.toString().length, text: selection.toString() };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createAnnotation, splitTextByAnnotations, getSelectionRange, ANNOTATION_TEMPLATES };
} else if (typeof window !== 'undefined') {
  window.AnnotationsManager = { createAnnotation, splitTextByAnnotations, getSelectionRange, ANNOTATION_TEMPLATES };
}
