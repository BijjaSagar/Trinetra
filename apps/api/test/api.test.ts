import { describe, expect, it } from "vitest";
import pino from "pino";
import { buildApp } from "../src/app.js";
import { MemoryStore } from "../src/db/memory-store.js";
import { PLAYBOOKS } from "../src/playbooks/content.js";
import { TAGLINE, DISCLAIMER } from "../src/db/types.js";
import { runDaily } from "../src/jobs/daily.js";
import type { IngestResult } from "../src/jobs/pipeline.js";

const log = pino({ level: "silent" });
const token = "a".repeat(64);

async function client() {
  const store = new MemoryStore();
  await store.upsertPlaybooks(PLAYBOOKS);
  const app = await buildApp({
    store,
    apiKey: "test-key",
    enableRateLimit: false,
    now: () => new Date("2026-10-12T02:00:00.000Z"),
    ingest: async () => {
      await store.insertReadings([
        {
          indicatorKey: "brent_usd",
          value: 80,
          unit: "USD/bbl",
          asOf: new Date("2026-10-12T00:00:00.000Z"),
          sourceUrl: "https://www.eia.gov/dnav/pet/hist/rbrted.htm",
          fetchedAt: new Date("2026-10-12T02:00:00.000Z"),
        },
      ]);
    },
  });
  return { app, store };
}

describe("API contract", () => {
  it("requires the API key and returns the digest shape", async () => {
    const { app, store } = await client();
    const denied = await app.inject({ method: "GET", url: "/health" });
    expect(denied.statusCode).toBe(401);

    const registered = await app.inject({
      method: "POST",
      url: "/devices",
      headers: { "x-api-key": "test-key" },
      payload: { apnsToken: token, environment: "sandbox", language: "mr" },
    });
    expect(registered.statusCode).toBe(200);
    const body = registered.json();
    expect(body.id).toEqual(expect.any(String));
    expect(body.lastSeenAt).toBe("2026-10-12T02:00:00.000Z");

    const again = await app.inject({
      method: "POST",
      url: "/devices",
      headers: { "x-api-key": "test-key" },
      payload: { apnsToken: token, environment: "production", language: "en" },
    });
    expect(again.json().id).toBe(body.id);
    expect(await store.listDevices()).toHaveLength(1);

    const empty = await app.inject({
      method: "GET",
      url: "/digest/latest",
      headers: { "x-api-key": "test-key", "accept-language": "mr-IN,en;q=0.8" },
    });
    expect(empty.json()).toEqual({ digest: null, signals: [], tagline: TAGLINE });

    const playbooks = await app.inject({
      method: "GET",
      url: "/playbooks?lang=en",
      headers: { "x-api-key": "test-key" },
    });
    const cards = playbooks.json();
    expect(cards.disclaimer).toBe(DISCLAIMER);
    expect(cards.cards).toHaveLength(4);
    expect(cards.worthBuffer[0]).toBe("Cooking oil");
    expect(JSON.stringify(cards)).toContain("Do not store petrol at home");

    const health = await app.inject({
      method: "GET",
      url: "/health",
      headers: { "x-api-key": "test-key" },
    });
    expect(health.json().ok).toBe(false);
    expect(health.json().sources.every((source: { stale: boolean }) => source.stale)).toBe(true);
    expect(health.json().sources.length).toBeGreaterThan(0);

    const refreshed = await app.inject({
      method: "POST",
      url: "/refresh?lang=en",
      headers: { "x-api-key": "test-key" },
    });
    expect(refreshed.statusCode).toBe(200);
    expect(refreshed.json().tagline).toBe(TAGLINE);

    const history = await app.inject({
      method: "GET",
      url: "/signals/history?days=30",
      headers: { "x-api-key": "test-key" },
    });
    expect(history.json().days).toBe(30);
    expect(history.json().series[0].indicatorKey).toBe("brent_usd");
    await app.close();
  });

  it("rejects a bad language query", async () => {
    const { app } = await client();
    const response = await app.inject({
      method: "GET",
      url: "/digest/latest?lang=hi",
      headers: { "x-api-key": "test-key" },
    });
    expect(response.statusCode).toBe(400);
    await app.close();
  });
});

describe("daily job", () => {
  it("saves one digest and one extra stock-up push, then does not repeat them", async () => {
    const store = new MemoryStore();
    await store.upsertDevice({
      apnsToken: token,
      environment: "sandbox",
      language: "en",
      seenAt: new Date("2026-10-12T02:00:00.000Z"),
    });
    const pushes: string[] = [];
    const collect = async (): Promise<IngestResult> => {
      const previousSignals = await store.latestSignals();
      const asOf = new Date("2026-10-12T00:00:00.000Z");
      await store.insertReadings([
        {
          indicatorKey: "petrol_solapur",
          value: 101,
          unit: "INR/L",
          asOf,
          sourceUrl: "fixture://fuel",
          fetchedAt: asOf,
        },
      ]);
      await store.insertSignals([
        {
          indicatorKey: "petrol_solapur",
          level: "stock_up",
          reasonCode: "petrol_price_changed",
          details: null,
          asOf,
        },
      ]);
      return {
        allFailed: false,
        readings: await store.listReadings(),
        signals: [
          {
            indicatorKey: "petrol_solapur",
            level: "stock_up",
            reasonCode: "petrol_price_changed",
            asOf,
            details: null,
          },
        ],
        previousSignals,
        headlines: [],
        failures: [],
      };
    };
    const first = await runDaily({
      store,
      dryRun: false,
      now: new Date("2026-10-12T02:00:00.000Z"),
      log,
      model: null,
      collect,
      push: async (_device, _title, body) => {
        pushes.push(body);
        expect([...body].length).toBeLessThanOrEqual(120);
        return "sent";
      },
    });
    const second = await runDaily({
      store,
      dryRun: false,
      now: new Date("2026-10-12T03:00:00.000Z"),
      log,
      model: null,
      collect,
      push: async (_device, _title, body) => {
        pushes.push(body);
        return "sent";
      },
    });
    expect(first.savedDigest).toBe(true);
    expect(second.savedDigest).toBe(false);
    expect(store.digests).toHaveLength(1);
    expect(first.scheduledPush).toBe("sent");
    expect(second.scheduledPush).toBe("already_sent");
    expect(pushes).toHaveLength(2);
    expect(pushes[1]).toContain("stock up");
    expect(second.extraPush).toBeNull();
  });

  it("prints a stale push on total failure without saving during dry-run", async () => {
    const store = new MemoryStore();
    const result = await runDaily({
      store,
      dryRun: true,
      now: new Date("2026-10-12T02:00:00.000Z"),
      log,
      model: null,
      collect: async () => ({
        allFailed: true,
        readings: [],
        signals: [],
        previousSignals: [],
        headlines: [],
        failures: [{ key: "eia_brent", error: "down" }],
      }),
      push: async () => "sent",
    });
    expect(result.pushBody.toLowerCase()).toContain("stale");
    expect(result.savedDigest).toBe(false);
    expect(store.digests).toHaveLength(0);
  });
});
