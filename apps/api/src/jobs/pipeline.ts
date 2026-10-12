import type { Logger } from "pino";
import { MS_PER_DAY } from "../domain/time.js";
import type { DataStore, ReadingRecord, SignalRecord } from "../db/types.js";
import { FETCHER_KEYS } from "../domain/indicators.js";
import { runAllSources } from "../fetchers/registry.js";
import type { Headline } from "../fetchers/types.js";
import { classifyHeadlines } from "../rules/news-flags.js";
import { evaluateSignals, type SignalDraft } from "../rules/engine.js";

export interface IngestResult {
  allFailed: boolean;
  readings: ReadingRecord[];
  signals: SignalDraft[];
  previousSignals: SignalRecord[];
  headlines: Headline[];
  failures: { key: string; error: string }[];
}

export async function ingest(
  store: DataStore,
  log: Logger,
  now = new Date(),
  options: { persist?: boolean } = {},
): Promise<IngestResult> {
  const persist = options.persist !== false;
  const run = await runAllSources();
  const previousHealth = persist ? await store.listSourceHealth() : [];
  for (const key of FETCHER_KEYS) {
    if (!persist) break;
    const failure = run.failures.find((item) => item.key === key);
    const previous = previousHealth.find((item) => item.key === key);
    if (failure) {
      await store.upsertSourceHealth({
        key,
        lastSuccessAt: previous?.lastSuccessAt ?? null,
        lastError: failure.error,
        updatedAt: now,
      });
      log.warn({ source: key, err: failure.error }, "source failed");
    } else if (run.successes.includes(key)) {
      await store.upsertSourceHealth({
        key,
        lastSuccessAt: now,
        lastError: null,
        updatedAt: now,
      });
    }
  }

  const fetchedAt = now;
  const fetchedRows: ReadingRecord[] = run.readings.map((reading) => ({
    id: `${reading.key}:${reading.asOf.toISOString()}`,
    indicatorKey: reading.key,
    value: reading.value,
    unit: reading.unit,
    asOf: reading.asOf,
    sourceUrl: reading.sourceUrl,
    fetchedAt,
  }));
  if (persist) {
    await store.insertReadings(
      fetchedRows.map((reading) => ({
        indicatorKey: reading.indicatorKey,
        value: reading.value,
        unit: reading.unit,
        asOf: reading.asOf,
        sourceUrl: reading.sourceUrl,
        fetchedAt: reading.fetchedAt,
      })),
    );
  }

  const stored = await store.listReadingsSince(new Date(now.getTime() - 400 * MS_PER_DAY));
  const readings = persist ? stored : mergeReadings(stored, fetchedRows);
  const news = classifyHeadlines(run.headlines);
  const signals = evaluateSignals({
    readings: readings.map((reading) => ({
      key: reading.indicatorKey,
      value: reading.value,
      unit: reading.unit,
      asOf: reading.asOf,
      sourceUrl: reading.sourceUrl,
    })),
    news,
    now,
  });
  const previousSignals = await store.latestSignals();
  if (persist) {
    await store.insertSignals(
      signals.map((signal) => ({
        indicatorKey: signal.indicatorKey,
        level: signal.level,
        reasonCode: signal.reasonCode,
        details: signal.details,
        asOf: signal.asOf,
      })),
    );
  }

  const attempts = FETCHER_KEYS.length;
  return {
    allFailed: run.successes.length === 0 && run.failures.length === attempts,
    readings,
    signals,
    previousSignals,
    headlines: run.headlines,
    failures: run.failures,
  };
}

function mergeReadings(stored: ReadingRecord[], fetched: ReadingRecord[]): ReadingRecord[] {
  const merged = [...stored];
  for (const row of fetched) {
    const exists = merged.some(
      (item) =>
        item.indicatorKey === row.indicatorKey && item.asOf.getTime() === row.asOf.getTime(),
    );
    if (!exists) merged.push(row);
  }
  return merged.sort((a, b) => a.asOf.getTime() - b.asOf.getTime());
}
