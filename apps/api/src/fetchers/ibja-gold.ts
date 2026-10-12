import { utcDateFromDmy } from "../domain/time.js";
import { fetchText } from "../http/fetch-text.js";
import { fixturesEnabled, readFixture, type Fetcher, type Reading } from "./types.js";

export const IBJA_URL = "https://ibja.co/";

/**
 * IBJA homepage publishes fine gold (999) per gram, excluding 3% GST and making charges.
 * `gold_inr_10g` is that rate times 10. Silver is not in this rate box.
 */
export function parseIbjaGold(html: string): Reading[] {
  const dateMatch = /id="lblDate">\s*(\d{2}\/\d{2}\/\d{4})\s*</.exec(html);
  const priceMatch = /id="lblFineGold999">\s*₹?\s*([0-9][0-9,]*)\s*</.exec(html);
  if (!dateMatch?.[1] || !priceMatch?.[1]) return [];
  if (!html.includes("Rates per gram") && !html.includes("*Rates per gram")) {
    throw new Error("IBJA page no longer says rates are per gram. Refusing to scale to 10g.");
  }
  const perGram = Number(priceMatch[1].replace(/,/g, ""));
  if (!Number.isFinite(perGram)) return [];
  return [
    {
      key: "gold_inr_10g",
      value: perGram * 10,
      unit: "INR/10g",
      asOf: utcDateFromDmy(dateMatch[1]),
      sourceUrl: IBJA_URL,
    },
  ];
}

export const ibjaGoldFetcher: Fetcher = {
  key: "ibja_gold",
  async fetch() {
    const html = fixturesEnabled() ? readFixture("ibja-gold.html") : await fetchText(IBJA_URL);
    const readings = parseIbjaGold(html);
    if (readings.length === 0) throw new Error("IBJA homepage had no lblFineGold999 rate");
    return readings;
  },
};
