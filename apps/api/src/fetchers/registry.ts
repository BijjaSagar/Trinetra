import { withTimeout } from "../http/fetch-text.js";
import { cwcFetcher } from "./cwc.js";
import { eiaBrentFetcher } from "./eia-brent.js";
import { faoVegOilFetcher } from "./fao-veg-oil.js";
import { foodFetcher } from "./food.js";
import { fuelSolapurFetcher } from "./fuel-solapur.js";
import { ibjaGoldFetcher } from "./ibja-gold.js";
import { ibjaSilverFetcher } from "./ibja-silver.js";
import { indianBasketFetcher } from "./indian-basket.js";
import { metalsUsdFetcher } from "./metals-usd.js";
import { newsSource } from "./news.js";
import type { Fetcher, Headline, NewsSource, Reading } from "./types.js";
import { ujaniFetcher } from "./ujani.js";
import { usdInrFetcher } from "./usd-inr.js";

export const fetchers: Fetcher[] = [
  eiaBrentFetcher,
  indianBasketFetcher,
  fuelSolapurFetcher,
  usdInrFetcher,
  faoVegOilFetcher,
  ibjaGoldFetcher,
  ibjaSilverFetcher,
  metalsUsdFetcher,
  ujaniFetcher,
  cwcFetcher,
  foodFetcher,
];

export const news: NewsSource = newsSource;

export interface SourceRun {
  readings: Reading[];
  headlines: Headline[];
  successes: string[];
  failures: { key: string; error: string }[];
}

const TIMEOUT_MS = 20_000;

export async function runAllSources(
  sources: Fetcher[] = fetchers,
  headlinesSource: NewsSource = news,
): Promise<SourceRun> {
  const readings: Reading[] = [];
  const successes: string[] = [];
  const failures: { key: string; error: string }[] = [];

  await Promise.all(
    sources.map(async (source) => {
      try {
        const rows = await withTimeout(source.fetch(), TIMEOUT_MS, source.key);
        readings.push(...rows);
        successes.push(source.key);
      } catch (error) {
        failures.push({ key: source.key, error: errorMessage(error) });
      }
    }),
  );

  let headlines: Headline[] = [];
  try {
    headlines = await withTimeout(headlinesSource.fetch(), TIMEOUT_MS, headlinesSource.key);
    successes.push(headlinesSource.key);
  } catch (error) {
    failures.push({ key: headlinesSource.key, error: errorMessage(error) });
  }

  return { readings, headlines, successes, failures };
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "unknown error";
}
