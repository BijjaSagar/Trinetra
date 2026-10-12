import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Logger } from "pino";
import { loadEnvFiles, readEnv } from "../env.js";
import { logger, tokenPrefix } from "../logger.js";
import { openDatabase } from "../db/client.js";
import { migrate } from "../db/migrate.js";
import type { DataStore, DeviceRecord } from "../db/types.js";
import { kolkataDateString } from "../domain/time.js";
import { buildDigest, createClaudeModel } from "../digest/build.js";
import { buildDigestInput, staleDigestCopy, stockUpAlertCopy } from "../digest/template.js";
import { labelFor } from "../domain/indicators.js";
import { ingest, type IngestResult } from "./pipeline.js";
import { sendAlert, type ApnsConfig } from "../push/apns.js";
import { PLAYBOOKS } from "../playbooks/content.js";
import type { SignalDraft } from "../rules/engine.js";
import type { SignalRecord } from "../db/types.js";

export interface DailyOptions {
  store: DataStore;
  dryRun: boolean;
  now?: Date;
  log?: Logger;
  model?: ReturnType<typeof createClaudeModel> | null;
  push?: (
    device: DeviceRecord,
    title: string,
    body: string,
    digestDate: string,
    kind: "digest" | "stock_up" | "stale",
  ) => Promise<"sent" | "deleted" | "failed">;
  collect?: (store: DataStore, log: Logger, now: Date) => Promise<IngestResult>;
}

export interface DailyResult {
  digestDate: string;
  allSourcesFailed: boolean;
  savedDigest: boolean;
  scheduledPush: string;
  extraPush: string | null;
  headline: string;
  summary: string;
  pushBody: string;
}

export async function runDaily(options: DailyOptions): Promise<DailyResult> {
  const now = options.now ?? new Date();
  const log = options.log ?? logger;
  const digestDate = kolkataDateString(now);
  const outcome = options.collect
    ? await options.collect(options.store, log, now)
    : await ingest(options.store, log, now, { persist: !options.dryRun });
  const copy = outcome.allFailed
    ? staleDigestCopy()
    : (
        await buildDigest({
          input: buildDigestInput({
            digestDate,
            signals: outcome.signals,
            readings: outcome.readings.map((reading) => ({
              key: reading.indicatorKey,
              value: reading.value,
              unit: reading.unit,
              asOf: reading.asOf,
              sourceUrl: reading.sourceUrl,
            })),
            headlines: outcome.headlines,
          }),
          model: options.model ?? null,
          logger: log,
        })
      ).copy;

  const freshStockUp = extraPushText(outcome.signals, outcome.previousSignals);
  const extraBody = freshStockUp ? stockUpAlertCopy(freshStockUp.en, freshStockUp.mr).en : null;

  if (options.dryRun) {
    return {
      digestDate,
      allSourcesFailed: outcome.allFailed,
      savedDigest: false,
      scheduledPush: "skipped",
      extraPush: extraBody,
      headline: copy.headlineEn,
      summary: copy.summaryEn,
      pushBody: copy.pushBodyEn,
    };
  }

  const existing = await options.store.getDigest(digestDate);
  const digest = existing
    ? existing
    : await options.store.insertDigest({
        digestDate,
        ...copy,
        signalsJson: { signals: outcome.signals, headlines: outcome.headlines },
      });
  const savedDigest = !existing;

  const pushCopy = existing ?? digest;
  let scheduledPush: DailyResult["scheduledPush"] = "already_sent";
  if (!digest.pushSentAt) {
    scheduledPush = await deliver(
      options,
      digestDate,
      (device) => ({
        title: device.language === "mr" ? pushCopy.pushTitleMr : pushCopy.pushTitleEn,
        body: device.language === "mr" ? pushCopy.pushBodyMr : pushCopy.pushBodyEn,
      }),
      outcome.allFailed ? "stale" : "digest",
    );
    if (scheduledPush === "sent") await options.store.markPushSent(digestDate, now);
  }

  let extraPush: string | null = null;
  if (
    !outcome.allFailed &&
    freshStockUp &&
    !digest.stockUpAlertSentAt &&
    scheduledPush !== "failed"
  ) {
    const text = stockUpAlertCopy(freshStockUp.en, freshStockUp.mr);
    const result = await deliver(
      options,
      digestDate,
      (device) => ({
        title: device.language === "mr" ? "त्रिनेत्र" : "Trinetra",
        body: device.language === "mr" ? text.mr : text.en,
      }),
      "stock_up",
    );
    extraPush = result;
    if (result === "sent") await options.store.markStockUpAlertSent(digestDate, now);
  }

  return {
    digestDate,
    allSourcesFailed: outcome.allFailed,
    savedDigest,
    scheduledPush,
    extraPush,
    headline: copy.headlineEn,
    summary: copy.summaryEn,
    pushBody: copy.pushBodyEn,
  };
}

