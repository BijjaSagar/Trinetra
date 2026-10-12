# Trinetra

Personal morning digest for fuel, the rupee, cooking oil, food, gold, silver, and Solapur water. Tagline: **Be ready before the storm.**

The API is Node.js 20, TypeScript, Fastify, Drizzle, and Postgres. This machine may be on a newer Node 20-compatible release. The iPhone app lives in `apps/mobile` and is not part of the API package.

Signals are only `normal`, `watch`, and `stock_up`. The service does not place orders and does not suggest storing petrol at home. A household buffer is 2 to 4 weeks.

## Local setup

```bash
pnpm install
cp .env.example .env
```

Fill `DATABASE_URL` and `API_KEY`. The other keys can stay empty until you use that source.

Create the database, then:

```bash
pnpm db:migrate
pnpm dev
```

`pnpm dev` applies migrations again (they are skipped once recorded), seeds the four playbooks, and listens on port 3000. `GET /health` needs the `X-API-Key` header.

`pnpm test` and `pnpm typecheck` do not need Postgres.

Optional local demo, not for Railway:

```bash
TRINETRA_USE_FIXTURES=1 pnpm job:daily -- --dry-run
```

Fixture mode reads saved files, including synthetic ones. See `docs/sources.md`.

## Daily job

```bash
pnpm job:daily -- --dry-run
pnpm job:daily
```

The job fetches every source, computes signals, writes the digest, and sends one push. A second run on the same Asia/Kolkata date does not insert another digest or send the morning push again.

`--dry-run` prints the headline, summary, and push text. It does not write readings, signals, or the digest, and it does not send. It also does not call Claude, so a missing `ANTHROPIC_API_KEY` is fine.

If every source fails, the push text says the data is stale. Dry-run prints that line and does not send it.

There is at most one extra push that day, the first time a `stock_up` signal appears. Its APNs body includes `kind: "stock_up"`. The morning push uses `kind: "digest"`. The stale push uses `kind: "stale"`.

## Push test

```bash
pnpm push:test -- <apns-token>
pnpm push:test -- <apns-token> --production
```

Sandbox is the default (`api.sandbox.push.apple.com`). `--production` uses `api.push.apple.com`. If `APNS_KEY_P8`, `APNS_KEY_ID`, or `APNS_TEAM_ID` is missing, the script prints that and exits non-zero. It does not throw a stack trace. `APNS_BUNDLE_ID` defaults to `in.rhtechnology.trinetra`.

Logs store an 8-character token prefix, never the full device token and never the `.p8` key.

## Railway and Vercel

Railway runs the product. Vercel serves a one-page public site and does not build the iPhone app or the API.

| Host | What it runs | Config |
| --- | --- | --- |
| Railway API | Fastify from this repo root | `railway.toml` |
| Railway Postgres | Database | Railway plugin. Share `DATABASE_URL` with the API and the cron |
| Railway cron | `pnpm job:daily` at `0 2 * * *` UTC (7:30 AM IST) | `railway.cron.toml` |
| Vercel | Static page in `apps/web` | Root `vercel.json` (`outputDirectory`: `apps/web`) |

Keep the Railway root at the repository root. The workspace lockfile lives there. Do not point Railway at `apps/api` or `apps/mobile`.

`nixpacks.toml` uses Node 22 and installs pnpm 11.7.0 with npm. That pnpm release requires Node 22.13 or newer, and Railway's default Node 24 image cannot start it through Corepack.

- API start: `pnpm --filter @trinetra/api db:migrate && pnpm --filter @trinetra/api start`
- Cron command: `pnpm job:daily`
- Cron schedule: `0 2 * * *` (02:00 UTC, 7:30 AM IST)
- On the cron service, set the config-as-code path to `railway.cron.toml`. Leave `railway.toml` on the API service.
- Set `TZ=Asia/Kolkata` plus the variables in `.env.example` on the API and the cron service
- `API_KEY` belongs on the API service. Generate it in Railway. Do not commit it.
- Leave `TRINETRA_USE_FIXTURES` unset
- `APNS_KEY_P8` is the base64 of the `.p8` file, not the raw file in git
- `/health` requires `X-API-Key`, so the API service has no Railway healthcheck path

`GET /health` is still the freshness check for you and the app. Call it with the key.

Times are stored in UTC. `digestDate` and the cron date are Asia/Kolkata.

### Connect Railway from the dashboard

1. New project → Deploy from GitHub → `BijjaSagar/Trinetra`, branch `main`.
2. Name that service `api`. It should pick up `railway.toml`.
3. Add Postgres. On `api` and `cron`, set `DATABASE_URL` to the Postgres private URL variable reference.
4. Add a second service from the same repo and branch. Name it `cron`. Settings → Config-as-code → `railway.cron.toml`.
5. Set `TZ`, `CLAUDE_MODEL`, `APNS_BUNDLE_ID`, and the secret keys from `.env.example`. Put `API_KEY` on `api` only.

### Vercel

The public page is `apps/web`. The tagline on that page is "Be ready before the storm." It has no login and no prices.

Import the GitHub repo, or from this directory:

```bash
vercel link --yes --project trinetra
vercel deploy --prod --yes
vercel git connect https://github.com/BijjaSagar/Trinetra.git
```

Leave the Vercel root as the repository root so `vercel.json` publishes `apps/web`. If you set a root directory, set it to `apps/web` only. Do not set it to `apps/mobile`.

## What is not verified

Phase 5 (TestFlight and two weeks of real use) was not run. Source gaps are listed in `docs/sources.md`. Marathi playbook copy and the Marathi template lines need a human review before they are trusted. Claude is skipped when `ANTHROPIC_API_KEY` is empty, and the template digest is saved instead.

## Launch checklist

- [ ] Put `DATABASE_URL`, `API_KEY`, `ANTHROPIC_API_KEY`, `CLAUDE_MODEL`, and `EIA_API_KEY` on the API service
- [ ] Put `APNS_KEY_P8`, `APNS_KEY_ID`, `APNS_TEAM_ID`, and `APNS_BUNDLE_ID` on both the API and the cron service
- [ ] Confirm a sandbox push with `pnpm push:test` on a debug build, then a production push on TestFlight
- [ ] Run `pnpm job:daily -- --dry-run` once and read the printed digest
- [ ] Turn off fixture mode and run the live job for three mornings before trusting the 7:30 AM cron
- [ ] After two to four weeks, retune only the numbers in `apps/api/src/rules/rules.config.ts`
- [ ] Review the Marathi strings flagged in `docs/comms/backend.md`
- [ ] Confirm Solapur fuel, Ujani, the rupee, silver, and the food series before treating those cards as live

The contract the app codes against is `docs/api-contract.md`.
