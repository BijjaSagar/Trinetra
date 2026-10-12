import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parseCwcNational } from "../src/fetchers/cwc.js";
import { parseEiaBrent } from "../src/fetchers/eia-brent.js";
import { parseFaoVegOil } from "../src/fetchers/fao-veg-oil.js";
import { parseFoodCsv } from "../src/fetchers/food.js";
import { parseFuelSolapurCsv } from "../src/fetchers/fuel-solapur.js";
import { parseIbjaGold } from "../src/fetchers/ibja-gold.js";
import { parseIbjaSilver } from "../src/fetchers/ibja-silver.js";
import { parseIndianBasketCsv } from "../src/fetchers/indian-basket.js";
import { parseMetalsUsdCsv } from "../src/fetchers/metals-usd.js";
import { parseNewsRss } from "../src/fetchers/news.js";
import { parseUjani } from "../src/fetchers/ujani.js";
import { parseUsdInr } from "../src/fetchers/usd-inr.js";
import { classifyHeadlines } from "../src/rules/news-flags.js";

const fixtures = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "fixtures");

function fixture(name: string): string {
  return readFileSync(path.join(fixtures, name), "utf8");
}

describe("source parsers", () => {
  it("parses the EIA Brent envelope", () => {
    const [row] = parseEiaBrent(JSON.parse(fixture("eia-brent.json")));
    expect(row?.key).toBe("brent_usd");
    expect(row?.value).toBe(89.75);
    expect(row?.unit).toBe("USD/bbl");
    expect(row?.asOf.toISOString()).toBe("2026-08-28T00:00:00.000Z");
  });

  it("parses the FAO Oils column", () => {
    const [row] = parseFaoVegOil(fixture("fao-veg-oil.csv"));
    expect(row?.key).toBe("fao_veg_oil_index");
    expect(row?.value).toBe(198.6);
    expect(row?.asOf.toISOString()).toBe("2026-09-01T00:00:00.000Z");
  });

  it("scales IBJA fine gold from per gram to 10 grams", () => {
    const [row] = parseIbjaGold(fixture("ibja-gold.html"));
    expect(row?.value).toBe(148060);
    expect(row?.unit).toBe("INR/10g");
    expect(row?.asOf.toISOString()).toBe("2026-10-12T00:00:00.000Z");
    expect(parseIbjaSilver(fixture("ibja-gold.html"))).toEqual([]);
  });

  it("parses a confirmed silver snippet and the other fixture formats", () => {
    expect(parseIbjaSilver(fixture("ibja-silver.html"))[0]?.key).toBe("silver_inr_kg");
    expect(parseUsdInr(fixture("usd-inr.html"))[0]?.value).toBe(96.6149);
    expect(parseIndianBasketCsv(fixture("indian-basket.csv"))[0]?.value).toBe(71);
    const fuel = parseFuelSolapurCsv(fixture("fuel-solapur.csv"));
    expect(fuel.map((row) => row.key).sort()).toEqual(["diesel_solapur", "petrol_solapur"]);
    expect(parseUjani(fixture("ujani.txt"))[0]?.value).toBe(50);
    expect(parseCwcNational(fixture("cwc-bulletin.txt"), "2021-10-07")[0]?.value).toBe(82);
    expect(parseFoodCsv(fixture("food-solapur.csv"))).toHaveLength(4);
    expect(
      parseMetalsUsdCsv(fixture("metals-usd.csv"))
        .map((row) => row.key)
        .sort(),
    ).toEqual(["gold_usd_oz", "silver_usd_oz"]);
  });

  it("reads headlines and classifies duty, hike, and water language", () => {
    const headlines = parseNewsRss(fixture("news.xml"));
    expect(headlines).toHaveLength(2);
    expect(headlines[0]?.url).toBe("https://example.com");
    const flags = classifyHeadlines([
      ...headlines,
      { title: "No petrol price hike this week", url: "https://example.com/no", publishedAt: null },
      {
        title: "A petrol price hike is notified",
        url: "https://example.com/hike",
        publishedAt: null,
      },
      { title: "Solapur water cut announced", url: "https://example.com/water", publishedAt: null },
    ]);
    expect(flags.dutyCut).toBe(true);
    expect(flags.retailHikeAnnounced).toBe(true);
    expect(flags.supplyCutAnnounced).toBe(true);
    expect(flags.dutyOrGstHeadlines[0]).toContain("IGST");
  });
});
