import { utcDate } from "../domain/time.js";
import {
  fixturesEnabled,
  readFixture,
  SourceGapError,
  type Fetcher,
  type Reading,
} from "./types.js";

/**
 * Global USD drivers for gold and silver. No official free JSON feed was confirmed
 * (LBMA prices host returned 403). TODO(verify) before storing a live USD price.
 */
export function parseMetalsUsdCsv(csv: string): Reading[] {
  const latest = new Map<string, Reading>();
  for (const line of csv.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith("#") || trimmed.startsWith("date")) continue;
    const [date, key, raw] = trimmed.split(",");
    if (!date || !key || !raw || !/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    if (key !== "gold_usd_oz" && key !== "silver_usd_oz") continue;
    const value = Number(raw);
    if (!Number.isFinite(value)) continue;
    latest.set(key, {
      key,
      value,
      unit: "USD/oz",
      asOf: utcDate(date),
      sourceUrl: "fixture://metals-usd.csv",
    });
  }
  return [...latest.values()];
}

export const metalsUsdFetcher: Fetcher = {
  key: "metals_usd",
  async fetch() {
    if (fixturesEnabled()) return parseMetalsUsdCsv(readFixture("metals-usd.csv"));
    throw new SourceGapError(
      "TODO(verify): a terms-safe source for global gold and silver USD prices. LBMA json host returned 403. IBJA homepage has INR gold only.",
    );
  },
};
