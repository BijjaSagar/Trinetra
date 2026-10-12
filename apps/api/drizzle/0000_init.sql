CREATE TABLE IF NOT EXISTS schema_migrations (
  id text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  apns_token text NOT NULL UNIQUE,
  environment text NOT NULL CHECK (environment IN ('sandbox', 'production')),
  language text NOT NULL CHECK (language IN ('en', 'mr')),
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_key text NOT NULL,
  value double precision NOT NULL,
  unit text NOT NULL,
  as_of timestamptz NOT NULL,
  source_url text NOT NULL,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (indicator_key, as_of)
);

CREATE INDEX IF NOT EXISTS readings_key_as_of_idx ON readings (indicator_key, as_of DESC);

CREATE TABLE IF NOT EXISTS signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_key text NOT NULL,
  level text NOT NULL CHECK (level IN ('normal', 'watch', 'stock_up')),
  reason_code text NOT NULL,
  details_json jsonb,
  as_of timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS signals_key_as_of_idx ON signals (indicator_key, as_of DESC);

CREATE TABLE IF NOT EXISTS digests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  digest_date date NOT NULL UNIQUE,
  headline_en text NOT NULL,
  headline_mr text NOT NULL,
  summary_en text NOT NULL,
  summary_mr text NOT NULL,
  push_title_en text NOT NULL,
  push_title_mr text NOT NULL,
  push_body_en text NOT NULL,
  push_body_mr text NOT NULL,
  signals_json jsonb NOT NULL,
  push_sent_at timestamptz,
  stock_up_alert_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS playbooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL UNIQUE CHECK (topic IN ('fuel_hike', 'food_spike', 'water_cut', 'gold_volatility')),
  title_en text NOT NULL,
  title_mr text NOT NULL,
  steps_en jsonb NOT NULL,
  steps_mr jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS source_health (
  key text PRIMARY KEY,
  last_success_at timestamptz,
  last_error text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
