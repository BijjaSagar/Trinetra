import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: {
    paths: [
      "req.headers.x-api-key",
      "req.headers.authorization",
      "apiKey",
      "ANTHROPIC_API_KEY",
      "EIA_API_KEY",
      "APNS_KEY_P8",
      "apnsToken",
    ],
    censor: "[redacted]",
  },
});

/** Log only the first 8 characters of an APNs device token. */
export function tokenPrefix(token: string): string {
  return token.replace(/\s+/g, "").slice(0, 8);
}
