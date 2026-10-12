import 'package:flutter/material.dart';

import '../api/models.dart';
import '../l10n/generated/app_localizations.dart';
import '../theme/app_colors.dart';
import '../copy/copy.dart';

class SignalChip extends StatelessWidget {
  const SignalChip({
    required this.level,
    this.rawLevel,
    super.key,
  });

  final SignalLevel level;
  final String? rawLevel;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final label = _label(l10n);
    final palette = _palette(Theme.of(context).brightness);
    return Semantics(
      label: l10n.signalSemantics(label),
      excludeSemantics: true,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: palette.tint,
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: palette.mark, width: 1),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                color: palette.mark,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: Theme.of(context).textTheme.labelLarge?.copyWith(
                    color: palette.text,
                    fontSize: 14,
                  ),
            ),
          ],
        ),
      ),
    );
  }

  String _label(AppLocalizations l10n) {
    switch (level) {
      case SignalLevel.normal:
        return l10n.signalNormal;
      case SignalLevel.watch:
        return l10n.signalWatch;
      case SignalLevel.stockUp:
        return l10n.signalStockUp;
      case SignalLevel.unknown:
        if (rawLevel != null && rawLevel!.trim().isNotEmpty) {
          return humanizeKey(rawLevel!.trim());
        }
        return l10n.signalUnknown;
    }
  }

  _ChipPalette _palette(Brightness brightness) {
    final dark = brightness == Brightness.dark;
    switch (level) {
      case SignalLevel.normal:
        return _ChipPalette(
          mark: AppColors.normal,
          tint: dark ? AppColors.normalTintDark : AppColors.normalTint,
          text: dark ? AppColors.normalTextDark : AppColors.normalText,
        );
      case SignalLevel.watch:
        return _ChipPalette(
          mark: AppColors.watch,
          tint: dark ? AppColors.watchTintDark : AppColors.watchTint,
          text: dark ? AppColors.watchTextDark : AppColors.watchText,
        );
      case SignalLevel.stockUp:
        return _ChipPalette(
          mark: AppColors.stockUp,
          tint: dark ? AppColors.stockUpTintDark : AppColors.stockUpTint,
          text: dark ? AppColors.stockUpTextDark : AppColors.stockUpText,
        );
      case SignalLevel.unknown:
        return _ChipPalette(
          mark: dark ? AppColors.darkMuted : AppColors.inkMuted,
          tint: dark ? AppColors.darkPaper : AppColors.paper,
          text: dark ? AppColors.darkInk : AppColors.ink,
        );
    }
  }
}

Color signalMarkColor(SignalLevel level) {
  switch (level) {
    case SignalLevel.normal:
      return AppColors.normal;
    case SignalLevel.watch:
      return AppColors.watch;
    case SignalLevel.stockUp:
      return AppColors.stockUp;
    case SignalLevel.unknown:
      return AppColors.inkMuted;
  }
}

class _ChipPalette {
  const _ChipPalette({
    required this.mark,
    required this.tint,
    required this.text,
  });

  final Color mark;
  final Color tint;
  final Color text;
}
