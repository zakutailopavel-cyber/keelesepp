// The text a learner reads on a sheet (solved task sentences, reading passages, text blocks), for EKI's text evaluation.
import { BLOCKS } from '../engine/registry.js';
import { measureBlock } from './didacticCheck.js';

const strip = (s) => String(s || '').replace(/[*_=]+|\{\/?\w+\}/g, '').trim();
export function sheetText(doc) {
  const parts = [];
  for (const b of doc?.blocks || []) {
    if (b.type === 'reading') parts.push(strip(b.data?.passage));
    else if (b.type === 'text') parts.push(strip(b.data?.text || b.data?.body));
    else if (BLOCKS[b.type]?.task) parts.push(...measureBlock(b).sentences.map(strip));
  }
  return parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}
