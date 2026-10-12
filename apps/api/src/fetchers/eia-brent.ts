import { utcDate } from "../domain/time.js";
import { fetchText } from "../http/fetch-text.js";
import { fixturesEnabled, readFixture, type Fetcher, type Reading } from "./types.js";

export const EIA_BRENT_URL =
  "https://api.eia.gov/v2/petroleum/pri/spt/data/?frequency=daily&data[0]=value&facets[series][]=RBRTE&sort[0][column]=period&sort[0][direction]=desc&length=1";

export const EIA_BRENT_SOURCE = "https://www.eia.gov/dnav/pet/hist/rbrted.htm";

interface EiaRow {
  period?: string;
  series?: string;
  value?: string | number;
}

export function parseEiaBrent(payload: unknown): Reading[] {
  if (!payload || typeof payload !== "object") return [];
  const response = (payload as { response?: { data?: unknown } }).response;
  if (!response || !Array.isArray(response.data)) return [];
  const readings: Reading[] = [];
  for (const item of response.data) {
    if (!item || typeof item !== "object") continue;
    const row = item as EiaRow;
    if (row.series && row.series !== "RBRTE") continue;
    if (typeof row.period !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(row.period)) continue;
    const value = typeof row.value === "number" ? row.value : Number(row.value);
    if (!Number.isFinite(value)) continue;
    readings.push({
      key: "brent_usd",
      value,
      unit: "USD/bbl",
      asOf: utcDate(row.period),
      sourceUrl: EIA_BRENT_SOURCE,
    });
  }
  return readings.slice(0, 1);
}

export const eiaBrentFetcher: Fetcher = {
  key: "eia_brent",
  async fetch() {
    if (fixturesEnabled()) return parseEiaBrent(JSON.parse(readFixture("eia-brent.json")));
    const apiKey = process.env.EIA_API_KEY;
    if (!apiKey) {
      throw new Error("EIA_API_KEY is not set. Brent uses the EIA Open Data API v2 series RBRTE.");
    }
    const body = await fetchText(`${EIA_BRENT_URL}&api_key=${encodeURIComponent(apiKey)}`);
    const readings = parseEiaBrent(JSON.parse(body) as unknown);
    if (readings.length === 0) throw new Error("EIA Brent response had no RBRTE value");
    return readings;
  },
};
