import { randomUUID } from "node:crypto";
import type {
  DataStore,
  DeviceRecord,
  DigestCopy,
  DigestRecord,
  NewReading,
  NewSignal,
  PlaybookRecord,
  ReadingRecord,
  SignalRecord,
  SourceHealthRecord,
} from "./types.js";

export class MemoryStore implements DataStore {
  devices: DeviceRecord[] = [];
  readings: ReadingRecord[] = [];
  signals: SignalRecord[] = [];
  digests: DigestRecord[] = [];
  health: SourceHealthRecord[] = [];
  playbooks: PlaybookRecord[] = [];

  async upsertDevice(input: {
    apnsToken: string;
    environment: DeviceRecord["environment"];
    language: DeviceRecord["language"];
    seenAt: Date;
  }): Promise<DeviceRecord> {
    const existing = this.devices.find((device) => device.apnsToken === input.apnsToken);
    if (existing) {
      existing.environment = input.environment;
      existing.language = input.language;
      existing.lastSeenAt = input.seenAt;
      return existing;
    }
    const created: DeviceRecord = {
      id: randomUUID(),
      apnsToken: input.apnsToken,
      environment: input.environment,
      language: input.language,
      createdAt: input.seenAt,
      lastSeenAt: input.seenAt,
    };
    this.devices.push(created);
    return created;
  }

  async listDevices(): Promise<DeviceRecord[]> {
    return [...this.devices];
  }

  async deleteDevice(id: string): Promise<void> {
    this.devices = this.devices.filter((device) => device.id !== id);
  }

  async insertReadings(rows: NewReading[]): Promise<void> {
    for (const row of rows) {
      const clash = this.readings.some(
        (existing) =>
          existing.indicatorKey === row.indicatorKey &&
          existing.asOf.getTime() === row.asOf.getTime(),
      );
      if (clash) continue;
      this.readings.push({ id: randomUUID(), ...row });
    }
  }

  async listReadingsSince(since: Date): Promise<ReadingRecord[]> {
    return this.readings
      .filter((row) => row.asOf.getTime() >= since.getTime())
      .sort((a, b) => a.asOf.getTime() - b.asOf.getTime());
  }

  async listReadings(): Promise<ReadingRecord[]> {
    return [...this.readings].sort((a, b) => a.asOf.getTime() - b.asOf.getTime());
  }

  async latestFetchedAt(): Promise<Date | null> {
    let latest: Date | null = null;
    for (const row of this.readings) {
      if (!latest || row.fetchedAt.getTime() > latest.getTime()) latest = row.fetchedAt;
    }
    return latest;
  }

  async insertSignals(rows: NewSignal[]): Promise<void> {
    const createdAt = new Date();
    for (const row of rows) {
      this.signals.push({ id: randomUUID(), createdAt, ...row });
    }
  }

  async listSignalsSince(since: Date): Promise<SignalRecord[]> {
    return this.signals.filter((row) => row.asOf.getTime() >= since.getTime());
  }

  async latestSignals(): Promise<SignalRecord[]> {
    const byKey = new Map<string, SignalRecord>();
    for (const row of this.signals) {
      const current = byKey.get(row.indicatorKey);
      if (!current || row.createdAt.getTime() >= current.createdAt.getTime()) {
        byKey.set(row.indicatorKey, row);
      }
    }
    return [...byKey.values()];
  }

  async getDigest(digestDate: string): Promise<DigestRecord | null> {
    return this.digests.find((digest) => digest.digestDate === digestDate) ?? null;
  }

  async latestDigest(): Promise<DigestRecord | null> {
    return [...this.digests].sort((a, b) => (a.digestDate < b.digestDate ? 1 : -1))[0] ?? null;
  }

  async insertDigest(
    input: DigestCopy & { digestDate: string; signalsJson: unknown },
  ): Promise<DigestRecord> {
    const existing = await this.getDigest(input.digestDate);
    if (existing) return existing;
    const created: DigestRecord = {
      id: randomUUID(),
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
      pushSentAt: null,
      stockUpAlertSentAt: null,
      createdAt: new Date(),
    };
    this.digests.push(created);
    return created;
  }

  async markPushSent(digestDate: string, sentAt: Date): Promise<void> {
    const digest = await this.getDigest(digestDate);
    if (digest && !digest.pushSentAt) digest.pushSentAt = sentAt;
  }

  async markStockUpAlertSent(digestDate: string, sentAt: Date): Promise<void> {
    const digest = await this.getDigest(digestDate);
    if (digest && !digest.stockUpAlertSentAt) digest.stockUpAlertSentAt = sentAt;
  }

  async upsertSourceHealth(input: {
    key: string;
    lastSuccessAt: Date | null;
    lastError: string | null;
    updatedAt: Date;
  }): Promise<void> {
    const existing = this.health.find((row) => row.key === input.key);
    if (existing) {
      existing.lastSuccessAt = input.lastSuccessAt;
      existing.lastError = input.lastError;
      existing.updatedAt = input.updatedAt;
      return;
    }
    this.health.push({ ...input });
  }

  async listSourceHealth(): Promise<SourceHealthRecord[]> {
    return [...this.health];
  }

  async upsertPlaybooks(rows: PlaybookRecord[]): Promise<void> {
    for (const row of rows) {
      const index = this.playbooks.findIndex((item) => item.topic === row.topic);
      if (index >= 0) this.playbooks[index] = row;
      else this.playbooks.push(row);
    }
  }

  async listPlaybooks(): Promise<PlaybookRecord[]> {
    return [...this.playbooks];
  }
}
