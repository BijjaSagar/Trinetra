import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:trinetra/features/home/home_screen.dart';

import 'fixtures.dart';
import 'test_app.dart';

void main() {
  Future<void> pumpHome(
    WidgetTester tester, {
    bool digestStale = false,
    bool signalStale = false,
  }) async {
    await tester.pumpWidget(
      testApp(
        HomeBody(
          state: sampleHome(
            digestStale: digestStale,
            signalStale: signalStale,
          ),
          onRefresh: () async {},
          onRetry: () async {},
        ),
      ),
    );
    await tester.pumpAndSettle();
  }

  testWidgets('stale banner appears when the digest is stale', (tester) async {
    await pumpHome(tester, digestStale: true);
    expect(find.byKey(const Key('stale-banner')), findsOneWidget);
    expect(find.textContaining('older than usual'), findsOneWidget);
  });

  testWidgets('stale banner appears when a signal is stale', (tester) async {
    await pumpHome(tester, signalStale: true);
    expect(find.byKey(const Key('stale-banner')), findsOneWidget);
    expect(find.text('Older figure'), findsOneWidget);
  });

  testWidgets('fresh digest has no stale banner', (tester) async {
    await pumpHome(tester);
    expect(find.byKey(const Key('stale-banner')), findsNothing);
  });
}
