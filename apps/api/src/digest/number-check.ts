const DEVANAGARI = "०१२३४५६७८९";

export interface FoundNumber {
  raw: string;
  value: number;
  places: number;
}

export function extractNumbers(text: string): FoundNumber[] {
  const ascii = text.replace(/[०-९]/g, (char) => {
    const index = DEVANAGARI.indexOf(char);
    return index >= 0 ? String(index) : char;
  });
  const withoutGroups = ascii.replace(/(\d),(?=\d)/g, "$1");
  const matches = withoutGroups.match(/-?\d+(?:\.\d+)?/g) ?? [];
  return matches.map((raw) => ({
    raw,
    value: Number(raw),
    places: raw.includes(".") ? (raw.split(".")[1]?.length ?? 0) : 0,
  }));
}

export function collectInputNumbers(value: unknown, found: number[] = []): number[] {
  if (typeof value === "number" && Number.isFinite(value)) {
    found.push(value);
    return found;
  }
  if (typeof value === "string") {
    for (const number of extractNumbers(value)) found.push(number.value);
    return found;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectInputNumbers(item, found);
    return found;
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectInputNumbers(item, found);
  }
  return found;
}

export function numberIsAllowed(candidate: FoundNumber, allowed: number[]): boolean {
  for (const source of allowed) {
    if (!Number.isFinite(source)) continue;
    if (Object.is(candidate.value, source)) return true;
    const rounded = roundHalfAway(source, candidate.places);
    if (nearlyEqual(rounded, candidate.value)) return true;
  }
  return false;
}

export function numbersOutsideInput(text: string, input: unknown): FoundNumber[] {
  const allowed = collectInputNumbers(input);
  return extractNumbers(text).filter((candidate) => !numberIsAllowed(candidate, allowed));
}

function roundHalfAway(value: number, places: number): number {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

function nearlyEqual(left: number, right: number): boolean {
  const scale = Math.max(1, Math.abs(left), Math.abs(right));
  return Math.abs(left - right) <= 1e-6 * scale;
}
