import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../l10n/generated/app_localizations.dart';
import '../theme/app_colors.dart';

class TrinetraMark extends StatelessWidget {
  const TrinetraMark({this.size = 128, super.key});

  final double size;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return Semantics(
      label: l10n.logoLabel,
      image: true,
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          color: AppColors.lightBg,
          shape: BoxShape.circle,
          border: Border.all(color: AppColors.accent, width: 2),
        ),
        padding: EdgeInsets.all(size * 0.18),
        child: SvgPicture.asset(
          'assets/logo.svg',
          excludeFromSemantics: true,
        ),
      ),
    );
  }
}
