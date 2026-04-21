export function clampScore(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function round2(value: number) {
  return Math.round(value * 100) / 100;
}
