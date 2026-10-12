import 'package:flutter/material.dart';
import 'package:trinetra/core/l10n/generated/app_localizations.dart';
import 'package:trinetra/core/theme/app_theme.dart';

Widget testApp(Widget child, {Locale locale = const Locale('en')}) {
  return MaterialApp(
    locale: locale,
    theme: AppTheme.light(),
    localizationsDelegates: AppLocalizations.localizationsDelegates,
    supportedLocales: AppLocalizations.supportedLocales,
    home: child,
  );
}
