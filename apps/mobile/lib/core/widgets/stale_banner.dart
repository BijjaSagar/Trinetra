import 'package:flutter/material.dart';

import '../l10n/generated/app_localizations.dart';
import '../theme/app_colors.dart';

class StaleBanner extends StatelessWidget {
  const StaleBanner({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final dark = Theme.of(context).brightness == Brightness.dark;
    return Semantics(
      liveRegion: true,
      child: Container(
        key: const Key('stale-banner'),
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: dark ? AppColors.watchTintDark : AppColors.watchTint,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.watch),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(
              Icons.schedule,
              color: dark ? AppColors.watchTextDark : AppColors.watchText,
              size: 20,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                l10n.staleBanner,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: dark ? AppColors.watchTextDark : AppColors.watchText,
                    ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
