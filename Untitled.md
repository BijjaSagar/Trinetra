# Trinetra: Project Development Guide

Oct 12, 2026 · @Sagar Bijja

Trinetra is an iPhone app (Flutter) with a Railway backend that checks fuel, rupee, edible oil, gold, silver and Solapur water data every morning, sends an Apple push at 7:30 AM IST, and shows a full report with pull-to-refresh.

## What the app does

Every morning the app answers one question: stock up, hold, or wait? It gives signals with reasons, never orders.

| Feature | What you get |
| --- | --- |
| Daily push | One digest at 7:30 AM IST covering fuel, rupee, cooking oil, gold, silver and Solapur water |
| Current report | Open the app, pull down to refresh, see today's numbers, the change since last week and the reason |
| Signals | Every item is marked Normal, Watch or Stock up |
| Buy / avoid list | Household items worth a 2 to 4 week buffer, and what to skip (panic buying, storing petrol) |
| Crisis playbook | Short action steps for a fuel hike, a food price spike or a water cut |
| Gold and silver view | Direction, the drivers (rupee, global price, import duty) and a staged-buying note |
| Language | English and Marathi |

## Architecture and stack

One Railway service runs the API and the daily job, Postgres stores everything, and the iPhone app talks to both Apple (push) and your API (data).

| Layer | Technology | Job |
| --- | --- | --- |
| Mobile app | Flutter, iOS first | Screens, pull-to-refresh, offline cache of the last digest |
| API and scheduler | Node.js + TypeScript (Fastify) on Railway | Endpoints, daily job, push sending |
| Database | Postgres on Railway + Drizzle ORM | Readings, signals, digests, device tokens |
| Push | Apple APNs directly (token auth with a .p8 key) | Delivers the notification to the iPhone |
| Summary writer | Claude API | Turns rule output into plain English and Marathi, using only the numbers it is given |
| Vercel | Optional admin page | Data-health view; not needed for version 1 |

Daily flow:

1. Railway cron starts the job at 02:00 UTC, which is 7:30 AM IST.
2. The job fetches every source. A failed source keeps its last good value and is flagged as stale.
3. The rule engine computes a signal level for each indicator.
4. Claude writes the digest from those signals; a check rejects any number not in the input.
5. The digest is saved, then APNs sends one push to every registered device.
6. When you open the app, it calls GET /digest/latest; pull-to-refresh calls POST /refresh if the data is older than 6 hours.

Direct APNs works only for iPhone. If you add Android later, that part will need Firebase Cloud Messaging.

## Data sources

Use free or public sources only, and build each one as a separate adapter so one broken source never stops the digest. Check every source's terms before relying on it; none of these has been tested yet, and scraped pages change without notice.

| Indicator | Likely source | Refresh | Notes |
| --- | --- | --- | --- |
| Petrol, diesel retail price | PPAC or the oil companies' published city prices | Daily | Likely a scraped page; keep a fallback source |
| Crude oil (Brent, Indian basket) | US EIA free API (Brent), PPAC (Indian basket) | Daily | EIA needs a free API key |
| USD/INR | RBI reference rate or a free forex API | Daily | Store the 30-day change |
| Edible oil | FAO Vegetable Oil Price Index, SEA import data | Monthly | Plus news on import duty changes |
| Food prices (pulses, wheat, onion, tomato) | Department of Consumer Affairs price monitoring | Daily | Check what is published for Solapur or Maharashtra |
| Gold and silver (INR) | IBJA rates or a metals price API | Daily | Also store the global USD price to explain moves |
| Ujani dam level | Maharashtra Water Resources Department daily storage report | Daily | The most useful Solapur water signal |
| National reservoirs | Central Water Commission weekly bulletin | Weekly | PDF; extract the headline percentage |
| Policy news | Google News RSS for "India import duty", "Solapur water supply", "petrol price hike" | Daily | Claude summarises headlines only |

Store the source URL and fetch time with every reading so the app can show "as of" and a link, which keeps every number traceable.

## Signal engine

Plain code decides the signal; Claude only explains it. The thresholds below are starting values to tune after a few weeks of real data.

