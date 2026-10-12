import 'package:flutter_test/flutter_test.dart';
import 'package:trinetra/core/cache/app_cache.dart';
import 'package:trinetra/core/push/push_service.dart';

void main() {
  const bothOn = AlertSettings(morningDigest: true, stockUp: true);
  const morningOff = AlertSettings(morningDigest: false, stockUp: true);
  const stockOff = AlertSettings(morningDigest: true, stockUp: false);
  const bothOff = AlertSettings(morningDigest: false, stockUp: false);

  test('a stock_up push is suppressed only by the stock-up toggle', () {
    expect(allowsForegroundPush('stock_up', stockOff), isFalse);
    expect(allowsForegroundPush('stock_up', morningOff), isTrue);
    expect(allowsForegroundPush('stock_up', bothOn), isTrue);
    expect(allowsForegroundPush('stock_up', bothOff), isFalse);
  });

  test('a digest push is suppressed only by the morning toggle', () {
    expect(allowsForegroundPush('digest', morningOff), isFalse);
    expect(allowsForegroundPush('digest', stockOff), isTrue);
    expect(allowsForegroundPush('digest', bothOn), isTrue);
    expect(allowsForegroundPush('digest', bothOff), isFalse);
  });

  test('a stale push still shows, and a missing kind uses the morning toggle', () {
    expect(allowsForegroundPush('stale', bothOff), isTrue);
    expect(allowsForegroundPush('stale', morningOff), isTrue);
    expect(allowsForegroundPush(null, morningOff), isFalse);
    expect(allowsForegroundPush(null, stockOff), isTrue);
  });
}
