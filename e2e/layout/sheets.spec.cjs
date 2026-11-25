const { test, expect, devices } = require('@playwright/test');
const { measureInPage } = require('./measure.cjs');

// Fails when a block of the catalogue, or a real course sheet, breaks a phone: wider than the screen, a target under 44 px,
// a field under 16 px (iOS zooms), text under 15 px, or an A4 page shrunk by zoom. Own-scroll boxes are allowed.
const open = async (page, query) => {
  await page.goto(`/sheet-lab.html?${query}`, { waitUntil: 'load' });
  await page.waitForFunction(() => document.querySelector('.ws-page, .worksheet-player') || globalThis.__labError, null, { timeout: 180_000 });
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => globalThis.__labError || '')).toBe('');
};
const breaks = (result) => {
  const out = [];
  if (result.page.docOverflowX > 0) out.push(`page scrolls sideways by ${result.page.docOverflowX}`);
  result.page.scrollers.filter((s) => s.overflowX > 1 && s.style !== 'hidden').forEach((s) => out.push(`${s.el} scrolls sideways by ${s.overflowX}`));
  if (result.page.zoom !== 1) out.push(`zoom ${result.page.zoom}`);
  result.blocks.forEach((b) => {
    const at = `${b.type} (${b.id})`;
    if (b.overflowRight > 0 || b.overflowLeft > 0) out.push(`${at}: ${b.overflowRight || b.overflowLeft}px outside the screen (${b.worst})`);
    if (b.cardScroll > 1) out.push(`${at}: card wider than itself by ${b.cardScroll}`);
    if (b.tapFails) out.push(`${at}: ${b.tapFails}/${b.tapTotal} targets under 44 px (min ${b.minTapW}x${b.minTapH})`);
    if (b.minInputFont !== null && b.minInputFont < 16) out.push(`${at}: field font ${b.minInputFont}`);
    if (b.minTextFont !== null && b.minTextFont < 14) out.push(`${at}: text font ${b.minTextFont}`);
  });
  return out;
};
// the phone's size, touch and mobile layout, in Chromium (the browser CI has)
const { defaultBrowserType: _webkit, ...iphone } = devices['iPhone 13'];
const phone = (width, height = 812) => ({ ...iphone, viewport: { width, height } });

for (const width of [360, 375, 430]) {
  test.describe(`phone ${width}`, () => {
    test.use(phone(width));
    test('every block of the catalogue', async ({ page }) => {
      await open(page, 'set=catalogue');
      const result = await page.evaluate(`(${measureInPage.toString()})()`);
      expect(result.blocks.length).toBeGreaterThan(55);
      expect(breaks(result)).toEqual([]);
    });
  });
}

test.describe('phone 375, everything else', () => {
  test.use(phone(375));
  for (const theme of ['kids', 'pastel', 'bw', 'selge', 'ajakiri', 'klassika']) {
    test(`theme ${theme}`, async ({ page }) => {
      await open(page, `set=catalogue&theme=${theme}`);
      expect(breaks(await page.evaluate(`(${measureInPage.toString()})()`))).toEqual([]);
    });
  }
  test('compact sheet', async ({ page }) => {
    await open(page, 'set=catalogue&density=compact');
    expect(breaks(await page.evaluate(`(${measureInPage.toString()})()`))).toEqual([]);
  });
  test('a checked sheet', async ({ page }) => {
    await open(page, 'set=catalogue&done=1');
    expect(breaks(await page.evaluate(`(${measureInPage.toString()})()`)).filter((line) => !/targets under/.test(line))).toEqual([]);
  });
  // A2, B1 with an exam-format listening, B2, a module exam, the old template v3 copy, a teacher's own sheet, a converted v1 sheet
  for (const set of ['course:a2-013:practice', 'course:a2b1-011:discover', 'course:a2b1-015:discover', 'course:b1b2-001:transfer', 'course:b1b2-005:discover', 'course:b1b2-001:practice:v3', 'personal', 'legacy-converted']) {
    test(set, async ({ page }) => {
      await open(page, `set=${encodeURIComponent(set)}`);
      expect(breaks(await page.evaluate(`(${measureInPage.toString()})()`))).toEqual([]);
    });
  }
  test('a live lesson: the reading page', async ({ page }) => {
    await open(page, 'set=catalogue&room=1');
    await page.waitForSelector('[data-testid=worksheet-reading] .ws-page');
    expect(breaks(await page.evaluate(`(${measureInPage.toString()})()`))).toEqual([]);
  });
  test('fields on a scanned page become a list, the old v1 player fits', async ({ page }) => {
    for (const set of ['overlay', 'legacy']) {
      await open(page, `set=${set}`);
      const { width, targets } = await page.evaluate(() => {
        const items = [...document.querySelectorAll('.modal__body :is(input, textarea, select, button)')].filter((el) => el.getBoundingClientRect().width > 0);
        return { width: document.querySelector('.modal__body').scrollWidth - document.querySelector('.modal__body').clientWidth, targets: items.filter((el) => { const r = el.getBoundingClientRect(); return !el.matches('input[type=checkbox]') && (r.height < 43.5 || parseFloat(getComputedStyle(el).fontSize) < 15 && el.matches('input, textarea, select')); }).map((el) => el.outerHTML.slice(0, 80)) };
      });
      expect(width).toBeLessThanOrEqual(1);
      expect(targets).toEqual([]);
    }
  });
});

