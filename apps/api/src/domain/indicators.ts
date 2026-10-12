/** Indicator keys stored on readings. Food keys are Phase 1 choices. */
export const INDICATOR_KEYS = [
  "brent_usd",
  "indian_basket_usd",
  "petrol_solapur",
  "diesel_solapur",
  "usd_inr",
  "fao_veg_oil_index",
  "gold_inr_10g",
  "silver_inr_kg",
  "gold_usd_oz",
  "silver_usd_oz",
  "ujani_pct",
  "cwc_national_pct",
  "onion_solapur_rs_kg",
  "tomato_solapur_rs_kg",
  "wheat_solapur_rs_kg",
  "tur_solapur_rs_kg",
] as const;

export type IndicatorKey = (typeof INDICATOR_KEYS)[number];

/** Food keys chosen for Solapur retail monitoring. Sources are not confirmed. */
export const FOOD_KEYS = [
  "onion_solapur_rs_kg",
  "tomato_solapur_rs_kg",
  "wheat_solapur_rs_kg",
  "tur_solapur_rs_kg",
] as const;

export const FETCHER_KEYS = [
  "eia_brent",
  "ppac_indian_basket",
  "fuel_solapur",
  "rbi_usd_inr",
  "fao_veg_oil",
  "ibja_gold",
  "ibja_silver",
  "metals_usd",
  "ujani",
  "cwc",
  "food_dca",
  "news",
] as const;

export type FetcherKey = (typeof FETCHER_KEYS)[number];

/** How old a successful fetch can be before /health marks it stale. */
export const FETCHER_FRESHNESS_HOURS: Record<FetcherKey, number> = {
  eia_brent: 96,
  ppac_indian_basket: 24 * 45,
  fuel_solapur: 48,
  rbi_usd_inr: 96,
  fao_veg_oil: 24 * 45,
  ibja_gold: 96,
  ibja_silver: 96,
  metals_usd: 96,
  ujani: 48,
  cwc: 24 * 10,
  food_dca: 96,
  news: 36,
};

export const INDICATOR_FRESHNESS_HOURS: Record<string, number> = {
  brent_usd: 96,
  indian_basket_usd: 24 * 45,
  petrol_solapur: 48,
  diesel_solapur: 48,
  usd_inr: 96,
  fao_veg_oil_index: 24 * 45,
  gold_inr_10g: 96,
  silver_inr_kg: 96,
  gold_usd_oz: 96,
  silver_usd_oz: 96,
  ujani_pct: 48,
  cwc_national_pct: 24 * 10,
  onion_solapur_rs_kg: 96,
  tomato_solapur_rs_kg: 96,
  wheat_solapur_rs_kg: 96,
  tur_solapur_rs_kg: 96,
};

export const INDICATOR_LABELS: Record<string, { en: string; mr: string }> = {
  brent_usd: { en: "Brent crude", mr: "ब्रेंट कच्चे तेल" },
  indian_basket_usd: { en: "Indian basket crude", mr: "भारतीय बास्केट कच्चे तेल" },
  petrol_solapur: { en: "petrol in Solapur", mr: "सोलापूर पेट्रोल" },
  diesel_solapur: { en: "diesel in Solapur", mr: "सोलापूर डिझेल" },
  usd_inr: { en: "the rupee", mr: "रुपया" },
  fao_veg_oil_index: { en: "cooking oil", mr: "खाद्यतेल" },
  gold_inr_10g: { en: "gold", mr: "सोने" },
  silver_inr_kg: { en: "silver", mr: "चांदी" },
  ujani_pct: { en: "Ujani dam", mr: "उजनी धरण" },
  cwc_national_pct: { en: "national reservoirs", mr: "राष्ट्रीय जलाशय" },
  onion_solapur_rs_kg: { en: "onion", mr: "कांदा" },
  tomato_solapur_rs_kg: { en: "tomato", mr: "टोमॅटो" },
  wheat_solapur_rs_kg: { en: "wheat", mr: "गहू" },
  tur_solapur_rs_kg: { en: "tur dal", mr: "तूर डाळ" },
};

export function labelFor(key: string, language: "en" | "mr"): string {
  return INDICATOR_LABELS[key]?.[language] ?? key;
}
