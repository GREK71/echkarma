export const KARMA_MIN = 0;
export const KARMA_MAX = 12;

export function clampKarma(value: number): number {
  return Math.max(KARMA_MIN, Math.min(KARMA_MAX, value));
}

export function getKarmaLevel(karma: number): 'low' | 'mid' | 'high' {
  if (karma <= 4) return 'low';
  if (karma <= 8) return 'mid';
  return 'high';
}
