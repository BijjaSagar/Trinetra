import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { PostgresStore } from "./postgres-store.js";

export function openDatabase(url: string): { store: PostgresStore; close: () => Promise<void> } {
  const sql = postgres(url, {
    max: 5,
    connect_timeout: 10,
    ssl: url.includes("sslmode=require") ? "require" : undefined,
  });
  const db = drizzle(sql);
  return {
    store: new PostgresStore(db),
    close: () => sql.end({ timeout: 5 }),
  };
}
