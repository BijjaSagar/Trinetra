import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/api/models.dart';
import '../../core/copy/copy.dart';
import '../../core/format/format.dart';
import '../../core/l10n/generated/app_localizations.dart';
import '../../core/load_state.dart';
import '../../core/theme/app_colors.dart';
import '../../core/widgets/app_card.dart';
import '../../core/widgets/disclaimer_banner.dart';
import '../../core/widgets/notices.dart';
import '../../core/widgets/signal_chip.dart';
import '../home/home_controller.dart';
import 'report_controller.dart';

class ReportScreen extends ConsumerWidget {
  const ReportScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ReportBody(
      history: ref.watch(historyProvider),
      digest: ref.watch(homeProvider).data,
      onRetry: () => ref.read(historyProvider.notifier).reload(),
    );
  }
}

class ReportBody extends StatelessWidget {
  const ReportBody({
    required this.history,
    required this.digest,
    required this.onRetry,
    super.key,
  });

  final LoadState<HistoryResponse> history;
  final DigestResponse? digest;
  final Future<void> Function() onRetry;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final rows = _rows(history.data, digest);
    return Scaffold(
      appBar: AppBar(title: Text(l10n.reportTitle)),
      body: SafeArea(
        top: false,
        bottom: false,
        child: ScreenWidth(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
            children: [
              const DisclaimerBanner(),
              const SizedBox(height: 16),
              if (history.failure != null) ...[
                NoticeBanner(
                  message: failureMessage(
                    history.failure!,
                    l10n,
                    hasSaved: history.data != null,
                  ),
                ),
                const SizedBox(height: 12),
              ],
              if (rows.isEmpty && history.loading)
                const LoadingNotice()
              else if (rows.isEmpty)
                EmptyNotice(
                  title: l10n.reportTitle,
                  body: l10n.reportEmpty,
                  onRetry: () => onRetry(),
                )
              else
                for (final row in rows) ...[
                  _ReportCard(row: row),
                  const SizedBox(height: 12),
                ],
            ],
          ),
        ),
      ),
    );
  }

  List<_ReportRow> _rows(HistoryResponse? history, DigestResponse? digest) {
    final byKey = <String, _ReportRow>{};
    for (final series in history?.series ?? const <HistorySeries>[]) {
      if (series.indicatorKey.isEmpty) continue;
      byKey[series.indicatorKey] = _ReportRow(keyName: series.indicatorKey, series: series);
    }
    for (final signal in digest?.signals ?? const <Signal>[]) {
      if (signal.indicatorKey.isEmpty) continue;
      final existing = byKey[signal.indicatorKey];
      byKey[signal.indicatorKey] = _ReportRow(
        keyName: signal.indicatorKey,
        series: existing?.series,
        signal: signal,
      );
    }
    return sortByIndicator(byKey.values.toList(), (row) => row.keyName);
  }
}

class _ReportRow {
  const _ReportRow({required this.keyName, this.series, this.signal});

  final String keyName;
  final HistorySeries? series;
  final Signal? signal;
}

class _ReportCard extends StatelessWidget {
  const _ReportCard({required this.row});

  final _ReportRow row;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final name = indicatorLabel(row.keyName, l10n);
    final signal = row.signal;
    final level = signal?.level ?? row.series?.points.lastOrNull?.level ?? SignalLevel.unknown;
    final label = signal == null
        ? signalLabelForLevel(level, l10n)
        : signalLabel(signal, l10n);
    final latest = _latestValue(row);
    return AppCard(
      accent: signalMarkColor(level),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(name, style: Theme.of(context).textTheme.titleMedium),
              ),
              SignalChip(
                level: level,
                rawLevel: signal?.rawLevel ?? row.series?.points.lastOrNull?.rawLevel,
              ),
            ],
          ),
          const SizedBox(height: 12),
          _TrendChart(
            points: row.series?.points ?? const [],
            color: signalMarkColor(level),
            semanticsLabel: l10n.chartSemantics(
              name,
              latest.isEmpty ? l10n.noValue : latest,
              label,
            ),
          ),
          if (signal != null) ...[
            const SizedBox(height: 12),
            Text(l10n.reasonTitle, style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 4),
            Text(reasonText(signal, l10n), style: Theme.of(context).textTheme.bodyMedium),
            ..._detailLines(context, signal),
            if (signal.sourceUrl != null) ...[
              const SizedBox(height: 8),
              Semantics(
                link: true,
                label: l10n.sourceSemantics(name),
                child: TextButton(
                  onPressed: () => _open(signal.sourceUrl!),
                  child: Text(l10n.sourceLink),
                ),
              ),
            ],
          ],
        ],
      ),
    );
  }

  String _latestValue(_ReportRow row) {
    final signal = row.signal;
    if (signal?.value != null) return formatValue(signal!.value, signal.unit);
    final points = row.series?.points ?? const <HistoryPoint>[];
    for (final point in points.reversed) {
      if (point.value != null) return formatValue(point.value, point.unit);
    }
    return '';
  }

  List<Widget> _detailLines(BuildContext context, Signal signal) {
    final rows = detailRows(signal.details);
    if (rows.isEmpty) return const [];
    final l10n = AppLocalizations.of(context);
    return [
      const SizedBox(height: 10),
      Text(l10n.whatMoved, style: Theme.of(context).textTheme.bodySmall),
      const SizedBox(height: 4),
      for (final row in rows)
        Text(
          '${row.key}: ${row.value}',
          style: Theme.of(context).textTheme.bodyMedium,
        ),
    ];
  }

  Future<void> _open(String url) async {
    final uri = Uri.tryParse(url);
    if (uri == null || (uri.scheme != 'https' && uri.scheme != 'http')) return;
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }
}

class _TrendChart extends StatelessWidget {
  const _TrendChart({
    required this.points,
    required this.color,
    required this.semanticsLabel,
  });

  final List<HistoryPoint> points;
  final Color color;
  final String semanticsLabel;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final spots = <FlSpot>[];
    for (var i = 0; i < points.length; i++) {
      final value = points[i].value;
      if (value == null) continue;
      spots.add(FlSpot(i.toDouble(), value));
    }
    if (spots.length < 2) {
      return Semantics(
        label: semanticsLabel,
        child: Text(l10n.chartTooShort, style: Theme.of(context).textTheme.bodyMedium),
      );
    }
    final ys = [for (final spot in spots) spot.y];
    final minY = ys.reduce((a, b) => a < b ? a : b);
    final maxY = ys.reduce((a, b) => a > b ? a : b);
    final pad = (maxY - minY).abs() < 0.01 ? 1.0 : (maxY - minY) * 0.15;
    final dark = Theme.of(context).brightness == Brightness.dark;
    return Semantics(
      label: semanticsLabel,
      child: SizedBox(
        height: 160,
        child: LineChart(
          LineChartData(
            minY: minY - pad,
            maxY: maxY + pad,
            gridData: FlGridData(
              show: true,
              drawVerticalLine: false,
              getDrawingHorizontalLine: (_) => FlLine(
                color: dark ? AppColors.darkLine : AppColors.line,
                strokeWidth: 1,
              ),
            ),
            titlesData: const FlTitlesData(show: false),
            borderData: FlBorderData(show: false),
            lineTouchData: const LineTouchData(enabled: false),
            lineBarsData: [
              LineChartBarData(
                spots: spots,
                isCurved: false,
                color: color,
                barWidth: 2.5,
                dotData: const FlDotData(show: false),
                belowBarData: BarAreaData(show: false),
              ),
            ],
          ),
          duration: Duration.zero,
        ),
      ),
    );
  }
}
