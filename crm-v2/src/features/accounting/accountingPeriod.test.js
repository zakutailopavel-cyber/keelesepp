import { describe, expect, it } from 'vitest';
import { trialBalanceWorkbook } from './accountingExcel.js';
import { COMPANY } from './accountingReports.js';
import { PERIOD_STORAGE_KEY, TRIAL_MID_YEAR_NOTE, activePreset, loadPeriod, periodLabel, presetPeriod, savePeriod, startsMidYear, tallinnToday } from './accountingPeriod.js';

const memory = (initial = {}) => {
  const data = { ...initial };
  return { getItem: (k) => (k in data ? data[k] : null), setItem: (k, v) => { data[k] = String(v); }, data };
};

describe('accounting period', () => {
  it('takes the calendar day in Tallinn, not UTC', () => {
    // 31.12 23:30 UTC is already 01.01 in Tallinn (UTC+2)
    expect(tallinnToday(new Date('2026-12-31T23:30:00Z'))).toBe('2027-01-01');
    // summer time UTC+3: 21:30 UTC on 30.06 is 01.07 00:30
    expect(tallinnToday(new Date('2026-06-30T21:30:00Z'))).toBe('2026-07-01');
    expect(tallinnToday(new Date('2026-11-05T10:00:00Z'))).toBe('2026-11-05');
  });

  it('builds the quick periods with month and quarter boundaries', () => {
    const today = '2026-11-05';
    expect(presetPeriod('year', today)).toEqual({ from: '2026-01-01', to: '2026-11-05' });
    expect(presetPeriod('month', today)).toEqual({ from: '2026-11-01', to: '2026-11-05' });
    expect(presetPeriod('prevMonth', today)).toEqual({ from: '2026-10-01', to: '2026-10-31' });
    expect(presetPeriod('quarter', today)).toEqual({ from: '2026-10-01', to: '2026-11-05' });
    expect(presetPeriod('prevQuarter', today)).toEqual({ from: '2026-07-01', to: '2026-09-30' });
    // across the year and February
    expect(presetPeriod('prevMonth', '2026-01-15')).toEqual({ from: '2025-12-01', to: '2025-12-31' });
    expect(presetPeriod('prevQuarter', '2026-02-10')).toEqual({ from: '2025-10-01', to: '2025-12-31' });
    expect(presetPeriod('prevMonth', '2028-03-01')).toEqual({ from: '2028-02-01', to: '2028-02-29' });
    expect(presetPeriod('quarter', '2026-03-31')).toEqual({ from: '2026-01-01', to: '2026-03-31' });
    expect(presetPeriod('prevQuarter', '2026-04-01')).toEqual({ from: '2026-01-01', to: '2026-03-31' });
  });

  it('„Aasta algusest” keeps the selected year; a past year runs to 31.12', () => {
    expect(presetPeriod('year', '2026-11-05', { from: '2025-09-01', to: '2025-10-31' })).toEqual({ from: '2025-01-01', to: '2025-12-31' });
    expect(presetPeriod('year', '2026-11-05', { from: '2026-09-01', to: '2026-11-05' })).toEqual({ from: '2026-01-01', to: '2026-11-05' });
  });

  it('highlights the quick button the period equals', () => {
    expect(activePreset({ from: '2026-01-01', to: '2026-11-05' }, '2026-11-05')).toBe('year');
    expect(activePreset({ from: '2026-10-01', to: '2026-10-31' }, '2026-11-05')).toBe('prevMonth');
    expect(activePreset({ from: '2026-09-01', to: '2026-11-05' }, '2026-11-05')).toBe('');
  });

  it('shows the mid-year note only when the period does not start on 1 January', () => {
    expect(startsMidYear('2026-09-01')).toBe(true);
    expect(startsMidYear('2026-01-01')).toBe(false);
    expect(startsMidYear('')).toBe(false);
    expect(periodLabel({ from: '2026-09-01', to: '2026-11-05' })).toBe('01.09.2026–05.11.2026');
  });

  it('remembers the period per device and survives broken storage', () => {
    const storage = memory();
    savePeriod({ from: '2026-09-01', to: '2026-11-05' }, storage);
    expect(loadPeriod('2026-11-05', storage)).toEqual({ from: '2026-09-01', to: '2026-11-05' });
    expect(loadPeriod('2026-11-05', memory({ [PERIOD_STORAGE_KEY]: '{bad' }))).toEqual({ from: '2026-01-01', to: '2026-11-05' });
    expect(loadPeriod('2026-11-05', memory({ [PERIOD_STORAGE_KEY]: JSON.stringify({ from: '2026-12-01', to: '2026-01-01' }) }))).toEqual({ from: '2026-01-01', to: '2026-11-05' });
    const blocked = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } };
    expect(loadPeriod('2026-11-05', blocked)).toEqual({ from: '2026-01-01', to: '2026-11-05' });
    expect(() => savePeriod({ from: '2026-01-01', to: '2026-11-05' }, blocked)).not.toThrow();
  });

  it('puts the note into the Excel header only for a mid-year period', () => {
    const balance = { rows: [], total: { opening: { debit: 0, credit: 0 }, turnover: { debit: 0, credit: 0 }, closing: { debit: 0, credit: 0 } } };
    const mid = trialBalanceWorkbook(balance, { company: COMPANY, period: { from: '2026-09-01', to: '2026-11-05' } });
    expect(mid).toContain('Märkus');
    expect(mid).toContain('Periood ei alga 1. jaanuarist');
    expect(TRIAL_MID_YEAR_NOTE).toMatch(/aasta algusest kuni perioodi alguseni/);
    const full = trialBalanceWorkbook(balance, { company: COMPANY, period: { from: '2026-01-01', to: '2026-11-05' } });
    expect(full).not.toContain('Periood ei alga');
  });
});
