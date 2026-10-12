import { loadEnvFiles, readEnv } from "./env.js";
import { logger } from "./logger.js";
import { buildApp } from "./app.js";
import { openDatabase } from "./db/client.js";
import { migrate } from "./db/migrate.js";
import { ingest } from "./jobs/pipeline.js";
import { PLAYBOOKS } from "./playbooks/content.js";

async function main(): Promise<void> {
  loadEnvFiles();
  const env = readEnv();
  if (!env.DATABASE_URL || !env.API_KEY) {
    console.error("DATABASE_URL and API_KEY are required. Copy .env.example to .env.");
    process.exit(1);
  }
  await migrate(env.DATABASE_URL);
  const database = openDatabase(env.DATABASE_URL);
  await database.store.upsertPlaybooks(PLAYBOOKS);
  const app = await buildApp({
    store: database.store,
    apiKey: env.API_KEY,
    ingest: async () => {
      await ingest(database.store, logger);
    },
  });
  const close = async () => {
    await app.close();
    await database.close();
  };
  process.on("SIGINT", () => {
    void close().then(() => process.exit(0));
  });
  process.on("SIGTERM", () => {
    void close().then(() => process.exit(0));
  });
  await app.listen({ port: env.PORT, host: env.HOST });
}

main().catch((error: unknown) => {
  logger.error({ err: error }, "api failed to start");
  process.exit(1);
});
