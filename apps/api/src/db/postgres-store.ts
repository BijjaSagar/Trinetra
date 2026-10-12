import { desc, eq, sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type {
  ApnsEnvironment,
  DataStore,
  DeviceRecord,
  DigestCopy,
  DigestRecord,
  Language,
  NewReading,
  NewSignal,
  PlaybookRecord,
  PlaybookTopic,
  ReadingRecord,
  SignalLevel,
  SignalRecord,
  SourceHealthRecord,
} from "./types.js";
import { devices, digests, playbooks, readings, signals, sourceHealth } from "./schema.js";

type Database = PostgresJsDatabase;

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function asLevel(value: string): SignalLevel {
  if (value === "normal" || value === "watch" || value === "stock_up") return value;
  throw new Error(`Unexpected signal level: ${value}`);
}

function asLanguage(value: string): Language {
  if (value === "en" || value === "mr") return value;
  throw new Error(`Unexpected language: ${value}`);
}

function asEnvironment(value: string): ApnsEnvironment {
  if (value === "sandbox" || value === "production") return value;
  throw new Error(`Unexpected environment: ${value}`);
}

export class PostgresStore implements DataStore {
  constructor(private readonly db: Database) {}

  async upsertDevice(input: {
    apnsToken: string;
    environment: ApnsEnvironment;
    language: Language;
    seenAt: Date;
  }): Promise<DeviceRecord> {
    const rows = await this.db
      .insert(devices)
      .values({
        apnsToken: input.apnsToken,
        environment: input.environment,
        language: input.language,
        lastSeenAt: input.seenAt,
      })
      .onConflictDoUpdate({
        target: devices.apnsToken,
        set: {
          environment: input.environment,
          language: input.language,
          lastSeenAt: input.seenAt,
        },
      })
      .returning();
    const row = rows[0];
    if (!row) throw new Error("Device upsert returned no row");
    return {
      id: row.id,
      apnsToken: row.apnsToken,
      environment: asEnvironment(row.environment),
      language: asLanguage(row.language),
      createdAt: row.createdAt,
      lastSeenAt: row.lastSeenAt,
    };
  }

  async listDevices(): Promise<DeviceRecord[]> {
    const rows = await this.db.select().from(devices);
    return rows.map((row) => ({
      id: row.id,
      apnsToken: row.apnsToken,
      environment: asEnvironment(row.environment),
      language: asLanguage(row.language),
      createdAt: row.createdAt,
      lastSeenAt: row.lastSeenAt,
    }));
  }

  async deleteDevice(id: string): Promise<void> {
    await this.db.delete(devices).where(eq(devices.id, id));
  }

  async insertReadings(rows: NewReading[]): Promise<void> {
    if (rows.length === 0) return;
    await this.db
      .insert(readings)
      .values(
        rows.map((row) => ({
          indicatorKey: row.indicatorKey,
          value: row.value,
          unit: row.unit,
          asOf: row.asOf,
          sourceUrl: row.sourceUrl,
          fetchedAt: row.fetchedAt,
        })),
      )
      .onConflictDoNothing({ target: [readings.indicatorKey, readings.asOf] });
  }

  async listReadingsSince(since: Date): Promise<ReadingRecord[]> {
    const rows = await this.db
      .select()
      .from(readings)
      .where(sql`${readings.asOf} >= ${since}`)
      .orderBy(readings.asOf);
    return rows.map(mapReading);
  }

  async listReadings(): Promise<ReadingRecord[]> {
    const rows = await this.db.select().from(readings).orderBy(readings.asOf);
    return rows.map(mapReading);
  }

  async latestFetchedAt(): Promise<Date | null> {
    const rows = await this.db
      .select({ fetchedAt: readings.fetchedAt })
      .from(readings)
      .orderBy(desc(readings.fetchedAt))
      .limit(1);
    return rows[0]?.fetchedAt ?? null;
  }

  async insertSignals(rows: NewSignal[]): Promise<void> {
    if (rows.length === 0) return;
    await this.db.insert(signals).values(
      rows.map((row) => ({
        indicatorKey: row.indicatorKey,
        level: row.level,
        reasonCode: row.reasonCode,
        detailsJson: row.details,
        asOf: row.asOf,
      })),
    );
  }

  async listSignalsSince(since: Date): Promise<SignalRecord[]> {
    const rows = await this.db
      .select()
      .from(signals)
      .where(sql`${signals.asOf} >= ${since}`);
    return rows.map((row) => ({
      id: row.id,
      indicatorKey: row.indicatorKey,
      level: asLevel(row.level),
      reasonCode: row.reasonCode,
      details: asRecord(row.detailsJson),
      asOf: row.asOf,
      createdAt: row.createdAt,
    }));
  }

  async latestSignals(): Promise<SignalRecord[]> {
    const rows = await this.db.select().from(signals).orderBy(desc(signals.createdAt)).limit(20000);
    const byKey = new Map<string, SignalRecord>();
    for (const row of rows) {
      if (byKey.has(row.indicatorKey)) continue;
      byKey.set(row.indicatorKey, {
        id: row.id,
        indicatorKey: row.indicatorKey,
        level: asLevel(row.level),
        reasonCode: row.reasonCode,
        details: asRecord(row.detailsJson),
        asOf: row.asOf,
        createdAt: row.createdAt,
      });
    }
    return [...byKey.values()];
  }

  async getDigest(digestDate: string): Promise<DigestRecord | null> {
    const rows = await this.db
      .select()
      .from(digests)
      .where(eq(digests.digestDate, digestDate))
      .limit(1);
    const row = rows[0];
    return row ? mapDigest(row) : null;
  }

  async latestDigest(): Promise<DigestRecord | null> {
    const rows = await this.db.select().from(digests).orderBy(desc(digests.digestDate)).limit(1);
    const row = rows[0];
    return row ? mapDigest(row) : null;
  }

  async insertDigest(
    input: DigestCopy & { digestDate: string; signalsJson: unknown },
  ): Promise<DigestRecord> {
    const inserted = await this.db
      .insert(digests)
      .values({
        digestDate: input.digestDate,
        headlineEn: input.headlineEn,
        headlineMr: input.headlineMr,
        summaryEn: input.summaryEn,
        summaryMr: input.summaryMr,
        pushTitleEn: input.pushTitleEn,
        pushTitleMr: input.pushTitleMr,
        pushBodyEn: input.pushBodyEn,
        pushBodyMr: input.pushBodyMr,
        signalsJson: input.signalsJson,
      })
      .onConflictDoNothing({ target: digests.digestDate })
      .returning();
    const row = inserted[0];
    if (row) return mapDigest(row);
    const existing = await this.getDigest(input.digestDate);
    if (!existing) throw new Error(`Digest ${input.digestDate} was not saved`);
    return existing;
  }

  async markPushSent(digestDate: string, sentAt: Date): Promise<void> {
    await this.db
      .update(digests)
      .set({ pushSentAt: sentAt })
      .where(sql`${digests.digestDate} = ${digestDate} AND ${digests.pushSentAt} IS NULL`);
  }

  async markStockUpAlertSent(digestDate: string, sentAt: Date): Promise<void> {
    await this.db
      .update(digests)
      .set({ stockUpAlertSentAt: sentAt })
      .where(sql`${digests.digestDate} = ${digestDate} AND ${digests.stockUpAlertSentAt} IS NULL`);
  }

  async upsertSourceHealth(input: {
    key: string;
    lastSuccessAt: Date | null;
    lastError: string | null;
    updatedAt: Date;
  }): Promise<void> {
    await this.db
      .insert(sourceHealth)
      .values(input)
      .onConflictDoUpdate({
        target: sourceHealth.key,
        set: {
          lastSuccessAt: input.lastSuccessAt,
          lastError: input.lastError,
          updatedAt: input.updatedAt,
        },
      });
  }

  async listSourceHealth(): Promise<SourceHealthRecord[]> {
    const rows = await this.db.select().from(sourceHealth);
    return rows.map((row) => ({
      key: row.key,
      lastSuccessAt: row.lastSuccessAt,
      lastError: row.lastError,
      updatedAt: row.updatedAt,
    }));
  }

  async upsertPlaybooks(rows: PlaybookRecord[]): Promise<void> {
    for (const row of rows) {
      await this.db
        .insert(playbooks)
        .values({
          topic: row.topic,
          titleEn: row.titleEn,
          titleMr: row.titleMr,
          stepsEn: row.stepsEn,
          stepsMr: row.stepsMr,
        })
        .onConflictDoUpdate({
          target: playbooks.topic,
          set: {
            titleEn: row.titleEn,
            titleMr: row.titleMr,
            stepsEn: row.stepsEn,
            stepsMr: row.stepsMr,
          },
        });
    }
  }

  async listPlaybooks(): Promise<PlaybookRecord[]> {
    const rows = await this.db.select().from(playbooks);
    return rows.map((row) => ({
      topic: row.topic as PlaybookTopic,
      titleEn: row.titleEn,
      titleMr: row.titleMr,
      stepsEn: asStringArray(row.stepsEn),
      stepsMr: asStringArray(row.stepsMr),
    }));
  }
}

function mapReading(row: typeof readings.$inferSelect): ReadingRecord {
  return {
    id: row.id,
    indicatorKey: row.indicatorKey,
    value: row.value,
    unit: row.unit,
    asOf: row.asOf,
    sourceUrl: row.sourceUrl,
    fetchedAt: row.fetchedAt,
  };
}

function mapDigest(row: typeof digests.$inferSelect): DigestRecord {
  return {
    id: row.id,
    digestDate: row.digestDate,
    headlineEn: row.headlineEn,
    headlineMr: row.headlineMr,
    summaryEn: row.summaryEn,
    summaryMr: row.summaryMr,
    pushTitleEn: row.pushTitleEn,
    pushTitleMr: row.pushTitleMr,
    pushBodyEn: row.pushBodyEn,
    pushBodyMr: row.pushBodyMr,
    signalsJson: row.signalsJson,
    pushSentAt: row.pushSentAt,
    stockUpAlertSentAt: row.stockUpAlertSentAt,
    createdAt: row.createdAt,
  };
}
