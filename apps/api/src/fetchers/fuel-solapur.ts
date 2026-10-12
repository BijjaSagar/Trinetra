import { utcDate } from "../domain/time.js";
import { fetchText } from "../http/fetch-text.js";
import {
  fixturesEnabled,
  readFixture,
  SourceGapError,
  type Fetcher,
  type Reading,
} from "./types.js";

/** Official PPAC series is metro cities, not Solapur. */
export const PPAC_METRO_RSP_URL =
  "https://ppac.gov.in/retail-selling-price-rsp-of-petrol-diesel-and-domestic-lpg/rsp-of-petrol-and-diesel-in-metro-cities-since-16-6-2017";

export function parseFuelSolapurCsv(csv: string): Reading[] {
  const readings: Reading[] = [];
  for (const line of csv.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith("#") || trimmed.startsWith("date")) continue;
    const [date, petrol, diesel] = trimmed.split(",");
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    const asOf = utcDate(date);
    if (petrol && Number.isFinite(Number(petrol))) {
      readings.push({
        key: "petrol_solapur",
        value: Number(petrol),
        unit: "INR/L",
        asOf,
        sourceUrl: "fixture://fuel-solapur.csv",
      });
    }
    if (diesel && Number.isFinite(Number(diesel))) {
      readings.push({
        key: "diesel_solapur",
        value: Number(diesel),
        unit: "INR/L",
        asOf,
        sourceUrl: "fixture://fuel-solapur.csv",
      });
    }
  }
  const latestDate = readings.reduce<number>((max, row) => Math.max(max, row.asOf.getTime()), 0);
  return readings.filter((row) => row.asOf.getTime() === latestDate);
}

export const fuelSolapurFetcher: Fetcher = {
  key: "fuel_solapur",
  async fetch() {
    if (fixturesEnabled()) return parseFuelSolapurCsv(readFixture("fuel-solapur.csv"));
    const html = await fetchText(PPAC_METRO_RSP_URL);
    if (!/solapur/i.test(html)) {
      throw new SourceGapError(
        "TODO(verify): PPAC retail selling prices cover Delhi, Mumbai, Chennai and Kolkata, not Solapur. No official Solapur petrol or diesel feed was confirmed.",
      );
    }
    throw new SourceGapError(
      "TODO(verify): Solapur appeared on the PPAC page but no price parser is confirmed for it.",
    );
  },
};
