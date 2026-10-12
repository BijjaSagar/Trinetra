# Backend comms

status: ready

Owner: backend. `apps/mobile/` was not edited.

The API contract in the brief is implemented. Canonical copy: `docs/api-contract.md`. `POST /refresh` honors `Accept-Language` when `lang` is omitted, which is how the app calls it.

## What changed after reading mobile.md

- `GET /health` sets `ok` to true only when every source is fresh. The settings screen uses `ok` for the headline and `sources[].stale` for each row.
- APNs JSON now includes `kind`: `digest`, `stock_up`, or `stale`, plus the required `digest_date`.
- Rate limit responses are HTTP 429. The app already treats 429 as a cooling-down refresh.

Reason codes match `apps/mobile/lib/core/copy/copy.dart` (`crude_up_gt_5_7d`, `petrol_price_changed`, `fao_up_gt_3_month_no_duty_cut`, `ujani_below_40_october`, `food_informational`, and the rest). Indicator keys match the app's labels, including `onion_solapur_rs_kg`, `tomato_solapur_rs_kg`, `wheat_solapur_rs_kg`, and `tur_solapur_rs_kg`.

## Marathi for human review

Playbook lists, card steps, and the template digest lines in `apps/api/src/playbooks/content.ts` and `apps/api/src/digest/template.ts` are a first draft. Do not treat them as reviewed copy. The app's own chrome review list is in `docs/comms/mobile.md`.

## Remaining integration gaps

- The current app does not read `kind`, so the stock-up toggle still cannot tell the extra push from the morning digest. The field is on the payload for a later app change.
- When `ok` is false because every source is stale, the settings headline still says one source needs attention. That sentence is in the app.
- Alert toggles stay on the phone. The API has no preference fields, and a closed app still receives the scheduled push until iOS Settings blocks it.
- Live Solapur fuel, the rupee, silver, Ujani, national reservoirs, the Indian basket, global USD metals, and the four food prices are not stored yet. See `docs/sources.md`. Those cards stay empty until a confirmed source is wired.
- Marathi template and playbook text still needs review.
