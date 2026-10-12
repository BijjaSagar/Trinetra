import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/copy/copy.dart';
import '../../core/format/format.dart';
import '../../core/l10n/generated/app_localizations.dart';
import '../../core/providers.dart';
import '../../core/theme/app_colors.dart';
import '../../core/widgets/app_card.dart';
import '../../core/widgets/notices.dart';
import '../../core/widgets/tagline_block.dart';
import 'settings_controller.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final locale = ref.watch(localeProvider);
    final alerts = ref.watch(alertProvider);
    final health = ref.watch(healthProvider);
    final version = ref.watch(versionProvider);
    final languageCode = locale.languageCode;

    return Scaffold(
      appBar: AppBar(title: Text(l10n.navSettings)),
      body: SafeArea(
        top: false,
        bottom: false,
        child: ScreenWidth(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
            children: [
              Text(l10n.language, style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: _LanguageButton(
                      label: l10n.languageEnglish,
                      selected: languageCode == 'en',
                      onPressed: () =>
                          ref.read(localeProvider.notifier).setLanguage('en'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _LanguageButton(
                      label: l10n.languageMarathi,
                      selected: languageCode == 'mr',
                      onPressed: () =>
                          ref.read(localeProvider.notifier).setLanguage('mr'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 22),
              Text(l10n.alerts, style: Theme.of(context).textTheme.titleMedium),
              SwitchListTile.adaptive(
                contentPadding: EdgeInsets.zero,
                title: Text(l10n.alertMorning),
                subtitle: Text(l10n.alertMorningHint),
                value: alerts.morningDigest,
                onChanged: (value) =>
                    ref.read(alertProvider.notifier).setMorning(value),
              ),
              SwitchListTile.adaptive(
                contentPadding: EdgeInsets.zero,
                title: Text(l10n.alertStockUp),
                subtitle: Text(l10n.alertStockUpHint),
                value: alerts.stockUp,
                onChanged: (value) =>
                    ref.read(alertProvider.notifier).setStockUp(value),
              ),
              Text(
                l10n.alertSystemNote,
                style: Theme.of(context).textTheme.bodySmall,
              ),
              const SizedBox(height: 22),
              Row(
                children: [
                  Expanded(
                    child: Text(
                      l10n.dataHealth,
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                  ),
                  IconButton(
                    tooltip: l10n.retry,
                    onPressed: () => ref.read(healthProvider.notifier).reload(),
                    icon: const Icon(Icons.refresh),
                  ),
                ],
              ),
              if (health.failure != null)
                NoticeBanner(
                  message: failureMessage(
                    health.failure!,
                    l10n,
                    hasSaved: false,
                  ),
                )
              else if (health.loading && health.data == null)
                const LoadingNotice()
              else if (health.data == null)
                Text(l10n.healthUnavailable)
              else ...[
                Text(
                  health.data!.ok ? l10n.healthOk : l10n.healthAttention,
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
                const SizedBox(height: 8),
                for (final source in health.data!.sources) ...[
                  AppCard(
                    accent: source.stale ? AppColors.watch : AppColors.normal,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                indicatorLabel(source.key, l10n),
                                style: Theme.of(context).textTheme.titleMedium,
                              ),
                            ),
                            Text(
                              source.stale ? l10n.sourceStale : l10n.sourceFresh,
                              style: Theme.of(context).textTheme.labelLarge,
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          source.lastSuccessAt == null
                              ? l10n.noLastSuccess
                              : l10n.lastSuccess(
                                  formatIst(source.lastSuccessAt, languageCode),
                                ),
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                        if (source.lastError != null) ...[
                          const SizedBox(height: 4),
                          Text(
                            '${l10n.lastError}: ${source.lastError}',
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),
                ],
              ],
              const SizedBox(height: 22),
              Text(l10n.about, style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              Text(
                l10n.versionLabel(
                  version.maybeWhen(data: (value) => value, orElse: () => '1.0.0'),
                ),
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 8),
              Text(l10n.aboutBody, style: Theme.of(context).textTheme.bodyLarge),
              const SizedBox(height: 16),
              const TaglineBlock(),
            ],
          ),
        ),
      ),
    );
  }
}

class _LanguageButton extends StatelessWidget {
  const _LanguageButton({
    required this.label,
    required this.selected,
    required this.onPressed,
  });

  final String label;
  final bool selected;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      selected: selected,
      label: label,
      child: OutlinedButton(
        onPressed: onPressed,
        style: OutlinedButton.styleFrom(
          minimumSize: const Size.fromHeight(48),
          backgroundColor: selected
              ? AppColors.accent.withValues(alpha: 0.35)
              : null,
          side: BorderSide(
            color: selected ? AppColors.accent : Theme.of(context).dividerColor,
            width: selected ? 2 : 1,
          ),
        ),
        child: Text(label),
      ),
    );
  }
}
