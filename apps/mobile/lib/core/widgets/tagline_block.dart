import 'package:flutter/material.dart';

import '../l10n/generated/app_localizations.dart';
import '../theme/app_colors.dart';

class TaglineBlock extends StatelessWidget {
  const TaglineBlock({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final marathi = Localizations.localeOf(context).languageCode == 'mr';
    final color = Theme.of(context).colorScheme.onSurface;
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 36,
          height: 2,
          color: AppColors.accent,
        ),
        const SizedBox(height: 12),
        Text(
          l10n.tagline,
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: color),
        ),
        if (marathi) ...[
          const SizedBox(height: 6),
          Text(
            l10n.marathiLine,
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: color),
          ),
        ],
      ],
    );
  }
}
