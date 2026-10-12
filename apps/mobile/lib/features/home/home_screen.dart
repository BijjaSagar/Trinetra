import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api/models.dart';
import '../../core/copy/copy.dart';
import '../../core/format/format.dart';
import '../../core/l10n/generated/app_localizations.dart';
import '../../core/load_state.dart';
import '../../core/widgets/app_card.dart';
import '../../core/widgets/notices.dart';
import '../../core/widgets/signal_chip.dart';
import '../../core/widgets/stale_banner.dart';
import '../../core/widgets/tagline_block.dart';
import 'home_controller.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(homeProvider);
    return HomeBody(
      state: state,
      onRefresh: () => ref.read(homeProvider.notifier).pullToRefresh(),
      onRetry: () => ref.read(homeProvider.notifier).reload(),
    );
  }
}

class HomeBody extends StatelessWidget {
  const HomeBody({
    required this.state,
    required this.onRefresh,
    required this.onRetry,
    super.key,
  });

  final LoadState<DigestResponse> state;
  final Future<void> Function() onRefresh;
  final Future<void> Function() onRetry;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final data = state.data;
    final locale = Localizations.localeOf(context).languageCode;
    final signals = sortByIndicator(
      data?.signals ?? const <Signal>[],
      (signal) => signal.indicatorKey,
    );

    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: RefreshIndicator(
          onRefresh: onRefresh,
          semanticsLabel: l10n.pullToRefresh,
          child: ScreenWidth(
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
              children: [
                Text(
                  formatDigestDate(data?.digest?.digestDate, locale),
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                const SizedBox(height: 8),
                if (data?.isStale ?? false) ...[
                  const StaleBanner(),
                  const SizedBox(height: 12),
                ],
                if (data != null && state.failure != null) ...[
                  NoticeBanner(
                    message: failureMessage(
                      state.failure!,
                      l10n,
                      hasSaved: true,
                    ),
                  ),
                  const SizedBox(height: 12),
                ],
                if (state.fromCache && state.loading) ...[
                  Text(
                    l10n.showingSaved,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  const SizedBox(height: 12),
                ],
                if (data == null && state.loading)
                  const LoadingNotice()
                else if (data == null)
                  EmptyNotice(
                    title: l10n.errorTitle,
                    body: state.failure == null
                        ? l10n.emptyBody
                        : failureMessage(
                            state.failure!,
                            l10n,
                            hasSaved: false,
                          ),
                    onRetry: () => onRetry(),
                  )
                else ...[
                  Text(
                    data.digest?.headline.isNotEmpty == true
                        ? data.digest!.headline
                        : l10n.emptyHeadline,
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                  if (data.digest?.summary.isNotEmpty == true) ...[
                    const SizedBox(height: 8),
                    Text(
                      data.digest!.summary,
                      style: Theme.of(context).textTheme.bodyLarge,
                    ),
                  ],
                  const SizedBox(height: 18),
                  if (signals.isEmpty)
                    EmptyNotice(
                      title: l10n.emptyHeadline,
                      body: l10n.emptyBody,
                      onRetry: () => onRetry(),
                    )
                  else
                    for (final signal in signals) ...[
                      _IndicatorCard(signal: signal),
                      const SizedBox(height: 12),
                    ],
                ],
                const SizedBox(height: 20),
                const TaglineBlock(),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _IndicatorCard extends StatelessWidget {
  const _IndicatorCard({required this.signal});

  final Signal signal;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final locale = Localizations.localeOf(context).languageCode;
    final name = indicatorLabel(signal.indicatorKey, l10n);
    final value = formatValue(signal.value, signal.unit);
    final change = formatChange(signal.change7dPct);
    final asOf = formatIst(signal.asOf, locale);

    return AppCard(
      accent: signalMarkColor(signal.level),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(name, style: Theme.of(context).textTheme.titleMedium),
              ),
              const SizedBox(width: 8),
              SignalChip(level: signal.level, rawLevel: signal.rawLevel),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            value.isEmpty ? l10n.noValue : value,
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontSize: 26),
          ),
          const SizedBox(height: 4),
          Text(
            change == null ? l10n.no7dChange : l10n.change7d(change),
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          if (asOf.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(
              l10n.asOf(asOf),
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
          if (signal.stale) ...[
            const SizedBox(height: 6),
            Text(
              l10n.staleFigure,
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ],
      ),
    );
  }
}
