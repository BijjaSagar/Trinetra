# Trinetra API contract

This is the canonical contract the API implements and the mobile app codes against.

Base URL is the Railway API service. Every request, including `GET /health`, requires header `X-API-Key` equal to env `API_KEY`. Requests are rate limited by IP. Every body and query is validated with zod. Timestamps are ISO 8601 UTC. `digestDate` is a `YYYY-MM-DD` calendar date in `Asia/Kolkata`.

Tagline, everywhere it appears: `Be ready before the storm.`

Signal levels: `normal` | `watch` | `stock_up`. The API never returns buy or sell orders.

## POST /devices

Body:

```json
{ "apnsToken": "string", "environment": "sandbox", "language": "en" }
```

`environment` is `sandbox` or `production`. `language` is `en` or `mr`.

Upsert by `apns_token`. Set `last_seen_at` to now.

Response 200:

```json
{ "id": "string", "lastSeenAt": "string" }
```

## GET /digest/latest

Query `lang=en|mr`. Default `en`. If `lang` is omitted, `Accept-Language` is used (`mr` when the first matching tag is Marathi).

Response 200:

```json
{
  "digest": {
    "digestDate": "YYYY-MM-DD",
    "headline": "string",
    "summary": "string",
    "language": "en",
    "pushSentAt": "string or null",
    "stale": false
  },
  "signals": [
    {
      "indicatorKey": "string",
      "level": "normal",
      "reasonCode": "string",
      "value": 0,
      "unit": "string",
      "change7dPct": 0,
      "asOf": "string",
      "sourceUrl": "string",
      "stale": false,
      "details": {}
    }
  ],
  "tagline": "Be ready before the storm."
}
```

`digest` is `null` when no digest has been saved. `value`, `unit`, `change7dPct`, `asOf`, `sourceUrl`, and `details` are `null` when unknown. `level` is only `normal`, `watch`, or `stock_up`.

`digest.stale` is true when `digestDate` is not today in `Asia/Kolkata`, or when any returned signal is stale.

## GET /signals/history

Query `days` (default 30, integer 1 through 365) and `lang=en|mr`.

Response 200:

```json
{
  "days": 30,
  "series": [
    {
      "indicatorKey": "string",
      "points": [
        {
          "asOf": "string",
          "value": 0,
          "unit": "string",
          "level": "normal"
        }
      ]
    }
  ]
}
```

`level` is `normal`, `watch`, `stock_up`, or `null` when that point has no signal.

## POST /refresh

No body. Re-runs fetchers and rules only when the newest reading is older than 6 hours (or when there are no readings). Does not send pushes. Rate limited more tightly than other routes.

Response 200: the same shape as `GET /digest/latest`.

## GET /health

Response 200:

```json
{
  "ok": true,
  "sources": [
    {
      "key": "string",
      "lastSuccessAt": "string or null",
      "lastError": "string or null",
      "stale": true
    }
  ]
}
```

`ok` is true only when every source is fresh. It is false when any source has never succeeded or is past its freshness window. The HTTP status stays 200. A rate limit response is HTTP 429 `{ "error": "request_failed" }`.

## GET /playbooks

Query `lang=en|mr`, with the same `Accept-Language` fallback as the digest.

Response 200:

```json
{
  "language": "en",
  "worthBuffer": ["string"],
  "notWorthIt": ["string"],
  "disclaimer": "Trinetra shares information and signals, not investment advice.",
  "cards": [
    {
      "topic": "fuel_hike",
      "title": "string",
      "steps": ["string"]
    }
  ]
}
```

`topic` is `fuel_hike`, `food_spike`, `water_cut`, or `gold_volatility`. The disclaimer string is always the English sentence above. Lists and cards are in the requested language.

## Errors

- Missing or wrong `X-API-Key`: 401 `{ "error": "unauthorized" }`
- Zod failure: 400 `{ "error": "invalid_request", "details": {} }`
- Unexpected failure: 500 `{ "error": "internal_error" }`
- Rate limit: 429 `{ "error": "request_failed" }`

## Push payload (APNs, not HTTP)

Alert notification. Headers: `apns-topic` = `in.rhtechnology.trinetra`, `apns-push-type: alert`, `apns-priority: 10`. Body includes `aps.alert.title`, `aps.alert.body`, `aps.sound: "default"`, custom key `digest_date`, and `kind` (`digest`, `stock_up`, or `stale`). Push body is at most 120 characters.
