import 'package:flutter/material.dart';

import '../theme/app_colors.dart';

class AppCard extends StatelessWidget {
  const AppCard({
    required this.child,
    this.accent,
    super.key,
  });

  final Widget child;
  final Color? accent;

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    return DecoratedBox(
      decoration: BoxDecoration(
        color: dark ? AppColors.darkPaper : AppColors.paper,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: dark ? AppColors.darkLine : AppColors.line),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (accent != null)
                ColoredBox(
                  color: accent!,
                  child: const SizedBox(width: 4),
                ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
                  child: child,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class ScreenWidth extends StatelessWidget {
  const ScreenWidth({required this.child, super.key});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.topCenter,
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 640),
        child: child,
      ),
    );
  }
}
