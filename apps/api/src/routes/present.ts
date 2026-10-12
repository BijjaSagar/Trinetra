import { changeOver, roundPct } from "../domain/change.js";
import {
  INDICATOR_FRESHNESS_HOURS,
  FETCHER_FRESHNESS_HOURS,
  FETCHER_KEYS,
} from "../domain/indicators.js";
import { MS_PER_DAY, MS_PER_HOUR, kolkataDateString } from "../domain/time.js";
import {
  DISCLAIMER,
  TAGLINE,
  type DataStore,
  type Language,
  type SignalLevel,
} from "../db/types.js";
import { NOT_WORTH_IT, WORTH_BUFFER } from "../playbooks/content.js";

export interface LatestResponse {
  digest: {
    digestDate: string;
    headline: string;
    summary: string;
    language: Language;
    pushSentAt: string | null;
    stale: boolean;
  } | null;
  signals: SignalView[];
  tagline: typeof TAGLINE;
}

export interface SignalView {
  indicatorKey: string;
  level: SignalLevel;
  reasonCode: string;
  value: number | null;
  unit: string | null;
  change7dPct: number | null;
  asOf: string | null;
  sourceUrl: string | null;
  stale: boolean;
  details: Record<string, unknown> | null;
}

export async function latestPayload(
  store: DataStore,
  language: Language,
  now: Date,
): Promise<LatestResponse> {
  const digest = await store.latestDigest();
  const signals = await signalViews(store, now);
  const digestStale =
    digest === null
      ? false
      : digest.digestDate !== kolkataDateString(now) || signals.some((signal) => signal.stale);
  return {
    digest: digest
      ? {
          digestDate: digest.digestDate,
          headline: language === "mr" ? digest.headlineMr : digest.headlineEn,
          summary: language === "mr" ? digest.summaryMr : digest.summaryEn,
          language,
          pushSentAt: digest.pushSentAt ? digest.pushSentAt.toISOString() : null,
          stale: digestStale,
        }
      : null,
    signals,
    tagline: TAGLINE,
  };
}

export async function historyPayload(store: DataStore, days: number, now: Date) {
  const since = new Date(now.getTime() - days * MS_PER_DAY);
  const readings = await store.listReadingsSince(since);
  const signals = await store.listSignalsSince(since);
  const keys = [...new Set(readings.map((reading) => reading.indicatorKey))].sort();
  return {
    days,
    series: keys.map((indicatorKey) => ({
      indicatorKey,
      points: readings
        .filter((reading) => reading.indicatorKey === indicatorKey)
        .map((reading) => ({
          asOf: reading.asOf.toISOString(),
          value: reading.value,
          unit: reading.unit,
          level: levelAt(signals, indicatorKey, reading.asOf),
        })),
    })),
  };
}

export async function healthPayload(store: DataStore, now: Date) {
  const rows = await store.listSourceHealth();
  const sources = FETCHER_KEYS.map((key) => {
    const row = rows.find((item) => item.key === key);
    const last = row?.lastSuccessAt ?? null;
    const freshFor = FETCHER_FRESHNESS_HOURS[key] * MS_PER_HOUR;
    const stale = !last || now.getTime() - last.getTime() > freshFor;
    return {
      key,
      lastSuccessAt: last ? last.toISOString() : null,
      lastError: row?.lastError ?? null,
      stale,
    };
  });
  return { ok: sources.every((source) => !source.stale), sources };
}

export async function playbookPayload(store: DataStore, language: Language) {
  const rows = await store.listPlaybooks();
  const order = ["fuel_hike", "food_spike", "water_cut", "gold_volatility"];
  const cards = rows
    .slice()
    .sort((a, b) => order.indexOf(a.topic) - order.indexOf(b.topic))
    .map((row) => ({
      topic: row.topic,
      title: language === "mr" ? row.titleMr : row.titleEn,
      steps: language === "mr" ? row.stepsMr : row.stepsEn,
    }));
  return {
    language,
    worthBuffer: WORTH_BUFFER[language],
    notWorthIt: NOT_WORTH_IT[language],
    disclaimer: DISCLAIMER,
    cards,
  };
}

async function signalViews(store: DataStore, now: Date): Promise<SignalView[]> {
  const since = new Date(now.getTime() - 400 * MS_PER_DAY);
  const readings = await store.listReadingsSince(since);
  const latestSignals = await store.latestSignals();
  return latestSignals
    .slice()
    .sort((a, b) => a.indicatorKey.localeCompare(b.indicatorKey))
    .map((signal) => {
      const series = readings.filter((reading) => reading.indicatorKey === signal.indicatorKey);
      const latest = series[series.length - 1];
      const change = latest
        ? changeOver(
            series.map((point) => ({ value: point.value, asOf: point.asOf })),
            { value: latest.value, asOf: latest.asOf },
            7,
            3,
          )
        : null;
      const freshness = (INDICATOR_FRESHNESS_HOURS[signal.indicatorKey] ?? 48) * MS_PER_HOUR;
      const stale = !latest || now.getTime() - latest.asOf.getTime() > freshness;
      return {
        indicatorKey: signal.indicatorKey,
        level: signal.level,
        reasonCode: signal.reasonCode,
        value: latest?.value ?? null,
        unit: latest?.unit ?? null,
        change7dPct: change === null ? null : roundPct(change),
        asOf: latest ? latest.asOf.toISOString() : null,
        sourceUrl: latest?.sourceUrl ?? null,
        stale,
        details: signal.details,
      };
    });
}

function levelAt(
  signals: Awaited<ReturnType<DataStore["listSignalsSince"]>>,
  indicatorKey: string,
  asOf: Date,
): SignalLevel | null {
  const matches = signals.filter(
    (signal) => signal.indicatorKey === indicatorKey && signal.asOf.getTime() === asOf.getTime(),
  );
  matches.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return matches[0]?.level ?? null;
}
