import { describe, expect, it } from "vitest";
import { evaluateSignals } from "../src/rules/engine.js";
import type { NewsFlags } from "../src/rules/news-flags.js";
import type { Reading } from "../src/fetchers/types.js";

const quiet: NewsFlags = {
  dutyCut: false,
  retailHikeAnnounced: false,
  supplyCutAnnounced: false,
  dutyOrGstHeadlines: [],
};

function reading(key: string, value: number, iso: string): Reading {
  return {
    key,
    value,
    unit: "unit",
    asOf: new Date(iso),
    sourceUrl: "https://example.com/source",
  };
}

function level(key: string, readings: Reading[], news: NewsFlags = quiet) {
  return evaluateSignals({ readings, news, now: new Date("2026-10-12T02:00:00.000Z") }).find(
    (signal) => signal.indicatorKey === key,
  );
}

describe("crude thresholds", () => {
  const past = reading("brent_usd", 100, "2026-10-01T00:00:00.000Z");

  it("stays normal at exactly 5 percent", () => {
    const signal = level("brent_usd", [
      past,
      reading("brent_usd", 105, "2026-10-08T00:00:00.000Z"),
    ]);
    expect(signal?.level).toBe("normal");
    expect(signal?.reasonCode).toBe("within_threshold");
  });

  it("watches just above 5 percent and at exactly 10 percent", () => {
    expect(
      level("brent_usd", [past, reading("brent_usd", 105.01, "2026-10-08T00:00:00.000Z")])?.level,
    ).toBe("watch");
    const atTen = level("brent_usd", [past, reading("brent_usd", 110, "2026-10-08T00:00:00.000Z")]);
    expect(atTen?.level).toBe("watch");
    expect(atTen?.reasonCode).toBe("crude_up_gt_5_7d");
  });

  it("stocks up above 10 percent", () => {
    const signal = level("brent_usd", [
      past,
      reading("brent_usd", 110.01, "2026-10-08T00:00:00.000Z"),
    ]);
    expect(signal?.level).toBe("stock_up");
    expect(signal?.reasonCode).toBe("crude_up_gt_10_7d");
  });

  it("stocks up when a retail hike is detected without a 10 percent move", () => {
    const signal = level("brent_usd", [reading("brent_usd", 100, "2026-10-08T00:00:00.000Z")], {
      ...quiet,
      retailHikeAnnounced: true,
    });
    expect(signal?.level).toBe("stock_up");
    expect(signal?.reasonCode).toBe("retail_hike_announced");
  });
});

