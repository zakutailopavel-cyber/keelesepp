// Scenario: the lesson room's top bar never overlaps itself (owner 2026-10-14: the hang-up button covered the
// people icon while recording). Teacher in a recorded call, checked at desktop, laptop, tablet and phone widths.
const { test } = require('@playwright/test');
const { guard, login, expect } = require('./helpers.cjs');

const overlaps = (page) => page.evaluate(() => {
  const boxes = [...document.querySelectorAll('.lr-top button, .lr-top .lr-pill, .lr-top .lr-title')]
    .filter((el) => el.offsetParent && !el.closest('.lr-menu'))
    .map((el) => ({ el, name: el.getAttribute('aria-label') || el.textContent.trim().slice(0, 30), r: el.getBoundingClientRect() }))
    .filter((item) => item.r.width > 0 && item.r.height > 0);
  const hits = [];
  for (let i = 0; i < boxes.length; i += 1) for (let j = i + 1; j < boxes.length; j += 1) {
    const a = boxes[i].r; const b = boxes[j].r;
    if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) hits.push(`${boxes[i].name} × ${boxes[j].name}`);
  }
  const bar = document.querySelector('.lr-top').getBoundingClientRect();
  // a group that scrolls sideways (the call buttons on a phone) may hold buttons past the edge: they are reached by scrolling
  const scrolls = (el) => { const group = el.closest('.lr-top__group'); return group && getComputedStyle(group).overflowX === 'auto'; };
  const outside = boxes.filter((item) => !scrolls(item.el) && (item.r.right > bar.right + 1 || item.r.left < bar.left - 1)).map((item) => `${item.name} outside`);
  return [...hits, ...outside];
});

test('the lesson bar has no overlapping buttons at any width, also while recording', async ({ browser }) => {
  test.setTimeout(150_000);
  const teacher = await (await browser.newContext()).newPage();
  const student = await (await browser.newContext()).newPage();
  const problems = [...await guard(teacher), ...await guard(student)];
  await login(teacher, 'teacher');
  await login(student, 'student');
  await teacher.goto('/live-classroom');
  await teacher.getByRole('combobox', { name: 'Õpilane' }).click();
  await teacher.getByRole('option', { name: /Anna Õpilane/ }).click();
  await teacher.getByRole('button', { name: /Kutsu õpilane tundi/ }).click();
  await student.getByRole('button', { name: 'Liitu tunniga' }).click();
  await teacher.getByRole('button', { name: /Alusta kõnet/ }).click();
  await expect(teacher.getByRole('button', { name: /Tundi salvestatakse/ })).toBeVisible({ timeout: 30000 });
  for (const [width, height] of [[1920, 1080], [1600, 900], [1440, 900], [1366, 768], [1280, 800], [1024, 768], [820, 1180], [390, 844]]) {
    await teacher.setViewportSize({ width, height });
    await teacher.waitForTimeout(300);
    await teacher.screenshot({ path: `test-results/room-bar-${width}.png`, clip: { x: 0, y: 0, width, height: Math.min(height, 200) } });
    expect(await overlaps(teacher), `${width}px`).toEqual([]);
  }
  expect(problems).toEqual([]);
});
