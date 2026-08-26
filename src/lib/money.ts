const MINOR_SCALE: Record<string, number> = {
  BRL: 100,
  USD: 100,
  EUR: 100,
  JPY: 1,
};

export function minorUnitsScale(currency: string): number {
  return MINOR_SCALE[currency.toUpperCase()] ?? 100;
}

/** Format integer minor units for display (no float math on money). */
export function formatMinorUnits(amountMinor: number, currency: string): string {
  const scale = minorUnitsScale(currency);
  const negative = amountMinor < 0;
  const abs = Math.abs(amountMinor);
  const whole = Math.floor(abs / scale);
  const fraction = abs % scale;
  const fracStr = String(fraction).padStart(scale === 1 ? 0 : 2, '0');
  const formatted = scale === 1 ? String(whole) : `${whole}.${fracStr}`;
  return negative ? `-${formatted}` : formatted;
}

export function formatMoney(amountMinor: number, currency: string): string {
  return `${formatMinorUnits(amountMinor, currency)} ${currency.toUpperCase()}`;
}

/** Parse user decimal input to minor units (BRL/USD/EUR cents). */
export function parseDecimalToMinorUnits(input: string, currency: string): number | null {
  const trimmed = input.trim().replace(',', '.');
  if (!/^\d+(\.\d{0,2})?$/.test(trimmed)) {
    return null;
  }

  const [wholePart, fracPart = ''] = trimmed.split('.');
  const scale = minorUnitsScale(currency);
  const fracPadded = fracPart.padEnd(scale === 1 ? 0 : 2, '0').slice(0, scale === 1 ? 0 : 2);
  const minor =
    Number(wholePart) * scale + (scale === 1 ? 0 : Number(fracPadded || '0'));
  return Number.isFinite(minor) ? minor : null;
}