function extraPushText(
  signals: SignalDraft[],
  previous: SignalRecord[],
): { en: string; mr: string } | null {
  const fresh = signals.filter((signal) => {
    if (signal.level !== "stock_up") return false;
    const prior = previous.find((item) => item.indicatorKey === signal.indicatorKey);
    return prior?.level !== "stock_up";
  });
  const first = fresh[0];
  if (!first) return null;
  return {
    en: labelFor(first.indicatorKey, "en"),
    mr: labelFor(first.indicatorKey, "mr"),
  };
}

async function deliver(
  options: DailyOptions,
  digestDate: string,
  text: (device: DeviceRecord) => { title: string; body: string },
  kind: "digest" | "stock_up" | "stale",
): Promise<"sent" | "failed" | "no_devices" | "not_configured"> {
  const devices = await options.store.listDevices();
  if (devices.length === 0) {
    (options.log ?? logger).info({ kind }, "no devices registered");
    return "no_devices";
  }
  if (!options.push) {
    (options.log ?? logger).warn({ kind }, "APNs is not configured. Push skipped.");
    return "not_configured";
  }
  let sent = 0;
  let failed = 0;
  for (const device of devices) {
    const message = text(device);
    const result = await options.push(device, message.title, message.body, digestDate, kind);
    if (result === "deleted") await options.store.deleteDevice(device.id);
    if (result === "sent") sent += 1;
    if (result === "failed") failed += 1;
    (options.log ?? logger).info(
      { kind, tokenPrefix: tokenPrefix(device.apnsToken), result },
      "push result",
    );
  }
  if (sent > 0) return "sent";
  if (failed > 0) return "failed";
  return "sent";
}

async function main(): Promise<void> {
  loadEnvFiles();
  const env = readEnv();
  const dryRun = process.argv.includes("--dry-run");
  if (!env.DATABASE_URL) {
    console.error(
      "DATABASE_URL is not set. Copy .env.example to .env before running the daily job.",
    );
    process.exit(1);
  }
  await migrate(env.DATABASE_URL);
  const db = openDatabase(env.DATABASE_URL);
  try {
    await db.store.upsertPlaybooks(PLAYBOOKS);
    const model =
      env.ANTHROPIC_API_KEY && !dryRun
        ? createClaudeModel(env.ANTHROPIC_API_KEY, env.CLAUDE_MODEL)
        : null;
    const config = apnsConfig(env);
    const result = await runDaily({
      store: db.store,
      dryRun,
      model,
      push: config
        ? async (device, title, body, digestDate, kind) =>
            sendAlert({
              config,
              environment: device.environment,
              deviceToken: device.apnsToken,
              message: { title, body, digestDate, kind },
            })
        : undefined,
    });
    console.log(
      JSON.stringify(
        {
          dryRun,
          digestDate: result.digestDate,
          headline: result.headline,
          summary: result.summary,
          pushBody: result.pushBody,
          extraPush: result.extraPush,
          scheduledPush: result.scheduledPush,
          allSourcesFailed: result.allSourcesFailed,
        },
        null,
        2,
      ),
    );
    if (!dryRun && result.scheduledPush === "failed") process.exitCode = 1;
  } finally {
    await db.close();
  }
}

function apnsConfig(env: ReturnType<typeof readEnv>): ApnsConfig | null {
  if (!env.APNS_KEY_P8 || !env.APNS_KEY_ID || !env.APNS_TEAM_ID) return null;
  return {
    keyP8Base64: env.APNS_KEY_P8,
    keyId: env.APNS_KEY_ID,
    teamId: env.APNS_TEAM_ID,
    bundleId: env.APNS_BUNDLE_ID,
  };
}

const isDirect =
  process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isDirect) {
  main().catch((error: unknown) => {
    logger.error({ err: error }, "daily job failed");
    process.exit(1);
  });
}
