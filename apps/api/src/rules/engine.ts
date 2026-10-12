import { changeOver, roundPct } from "../domain/change.js";
import { kolkataMonth } from "../domain/time.js";
import type { Reading } from "../fetchers/types.js";
import type { SignalLevel } from "../db/types.js";
import { FOOD_KEYS } from "../domain/indicators.js";
import type { NewsFlags } from "./news-flags.js";
import { rulesConfig } from "./rules.config.js";

export interface SignalDraft {
  indicatorKey: string;
  level: SignalLevel;
  reasonCode: string;
  asOf: Date;
  details: Record<string, unknown> | null;
}

interface SeriesPoint {
  value: number;
  asOf: Date;
  unit: string;
  sourceUrl: string;
}

export function evaluateSignals(input: {
  readings: Reading[];
  news: NewsFlags;
  now: Date;
}): SignalDraft[] {
  const series = group(input.readings);
  const signals: SignalDraft[] = [];
  const crudeKeys = ["brent_usd", "indian_basket_usd"];
  const fuelChanged =
    priceChanged(series.get("petrol_solapur")) || priceChanged(series.get("diesel_solapur"));
  const retailHike = fuelChanged || input.news.retailHikeAnnounced;

  for (const key of crudeKeys) {
    const points = series.get(key);
    if (!points || points.length === 0) continue;
    signals.push(crudeSignal(key, points, retailHike));
  }

  for (const key of ["petrol_solapur", "diesel_solapur"] as const) {
    const points = series.get(key);
    if (!points || points.length === 0) continue;
    signals.push(fuelSignal(key, points));
  }

  const usd = series.get("usd_inr");
  if (usd && usd.length > 0) signals.push(usdSignal(usd));

  const fao = series.get("fao_veg_oil_index");
  if (fao && fao.length > 0) signals.push(faoSignal(fao, input.news.dutyCut));

  const ujani = series.get("ujani_pct");
  if (ujani && ujani.length > 0) {
    signals.push(ujaniSignal(ujani, input.news.supplyCutAnnounced));
  }

  for (const key of ["gold_inr_10g", "silver_inr_kg"] as const) {
    const points = series.get(key);
    if (!points || points.length === 0) continue;
    const driverKey = key === "gold_inr_10g" ? "gold_usd_oz" : "silver_usd_oz";
    signals.push(metalSignal(key, points, series.get(driverKey) ?? [], usd ?? [], input.news));
  }

  const cwc = series.get("cwc_national_pct");
  if (cwc && cwc.length > 0) {
    signals.push(informational("cwc_national_pct", cwc, "cwc_informational"));
  }
  for (const key of FOOD_KEYS) {
    const points = series.get(key);
    if (!points || points.length === 0) continue;
    signals.push(informational(key, points, "food_informational"));
  }

  return signals;
}

function group(readings: Reading[]): Map<string, SeriesPoint[]> {
  const map = new Map<string, SeriesPoint[]>();
  for (const reading of readings) {
    const list = map.get(reading.key) ?? [];
    list.push({
      value: reading.value,
      asOf: reading.asOf,
      unit: reading.unit,
      sourceUrl: reading.sourceUrl,
    });
    map.set(reading.key, list);
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.asOf.getTime() - b.asOf.getTime());
  }
  return map;
}

function latest(points: SeriesPoint[]): SeriesPoint {
  const point = points[points.length - 1];
  if (!point) throw new Error("empty series");
  return point;
}

function crudeSignal(key: string, points: SeriesPoint[], retailHike: boolean): SignalDraft {
  const current = latest(points);
  const change = changeOver(
    points,
    current,
    rulesConfig.crude.windowDays,
    rulesConfig.crude.slackDays,
  );
  let level: SignalLevel = "normal";
  let reasonCode = change === null ? "insufficient_history" : "within_threshold";
  if (change !== null && change > rulesConfig.crude.watchAbove7dPct) {
    level = "watch";
    reasonCode = "crude_up_gt_5_7d";
  }
  if (change !== null && change > rulesConfig.crude.stockUpAbove7dPct) {
    level = "stock_up";
    reasonCode = "crude_up_gt_10_7d";
  }
  if (retailHike) {
    level = "stock_up";
    if (reasonCode !== "crude_up_gt_10_7d") reasonCode = "retail_hike_announced";
  }
  return {
    indicatorKey: key,
    level,
    reasonCode,
    asOf: current.asOf,
    details: { change7dPct: change === null ? null : roundPct(change), retailHike },
  };
}

function fuelSignal(key: string, points: SeriesPoint[]): SignalDraft {
  const current = latest(points);
  const previous = points.length >= 2 ? points[points.length - 2] : undefined;
  if (!previous || previous.value === current.value) {
    return {
      indicatorKey: key,
      level: "normal",
      reasonCode: previous ? "fuel_unchanged" : "insufficient_history",
      asOf: current.asOf,
      details: null,
    };
  }
  return {
    indicatorKey: key,
    level: "stock_up",
    reasonCode: key === "petrol_solapur" ? "petrol_price_changed" : "diesel_price_changed",
    asOf: current.asOf,
    details: { previousValue: previous.value, value: current.value },
  };
}

