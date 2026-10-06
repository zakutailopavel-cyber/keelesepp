export const TEXTBOOK_VISUAL_STYLE_VERSION = 1;

export const TEXTBOOK_VISUAL_MODES = Object.freeze({
  photo: Object.freeze({
    id: 'photo',
    label: 'Photo',
    purpose: 'Real-life people, places, services, transport, workplaces and practical situations.',
    treatment: 'natural-light-calm-european-editorial',
    aspectRatios: ['4:3', '3:2', '1:1'],
    rules: [
      'one clear communicative situation',
      'natural expressions and body language',
      'no staged stock-photo smiles',
      'limited visual clutter',
      'leave usable negative space for worksheet layout',
      'use the same rounded crop treatment in the renderer',
    ],
  }),
  editorial: Object.freeze({
    id: 'editorial',
    label: 'Editorial illustration',
    purpose: 'Grammar, emotions, comparison, humour, dilemmas and situations that benefit from visual simplification.',
    treatment: 'clean-adult-editorial-soft-texture',
    aspectRatios: ['4:3', '3:2', '1:1'],
    rules: [
      'adult proportions',
      'restrained line work',
      'soft texture rather than glossy 3D',
      'limited KeeleSepp-compatible palette',
      'simple background',
      'no childish clipart',
      'no Pixar-like 3D character treatment',
    ],
  }),
  infographic: Object.freeze({
    id: 'infographic',
    label: 'Infographic / schematic',
    purpose: 'Grammar systems, timelines, process, comparison, data and functional information.',
    treatment: 'clean-functional-textbook-diagram',
    aspectRatios: ['16:9', '4:3', '1:1'],
    rules: [
      'information first',
      'minimal decoration',
      'clear hierarchy',
      'same typography as the worksheet',
      'few semantic accents',
      'labels readable in print',
    ],
  }),
});

export const TEXTBOOK_BRAND_VISUAL = Object.freeze({
  personality: ['adult', 'modern', 'calm', 'practical', 'editorial'],
  paletteRoles: ['navy', 'green', 'sand', 'soft-blue', 'warm-neutral'],
  imageFrame: Object.freeze({
    borderRadius: 'large',
    border: 'subtle',
    captionStyle: 'compact',
    crop: 'cover',
    shadow: 'minimal',
  }),
  forbidden: [
    'childish clipart',
    'random mixed illustration styles',
    'glossy 3D cartoon characters',
    'neon palette',
    'decorative image without a language-learning purpose',
    'visible watermark',
    'low-resolution source',
  ],
});

export const TEXTBOOK_VISUAL_TASK_PURPOSES = Object.freeze([
  'describe',
  'compare',
  'infer',
  'choose',
  'sequence',
  'plan',
  'explain',
  'mediate',
  'argue',
  'problem-solve',
]);

export function visualMode(id) {
  return TEXTBOOK_VISUAL_MODES[String(id || '').trim().toLowerCase()] || null;
}

export function validateTextbookVisual({ mode, taskPurpose } = {}) {
  const issues = [];
  if (!visualMode(mode)) issues.push('unknown visual mode');
  if (taskPurpose && !TEXTBOOK_VISUAL_TASK_PURPOSES.includes(taskPurpose)) issues.push('unknown task purpose');
  return issues;
}
