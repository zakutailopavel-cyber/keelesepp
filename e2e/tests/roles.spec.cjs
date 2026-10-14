// Scenario 1: every role logs in and sees exactly its own menu (docs/E2E_SCENARIOS.md)
const { test } = require('@playwright/test');
const { guard, login, expect } = require('./helpers.cjs');

const menu = (page) => page.getByRole('navigation').first();

test('student sees the four things to do and messages', async ({ page }) => {
  const problems = await guard(page);
  await login(page, 'student');
  for (const label of ['Minu õpingud', 'Ülesanded', 'Sõnad', 'Minu vead', 'Lemmik', 'Suhtlus']) await expect(menu(page).getByRole('link', { name: label })).toBeVisible();
  for (const label of ['Kalender', 'Õpilased', 'Finantsid', 'Minu pere']) await expect(menu(page).getByRole('link', { name: label })).toHaveCount(0);
  expect(problems).toEqual([]);
});

test('parent sees the family page and the child', async ({ page }) => {
  const problems = await guard(page);
  await login(page, 'parent');
  await expect(menu(page).getByRole('link', { name: 'Minu pere' })).toBeVisible();
  await menu(page).getByRole('link', { name: 'Minu pere' }).click();
  await expect(page.getByText('Kaarel Laps').first()).toBeVisible();
  for (const label of ['Kalender', 'Õpilased', 'Finantsid']) await expect(menu(page).getByRole('link', { name: label })).toHaveCount(0);
  expect(problems).toEqual([]);
});

test('a student who is also a parent sees her own studies and her child', async ({ page }) => {
  const problems = await guard(page);
  await login(page, 'both');
  await expect(menu(page).getByRole('link', { name: 'Minu õpingud' })).toBeVisible();
  await expect(menu(page).getByRole('link', { name: 'Minu pere' })).toBeVisible();
  await menu(page).getByRole('link', { name: 'Minu pere' }).click();
  await expect(page.getByText('Mia Laps').first()).toBeVisible();
  for (const label of ['Kalender', 'Õpilased', 'Finantsid']) await expect(menu(page).getByRole('link', { name: label })).toHaveCount(0);
  expect(problems).toEqual([]);
});

test('teacher sees teaching pages but not finance or accounts', async ({ page }) => {
  const problems = await guard(page);
  await login(page, 'teacher');
  for (const label of ['Kalender', 'Live Classroom', 'Õppevara', 'Õpilased']) await expect(menu(page).getByRole('link', { name: label })).toBeVisible();
  for (const label of ['Uued kontod', 'Õpetajad']) await expect(menu(page).getByRole('link', { name: label })).toHaveCount(0);
  expect(problems).toEqual([]);
});

test('admin sees accounts and finance', async ({ page }) => {
  const problems = await guard(page);
  await login(page, 'admin');
  for (const label of ['Uued kontod', 'Finantsid', 'Õpetajad', 'Õpilased']) await expect(menu(page).getByRole('link', { name: label })).toBeVisible();
  expect(problems).toEqual([]);
});