| Indicator | Trigger | Signal | What the app tells you |
| --- | --- | --- | --- |
| Crude oil | Up more than 5% in 7 days | Watch | Retail fuel prices are frozen while import costs rise, so a hike is more likely; keep your tank reasonably full |
| Crude oil | Up more than 10% in 7 days, or a hike is announced | Stock up | Expect transport costs, and then grocery prices, to rise over 1 to 3 weeks; top up non-perishables |
| Petrol or diesel price | Any change | Stock up | Same as above, with the new price shown |
| USD/INR | Rupee weaker by more than 2% in 30 days | Watch | Imported items (cooking oil, electronics, gold) get costlier |
| Edible oil | FAO index up more than 3% in a month and no duty cut | Stock up | Buy a 4 week supply of cooking oil, not more |
| Edible oil | Duty cut or index falling | Normal | Do not stock; prices are easing |
| Ujani dam | Below 40% of live storage in October | Watch | Store drinking water; check municipal supply days |
| Ujani dam | Below 25%, or a supply cut announced | Stock up | Fill storage containers, plan for tanker days |
| Gold or silver (INR) | Up more than 3% in 7 days | Watch | Prices are rising; avoid emotional buying and consider staged purchases |

Gold and silver need extra care. India imports most of its gold, so the rupee price depends on the global dollar price, USD/INR, and import duty and GST. Show those three drivers next to each signal and explain which one moved. The app never says buy or sell; it says what changed and why, and suggests staging any purchase over several weeks.

Household guidance the app can show:

- Worth a 2 to 4 week buffer: cooking oil, pulses, rice or flour, salt and sugar, essential medicines, drinking water storage.
- Not worth it: bulk buying perishables, or storing petrol at home, which is a fire hazard and has legal limits. Fill the vehicle tank instead.
- Crisis playbook cards: fuel hike, food price spike, water cut, each with 4 to 6 action steps written once and reviewed by you.

Guard against false alarms: send a push only for the daily digest, plus at most one extra push per day when a Stock up signal first appears.

## Database and API

Five tables and five endpoints are enough for version 1.

| Table | Main columns |
| --- | --- |
| devices | id, apns\_token, environment (sandbox or production), language, created\_at, last\_seen\_at |
| readings | id, indicator\_key, value, unit, as\_of, source\_url, fetched\_at |
| signals | id, indicator\_key, level (normal, watch, stock\_up), reason\_code, as\_of |
| digests | id, date, summary\_en, summary\_mr, signals\_json, push\_sent\_at |
| playbooks | id, topic, title, steps\_en, steps\_mr |

| Endpoint | Purpose |
| --- | --- |
| POST /devices | App registers or updates its APNs token and language |
| GET /digest/latest | Today's digest and all current signals |
| GET /signals/history?days=30 | Trend data for the report screen |
| POST /refresh | Re-runs the fetchers if data is older than 6 hours; rate limited |
| GET /health | Shows which sources are fresh or stale |

Secure the API with a long random key stored in the app's build config, and rate limit by IP. Because the data is not personal, this is enough for a private app. Device tokens that Apple rejects (status 410 or BadDeviceToken) are deleted automatically.

## Direct Apple push (APNs) setup

You need no third-party push service: your backend talks to Apple over HTTP/2 using a key from your Apple Developer account.

1. In the Apple Developer portal, create an App ID for your bundle identifier and enable the Push Notifications capability.
2. Under Keys, create an APNs key and download the .p8 file once; Apple will not show it again. Note the Key ID and your Team ID.
3. Store four values in Railway variables: APNS\_KEY\_P8 (the file contents, base64), APNS\_KEY\_ID, APNS\_TEAM\_ID and APNS\_BUNDLE\_ID.
4. In Xcode, open the Runner target, then Signing and Capabilities, and add Push Notifications and Background Modes with Remote notifications ticked.
5. In the iOS code (AppDelegate), call registerForRemoteNotifications and pass the device token to Flutter through a method channel, or use a Flutter package that only wraps APNs (check that it is maintained before adopting it).
6. The app sends that token to POST /devices on every launch.
7. The backend signs a short-lived JWT (ES256) with the .p8 key and posts to Apple. Use the sandbox host (api.sandbox.push.apple.com) for debug builds and the production host (api.push.apple.com) for TestFlight and App Store builds. Reuse one JWT for up to 50 minutes; Apple rejects tokens older than an hour and also rejects ones refreshed too often.
8. Each request needs the headers apns-topic (your bundle ID), apns-push-type alert and apns-priority 10, with a JSON body holding the title, body and the digest date.
9. Use the apns2 Node package, or Node's built-in http2 module if you prefer no dependency.
10. Test on a real iPhone first with a manual command that pushes one test message to your own token.

