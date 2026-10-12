import 'package:flutter/material.dart';

import '../../core/l10n/generated/app_localizations.dart';
import '../../core/widgets/tagline_block.dart';
import '../../core/widgets/trinetra_mark.dart';

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const TrinetraMark(),
                const SizedBox(height: 28),
                Text(
                  l10n.appName,
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        fontSize: 36,
                        letterSpacing: 0.4,
                      ),
                ),
                const SizedBox(height: 16),
                const TaglineBlock(),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
