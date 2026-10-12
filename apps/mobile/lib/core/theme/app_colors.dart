import 'package:flutter/material.dart';

/// Brand and signal colours. Text colours are darker or lighter than the
/// signal hue so a chip still meets contrast when the hue is only a cue.
abstract final class AppColors {
  static const primary = Color(0xFF1A1A4E);
  static const accent = Color(0xFFE8B04A);
  static const lightBg = Color(0xFFF7F5EF);
  static const darkBg = Color(0xFF0E0E1A);

  static const normal = Color(0xFF2E9E5B);
  static const watch = Color(0xFFE0A100);
  static const stockUp = Color(0xFFD64545);

  static const ink = Color(0xFF1A1A4E);
  static const inkMuted = Color(0xFF3E3E5C);
  static const paper = Color(0xFFFFFCF7);
  static const line = Color(0xFFE4DDD0);

  static const darkPaper = Color(0xFF171728);
  static const darkInk = Color(0xFFF7F5EF);
  static const darkMuted = Color(0xFFD5D0C4);
  static const darkLine = Color(0xFF2C2C44);

  static const normalText = Color(0xFF0E5C32);
  static const watchText = Color(0xFF5C4300);
  static const stockUpText = Color(0xFF8C1D1D);
  static const normalTint = Color(0xFFE7F6EE);
  static const watchTint = Color(0xFFFFF6DE);
  static const stockUpTint = Color(0xFFFDECEC);

  static const normalTextDark = Color(0xFFB7E7C8);
  static const watchTextDark = Color(0xFFFFE6A3);
  static const stockUpTextDark = Color(0xFFFFC9C9);
  static const normalTintDark = Color(0xFF123524);
  static const watchTintDark = Color(0xFF3A3008);
  static const stockUpTintDark = Color(0xFF3F1616);
}
