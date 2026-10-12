import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:trinetra/core/widgets/disclaimer_banner.dart';
import 'package:trinetra/core/widgets/tagline_block.dart';
import 'package:trinetra/features/home/home_screen.dart';
import 'package:trinetra/features/splash/splash_screen.dart';

import 'fixtures.dart';
import 'test_app.dart';

void main() {
  const tagline = 'Be ready before the storm.';
  const marathiLine = 'संकटाआधी, तयारी.';

  testWidgets('tagline matches exactly in English', (tester) async {
    await tester.pumpWidget(testApp(const Scaffold(body: TaglineBlock())));
    await tester.pumpAndSettle();

    expect(find.text(tagline), findsOneWidget);
    expect(find.text(marathiLine), findsNothing);
  });

  testWidgets('Marathi line is hidden on the English splash and home', (tester) async {
    await tester.pumpWidget(testApp(const SplashScreen()));
    await tester.pumpAndSettle();
    expect(find.text(tagline), findsOneWidget);
    expect(find.text(marathiLine), findsNothing);

    await tester.pumpWidget(
      testApp(
        HomeBody(
          state: sampleHome(),
          onRefresh: () async {},
          onRetry: () async {},
        ),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.text(tagline), findsOneWidget);
    expect(find.text(marathiLine), findsNothing);
  });

  testWidgets('Marathi line sits under the tagline when language is Marathi', (tester) async {
    await tester.pumpWidget(
      testApp(
        const Scaffold(body: TaglineBlock()),
        locale: const Locale('mr'),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text(tagline), findsOneWidget);
    expect(find.text(marathiLine), findsOneWidget);
  });

  testWidgets('report disclaimer is the exact sentence', (tester) async {
    await tester.pumpWidget(testApp(const Scaffold(body: DisclaimerBanner())));
    await tester.pumpAndSettle();
    expect(
      find.text('Trinetra shares information and signals, not investment advice.'),
      findsOneWidget,
    );
  });
}
