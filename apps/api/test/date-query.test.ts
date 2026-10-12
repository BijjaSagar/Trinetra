import { describe, expect, it } from "vitest";
import { drizzle } from "drizzle-orm/postgres-js";
import type { Logger } from "drizzle-orm/logger";
import postgres from "postgres";
import { PostgresStore } from "../src/db/postgres-store.js";

describe("timestamp filters", () => {
  it("binds dates as strings for postgres.js", async () => {
    const captured: unknown[][] = [];
    const logger: Logger = {
      logQuery(_query, params) {
        captured.push(params);
      },
    };
    const client = postgres("postgres://user:pass@127.0.0.1:1/trinetra", {
      max: 1,
      connect_timeout: 1,
    });
    const store = new PostgresStore(drizzle(client, { logger }));
    const since = new Date("2026-09-12T17:16:33.000Z");

    await expect(store.listReadingsSince(since)).rejects.toThrow();
    await expect(store.listSignalsSince(since)).rejects.toThrow();
    await client.end({ timeout: 1 });

    expect(captured).toHaveLength(2);
    for (const params of captured) {
      expect(params).toEqual(["2026-09-12T17:16:33.000Z"]);
    }
  });
});
