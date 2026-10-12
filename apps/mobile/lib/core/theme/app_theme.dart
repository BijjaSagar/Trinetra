import 'package:flutter/material.dart';

import 'app_colors.dart';

abstract final class AppTheme {
  static const _sans = 'SourceSans3';
  static const _fallback = ['NotoSansDevanagari'];

  static ThemeData light() {
    final scheme = ColorScheme.fromSeed(
      seedColor: AppColors.primary,
      brightness: Brightness.light,
    ).copyWith(
      primary: AppColors.primary,
      onPrimary: AppColors.lightBg,
      secondary: AppColors.accent,
      onSecondary: AppColors.primary,
      surface: AppColors.lightBg,
      onSurface: AppColors.ink,
      error: AppColors.stockUp,
      onError: Colors.white,
    );
    return _base(scheme, AppColors.inkMuted);
  }

  static ThemeData dark() {
    final scheme = ColorScheme.fromSeed(
      seedColor: AppColors.primary,
      brightness: Brightness.dark,
    ).copyWith(
      primary: AppColors.accent,
      onPrimary: AppColors.primary,
      secondary: AppColors.accent,
      onSecondary: AppColors.primary,
      surface: AppColors.darkBg,
      onSurface: AppColors.darkInk,
      error: AppColors.stockUpTextDark,
      onError: AppColors.darkBg,
    );
    return _base(scheme, AppColors.darkMuted);
  }

  static ThemeData _base(ColorScheme scheme, Color muted) {
    final text = TextTheme(
      headlineMedium: TextStyle(
        fontFamily: _sans,
        fontFamilyFallback: _fallback,
        fontSize: 28,
        height: 1.25,
        fontWeight: FontWeight.w600,
        color: scheme.onSurface,
      ),
      titleLarge: TextStyle(
        fontFamily: _sans,
        fontFamilyFallback: _fallback,
        fontSize: 22,
        height: 1.3,
        fontWeight: FontWeight.w600,
        color: scheme.onSurface,
      ),
      titleMedium: TextStyle(
        fontFamily: _sans,
        fontFamilyFallback: _fallback,
        fontSize: 17,
        height: 1.35,
        fontWeight: FontWeight.w600,
        color: scheme.onSurface,
      ),
      bodyLarge: TextStyle(
        fontFamily: _sans,
        fontFamilyFallback: _fallback,
        fontSize: 17,
        height: 1.45,
        fontWeight: FontWeight.w400,
        color: scheme.onSurface,
      ),
      bodyMedium: TextStyle(
        fontFamily: _sans,
        fontFamilyFallback: _fallback,
        fontSize: 15,
        height: 1.45,
        fontWeight: FontWeight.w400,
        color: scheme.onSurface,
      ),
      labelLarge: TextStyle(
        fontFamily: _sans,
        fontFamilyFallback: _fallback,
        fontSize: 15,
        height: 1.2,
        fontWeight: FontWeight.w600,
        color: scheme.onSurface,
      ),
      bodySmall: TextStyle(
        fontFamily: _sans,
        fontFamilyFallback: _fallback,
        fontSize: 13,
        height: 1.4,
        fontWeight: FontWeight.w400,
        color: muted,
      ),
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      scaffoldBackgroundColor: scheme.surface,
      fontFamily: _sans,
      fontFamilyFallback: _fallback,
      textTheme: text,
      appBarTheme: AppBarTheme(
        backgroundColor: scheme.surface,
        foregroundColor: scheme.onSurface,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: text.titleLarge,
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: scheme.surface,
        indicatorColor: AppColors.accent.withValues(alpha: 0.45),
        labelTextStyle: WidgetStatePropertyAll(text.bodySmall?.copyWith(
          color: scheme.onSurface,
          fontWeight: FontWeight.w600,
        )),
        height: 68,
      ),
      dividerColor: scheme.brightness == Brightness.dark
          ? AppColors.darkLine
          : AppColors.line,
    );
  }
}
