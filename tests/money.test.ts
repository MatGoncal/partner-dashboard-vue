import { describe, expect, it } from 'vitest';
import { formatMinorUnits, parseDecimalToMinorUnits } from '@/lib/money';

describe('money helpers', () => {
  it('formats BRL minor units', () => {
    expect(formatMinorUnits(1500, 'BRL')).toBe('15.00');
  });

  it('parses decimal input to minor units', () => {
    expect(parseDecimalToMinorUnits('15.00', 'BRL')).toBe(1500);
    expect(parseDecimalToMinorUnits('99.99', 'BRL')).toBe(9999);
    expect(parseDecimalToMinorUnits('', 'BRL')).toBeNull();
  });
});
