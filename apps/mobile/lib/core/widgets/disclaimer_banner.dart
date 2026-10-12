import 'package:flutter/material.dart';

import '../l10n/generated/app_localizations.dart';
import '../theme/app_colors.dart';

class DisclaimerBanner extends StatelessWidget {
  const DisclaimerBanner({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final dark = Theme.of(context).brightness == Brightness.dark;
    return Semantics(
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: dark ? AppColors.darkPaper : AppColors.paper,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: dark ? AppColors.darkLine : AppColors.line,
          ),
        ),
        child: Text(
          l10n.disclaimer,
          style: Theme.of(context).textTheme.bodyMedium,
        ),
      ),
    );
  }
}
