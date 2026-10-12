import 'package:trinetra/core/api/models.dart';
import 'package:trinetra/core/load_state.dart';

DigestResponse sampleDigest({
  bool digestStale = false,
  bool signalStale = false,
}) {
  return DigestResponse(
    digest: Digest(
      digestDate: '2026-10-12',
      headline: 'Fuel is steady',
      summary: 'No rush today.',
      language: 'en',
      pushSentAt: null,
      stale: digestStale,
    ),
    signals: [
      Signal(
        indicatorKey: 'petrol',
        level: SignalLevel.watch,
        rawLevel: 'watch',
        reasonCode: 'fuel_watch',
        value: 105.2,
        unit: 'INR/L',
        change7dPct: 1.2,
        asOf: '2026-10-12T02:00:00Z',
        sourceUrl: 'https://example.com/petrol',
        stale: signalStale,
        details: const {'reason': 'Retail price moved.'},
      ),
    ],
    tagline: 'Be ready before the storm.',
  );
}

LoadState<DigestResponse> sampleHome({
  bool digestStale = false,
  bool signalStale = false,
}) {
  return LoadState(
    data: sampleDigest(digestStale: digestStale, signalStale: signalStale),
  );
}
