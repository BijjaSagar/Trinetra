import { utcDate } from "../domain/time.js";
import { fetchText } from "../http/fetch-text.js";
import {
  fixturesEnabled,
  readFixture,
  SourceGapError,
  type Fetcher,
  type Reading,
} from "./types.js";

export const PPAC_INDIAN_BASKET_URL =
  "https://ppac.gov.in/prices/international-prices-of-crude-oil";

/** Fixture CSV only. The PPAC page is client-rendered and no JSON route was confirmed. */
export function parseIndianBasketCsv(csv: string): Reading[] {
  const readings: Reading[] = [];
  for (const line of csv.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith("#") || trimmed.startsWith("month")) continue;
    const [month, raw] = trimmed.split(",");
    if (!month || !raw || !/^\d{4}-\d{2}$/.test(month)) continue;
    const value = Number(raw);
    if (!Number.isFinite(value)) continue;
    readings.push({
      key: "indian_basket_usd",
      value,
      unit: "USD/bbl",
      asOf: utcDate(month),
      sourceUrl: PPAC_INDIAN_BASKET_URL,
    });
  }
  const latest = readings[readings.length - 1];
  return latest ? [latest] : [];
}

export const indianBasketFetcher: Fetcher = {
  key: "ppac_indian_basket",
  async fetch() {
    if (fixturesEnabled()) return parseIndianBasketCsv(readFixture("indian-basket.csv"));
    const html = await fetchText(PPAC_INDIAN_BASKET_URL);
    if (!html.includes("Indian Basket") && !html.includes("Crude Oil")) {
      throw new Error(`PPAC Indian basket page did not load from ${PPAC_INDIAN_BASKET_URL}`);
    }
    throw new SourceGapError(
      "TODO(verify): PPAC Indian basket prices render in the browser. No stable data URL was confirmed, so the monthly USD/bbl figure is not scraped.",
    );
  },
};