describe("fuel, rupee, oil, water, metals", () => {
  it("treats any petrol or diesel change as stock up and an unchanged price as normal", () => {
    const same = level("petrol_solapur", [
      reading("petrol_solapur", 100, "2026-10-11T00:00:00.000Z"),
      reading("petrol_solapur", 100, "2026-10-12T00:00:00.000Z"),
    ]);
    expect(same?.level).toBe("normal");
    const changed = level("diesel_solapur", [
      reading("diesel_solapur", 90, "2026-10-11T00:00:00.000Z"),
      reading("diesel_solapur", 90.01, "2026-10-12T00:00:00.000Z"),
    ]);
    expect(changed?.level).toBe("stock_up");
    expect(changed?.reasonCode).toBe("diesel_price_changed");
  });

  it("watches the rupee only when it is weaker by more than 2 percent in 30 days", () => {
    const past = reading("usd_inr", 100, "2026-09-08T00:00:00.000Z");
    const current = "2026-10-08T00:00:00.000Z";
    expect(level("usd_inr", [past, reading("usd_inr", 102, current)])?.level).toBe("normal");
    expect(level("usd_inr", [past, reading("usd_inr", 102.01, current)])?.level).toBe("watch");
    expect(level("usd_inr", [past, reading("usd_inr", 99, current)])?.level).toBe("normal");
  });

  it("stocks up edible oil only above 3 percent with no duty cut", () => {
    const past = reading("fao_veg_oil_index", 100, "2026-08-01T00:00:00.000Z");
    const month = "2026-09-01T00:00:00.000Z";
    expect(
      level("fao_veg_oil_index", [past, reading("fao_veg_oil_index", 103, month)])?.level,
    ).toBe("normal");
    const up = level("fao_veg_oil_index", [past, reading("fao_veg_oil_index", 103.01, month)]);
    expect(up?.level).toBe("stock_up");
    expect(up?.reasonCode).toBe("fao_up_gt_3_month_no_duty_cut");
    const falling = level("fao_veg_oil_index", [past, reading("fao_veg_oil_index", 99, month)]);
    expect(falling?.reasonCode).toBe("fao_index_falling");
    const cut = level("fao_veg_oil_index", [past, reading("fao_veg_oil_index", 110, month)], {
      ...quiet,
      dutyCut: true,
    });
    expect(cut?.level).toBe("normal");
    expect(cut?.reasonCode).toBe("fao_duty_cut");
  });

  it("uses strict Ujani thresholds and October in Asia/Kolkata", () => {
    expect(level("ujani_pct", [reading("ujani_pct", 40, "2026-10-12T00:00:00.000Z")])?.level).toBe(
      "normal",
    );
    expect(
      level("ujani_pct", [reading("ujani_pct", 39.99, "2026-10-12T00:00:00.000Z")])?.level,
    ).toBe("watch");
    expect(level("ujani_pct", [reading("ujani_pct", 25, "2026-10-12T00:00:00.000Z")])?.level).toBe(
      "watch",
    );
    expect(
      level("ujani_pct", [reading("ujani_pct", 24.99, "2026-10-12T00:00:00.000Z")])?.reasonCode,
    ).toBe("ujani_below_25");
    expect(level("ujani_pct", [reading("ujani_pct", 39, "2026-09-30T20:00:00.000Z")])?.level).toBe(
      "watch",
    );
    expect(level("ujani_pct", [reading("ujani_pct", 39, "2026-10-31T18:30:00.000Z")])?.level).toBe(
      "normal",
    );
    const cut = level("ujani_pct", [reading("ujani_pct", 90, "2026-10-12T00:00:00.000Z")], {
      ...quiet,
      supplyCutAnnounced: true,
    });
    expect(cut?.level).toBe("stock_up");
    expect(cut?.reasonCode).toBe("ujani_supply_cut");
  });

  it("watches gold or silver above 3 percent and stores the three drivers", () => {
    const past = reading("gold_inr_10g", 100, "2026-10-01T00:00:00.000Z");
    const flat = level("gold_inr_10g", [
      past,
      reading("gold_inr_10g", 103, "2026-10-08T00:00:00.000Z"),
    ]);
    expect(flat?.level).toBe("normal");
    const rising = level(
      "gold_inr_10g",
      [
        past,
        reading("gold_inr_10g", 103.01, "2026-10-08T00:00:00.000Z"),
        reading("gold_usd_oz", 100, "2026-10-01T00:00:00.000Z"),
        reading("gold_usd_oz", 101, "2026-10-08T00:00:00.000Z"),
        reading("usd_inr", 100, "2026-10-01T00:00:00.000Z"),
        reading("usd_inr", 101, "2026-10-08T00:00:00.000Z"),
      ],
      { ...quiet, dutyOrGstHeadlines: ["Gold imports to attract 3% IGST"] },
    );
    expect(rising?.level).toBe("watch");
    const drivers = rising?.details?.drivers as {
      globalUsdChange7dPct: number;
      usdInrChange7dPct: number;
      importDutyOrGstNews: string;
    };
    expect(drivers.globalUsdChange7dPct).toBe(1);
    expect(drivers.usdInrChange7dPct).toBe(1);
    expect(drivers.importDutyOrGstNews).toContain("IGST");
  });

  it("keeps food and national reservoirs informational", () => {
    expect(
      level("cwc_national_pct", [reading("cwc_national_pct", 82, "2026-10-08T00:00:00.000Z")])
        ?.reasonCode,
    ).toBe("cwc_informational");
    expect(
      level("onion_solapur_rs_kg", [reading("onion_solapur_rs_kg", 30, "2026-10-12T00:00:00.000Z")])
        ?.level,
    ).toBe("normal");
  });
});
