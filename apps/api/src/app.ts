import { createHash, timingSafeEqual } from "node:crypto";
import rateLimit from "@fastify/rate-limit";
import Fastify, { type FastifyInstance } from "fastify";
import { z } from "zod";
import { logger } from "./logger.js";
import type { DataStore } from "./db/types.js";
import { MS_PER_HOUR } from "./domain/time.js";
import { healthPayload, historyPayload, latestPayload, playbookPayload } from "./routes/present.js";

const languageSchema = z.enum(["en", "mr"]);

const deviceBody = z.object({
  apnsToken: z.string().trim().min(32).max(256),
  environment: z.enum(["sandbox", "production"]),
  language: languageSchema,
});

export interface AppDeps {
  store: DataStore;
  apiKey: string;
  now?: () => Date;
  ingest?: () => Promise<void>;
  enableRateLimit?: boolean;
}

export async function buildApp(deps: AppDeps): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });
  const now = () => deps.now?.() ?? new Date();

  if (deps.enableRateLimit !== false) {
    await app.register(rateLimit, { global: true, max: 120, timeWindow: "1 minute" });
  }

  app.addHook("onRequest", async (request, reply) => {
    const header = request.headers["x-api-key"];
    const provided = Array.isArray(header) ? header[0] : header;
    if (!provided || !safeEqual(provided, deps.apiKey)) {
      return reply.code(401).send({ error: "unauthorized" });
    }
  });

  app.setErrorHandler((error, request, reply) => {
    logger.error(
      { err: error, method: request.method, path: request.url.split("?")[0] },
      "request failed",
    );
    const status =
      typeof error === "object" &&
      error !== null &&
      "statusCode" in error &&
      typeof error.statusCode === "number"
        ? error.statusCode
        : 500;
    if (status >= 500) return reply.code(500).send({ error: "internal_error" });
    return reply.code(status).send({ error: "request_failed" });
  });

  app.post("/devices", async (request, reply) => {
    const body = deviceBody.safeParse(request.body);
    if (!body.success) return invalid(reply, body.error.flatten());
    const device = await deps.store.upsertDevice({
      apnsToken: body.data.apnsToken,
      environment: body.data.environment,
      language: body.data.language,
      seenAt: now(),
    });
    return reply.code(200).send({ id: device.id, lastSeenAt: device.lastSeenAt.toISOString() });
  });

  app.get("/digest/latest", async (request, reply) => {
    const language = readLanguage(request.query, request.headers["accept-language"]);
    if (!language.ok) return invalid(reply, language.details);
    return latestPayload(deps.store, language.language, now());
  });

  app.get("/signals/history", async (request, reply) => {
    const query = z
      .object({
        days: z.coerce.number().int().min(1).max(365).default(30),
        lang: languageSchema.optional(),
      })
      .safeParse(request.query);
    if (!query.success) return invalid(reply, query.error.flatten());
    const language = readLanguage({ lang: query.data.lang }, request.headers["accept-language"]);
    if (!language.ok) return invalid(reply, language.details);
    return historyPayload(deps.store, query.data.days, now());
  });

  app.post(
    "/refresh",
    {
      config: {
        rateLimit: {
          max: 6,
          timeWindow: "1 hour",
        },
      },
    },
    async (request, reply) => {
      const language = readLanguage(request.query, request.headers["accept-language"]);
      if (!language.ok) return invalid(reply, language.details);
      const latest = await deps.store.latestFetchedAt();
      const current = now();
      const olderThanSixHours = !latest || current.getTime() - latest.getTime() > 6 * MS_PER_HOUR;
      if (olderThanSixHours && deps.ingest) await deps.ingest();
      return latestPayload(deps.store, language.language, current);
    },
  );

  app.get("/health", async (_request, reply) => {
    return reply.code(200).send(await healthPayload(deps.store, now()));
  });

  app.get("/playbooks", async (request, reply) => {
    const language = readLanguage(request.query, request.headers["accept-language"]);
    if (!language.ok) return invalid(reply, language.details);
    return playbookPayload(deps.store, language.language);
  });

  return app;
}

function readLanguage(
  query: unknown,
  acceptLanguage: string | string[] | undefined,
): { ok: true; language: "en" | "mr" } | { ok: false; details: unknown } {
  const parsed = z.object({ lang: languageSchema.optional() }).safeParse(query ?? {});
  if (!parsed.success) return { ok: false, details: parsed.error.flatten() };
  if (parsed.data.lang) return { ok: true, language: parsed.data.lang };
  const header = Array.isArray(acceptLanguage) ? acceptLanguage.join(",") : acceptLanguage;
  return { ok: true, language: languageFromHeader(header) };
}

export function languageFromHeader(header: string | undefined): "en" | "mr" {
  if (!header) return "en";
  const tags = header.split(",").map((part) => part.split(";")[0]?.trim().toLowerCase() ?? "");
  for (const tag of tags) {
    if (tag.startsWith("mr")) return "mr";
    if (tag.startsWith("en")) return "en";
  }
  return "en";
}

function safeEqual(provided: string, expected: string): boolean {
  const left = createHash("sha256").update(provided).digest();
  const right = createHash("sha256").update(expected).digest();
  return timingSafeEqual(left, right);
}

function invalid(
  reply: { code: (status: number) => { send: (body: unknown) => unknown } },
  details: unknown,
) {
  return reply.code(400).send({ error: "invalid_request", details });
}
