import { utcDate } from "../domain/time.js";
import { FOOD_KEYS } from "../domain/indicators.js";
import { fetchText } from "../http/fetch-text.js";
import {
  fixturesEnabled,
  readFixture,
  SourceGapError,
  type Fetcher,
  type Reading,
} from "./types.js";

export const DCA_PRICE_URL = "https://consumeraffairs.gov.in/pages/price-monitoring-division";

const FOOD_KEY_SET = new Set<string>(FOOD_KEYS);

/**
 * CSV columns: date,indicator_key,inr_per_kg
 * TODO(verify): data.gov.in resource id for Solapur retail prices of onion, tomato, wheat and tur.
 */
export function parseFoodCsv(csv: string): Reading[] {
  const latest = new Map<string, Reading>();
  for (const line of csv.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith("#") || trimmed.startsWith("date")) continue;
    const [date, key, raw] = trimmed.split(",");
    if (!date || !key || !raw || !FOOD_KEY_SET.has(key) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      continue;
    }
    const value = Number(raw);
    if (!Number.isFinite(value)) continue;
    latest.set(key, {
      key,
      value,
      unit: "INR/kg",
      asOf: utcDate(date),
      sourceUrl: "fixture://food-solapur.csv",
    });
  }
  return [...latest.values()];
}

export const foodFetcher: Fetcher = {
  key: "food_dca",
  async fetch() {
    if (fixturesEnabled()) return parseFoodCsv(readFixture("food-solapur.csv"));
    await fetchText(DCA_PRICE_URL);
    throw new SourceGapError(
      "TODO(verify): Department of Consumer Affairs monitors retail prices, including onion, tomato, wheat and tur. The Solapur centre series and data.gov.in resource id were not confirmed, so no price is stored.",
    );
  },
};
