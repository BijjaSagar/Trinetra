import { utcDate } from "../domain/time.js";
import { fetchText } from "../http/fetch-text.js";
import { fixturesEnabled, readFixture, type Fetcher, type Reading } from "./types.js";

/** Confirmed on the FAO food price index page on 12 Oct 2026. The older default-document-library path 404s. */
export const FAO_CSV_URL =
  "https://www.fao.org/media/docs/worldfoodsituationlibraries/wfs-library/food_price_indices_data.csv?sfvrsn=523ebd2a_84&download=true";

export const FAO_SOURCE = "https://www.fao.org/worldfoodsituation/foodpricesindex/en/";

export function parseFaoVegOil(csv: string): Reading[] {
  const lines = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const headerIndex = lines.findIndex(
    (line) => line.startsWith("Date,") && line.split(",").includes("Oils"),
  );
  if (headerIndex < 0) return [];
  const header = lines[headerIndex]?.split(",") ?? [];
  const oilsIndex = header.indexOf("Oils");
  if (oilsIndex < 0) return [];
  let latest: Reading | null = null;
  for (const line of lines.slice(headerIndex + 1)) {
    const cells = line.split(",");
    const period = cells[0]?.trim() ?? "";
    const raw = cells[oilsIndex]?.trim() ?? "";
    if (!/^\d{4}-\d{2}$/.test(period) || raw.length === 0) continue;
    const value = Number(raw);
    if (!Number.isFinite(value)) continue;
    latest = {
      key: "fao_veg_oil_index",
      value,
      unit: "index",
      asOf: utcDate(period),
      sourceUrl: FAO_SOURCE,
    };
  }
  return latest ? [latest] : [];
}

export const faoVegOilFetcher: Fetcher = {
  key: "fao_veg_oil",
  async fetch() {
    const csv = fixturesEnabled() ? readFixture("fao-veg-oil.csv") : await fetchText(FAO_CSV_URL);
    const readings = parseFaoVegOil(csv);
    if (readings.length === 0) throw new Error("FAO vegetable oil index CSV had no Oils value");
    return readings;
  },
};
