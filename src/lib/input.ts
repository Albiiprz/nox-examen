export function normalizeSingleLine(value: string, maxLength: number) {
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export function normalizeMultiline(value: string, maxLength: number) {
  return value.replace(/\r/g, "").trim().slice(0, maxLength);
}
