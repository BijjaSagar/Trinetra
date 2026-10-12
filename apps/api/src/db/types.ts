export const TAGLINE = "Be ready before the storm.";
export const BUNDLE_ID = "in.rhtechnology.trinetra";
export const DISCLAIMER = "Trinetra shares information and signals, not investment advice.";

export type SignalLevel = "normal" | "watch" | "stock_up";
export type Language = "en" | "mr";
export type ApnsEnvironment = "sandbox" | "production";
export type PlaybookTopic = "fuel_hike" | "food_spike" | "water_cut" | "gold_volatility";

export interface DeviceRecord {
  id: string;
  apnsToken: string;
  environment: ApnsEnvironment;
  language: Language;
  createdAt: Date;
  lastSeenAt: Date;
}

export interface ReadingRecord {
  id: string;
  indicatorKey: string;
  value: number;
  unit: string;
  asOf: Date;
  sourceUrl: string;
  fetchedAt: Date;
}

export interface SignalRecord {
  id: string;
  indicatorKey: string;
  level: SignalLevel;
  reasonCode: string;
  details: Record<string, unknown> | null;
  asOf: Date;
  createdAt: Date;
}

export interface DigestCopy {
  headlineEn: string;
  headlineMr: string;
  summaryEn: string;
  summaryMr: string;
  pushTitleEn: string;
  pushTitleMr: string;
  pushBodyEn: string;
  pushBodyMr: string;
}

export interface DigestRecord extends DigestCopy {
  id: string;
  digestDate: string;
  signalsJson: unknown;
  pushSentAt: Date | null;
  stockUpAlertSentAt: Date | null;
  createdAt: Date;
}

export interface SourceHealthRecord {
  key: string;
  lastSuccessAt: Date | null;
  lastError: string | null;
  updatedAt: Date;
}

export interface PlaybookRecord {
  topic: PlaybookTopic;
  titleEn: string;
  titleMr: string;
  stepsEn: string[];
  stepsMr: string[];
}

export interface NewReading {
  indicatorKey: string;
  value: number;
  unit: string;
  asOf: Date;
  sourceUrl: string;
  fetchedAt: Date;
}

export interface NewSignal {
  indicatorKey: string;
  level: SignalLevel;
  reasonCode: string;
  details: Record<string, unknown> | null;
  asOf: Date;
}

export interface DataStore {
  upsertDevice(input: {
    apnsToken: string;
    environment: ApnsEnvironment;
    language: Language;
    seenAt: Date;
  }): Promise<DeviceRecord>;
  listDevices(): Promise<DeviceRecord[]>;
  deleteDevice(id: string): Promise<void>;
  insertReadings(rows: NewReading[]): Promise<void>;
  listReadingsSince(since: Date): Promise<ReadingRecord[]>;
  listReadings(): Promise<ReadingRecord[]>;
  latestFetchedAt(): Promise<Date | null>;
  insertSignals(rows: NewSignal[]): Promise<void>;
  latestSignals(): Promise<SignalRecord[]>;
  listSignalsSince(since: Date): Promise<SignalRecord[]>;
  getDigest(digestDate: string): Promise<DigestRecord | null>;
  latestDigest(): Promise<DigestRecord | null>;
  insertDigest(
    input: DigestCopy & { digestDate: string; signalsJson: unknown },
  ): Promise<DigestRecord>;
  markPushSent(digestDate: string, sentAt: Date): Promise<void>;
  markStockUpAlertSent(digestDate: string, sentAt: Date): Promise<void>;
  upsertSourceHealth(input: {
    key: string;
    lastSuccessAt: Date | null;
    lastError: string | null;
    updatedAt: Date;
  }): Promise<void>;
  listSourceHealth(): Promise<SourceHealthRecord[]>;
  upsertPlaybooks(rows: Array<PlaybookRecord>): Promise<void>;
  listPlaybooks(): Promise<PlaybookRecord[]>;
}
