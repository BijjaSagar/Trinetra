import { config as loadDotenv } from "dotenv";
import { existsSync } from "node:fs";
import { z } from "zod";

export function loadEnvFiles(): void {
  for (const path of [".env", "../../.env"]) {
    if (existsSync(path)) loadDotenv({ path });
  }
}

const optional = z.string().min(1).optional();

export const envSchema = z.object({
  DATABASE_URL: optional,
  API_KEY: optional,
  ANTHROPIC_API_KEY: optional,
  CLAUDE_MODEL: z.string().min(1).default("claude-sonnet-4-5"),
  EIA_API_KEY: optional,
  APNS_KEY_P8: optional,
  APNS_KEY_ID: optional,
  APNS_TEAM_ID: optional,
  APNS_BUNDLE_ID: z.string().min(1).default("in.rhtechnology.trinetra"),
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().min(1).default("0.0.0.0"),
  TZ: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function readEnv(source: NodeJS.ProcessEnv = process.env): Env {
  return envSchema.parse(source);
}

export function requireEnv(names: string[], source: NodeJS.ProcessEnv = process.env): string[] {
  return names.filter((name) => !source[name] || source[name]?.trim() === "");
}