function priceChanged(points: SeriesPoint[] | undefined): boolean {
  if (!points || points.length < 2) return false;
  const current = points[points.length - 1];
  const previous = points[points.length - 2];
  if (!current || !previous) return false;
  return current.value !== previous.value;
}

function usdSignal(points: SeriesPoint[]): SignalDraft {
  const current = latest(points);
  const change = changeOver(
    points,
    current,
    rulesConfig.usdInr.windowDays,
    rulesConfig.usdInr.slackDays,
  );
  const weaker = change !== null && change > rulesConfig.usdInr.watchAbove30dPct;
  return {
    indicatorKey: "usd_inr",
    level: weaker ? "watch" : "normal",
    reasonCode:
      change === null
        ? "insufficient_history"
        : weaker
          ? "inr_weaker_gt_2_30d"
          : "within_threshold",
    asOf: current.asOf,
    details: { change30dPct: change === null ? null : roundPct(change) },
  };
}

function faoSignal(points: SeriesPoint[], dutyCut: boolean): SignalDraft {
  const current = latest(points);
  const change = changeOver(points, current, rulesConfig.fao.windowDays, rulesConfig.fao.slackDays);
  if (dutyCut) {
    return signal("fao_veg_oil_index", "normal", "fao_duty_cut", current.asOf, {
      changeMonthPct: change === null ? null : roundPct(change),
      dutyCut: true,
    });
  }
  if (change !== null && change < 0) {
    return signal("fao_veg_oil_index", "normal", "fao_index_falling", current.asOf, {
      changeMonthPct: roundPct(change),
      dutyCut: false,
    });
  }
  if (change !== null && change > rulesConfig.fao.stockUpAboveMonthPct) {
    return signal("fao_veg_oil_index", "stock_up", "fao_up_gt_3_month_no_duty_cut", current.asOf, {
      changeMonthPct: roundPct(change),
      dutyCut: false,
    });
  }
  return signal(
    "fao_veg_oil_index",
    "normal",
    change === null ? "insufficient_history" : "within_threshold",
    current.asOf,
    { changeMonthPct: change === null ? null : roundPct(change), dutyCut: false },
  );
}

function ujaniSignal(points: SeriesPoint[], supplyCut: boolean): SignalDraft {
  const current = latest(points);
  if (current.value < rulesConfig.ujani.stockUpBelowPct || supplyCut) {
    return signal(
      "ujani_pct",
      "stock_up",
      supplyCut && !(current.value < rulesConfig.ujani.stockUpBelowPct)
        ? "ujani_supply_cut"
        : current.value < rulesConfig.ujani.stockUpBelowPct
          ? "ujani_below_25"
          : "ujani_supply_cut",
      current.asOf,
      { value: current.value, supplyCut },
    );
  }
  if (
    current.value < rulesConfig.ujani.watchBelowPct &&
    kolkataMonth(current.asOf) === rulesConfig.ujani.watchMonth
  ) {
    return signal("ujani_pct", "watch", "ujani_below_40_october", current.asOf, {
      value: current.value,
      supplyCut: false,
    });
  }
  return signal("ujani_pct", "normal", "within_threshold", current.asOf, {
    value: current.value,
    supplyCut: false,
  });
}

function metalSignal(
  key: string,
  points: SeriesPoint[],
  usdMetal: SeriesPoint[],
  usdInr: SeriesPoint[],
  news: NewsFlags,
): SignalDraft {
  const current = latest(points);
  const change = changeOver(
    points,
    current,
    rulesConfig.metals.windowDays,
    rulesConfig.metals.slackDays,
  );
  const globalChange =
    usdMetal.length > 0
      ? changeOver(
          usdMetal,
          latest(usdMetal),
          rulesConfig.metals.windowDays,
          rulesConfig.metals.slackDays,
        )
      : null;
  const fxChange =
    usdInr.length > 0
      ? changeOver(
          usdInr,
          latest(usdInr),
          rulesConfig.metals.windowDays,
          rulesConfig.metals.slackDays,
        )
      : null;
  const rising = change !== null && change > rulesConfig.metals.watchAbove7dPct;
  return signal(
    key,
    rising ? "watch" : "normal",
    rising ? "metal_up_gt_3_7d" : change === null ? "insufficient_history" : "within_threshold",
    current.asOf,
    {
      change7dPct: change === null ? null : roundPct(change),
      drivers: {
        globalUsdChange7dPct: globalChange === null ? null : roundPct(globalChange),
        usdInrChange7dPct: fxChange === null ? null : roundPct(fxChange),
        importDutyOrGstNews: news.dutyOrGstHeadlines[0] ?? null,
      },
    },
  );
}

function informational(key: string, points: SeriesPoint[], reasonCode: string): SignalDraft {
  const current = latest(points);
  return signal(key, "normal", reasonCode, current.asOf, null);
}

function signal(
  indicatorKey: string,
  level: SignalLevel,
  reasonCode: string,
  asOf: Date,
  details: Record<string, unknown> | null,
): SignalDraft {
  return { indicatorKey, level, reasonCode, asOf, details };
}
