import { describe, expect, it } from 'vitest';
import { worksheetPageId } from './studentBoard.js';

describe('worksheet page id', () => {
  it('is the same for the same sheet title and different for another', () => {
    expect(worksheetPageId('Tööleht: Loodus ja tegevused')).toBe(worksheetPageId('Tööleht: Loodus ja tegevused'));
    expect(worksheetPageId('Tööleht: Loodus ja tegevused')).not.toBe(worksheetPageId('Tööleht: Minu päev'));
    expect(worksheetPageId('Tööleht: Õ')).toMatch(/^ws-[0-9a-f]{8}$/);
  });
});
