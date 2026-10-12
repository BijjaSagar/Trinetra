import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";
import { loadEnvFiles, readEnv } from "../env.js";
import { logger } from "../logger.js";

export async function migrate(databaseUrl: string): Promise<void> {
  const sql = postgres(databaseUrl, {
    max: 1,
    connect_timeout: 10,
    ssl: databaseUrl.includes("sslmode=require") ? "require" : undefined,
  });
  const here = path.dirname(fileURLToPath(import.meta.url));
  const dir = path.resolve(here, "../../drizzle");
  try {
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    const files = (await readdir(dir)).filter((name) => name.endsWith(".sql")).sort();
    for (const file of files) {
      const applied = await sql<
        { id: string }[]
      >`SELECT id FROM schema_migrations WHERE id = ${file}`;
      if (applied.length > 0) {
        logger.info({ file }, "migration already applied");
        continue;
      }
      const body = await readFile(path.join(dir, file), "utf8");
      await sql.unsafe(body);
      await sql`INSERT INTO schema_migrations (id) VALUES (${file})`;
      logger.info({ file }, "migration applied");
    }
  } finally {
    await sql.end({ timeout: 5 });
  }
}

async function main(): Promise<void> {
  loadEnvFiles();
  const env = readEnv();
  if (!env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Copy .env.example to .env and point it at Postgres.");
    process.exit(1);
  }
  await migrate(env.DATABASE_URL);
}

const isDirect =
  process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isDirect) {
  main().catch((error: unknown) => {
    logger.error({ err: error }, "migration failed");
    process.exit(1);
  });
}
