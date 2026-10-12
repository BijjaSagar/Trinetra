import { utcDate } from "../domain/time.js";
import { fetchText } from "../http/fetch-text.js";
import {
  fixturesEnabled,
  readFixture,
  SourceGapError,
  type Fetcher,
  type Reading,
} from "./types.js";

export const CWC_BULLETIN_URL = "https://cwc.gov.in/reservoir-level-storage-bulletin";

/**
 * Pulls the all-India sentence used in CWC bulletin text, for example the
 * 7 Oct 2021 bulletin: "which is 82% of total live storage capacity".
 * TODO(verify): current weekly PDF extraction. The index page does not include the figure.
 */
export function parseCwcNational(text: string, asOfIso: string): Reading[] {
  const match = /which is\s+([0-9]+(?:\.[0-9]+)?)%\s+of total live storage capacity/i.exec(text);
  if (!match?.[1]) return [];
  return [
    {
      key: "cwc_national_pct",
      value: Number(match[1]),
      unit: "percent",
      asOf: utcDate(asOfIso),
      sourceUrl: CWC_BULLETIN_URL,
    },
  ];
}

export const cwcFetcher: Fetcher = {
  key: "cwc",
  async fetch() {
    if (fixturesEnabled()) {
      const text = readFixture("cwc-bulletin.txt");
      const date = /^as_of:\s*(\d{4}-\d{2}-\d{2})/m.exec(text)?.[1] ?? "2021-10-07";
      return parseCwcNational(text, date);
    }
    const html = await fetchText(CWC_BULLETIN_URL);
    const readings = parseCwcNational(html, new Date().toISOString().slice(0, 10));
    if (readings.length === 0) {
      throw new SourceGapError(
        "TODO(verify): CWC publishes the national live-storage percent in a weekly PDF. The bulletin index HTML did not include the percentage, and PDF text extraction is not enabled.",
      );
    }
    return readings;
  },
};