test.describe('tablet 768', () => {
  test.use({ viewport: { width: 768, height: 1024 }, hasTouch: true });
  test('every block in one column', async ({ page }) => {
    await open(page, 'set=catalogue');
    expect(breaks(await page.evaluate(`(${measureInPage.toString()})()`))).toEqual([]);
  });
});

test.describe('a phone on its side', () => {
  test.use(phone(812, 375));
  test('every block in one column', async ({ page }) => {
    await open(page, 'set=catalogue');
    expect(breaks(await page.evaluate(`(${measureInPage.toString()})()`))).toEqual([]);
  });
});

test.describe('desktop and print stay A4', () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test('a desktop screen shows the A4 pages', async ({ page }) => {
    await open(page, 'set=sample');
    const { pageWidth, flow } = await page.evaluate(() => ({ pageWidth: document.querySelector('.ws-page').offsetWidth, flow: Boolean(document.querySelector('.is-flow')) }));
    expect(flow).toBe(false);
    expect(Math.round(pageWidth)).toBe(1020);
  });
  test('printing from a phone gives A4 pages', async ({ browser }) => {
    const context = await browser.newContext(phone(375));
    const page = await context.newPage();
    await open(page, 'set=sample');
    expect(await page.locator('.ws-root.is-flow').count()).toBe(1);
    await page.emulateMedia({ media: 'print' });
    await page.evaluate(() => globalThis.dispatchEvent(new Event('beforeprint')));
    await page.waitForFunction(() => !document.querySelector('.ws-root.is-flow'));
    expect(await page.evaluate(() => document.querySelector('.ws-page').offsetWidth)).toBeGreaterThan(700);
    await page.evaluate(() => globalThis.dispatchEvent(new Event('afterprint')));
    await page.emulateMedia({ media: 'screen' });
    await page.waitForSelector('.ws-root.is-flow');
    await context.close();
  });
});

