import 'package:flutter/material.dart';

import '../api/api_exception.dart';
import '../l10n/generated/app_localizations.dart';
import '../theme/app_colors.dart';

String failureMessage(
  ApiFailure failure,
  AppLocalizations l10n, {
  required bool hasSaved,
}) {
  switch (failure) {
    case ApiFailure.offline:
    case ApiFailure.badResponse:
    case ApiFailure.unknown:
      return hasSaved ? l10n.errorOffline : l10n.errorNoData;
    case ApiFailure.unauthorized:
      return l10n.errorUnauthorized;
    case ApiFailure.coolingDown:
      return l10n.refreshCoolingDown;
    case ApiFailure.notConfigured:
      return l10n.errorNotConfigured;
  }
}

class NoticeBanner extends StatelessWidget {
  const NoticeBanner({required this.message, super.key});

  final String message;

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: dark ? AppColors.darkPaper : AppColors.paper,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: dark ? AppColors.darkLine : AppColors.line),
      ),
      child: Text(message, style: Theme.of(context).textTheme.bodyMedium),
    );
  }
}

class EmptyNotice extends StatelessWidget {
  const EmptyNotice({
    required this.title,
    required this.body,
    this.onRetry,
    super.key,
  });

  final String title;
  final String body;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 28),
      child: Column(
        children: [
          Text(title, style: Theme.of(context).textTheme.titleMedium, textAlign: TextAlign.center),
          const SizedBox(height: 8),
          Text(body, style: Theme.of(context).textTheme.bodyMedium, textAlign: TextAlign.center),
          if (onRetry != null) ...[
            const SizedBox(height: 16),
            Semantics(
              button: true,
              label: l10n.retry,
              child: FilledButton(
                onPressed: onRetry,
                child: Text(l10n.retry),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class LoadingNotice extends StatelessWidget {
  const LoadingNotice({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 32),
      child: Column(
        children: [
          const CircularProgressIndicator(),
          const SizedBox(height: 12),
          Text(l10n.loading, style: Theme.of(context).textTheme.bodyMedium),
        ],
      ),
    );
  }
}
