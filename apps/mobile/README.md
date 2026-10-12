# Trinetra iOS

Personal signals app. Bundle ID `in.rhtechnology.trinetra`.

## Run

```bash
cd apps/mobile
flutter run \
  --dart-define=API_BASE_URL=http://127.0.0.1:3000 \
  --dart-define=API_KEY=your-local-key
```

Debug builds talk to `http://127.0.0.1:3000` when `API_BASE_URL` is omitted, and register the APNs token as `sandbox`. Profile and release register as `production` and require `API_BASE_URL`. Override the push host with `--dart-define=APNS_ENVIRONMENT=sandbox` or `production` if a build needs the other environment.

Do not commit an API key.

## Checks

```bash
flutter analyze
flutter test
```
