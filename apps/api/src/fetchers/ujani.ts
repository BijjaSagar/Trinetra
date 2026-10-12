import { utcDate } from "../domain/time.js";
import { fetchText } from "../http/fetch-text.js";
import {
  fixturesEnabled,
  readFixture,
  SourceGapError,
  type Fetcher,
  type Reading,
} from "./types.js";

export const WRD_DAILY_REPORT_URL = "https://wrd.maharashtra.gov.in/";

/**
 * Accepts a single labeled line used by the fixture. The WRD site and Ujani SCADA
 * host were not confirmed as a stable parseable report on 12 Oct 2026.
 * TODO(verify): Maharashtra WRD daily storage bulletin for Ujani percent live storage.
 */
export function parseUjani(text: string): Reading[] {
  const match = /Ujani live storage:\s*([0-9]+(?:\.[0-9]+)?)%\s+as of\s+(\d{4}-\d{2}-\d{2})/i.exec(
    text,
  );
  if (!match?.[1] || !match[2]) return [];
  return [
    {
      key: "ujani_pct",
      value: Number(match[1]),
      unit: "percent",
      asOf: utcDate(match[2]),
      sourceUrl: WRD_DAILY_REPORT_URL,
    },
  ];
}

export const ujaniFetcher: Fetcher = {
  key: "ujani",
  async fetch() {
    if (fixturesEnabled()) return parseUjani(readFixture("ujani.txt"));
    const html = await fetchText(WRD_DAILY_REPORT_URL);
    const readings = parseUjani(html);
    if (readings.length === 0) {
      throw new SourceGapError(
        "TODO(verify): Maharashtra WRD daily storage report did not match a confirmed Ujani percent format. ujjaniscada.com did not resolve.",
      );
    }
    return readings;
  },
};
