import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api/models.dart';
import '../../core/l10n/generated/app_localizations.dart';
import '../../core/load_state.dart';
import '../../core/widgets/app_card.dart';
import '../../core/widgets/notices.dart';
import 'playbook_controller.dart';

class PlaybookScreen extends ConsumerWidget {
  const PlaybookScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    return PlaybookBody(
      title: l10n.navPlaybook,
      state: ref.watch(playbookProvider),
      onRetry: () => ref.read(playbookProvider.notifier).reload(),
    );
  }
}

class PlaybookBody extends StatelessWidget {
  const PlaybookBody({
    required this.title,
    required this.state,
    required this.onRetry,
    super.key,
  });

  final String title;
  final LoadState<PlaybookResponse> state;
  final Future<void> Function() onRetry;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final data = state.data;
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: SafeArea(
        top: false,
        bottom: false,
        child: ScreenWidth(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
            children: [
              if (state.failure != null) ...[
                NoticeBanner(
                  message: failureMessage(
                    state.failure!,
                    l10n,
                    hasSaved: data != null,
                  ),
                ),
                const SizedBox(height: 12),
              ],
              if ((data == null || data.isEmpty) && state.loading)
                const LoadingNotice()
              else if (data == null || data.isEmpty)
                EmptyNotice(
                  title: l10n.navPlaybook,
                  body: l10n.playbookEmpty,
                  onRetry: () => onRetry(),
                )
              else ...[
                if (data.worthBuffer.isNotEmpty)
                  _BulletList(
                    title: l10n.worthBuffer,
                    items: data.worthBuffer,
                  ),
                if (data.notWorthIt.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  _BulletList(
                    title: l10n.notWorthIt,
                    items: data.notWorthIt,
                  ),
                ],
                for (final card in data.cards) ...[
                  const SizedBox(height: 16),
                  _CrisisCard(card: card),
                ],
                if (data.disclaimer != null && data.disclaimer!.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  Text(
                    data.disclaimer!,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _BulletList extends StatelessWidget {
  const _BulletList({required this.title, required this.items});

  final String title;
  final List<String> items;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          for (final item in items)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Padding(
                    padding: EdgeInsets.only(top: 8),
                    child: Icon(Icons.circle, size: 6),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(item, style: Theme.of(context).textTheme.bodyLarge),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _CrisisCard extends StatelessWidget {
  const _CrisisCard({required this.card});

  final PlaybookCard card;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final heading = card.title.isNotEmpty ? card.title : card.topic;
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(heading, style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          for (var i = 0; i < card.steps.length; i++)
            Semantics(
              label: l10n.stepSemantics(i + 1, card.steps.length),
              child: Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(
                      width: 24,
                      child: Text(
                        '${i + 1}',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                    ),
                    Expanded(
                      child: Text(
                        card.steps[i],
                        style: Theme.of(context).textTheme.bodyLarge,
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
