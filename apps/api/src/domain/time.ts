export const KOLKATA = "Asia/Kolkata";

/** Calendar date YYYY-MM-DD in Asia/Kolkata. */
export function kolkataDateString(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: KOLKATA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Month number 1-12 in Asia/Kolkata. */
export function kolkataMonth(date: Date): number {
  const part = new Intl.DateTimeFormat("en-US", {
    timeZone: KOLKATA,
    month: "numeric",
  }).format(date);
  return Number(part);
}

/** Parse a YYYY-MM-DD or YYYY-MM source date as UTC midnight. */
export function utcDate(isoDate: string): Date {
  const trimmed = isoDate.trim();
  if (/^\d{4}-\d{2}$/.test(trimmed)) {
    return new Date(`${trimmed}-01T00:00:00.000Z`);
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return new Date(`${trimmed}T00:00:00.000Z`);
  }
  throw new Error(`Unrecognised date: ${isoDate}`);
}

/** DD/MM/YYYY as used by IBJA. */
export function utcDateFromDmy(dmy: string): Date {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dmy.trim());
  if (!match) throw new Error(`Unrecognised DMY date: ${dmy}`);
  const day = match[1];
  const month = match[2];
  const year = match[3];
  if (!day || !month || !year) throw new Error(`Unrecognised DMY date: ${dmy}`);
  return utcDate(`${year}-${month}-${day}`);
}

export const MS_PER_HOUR = 60 * 60 * 1000;
export const MS_PER_DAY = 24 * MS_PER_HOUR;
