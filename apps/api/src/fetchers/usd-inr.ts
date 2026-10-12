import { utcDate } from "../domain/time.js";
import { fetchText } from "../http/fetch-text.js";
import {
  fixturesEnabled,
  readFixture,
  SourceGapError,
  type Fetcher,
  type Reading,
} from "./types.js";

export const RBI_REFERENCE_URL = "https://www.rbi.org.in/scripts/ReferenceRateArchive.aspx";

/**
 * Parser for a simple table row that names USD and a rate.
 * The live RBI archive page fetched on 12 Oct 2026 did not include a rate table
 * (it is a form). TODO(verify) the request that returns the FBIL USD/INR reference rate.
 */
export function parseUsdInr(html: string): Reading[] {
  const row =
    /<tr[^>]*>[\s\S]*?USD\/INR[\s\S]*?(\d{4}-\d{2}-\d{2})[\s\S]*?(\d{2,3}\.\d{2,4})[\s\S]*?<\/tr>/i.exec(
      html,
    );
  if (!row?.[1] || !row[2]) return [];
  const value = Number(row[2]);
  if (!Number.isFinite(value)) return [];
  return [
    {
      key: "usd_inr",
      value,
      unit: "INR/USD",
      asOf: utcDate(row[1]),
      sourceUrl: RBI_REFERENCE_URL,
    },
  ];
}

export const usdInrFetcher: Fetcher = {
  key: "rbi_usd_inr",
  async fetch() {
    if (fixturesEnabled()) return parseUsdInr(readFixture("usd-inr.html"));
    const html = await fetchText(RBI_REFERENCE_URL);
    const readings = parseUsdInr(html);
    if (readings.length === 0) {
      throw new SourceGapError(
        "TODO(verify): RBI Reference Rate Archive did not contain a parseable USD/INR row. RBI cites FBIL. No confirmed public JSON endpoint was found.",
      );
    }
    return readings;
  },
};
