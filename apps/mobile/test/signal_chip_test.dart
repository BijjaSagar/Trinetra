import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:trinetra/core/api/models.dart';
import 'package:trinetra/core/widgets/signal_chip.dart';

import 'test_app.dart';

void main() {
  testWidgets('signal chip always includes a text label', (tester) async {
    const cases = {
      SignalLevel.normal: 'Normal',
      SignalLevel.watch: 'Watch',
      SignalLevel.stockUp: 'Stock up',
    };

    for (final entry in cases.entries) {
      await tester.pumpWidget(
        testApp(Scaffold(body: SignalChip(level: entry.key))),
      );
      await tester.pumpAndSettle();

      expect(find.text(entry.value), findsOneWidget);
      expect(find.bySemanticsLabel('Signal: ${entry.value}'), findsOneWidget);
      final chip = tester.widget<SignalChip>(find.byType(SignalChip));
      expect(chip.level, entry.key);
    }
  });

  testWidgets('Marathi signal chip still has a word', (tester) async {
    await tester.pumpWidget(
      testApp(
        const Scaffold(body: SignalChip(level: SignalLevel.stockUp)),
        locale: const Locale('mr'),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('साठा करा'), findsOneWidget);
    expect(find.bySemanticsLabel('संकेत: साठा करा'), findsOneWidget);
  });
}
