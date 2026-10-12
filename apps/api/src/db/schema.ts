import {
  date,
  doublePrecision,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const devices = pgTable("devices", {
  id: uuid("id").primaryKey().defaultRandom(),
  apnsToken: text("apns_token").notNull().unique(),
  environment: text("environment").notNull(),
  language: text("language").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
});

export const readings = pgTable(
  "readings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    indicatorKey: text("indicator_key").notNull(),
    value: doublePrecision("value").notNull(),
    unit: text("unit").notNull(),
    asOf: timestamp("as_of", { withTimezone: true }).notNull(),
    sourceUrl: text("source_url").notNull(),
    fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("readings_indicator_key_as_of_uq").on(table.indicatorKey, table.asOf),
    index("readings_key_as_of_idx").on(table.indicatorKey, table.asOf),
  ],
);

export const signals = pgTable(
  "signals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    indicatorKey: text("indicator_key").notNull(),
    level: text("level").notNull(),
    reasonCode: text("reason_code").notNull(),
    detailsJson: jsonb("details_json"),
    asOf: timestamp("as_of", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("signals_key_as_of_idx").on(table.indicatorKey, table.asOf)],
);

export const digests = pgTable("digests", {
  id: uuid("id").primaryKey().defaultRandom(),
  digestDate: date("digest_date").notNull().unique(),
  headlineEn: text("headline_en").notNull(),
  headlineMr: text("headline_mr").notNull(),
  summaryEn: text("summary_en").notNull(),
  summaryMr: text("summary_mr").notNull(),
  pushTitleEn: text("push_title_en").notNull(),
  pushTitleMr: text("push_title_mr").notNull(),
  pushBodyEn: text("push_body_en").notNull(),
  pushBodyMr: text("push_body_mr").notNull(),
  signalsJson: jsonb("signals_json").notNull(),
  pushSentAt: timestamp("push_sent_at", { withTimezone: true }),
  stockUpAlertSentAt: timestamp("stock_up_alert_sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const playbooks = pgTable("playbooks", {
  id: uuid("id").primaryKey().defaultRandom(),
  topic: text("topic").notNull().unique(),
  titleEn: text("title_en").notNull(),
  titleMr: text("title_mr").notNull(),
  stepsEn: jsonb("steps_en").notNull(),
  stepsMr: jsonb("steps_mr").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sourceHealth = pgTable("source_health", {
  key: text("key").primaryKey(),
  lastSuccessAt: timestamp("last_success_at", { withTimezone: true }),
  lastError: text("last_error"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