Show the notification text from your digest summary (first line = most important signal), and keep it under about 120 characters so it does not get cut off.

## Flutter app

Four screens cover everything, and the app shows the last saved digest instantly while it refreshes in the background.

| Screen | What it shows |
| --- | --- |
| Home | Today's digest, one card per indicator with its signal colour, value, 7-day change and "as of" time; pull-to-refresh |
| Report | Charts of the last 30 days, the reason behind each signal and the source link |
| Playbook | Buy / avoid list and crisis action cards for the current signals |
| Settings | Language (English or Marathi), notification time note, alert toggles, data-health view |

Suggested packages (check each is current before use):

- State management: flutter\_riverpod
- HTTP: dio
- Local cache: drift or shared\_preferences for the last digest
- Charts: fl\_chart
- Local notifications for foreground display: flutter\_local\_notifications
- Localisation: flutter\_localizations with English and Marathi files

Folder layout:

```text
import-watch/
  apps/api/            Fastify + Drizzle, fetchers, rules, apns
    src/fetchers/      one file per source
    src/rules/         signal rules + tests
    src/digest/        Claude prompt + number check
    src/push/          APNs client
  apps/mobile/         Flutter project
    lib/core/          api client, cache, theme
    lib/features/home, report, playbook, settings
```

Design tip: use three signal colours (green Normal, amber Watch, red Stock up) and always pair them with a word, so the meaning does not depend on colour alone.

## Build plan

A realistic first version takes about four weeks of part-time work; each phase ends with something you can run.

| Phase | Timing | Work | Done when |
| --- | --- | --- | --- |
| 0. Setup | Days 1 to 2 | Repo, Railway project with Postgres, App ID and APNs key, EIA and Claude API keys | A test message reaches your iPhone from a script |
| 1. Data | Week 1 | Drizzle schema, fetchers for fuel, crude, USD/INR and Ujani dam, GET /health | Real readings are stored daily |
| 2. Signals | Week 2 | Rule engine with tests, remaining fetchers (gold, silver, edible oil, news), Claude digest with number check | A digest is generated from live data and logged, not yet sent |
| 3. App | Weeks 2 to 3 | Four Flutter screens, caching, pull-to-refresh, English and Marathi | The app shows live data on your iPhone |
| 4. Push | Week 3 | Token registration, APNs sender, Railway cron at 02:00 UTC | You get the 7:30 AM IST push for three days in a row |
| 5. Launch | Week 4 | TestFlight build, threshold tuning, stale-data alerts to yourself | Two weeks of daily use with no missed digest |

Testing rules:

- Write unit tests for every signal rule using saved sample data, including the edge cases at each threshold.
- Add a dry-run mode that prints the digest instead of sending it, and use it for the first week.
- If every source fails, or the digest cannot be built, send yourself a push saying data is stale instead of staying silent.
- Distribute through TestFlight to your own devices first; this avoids a full App Store review while you tune the rules.

## Risks, costs and legal notes

The main risks are fragile data sources and advice that sounds more certain than it is. Running costs stay small because you already pay for Railway and the Apple account.

| Risk | What to do |
| --- | --- |
| A scraped source changes its page | One adapter per source, a health page, and the last good value kept with a stale flag |
| Claude states a number that is not in the data | Pass only structured numbers, require JSON output, and reject any digest containing a figure not in the input |
| Too many alerts, so you ignore them | One daily push, plus at most one extra for a new Stock up signal |
| Panic buying that raises local prices | Keep advice to a 2 to 4 week buffer and say so on the card |
| Wrong thresholds | Start in dry-run mode and adjust after two to four weeks of data |

Costs: Apple Developer account (you already have it), Railway usage for one small service and Postgres (a few dollars a month at this scale), Claude API for one summary a day (very small), Vercel only if you add an admin page. Check current Railway pricing before you rely on this.

Legal and store notes:

- Gold, silver and food signals are decision support, not investment advice. Show a short disclaimer on every report screen.
- Giving personalised investment advice to other people for a fee needs SEBI registration in India. For personal use or a free private app with general information this is not an issue, but take proper advice before you open it to the public or charge for it.
- If you ever submit to the App Store, expect questions about financial content; keep the wording as information, with source links.
