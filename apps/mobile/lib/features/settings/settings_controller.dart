import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:package_info_plus/package_info_plus.dart';

import '../../core/api/api_exception.dart';
import '../../core/api/models.dart';
import '../../core/cache/app_cache.dart';
import '../../core/load_state.dart';
import '../../core/providers.dart';

class AlertController extends Notifier<AlertSettings> {
  @override
  AlertSettings build() => ref.read(appCacheProvider).readAlerts();

  Future<void> setMorning(bool value) async {
    final next = AlertSettings(morningDigest: value, stockUp: state.stockUp);
    await ref.read(appCacheProvider).writeAlerts(next);
    state = next;
  }

  Future<void> setStockUp(bool value) async {
    final next = AlertSettings(
      morningDigest: state.morningDigest,
      stockUp: value,
    );
    await ref.read(appCacheProvider).writeAlerts(next);
    state = next;
  }
}

final alertProvider = NotifierProvider<AlertController, AlertSettings>(
  AlertController.new,
);

class HealthController extends Notifier<LoadState<HealthResponse>> {
  int _ticket = 0;

  @override
  LoadState<HealthResponse> build() {
    final ticket = ++_ticket;
    Future<void>(() => reload(ticket: ticket));
    return const LoadState(loading: true);
  }

  Future<void> reload({int? ticket}) async {
    final current = ticket ?? ++_ticket;
    state = state.copyWith(loading: true, clearFailure: true);
    try {
      final fresh = await ref.read(apiClientProvider).health(
            ref.read(localeProvider).languageCode,
          );
      if (current != _ticket || !ref.mounted) return;
      state = LoadState(data: fresh);
    } on ApiException catch (error) {
      if (current != _ticket || !ref.mounted) return;
      state = state.copyWith(loading: false, failure: error.failure);
    }
  }
}

final healthProvider =
    NotifierProvider<HealthController, LoadState<HealthResponse>>(
  HealthController.new,
);

final versionProvider = FutureProvider<String>((ref) async {
  final info = await PackageInfo.fromPlatform();
  return info.version;
});
