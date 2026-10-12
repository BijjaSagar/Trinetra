import 'package:flutter_test/flutter_test.dart';
import 'package:trinetra/core/api/models.dart';

void main() {
  test('parses the digest contract', () {
    final parsed = DigestResponse.fromJson({
      'digest': {
        'digestDate': '2026-10-12',
        'headline': 'Quiet morning',
        'summary': 'No rush.',
        'language': 'en',
        'pushSentAt': null,
        'stale': false,
      },
      'signals': [
        {
          'indicatorKey': 'gold',
          'level': 'watch',
          'reasonCode': 'metal_up_3',
          'value': 7200,
          'unit': 'INR/g',
          'change7dPct': 3.4,
          'asOf': '2026-10-12T02:00:00Z',
          'sourceUrl': 'https://example.com/gold',
          'stale': true,
          'details': {'globalUsd': 1.2},
        },
      ],
      'tagline': 'Be ready before the storm.',
    });

    expect(parsed.tagline, 'Be ready before the storm.');
    expect(parsed.digest?.headline, 'Quiet morning');
    expect(parsed.signals.single.level, SignalLevel.watch);
    expect(parsed.signals.single.change7dPct, 3.4);
    expect(parsed.isStale, isTrue);
  });

  test('null digest is not a crash', () {
    final parsed = DigestResponse.fromJson({
      'digest': null,
      'signals': [],
      'tagline': 'Be ready before the storm.',
    });
    expect(parsed.digest, isNull);
    expect(parsed.isStale, isFalse);
  });
}