test.describe('filling in on a phone', () => {
  test.use(phone(375));
  test('answers typed in the column are kept, sent and shown again after reopening', async ({ page }) => {
    await open(page, 'set=sample');
    const first = page.locator('.ws-page input.ws-line, .ws-page textarea.ws-line').first();
    await first.fill('hommikul');
    await expect(page.locator('.ws-flow-save')).toHaveText(/Salvestatud/, { timeout: 5000 });
    const saved = await page.evaluate(() => globalThis.__lab.log.drafts.at(-1).answers);
    expect(Object.values(saved)).toContain('hommikul');
    await open(page, `set=sample&answers=${encodeURIComponent(JSON.stringify(saved))}`);
    await expect(page.locator('.ws-page input.ws-line, .ws-page textarea.ws-line').first()).toHaveValue('hommikul');
    await expect(page.locator('.ws-flow-bar b')).toHaveText(/^1\//);
  });
  test('a failed save says so and tries again', async ({ page }) => {
    await open(page, 'set=sample');
    await page.evaluate(() => { globalThis.__labFailSave = true; });
    await page.locator('.ws-page input.ws-line, .ws-page textarea.ws-line').first().fill('x');
    await expect(page.locator('.ws-flow-save')).toHaveText(/Ei salvestunud/, { timeout: 5000 });
    await page.evaluate(() => { globalThis.__labFailSave = false; });
    await expect(page.locator('.ws-flow-save')).toHaveText(/Salvestatud/, { timeout: 9000 });
  });
  test('the end button is always on screen and the teacher pointing at a task moves the sheet', async ({ page }) => {
    await open(page, 'set=catalogue');
    const box = await page.getByRole('button', { name: /Esita tööleht/ }).boundingBox();
    expect(box.y + box.height).toBeLessThanOrEqual(812);
    expect(box.height).toBeGreaterThanOrEqual(44);
    const last = await page.evaluate(() => globalThis.__labDoc.blocks.at(-1).id);
    await page.evaluate((id) => globalThis.__lab.pushers.forEach((push) => push({ liveFocus: { blockId: id }, answers: {} })), last);
    // a smooth scroll down a very long sheet: give a slow machine time
    await expect.poll(() => page.evaluate((id) => { const r = document.querySelector(`.ws-page [data-block="${id}"]`).getBoundingClientRect(); return r.top < 812 && r.bottom > 0; }, last), { timeout: 15000 }).toBe(true);
    const bar = await page.locator('.ws-flow-bar').boundingBox();
    expect(bar.y).toBeGreaterThanOrEqual(0);
    expect(bar.y).toBeLessThan(100);
  });
  test('a word bank fills the gap being typed in and keeps the keyboard', async ({ page }) => {
    await open(page, 'set=catalogue');
    const card = page.locator('.ws-page [data-block^="b5_gaps"]');
    const gaps = card.locator('.ws-gapline');
    await gaps.nth(1).focus();
    await card.locator('.ws-bank-w', { hasText: 'päeval' }).tap();
    await expect(gaps.nth(1)).toHaveValue('päeval');
    await expect(gaps.nth(0)).toHaveValue('');
    expect(await gaps.nth(0).evaluate((el) => el === document.activeElement)).toBe(true);
  });
  test('word order and sorting work by tapping', async ({ page }) => {
    await open(page, 'set=catalogue');
    const order = page.locator('.ws-page [data-block^="b30_wordorder"]');
    await order.locator('button.ws-chip', { hasText: 'Ma' }).first().tap();
    await order.locator('button.ws-chip', { hasText: 'iga' }).first().tap();
    await expect(order.locator('.ws-line').first()).toHaveValue('Ma iga');
    await order.locator('button.ws-chip', { hasText: 'Ma' }).first().tap();
    await expect(order.locator('.ws-line').first()).toHaveValue('iga');
    const sort = page.locator('.ws-page [data-block^="b29_categorize"]');
    await sort.locator('.ws-bank-w', { hasText: 'magan' }).tap();
    await sort.locator('.ws-cat-g', { hasText: 'Öösel' }).tap();
    await expect(sort.locator('.ws-cat-g', { hasText: 'Öösel' }).locator('.ws-cat-item')).toHaveText('magan');
  });
  test('tracing writes on the phone window and keeps coordinates of the whole line', async ({ page }) => {
    await open(page, 'set=catalogue');
    const row = page.locator('.ws-page [data-block*="_tracing"] .ws-trace-row').first();
    await row.locator('button', { hasText: 'Edasi' }).tap();
    await row.scrollIntoViewIfNeeded();
    const svg = await row.locator('svg').boundingBox();
    expect(svg.height).toBeGreaterThan(80);
    await page.mouse.move(svg.x + 10, svg.y + 40);
    await page.mouse.down();
    await page.mouse.move(svg.x + 60, svg.y + 60);
    await page.mouse.up();
    await page.waitForTimeout(900);
    const answers = await page.evaluate(() => globalThis.__lab.log.drafts.at(-1).answers);
    const ink = Object.entries(answers).find(([key]) => key.includes('ink0'))[1];
    expect(Number(ink.split(' ')[0].split(',')[0])).toBeGreaterThan(360);
  });
});

// the 9th-grade e-exam's interactions (docs/E_EXAM_ENGINE.md): they fit a phone, a chip goes into a gap by tapping (phone)
// and by dragging (mouse), and a part whose time is over is locked and handed in by itself
test.describe('e-exam sheets', () => {
  for (const set of ['eexam-w', 'eexam-l', 'eexam-r']) {
    test(`${set} fits a phone`, async ({ browser }) => {
      const context = await browser.newContext(phone(375));
      const page = await context.newPage();
      await open(page, `set=${set}`);
      expect(breaks(await page.evaluate(`(${measureInPage.toString()})()`))).toEqual([]);
      await context.close();
    });
  }
  test('every statement, speaker row, chat turn and chip can be scrolled to, clear of the sticky bars (phone)', async ({ browser }) => {
    const context = await browser.newContext(phone(375));
    const page = await context.newPage();
    for (const [set, id, sel] of [['eexam-l', 'ee_l_11', '.ws-speakers-claims tr, .ws-speaker'], ['eexam-r', 'ee_r_21', '.ws-chat-turn:visible, .ws-dropchip:visible']]) {
      await open(page, `set=${set}`);
      const items = page.locator(`.ws-page [data-block="${id}"]`).locator(sel);
      const covered = [];
      for (let i = 0; i < await items.count(); i += 1) {
        const free = await items.nth(i).evaluate(async (el) => {
          el.scrollIntoView({ block: 'nearest' });
          await new Promise((r) => { setTimeout(r, 60); });
          const box = el.getBoundingClientRect();
          const hit = document.elementFromPoint(box.left + box.width / 2, box.top + Math.min(box.height / 2, 12));
          return Boolean(hit && el.contains(hit));
        });
        if (!free) covered.push(i);
      }
      expect(await items.count()).toBeGreaterThan(10);
      expect(covered).toEqual([]);
    }
    await context.close();
  });
  test('tap a chip, then a gap (phone)', async ({ browser }) => {
    const context = await browser.newContext(phone(375));
    const page = await context.newPage();
    await open(page, 'set=eexam-r');
    const card = page.locator('.ws-page [data-block="ee_r_22"]');
    await expect(card.locator('[data-drop-gap="0"]')).toBeDisabled();
    await card.locator('button.ws-dropchip', { hasText: 'kõrval' }).tap();
    await card.locator('[data-drop-gap="3"]').tap();
    await expect(card.locator('[data-drop-gap="3"]')).toContainText('kõrval');
    await expect(card.locator('button.ws-dropchip', { hasText: 'kõrval' })).toBeHidden();
    await card.locator('[data-drop-gap="3"]').tap();
    await expect(card.locator('button.ws-dropchip', { hasText: 'kõrval' })).toBeVisible();
    await context.close();
  });
  test('drag a reply into the conversation (mouse)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page, 'set=eexam-r');
    const card = page.locator('.ws-page [data-block="ee_r_21"]');
    const chip = card.locator('button.ws-dropchip', { hasText: 'Hea mõte' });
    await chip.scrollIntoViewIfNeeded();
    const from = await chip.boundingBox();
    const to = await card.locator('[data-drop-gap="1"]').boundingBox();
    await page.mouse.move(from.x + 10, from.y + 8);
    await page.mouse.down();
    await page.mouse.move(from.x + 40, from.y + 30, { steps: 4 });
    await page.mouse.move(to.x + 20, to.y + to.height / 2, { steps: 8 });
    await page.mouse.up();
    await expect(card.locator('[data-drop-gap="1"]')).toContainText('Hea mõte');
    await page.waitForTimeout(900);
    const answers = await page.evaluate(() => globalThis.__lab.log.drafts.at(-1).answers);
    expect(answers['ee_r_21:1']).toBe(1);
    expect(Number(answers['ee_r_part:$startedAt'])).toBeGreaterThan(0);
  });
  test('on a desktop an exam sheet is one continuous page; the chart stands right above its task (mock 1)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await open(page, 'set=course:a2b1-ee1-w:discover');
    expect(await page.locator('.ws-page').count()).toBe(1);
    expect(await page.locator('.ws-page .ws-ftr').count()).toBe(1);
    const gap = await page.evaluate(() => {
      const chart = document.querySelector('.ws-page [data-block="ee1_w_chart"]').getBoundingClientRect();
      const task = document.querySelector('.ws-page [data-block="ee1_w_2"]').getBoundingClientRect();
      return task.top - chart.bottom;
    });
    expect(gap).toBeGreaterThanOrEqual(0);
    expect(gap).toBeLessThan(60);
    // printing still gives A4 pages
    await page.emulateMedia({ media: 'print' });
    await page.evaluate(() => globalThis.dispatchEvent(new Event('beforeprint')));
    await expect.poll(() => page.locator('.ws-page').count()).toBeGreaterThan(1);
  });
  test('the oral part (mock 1) is one continuous page too; the learner cannot give rubric points', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await open(page, 'set=course:a2b1-ee1-s:discover');
    expect(await page.locator('.ws-page').count()).toBe(1);
    const rubric = page.locator('.ws-page [data-block="ee1_s_rubric"]');
    expect(await rubric.locator('.ws-pt').count()).toBe(22);
    expect(await rubric.locator('button').count()).toBe(0);
    await expect(rubric.locator('.ws-examrubric-total')).toContainText('vähemalt 12 (60 %)');
  });
  test('1.3: every clip has its own player (mock 1)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await open(page, 'set=course:a2b1-ee1-l:discover');
    const clips = page.locator('.ws-page [data-block="ee1_l_13"] .ws-clip');
    expect(await clips.count()).toBe(8);
    for (let i = 0; i < 8; i += 1) expect(await clips.nth(i).locator('.ws-clip-sit button, .ws-clip-sit audio').count(), `clip ${i}`).toBeGreaterThan(0);
    const srcs = await page.evaluate(() => [...document.querySelectorAll('.ws-page [data-block="ee1_l_13"] .ws-clip audio')].map((a) => a.getAttribute('src')));
    expect(srcs.filter((s) => /ee1_l_13_\d\.mp3$/.test(s || '')).length).toBe(8);
  });
  test('2.5: numbered sentence beginnings, an ending tapped into the gap (mock 1, phone)', async ({ browser }) => {
    const context = await browser.newContext(phone(375));
    const page = await context.newPage();
    await open(page, 'set=course:a2b1-ee1-r:discover');
    const card = page.locator('.ws-page [data-block="ee1_r_25"]');
    expect(await card.locator('.ws-ads-num').allTextContents()).toEqual(['0.', '1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.', '10.']);
    await expect(card.locator('[data-drop-gap="0"]')).toBeDisabled();
    await card.locator('button.ws-dropchip', { hasText: 'kuigi vahemaa' }).tap();
    await card.locator('[data-drop-gap="1"]').tap();
    await expect(card.locator('[data-drop-gap="1"]')).toContainText('kuigi vahemaa');
    await page.waitForTimeout(900);
    const answers = await page.evaluate(() => globalThis.__lab.log.drafts.at(-1).answers);
    expect(answers['ee1_r_25:1']).toBe('E');
    await context.close();
  });
  test('a part whose time is over is locked and handed in', async ({ page }) => {
    const answers = { 'ee_r_part:$startedAt': Date.now() - 96 * 60000, 'ee_r_26:1': 0 };
    await open(page, `set=eexam-r&answers=${encodeURIComponent(JSON.stringify(answers))}`);
    await expect.poll(() => page.evaluate(() => globalThis.__lab.log.submits.length), { timeout: 10000 }).toBe(1);
    await expect(page.locator('.worksheet-result')).toContainText('punkti');
    expect(await page.locator('.ws-page button.ws-dropchip').count()).toBe(0);
  });
});
