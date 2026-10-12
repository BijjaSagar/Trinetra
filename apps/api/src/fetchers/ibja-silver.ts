import { fetchText } from "../http/fetch-text.js";
import {
  fixturesEnabled,
  readFixture,
  SourceGapError,
  type Fetcher,
  type Reading,
} from "./types.js";
import { IBJA_URL } from "./ibja-gold.js";

/**
 * The IBJA homepage rate box checked on 12 Oct 2026 has gold per gram and no silver kg rate.
 * The daily PDF is not text-extractable here. This parser only accepts an explicit
 * `data-silver-inr-per-kg` attribute so a future confirmed snippet can be tested.
 * TODO(verify): silver INR per kg from an official IBJA text source.
 */
export function parseIbjaSilver(html: string): Reading[] {
  const match = /data-silver-inr-per-kg="([0-9.]+)"\s+data-as-of="(\d{4}-\d{2}-\d{2})"/.exec(html);
  if (!match?.[1] || !match[2]) return [];
  const value = Number(match[1]);
  if (!Number.isFinite(value)) return [];
  return [
    {
      key: "silver_inr_kg",
      value,
      unit: "INR/kg",
      asOf: new Date(`${match[2]}T00:00:00.000Z`),
      sourceUrl: IBJA_URL,
    },
  ];
}

export const ibjaSilverFetcher: Fetcher = {
  key: "ibja_silver",
  async fetch() {
    if (fixturesEnabled()) return parseIbjaSilver(readFixture("ibja-silver.html"));
    const html = await fetchText(IBJA_URL);
    const readings = parseIbjaSilver(html);
    if (readings.length === 0) {
      throw new SourceGapError(
        "TODO(verify): IBJA homepage publishes gold (lblFineGold999) but no silver INR/kg field was found. The daily PDF is image-like and was not parsed.",
      );
    }
    return readings;
  },
};
